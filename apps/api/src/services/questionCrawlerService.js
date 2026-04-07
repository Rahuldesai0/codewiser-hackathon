import crypto from "node:crypto";
import { config } from "../config.js";
import { normalizeQuestion, uniqueStrings } from "../utils.js";

const SUBJECT_PROFILES = {
  OS: [
    {
      topic: "Process Management",
      subtopic: "Scheduling",
      query: "operating system scheduling round robin shortest job first priority scheduling"
    },
    {
      topic: "Process Management",
      subtopic: "Deadlocks",
      query: "operating system deadlock banker safe state resource allocation graph"
    },
    {
      topic: "Memory Management",
      subtopic: "Paging",
      query: "operating system paging page replacement page fault fifo lru optimal"
    },
    {
      topic: "Synchronization",
      subtopic: "Semaphores",
      query: "operating system semaphore mutual exclusion critical section producer consumer"
    }
  ],
  DBMS: [
    {
      topic: "Relational Model",
      subtopic: "Normalization",
      query: "dbms normalization 2nf 3nf bcnf functional dependency"
    },
    {
      topic: "Transaction Management",
      subtopic: "ACID",
      query: "dbms acid atomicity isolation durability serializability dirty read"
    },
    {
      topic: "Indexing",
      subtopic: "B+ Trees",
      query: "dbms b+ tree index leaf node range query fan out"
    },
    {
      topic: "Concurrency Control",
      subtopic: "Locking",
      query: "dbms locking two phase locking strict 2pl shared lock exclusive lock"
    }
  ],
  COA: [
    {
      topic: "Digital Logic",
      subtopic: "Boolean Algebra",
      query: "computer organization boolean algebra karnaugh map logic gates minterm maxterm"
    },
    {
      topic: "Processor Organization",
      subtopic: "Pipelining",
      query: "computer organization pipelining hazards forwarding stalls throughput latency"
    },
    {
      topic: "Memory Organization",
      subtopic: "Cache Memory",
      query: "computer organization cache memory mapping cache hit miss write through write back"
    },
    {
      topic: "Instruction Set Architecture",
      subtopic: "Addressing Modes",
      query: "computer organization addressing modes immediate direct indirect indexed register"
    }
  ],
  CN: [
    {
      topic: "Network Layers",
      subtopic: "OSI Model",
      query: "computer networks osi model transport network data link physical application"
    },
    {
      topic: "Transport Layer",
      subtopic: "TCP",
      query: "computer networks tcp sliding window congestion control reliable transport"
    },
    {
      topic: "Network Layer",
      subtopic: "Routing",
      query: "computer networks routing link state distance vector dijkstra rip ospf"
    },
    {
      topic: "Application Layer",
      subtopic: "DNS and HTTP",
      query: "computer networks dns http https cookies caching request response"
    }
  ],
  Maths: [
    {
      topic: "Discrete Mathematics",
      subtopic: "Logic",
      query: "discrete mathematics propositional logic predicate logic implication equivalence"
    },
    {
      topic: "Discrete Mathematics",
      subtopic: "Relations and Functions",
      query: "discrete mathematics relation equivalence relation function onto one one bijection"
    },
    {
      topic: "Combinatorics",
      subtopic: "Counting",
      query: "discrete mathematics permutations combinations pigeonhole principle counting"
    },
    {
      topic: "Graph Theory",
      subtopic: "Trees and Connectivity",
      query: "discrete mathematics graph theory trees spanning tree connectivity degree"
    }
  ],
  "General Maths": [
    {
      topic: "Arithmetic",
      subtopic: "Arithmetic",
      query: "arithmetic percentages ratio proportion simplification averages"
    },
    {
      topic: "Algebra",
      subtopic: "Algebra",
      query: "algebra linear equations quadratic equations expressions inequalities"
    },
    {
      topic: "Geometry",
      subtopic: "Geometry",
      query: "geometry triangles circles mensuration angle area perimeter"
    },
    {
      topic: "Probability",
      subtopic: "Probability",
      query: "probability combinations permutations events dice coins"
    },
    {
      topic: "Statistics",
      subtopic: "Statistics",
      query: "statistics mean median mode standard deviation variance probability distribution"
    }
  ],
  English: [
    {
      topic: "Grammar",
      subtopic: "Grammar",
      query: "english grammar tenses articles prepositions subject verb agreement"
    },
    {
      topic: "Vocabulary",
      subtopic: "Vocabulary",
      query: "english vocabulary synonym antonym word meaning usage"
    },
    {
      topic: "Reading Comprehension",
      subtopic: "Reading Comprehension",
      query: "english reading comprehension passage inference tone main idea"
    }
  ],
  Physics: [
    {
      topic: "Mechanics",
      subtopic: "Mechanics",
      query: "physics mechanics force motion work energy momentum"
    },
    {
      topic: "Thermodynamics",
      subtopic: "Thermodynamics",
      query: "physics thermodynamics heat temperature entropy laws"
    },
    {
      topic: "Optics",
      subtopic: "Optics",
      query: "physics optics mirrors lenses refraction reflection"
    },
    {
      topic: "Modern Physics",
      subtopic: "Modern Physics",
      query: "modern physics atoms nuclei photoelectric effect bohr"
    },
  ],
  Astronomy: [
    {
      topic: "Celestial Mechanics",
      subtopic: "Orbital Motion",
      query: "astronomy orbital motion kepler laws gravitation planets satellites"
    },
    {
      topic: "Stars and Galaxies",
      subtopic: "Stellar Evolution",
      query: "astronomy stars galaxies stellar evolution red giant white dwarf supernova"
    },
    {
      topic: "Observational Astronomy",
      subtopic: "Telescopes",
      query: "astronomy telescopes light year apparent magnitude spectroscopy"
    }
  ],
  Chemistry: [
    {
      topic: "Physical Chemistry",
      subtopic: "Physical Chemistry",
      query: "physical chemistry equilibrium thermodynamics kinetics electrochemistry"
    },
    {
      topic: "Organic Chemistry",
      subtopic: "Organic Chemistry",
      query: "organic chemistry hydrocarbons reactions functional groups isomerism"
    },
    {
      topic: "Inorganic Chemistry",
      subtopic: "Inorganic Chemistry",
      query: "inorganic chemistry periodic table bonding coordination compounds"
    }
  ],
  Biology: [
    {
      topic: "Cell Biology",
      subtopic: "Cell Structure",
      query: "biology cell structure organelles membrane nucleus mitochondria"
    },
    {
      topic: "Genetics",
      subtopic: "Inheritance",
      query: "biology genetics inheritance dna rna gene chromosome mendel"
    },
    {
      topic: "Human Physiology",
      subtopic: "Systems",
      query: "biology human physiology circulatory respiratory digestive nervous system"
    }
  ],
  "Computer Security": [
    {
      topic: "Cryptography",
      subtopic: "Cryptography",
      query: "computer security cryptography hashing encryption symmetric asymmetric digital signature"
    },
    {
      topic: "Network Security",
      subtopic: "Network Security",
      query: "computer security network security firewalls tls ssl ids ips attacks"
    },
    {
      topic: "Application Security",
      subtopic: "Application Security",
      query: "computer security application security sql injection xss csrf secure coding"
    },
    {
      topic: "Authentication and Access",
      subtopic: "Authentication and Access",
      query: "computer security authentication authorization access control mfa kerberos oauth"
    }
  ],
  "Machine Learning": [
    {
      topic: "Supervised Learning",
      subtopic: "Classification",
      query: "machine learning classification logistic regression decision tree svm labels"
    },
    {
      topic: "Supervised Learning",
      subtopic: "Regression",
      query: "machine learning regression linear regression prediction continuous target"
    },
    {
      topic: "Unsupervised Learning",
      subtopic: "Clustering",
      query: "machine learning clustering k means hierarchical clustering unsupervised"
    },
    {
      topic: "Model Evaluation",
      subtopic: "Metrics",
      query: "machine learning precision recall f1 accuracy cross validation overfitting"
    }
  ],
  TOC: [
    {
      topic: "Formal Languages",
      subtopic: "Regular Languages",
      query: "theory of computation regular language regular expression finite automata dfa nfa"
    },
    {
      topic: "Automata",
      subtopic: "Pushdown Automata",
      query: "theory of computation pushdown automata context free grammar pda stack"
    },
    {
      topic: "Computability",
      subtopic: "Turing Machines",
      query: "theory of computation turing machine decidable undecidable halting problem"
    },
    {
      topic: "Grammar",
      subtopic: "Context Free Grammar",
      query: "theory of computation context free grammar derivation ambiguity chomsky normal form"
    }
  ],
  "Miscellaneous CS": [
    {
      topic: "Programming Languages",
      subtopic: "Language Concepts",
      query: "programming languages compiler interpreter static typing dynamic typing polymorphism"
    },
    {
      topic: "Software Engineering",
      subtopic: "Testing and Design",
      query: "software engineering unit testing integration testing cohesion coupling design patterns"
    },
    {
      topic: "Security",
      subtopic: "Basics",
      query: "computer security authentication authorization hashing encryption symmetric asymmetric"
    },
    {
      topic: "Algorithms and Analysis",
      subtopic: "Asymptotics",
      query: "computer science asymptotic analysis big o omega theta recurrence"
    }
  ],
  DSA: [
    {
      topic: "Arrays",
      subtopic: "Searching",
      query: "data structures arrays binary search linear search lower bound upper bound"
    },
    {
      topic: "Arrays",
      subtopic: "Hashing",
      query: "data structures arrays hashing prefix sum sliding window frequency map"
    },
    {
      topic: "Linked Lists",
      subtopic: "Operations",
      query: "linked list insertion deletion reversal cycle detection"
    },
    {
      topic: "Stacks and Queues",
      subtopic: "Stack",
      query: "stack postfix infix prefix balanced parentheses monotonic stack"
    },
    {
      topic: "Stacks and Queues",
      subtopic: "Queue",
      query: "queue deque circular queue breadth first search"
    },
    {
      topic: "Trees",
      subtopic: "Binary Search Tree",
      query: "data structures binary search tree inorder traversal skewed bst leaf node"
    },
    {
      topic: "Trees",
      subtopic: "Binary Tree",
      query: "binary tree preorder postorder inorder height leaf node traversal"
    },
    {
      topic: "Sorting",
      subtopic: "Divide and Conquer",
      query: "merge sort quicksort divide and conquer pivot stable sorting"
    },
    {
      topic: "Sorting",
      subtopic: "Heap Sort",
      query: "heap sort heapify stable sorting complexity"
    },
    {
      topic: "Graphs",
      subtopic: "Traversal",
      query: "graph traversal bfs dfs shortest path unweighted graph cycle detection"
    },
    {
      topic: "Graphs",
      subtopic: "Shortest Path",
      query: "dijkstra shortest path bellman ford weighted graph"
    },
    {
      topic: "Heaps",
      subtopic: "Priority Queue",
      query: "binary heap priority queue max heap min heap insert complexity"
    },
    {
      topic: "Dynamic Programming",
      subtopic: "DP Basics",
      query: "dynamic programming memoization tabulation overlapping subproblems optimal substructure"
    },
    {
      topic: "Greedy",
      subtopic: "Greedy Strategy",
      query: "greedy algorithm interval scheduling activity selection huffman"
    },
    {
      topic: "Recursion",
      subtopic: "Recursion",
      query: "recursion base case recurrence backtracking"
    }
  ]
};

