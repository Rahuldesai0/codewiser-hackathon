from __future__ import annotations

import re
from collections import defaultdict
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(title="Adaptive Quiz Intelligence Service")

COMPLEXITY_KEYWORDS = {
    "deadlock",
    "serializable",
    "normalization",
    "amortized",
    "belady",
    "recurrence",
    "concurrency",
    "index",
    "proof",
    "hash",
    "scheduling",
    "locking",
    "tree",
    "heap",
    "rollback",
}

DIFFICULTY_ORDER = {"easy": 0, "medium": 1, "hard": 2}
DIFFICULTY_WEIGHT = {"easy": 0.8, "medium": 1.0, "hard": 1.2}
ANSWER_DESCRIPTOR_TOKENS = {
    "algorithm",
    "approach",
    "form",
    "method",
    "notation",
    "technique",
    "time",
    "traversal",
}


class InitializePayload(BaseModel):
    username: str
    userId: int | None = None
    subjects: list[str]
    questionTarget: int = Field(ge=5, le=100)
    batchSize: int = Field(ge=5, le=10)
    questionPool: list[dict[str, Any]]


class EvaluatePayload(BaseModel):
    state: dict[str, Any]
    batchQuestions: list[dict[str, Any]]
    answers: list[dict[str, Any]]
    questionPool: list[dict[str, Any]]
    questionTarget: int = Field(ge=5, le=100)
    batchSize: int = Field(ge=5, le=10)


def normalize_text(text: str | None) -> str:
    value = (text or "").strip().lower()
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def compact_text(text: str | None) -> str:
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def normalized_tokens(text: str | None) -> list[str]:
    return normalize_text(text).split()


def strip_descriptor_tokens(tokens: list[str]) -> list[str]:
    return [token for token in tokens if token not in ANSWER_DESCRIPTOR_TOKENS]


def short_answer_matches(submitted_answer: str, accepted_answers: list[str]) -> bool:
    submitted_compact = compact_text(submitted_answer)
    if not submitted_compact:
        return False

    submitted_tokens = normalized_tokens(submitted_answer)
    stripped_submitted_tokens = strip_descriptor_tokens(submitted_tokens)

    for accepted_answer in accepted_answers:
        accepted_compact = compact_text(accepted_answer)
        if submitted_compact == accepted_compact:
            return True

        accepted_tokens = normalized_tokens(accepted_answer)
        if submitted_tokens == accepted_tokens:
            return True

        stripped_accepted_tokens = strip_descriptor_tokens(accepted_tokens)
        if (
            stripped_submitted_tokens
            and stripped_accepted_tokens
            and stripped_submitted_tokens == stripped_accepted_tokens
        ):
            return True

    return False


def subtopic_key(question: dict[str, Any]) -> str:
    return f"{question['subject']}::{question['subtopic']}"


def correct_answer_display(question: dict[str, Any]) -> str:
    if question["type"] == "mcq":
        option = next((entry for entry in question.get("options", []) if entry.get("isCorrect")), None)
        return option["text"] if option else "Correct option"
    accepted = question.get("acceptedAnswers", [])
    return accepted[0] if accepted else ""


def complexity_score(question: dict[str, Any]) -> float:
    prompt = question["prompt"]
    prompt_words = re.findall(r"\b\w+\b", prompt)
    numeric_complexity = len(re.findall(r"\d", prompt))
    keyword_hits = sum(1 for word in prompt_words if word.lower() in COMPLEXITY_KEYWORDS)
    answer_span = max((len(normalize_text(answer).split()) for answer in question.get("acceptedAnswers", []) if answer), default=1)
    option_penalty = max(len(question.get("options", [])) - 2, 0) * 0.3

    return (
        len(prompt_words) * 0.45
        + keyword_hits * 2.5
        + numeric_complexity * 0.8
        + answer_span * 0.5
        + option_penalty
    )


