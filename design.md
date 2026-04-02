User enters username → selects subjects (OS/DBMS/DSA etc) and number of questions→ quiz starts. No answers shown during quiz. Questions (MCQ, answer in one word(technical terms with mulitple words also count), etc) come in batches of 5 or 10.

After each batch, system adapts next batch:

* 2 qs from weak subtopics
* 2 from strong (confidence boost)
* 1 exploratory

Core intelligence:

* Skill tracked per subtopic (0–1)
* Updated after each batch (stable, not noisy)
* Logic (explore vs exploit) to decide next batch

Difficulty:

* Per subject clustering (KMeans)
* Rank clusters using metrics (length, keywords, numeric complexity) → easy/med/hard
* Later refined by mixing in using actual user accuracy

Architecture:

* React frontend
* Node/Express = API + fast serving
* Python microservice = all intelligence
* Postgres = storage

Perf:

* Python runs async → precomputes next batch
* Node just fetches from DB → no lag
* Always 1 batch ahead

End of quiz:

* Detailed **analysis tab for that test**: 

    * score, topic/subtopic breakdown
    * difficulty-wise performance
    * question review

Also:

* **Test history page in app**

  * past quizzes
  * overall + subject-wise performance
  * charts over time

