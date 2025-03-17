const { db } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const {
  initializeBoard,
  makeMove,
  getGameStatus,
  switchPlayer,
} = require("../utils/gameLogic");
const { getAiMove } = require("./aiService");

class GameService {
  // Create a new game
  static async create(playerXId, isSinglePlayer = false) {
    const gameId = uuidv4();
    const initialBoard = JSON.stringify(initializeBoard()); // Serialize the board

    try {
      const result = await db.one(
        `
        INSERT INTO games (id, board, current_player, status, player_x, player_o)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          gameId,
          initialBoard, // Use the serialized board
          "X",
          isSinglePlayer ? "in_progress" : "waiting",
          playerXId,
          isSinglePlayer ? "AI" : null,
        ]
      );

      // Parse the board back to an array for the response
      result.board = JSON.parse(result.board);
      return result;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  }

  // Get game by ID
  static async getGameById(gameId) {
    try {
      const game = await db.oneOrNone(
        `
        SELECT * FROM games WHERE id = $1
        `,
        [gameId]
      );

      if (game) {
        // Parse the board from JSON string to actual array
        game.board = JSON.parse(game.board);
      }

      return game;
    } catch (error) {
      console.error("Error fetching game:", error);
      throw error;
    }
  }

  // Join an existing game as player O
  static async joinGame(gameId, playerOId) {
    try {
      const game = await db.oneOrNone(
        `
        SELECT * FROM games
        WHERE id = $1 AND status = 'waiting' AND player_o IS NULL
        `,
        [gameId]
      );

      if (!game) {
        return { success: false, message: "Game not available to join" };
      }

      const updatedGame = await db.one(
        `
        UPDATE games
        SET player_o = $1, status = 'in_progress'
        WHERE id = $2
        RETURNING *
        `,
        [playerOId, gameId]
      );

      // Parse the board back to an array
      updatedGame.board = JSON.parse(updatedGame.board);
      return { success: true, game: updatedGame };
    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  }

  // Make a move in the game
  static async makeMove(gameId, playerId, row, col) {
    try {
      const game = await this.getGameById(gameId);

      if (!game) {
        return { success: false, message: "Game not found" };
      }

      if (game.status !== "in_progress") {
        return { success: false, message: "Game is not in progress" };
      }

      const playerMark = game.player_x === playerId ? "X" : "O";

      if (playerMark !== game.current_player) {
        return { success: false, message: "Not your turn" };
      }

      const moveResult = makeMove(game.board, row, col, playerMark);

      if (!moveResult.success) {
        return { success: false, message: "Invalid move" };
      }

      const { status, winner } = getGameStatus(moveResult.board);
      const newCurrentPlayer = switchPlayer(game.current_player);

      const updatedGame = await db.one(
        `
        UPDATE games
        SET board = $1, current_player = $2, status = $3, winner = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [
          JSON.stringify(moveResult.board),
          newCurrentPlayer,
          status === "in_progress" ? "in_progress" : "finished",
          winner ? (winner === "X" ? game.player_x : game.player_o) : null,
          gameId,
        ]
      );

      // Parse the board back to an array
      updatedGame.board = JSON.parse(updatedGame.board);

      // If it's a single-player game and the game is still in progress, make AI move
      if (
        updatedGame.player_o === "AI" &&
        updatedGame.status === "in_progress"
      ) {
        await this.makeAiMove(gameId);
      }

      return { success: true, game: updatedGame };
    } catch (error) {
      console.error("Error making move:", error);
      throw error;
    }
  }

  // Make an AI move in single-player mode
  static async makeAiMove(gameId) {
    try {
      const game = await this.getGameById(gameId);

      if (!game || game.status !== "in_progress" || game.player_o !== "AI") {
        return { success: false, message: "Invalid game for AI move" };
      }

      const aiMove = getAiMove(game.board);

      if (!aiMove) {
        return { success: false, message: "AI could not determine a move" };
      }

      const moveResult = makeMove(game.board, aiMove.row, aiMove.col, "O");

      const { status, winner } = getGameStatus(moveResult.board);
      const newCurrentPlayer = switchPlayer(game.current_player);

      const updatedGame = await db.one(
        `
        UPDATE games
        SET board = $1, current_player = $2, status = $3, winner = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [
          JSON.stringify(moveResult.board),
          newCurrentPlayer,
          status === "in_progress" ? "in_progress" : "finished",
          winner ? (winner === "X" ? game.player_x : game.player_o) : null,
          gameId,
        ]
      );

      // Parse the board back to an array
      updatedGame.board = JSON.parse(updatedGame.board);

      return { success: true, game: updatedGame };
    } catch (error) {
      console.error("Error making AI move:", error);
      throw error;
    }
  }
}

module.exports = GameService;
