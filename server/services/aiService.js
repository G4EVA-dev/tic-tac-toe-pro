const { isValidMove } = require("../utils/gameLogic");

// Simple AI implementation for Tic Tac Toe
const getAiMove = (board, difficulty = "medium") => {
  switch (difficulty) {
    case "easy":
      return getRandomMove(board);
    case "medium":
      return getMediumMove(board);
    case "hard":
      return getBestMove(board, "O");
    default:
      return getMediumMove(board);
  }
};

// Easy AI: Random valid moves
const getRandomMove = (board) => {
  const availableMoves = [];

  // Collect all available moves
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (isValidMove(board, row, col)) {
        availableMoves.push({ row, col });
      }
    }
  }

  // Return a random move from available moves
  if (availableMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  return null; // No moves available
};

// Medium AI: Prioritizes winning and blocking
const getMediumMove = (board) => {
  const aiPlayer = "O";
  const humanPlayer = "X";

  // First, check if AI can win in the next move
  const winningMove = findWinningMove(board, aiPlayer);
  if (winningMove) {
    return winningMove;
  }

  // Second, check if the opponent can win and block it
  const blockingMove = findWinningMove(board, humanPlayer);
  if (blockingMove) {
    return blockingMove;
  }

  // If center is available, take it
  if (isValidMove(board, 1, 1)) {
    return { row: 1, col: 1 };
  }

  // If no strategic move, make a random move
  return getRandomMove(board);
};

// Find a move that would win the game for the specified player
const findWinningMove = (board, player) => {
  // Check rows
  for (let row = 0; row < 3; row++) {
    const result = checkLineForWin(
      [board[row][0], board[row][1], board[row][2]],
      player,
      (col) => ({ row, col })
    );
    if (result) return result;
  }

  // Check columns
  for (let col = 0; col < 3; col++) {
    const result = checkLineForWin(
      [board[0][col], board[1][col], board[2][col]],
      player,
      (row) => ({ row, col })
    );
    if (result) return result;
  }

  // Check first diagonal
  const diag1Result = checkLineForWin(
    [board[0][0], board[1][1], board[2][2]],
    player,
    (i) => ({ row: i, col: i })
  );
  if (diag1Result) return diag1Result;

  // Check second diagonal
  const diag2Result = checkLineForWin(
    [board[0][2], board[1][1], board[2][0]],
    player,
    (i) => ({ row: i, col: 2 - i })
  );
  if (diag2Result) return diag2Result;

  return null;
};

// Check if a line has two of player's marks and one empty cell
const checkLineForWin = (line, player, positionMapper) => {
  const playerCells = line.filter((cell) => cell === player).length;
  const emptyCells = line.filter((cell) => cell === null).length;

  if (playerCells === 2 && emptyCells === 1) {
    const emptyIndex = line.findIndex((cell) => cell === null);
    return positionMapper(emptyIndex);
  }

  return null;
};

// Hard AI: Minimax algorithm for optimal moves
const getBestMove = (board, player) => {
  let bestScore = -Infinity;
  let bestMove = null;

  // Try each available move
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (isValidMove(board, row, col)) {
        // Make the move
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[row][col] = player;

        // Calculate score for this move using minimax
        const score = minimax(newBoard, 0, false);

        // Update best move if this one is better
        if (score > bestScore) {
          bestScore = score;
          bestMove = { row, col };
        }
      }
    }
  }

  return bestMove;
};

// Minimax algorithm implementation
const minimax = (board, depth, isMaximizing) => {
  // Terminal states
  const result = evaluateBoard(board);
  if (result !== null) {
    return result;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    // Try each available move
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (isValidMove(board, row, col)) {
          // Make the move
          const newBoard = JSON.parse(JSON.stringify(board));
          newBoard[row][col] = "O";

          // Recursively call minimax
          const score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    // Try each available move
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (isValidMove(board, row, col)) {
          // Make the move
          const newBoard = JSON.parse(JSON.stringify(board));
          newBoard[row][col] = "X";

          // Recursively call minimax
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
};

// Evaluate board state for minimax
const evaluateBoard = (board) => {
  // Check for win conditions
  // Check rows, columns, and diagonals
  for (let i = 0; i < 3; i++) {
    // Check rows
    if (
      board[i][0] &&
      board[i][0] === board[i][1] &&
      board[i][0] === board[i][2]
    ) {
      return board[i][0] === "O" ? 10 : -10;
    }

    // Check columns
    if (
      board[0][i] &&
      board[0][i] === board[1][i] &&
      board[0][i] === board[2][i]
    ) {
      return board[0][i] === "O" ? 10 : -10;
    }
  }

  // Check diagonals
  if (
    board[0][0] &&
    board[0][0] === board[1][1] &&
    board[0][0] === board[2][2]
  ) {
    return board[0][0] === "O" ? 10 : -10;
  }

  if (
    board[0][2] &&
    board[0][2] === board[1][1] &&
    board[0][2] === board[2][0]
  ) {
    return board[0][2] === "O" ? 10 : -10;
  }

  // Check for a draw
  let isDraw = true;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        isDraw = false;
        break;
      }
    }
    if (!isDraw) break;
  }

  if (isDraw) return 0;

  return null; // Game still in progress
};

module.exports = {
  getAiMove,
};
