const express = require("express");
const gameController = require("../controllers/gameController");
const router = express.Router();

/**
 * @route   POST /api/games
 * @desc    Create a new game
 * @access  Public
 */
router.post("/create", gameController.createGame);

/**
 * @route   GET /api/games/available
 * @desc    Get all available games to join
 * @access  Public
 */
router.get("/available", gameController.getAvailableGames);

/**
 * @route   GET /api/games/my-games
 * @desc    Get current player's active games
 * @access  Public
 */
router.get("/my-games", gameController.getPlayerGames);

/**
 * @route   GET /api/games/:gameId
 * @desc    Get game details by ID
 * @access  Public
 */
router.get("/:gameId", gameController.getGame);

/**
 * @route   POST /api/games/:gameId/join
 * @desc    Join an existing game as player O
 * @access  Public
 */
router.post("/:gameId/join", gameController.joinGame);

/**
 * @route   POST /api/games/:gameId/spectate
 * @desc    Join a game as spectator
 * @access  Public
 */
router.post("/:gameId/spectate", gameController.joinAsSpectator);

/**
 * @route   POST /api/games/:gameId/move
 * @desc    Make a move in the game
 * @access  Public
 */
router.post("/:gameId/move", gameController.makeMove);

module.exports = router;
