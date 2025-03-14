const pgp = require("pg-promise")();

const dbConfig = {
  host: process.env.DB_HOST || "localhost", // Use 'localhost' if running locally
  port: process.env.DB_PORT || 5434, // Use port 5434 (mapped to your new PostgreSQL container)
  database: process.env.DB_NAME || "tictactoe",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
};

const db = pgp(dbConfig);

module.exports = { db };