const TITLE_PATTERN = /^(what|which|who|when|where|why|how|name|in|for|if)\b/i;
const GENERIC_CANDIDATES = new Set([
  "yes",
  "no",
  "it",
  "this",
  "that",
  "they",
  "them",
  "there",
  "here",
  "true",
  "false",
  "example",
  "code"
]);
const COMPLEXITY_KEYWORDS = new Set([
  "acid",
  "amortized",
  "anomaly",
  "atomicity",
  "banker",
  "bfs",
  "bcnf",
  "complexity",
  "concurrency",
  "deadlock",
  "decomposition",
  "dependency",
  "dfs",
  "durability",
  "fault",
  "fifo",
  "graph",
  "heap",
  "index",
  "inorder",
  "isolation",
  "locking",
  "normalization",
  "optimal",
  "paging",
  "pivot",
  "priority",
  "quicksort",
  "rollback",
  "schedule",
  "semaphore",
  "serializability",
  "skewed",
  "superkey",
  "traversal"
]);
const ADVANCED_TAG_HINTS = new Set([
  "algorithms",
  "binary-search-tree",
  "b-tree",
  "c++",
  "concurrency",
  "database",
  "deadlock",
  "dynamic-programming",
  "graph",
  "heap",
  "indexing",
  "locking",
  "normalization",
  "operating-system",
  "postgresql",
  "scheduling",
  "sql",
  "tree"
]);
const DIFFICULTY_LABELS = ["easy", "medium", "hard"];
export const supportedCrawlerSubjects = Object.freeze(Object.keys(SUBJECT_PROFILES));
const KEYWORD_STOP_WORDS = new Set([
  "a",
  "algorithm",
  "all",
  "and",
  "answer",
  "answers",
  "are",
  "as",
  "at",
  "based",
  "best",
  "by",
  "case",
  "computer",
  "concept",
  "correct",
  "data",
  "does",
  "find",
  "following",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "one",
  "or",
  "programming",
  "question",
  "released",
  "structures",
  "subject",
  "system",
  "technical",
  "the",
  "these",
  "this",
  "to",
  "what",
  "which",
  "with",
  "year"
]);
const GENERIC_CLASSIFICATION_TOKENS = new Set([
  "algorithm",
  "algorithms",
  "basics",
  "computer",
  "computers",
  "concept",
  "concepts",
  "data",
  "programming",
  "question",
  "questions",
  "science",
  "structure",
  "structures",
  "subject",
  "subjects",
  "system",
  "systems",
  "technical",
  "theory"
]);
const TRIVIA_SIGNAL_TOKENS = new Set([
  "c#",
  "c++",
  "csharp",
  "creator",
  "founded",
  "invented",
  "inventor",
  "java",
  "javascript",
  "language",
  "python",
  "release",
  "released",
  "ruby",
  "timeline",
  "version",
  "year"
]);
const TRIVIA_SIGNAL_PATTERNS = [
  /\bwhen was\b/i,
  /\bwhich year\b/i,
  /\bwho created\b/i,
  /\bwho invented\b/i,
  /\bfirst appeared\b/i,
  /\breleased\b/i
];
const OPEN_TRIVIA_CATEGORY_COMPUTERS = 18;
const QUIZ_API_DIFFICULTIES = ["easy", "medium", "hard"];
const HUGGINGFACE_ANSWER_KEY_TO_INDEX = {
  A: 0,
  B: 1,
  C: 2,
  D: 3
};
const HUGGINGFACE_DOMAIN_SUBJECT_MAP = {
  "computer network": "CN",
  "computer networks": "CN",
  "computer security": "Computer Security",
  "computer science": "Miscellaneous CS",
  "data structure and algorithm": "DSA",
  "data structures and algorithms": "DSA",
  "database": "DBMS",
  "dbms": "DBMS",
  "machine learning": "Machine Learning",
  "operating system": "OS",
  "operating systems": "OS",
  "computer organization and architecture": "COA",
  "computer organization": "COA",
  "computer architecture": "COA",
  "discrete mathematics": "Maths",
  astronomy: "Astronomy",
  biology: "Biology",
  "theory of computation": "TOC",
  "miscellaneous cs": "Miscellaneous CS"
};
const COMPUTER_CLASSIFICATION_SUBJECTS = [
  "OS",
  "DBMS",
  "COA",
  "CN",
  "DSA",
  "TOC",
  "Miscellaneous CS",
  "Computer Security",
  "Machine Learning"
];
const MMLU_CONFIGS = [
  {
    configName: "abstract_algebra",
    subject: "General Maths",
    topic: "Algebra",
    subtopic: "Algebra"
  },
  {
    configName: "astronomy",
    subject: "Astronomy",
    topic: "Celestial Mechanics",
    subtopic: "Orbital Motion"
  },
  {
    configName: "college_biology",
    subject: "Biology",
    topic: "Genetics",
    subtopic: "Inheritance"
  },
  {
    configName: "college_mathematics",
    subject: "General Maths",
    topic: "Algebra",
    subtopic: "Algebra"
  },
  {
    configName: "elementary_mathematics",
    subject: "General Maths",
    topic: "Arithmetic",
    subtopic: "Arithmetic"
  },
  {
    configName: "high_school_mathematics",
    subject: "General Maths",
    topic: "Algebra",
    subtopic: "Algebra"
  },
  {
    configName: "high_school_biology",
    subject: "Biology",
    topic: "Cell Biology",
    subtopic: "Cell Structure"
  },
  {
    configName: "high_school_statistics",
    subject: "General Maths",
    topic: "Statistics",
    subtopic: "Statistics"
  },
  {
    configName: "formal_logic",
    subject: "Maths",
    topic: "Discrete Mathematics",
    subtopic: "Logic"
  },
  {
    configName: "college_physics",
    subject: "Physics",
    topic: "Mechanics",
    subtopic: "Mechanics"
  },
  {
    configName: "conceptual_physics",
    subject: "Physics",
    topic: "Mechanics",
    subtopic: "Mechanics"
  },
  {
    configName: "high_school_physics",
    subject: "Physics",
    topic: "Mechanics",
    subtopic: "Mechanics"
  },
  {
    configName: "college_chemistry",
    subject: "Chemistry",
    topic: "Physical Chemistry",
    subtopic: "Physical Chemistry"
  },
  {
    configName: "high_school_chemistry",
    subject: "Chemistry",
    topic: "Physical Chemistry",
    subtopic: "Physical Chemistry"
  },
  {
    configName: "college_computer_science",
    subject: "Miscellaneous CS",
    allowedSubjects: COMPUTER_CLASSIFICATION_SUBJECTS,
    topic: "Computer Science Fundamentals",
    subtopic: "Language Concepts",
    strictAllowedSubjects: true
  },
  {
    configName: "high_school_computer_science",
    subject: "Miscellaneous CS",
    allowedSubjects: COMPUTER_CLASSIFICATION_SUBJECTS,
    topic: "Computer Science Fundamentals",
    subtopic: "Language Concepts",
    strictAllowedSubjects: true
  },
  {
    configName: "computer_security",
    subject: "Computer Security",
    topic: "Cryptography",
    subtopic: "Cryptography"
  },
  {
    configName: "machine_learning",
    subject: "Machine Learning",
    topic: "Supervised Learning",
    subtopic: "Classification"
  }
];
const SUBTOPIC_ALIAS_MAP = {
  OS: {
    Scheduling: ["cpu scheduling", "round robin", "priority scheduling", "sjf", "fcfs"],
    Deadlocks: ["banker", "resource allocation", "safe state", "deadlock prevention"],
    Paging: ["page replacement", "page fault", "lru", "fifo", "virtual memory"],
    Semaphores: ["critical section", "producer consumer", "mutex", "synchronization"]
  },
  DBMS: {
    Normalization: ["1nf", "2nf", "3nf", "bcnf", "functional dependency"],
    ACID: ["transaction", "serializability", "dirty read", "isolation", "durability"],
    "B+ Trees": ["indexing", "index", "b tree", "b+tree", "range query"],
    Locking: ["2pl", "two phase locking", "shared lock", "exclusive lock", "concurrency control"]
  },
  COA: {
    "Boolean Algebra": ["logic gates", "k map", "karnaugh", "minterm", "maxterm"],
    Pipelining: ["pipeline hazard", "forwarding", "stall", "throughput", "latency"],
    "Cache Memory": ["cache mapping", "cache hit", "cache miss", "write through", "write back"],
    "Addressing Modes": ["immediate", "direct", "indirect", "indexed", "register addressing"]
  },
  CN: {
    "OSI Model": ["osi", "layers", "layer model", "network layers"],
    TCP: ["transport layer", "sliding window", "congestion control", "flow control", "acknowledgement"],
    Routing: ["link state", "distance vector", "ospf", "rip", "dijkstra", "routing algorithm"],
    "DNS and HTTP": ["application layer", "dns", "http", "https", "cookies", "web protocol"]
  },
  Maths: {
    Logic: ["predicate logic", "propositional logic", "implication", "equivalence", "truth table"],
    "Relations and Functions": ["bijection", "onto", "one one", "equivalence relation", "mapping"],
    Counting: ["permutation", "combination", "pigeonhole", "counting"],
    "Trees and Connectivity": ["graph theory", "spanning tree", "connectivity", "degree"]
  },
  "General Maths": {
    Arithmetic: ["percentage", "ratio", "proportion", "average", "profit loss"],
    Algebra: ["equation", "quadratic", "inequality", "expression", "variable"],
    Geometry: ["triangle", "circle", "angle", "area", "perimeter"],
    Probability: ["probability", "event", "sample space", "dice", "coin"],
    Statistics: ["statistics", "mean", "median", "mode", "variance", "standard deviation"]
  },
  English: {
    Grammar: ["tense", "article", "preposition", "subject verb agreement", "adjective"],
    Vocabulary: ["synonym", "antonym", "meaning", "word usage", "idiom"],
    "Reading Comprehension": ["passage", "inference", "tone", "main idea", "author"]
  },
  Physics: {
    Mechanics: ["force", "motion", "velocity", "acceleration", "momentum"],
    Thermodynamics: ["heat", "temperature", "entropy", "law of thermodynamics", "engine"],
    Optics: ["reflection", "refraction", "lens", "mirror", "focal length"],
    "Modern Physics": ["photoelectric", "atom", "nucleus", "bohr", "radioactivity"]
  },
  Astronomy: {
    "Orbital Motion": ["orbit", "orbital", "kepler", "gravitation", "planet", "satellite"],
    "Stellar Evolution": ["star", "stellar", "supernova", "red giant", "white dwarf", "galaxy"],
    Telescopes: ["telescope", "spectroscopy", "magnitude", "light year", "observation"]
  },
  Chemistry: {
    "Physical Chemistry": ["equilibrium", "kinetics", "electrochemistry", "ph", "enthalpy"],
    "Organic Chemistry": ["hydrocarbon", "functional group", "isomer", "reaction mechanism"],
    "Inorganic Chemistry": ["periodic table", "bonding", "coordination", "salt", "metal"]
  },
  Biology: {
    "Cell Structure": ["cell", "organelle", "membrane", "nucleus", "mitochondria"],
    Inheritance: ["genetics", "gene", "dna", "rna", "chromosome", "mendel"],
    Systems: ["physiology", "circulatory", "respiratory", "digestive", "nervous system"]
  },
  "Computer Security": {
    Cryptography: ["encryption", "decryption", "rsa", "aes", "hashing", "digital signature"],
    "Network Security": ["tls", "ssl", "firewall", "ids", "ips", "dos"],
    "Application Security": ["sql injection", "xss", "csrf", "secure coding", "sanitization"],
    "Authentication and Access": ["authentication", "authorization", "access control", "mfa", "oauth", "kerberos"]
  },
  "Machine Learning": {
    Classification: ["classification", "logistic regression", "decision tree", "svm", "labels"],
    Regression: ["regression", "linear regression", "continuous target", "prediction"],
    Clustering: ["clustering", "k means", "hierarchical clustering", "unsupervised"],
    Metrics: ["precision", "recall", "f1", "accuracy", "cross validation", "overfitting"]
  },
  TOC: {
    "Regular Languages": ["dfa", "nfa", "regular expression", "finite automata"],
    "Pushdown Automata": ["pda", "stack automata", "context free language"],
    "Turing Machines": ["decidable", "undecidable", "halting problem", "tm"],
    "Context Free Grammar": ["cfg", "ambiguity", "chomsky normal form", "derivation", "grammar"]
  },
  "Miscellaneous CS": {
    "Language Concepts": ["compiler", "interpreter", "typing", "polymorphism", "programming language"],
    "Testing and Design": ["unit testing", "integration testing", "cohesion", "coupling", "design patterns"],
    Basics: ["authentication", "authorization", "hashing", "encryption", "security"],
    Asymptotics: ["big o", "omega", "theta", "recurrence", "time complexity"]
  },
  DSA: {
    Searching: ["binary search", "linear search", "searching"],
    Hashing: ["prefix sum", "sliding window", "frequency map", "hash table"],
    Operations: ["linked list", "reversal", "cycle detection", "insertion", "deletion"],
    Stack: ["stack", "postfix", "infix", "prefix", "balanced parentheses", "monotonic stack"],
    Queue: ["queue", "deque", "circular queue", "fifo queue"],
    "Binary Search Tree": ["bst", "binary search tree", "successor", "predecessor", "ordered tree"],
    "Binary Tree": ["binary tree", "preorder", "postorder", "inorder traversal", "height of tree", "leaf node"],
    "Divide and Conquer": ["merge sort", "quicksort", "pivot", "divide and conquer"],
    "Heap Sort": ["heap sort", "heapify", "sorting with heap"],
    Traversal: ["bfs", "dfs", "graph traversal", "adjacency list", "adjacency matrix", "edge", "vertex"],
    "Shortest Path": ["dijkstra", "bellman ford", "shortest path", "weighted graph"],
    "Priority Queue": ["priority queue", "binary heap", "max heap", "min heap", "extract min", "extract max"],
    "DP Basics": ["memoization", "tabulation", "optimal substructure", "overlapping subproblems"],
    "Greedy Strategy": ["greedy", "activity selection", "huffman", "interval scheduling"],
    Recursion: ["base case", "backtracking", "recursive"]
  }
};
const TOPIC_ALIAS_MAP = {
  OS: {
    "Process Management": ["process", "cpu scheduling", "context switch", "deadlock", "process state"],
    "Memory Management": ["memory", "page", "paging", "virtual memory", "page fault"],
    Synchronization: ["semaphore", "mutex", "critical section", "synchronization", "producer consumer"]
  },
  DBMS: {
    "Relational Model": ["relation", "schema", "normalization", "functional dependency"],
    "Transaction Management": ["transaction", "acid", "serializability", "rollback", "commit"],
    Indexing: ["index", "b tree", "b+ tree", "range query"],
    "Concurrency Control": ["locking", "lock", "2pl", "shared lock", "exclusive lock"]
  },
  COA: {
    "Digital Logic": ["logic gate", "boolean", "k map", "minterm", "maxterm"],
    "Processor Organization": ["pipeline", "hazard", "forwarding", "throughput", "stall"],
    "Memory Organization": ["cache", "cache memory", "mapping", "hit", "miss"],
    "Instruction Set Architecture": ["addressing mode", "instruction", "register", "direct", "indirect"]
  },
  CN: {
    "Network Layers": ["osi", "layer", "network layer model", "tcp ip"],
    "Transport Layer": ["tcp", "udp", "sliding window", "flow control", "congestion control"],
    "Network Layer": ["routing", "router", "path", "packet forwarding", "dijkstra"],
    "Application Layer": ["dns", "http", "https", "application layer", "web protocol"]
  },
  Maths: {
    "Discrete Mathematics": ["logic", "relation", "function", "predicate", "bijection"],
    Combinatorics: ["counting", "permutation", "combination", "pigeonhole"],
    "Graph Theory": ["graph", "tree", "connectivity", "spanning tree", "degree"]
  },
  "General Maths": {
    Arithmetic: ["arithmetic", "percentage", "ratio", "average", "number"],
    Algebra: ["algebra", "equation", "variable", "quadratic", "expression"],
    Geometry: ["geometry", "triangle", "circle", "angle", "mensuration"],
    Probability: ["probability", "combinatorics", "event", "chance", "random"],
    Statistics: ["statistics", "mean", "median", "mode", "variance", "deviation"]
  },
  English: {
    Grammar: ["grammar", "sentence", "tense", "article", "preposition"],
    Vocabulary: ["vocabulary", "word", "synonym", "antonym", "meaning"],
    "Reading Comprehension": ["reading", "comprehension", "passage", "inference", "tone"]
  },
  Physics: {
    Mechanics: ["mechanics", "motion", "force", "energy", "momentum"],
    Thermodynamics: ["thermodynamics", "heat", "temperature", "entropy", "engine"],
    Optics: ["optics", "lens", "mirror", "reflection", "refraction"],
    "Modern Physics": ["modern physics", "atom", "nucleus", "photoelectric", "bohr"]
  },
  Astronomy: {
    "Celestial Mechanics": ["astronomy", "orbit", "kepler", "gravitation", "planet", "satellite"],
    "Stars and Galaxies": ["star", "stellar", "galaxy", "supernova", "white dwarf"],
    "Observational Astronomy": ["telescope", "spectroscopy", "magnitude", "observation", "light year"]
  },
  Chemistry: {
    "Physical Chemistry": ["physical chemistry", "equilibrium", "kinetics", "electrochemistry", "thermodynamics"],
    "Organic Chemistry": ["organic chemistry", "hydrocarbon", "functional group", "reaction", "isomer"],
    "Inorganic Chemistry": ["inorganic chemistry", "periodic table", "bonding", "compound", "salt"]
  },
  Biology: {
    "Cell Biology": ["cell biology", "cell", "organelle", "membrane", "nucleus"],
    Genetics: ["genetics", "gene", "dna", "rna", "chromosome", "inheritance"],
    "Human Physiology": ["physiology", "circulatory", "respiratory", "digestive", "nervous"]
  },
  "Computer Security": {
    Cryptography: ["cryptography", "encryption", "decryption", "hashing", "digital signature"],
    "Network Security": ["network security", "tls", "ssl", "firewall", "intrusion", "attack"],
    "Application Security": ["application security", "sql injection", "xss", "csrf", "secure coding"],
    "Authentication and Access": ["authentication", "authorization", "access control", "mfa", "oauth", "kerberos"]
  },
  "Machine Learning": {
    "Supervised Learning": ["machine learning", "classification", "regression", "training data", "labels"],
    "Unsupervised Learning": ["clustering", "unsupervised", "k means", "dimensionality reduction"],
    "Model Evaluation": ["precision", "recall", "f1", "accuracy", "cross validation", "overfitting"]
  },
  TOC: {
    "Formal Languages": ["regular language", "dfa", "nfa", "regular expression"],
    Automata: ["pda", "pushdown automata", "stack automata"],
    Computability: ["turing machine", "decidable", "undecidable", "halting problem"],
    Grammar: ["cfg", "context free grammar", "ambiguity", "derivation", "grammar"]
  },
  "Miscellaneous CS": {
    "Programming Languages": ["compiler", "interpreter", "typing", "polymorphism", "language"],
    "Software Engineering": ["testing", "design pattern", "cohesion", "coupling", "integration"],
    Security: ["security", "authentication", "authorization", "hashing", "encryption"],
    "Algorithms and Analysis": ["big o", "omega", "theta", "complexity", "asymptotic"]
  },
  DSA: {
    Arrays: ["array", "subarray", "search", "hashing", "prefix sum", "sliding window"],
    "Linked Lists": ["linked list", "node", "pointer", "cycle detection", "reverse list"],
    "Stacks and Queues": ["stack", "queue", "deque", "parentheses", "lifo", "fifo"],
    Trees: ["tree", "binary tree", "bst", "inorder", "preorder", "postorder", "leaf", "height"],
    Sorting: ["sort", "sorting", "merge sort", "quick sort", "quicksort", "heap sort", "partition"],
    Graphs: ["graph", "graphs", "edge", "edges", "vertex", "vertices", "bfs", "dfs", "adjacency"],
    Heaps: ["heap", "priority queue", "min heap", "max heap", "heapify"],
    "Dynamic Programming": ["dp", "memoization", "tabulation", "optimal substructure"],
    Greedy: ["greedy", "interval scheduling", "activity selection", "huffman"],
    Recursion: ["recursion", "recursive", "backtracking", "base case"]
  }
};
const HIERARCHICAL_CLUSTERING = Object.freeze({
  subjectHintBoost: 0.85,
  subjectCentroidWeight: 0.65,
  subjectLexicalWeight: 0.35,
  topicCentroidWeight: 0.48,
  topicLexicalWeight: 0.22,
  topicAliasWeight: 0.3,
  subtopicCentroidWeight: 0.42,
  subtopicLexicalWeight: 0.16,
  subtopicAliasWeight: 0.18,
  subtopicTopicWeight: 0.24,
  minimumSubjectConfidence: 0.32,
  minimumTopicConfidence: 0.28,
  minimumSubtopicConfidence: 0.32,
  minimumSubtopicMargin: 0.08,
  difficultyIterations: 16
});
const providerBackoffState = {
  stackexchange: {
    provider: "Stack Exchange API",
    until: null,
    reason: null,
    triggeredAt: null
  },
  opentdb: {
    provider: "Open Trivia DB",
    until: null,
    reason: null,
    triggeredAt: null
  },
  huggingface: {
    provider: "Hugging Face Dataset Server",
    until: null,
    reason: null,
    triggeredAt: null
  },
  mmlu: {
    provider: "Hugging Face MMLU Dataset",
    until: null,
    reason: null,
    triggeredAt: null
  },
  englishgrammar: {
    provider: "Hugging Face English Grammar Dataset",
    until: null,
    reason: null,
    triggeredAt: null
  },
  quizapi: {
    provider: "QuizAPI",
    until: null,
    reason: null,
    triggeredAt: null
  }
};

