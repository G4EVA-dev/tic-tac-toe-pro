const Game = require("../models/Game");

const setupSocketControllers = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join a game room
    socket.on("joinRoom", async (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);

      // Emit the current game state to the user
      const game = await Game.getById(roomId);
      if (game) {
        socket.emit("gameState", game);
      }
    });

    // Handle player moves
    socket.on("makeMove", async (data) => {
      const { gameId, playerId, row, col } = data;
      const result = await Game.makeMove(gameId, playerId, row, col);

      if (result.success) {
        // Broadcast the updated game state to all users in the room
        io.to(gameId).emit("gameState", result.game);
      } else {
        // Notify the player of the error
        socket.emit("moveError", result.message);
      }
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = { setupSocketControllers };
