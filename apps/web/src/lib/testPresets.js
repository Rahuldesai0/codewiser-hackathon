export const timerMinuteOptions = [15, 30, 45, 60, 90, 120, 180];

export const testPresets = [
  {
    key: "custom",
    label: "Custom",
    description: "Pick any subjects, size, and timer settings yourself.",
    subjects: [],
    questionTarget: 20,
    batchSize: 5,
    timerEnabled: false,
    timerDurationMinutes: 0
  },
  {
    key: "gate-cse",
    label: "GATE CSE",
    description: "Computer science mix with no timer by default.",
    subjects: ["OS", "DBMS", "COA", "CN", "DSA", "Maths", "TOC", "Miscellaneous CS"],
    questionTarget: 30,
    batchSize: 5,
    timerEnabled: false,
    timerDurationMinutes: 180
  },
  {
    key: "jee",
    label: "JEE",
    description: "Physics, Chemistry, and general mathematics with a timed-test default.",
    subjects: ["Physics", "Chemistry", "General Maths"],
    questionTarget: 15,
    batchSize: 5,
    timerEnabled: true,
    timerDurationMinutes: 180
  },
  {
    key: "gre",
    label: "GRE",
    description: "English and quantitative practice with an optional timed mode.",
    subjects: ["English", "General Maths"],
    questionTarget: 10,
    batchSize: 5,
    timerEnabled: true,
    timerDurationMinutes: 120
  }
];

export function getPreset(key) {
  return testPresets.find((preset) => preset.key === key) || testPresets[0];
}