function nowIso() {
  return new Date().toISOString();
}

function getProviderState(providerKey) {
  return providerBackoffState[providerKey];
}

function setProviderBackoff(providerKey, reason) {
  const state = getProviderState(providerKey);
  if (!state) {
    return;
  }

  state.triggeredAt = nowIso();
  state.until = new Date(Date.now() + Math.max(config.crawlerProviderBackoffMs, 1000)).toISOString();
  state.reason = reason || "Provider rate limited the crawler.";
}

function clearProviderBackoff(providerKey) {
  const state = getProviderState(providerKey);
  if (!state) {
    return;
  }

  state.until = null;
  state.reason = null;
  state.triggeredAt = null;
}

function providerBackoffWarning(providerKey) {
  const state = getProviderState(providerKey);
  if (!state?.until) {
    return null;
  }

  if (Date.parse(state.until) <= Date.now()) {
    clearProviderBackoff(providerKey);
    return null;
  }

  return `${state.provider} is temporarily paused until ${state.until} after rate limiting: ${state.reason}`;
}

export function getCrawlerProviderStatus() {
  return Object.values(providerBackoffState).map((state) => ({
    provider: state.provider,
    backoffUntil: state.until,
    reason: state.reason,
    triggeredAt: state.triggeredAt
  }));
}

function buildApiUrl(path, params = {}) {
  const normalizedBase = config.stackExchangeApiBase.endsWith("/")
    ? config.stackExchangeApiBase
    : `${config.stackExchangeApiBase}/`;
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  const url = new URL(normalizedPath, normalizedBase);

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  if (config.stackExchangeKey) {
    url.searchParams.set("key", config.stackExchangeKey);
  }

  return url;
}

