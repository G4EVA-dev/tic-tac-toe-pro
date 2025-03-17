import React, { useState } from "react";
import "../styles/GameBoard.css";

const GameBoard = ({ board, onCellClick, disabled, currentPlayer, winner }) => {
  const [lastMove, setLastMove] = useState(null);

  const handleClick = (rowIndex, colIndex) => {
    if (board[rowIndex][colIndex] === null && !disabled && !winner) {
      setLastMove({ row: rowIndex, col: colIndex });
      onCellClick(rowIndex, colIndex);
    }
  };

  // Check if a cell is part of the winning combination
  const isWinningCell = (rowIndex, colIndex) => {
    if (!winner || winner === "draw") return false;

    // Check horizontal
    if (
      board[rowIndex][0] === board[rowIndex][1] &&
      board[rowIndex][1] === board[rowIndex][2] &&
      board[rowIndex][0] !== null
    ) {
      return true;
    }

    // Check vertical
    if (
      board[0][colIndex] === board[1][colIndex] &&
      board[1][colIndex] === board[2][colIndex] &&
      board[0][colIndex] !== null
    ) {
      return true;
    }

    // Check diagonal top-left to bottom-right
    if (
      rowIndex === colIndex &&
      board[0][0] === board[1][1] &&
      board[1][1] === board[2][2] &&
      board[0][0] !== null
    ) {
      return true;
    }

    // Check diagonal top-right to bottom-left
    if (
      rowIndex + colIndex === 2 &&
      board[0][2] === board[1][1] &&
      board[1][1] === board[2][0] &&
      board[0][2] !== null
    ) {
      return true;
    }

    return false;
  };

  return (
    <div className={`game-board ${winner ? "game-over" : ""}`}>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => {
            const isLastMove =
              lastMove &&
              lastMove.row === rowIndex &&
              lastMove.col === colIndex;
            const isWinning = isWinningCell(rowIndex, colIndex);

            return (
              <button
                key={colIndex}
                className={`cell ${cell || ""} ${
                  isLastMove ? "last-move" : ""
                } ${isWinning ? "winning" : ""} ${
                  disabled && cell === null ? "disabled" : ""
                }`}
                onClick={() => handleClick(rowIndex, colIndex)}
                disabled={disabled || cell !== null || winner}
                aria-label={`Cell ${rowIndex}-${colIndex}`}
              >
                {cell && (
                  <span className="cell-content">
                    {cell === "X" ? (
                      <svg className="x-mark" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="o-mark" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                    )}
                  </span>
                )}
                {!cell && !disabled && !winner && (
                  <span className="cell-hover">
                    {currentPlayer === "X" ? (
                      <svg className="x-mark hover" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="o-mark hover" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      {winner === "draw" && (
        <div className="game-over-overlay draw">
          <span>Draw!</span>
        </div>
      )}
      {winner && winner !== "draw" && (
        <div className="game-over-overlay win">
          <span>Winner: {winner}</span>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
