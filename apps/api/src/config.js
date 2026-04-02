export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/adaptive_quiz",
  intelligenceUrl:
    process.env.INTELLIGENCE_URL || "http://127.0.0.1:8000",
  clientUrl: process.env.CLIENT_URL || "http://127.0.0.1:5173"
};