async function stackExchangeFetch(path, params = {}) {
  const skippedWarning = providerBackoffWarning("stackexchange");
  if (skippedWarning) {
    throw new Error(skippedWarning);
  }

  const response = await fetch(buildApiUrl(path, params));
  if (!response.ok) {
    if (response.status === 429) {
      setProviderBackoff("stackexchange", "HTTP 429 Too Many Requests");
    }
    throw new Error(`Stack Exchange API returned ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error_message) {
    throw new Error(payload.error_message);
  }

  clearProviderBackoff("stackexchange");
  return payload;
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<code>([\s\S]*?)<\/code>/gi, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, "");
}

function decodeUrlComponentSafe(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function tokenize(text) {
  return stripHtml(text)
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function keywordTokens(text) {
  return tokenize(text).filter((token) => token.length >= 3 && !KEYWORD_STOP_WORDS.has(token));
}

function normalizeTitle(title) {
  const text = stripHtml(title).replace(/\s+/g, " ").trim();
  if (!text) {
    return "";
  }

  if (/[?.!]$/.test(text)) {
    return text;
  }

  if (TITLE_PATTERN.test(text)) {
    return `${text}?`;
  }

  return `Identify the correct concept: ${text}`;
}

function mapProviderDifficultyLabel(input) {
  const value = String(input || "").toLowerCase();
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }
  return "medium";
}

function sanitizeCandidate(candidate) {
  const cleaned = String(candidate || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[^a-z0-9(+-]+/i, "")
    .replace(/[^a-z0-9)+#.\s-]+$/i, "");

  if (!cleaned) {
    return "";
  }

  const tokenCount = cleaned.split(/\s+/).length;
  if (tokenCount > 4) {
    return "";
  }

  const compact = compactText(cleaned);
  if (!compact || GENERIC_CANDIDATES.has(compact)) {
    return "";
  }

  return cleaned;
}

function extractCandidatesFromAnswer(html) {
  const candidates = [];
  const seen = new Set();
  const pushCandidate = (value) => {
    const cleaned = sanitizeCandidate(value);
    if (!cleaned) {
      return;
    }

    const compact = compactText(cleaned);
    if (seen.has(compact)) {
      return;
    }

    seen.add(compact);
    candidates.push(cleaned);
  };

  for (const match of String(html).matchAll(/<(?:strong|b|code)>([\s\S]*?)<\/(?:strong|b|code)>/gi)) {
    pushCandidate(stripHtml(match[1]));
  }

  const plainText = stripHtml(html);
  const sentences = plainText.split(/[.!?]/).map((entry) => entry.trim()).filter(Boolean);

  if (sentences[0]) {
    pushCandidate(sentences[0].split(/[,:;()-]/)[0]);
  }

  for (const sentence of sentences.slice(0, 3)) {
    const patterns = [
      /^([a-z0-9+.# -]{1,45})\s+(?:is|are|means|refers to)\b/i,
      /\bcalled\s+([a-z0-9+.# -]{1,45})$/i,
      /\bknown as\s+([a-z0-9+.# -]{1,45})$/i,
      /\buse(?:s|d)?\s+([a-z0-9+.# -]{1,45})$/i
    ];

    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match?.[1]) {
        pushCandidate(match[1]);
      }
    }
  }

  return candidates;
}

function createRemoteQuestionId(seed) {
  const digest = crypto.createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return -Number.parseInt(digest, 16);
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function euclideanDistance(left, right) {
  let total = 0;
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const delta = (left[index] || 0) - (right[index] || 0);
    total += delta * delta;
  }

  return Math.sqrt(total);
}

function meanVector(vectors) {
  if (!vectors.length) {
    return [0, 0, 0, 0];
  }

  const dimensions = vectors[0].length;
  const totals = new Array(dimensions).fill(0);

  for (const vector of vectors) {
    for (let index = 0; index < dimensions; index += 1) {
      totals[index] += vector[index] || 0;
    }
  }

  return totals.map((value) => value / vectors.length);
}

function chooseSeedCentroids(items, clusterCount) {
  const sorted = [...items].sort((left, right) => left.seed - right.seed);
  return Array.from({ length: clusterCount }, (_unused, index) => {
    const position = clusterCount === 1
      ? 0
      : Math.round((index * (sorted.length - 1)) / (clusterCount - 1));
    return [...sorted[position].vector];
  });
}

function assignDifficultyClusters(items) {
  if (!items.length) {
    return [];
  }

  const clusterCount = Math.min(3, items.length);
  if (clusterCount === 1) {
    return items.map(() => ({ cluster: 0, label: "medium" }));
  }

  let centroids = chooseSeedCentroids(items, clusterCount);
  let assignments = new Array(items.length).fill(-1);

  for (let iteration = 0; iteration < HIERARCHICAL_CLUSTERING.difficultyIterations; iteration += 1) {
    let changed = false;

    assignments = items.map((item, itemIndex) => {
      const cluster = centroids.reduce(
        (best, centroid, centroidIndex) => {
          const distance = euclideanDistance(item.vector, centroid);
          if (distance < best.distance) {
            return { cluster: centroidIndex, distance };
          }
          return best;
        },
        { cluster: 0, distance: Number.POSITIVE_INFINITY }
      ).cluster;

      if (cluster !== assignments[itemIndex]) {
        changed = true;
      }

      return cluster;
    });

    const nextCentroids = centroids.map((_centroid, centroidIndex) => {
      const members = items
        .filter((_item, itemIndex) => assignments[itemIndex] === centroidIndex)
        .map((item) => item.vector);

      return members.length ? meanVector(members) : centroids[centroidIndex];
    });

    centroids = nextCentroids;
    if (!changed) {
      break;
    }
  }

  const clusterScores = centroids.map((_centroid, centroidIndex) => {
    const members = items.filter((_item, itemIndex) => assignments[itemIndex] === centroidIndex);
    return {
      cluster: centroidIndex,
      score: average(members.map((item) => item.seed))
    };
  });

  const orderedClusters = [...clusterScores].sort((left, right) => left.score - right.score);
  const clusterToLabel = new Map();

  if (clusterCount === 2) {
    clusterToLabel.set(orderedClusters[0].cluster, "easy");
    clusterToLabel.set(orderedClusters[1].cluster, "hard");
  } else {
    orderedClusters.forEach((entry, index) => {
      clusterToLabel.set(entry.cluster, DIFFICULTY_LABELS[index] || "medium");
    });
  }

  return assignments.map((cluster) => ({
    cluster,
    label: clusterToLabel.get(cluster) || "medium"
  }));
}

function extractDifficultyFeatures(question) {
  const promptTokens = tokenize(question.prompt);
  const explanationTokens = tokenize(question.explanation);
  const acceptedAnswerTokens = (question.acceptedAnswers || []).map((answer) => tokenize(answer).length);
  const compactAnswers = (question.acceptedAnswers || []).map((answer) => compactText(answer)).filter(Boolean);
  const compactAnswerSet = new Set(compactAnswers);
  const symbolCount = (String(question.prompt).match(/[(){}\[\]<>=+/*^-]/g) || []).length;
  const numericCount = (String(question.prompt).match(/\d/g) || []).length;
  const codeHintCount = (String(question.explanation).match(/`|<code>|<\/code>/gi) || []).length;
  const longWordCount = promptTokens.filter((token) => token.length >= 9).length;
  const keywordHits = promptTokens.filter((token) => COMPLEXITY_KEYWORDS.has(token)).length;
  const tagHits = (question.metadata?.tags || []).filter((tag) => ADVANCED_TAG_HINTS.has(String(tag).toLowerCase())).length;
  const answerVariantCount = compactAnswerSet.size;
  const averageAnswerLength = average(acceptedAnswerTokens);

  return {
    promptTokenCount: promptTokens.length,
    explanationTokenCount: explanationTokens.length,
    averageAnswerLength: Number(averageAnswerLength.toFixed(2)),
    answerVariantCount,
    symbolCount,
    numericCount,
    codeHintCount,
    longWordCount,
    keywordHits,
    tagHits
  };
}

function difficultySeed(features) {
  return Number(
    (
      features.promptTokenCount * 0.48 +
      features.explanationTokenCount * 0.05 +
      features.averageAnswerLength * 0.9 +
      features.answerVariantCount * 0.45 +
      features.symbolCount * 0.2 +
      features.numericCount * 0.85 +
      features.codeHintCount * 0.7 +
      features.longWordCount * 0.35 +
      features.keywordHits * 2.1 +
      features.tagHits * 1.2
    ).toFixed(4)
  );
}

function difficultyVector(features, seed) {
  return [
    seed,
    features.promptTokenCount + features.longWordCount,
    features.averageAnswerLength + features.keywordHits + features.tagHits,
    features.numericCount + features.symbolCount + features.codeHintCount
  ];
}

function annotateRemoteDifficulty(questions) {
  const grouped = new Map();

  for (const question of questions) {
    const groupKey = `${question.subject}::${question.topic}::${question.subtopic}`;
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey).push(question);
  }

  const annotated = [];

  for (const [groupKey, groupedQuestions] of grouped.entries()) {
    const scoredQuestions = groupedQuestions.map((question) => {
      const features = extractDifficultyFeatures(question);
      const seed = difficultySeed(features);
      return {
        question,
        features,
        seed,
        vector: difficultyVector(features, seed)
      };
    });

    const clusterAssignments = assignDifficultyClusters(scoredQuestions);

    scoredQuestions.forEach((entry, index) => {
      const assignment = clusterAssignments[index] || { cluster: 0, label: "medium" };
      annotated.push(
        normalizeQuestion({
          ...entry.question,
          metadata: {
            ...(entry.question.metadata || {}),
            remoteDifficulty: {
              groupedBy: "subject-topic-subtopic",
              groupKey,
              cluster: assignment.cluster,
              label: assignment.label,
              score: entry.seed,
              features: entry.features
            },
            difficultyLabel: assignment.label,
            difficultyScore: entry.seed
          }
        })
      );
    });
  }

  return annotated;
}

function buildRemoteQuestion(subject, profile, question, answer) {
  if (!question || !answer) {
    return null;
  }

  const prompt = normalizeTitle(question.title);
  if (!prompt || !TITLE_PATTERN.test(prompt)) {
    return null;
  }

  const candidates = extractCandidatesFromAnswer(answer.body || "");
  if (!candidates.length) {
    return null;
  }

  const primaryAnswer = candidates[0];
  const explanation = stripHtml(answer.body || "").slice(0, 500);
  if (!explanation) {
    return null;
  }

  return normalizeQuestion({
    id: createRemoteQuestionId(`stackexchange:${question.question_id}:${answer.answer_id}`),
    subject,
    topic: profile.topic,
    subtopic: profile.subtopic,
    type: "short_text",
    prompt,
    options: [],
    acceptedAnswers: uniqueStrings([primaryAnswer, ...candidates]),
    explanation,
    metadata: {
      remote: true,
      sourceName: "Stack Exchange API",
      sourceUrl: question.link,
      sourceId: String(question.question_id),
      answerId: String(answer.answer_id),
      license: question.content_license || answer.content_license || "CC BY-SA",
      tags: question.tags || []
    }
  });
}

function dedupeQuestions(questions, existingPrompts = []) {
  const seenPrompts = new Set(existingPrompts.map((prompt) => `short_text:${compactText(prompt)}`));
  const seenIds = new Set();
  const unique = [];

  for (const question of questions) {
    const promptKey = `${question.type}:${compactText(question.prompt)}`;
    if (!promptKey || seenPrompts.has(promptKey) || seenIds.has(question.id)) {
      continue;
    }

    seenPrompts.add(promptKey);
    seenIds.add(question.id);
    unique.push(question);
  }

  return unique;
}

function stableOrder(items, seed) {
  return [...items].sort((left, right) => {
    const leftKey = createRemoteQuestionId(`${seed}:${left.id || left.text || left}`);
    const rightKey = createRemoteQuestionId(`${seed}:${right.id || right.text || right}`);
    return leftKey - rightKey;
  });
}

function selectedProfilesForRun(subject, desiredPerSubject) {
  const profiles = SUBJECT_PROFILES[subject] || [];
  if (!profiles.length) {
    return [];
  }

  const maxProfiles = Math.max(
    2,
    Math.min(5, Math.ceil(desiredPerSubject / 25))
  );

  return stableOrder(
    profiles.map((profile) => ({
      id: `${subject}:${profile.topic}:${profile.subtopic}`,
      profile
    })),
    `profiles:${subject}:${Math.ceil(Date.now() / Math.max(config.crawlerMinimumGapMs, 60000))}`
  )
    .slice(0, Math.min(maxProfiles, profiles.length))
    .map((entry) => entry.profile);
}

function profileKeywordSet(profile) {
  return new Set(
    keywordTokens([profile.topic, profile.subtopic, profile.query].join(" "))
  );
}

function strongProfileKeywordSet(profile) {
  return new Set(
    keywordTokens([profile.topic, profile.subtopic, profile.query].join(" "))
      .filter((token) => !GENERIC_CLASSIFICATION_TOKENS.has(token))
  );
}

function scoreProfileMatch(tokens, profile) {
  const keywords = profileKeywordSet(profile);
  const strongKeywords = strongProfileKeywordSet(profile);
  let score = 0;
  let strongMatches = 0;

  for (const token of tokens) {
    if (keywords.has(token)) {
      score += 1;
    }
    if (strongKeywords.has(token)) {
      strongMatches += 1;
    }
  }

  for (const token of keywordTokens(profile.subtopic)) {
    if (tokens.has(token)) {
      score += 2;
      if (strongKeywords.has(token)) {
        strongMatches += 1;
      }
    }
  }

  for (const token of keywordTokens(profile.topic)) {
    if (tokens.has(token)) {
      score += 1;
      if (strongKeywords.has(token)) {
        strongMatches += 1;
      }
    }
  }

  return { score, strongMatches };
}

function questionTokenSet(question) {
  const parts = [
    question.prompt,
    question.explanation,
    ...(question.acceptedAnswers || []),
    ...((question.options || []).map((option) => option.text)),
    ...(question.metadata?.tags || []),
    question.metadata?.providerCategory,
    question.metadata?.providerSubCategory,
    question.metadata?.sourceCategory,
    question.metadata?.sourceSubtopic,
    question.metadata?.sourceName
  ];

  return new Set(keywordTokens(parts.filter(Boolean).join(" ")));
}

function weightedTokenFrequency(question, { includeLabels = true } = {}) {
  const frequency = new Map();
  const weightedParts = [
    { text: question.prompt, weight: 4 },
    { text: question.explanation, weight: 1 },
    { text: question.metadata?.providerCategory, weight: 3 },
    { text: question.metadata?.sourceCategory, weight: 3 },
    { text: question.metadata?.providerSubCategory, weight: 4 },
    { text: question.metadata?.sourceSubtopic, weight: 4 }
  ];

  if (includeLabels) {
    weightedParts.unshift(
      { text: question.subject, weight: 4 },
      { text: question.topic, weight: 5 },
      { text: question.subtopic, weight: 6 }
    );
  }

  for (const part of weightedParts) {
    for (const token of keywordTokens(part.text || "")) {
      frequency.set(token, (frequency.get(token) || 0) + part.weight);
    }
  }

  for (const option of question.options || []) {
    for (const token of keywordTokens(option.text || "")) {
      frequency.set(token, (frequency.get(token) || 0) + 1);
    }
  }

  for (const answer of question.acceptedAnswers || []) {
    for (const token of keywordTokens(answer || "")) {
      frequency.set(token, (frequency.get(token) || 0) + 2);
    }
  }

  for (const tag of question.metadata?.tags || []) {
    for (const token of keywordTokens(tag || "")) {
      frequency.set(token, (frequency.get(token) || 0) + 2);
    }
  }

  return frequency;
}