def kmeans_1d(values: list[tuple[int, float]], cluster_count: int = 3, iterations: int = 10) -> dict[int, int]:
    if not values:
        return {}

    ordered = sorted(values, key=lambda item: item[1])
    effective_clusters = min(cluster_count, len(ordered))
    if effective_clusters == 1:
        return {identifier: 0 for identifier, _score in ordered}

    seeds = [
        ordered[0][1],
        ordered[len(ordered) // 2][1],
        ordered[-1][1],
    ][:effective_clusters]
    centroids = seeds[:]
    assignments = {}

    for _ in range(iterations):
        buckets: dict[int, list[float]] = defaultdict(list)
        for identifier, score in ordered:
            cluster = min(range(effective_clusters), key=lambda index: abs(score - centroids[index]))
            assignments[identifier] = cluster
            buckets[cluster].append(score)

        for cluster in range(effective_clusters):
            if buckets[cluster]:
                centroids[cluster] = sum(buckets[cluster]) / len(buckets[cluster])

    return assignments


def difficulty_map_for_pool(question_pool: list[dict[str, Any]]) -> dict[int, str]:
    by_subject: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for question in question_pool:
        by_subject[question["subject"]].append(question)

    mapping: dict[int, str] = {}

    for questions in by_subject.values():
        scored = [(question["id"], complexity_score(question)) for question in questions]
        assignments = kmeans_1d(scored, 3)
        centroids: dict[int, list[float]] = defaultdict(list)

        for identifier, score in scored:
            centroids[assignments[identifier]].append(score)

        ordered_clusters = sorted(
            (
                (cluster, sum(scores) / len(scores))
                for cluster, scores in centroids.items()
            ),
            key=lambda entry: entry[1],
        )

        labels = ["easy", "medium", "hard"][: len(ordered_clusters)]
        cluster_to_label = {
            cluster: labels[index if index < len(labels) else -1]
            for index, (cluster, _score) in enumerate(ordered_clusters)
        }

        # If a subject has only 2 clusters, bias the upper one to medium instead of hard.
        if len(ordered_clusters) == 2:
            cluster_to_label[ordered_clusters[1][0]] = "medium"

        for identifier, cluster in assignments.items():
            mapping[identifier] = cluster_to_label.get(cluster, "medium")

    return mapping


def initialize_state(question_pool: list[dict[str, Any]], question_target: int, batch_size: int) -> dict[str, Any]:
    difficulty_map = difficulty_map_for_pool(question_pool)
    subtopics: dict[str, dict[str, Any]] = {}

    for question in question_pool:
        key = subtopic_key(question)
        if key not in subtopics:
            subtopics[key] = {
                "subject": question["subject"],
                "topic": question["topic"],
                "subtopic": question["subtopic"],
                "skill": 0.5,
                "attempts": 0,
                "correct": 0,
            }

    return {
        "questionTarget": question_target,
        "batchSize": batch_size,
        "askedQuestionIds": [],
        "difficultyMap": {str(identifier): label for identifier, label in difficulty_map.items()},
        "subtopics": subtopics,
        "subjectBreakdown": {},
        "subtopicBreakdown": {},
        "difficultyPerformance": {
            "easy": {"correct": 0, "total": 0},
            "medium": {"correct": 0, "total": 0},
            "hard": {"correct": 0, "total": 0},
        },
        "batchHistory": [],
    }


def sort_questions_for_confidence(questions: list[dict[str, Any]], difficulty_map: dict[int, str]) -> list[dict[str, Any]]:
    return sorted(
        questions,
        key=lambda question: (
            DIFFICULTY_ORDER.get(difficulty_map.get(question["id"], "medium"), 1),
            len(question["prompt"]),
            question["id"],
        ),
    )


def select_initial_batch(
    question_pool: list[dict[str, Any]], state: dict[str, Any], batch_size: int
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    difficulty_map = {int(key): value for key, value in state["difficultyMap"].items()}
    by_subject: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for question in question_pool:
        by_subject[question["subject"]].append(question)

    subjects = sorted(by_subject.keys())
    selected: list[dict[str, Any]] = []
    used_subtopics: set[str] = set()
    loops = 0

    while len(selected) < batch_size and loops < batch_size * 6:
        for subject in subjects:
            candidates = [
                question
                for question in sort_questions_for_confidence(by_subject[subject], difficulty_map)
                if question["id"] not in {entry["id"] for entry in selected}
            ]
            candidate = next(
                (
                    question
                    for question in candidates
                    if subtopic_key(question) not in used_subtopics
                ),
                candidates[0] if candidates else None,
            )
            if candidate and candidate["id"] not in {entry["id"] for entry in selected}:
                selected.append(candidate)
                used_subtopics.add(subtopic_key(candidate))
                if len(selected) >= batch_size:
                    break
        loops += 1
        if not any(question["id"] not in {entry["id"] for entry in selected} for question in question_pool):
            break

    reason = {
        "strategy": "balanced warm-up",
        "distribution": {
            "weak": 0,
            "strong": 0,
            "explore": len(selected),
        },
        "notes": [
            "The first batch spreads across subjects and subtopics to establish a stable baseline.",
            "Difficulty is biased toward easier and medium questions to avoid punishing cold starts.",
        ],
    }

    return selected[:batch_size], reason


def grade_question(question: dict[str, Any], answer: dict[str, Any]) -> tuple[bool, str, str | None]:
    if question["type"] == "mcq":
        submitted_option_id = answer.get("choiceId")
        options = question.get("options", [])
        selected_option = next(
            (entry for entry in options if entry["id"] == submitted_option_id),
            None,
        )
        correct_option = next((entry for entry in options if entry.get("isCorrect")), None)
        submitted_answer = selected_option["text"] if selected_option else ""
        return (
            bool(selected_option and correct_option and selected_option["id"] == correct_option["id"]),
            submitted_answer,
            submitted_option_id,
        )

    raw_submitted_answer = answer.get("answerText", "").strip()
    return (
        short_answer_matches(raw_submitted_answer, question.get("acceptedAnswers", [])),
        raw_submitted_answer,
        None,
    )


def update_skill_entry(entry: dict[str, Any], correct: bool, difficulty_label: str) -> float:
    prior_skill = float(entry.get("skill", 0.5))
    prior_attempts = int(entry.get("attempts", 0))
    evidence_weight = DIFFICULTY_WEIGHT.get(difficulty_label, 1.0)
    prior_weight = 5 + prior_attempts
    target = 1.0 if correct else 0.0
    updated = ((prior_skill * prior_weight) + (target * evidence_weight)) / (prior_weight + evidence_weight)
    return max(0.05, min(0.95, round(updated, 4)))


def distribution_for_batch(batch_size: int) -> dict[str, int]:
    if batch_size <= 1:
        return {"weak": 0, "strong": 0, "explore": batch_size}

    weak = max(1, round(batch_size * 0.4))
    strong = max(1, round(batch_size * 0.4))
    explore = max(1, batch_size - weak - strong)

    while weak + strong + explore > batch_size:
        if strong >= weak and strong > 1:
            strong -= 1
        elif weak > 1:
            weak -= 1
        else:
            explore -= 1

    while weak + strong + explore < batch_size:
        explore += 1

    return {"weak": weak, "strong": strong, "explore": explore}


def ordered_subtopics(state: dict[str, Any]) -> tuple[list[str], list[str], list[str]]:
    items = list(state["subtopics"].items())

    weak = [
        key
        for key, entry in sorted(items, key=lambda item: (item[1]["skill"], -item[1]["attempts"], item[0]))
    ]
    strong = [
        key
        for key, entry in sorted(items, key=lambda item: (-item[1]["skill"], -item[1]["attempts"], item[0]))
    ]
    exploratory = [
        key
        for key, entry in sorted(items, key=lambda item: (item[1]["attempts"], abs(item[1]["skill"] - 0.5), item[0]))
    ]

    return weak, strong, exploratory


def round_robin_pick(
    ordered_keys: list[str],
    grouped_questions: dict[str, list[dict[str, Any]]],
    count: int,
    selected_ids: set[int],
) -> list[dict[str, Any]]:
    picked: list[dict[str, Any]] = []
    index = 0

    while len(picked) < count and ordered_keys:
        key = ordered_keys[index % len(ordered_keys)]
        bucket = grouped_questions.get(key, [])
        candidate = next((question for question in bucket if question["id"] not in selected_ids), None)
        if candidate:
            picked.append(candidate)
            selected_ids.add(candidate["id"])
        else:
            ordered_keys = [entry for entry in ordered_keys if entry != key]
            if not ordered_keys:
                break
            index -= 1
        index += 1

    return picked


def select_adaptive_batch(
    question_pool: list[dict[str, Any]], state: dict[str, Any], batch_size: int
) -> tuple[list[dict[str, Any]], dict[str, Any]] | tuple[None, None]:
    asked_ids = {int(identifier) for identifier in state.get("askedQuestionIds", [])}
    remaining_target = state["questionTarget"] - len(asked_ids)
    actual_batch_size = min(batch_size, max(remaining_target, 0))
    if actual_batch_size <= 0:
        return None, None

    remaining_questions = [question for question in question_pool if question["id"] not in asked_ids]
    if not remaining_questions:
        return None, None

    difficulty_map = {int(key): value for key, value in state["difficultyMap"].items()}
    weak_order, strong_order, exploratory_order = ordered_subtopics(state)
    desired = distribution_for_batch(actual_batch_size)

    grouped_weak: dict[str, list[dict[str, Any]]] = defaultdict(list)
    grouped_strong: dict[str, list[dict[str, Any]]] = defaultdict(list)
    grouped_explore: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for question in remaining_questions:
        key = subtopic_key(question)
        grouped_weak[key].append(question)
        grouped_strong[key].append(question)
        grouped_explore[key].append(question)

    for bucket in (grouped_weak, grouped_strong):
        for key, questions in bucket.items():
            questions.sort(
                key=lambda question: (
                    DIFFICULTY_ORDER.get(difficulty_map.get(question["id"], "medium"), 1),
                    len(question["prompt"]),
                    question["id"],
                )
            )

    for key, questions in grouped_explore.items():
        questions.sort(
            key=lambda question: (
                state["subtopics"][key]["attempts"],
                -DIFFICULTY_ORDER.get(difficulty_map.get(question["id"], "medium"), 1),
                question["id"],
            )
        )

    selected_ids: set[int] = set()
    selected: list[dict[str, Any]] = []

    weak_pick = round_robin_pick(weak_order[:], grouped_weak, desired["weak"], selected_ids)
    strong_pick = round_robin_pick(strong_order[:], grouped_strong, desired["strong"], selected_ids)
    explore_pick = round_robin_pick(exploratory_order[:], grouped_explore, desired["explore"], selected_ids)

    selected.extend(weak_pick)
    selected.extend(strong_pick)
    selected.extend(explore_pick)

    if len(selected) < actual_batch_size:
        fallback = [
            question
            for question in sorted(
                remaining_questions,
                key=lambda question: (
                    state["subtopics"][subtopic_key(question)]["attempts"],
                    DIFFICULTY_ORDER.get(difficulty_map.get(question["id"], "medium"), 1),
                    question["id"],
                ),
            )
            if question["id"] not in selected_ids
        ]
        for question in fallback:
            selected.append(question)
            selected_ids.add(question["id"])
            if len(selected) >= actual_batch_size:
                break

    weak_focus = sorted({question["subtopic"] for question in weak_pick})
    strong_focus = sorted({question["subtopic"] for question in strong_pick})
    explore_focus = sorted({question["subtopic"] for question in explore_pick})

    reason = {
        "strategy": "adaptive explore/exploit",
        "distribution": {
            "weak": len(weak_pick),
            "strong": len(strong_pick),
            "explore": len(explore_pick),
        },
        "notes": [
            f"Weak-focus questions targeted: {', '.join(weak_focus) or 'fallback mix'}.",
            f"Confidence-boost questions came from: {', '.join(strong_focus) or 'fallback mix'}.",
            f"Exploratory coverage included: {', '.join(explore_focus) or 'remaining pool'}.",
        ],
    }

    return selected[:actual_batch_size], reason


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/quiz/initialize")
def initialize_quiz(payload: InitializePayload) -> dict[str, Any]:
    state = initialize_state(payload.questionPool, payload.questionTarget, payload.batchSize)
    batch_questions, selection_reason = select_initial_batch(payload.questionPool, state, payload.batchSize)
    state["askedQuestionIds"] = [question["id"] for question in batch_questions]

    return {
        "state": state,
        "batch": {
            "batchIndex": 0,
            "selectionReason": selection_reason,
            "questions": batch_questions,
        },
    }


@app.post("/quiz/evaluate")
def evaluate_quiz_batch(payload: EvaluatePayload) -> dict[str, Any]:
    state = payload.state
    difficulty_map = {int(key): value for key, value in state["difficultyMap"].items()}
    answer_lookup = {int(answer["questionId"]): answer for answer in payload.answers}

    review: list[dict[str, Any]] = []
    batch_correct = 0

    for question in payload.batchQuestions:
        answer = answer_lookup.get(question["id"], {"choiceId": None, "answerText": ""})
        correct, submitted_answer, submitted_option_id = grade_question(question, answer)
        difficulty_label = difficulty_map.get(question["id"], "medium")
        key = subtopic_key(question)
        subtopic_stats = state["subtopics"][key]

        subtopic_stats["skill"] = update_skill_entry(subtopic_stats, correct, difficulty_label)
        subtopic_stats["attempts"] += 1
        if correct:
            subtopic_stats["correct"] += 1

        subject_breakdown = state["subjectBreakdown"].setdefault(
            question["subject"], {"correct": 0, "total": 0}
        )
        subject_breakdown["total"] += 1
        if correct:
            subject_breakdown["correct"] += 1

        subtopic_breakdown = state["subtopicBreakdown"].setdefault(
            key,
            {
                "subject": question["subject"],
                "topic": question["topic"],
                "subtopic": question["subtopic"],
                "correct": 0,
                "total": 0,
                "skill": 0.5,
            },
        )
        subtopic_breakdown["total"] += 1
        if correct:
            subtopic_breakdown["correct"] += 1
        subtopic_breakdown["skill"] = subtopic_stats["skill"]

        difficulty_entry = state["difficultyPerformance"].setdefault(
            difficulty_label, {"correct": 0, "total": 0}
        )
        difficulty_entry["total"] += 1
        if correct:
            difficulty_entry["correct"] += 1

        if correct:
            batch_correct += 1

        review.append(
            {
                "questionId": question["id"],
                "subject": question["subject"],
                "topic": question["topic"],
                "subtopic": question["subtopic"],
                "difficultyLabel": difficulty_label,
                "type": question["type"],
                "prompt": question["prompt"],
                "submittedAnswer": submitted_answer,
                "submittedOptionId": submitted_option_id,
                "correct": correct,
                "correctAnswer": correct_answer_display(question),
                "explanation": question.get("explanation", ""),
            }
        )

    total_answered = sum(item["total"] for item in state["difficultyPerformance"].values())
    total_correct = sum(item["correct"] for item in state["difficultyPerformance"].values())
    current_batch_index = len(state["batchHistory"])
    accuracy = round((batch_correct / max(len(payload.batchQuestions), 1)) * 100)

    state["batchHistory"].append(
        {
            "batchIndex": current_batch_index,
            "correct": batch_correct,
            "total": len(payload.batchQuestions),
            "accuracy": accuracy,
        }
    )

    next_batch_questions, selection_reason = select_adaptive_batch(
        payload.questionPool, state, payload.batchSize
    )

    if next_batch_questions:
        state["askedQuestionIds"].extend(question["id"] for question in next_batch_questions)

    finished = total_answered >= payload.questionTarget

    return {
        "state": state,
        "review": review,
        "summary": {
            "totalCorrect": total_correct,
            "totalAnswered": total_answered,
            "currentBatchIndex": current_batch_index + 1,
            "finished": finished,
        },
        "batchAnalysis": {
            "correct": batch_correct,
            "total": len(payload.batchQuestions),
            "accuracy": accuracy,
        },
        "nextBatch": None
        if not next_batch_questions
        else {
            "batchIndex": current_batch_index + 1,
            "selectionReason": selection_reason,
            "questions": next_batch_questions,
        },
    }
