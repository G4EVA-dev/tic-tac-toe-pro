/**
 * Game logic utilities for tic-tac-toe
 */

// Initialize a new tic-tac-toe board (3x3 grid of null values)
function initializeBoard() {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

/**
 * Make a move on the board
 * @param {Array} board - Current game board
 * @param {Number} row - Row index (0-2)
 * @param {Number} col - Column index (0-2)
 * @param {String} player - Player symbol ('X' or 'O')
 * @returns {Object} Result containing success status and updated board
 */
function makeMove(board, row, col, player) {
  // Validate row and column
  if (row < 0 || row > 2 || col < 0 || col > 2) {
    return { success: false, message: "Invalid position" };
  }

  // Check if the cell is already occupied
  if (board[row][col] !== null) {
    return { success: false, message: "Cell already occupied" };
  }

  // Make a copy of the board to avoid mutation
  const newBoard = board.map((row) => [...row]);

  // Place the move
  newBoard[row][col] = player;

  return { success: true, board: newBoard };
}

/**
 * Check the game status
 * @param {Array} board - Current game board
 * @returns {Object} Game status (in_progress, finished) and winner (X, O, or null for draw)
 */
function getGameStatus(board) {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] !== null &&
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2]
    ) {
      return { status: "finished", winner: board[i][0] };
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (
      board[0][i] !== null &&
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i]
    ) {
      return { status: "finished", winner: board[0][i] };
    }
  }

  // Check diagonals
  if (
    board[0][0] !== null &&
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  ) {
    return { status: "finished", winner: board[0][0] };
  }

  if (
    board[0][2] !== null &&
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  ) {
    return { status: "finished", winner: board[0][2] };
  }

  // Check for draw (all cells filled)
  let isDraw = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        isDraw = false;
        break;
      }
    }
    if (!isDraw) break;
  }

  if (isDraw) {
    return { status: "finished", winner: null };
  }

  // Game is still in progress
  return { status: "in_progress", winner: null };
}

/**
 * Switch the current player
 * @param {String} currentPlayer - Current player ('X' or 'O')
 * @returns {String} Next player
 */
function switchPlayer(currentPlayer) {
  return currentPlayer === "X" ? "O" : "X";
}

module.exports = {
  initializeBoard,
  makeMove,
  getGameStatus,
  switchPlayer,
};