function frequencyMagnitude(frequency) {
  let total = 0;
  for (const weight of frequency.values()) {
    total += weight * weight;
  }
  return Math.sqrt(total);
}

function cosineFrequencySimilarity(leftFrequency, rightFrequency) {
  const leftMagnitude = frequencyMagnitude(leftFrequency);
  const rightMagnitude = frequencyMagnitude(rightFrequency);
  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  let dotProduct = 0;
  for (const [token, weight] of leftFrequency.entries()) {
    dotProduct += weight * (rightFrequency.get(token) || 0);
  }

  return dotProduct / (leftMagnitude * rightMagnitude);
}

function mergeFrequencyInto(target, source) {
  for (const [token, weight] of source.entries()) {
    target.set(token, (target.get(token) || 0) + weight);
  }
}

function cloneFrequency(frequency) {
  return new Map(frequency.entries());
}

function normalizeLexicalScore(score, strongMatches) {
  const boundedScore = Math.min(score / 8, 1);
  const boundedStrongMatches = Math.min(strongMatches / 4, 1);
  return Number((boundedScore * 0.7 + boundedStrongMatches * 0.3).toFixed(4));
}

function profilePrototypeFrequency(subject, topic, subtopic) {
  const aliasText = (SUBTOPIC_ALIAS_MAP[subject]?.[subtopic] || []).join(" ");
  return weightedTokenFrequency(
    {
      subject,
      topic,
      subtopic,
      prompt: "",
      explanation: "",
      options: [],
      acceptedAnswers: [],
      metadata: {
        providerCategory: topic,
        providerSubCategory: `${subtopic} ${aliasText}`,
        sourceCategory: topic,
        sourceSubtopic: aliasText,
        tags: [topic, subtopic, aliasText]
      }
    },
    { includeLabels: true }
  );
}

function topicPrototypeFrequency(subject, topic) {
  const topicAliases = TOPIC_ALIAS_MAP[subject]?.[topic] || [];
  const profileText = (SUBJECT_PROFILES[subject] || [])
    .filter((profile) => profile.topic === topic)
    .flatMap((profile) => [
      profile.subtopic,
      profile.query,
      ...(SUBTOPIC_ALIAS_MAP[subject]?.[profile.subtopic] || [])
    ])
    .join(" ");

  return weightedTokenFrequency(
    {
      subject,
      topic,
      subtopic: topic,
      prompt: "",
      explanation: "",
      options: [],
      acceptedAnswers: [],
      metadata: {
        providerCategory: `${topic} ${topicAliases.join(" ")}`,
        providerSubCategory: profileText,
        sourceCategory: topic,
        sourceSubtopic: profileText,
        tags: [topic, ...topicAliases]
      }
    },
    { includeLabels: true }
  );
}

function aliasHintScore(question, anchor) {
  const hintText = [
    question.metadata?.providerSubCategory,
    question.metadata?.sourceSubtopic,
    question.metadata?.providerCategory,
    question.metadata?.sourceCategory
  ]
    .filter(Boolean)
    .join(" ");
  const hintTokens = new Set(keywordTokens(hintText));
  if (!hintTokens.size) {
    return 0;
  }

  const anchorTokens = new Set(
    keywordTokens(
      [
        anchor.topic,
        anchor.subtopic,
        ...(SUBTOPIC_ALIAS_MAP[anchor.subject]?.[anchor.subtopic] || [])
      ].join(" ")
    )
  );
  if (!anchorTokens.size) {
    return 0;
  }

  let overlap = 0;
  for (const token of hintTokens) {
    if (anchorTokens.has(token)) {
      overlap += 1;
    }
  }

  return Number((overlap / anchorTokens.size).toFixed(4));
}

function topicAliasHintScore(question, anchor) {
  const hintText = [
    question.metadata?.providerCategory,
    question.metadata?.providerSubCategory,
    question.metadata?.sourceCategory,
    question.metadata?.sourceSubtopic,
    ...(question.metadata?.tags || [])
  ]
    .filter(Boolean)
    .join(" ");
  const hintTokens = new Set(keywordTokens(hintText));
  if (!hintTokens.size) {
    return 0;
  }

  const anchorTokens = new Set(
    keywordTokens(
      [
        anchor.topic,
        ...(TOPIC_ALIAS_MAP[anchor.subject]?.[anchor.topic] || []),
        ...(SUBJECT_PROFILES[anchor.subject] || [])
          .filter((profile) => profile.topic === anchor.topic)
          .flatMap((profile) => [profile.subtopic, profile.query])
      ].join(" ")
    )
  );
  if (!anchorTokens.size) {
    return 0;
  }

  let overlap = 0;
  for (const token of hintTokens) {
    if (anchorTokens.has(token)) {
      overlap += 1;
    }
  }

  return Number((overlap / anchorTokens.size).toFixed(4));
}

function anchorQuestionCandidates(existingQuestions, allowedSubjects) {
  return existingQuestions.filter((question) => {
    if (!allowedSubjects.includes(question.subject)) {
      return false;
    }

    const metadata = question.metadata || {};
    return !metadata.remote && !metadata.imported;
  });
}

function buildSeedAnchors(existingQuestions, allowedSubjects = supportedCrawlerSubjects) {
  const subjectAnchors = new Map();
  const topicBuckets = new Map();
  const subtopicBuckets = new Map();
  const anchorQuestions = anchorQuestionCandidates(existingQuestions, allowedSubjects);

  for (const subject of allowedSubjects) {
    subjectAnchors.set(subject, new Map());
    for (const profile of SUBJECT_PROFILES[subject] || []) {
      const topicKey = `${subject}::${profile.topic}`;
      if (!topicBuckets.has(topicKey)) {
        topicBuckets.set(topicKey, {
          subject,
          topic: profile.topic,
          frequency: topicPrototypeFrequency(subject, profile.topic),
          count: 0
        });
      }
      const bucketKey = `${subject}::${profile.topic}::${profile.subtopic}`;
      if (!subtopicBuckets.has(bucketKey)) {
        subtopicBuckets.set(bucketKey, {
          subject,
          topic: profile.topic,
          subtopic: profile.subtopic,
          frequency: profilePrototypeFrequency(subject, profile.topic, profile.subtopic),
          count: 0
        });
      }
    }
  }

  for (const question of anchorQuestions) {
    const questionFrequency = weightedTokenFrequency(question);
    const subjectFrequency = subjectAnchors.get(question.subject) || new Map();
    mergeFrequencyInto(subjectFrequency, questionFrequency);

    subjectAnchors.set(question.subject, subjectFrequency);
    const topicKey = `${question.subject}::${question.topic}`;
    if (!topicBuckets.has(topicKey)) {
      topicBuckets.set(topicKey, {
        subject: question.subject,
        topic: question.topic,
        frequency: new Map(),
        count: 0
      });
    }
    const topicBucket = topicBuckets.get(topicKey);
    mergeFrequencyInto(topicBucket.frequency, questionFrequency);
    topicBucket.count += 1;

    const bucketKey = `${question.subject}::${question.topic}::${question.subtopic}`;
    if (!subtopicBuckets.has(bucketKey)) {
      subtopicBuckets.set(bucketKey, {
        subject: question.subject,
        topic: question.topic,
        subtopic: question.subtopic,
        frequency: new Map(),
        count: 0
      });
    }

    const bucket = subtopicBuckets.get(bucketKey);
    mergeFrequencyInto(bucket.frequency, questionFrequency);
    bucket.count += 1;
  }

  return {
    subjectAnchors,
    topicAnchors: [...topicBuckets.values()].map((bucket) => ({
      subject: bucket.subject,
      topic: bucket.topic,
      frequency: cloneFrequency(bucket.frequency),
      count: bucket.count
    })),
    subtopicAnchors: [...subtopicBuckets.values()].map((bucket) => ({
      subject: bucket.subject,
      topic: bucket.topic,
      subtopic: bucket.subtopic,
      frequency: cloneFrequency(bucket.frequency),
      count: bucket.count
    }))
  };
}

function frequencyOverlapScore(questionFrequency, anchorFrequency) {
  let score = 0;
  for (const [token, questionWeight] of questionFrequency.entries()) {
    const anchorWeight = anchorFrequency.get(token) || 0;
    if (anchorWeight) {
      score += Math.min(anchorWeight, questionWeight);
    }
  }
  return score;
}

function bestTopicAnchor(subject, question, questionFrequency, tokens, seedAnchors) {
  const candidates = (seedAnchors.topicAnchors || []).filter((anchor) => anchor.subject === subject);
  if (!candidates.length) {
    return null;
  }

  const ranked = candidates
    .map((anchor) => {
      const centroidSimilarity = cosineFrequencySimilarity(questionFrequency, anchor.frequency);
      const matchingProfiles = (SUBJECT_PROFILES[subject] || []).filter((profile) => profile.topic === anchor.topic);
      const lexical = matchingProfiles.reduce(
        (best, profile) => {
          const score = scoreProfileMatch(tokens, profile);
          if (!best || score.score > best.score || (score.score === best.score && score.strongMatches > best.strongMatches)) {
            return score;
          }
          return best;
        },
        null
      ) || { score: 0, strongMatches: 0 };
      const lexicalScore = normalizeLexicalScore(lexical.score, lexical.strongMatches);
      const aliasScore = topicAliasHintScore(question, anchor);
      const score = Number(
        (
          centroidSimilarity * HIERARCHICAL_CLUSTERING.topicCentroidWeight +
          lexicalScore * HIERARCHICAL_CLUSTERING.topicLexicalWeight +
          aliasScore * HIERARCHICAL_CLUSTERING.topicAliasWeight
        ).toFixed(4)
      );

      return {
        ...anchor,
        score,
        centroidSimilarity,
        lexicalScore,
        aliasScore,
        lexicalMatches: lexical
      };
    })
    .sort((left, right) => right.score - left.score);

  return {
    best: ranked[0] || null,
    runnerUp: ranked[1] || null
  };
}

function broadFallbackSubtopic(subject, topic) {
  const genericProfile = (SUBJECT_PROFILES[subject] || []).find((profile) => profile.topic === topic);
  return genericProfile?.topic || topic;
}

function bestSubtopicAnchor(subject, topic, question, questionFrequency, tokens, seedAnchors) {
  const candidates = (seedAnchors.subtopicAnchors || []).filter(
    (anchor) => anchor.subject === subject && (!topic || anchor.topic === topic)
  );
  if (!candidates.length) {
    return null;
  }

  const ranked = candidates
    .map((anchor) => {
      const centroidSimilarity = cosineFrequencySimilarity(questionFrequency, anchor.frequency);
      const lexical = scoreProfileMatch(tokens, {
        topic: anchor.topic,
        subtopic: anchor.subtopic,
        query: `${anchor.topic} ${anchor.subtopic}`
      });
      const lexicalScore = normalizeLexicalScore(lexical.score, lexical.strongMatches);
      const aliasScore = aliasHintScore(question, anchor);
      const topicConsistency = anchor.topic === topic ? 1 : 0;
      const score = Number(
        (
          centroidSimilarity * HIERARCHICAL_CLUSTERING.subtopicCentroidWeight +
          lexicalScore * HIERARCHICAL_CLUSTERING.subtopicLexicalWeight +
          aliasScore * HIERARCHICAL_CLUSTERING.subtopicAliasWeight +
          topicConsistency * HIERARCHICAL_CLUSTERING.subtopicTopicWeight
        ).toFixed(4)
      );

      return {
        ...anchor,
        score,
        centroidSimilarity,
        lexicalScore,
        aliasScore,
        lexicalMatches: lexical
      };
    })
    .sort((left, right) => right.score - left.score);

  return {
    best: ranked[0] || null,
    runnerUp: ranked[1] || null
  };
}

function sourceSubjectHint(question, allowedSubjects) {
  const hint = String(
    question.metadata?.sourceSubject ||
    question.metadata?.providerSubject ||
    ""
  ).trim();

  return hint && allowedSubjects.includes(hint) ? hint : null;
}

function looksLikeGeneralTrivia(question, tokens, bestMatch) {
  const prompt = String(question.prompt || "");
  const triviaHits = [...tokens].filter((token) => TRIVIA_SIGNAL_TOKENS.has(token)).length;
  const patternMatch = TRIVIA_SIGNAL_PATTERNS.some((pattern) => pattern.test(prompt));
  return Boolean(bestMatch && bestMatch.score < 6 && (triviaHits >= 2 || patternMatch));
}

