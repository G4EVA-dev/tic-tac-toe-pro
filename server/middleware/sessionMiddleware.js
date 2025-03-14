const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/db");

// Middleware to handle user sessions
const sessionMiddleware = async (req, res, next) => {
  try {
    // Check if session ID exists in cookie
    let sessionId = req.headers["x-session-id"];

    // If no session ID exists, create a new one
    if (!sessionId) {
      sessionId = uuidv4();

      // Store the new session in the database
      await db.none("INSERT INTO sessions(id) VALUES($1)", [sessionId]);

      // Set the session ID in the response header
      res.setHeader("X-Session-Id", sessionId);
    } else {
      // Check if session exists in database
      const sessionExists = await db.oneOrNone(
        "SELECT id FROM sessions WHERE id = $1",
        [sessionId]
      );

      // If session doesn't exist in database, create it
      if (!sessionExists) {
        await db.none("INSERT INTO sessions(id) VALUES($1)", [sessionId]);
      }
    }

    // Attach session ID to request object for use in route handlers
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error("Session middleware error:", error);
    next(error);
  }
};

module.exports = sessionMiddleware;
