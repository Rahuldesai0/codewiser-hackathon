export function QuestionCard({ question, answer = {}, onChange, index }) {
  return (
    <article className="question-card">
      <div className="question-head">
        <span className="question-chip">{question.subject}</span>
        <span className="question-chip secondary">{question.subtopic}</span>
      </div>
      <h3>
        Q{index + 1}. {question.prompt}
      </h3>

      {question.type === "mcq" ? (
        <div className="choice-list">
          {question.options.map((option) => (
            <label key={option.id} className={`choice ${answer.choiceId === option.id ? "selected" : ""}`}>
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={answer.choiceId === option.id}
                onChange={() => onChange(question.id, { choiceId: option.id, answerText: "" })}
              />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
      ) : (
        <label className="text-answer">
          <span className="sr-only">Type your answer</span>
          <input
            type="text"
            placeholder="Type the technical term or short answer"
            value={answer.answerText || ""}
            onChange={(event) =>
              onChange(question.id, { answerText: event.target.value, choiceId: null })
            }
          />
        </label>
      )}
    </article>
  );
}