export function classifyQuestionToProfile(textParts, allowedSubjects = supportedCrawlerSubjects) {
  const haystackTokens = new Set(keywordTokens(textParts.join(" ")));
  let bestMatch = null;

  for (const subject of allowedSubjects) {
    const profiles = SUBJECT_PROFILES[subject] || [];
    for (const profile of profiles) {
      const { score, strongMatches } = scoreProfileMatch(haystackTokens, profile);

      if (
        !bestMatch ||
        score > bestMatch.score ||
        (score === bestMatch.score && strongMatches > bestMatch.strongMatches)
      ) {
        bestMatch = {
          subject,
          profile,
          score,
          strongMatches
        };
      }
    }
  }

  return bestMatch && bestMatch.score >= 3 && bestMatch.strongMatches >= 1 ? bestMatch : null;
}

function clusteredSubjectAssignment(
  question,
  allowedSubjects = supportedCrawlerSubjects,
  seedAnchors = { subjectAnchors: new Map(), subtopicAnchors: [] }
) {
  const tokens = questionTokenSet(question);
  const frequency = weightedTokenFrequency(question, { includeLabels: false });
  const candidates = [];
  const hintedSubject = sourceSubjectHint(question, allowedSubjects);

  for (const subject of hintedSubject ? [hintedSubject] : allowedSubjects) {
    const profiles = SUBJECT_PROFILES[subject] || [];
    const orderedProfiles = profiles
      .map((profile) => ({
        profile,
        ...scoreProfileMatch(tokens, profile)
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return right.strongMatches - left.strongMatches;
      });

    if (!orderedProfiles.length) {
      continue;
    }

    const centroidSimilarity = cosineFrequencySimilarity(
      frequency,
      seedAnchors.subjectAnchors.get(subject) || new Map()
    );
    const lexicalScore = normalizeLexicalScore(
      orderedProfiles[0].score,
      orderedProfiles[0].strongMatches
    );
    const compositeScore = Number(
      (
        centroidSimilarity * HIERARCHICAL_CLUSTERING.subjectCentroidWeight +
        lexicalScore * HIERARCHICAL_CLUSTERING.subjectLexicalWeight +
        (hintedSubject === subject ? HIERARCHICAL_CLUSTERING.subjectHintBoost : 0)
      ).toFixed(4)
    );

    candidates.push({
      subject,
      centroidSimilarity,
      lexicalScore,
      compositeScore,
      ...orderedProfiles[0]
    });
  }

  const orderedSubjects = candidates.sort((left, right) => {
    if (right.compositeScore !== left.compositeScore) {
      return right.compositeScore - left.compositeScore;
    }
    return right.strongMatches - left.strongMatches;
  });

  const bestMatch = orderedSubjects[0];
  const runnerUp = orderedSubjects[1] || { compositeScore: 0 };
  if (!bestMatch) {
    return null;
  }

  const confidence = Number(
    (bestMatch.compositeScore - runnerUp.compositeScore + bestMatch.centroidSimilarity * 0.2).toFixed(4)
  );

  if (looksLikeGeneralTrivia(question, tokens, bestMatch)) {
    return null;
  }

  if (bestMatch.strongMatches < 1 || confidence < HIERARCHICAL_CLUSTERING.minimumSubjectConfidence) {
    return null;
  }

  return {
    subject: bestMatch.subject,
    profile: bestMatch.profile,
    score: bestMatch.score,
    centroidSimilarity: bestMatch.centroidSimilarity,
    lexicalScore: bestMatch.lexicalScore,
    compositeScore: bestMatch.compositeScore,
    strongMatches: bestMatch.strongMatches,
    confidence,
    tokenCount: tokens.size
  };
}

export function refineQuestionAssignments(
  questions,
  allowedSubjects = supportedCrawlerSubjects,
  existingQuestions = []
) {
  const refined = [];
  const seedAnchors = buildSeedAnchors(existingQuestions, allowedSubjects);

  for (const question of questions) {
    const assignment = clusteredSubjectAssignment(question, allowedSubjects, seedAnchors);
    if (!assignment) {
      continue;
    }

    const questionFrequency = weightedTokenFrequency(question, { includeLabels: false });
    const questionTokens = questionTokenSet(question);
    const topicAnchorResult = bestTopicAnchor(
      assignment.subject,
      question,
      questionFrequency,
      questionTokens,
      seedAnchors
    );
    const topicBest = topicAnchorResult?.best || null;
    const topicRunnerUp = topicAnchorResult?.runnerUp || null;
    const topicMargin = Number(((topicBest?.score || 0) - (topicRunnerUp?.score || 0)).toFixed(4));
    const topic = topicBest?.score >= HIERARCHICAL_CLUSTERING.minimumTopicConfidence && topicMargin >= 0.04
      ? topicBest.topic
      : assignment.profile.topic;
    const subtopicAnchorResult = bestSubtopicAnchor(
      assignment.subject,
      topic,
      question,
      questionFrequency,
      questionTokens,
      seedAnchors
    );
    const subtopicBest = subtopicAnchorResult?.best || null;
    const subtopicRunnerUp = subtopicAnchorResult?.runnerUp || null;
    const subtopicMargin = Number(((subtopicBest?.score || 0) - (subtopicRunnerUp?.score || 0)).toFixed(4));
    const subtopic = subtopicBest?.score >= HIERARCHICAL_CLUSTERING.minimumSubtopicConfidence &&
      subtopicMargin >= HIERARCHICAL_CLUSTERING.minimumSubtopicMargin
      ? subtopicBest.subtopic
      : broadFallbackSubtopic(assignment.subject, topic);

    refined.push(
      normalizeQuestion({
        ...question,
        subject: assignment.subject,
        topic,
        subtopic,
        metadata: {
          ...(question.metadata || {}),
          classification: {
            method: "hierarchical-seed-centroid-clustering",
            score: assignment.score,
            centroidSimilarity: assignment.centroidSimilarity,
              lexicalScore: assignment.lexicalScore,
              compositeScore: assignment.compositeScore,
              strongMatches: assignment.strongMatches,
              confidence: assignment.confidence,
              tokenCount: assignment.tokenCount,
              sourceSubjectHint: sourceSubjectHint(question, allowedSubjects),
              anchorTopic: topicBest?.topic || assignment.profile.topic,
              anchorSubtopic: subtopicBest?.subtopic || null,
              topicCentroidSimilarity: topicBest?.centroidSimilarity || 0,
              topicLexicalScore: topicBest?.lexicalScore || 0,
              topicAliasScore: topicBest?.aliasScore || 0,
              topicCompositeScore: topicBest?.score || 0,
              topicMargin,
              subtopicCentroidSimilarity: subtopicBest?.centroidSimilarity || 0,
              subtopicLexicalScore: subtopicBest?.lexicalScore || 0,
              subtopicAliasScore: subtopicBest?.aliasScore || 0,
              subtopicCompositeScore: subtopicBest?.score || 0,
              subtopicMargin,
              usedBroadSubtopicFallback: subtopic !== (subtopicBest?.subtopic || "")
            }
          }
        })
    );
  }

  return refined;
}

function synthesizeMcqVariants(questions) {
  const bySubject = new Map();

  for (const question of questions) {
    if (question.type !== "short_text") {
      continue;
    }

    const key = question.subject;
    if (!bySubject.has(key)) {
      bySubject.set(key, []);
    }
    bySubject.get(key).push(question);
  }

  const syntheticQuestions = [];

  for (const subjectQuestions of bySubject.values()) {
    const answerPool = [];
    for (const question of subjectQuestions) {
      for (const answer of question.acceptedAnswers || []) {
        answerPool.push({
          questionId: question.id,
          text: answer,
          compact: compactText(answer),
          subtopic: question.subtopic,
          topic: question.topic,
          tokenCount: tokenize(answer).length
        });
      }
    }

    for (const question of subjectQuestions) {
      const correctAnswer = question.acceptedAnswers?.[0];
      const correctCompact = compactText(correctAnswer);
      if (!correctCompact) {
        continue;
      }

      const correctTokens = tokenize(correctAnswer).length;
      const distractors = [];
      const used = new Set([correctCompact]);

      const prioritizedPool = stableOrder(
        answerPool.filter((candidate) => {
          if (candidate.questionId === question.id || used.has(candidate.compact)) {
            return false;
          }

          const sameSubtopic = candidate.subtopic === question.subtopic;
          const sameTopic = candidate.topic === question.topic;
          const similarLength = Math.abs(candidate.tokenCount - correctTokens) <= 2;
          return sameSubtopic || sameTopic || similarLength;
        }),
        `mcq-priority:${question.id}`
      );

      const fallbackPool = stableOrder(
        answerPool.filter((candidate) => candidate.questionId !== question.id && !used.has(candidate.compact)),
        `mcq-fallback:${question.id}`
      );

      for (const candidate of [...prioritizedPool, ...fallbackPool]) {
        if (used.has(candidate.compact)) {
          continue;
        }

        used.add(candidate.compact);
        distractors.push(candidate.text);
        if (distractors.length >= 3) {
          break;
        }
      }

      if (distractors.length < 3) {
        continue;
      }

      const optionValues = stableOrder(
        [
          { id: "correct", text: correctAnswer, isCorrect: true },
          ...distractors.map((text, index) => ({
            id: `d${index + 1}`,
            text,
            isCorrect: false
          }))
        ],
        `mcq-options:${question.id}`
      ).map((option, index) => ({
        id: String.fromCharCode(97 + index),
        text: option.text,
        isCorrect: option.isCorrect
      }));

      syntheticQuestions.push(
        normalizeQuestion({
          ...question,
          id: createRemoteQuestionId(`mcq:${question.id}`),
          type: "mcq",
          options: optionValues,
          acceptedAnswers: [],
          metadata: {
            ...(question.metadata || {}),
            remote: true,
            generatedFrom: question.id,
            generatedVariant: "mcq"
          }
        })
      );
    }
  }

  return syntheticQuestions;
}

async function openTriviaFetch(params = {}) {
  const skippedWarning = providerBackoffWarning("opentdb");
  if (skippedWarning) {
    throw new Error(skippedWarning);
  }

  const url = new URL(config.openTriviaApiBase);
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      setProviderBackoff("opentdb", "HTTP 429 Too Many Requests");
    }
    throw new Error(`Open Trivia DB returned ${response.status}`);
  }

  const payload = await response.json();
  if (payload.response_code !== 0 && payload.response_code !== 1) {
    throw new Error(`Open Trivia DB response code ${payload.response_code}`);
  }

  clearProviderBackoff("opentdb");
  return payload;
}

function buildOpenTriviaQuestion(item, allowedSubjects) {
  const prompt = normalizeTitle(decodeUrlComponentSafe(item.question));
  if (!prompt) {
    return null;
  }

  const correctAnswer = decodeUrlComponentSafe(item.correct_answer);
  const incorrectAnswers = (item.incorrect_answers || []).map(decodeUrlComponentSafe);
  if (!correctAnswer || !incorrectAnswers.length) {
    return null;
  }

  const classification = classifyQuestionToProfile(
    [prompt, correctAnswer, ...incorrectAnswers, item.category],
    allowedSubjects
  );
  if (!classification) {
    return null;
  }

  const optionValues = stableOrder(
    [
      { marker: "correct", text: correctAnswer, isCorrect: true },
      ...incorrectAnswers.map((text, index) => ({
        marker: `wrong-${index}`,
        text,
        isCorrect: false
      }))
    ],
    `opentdb:${prompt}`
  ).map((option, index) => ({
    id: String.fromCharCode(97 + index),
    text: option.text,
    isCorrect: option.isCorrect
  }));

  return normalizeQuestion({
    id: createRemoteQuestionId(`opentdb:${prompt}:${correctAnswer}`),
    subject: classification.subject,
    topic: classification.profile.topic,
    subtopic: classification.profile.subtopic,
    type: "mcq",
    prompt,
    options: optionValues,
    acceptedAnswers: [],
    explanation: `Imported from Open Trivia DB (${decodeUrlComponentSafe(item.category)}).`,
    metadata: {
      remote: true,
      sourceName: "Open Trivia DB",
      sourceUrl: "https://opentdb.com/api_config.php",
      sourceId: compactText(`${prompt}:${correctAnswer}`),
      providerDifficulty: mapProviderDifficultyLabel(item.difficulty),
      providerCategory: decodeUrlComponentSafe(item.category),
      sourceType: item.type || "multiple"
    }
  });
}

