const { db } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const {
  initializeBoard,
  makeMove,
  getGameStatus,
  switchPlayer,
} = require("../utils/gameLogic");
const { getAiMove } = require("../services/aiService");

class Game {
  // Create a new game
  static async create(playerXId, isSinglePlayer = false) {
    const gameId = uuidv4();
    const initialBoard = initializeBoard();

    try {
      const result = await db.one(
        `
        INSERT INTO games(id, board, current_player, status, player_x, player_o)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [
          gameId,
          JSON.stringify(initialBoard),
          "X", // First player is always X
          "waiting", // Initial status: waiting for second player or for first move in single player
          playerXId,
          isSinglePlayer ? "AI" : null, // Set player_o to 'AI' in single player mode
        ]
      );

      // If it's a single player game, update status to in_progress
      if (isSinglePlayer) {
        await db.none(
          `
          UPDATE games
          SET status = 'in_progress'
          WHERE id = $1
        `,
          [gameId]
        );

        result.status = "in_progress";
      }

      return result;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  }

  // Get game by ID
  static async getById(gameId) {
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
      console.error("Error getting game:", error);
      throw error;
    }
  }

  // Get all available games (status = 'waiting')
  static async getAvailableGames() {
    try {
      const games = await db.manyOrNone(`
        SELECT * FROM games WHERE status = 'waiting' AND player_o IS NULL
        ORDER BY created_at DESC
      `);

      // Parse the board for each game
      games.forEach((game) => {
        game.board = JSON.parse(game.board);
      });

      return games;
    } catch (error) {
      console.error("Error getting available games:", error);
      throw error;
    }
  }

  // Join a game as player O
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

      // Update the game with the new player
      const updatedGame = await db.one(
        `
        UPDATE games
        SET player_o = $1, status = 'in_progress'
        WHERE id = $2
        RETURNING *
      `,
        [playerOId, gameId]
      );

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
      // Get the current game state
      const game = await this.getById(gameId);

      if (!game) {
        return { success: false, message: "Game not found" };
      }

      // Check if game is still in progress
      if (game.status !== "in_progress") {
        return { success: false, message: "Game is not in progress" };
      }

      // Check if it's the player's turn
      const playerMark = game.player_x === playerId ? "X" : "O";
      if (playerMark !== game.current_player) {
        return { success: false, message: "Not your turn" };
      }

      // Make the move
      const moveResult = makeMove(game.board, row, col, playerMark);
      if (!moveResult.success) {
        return { success: false, message: "Invalid move" };
      }

      // Check game status after move
      const { status, winner } = getGameStatus(moveResult.board);
      const newCurrentPlayer = switchPlayer(game.current_player);

      // Update the game in the database
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

      updatedGame.board = JSON.parse(updatedGame.board);

      // If it's a single player game and the game is still in progress, make AI move
      if (
        updatedGame.player_o === "AI" &&
        updatedGame.status === "in_progress"
      ) {
        return await this.makeAiMove(gameId);
      }

      return { success: true, game: updatedGame };
    } catch (error) {
      console.error("Error making move:", error);
      throw error;
    }
  }

  // Make AI move in single player game
  static async makeAiMove(gameId) {
    try {
      // Get the current game state
      const game = await this.getById(gameId);

      if (!game || game.status !== "in_progress" || game.player_o !== "AI") {
        return { success: false, message: "Invalid game for AI move" };
      }

      // Get AI move
      const aiMove = getAiMove(game.board);
      if (!aiMove) {
        return { success: false, message: "AI could not determine a move" };
      }

      // Make the move
      const moveResult = makeMove(game.board, aiMove.row, aiMove.col, "O");

      // Check game status after move
      const { status, winner } = getGameStatus(moveResult.board);
      const newCurrentPlayer = switchPlayer(game.current_player);

      // Update the game in the database
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

      updatedGame.board = JSON.parse(updatedGame.board);
      return { success: true, game: updatedGame };
    } catch (error) {
      console.error("Error making AI move:", error);
      throw error;
    }
  }

  // Join a game as spectator
  static async joinAsSpectator(gameId, spectatorId) {
    try {
      // Check if game exists
      const game = await this.getById(gameId);
      if (!game) {
        return { success: false, message: "Game not found" };
      }

      // Add spectator to the spectators table
      await db.none(
        `
        INSERT INTO spectators(game_id, session_id)
        VALUES($1, $2)
        ON CONFLICT (game_id, session_id) DO NOTHING
      `,
        [gameId, spectatorId]
      );

      return { success: true, game };
    } catch (error) {
      console.error("Error joining as spectator:", error);
      throw error;
    }
  }

  // Get spectators for a game
  static async getSpectators(gameId) {
    try {
      const spectators = await db.manyOrNone(
        `
        SELECT session_id FROM spectators
        WHERE game_id = $1
      `,
        [gameId]
      );

      return spectators.map((s) => s.session_id);
    } catch (error) {
      console.error("Error getting spectators:", error);
      throw error;
    }
  }

  // Get player's active games
  static async getPlayerGames(playerId) {
    try {
      const games = await db.manyOrNone(
        `
        SELECT * FROM games 
        WHERE (player_x = $1 OR player_o = $1) AND status != 'finished'
        ORDER BY updated_at DESC
      `,
        [playerId]
      );

      games.forEach((game) => {
        game.board = JSON.parse(game.board);
      });

      return games;
    } catch (error) {
      console.error("Error getting player games:", error);
      throw error;
    }
  }
}

module.exports = Game;
