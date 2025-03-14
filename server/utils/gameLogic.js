// Game board representation:
// [
//   [null, null, null],
//   [null, null, null],
//   [null, null, null]
// ]
// where null = empty, 'X' = player X, 'O' = player O

// Initialize a new game board
const initializeBoard = () => {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
};

// Check if a move is valid
const isValidMove = (board, row, col) => {
  // Check if position is within bounds
  if (row < 0 || row > 2 || col < 0 || col > 2) {
    return false;
  }

  // Check if position is empty
  return board[row][col] === null;
};

// Make a move on the board
const makeMove = (board, row, col, player) => {
  if (!isValidMove(board, row, col)) {
    return { success: false, board };
  }

  // Create a deep copy of the board
  const newBoard = JSON.parse(JSON.stringify(board));
  newBoard[row][col] = player;

  return { success: true, board: newBoard };
};

// Check if there's a winner
const checkWinner = (board) => {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] &&
      board[i][0] === board[i][1] &&
      board[i][0] === board[i][2]
    ) {
      return board[i][0];
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (
      board[0][i] &&
      board[0][i] === board[1][i] &&
      board[0][i] === board[2][i]
    ) {
      return board[0][i];
    }
  }

  // Check diagonals
  if (
    board[0][0] &&
    board[0][0] === board[1][1] &&
    board[0][0] === board[2][2]
  ) {
    return board[0][0];
  }

  if (
    board[0][2] &&
    board[0][2] === board[1][1] &&
    board[0][2] === board[2][0]
  ) {
    return board[0][2];
  }

  return null;
};

// Check if the game is a draw
const isDraw = (board) => {
  // If there's no winner and no empty cells, it's a draw
  return (
    !checkWinner(board) &&
    board.every((row) => row.every((cell) => cell !== null))
  );
};

// Get game status
const getGameStatus = (board) => {
  const winner = checkWinner(board);

  if (winner) {
    return { status: "finished", winner };
  }

  if (isDraw(board)) {
    return { status: "draw", winner: null };
  }

  return { status: "in_progress", winner: null };
};

// Switch player turn
const switchPlayer = (currentPlayer) => {
  return currentPlayer === "X" ? "O" : "X";
};

module.exports = {
  initializeBoard,
  isValidMove,
  makeMove,
  checkWinner,
  isDraw,
  getGameStatus,
  switchPlayer,
};