function huggingFaceSubjectFromDomain(domain, fallbackSubjects) {
  const compactDomain = String(domain || "").trim().toLowerCase();
  const mappedSubject = HUGGINGFACE_DOMAIN_SUBJECT_MAP[compactDomain];
  if (mappedSubject && fallbackSubjects.includes(mappedSubject)) {
    return mappedSubject;
  }

  return null;
}

function normalizeHuggingFaceSubtopic(value) {
  const cleaned = stripHtml(value || "").replace(/\s+/g, " ").trim();
  return cleaned || "Overview";
}

function titleCaseConfigLabel(value) {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function mmluAllowedSubjects(configEntry) {
  return uniqueStrings([configEntry.subject, ...(configEntry.allowedSubjects || [])]);
}

function mmluConfigsForSubjects(subjects) {
  return MMLU_CONFIGS.filter((entry) =>
    mmluAllowedSubjects(entry).some((subject) => subjects.includes(subject))
  );
}

function resolveMmluSubject(configEntry, allowedSubjects) {
  const matchedSubject = mmluAllowedSubjects(configEntry).find((subject) =>
    allowedSubjects.includes(subject)
  );
  return matchedSubject || configEntry.subject;
}

function normalizeMmluChoices(row) {
  if (Array.isArray(row.choices)) {
    return row.choices.map((choice) => String(choice || "").trim()).filter(Boolean);
  }

  if (Array.isArray(row.options)) {
    return row.options.map((choice) => String(choice || "").trim()).filter(Boolean);
  }

  if (row.choices && typeof row.choices === "object") {
    return Object.values(row.choices).map((choice) => String(choice || "").trim()).filter(Boolean);
  }

  return [row.A, row.B, row.C, row.D].map((choice) => String(choice || "").trim()).filter(Boolean);
}

function resolveMmluCorrectIndex(answerValue, choices) {
  if (typeof answerValue === "number" && Number.isInteger(answerValue)) {
    return answerValue >= 0 && answerValue < choices.length ? answerValue : null;
  }

  const normalized = String(answerValue ?? "").trim();
  if (!normalized) {
    return null;
  }

  if (/^\d+$/.test(normalized)) {
    const parsed = Number(normalized);
    if (parsed >= 0 && parsed < choices.length) {
      return parsed;
    }

    if (parsed >= 1 && parsed <= choices.length) {
      return parsed - 1;
    }
  }

  const uppercase = normalized.toUpperCase();
  if (uppercase in HUGGINGFACE_ANSWER_KEY_TO_INDEX) {
    const candidate = HUGGINGFACE_ANSWER_KEY_TO_INDEX[uppercase];
    return candidate < choices.length ? candidate : null;
  }

  const textMatch = choices.findIndex((choice) => compactText(choice) === compactText(normalized));
  return textMatch >= 0 ? textMatch : null;
}

function datasetOffsetSeed(seedKey, estimate) {
  const slice = Math.floor(Date.now() / Math.max(config.crawlerMinimumGapMs, 60000));
  const seed = createRemoteQuestionId(`${seedKey}:${slice}`);
  return Math.abs(seed) % estimate;
}

function datasetOffsetsForRun({
  seedKey,
  estimate,
  pageLength,
  maxPages,
  subjects,
  desiredPerSubject,
  multiplier = 4,
  strategy = "rotating"
}) {
  const requestedRows = Math.max(
    desiredPerSubject * Math.max(subjects.length, 1) * multiplier,
    pageLength
  );
  const pageCount = Math.min(
    Math.max(maxPages, 1),
    Math.max(1, Math.ceil(requestedRows / pageLength))
  );
  if (strategy === "sequential") {
    return Array.from({ length: pageCount }, (_unused, index) => index * pageLength);
  }

  const baseOffset = datasetOffsetSeed(`${seedKey}:${subjects.join("|")}`, estimate);

  return Array.from({ length: pageCount }, (_unused, index) =>
    (baseOffset + (index * pageLength)) % estimate
  );
}

async function fetchRowsFromDatasetServer({
  providerKey,
  datasetName,
  configName,
  split,
  enabled,
  pageLength,
  maxPages,
  estimatedRows,
  subjects,
  desiredPerSubject,
  seedKey,
  multiplier = 4,
  offsetStrategy = "rotating"
}) {
  if (!enabled) {
    return [];
  }

  const skippedWarning = providerBackoffWarning(providerKey);
  if (skippedWarning) {
    throw new Error(skippedWarning);
  }

  const resolvedLength = Math.min(Math.max(pageLength, 20), 100);
  const offsets = datasetOffsetsForRun({
    seedKey,
    estimate: Math.max(estimatedRows, 100),
    pageLength: resolvedLength,
    maxPages,
    subjects,
    desiredPerSubject,
    multiplier,
    strategy: offsetStrategy
  });
  const rows = [];

  for (const offset of offsets) {
    const url = new URL(config.huggingFaceDatasetApiBase);
    url.searchParams.set("dataset", datasetName);
    url.searchParams.set("config", configName);
    url.searchParams.set("split", split);
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("length", String(resolvedLength));

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        setProviderBackoff(providerKey, "HTTP 429 Too Many Requests");
      }
      throw new Error(`Hugging Face dataset server returned ${response.status}`);
    }

    const payload = await response.json();
    rows.push(...(Array.isArray(payload?.rows) ? payload.rows : []));
  }

  clearProviderBackoff(providerKey);
  return rows;
}

async function huggingFaceFetchRows(subjects, desiredPerSubject) {
  return fetchRowsFromDatasetServer({
    providerKey: "huggingface",
    datasetName: config.huggingFaceDatasetName,
    configName: config.huggingFaceDatasetConfig,
    split: config.huggingFaceDatasetSplit,
    enabled: config.huggingFaceDatasetEnabled,
    pageLength: config.huggingFaceDatasetLength,
    maxPages: config.huggingFaceDatasetMaxPages,
    estimatedRows: config.huggingFaceDatasetEstimatedRows,
    subjects,
    desiredPerSubject,
    seedKey: "hf-csbench",
    multiplier: 4
  });
}

async function mmluFetchRows(subjects, desiredPerSubject) {
  const configs = mmluConfigsForSubjects(subjects);
  if (!configs.length || !config.mmluDatasetEnabled) {
    return { rows: [], warnings: [] };
  }

  const desiredPerConfig = Math.max(
    10,
    Math.ceil(desiredPerSubject / Math.max(configs.length, 1))
  );
  const results = await Promise.allSettled(
    configs.map((entry) =>
      fetchRowsFromDatasetServer({
        providerKey: "mmlu",
        datasetName: config.mmluDatasetName,
        configName: entry.configName,
        split: config.mmluDatasetSplit,
        enabled: config.mmluDatasetEnabled,
        pageLength: config.mmluDatasetLength,
        maxPages: config.mmluDatasetMaxPages,
        estimatedRows: config.mmluDatasetEstimatedRows,
        subjects: mmluAllowedSubjects(entry),
        desiredPerSubject: desiredPerConfig,
        seedKey: `hf-mmlu:${entry.configName}`,
        multiplier: 1,
        offsetStrategy: "sequential"
      }).then((rows) => rows.map((row) => ({ configEntry: entry, row })))
    )
  );

  const rows = [];
  const warnings = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      rows.push(...result.value);
      continue;
    }

    warnings.push(`MMLU config fetch failed: ${result.reason?.message || "Unknown error"}`);
  }

  return { rows, warnings };
}

function buildHuggingFaceQuestion(entry, allowedSubjects) {
  const row = entry?.row || entry || {};
  const prompt = normalizeTitle(row.Question || row.question);
  if (!prompt) {
    return null;
  }

  const subjectFromDomain = huggingFaceSubjectFromDomain(row.Domain || row.domain, allowedSubjects);
  const classification = classifyQuestionToProfile(
    [
      prompt,
      row.Domain || row.domain || "",
      row.SubDomain || row.subdomain || "",
      row.Explanation || row.explanation || "",
      row.A || "",
      row.B || "",
      row.C || "",
      row.D || ""
    ],
    subjectFromDomain ? [subjectFromDomain] : allowedSubjects
  );

  const subject = subjectFromDomain || classification?.subject;
  if (!subject) {
    return null;
  }

  const answerKey = String(row.Answer || row.answer || "").trim().toUpperCase();
  const correctIndex = HUGGINGFACE_ANSWER_KEY_TO_INDEX[answerKey];
  const optionTexts = [row.A, row.B, row.C, row.D].map((value) => String(value || "").trim());

  if (!Number.isInteger(correctIndex) || optionTexts.filter(Boolean).length < 4 || !optionTexts[correctIndex]) {
    return null;
  }

  const options = optionTexts.map((text, index) => ({
    id: String.fromCharCode(97 + index),
    text,
    isCorrect: index === correctIndex
  }));

  return normalizeQuestion({
    id: createRemoteQuestionId(`huggingface:${row.ID ?? row.id ?? entry?.row_idx ?? prompt}`),
    subject,
    topic: classification?.profile.topic || String(row.Domain || "Imported").trim(),
    subtopic: classification?.profile.subtopic || normalizeHuggingFaceSubtopic(row.SubDomain || row.subdomain),
    type: "mcq",
    prompt,
    options,
    acceptedAnswers: [],
    explanation: stripHtml(row.Explanation || row.explanation || "Imported from Hugging Face CSBench_MCQ."),
    metadata: {
      remote: true,
      sourceName: "Hugging Face CSBench_MCQ",
      sourceUrl: "https://huggingface.co/datasets/lmms-lab/CSBench_MCQ",
      sourceId: String(row.ID ?? row.id ?? entry?.row_idx ?? prompt),
      sourceSubject: subjectFromDomain || "",
      providerCategory: String(row.Domain || row.domain || ""),
      providerSubCategory: normalizeHuggingFaceSubtopic(row.SubDomain || row.subdomain),
      sourceCategory: String(row.Domain || row.domain || ""),
      sourceSubtopic: normalizeHuggingFaceSubtopic(row.SubDomain || row.subdomain),
      tags: uniqueStrings([
        String(row.Domain || row.domain || ""),
        String(row.SubDomain || row.subdomain || ""),
        String(row.Tag || row.tag || "")
      ]),
      split: String(row.Split || row.split || ""),
      format: String(row.Format || row.format || "")
    }
  });
}

function buildEnglishGrammarQuestion(entry) {
  const row = entry?.row || entry || {};
  const prompt = normalizeTitle(row.question || row.Question);
  if (!prompt) {
    return null;
  }

  const answerText = String(row.answer || row.Answer || "").trim();
  const explanation = stripHtml(answerText).slice(0, 700);
  if (!explanation) {
    return null;
  }

  const acceptedAnswers = extractCandidatesFromAnswer(answerText);
  if (!acceptedAnswers.length) {
    return null;
  }

  const classification = classifyQuestionToProfile(
    [
      prompt,
      row.instruction || row.Instruction || "",
      answerText
    ],
    ["English"]
  );

  return normalizeQuestion({
    id: createRemoteQuestionId(`english-grammar:${entry?.row_idx ?? prompt}`),
    subject: "English",
    topic: classification?.profile.topic || "Grammar",
    subtopic: classification?.profile.subtopic || "Grammar",
    type: "short_text",
    prompt,
    options: [],
    acceptedAnswers,
    explanation,
    metadata: {
      remote: true,
      sourceName: "Hugging Face English Grammar",
      sourceUrl: "https://huggingface.co/datasets/Teravee/1000_english-grammar-dataset",
      sourceId: String(entry?.row_idx ?? prompt),
      providerCategory: "English",
      providerSubCategory: classification?.profile.subtopic || "Grammar",
      sourceCategory: "English",
      sourceSubtopic: classification?.profile.subtopic || "Grammar",
      instruction: String(row.instruction || row.Instruction || "").trim()
    }
  });
}

