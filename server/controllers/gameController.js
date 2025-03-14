const Game = require("../models/Game");

// Create a new game
const createGame = async (req, res) => {
  try {
    const { isSinglePlayer } = req.body;
    const playerXId = req.sessionId;

    const game = await Game.create(playerXId, isSinglePlayer);

    res.status(201).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ success: false, message: "Failed to create game" });
  }
};

// Get a game by ID
const getGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.getById(gameId);

    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Error getting game:", error);
    res.status(500).json({ success: false, message: "Failed to get game" });
  }
};

// Get all available games
const getAvailableGames = async (req, res) => {
  try {
    const games = await Game.getAvailableGames();

    res.status(200).json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Error getting available games:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get available games" });
  }
};

// Join a game
const joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerOId = req.sessionId;

    const result = await Game.joinGame(gameId, playerOId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.status(200).json({
      success: true,
      game: result.game,
    });
  } catch (error) {
    console.error("Error joining game:", error);
    res.status(500).json({ success: false, message: "Failed to join game" });
  }
};

// Make a move
const makeMove = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { row, col } = req.body;
    const playerId = req.sessionId;

    const result = await Game.makeMove(gameId, playerId, row, col);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.status(200).json({
      success: true,
      game: result.game,
    });
  } catch (error) {
    console.error("Error making move:", error);
    res.status(500).json({ success: false, message: "Failed to make move" });
  }
};

// Get player's active games
const getPlayerGames = async (req, res) => {
  try {
    const playerId = req.sessionId;
    const games = await Game.getPlayerGames(playerId);

    res.status(200).json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Error getting player games:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get player games" });
  }
};

// Join a game as spectator
const joinAsSpectator = async (req, res) => {
  try {
    const { gameId } = req.params;
    const spectatorId = req.sessionId;

    const result = await Game.joinAsSpectator(gameId, spectatorId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.status(200).json({
      success: true,
      game: result.game,
    });
  } catch (error) {
    console.error("Error joining as spectator:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to join as spectator" });
  }
};

module.exports = {
  createGame,
  getGame,
  getAvailableGames,
  joinGame,
  makeMove,
  getPlayerGames,
  joinAsSpectator,
};
