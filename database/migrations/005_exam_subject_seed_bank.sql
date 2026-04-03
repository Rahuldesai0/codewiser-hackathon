insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
select *
from (
  values
    (
      'General Maths',
      'Arithmetic',
      'Arithmetic',
      'mcq',
      'What is 15% of 200?',
      '[{"id":"a","text":"20","isCorrect":false},{"id":"b","text":"25","isCorrect":false},{"id":"c","text":"30","isCorrect":true},{"id":"d","text":"35","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      '15 percent of 200 is 30.',
      '{}'::jsonb
    ),
    (
      'General Maths',
      'Algebra',
      'Algebra',
      'short_text',
      'Solve for x: 2x + 3 = 11.',
      '[]'::jsonb,
      '["4"]'::jsonb,
      'Subtract 3 and divide by 2 to get x = 4.',
      '{}'::jsonb
    ),
    (
      'General Maths',
      'Geometry',
      'Geometry',
      'mcq',
      'What is the sum of the interior angles of a triangle?',
      '[{"id":"a","text":"90 degrees","isCorrect":false},{"id":"b","text":"180 degrees","isCorrect":true},{"id":"c","text":"270 degrees","isCorrect":false},{"id":"d","text":"360 degrees","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'The interior angles of any triangle add up to 180 degrees.',
      '{}'::jsonb
    ),
    (
      'General Maths',
      'Probability',
      'Probability',
      'mcq',
      'What is the probability of getting a head on a fair coin toss?',
      '[{"id":"a","text":"1/4","isCorrect":false},{"id":"b","text":"1/3","isCorrect":false},{"id":"c","text":"1/2","isCorrect":true},{"id":"d","text":"2/3","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'A fair coin has two equally likely outcomes, so the probability is 1/2.',
      '{}'::jsonb
    ),
    (
      'General Maths',
      'Algebra',
      'Algebra',
      'mcq',
      'If y = 3x and x = 4, what is y?',
      '[{"id":"a","text":"7","isCorrect":false},{"id":"b","text":"12","isCorrect":true},{"id":"c","text":"16","isCorrect":false},{"id":"d","text":"24","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Substitute x = 4 into y = 3x to get y = 12.',
      '{}'::jsonb
    ),
    (
      'English',
      'Grammar',
      'Grammar',
      'mcq',
      'Choose the grammatically correct sentence.',
      '[{"id":"a","text":"She do not like coffee.","isCorrect":false},{"id":"b","text":"She does not like coffee.","isCorrect":true},{"id":"c","text":"She not likes coffee.","isCorrect":false},{"id":"d","text":"She does not likes coffee.","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'The singular subject takes does not with the base verb like.',
      '{}'::jsonb
    ),
    (
      'English',
      'Vocabulary',
      'Vocabulary',
      'short_text',
      'What is a one-word synonym for "brief"?',
      '[]'::jsonb,
      '["concise","short"]'::jsonb,
      'Concise means brief but clear.',
      '{}'::jsonb
    ),
    (
      'English',
      'Reading Comprehension',
      'Reading Comprehension',
      'mcq',
      'If a passage says an experiment was "inconclusive", what does that most nearly mean?',
      '[{"id":"a","text":"It proved the hypothesis.","isCorrect":false},{"id":"b","text":"It gave no clear final answer.","isCorrect":true},{"id":"c","text":"It was fraudulent.","isCorrect":false},{"id":"d","text":"It was repeated twice.","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Inconclusive means the evidence did not settle the issue clearly.',
      '{}'::jsonb
    ),
    (
      'English',
      'Grammar',
      'Grammar',
      'mcq',
      'Which word is an adjective in the sentence "The quick fox jumped"?',
      '[{"id":"a","text":"fox","isCorrect":false},{"id":"b","text":"jumped","isCorrect":false},{"id":"c","text":"quick","isCorrect":true},{"id":"d","text":"the","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Quick describes the noun fox, so it is an adjective.',
      '{}'::jsonb
    ),
    (
      'English',
      'Vocabulary',
      'Vocabulary',
      'mcq',
      'Choose the antonym of "expand".',
      '[{"id":"a","text":"stretch","isCorrect":false},{"id":"b","text":"contract","isCorrect":true},{"id":"c","text":"develop","isCorrect":false},{"id":"d","text":"increase","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Contract means to become smaller or narrower, the opposite of expand.',
      '{}'::jsonb
    ),
    (
      'Physics',
      'Mechanics',
      'Mechanics',
      'mcq',
      'What is the SI unit of force?',
      '[{"id":"a","text":"Joule","isCorrect":false},{"id":"b","text":"Pascal","isCorrect":false},{"id":"c","text":"Newton","isCorrect":true},{"id":"d","text":"Watt","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Force is measured in newtons in the SI system.',
      '{}'::jsonb
    ),
    (
      'Physics',
      'Mechanics',
      'Mechanics',
      'short_text',
      'What is the acceleration due to gravity near Earth usually approximated as in m/s^2?',
      '[]'::jsonb,
      '["9.8","9.8 m/s^2","9.8 m/s2"]'::jsonb,
      'Near the Earth surface, g is approximately 9.8 m/s^2.',
      '{}'::jsonb
    ),
    (
      'Physics',
      'Thermodynamics',
      'Thermodynamics',
      'mcq',
      'Which law of thermodynamics states that energy cannot be created or destroyed?',
      '[{"id":"a","text":"Zeroth law","isCorrect":false},{"id":"b","text":"First law","isCorrect":true},{"id":"c","text":"Second law","isCorrect":false},{"id":"d","text":"Third law","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'The first law is the law of conservation of energy.',
      '{}'::jsonb
    ),
    (
      'Physics',
      'Optics',
      'Optics',
      'mcq',
      'Which type of lens is thicker at the center than at the edges?',
      '[{"id":"a","text":"Concave lens","isCorrect":false},{"id":"b","text":"Convex lens","isCorrect":true},{"id":"c","text":"Plano lens","isCorrect":false},{"id":"d","text":"Cylindrical lens","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'A convex lens bulges outward and is thicker in the middle.',
      '{}'::jsonb
    ),
    (
      'Physics',
      'Modern Physics',
      'Modern Physics',
      'mcq',
      'Who proposed the photoelectric effect explanation using light quanta?',
      '[{"id":"a","text":"Newton","isCorrect":false},{"id":"b","text":"Einstein","isCorrect":true},{"id":"c","text":"Bohr","isCorrect":false},{"id":"d","text":"Faraday","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Einstein explained the photoelectric effect using photons.',
      '{}'::jsonb
    ),
    (
      'Chemistry',
      'Physical Chemistry',
      'Physical Chemistry',
      'mcq',
      'What is the pH of a neutral solution at 25 degrees Celsius?',
      '[{"id":"a","text":"0","isCorrect":false},{"id":"b","text":"5","isCorrect":false},{"id":"c","text":"7","isCorrect":true},{"id":"d","text":"14","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'A neutral aqueous solution has pH 7 at 25 degrees Celsius.',
      '{}'::jsonb
    ),
    (
      'Chemistry',
      'Organic Chemistry',
      'Organic Chemistry',
      'short_text',
      'What is the simplest hydrocarbon with one carbon atom?',
      '[]'::jsonb,
      '["methane"]'::jsonb,
      'Methane is the simplest alkane and contains one carbon atom.',
      '{}'::jsonb
    ),
    (
      'Chemistry',
      'Inorganic Chemistry',
      'Inorganic Chemistry',
      'mcq',
      'What is the chemical symbol for sodium?',
      '[{"id":"a","text":"So","isCorrect":false},{"id":"b","text":"Na","isCorrect":true},{"id":"c","text":"S","isCorrect":false},{"id":"d","text":"Sd","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'The symbol Na comes from the Latin name natrium.',
      '{}'::jsonb
    ),
    (
      'Chemistry',
      'Physical Chemistry',
      'Physical Chemistry',
      'mcq',
      'Which gas is evolved when an acid reacts with a carbonate?',
      '[{"id":"a","text":"Oxygen","isCorrect":false},{"id":"b","text":"Nitrogen","isCorrect":false},{"id":"c","text":"Carbon dioxide","isCorrect":true},{"id":"d","text":"Hydrogen chloride","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Acids reacting with carbonates release carbon dioxide gas.',
      '{}'::jsonb
    ),
    (
      'Chemistry',
      'Organic Chemistry',
      'Organic Chemistry',
      'mcq',
      'Which functional group characterizes alcohols?',
      '[{"id":"a","text":"-COOH","isCorrect":false},{"id":"b","text":"-OH","isCorrect":true},{"id":"c","text":"-CHO","isCorrect":false},{"id":"d","text":"-NH2","isCorrect":false}]'::jsonb,
      '[]'::jsonb,
      'Alcohols contain the hydroxyl functional group.',
      '{}'::jsonb
    )
) as new_rows(subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
where not exists (
  select 1
  from questions existing
  where existing.subject = new_rows.subject
    and existing.prompt = new_rows.prompt
);