function buildMmluQuestion(entry, allowedSubjects) {
  const row = entry?.row?.row || entry?.row || entry || {};
  const configEntry = entry?.configEntry;
  if (!configEntry) {
    return null;
  }

  const prompt = normalizeTitle(row.question || row.Question);
  if (!prompt) {
    return null;
  }

  const choices = normalizeMmluChoices(row);
  if (choices.length < 2) {
    return null;
  }

  const correctIndex = resolveMmluCorrectIndex(row.answer ?? row.Answer ?? row.target, choices);
  if (!Number.isInteger(correctIndex) || !choices[correctIndex]) {
    return null;
  }

  const classifierSubjects = mmluAllowedSubjects(configEntry).filter((subject) =>
    allowedSubjects.includes(subject)
  );
  const fallbackSubject = resolveMmluSubject(configEntry, allowedSubjects);
  const strictAllowedSubjects = Boolean(configEntry.strictAllowedSubjects);
  const classification = classifyQuestionToProfile(
    [
      prompt,
      ...choices,
      configEntry.configName,
      titleCaseConfigLabel(configEntry.configName)
    ],
    classifierSubjects.length ? classifierSubjects : [fallbackSubject]
  );
  const subject = strictAllowedSubjects
    ? fallbackSubject
    : classification?.subject || fallbackSubject;

  const options = choices.map((text, index) => ({
    id: String.fromCharCode(97 + index),
    text,
    isCorrect: index === correctIndex
  }));

  return normalizeQuestion({
    id: createRemoteQuestionId(`mmlu:${configEntry.configName}:${entry?.row?.row_idx ?? entry?.row_idx ?? prompt}`),
    subject,
    topic: strictAllowedSubjects ? configEntry.topic : classification?.profile.topic || configEntry.topic,
    subtopic: strictAllowedSubjects ? configEntry.subtopic : classification?.profile.subtopic || configEntry.subtopic,
    type: "mcq",
    prompt,
    options,
    acceptedAnswers: [],
    explanation: stripHtml(row.explanation || row.Explanation || `Imported from Hugging Face MMLU (${titleCaseConfigLabel(configEntry.configName)}).`),
    metadata: {
      remote: true,
      sourceName: "Hugging Face MMLU",
      sourceUrl: "https://huggingface.co/datasets/cais/mmlu",
      sourceId: String(entry?.row?.row_idx ?? entry?.row_idx ?? prompt),
      sourceSubject: subject,
      allowedSubjects: classifierSubjects,
      providerCategory: titleCaseConfigLabel(configEntry.configName),
      providerSubCategory: configEntry.subtopic,
      sourceCategory: titleCaseConfigLabel(configEntry.configName),
      sourceSubtopic: configEntry.subtopic,
      configName: configEntry.configName,
      split: config.mmluDatasetSplit
    }
  });
}

async function fetchHuggingFaceQuestions(subjects, desiredPerSubject) {
  if (!config.huggingFaceDatasetEnabled) {
    return { questions: [], warnings: [] };
  }

  const questions = [];
  const warnings = [];

  try {
    const rows = await huggingFaceFetchRows(subjects, desiredPerSubject);
    for (const item of rows) {
      const mapped = buildHuggingFaceQuestion(item, subjects);
      if (mapped) {
        questions.push(mapped);
      }
    }
  } catch (error) {
    warnings.push(`Hugging Face dataset fetch failed: ${error.message || "Unknown error"}`);
  }

  return { questions, warnings };
}

async function fetchEnglishGrammarQuestions(subjects, desiredPerSubject) {
  if (!subjects.includes("English") || !config.englishGrammarDatasetEnabled) {
    return { questions: [], warnings: [] };
  }

  const questions = [];
  const warnings = [];

  try {
    const rows = await fetchRowsFromDatasetServer({
      providerKey: "englishgrammar",
      datasetName: config.englishGrammarDatasetName,
      configName: config.englishGrammarDatasetConfig,
      split: config.englishGrammarDatasetSplit,
      enabled: config.englishGrammarDatasetEnabled,
      pageLength: config.englishGrammarDatasetLength,
      maxPages: config.englishGrammarDatasetMaxPages,
      estimatedRows: config.englishGrammarDatasetEstimatedRows,
      subjects: ["English"],
      desiredPerSubject,
      seedKey: "hf-english-grammar",
      multiplier: 3
    });

    for (const item of rows) {
      const mapped = buildEnglishGrammarQuestion(item);
      if (mapped) {
        questions.push(mapped);
      }
    }
  } catch (error) {
    warnings.push(`English grammar dataset fetch failed: ${error.message || "Unknown error"}`);
  }

  return { questions, warnings };
}

async function fetchMmluQuestions(subjects, desiredPerSubject) {
  if (!config.mmluDatasetEnabled) {
    return { questions: [], warnings: [] };
  }

  const relevantConfigs = mmluConfigsForSubjects(subjects);
  if (!relevantConfigs.length) {
    return { questions: [], warnings: [] };
  }

  const questions = [];
  const warnings = [];

  try {
    const result = await mmluFetchRows(subjects, desiredPerSubject);
    warnings.push(...result.warnings);
    const rows = result.rows;
    for (const item of rows) {
      const mapped = buildMmluQuestion(item, subjects);
      if (mapped) {
        questions.push(mapped);
      }
    }
  } catch (error) {
    warnings.push(`MMLU dataset fetch failed: ${error.message || "Unknown error"}`);
  }

  return { questions, warnings };
}

async function fetchOpenTriviaQuestions(subjects, desiredPerSubject) {
  const questions = [];
  const warnings = [];
  try {
    const result = await openTriviaFetch({
      amount: Math.min(25, Math.max(10, desiredPerSubject)),
      category: OPEN_TRIVIA_CATEGORY_COMPUTERS,
      encode: "url3986"
    });

    for (const item of result.results || []) {
      const mapped = buildOpenTriviaQuestion(item, subjects);
      if (mapped) {
        questions.push(mapped);
      }
    }
  } catch (error) {
    warnings.push(`Open Trivia DB fetch failed: ${error.message || "Unknown error"}`);
  }

  return { questions, warnings };
}

async function quizApiFetch(params = {}) {
  const skippedWarning = providerBackoffWarning("quizapi");
  if (skippedWarning) {
    throw new Error(skippedWarning);
  }

  const base = config.quizApiBase.endsWith("/") ? config.quizApiBase : `${config.quizApiBase}/`;
  const url = new URL("questions", base);

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.quizApiKey}`,
      "X-Api-Key": config.quizApiKey
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      setProviderBackoff("quizapi", "HTTP 429 Too Many Requests");
    }
    throw new Error(`QuizAPI returned ${response.status}`);
  }

  const payload = await response.json();
  clearProviderBackoff("quizapi");
  return payload;
}

function extractQuizApiOptions(item) {
  const options = [];
  for (let index = 1; index <= 6; index += 1) {
    const value = item.answers?.[`answer_${index}`];
    if (value) {
      options.push({
        key: `answer_${index}`,
        text: String(value).trim(),
        isCorrect: String(item.correct_answers?.[`answer_${index}_correct`] || "").toLowerCase() === "true"
      });
    }
  }
  return options;
}

function buildQuizApiQuestion(item, allowedSubjects) {
  const prompt = normalizeTitle(item.question);
  if (!prompt) {
    return null;
  }

  const options = extractQuizApiOptions(item);
  const correctOptions = options.filter((option) => option.isCorrect);
  if (options.length < 2 || correctOptions.length !== 1) {
    return null;
  }

  const classification = classifyQuestionToProfile(
    [
      prompt,
      item.description || "",
      item.category || "",
      ...(item.tags || []).map((tag) => tag.name || "")
    ],
    allowedSubjects
  );
  if (!classification) {
    return null;
  }

  const orderedOptions = stableOrder(
    options.map((option) => ({
      id: option.key,
      text: option.text,
      isCorrect: option.isCorrect
    })),
    `quizapi:${item.id || prompt}`
  ).map((option, index) => ({
    id: String.fromCharCode(97 + index),
    text: option.text,
    isCorrect: option.isCorrect
  }));

  return normalizeQuestion({
    id: createRemoteQuestionId(`quizapi:${item.id}`),
    subject: classification.subject,
    topic: classification.profile.topic,
    subtopic: classification.profile.subtopic,
    type: "mcq",
    prompt,
    options: orderedOptions,
    acceptedAnswers: [],
    explanation: stripHtml(item.explanation || item.description || "Imported from QuizAPI."),
    metadata: {
      remote: true,
      sourceName: "QuizAPI",
      sourceUrl: "https://quizapi.io/docs",
      sourceId: String(item.id),
      providerDifficulty: mapProviderDifficultyLabel(item.difficulty),
      providerCategory: item.category || "",
      tags: (item.tags || []).map((tag) => tag.name).filter(Boolean)
    }
  });
}

async function fetchQuizApiQuestions(subjects, desiredPerSubject) {
  if (!config.quizApiKey) {
    return {
      questions: [],
      warnings: ["QuizAPI integration is disabled because QUIZ_API_KEY is not configured."]
    };
  }

  const requests = QUIZ_API_DIFFICULTIES.map((difficulty) =>
    quizApiFetch({
      limit: Math.min(20, Math.max(10, desiredPerSubject)),
      difficulty
    })
  );

  const results = await Promise.allSettled(requests);
  const questions = [];
  const warnings = [];

  for (const result of results) {
    if (result.status !== "fulfilled") {
      warnings.push(`QuizAPI fetch failed: ${result.reason?.message || "Unknown error"}`);
      continue;
    }

    const payloadItems = Array.isArray(result.value)
      ? result.value
      : Array.isArray(result.value?.questions)
        ? result.value.questions
        : Array.isArray(result.value?.data)
          ? result.value.data
          : [];

    for (const item of payloadItems) {
      const mapped = buildQuizApiQuestion(item, subjects);
      if (mapped) {
        questions.push(mapped);
      }
    }
  }

  return { questions, warnings };
}

async function fetchProfileQuestions(subject, profile, pagesize) {
  const searchPayload = await stackExchangeFetch("/search/advanced", {
    site: "stackoverflow",
    pagesize,
    page: 1,
    order: "desc",
    sort: "votes",
    accepted: true,
    answers: 1,
    q: profile.query
  });

  const items = (searchPayload.items || []).filter((item) => item.accepted_answer_id);
  if (!items.length) {
    return [];
  }

  const answerIds = items.map((item) => item.accepted_answer_id).join(";");
  const answersPayload = await stackExchangeFetch(`/answers/${answerIds}`, {
    site: "stackoverflow",
    pagesize: items.length,
    order: "desc",
    sort: "votes",
    filter: "withbody"
  });

  const answerLookup = new Map(
    (answersPayload.items || []).map((answer) => [answer.answer_id, answer])
  );

  return items
    .map((item) => buildRemoteQuestion(subject, profile, item, answerLookup.get(item.accepted_answer_id)))
    .filter(Boolean);
}

export async function harvestRemoteQuestions({ subjects, questionTarget, existingQuestions = [] }) {
  if (!config.enableQuestionCrawler) {
    return { questions: [], warnings: [] };
  }

  const warnings = [];
  const desiredPerSubject = Math.max(
    5,
    Math.ceil((questionTarget * Math.max(config.remoteQuestionMultiplier, 1)) / Math.max(subjects.length, 1))
  );
  const harvested = [];

  const providerResults = await Promise.allSettled([
    (async () => {
      const subjectResults = await Promise.all(
        subjects.map(async (subject) => {
          const profiles = selectedProfilesForRun(subject, desiredPerSubject);
          const pagesize = Math.min(
            12,
            Math.max(5, Math.ceil(desiredPerSubject / Math.max(profiles.length, 1)))
          );

          const profileResults = await Promise.allSettled(
            profiles.map((profile) => fetchProfileQuestions(subject, profile, pagesize))
          );

          const subjectQuestions = [];
          for (const result of profileResults) {
            if (result.status === "fulfilled") {
              subjectQuestions.push(...result.value);
            } else {
              warnings.push(`Stack Exchange fetch for ${subject} fell back to local bank: ${result.reason?.message || "Unknown error"}`);
            }
          }

          return subjectQuestions.slice(0, desiredPerSubject * 2);
        })
      );

      return { provider: "Stack Exchange API", questions: subjectResults.flat(), warnings: [] };
    })(),
    fetchHuggingFaceQuestions(subjects, desiredPerSubject),
    fetchMmluQuestions(subjects, desiredPerSubject),
    fetchEnglishGrammarQuestions(subjects, desiredPerSubject),
    fetchOpenTriviaQuestions(subjects, desiredPerSubject),
    fetchQuizApiQuestions(subjects, desiredPerSubject)
  ]);

  for (const result of providerResults) {
    if (result.status !== "fulfilled") {
      warnings.push(`Question provider failed: ${result.reason?.message || "Unknown error"}`);
      continue;
    }

    harvested.push(...(result.value.questions || []));
    warnings.push(...(result.value.warnings || []));
  }

  const dedupedShortQuestions = dedupeQuestions(
    harvested,
    existingQuestions.map((question) => question.prompt)
  );
  const classifiedQuestions = refineQuestionAssignments(
    dedupedShortQuestions,
    subjects,
    existingQuestions
  );
  const mcqVariants = synthesizeMcqVariants(classifiedQuestions);
  const combinedQuestions = [...classifiedQuestions, ...mcqVariants];

  return {
    questions: annotateRemoteDifficulty(combinedQuestions),
    warnings: uniqueStrings(warnings)
  };
}
