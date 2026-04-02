Drop JSON, JSONL, or NDJSON question files in this folder to let the API import them during crawler runs.

Supported record shapes:

```json
{
  "subject": "DSA",
  "topic": "Trees",
  "subtopic": "Binary Tree",
  "prompt": "Which traversal visits left subtree, root, then right subtree?",
  "answer": "Inorder traversal",
  "explanation": "Inorder is left-root-right."
}
```

```json
{
  "subject": "DBMS",
  "prompt": "Which normal form removes transitive dependencies?",
  "options": [
    { "text": "1NF" },
    { "text": "2NF" },
    { "text": "3NF", "isCorrect": true },
    { "text": "BCNF" }
  ],
  "explanation": "3NF removes transitive dependencies."
}
```

The importer re-classifies subject and topic, rejects low-confidence junk, and stores only quiz-ready questions.
