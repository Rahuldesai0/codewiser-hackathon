from __future__ import annotations

import hashlib
import re
import secrets
from collections import defaultdict
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(title="Adaptive Quiz Intelligence Service")

COMPLEXITY_KEYWORDS = {
    "deadlock",
    "automata",
    "bandwidth",
    "serializable",
    "normalization",
    "amortized",
    "belady",
    "cache",
    "cipher",
    "recurrence",
    "concurrency",
    "congestion",
    "contextfree",
    "determinant",
    "dfa",
    "grammar",
    "index",
    "instruction",
    "kernel",
    "kmap",
    "latency",
    "matrix",
    "modulo",
    "nfa",
    "pda",
    "pipeline",
    "proof",
    "routing",
    "hash",
    "scheduling",
    "semaphore",
    "locking",
    "tcp",
    "turing",
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
CONCEPT_GRAPH = {
    "OS": {
        "nodes": {
            "Scheduling": {"topic": "Process Management", "prerequisites": []},
            "Deadlocks": {"topic": "Process Management", "prerequisites": ["Scheduling"]},
            "Paging": {"topic": "Memory Management", "prerequisites": []},
            "Semaphores": {"topic": "Synchronization", "prerequisites": ["Scheduling"]},
        }
    },
    "DBMS": {
        "nodes": {
            "Normalization": {"topic": "Relational Model", "prerequisites": []},
            "ACID": {"topic": "Transaction Management", "prerequisites": ["Normalization"]},
            "B+ Trees": {"topic": "Indexing", "prerequisites": ["Normalization"]},
            "Locking": {"topic": "Concurrency Control", "prerequisites": ["ACID"]},
        }
    },
    "COA": {
        "nodes": {
            "Boolean Algebra": {"topic": "Digital Logic", "prerequisites": []},
            "Addressing Modes": {
                "topic": "Instruction Set Architecture",
                "prerequisites": ["Boolean Algebra"],
            },
            "Cache Memory": {"topic": "Memory Organization", "prerequisites": []},
            "Pipelining": {
                "topic": "Processor Organization",
                "prerequisites": ["Addressing Modes", "Cache Memory"],
            },
        }
    },
    "CN": {
        "nodes": {
            "OSI Model": {"topic": "Network Layers", "prerequisites": []},
            "Routing": {"topic": "Network Layer", "prerequisites": ["OSI Model"]},
            "TCP": {"topic": "Transport Layer", "prerequisites": ["OSI Model"]},
            "DNS and HTTP": {"topic": "Application Layer", "prerequisites": ["OSI Model", "TCP"]},
        }
    },
    "Maths": {
        "nodes": {
            "Logic": {"topic": "Discrete Mathematics", "prerequisites": []},
            "Relations and Functions": {
                "topic": "Discrete Mathematics",
                "prerequisites": ["Logic"],
            },
            "Counting": {"topic": "Combinatorics", "prerequisites": ["Logic"]},
            "Trees and Connectivity": {
                "topic": "Graph Theory",
                "prerequisites": ["Counting", "Relations and Functions"],
            },
        }
    },
    "General Maths": {
        "nodes": {
            "Arithmetic": {"topic": "Arithmetic", "prerequisites": []},
            "Algebra": {"topic": "Algebra", "prerequisites": ["Arithmetic"]},
            "Geometry": {"topic": "Geometry", "prerequisites": ["Arithmetic"]},
            "Probability": {
                "topic": "Probability",
                "prerequisites": ["Arithmetic", "Algebra"],
            },
            "Statistics": {
                "topic": "Statistics",
                "prerequisites": ["Arithmetic", "Probability"],
            },
        }
    },
    "English": {
        "nodes": {
            "Vocabulary": {"topic": "Vocabulary", "prerequisites": []},
            "Grammar": {"topic": "Grammar", "prerequisites": ["Vocabulary"]},
            "Reading Comprehension": {
                "topic": "Reading Comprehension",
                "prerequisites": ["Vocabulary", "Grammar"],
            },
        }
    },
    "Physics": {
        "nodes": {
            "Mechanics": {"topic": "Mechanics", "prerequisites": []},
            "Thermodynamics": {"topic": "Thermodynamics", "prerequisites": ["Mechanics"]},
            "Optics": {"topic": "Optics", "prerequisites": []},
            "Modern Physics": {"topic": "Modern Physics", "prerequisites": ["Mechanics"]},
        }
    },
    "Astronomy": {
        "nodes": {
            "Orbital Motion": {"topic": "Celestial Mechanics", "prerequisites": []},
            "Stellar Evolution": {
                "topic": "Stars and Galaxies",
                "prerequisites": ["Orbital Motion"],
            },
            "Telescopes": {
                "topic": "Observational Astronomy",
                "prerequisites": ["Orbital Motion"],
            },
        }
    },
    "Chemistry": {
        "nodes": {
            "Physical Chemistry": {"topic": "Physical Chemistry", "prerequisites": []},
            "Organic Chemistry": {
                "topic": "Organic Chemistry",
                "prerequisites": ["Physical Chemistry"],
            },
            "Inorganic Chemistry": {
                "topic": "Inorganic Chemistry",
                "prerequisites": [],
            },
        }
    },
    "Biology": {
        "nodes": {
            "Cell Structure": {"topic": "Cell Biology", "prerequisites": []},
            "Inheritance": {"topic": "Genetics", "prerequisites": ["Cell Structure"]},
            "Systems": {"topic": "Human Physiology", "prerequisites": ["Cell Structure"]},
        }
    },
    "Computer Security": {
        "nodes": {
            "Cryptography": {"topic": "Cryptography", "prerequisites": []},
            "Authentication and Access": {
                "topic": "Authentication and Access",
                "prerequisites": ["Cryptography"],
            },
            "Network Security": {
                "topic": "Network Security",
                "prerequisites": ["Authentication and Access"],
            },
            "Application Security": {
                "topic": "Application Security",
                "prerequisites": ["Authentication and Access"],
            },
        }
    },
    "Machine Learning": {
        "nodes": {
            "Classification": {"topic": "Supervised Learning", "prerequisites": []},
            "Regression": {"topic": "Supervised Learning", "prerequisites": []},
            "Clustering": {
                "topic": "Unsupervised Learning",
                "prerequisites": ["Classification", "Regression"],
            },
            "Metrics": {
                "topic": "Model Evaluation",
                "prerequisites": ["Classification", "Regression", "Clustering"],
            },
        }
    },
    "TOC": {
        "nodes": {
            "Regular Languages": {"topic": "Formal Languages", "prerequisites": []},
            "Context Free Grammar": {
                "topic": "Grammar",
                "prerequisites": ["Regular Languages"],
            },
            "Pushdown Automata": {
                "topic": "Automata",
                "prerequisites": ["Context Free Grammar"],
            },
            "Turing Machines": {
                "topic": "Computability",
                "prerequisites": ["Pushdown Automata"],
            },
        }
    },
    "Miscellaneous CS": {
        "nodes": {
            "Language Concepts": {"topic": "Programming Languages", "prerequisites": []},
            "Testing and Design": {
                "topic": "Software Engineering",
                "prerequisites": ["Language Concepts"],
            },
            "Basics": {"topic": "Security", "prerequisites": []},
            "Asymptotics": {
                "topic": "Algorithms and Analysis",
                "prerequisites": ["Language Concepts"],
            },
        }
    },
    "DSA": {
        "nodes": {
            "Searching": {"topic": "Arrays", "prerequisites": []},
            "Hashing": {"topic": "Arrays", "prerequisites": ["Searching"]},
            "Operations": {"topic": "Linked Lists", "prerequisites": []},
            "Stack": {"topic": "Stacks and Queues", "prerequisites": ["Operations"]},
            "Queue": {"topic": "Stacks and Queues", "prerequisites": ["Operations"]},
            "Binary Tree": {"topic": "Trees", "prerequisites": ["Queue"]},
            "Binary Search Tree": {
                "topic": "Trees",
                "prerequisites": ["Binary Tree", "Searching"],
            },
            "Traversal": {"topic": "Graphs", "prerequisites": ["Queue"]},
            "Shortest Path": {"topic": "Graphs", "prerequisites": ["Traversal"]},
            "Priority Queue": {"topic": "Heaps", "prerequisites": ["Queue"]},
            "Heap Sort": {"topic": "Sorting", "prerequisites": ["Priority Queue"]},
            "Divide and Conquer": {
                "topic": "Sorting",
                "prerequisites": ["Searching"],
            },
            "DP Basics": {
                "topic": "Dynamic Programming",
                "prerequisites": ["Divide and Conquer", "Recursion"],
            },
            "Greedy Strategy": {"topic": "Greedy", "prerequisites": ["Searching"]},
            "Recursion": {"topic": "Recursion", "prerequisites": []},
        }
    },
}
INITIAL_MASTERY = 0.5
INITIAL_UNCERTAINTY = 0.45
PREREQUISITE_PROPAGATION = 0.35


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


def concept_key(subject: str, concept: str) -> str:
    return f"{subject}::{concept}"


def graph_definition_for_subject(subject: str, subtopics: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    definition = CONCEPT_GRAPH.get(subject, {"nodes": {}})
    nodes = {name: dict(details) for name, details in definition.get("nodes", {}).items()}

    for entry in subtopics or []:
        if entry["subject"] != subject:
            continue
        nodes.setdefault(
            entry["subtopic"],
            {
                "topic": entry["topic"],
                "prerequisites": [],
            },
        )

    return {"nodes": nodes}


def prerequisite_children(subject: str, graph: dict[str, Any]) -> dict[str, list[str]]:
    children: dict[str, list[str]] = defaultdict(list)
    for concept, details in graph.get("nodes", {}).items():
        for prerequisite in details.get("prerequisites", []):
            children[prerequisite].append(concept)
    return {concept_key(subject, key): values for key, values in children.items()}


def ensure_concept_state_entry(
    concept_states: dict[str, dict[str, Any]],
    subject: str,
    concept: str,
    topic: str,
    prerequisites: list[str],
) -> dict[str, Any]:
    key = concept_key(subject, concept)
    if key not in concept_states:
        concept_states[key] = {
            "subject": subject,
            "topic": topic,
            "concept": concept,
            "mastery": INITIAL_MASTERY,
            "uncertainty": INITIAL_UNCERTAINTY,
            "evidenceCount": 0.0,
            "attempts": 0,
            "correct": 0,
            "prerequisites": prerequisites,
        }
    return concept_states[key]


def question_concepts(question: dict[str, Any], concept_graphs: dict[str, Any]) -> list[str]:
    subject = question["subject"]
    graph = concept_graphs.get(subject, {"nodes": {}})
    concept = question["subtopic"]
    if concept in graph.get("nodes", {}):
        return [concept_key(subject, concept)]

    graph["nodes"][concept] = {"topic": question["topic"], "prerequisites": []}
    return [concept_key(subject, concept)]


def update_concept_mastery(entry: dict[str, Any], correct: bool, difficulty_label: str) -> dict[str, float]:
    evidence_weight = DIFFICULTY_WEIGHT.get(difficulty_label, 1.0)
    prior_mastery = float(entry.get("mastery", INITIAL_MASTERY))
    prior_uncertainty = float(entry.get("uncertainty", INITIAL_UNCERTAINTY))
    learning_rate = min(0.55, 0.12 + prior_uncertainty * 0.28 + evidence_weight * 0.08)
    target = 1.0 if correct else 0.0
    updated_mastery = prior_mastery + (target - prior_mastery) * learning_rate
    updated_uncertainty = max(
        0.06,
        min(
            0.95,
            prior_uncertainty * 0.82 + (0.02 if correct else 0.07) / max(evidence_weight, 0.8),
        ),
    )

    if correct:
        updated_uncertainty = max(0.06, updated_uncertainty - 0.05)

    return {
        "mastery": round(max(0.03, min(0.97, updated_mastery)), 4),
        "uncertainty": round(updated_uncertainty, 4),
        "evidence": round(float(entry.get("evidenceCount", 0.0)) + evidence_weight, 4),
    }


def propagate_prerequisite_signal(
    concept_states: dict[str, dict[str, Any]],
    concept_graphs: dict[str, Any],
    key: str,
    correct: bool,
    difficulty_label: str,
) -> None:
    subject, concept = key.split("::", 1)
    graph = concept_graphs.get(subject, {"nodes": {}})
    node = graph.get("nodes", {}).get(concept, {"prerequisites": []})
    influence = DIFFICULTY_WEIGHT.get(difficulty_label, 1.0) * PREREQUISITE_PROPAGATION

    for prerequisite in node.get("prerequisites", []):
        prerequisite_key = concept_key(subject, prerequisite)
        if prerequisite_key not in concept_states:
            continue
        entry = concept_states[prerequisite_key]
        delta = 0.025 * influence if correct else -0.035 * influence
        entry["mastery"] = round(max(0.03, min(0.97, entry["mastery"] + delta)), 4)
        entry["uncertainty"] = round(max(0.06, min(0.95, entry["uncertainty"] + 0.015 * influence)), 4)


def concept_priority_for_question(
    question: dict[str, Any],
    concept_states: dict[str, dict[str, Any]],
    concept_graphs: dict[str, Any],
    difficulty_map: dict[int, str],
) -> float:
    key = question_concepts(question, concept_graphs)[0]
    entry = concept_states[key]
    subject, concept = key.split("::", 1)
    prerequisites = concept_graphs.get(subject, {}).get("nodes", {}).get(concept, {}).get("prerequisites", [])

    mastery_gap = 1.0 - entry["mastery"]
    uncertainty = entry["uncertainty"]
    evidence_gap = max(0.0, 1.2 - min(entry["evidenceCount"], 1.2))
    prerequisite_gap = 0.0

    if prerequisites:
        prerequisite_gap = sum(
            1.0 - concept_states.get(concept_key(subject, prerequisite), {}).get("mastery", INITIAL_MASTERY)
            for prerequisite in prerequisites
        ) / len(prerequisites)

    difficulty_label = difficulty_map.get(question["id"], "medium")
    difficulty_bias = {"easy": 0.12, "medium": 0.2, "hard": 0.28}.get(difficulty_label, 0.2)
    challenge_fit = 1.0 - abs((mastery_gap + uncertainty * 0.5) - difficulty_bias)

    return round(
        mastery_gap * 0.42
        + uncertainty * 0.24
        + prerequisite_gap * 0.18
        + evidence_gap * 0.1
        + max(challenge_fit, 0.0) * 0.06,
        4,
    )


def concept_graph_snapshot(
    concept_states: dict[str, dict[str, Any]],
    concept_graphs: dict[str, Any],
) -> dict[str, Any]:
    snapshot: dict[str, Any] = {}
    for subject, graph in concept_graphs.items():
        nodes = []
        edges = []
        for concept, details in graph.get("nodes", {}).items():
            key = concept_key(subject, concept)
            state = concept_states.get(
                key,
                {
                    "mastery": INITIAL_MASTERY,
                    "uncertainty": INITIAL_UNCERTAINTY,
                    "topic": details.get("topic", subject),
                    "attempts": 0,
                    "correct": 0,
                    "evidenceCount": 0.0,
                },
            )
            nodes.append(
                {
                    "id": key,
                    "label": concept,
                    "topic": details.get("topic", state.get("topic", subject)),
                    "mastery": state["mastery"],
                    "uncertainty": state["uncertainty"],
                    "attempts": state.get("attempts", 0),
                    "correct": state.get("correct", 0),
                    "evidenceCount": state.get("evidenceCount", 0.0),
                }
            )
            for prerequisite in details.get("prerequisites", []):
                edges.append(
                    {
                        "source": concept_key(subject, prerequisite),
                        "target": key,
                    }
                )
        snapshot[subject] = {"nodes": nodes, "edges": edges}
    return snapshot


def complexity_score(question: dict[str, Any]) -> float:
    metadata = question.get("metadata", {}) or {}
    remote_difficulty = metadata.get("remoteDifficulty", {}) or {}
    remote_score = remote_difficulty.get("score", metadata.get("difficultyScore"))
    remote_label = remote_difficulty.get("label", metadata.get("difficultyLabel"))

    if isinstance(remote_score, (int, float)):
        label_bonus = {"easy": 0.0, "medium": 3.0, "hard": 6.0}.get(str(remote_label).lower(), 0.0)
        return float(remote_score) + label_bonus

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
    concept_graphs: dict[str, Any] = {}
    concept_states: dict[str, dict[str, Any]] = {}

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

    by_subject = defaultdict(list)
    for entry in subtopics.values():
        by_subject[entry["subject"]].append(entry)

    for subject, entries in by_subject.items():
        graph = graph_definition_for_subject(subject, entries)
        concept_graphs[subject] = graph
        for concept, details in graph.get("nodes", {}).items():
            ensure_concept_state_entry(
                concept_states,
                subject,
                concept,
                details.get("topic", subject),
                list(details.get("prerequisites", [])),
            )

    return {
        "questionTarget": question_target,
        "batchSize": batch_size,
        "selectionSeed": secrets.randbits(32),
        "askedQuestionIds": [],
        "difficultyMap": {str(identifier): label for identifier, label in difficulty_map.items()},
        "subtopics": subtopics,
        "conceptGraphs": concept_graphs,
        "conceptStates": concept_states,
        "subjectBreakdown": {},
        "subtopicBreakdown": {},
        "difficultyPerformance": {
            "easy": {"correct": 0, "total": 0},
            "medium": {"correct": 0, "total": 0},
            "hard": {"correct": 0, "total": 0},
        },
        "conceptRecommendations": [],
        "batchHistory": [],
    }


def stable_random_rank(state: dict[str, Any], label: str, question_id: int, batch_index: int = 0) -> float:
    seed = state.get("selectionSeed", 0)
    digest = hashlib.sha1(f"{seed}:{label}:{batch_index}:{question_id}".encode("utf-8")).hexdigest()[:12]
    return int(digest, 16) / float(16**12)


def shuffled_batch_order(
    questions: list[dict[str, Any]], state: dict[str, Any], label: str, batch_index: int = 0
) -> list[dict[str, Any]]:
    return sorted(
        questions,
        key=lambda question: stable_random_rank(state, label, question["id"], batch_index),
    )


def sort_questions_for_confidence(
    questions: list[dict[str, Any]], difficulty_map: dict[int, str], state: dict[str, Any], label: str
) -> list[dict[str, Any]]:
    return sorted(
        questions,
        key=lambda question: (
            DIFFICULTY_ORDER.get(difficulty_map.get(question["id"], "medium"), 1),
            len(question["prompt"]),
            stable_random_rank(state, label, question["id"]),
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
                for question in sort_questions_for_confidence(
                    by_subject[subject], difficulty_map, state, f"initial:{subject}"
                )
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

    return shuffled_batch_order(selected[:batch_size], state, "initial-batch"), reason


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
    concept_states = state.get("conceptStates", {})
    concept_graphs = state.get("conceptGraphs", {})

    ranked_questions = sorted(
        remaining_questions,
        key=lambda question: (
            -concept_priority_for_question(question, concept_states, concept_graphs, difficulty_map),
            state["subtopics"][subtopic_key(question)]["attempts"],
            DIFFICULTY_ORDER.get(difficulty_map.get(question["id"], "medium"), 1),
            stable_random_rank(state, "adaptive-rank", question["id"], len(state.get("batchHistory", []))),
        ),
    )

    selected: list[dict[str, Any]] = []
    selected_ids: set[int] = set()
    covered_concepts: set[str] = set()

    for question in ranked_questions:
        question_concept = question_concepts(question, concept_graphs)[0]
        if question["id"] in selected_ids:
            continue
        if question_concept in covered_concepts and len(selected) < max(actual_batch_size - 2, 1):
            continue
        selected.append(question)
        selected_ids.add(question["id"])
        covered_concepts.add(question_concept)
        if len(selected) >= actual_batch_size:
            break

    if len(selected) < actual_batch_size:
        for question in ranked_questions:
            if question["id"] in selected_ids:
                continue
            selected.append(question)
            selected_ids.add(question["id"])
            if len(selected) >= actual_batch_size:
                break

    concept_focus = []
    prerequisite_focus = []
    for question in selected:
        key = question_concepts(question, concept_graphs)[0]
        entry = concept_states[key]
        concept_focus.append(f"{entry['concept']} ({round((1 - entry['mastery']) * 100)}% gap)")
        prerequisite_focus.extend(entry.get("prerequisites", []))

    weakest_concepts = sorted(
        {
            concept_states[question_concepts(question, concept_graphs)[0]]["concept"]
            for question in selected
        }
    )
    prerequisite_concepts = sorted(set(prerequisite_focus))

    reason = {
        "strategy": "concept graph tracing",
        "distribution": {
            "weak": len([question for question in selected if concept_states[question_concepts(question, concept_graphs)[0]]["mastery"] < 0.45]),
            "strong": len([question for question in selected if concept_states[question_concepts(question, concept_graphs)[0]]["mastery"] > 0.7]),
            "explore": len([question for question in selected if concept_states[question_concepts(question, concept_graphs)[0]]["uncertainty"] > 0.3]),
        },
        "notes": [
            f"High-information concepts targeted: {', '.join(weakest_concepts) or 'fallback mix'}.",
            f"Prerequisite pressure in this batch: {', '.join(prerequisite_concepts) or 'none'}.",
            f"Concept priority signals: {', '.join(concept_focus[:4]) or 'remaining pool'}.",
        ],
    }

    return (
        shuffled_batch_order(
            selected[:actual_batch_size],
            state,
            "adaptive-batch",
            len(state.get("batchHistory", [])),
        ),
        reason,
    )


def concept_recommendations(concept_states: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    ranked = sorted(
        concept_states.values(),
        key=lambda entry: (
            -(1.0 - entry["mastery"]) - entry["uncertainty"] * 0.35,
            entry["attempts"],
            entry["concept"],
        ),
    )

    recommendations = []
    for entry in ranked[:8]:
        recommendations.append(
            {
                "subject": entry["subject"],
                "topic": entry["topic"],
                "concept": entry["concept"],
                "mastery": entry["mastery"],
                "uncertainty": entry["uncertainty"],
                "priority": round((1.0 - entry["mastery"]) * 0.7 + entry["uncertainty"] * 0.3, 4),
                "prerequisites": entry.get("prerequisites", []),
            }
        )
    return recommendations


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
    concept_graphs = state.get("conceptGraphs", {})
    concept_states = state.get("conceptStates", {})
    answer_lookup = {int(answer["questionId"]): answer for answer in payload.answers}

    review: list[dict[str, Any]] = []
    batch_correct = 0

    for question in payload.batchQuestions:
        answer = answer_lookup.get(question["id"], {"choiceId": None, "answerText": ""})
        correct, submitted_answer, submitted_option_id = grade_question(question, answer)
        difficulty_label = difficulty_map.get(question["id"], "medium")
        key = subtopic_key(question)
        subtopic_stats = state["subtopics"][key]
        concept_keys = question_concepts(question, concept_graphs)

        subtopic_stats["skill"] = update_skill_entry(subtopic_stats, correct, difficulty_label)
        subtopic_stats["attempts"] += 1
        if correct:
            subtopic_stats["correct"] += 1

        for concept_state_key in concept_keys:
            subject, concept = concept_state_key.split("::", 1)
            graph_node = concept_graphs.get(subject, {}).get("nodes", {}).get(
                concept,
                {"topic": question["topic"], "prerequisites": []},
            )
            entry = ensure_concept_state_entry(
                concept_states,
                subject,
                concept,
                graph_node.get("topic", question["topic"]),
                list(graph_node.get("prerequisites", [])),
            )
            updated = update_concept_mastery(entry, correct, difficulty_label)
            entry["mastery"] = updated["mastery"]
            entry["uncertainty"] = updated["uncertainty"]
            entry["evidenceCount"] = updated["evidence"]
            entry["attempts"] += 1
            if correct:
                entry["correct"] += 1
            propagate_prerequisite_signal(concept_states, concept_graphs, concept_state_key, correct, difficulty_label)

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
                "concepts": [key.split("::", 1)[1] for key in concept_keys],
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
    state["conceptStates"] = concept_states
    state["conceptRecommendations"] = concept_recommendations(concept_states)

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
        "conceptGraph": concept_graph_snapshot(concept_states, concept_graphs),
        "conceptRecommendations": state["conceptRecommendations"],
        "nextBatch": None
        if not next_batch_questions
        else {
            "batchIndex": current_batch_index + 1,
            "selectionReason": selection_reason,
            "questions": next_batch_questions,
        },
    }
