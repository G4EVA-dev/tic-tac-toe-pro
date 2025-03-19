const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const { setupSocketControllers } = require("./socket/socketController");
const gameRoutes = require("./routes/gameRoutes");
const sessionMiddleware = require("./middleware/sessionMiddleware");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Set up CORS middleware
app.use(
  cors({
    origin: "https://tic-tac-toe-pro-inky.vercel.app/",
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session handling middleware
app.use(sessionMiddleware);

// Set up Socket.IO with CORS
const io = socketIO(server, {
  cors: {
    origin: "https://tic-tac-toe-pro-inky.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Set up socket controllers
setupSocketControllers(io);

// API routes
app.use("/api/games", gameRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
