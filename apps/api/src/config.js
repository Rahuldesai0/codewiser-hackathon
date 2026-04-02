export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/adaptive_quiz",
  intelligenceUrl:
    process.env.INTELLIGENCE_URL || "http://127.0.0.1:8000",
  clientUrl: process.env.CLIENT_URL || "http://127.0.0.1:5173",
  enableQuestionCrawler: process.env.ENABLE_QUESTION_CRAWLER !== "false",
  enableBackgroundQuestionCrawler:
    process.env.ENABLE_BACKGROUND_QUESTION_CRAWLER !== "false",
  stackExchangeApiBase:
    process.env.STACKEXCHANGE_API_BASE || "https://api.stackexchange.com/2.3",
  stackExchangeKey: process.env.STACKEXCHANGE_KEY || "",
  openTriviaApiBase:
    process.env.OPEN_TRIVIA_API_BASE || "https://opentdb.com/api.php",
  huggingFaceDatasetApiBase:
    process.env.HUGGINGFACE_DATASET_API_BASE || "https://datasets-server.huggingface.co/rows",
  huggingFaceDatasetName:
    process.env.HUGGINGFACE_DATASET_NAME || "lmms-lab/CSBench_MCQ",
  huggingFaceDatasetConfig:
    process.env.HUGGINGFACE_DATASET_CONFIG || "default",
  huggingFaceDatasetSplit:
    process.env.HUGGINGFACE_DATASET_SPLIT || "mcq",
  huggingFaceDatasetEnabled:
    process.env.HUGGINGFACE_DATASET_ENABLED !== "false",
  huggingFaceDatasetLength:
    Number(process.env.HUGGINGFACE_DATASET_LENGTH || 100),
  huggingFaceDatasetMaxPages:
    Number(process.env.HUGGINGFACE_DATASET_MAX_PAGES || 10),
  huggingFaceDatasetEstimatedRows:
    Number(process.env.HUGGINGFACE_DATASET_ESTIMATED_ROWS || 1336),
  quizApiBase:
    process.env.QUIZ_API_BASE || "https://quizapi.io/api/v1",
  quizApiKey: process.env.QUIZ_API_KEY || "",
  enableQuestionImports: process.env.ENABLE_QUESTION_IMPORTS !== "false",
  questionImportDirectory:
    process.env.QUESTION_IMPORT_DIRECTORY || "data/question-imports",
  remoteQuestionMultiplier: Number(process.env.REMOTE_QUESTION_MULTIPLIER || 3),
  crawlerMinimumGapMs: Number(process.env.CRAWLER_MINIMUM_GAP_MS || 1000 * 60 * 10),
  crawlerProviderBackoffMs: Number(process.env.CRAWLER_PROVIDER_BACKOFF_MS || 1000 * 60 * 30),
  crawlerIntervalMs: Number(process.env.CRAWLER_INTERVAL_MS || 1000 * 60 * 20),
  crawlerStartupDelayMs: Number(process.env.CRAWLER_STARTUP_DELAY_MS || 10000),
  crawlerHarvestTarget: Number(process.env.CRAWLER_HARVEST_TARGET || 120)
};
