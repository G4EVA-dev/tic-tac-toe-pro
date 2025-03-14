import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import GameBoard from "../components/GameBoard";
import "../styles/Game.css";

const Game = () => {
  const { id: gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const playerId = location.state?.playerId;

  const [board, setBoard] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [status, setStatus] = useState("Waiting for players...");
  const [isDisabled, setIsDisabled] = useState(true);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState({
    X: null,
    O: null,
  });

  useEffect(() => {
    if (!playerId) {
      navigate("/");
      return;
    }

    socket.connect();
    socket.emit("joinRoom", { gameId, playerId });

    socket.on("gameState", (game) => {
      setBoard(game.board);
      setCurrentPlayer(game.current_player);

      if (game.playerX === playerId) {
        setPlayerSymbol("X");
      } else if (game.playerO === playerId) {
        setPlayerSymbol("O");
      }

      setPlayers({
        X: game.playerX,
        O: game.playerO,
      });

      if (game.winner) {
        setWinner(game.winner);
        setGameOver(true);
        setStatus(
          game.winner === "draw"
            ? "Game ended in a draw!"
            : `Player ${game.winner} wins!`
        );
      } else if (!game.playerO) {
        setStatus("Waiting for player O to join...");
        setIsDisabled(true);
      } else {
        const isMyTurn =
          (game.current_player === "X" && game.playerX === playerId) ||
          (game.current_player === "O" && game.playerO === playerId);
        setIsDisabled(!isMyTurn);
        setStatus(
          isMyTurn
            ? "Your turn!"
            : `Waiting for player ${game.current_player}...`
        );
      }
    });

    return () => {
      socket.off("gameState");
      socket.disconnect();
    };
  }, [gameId, playerId, navigate]);

  const handleCellClick = (row, col) => {
    if (!isDisabled && !gameOver) {
      socket.emit("makeMove", { gameId, playerId, row, col });
    }
  };

  const resetGame = () => {
    socket.emit("resetGame", { gameId });
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Tic Tac Toe</h1>

      <div className="game-info">
        <div className="game-id-container">
          <span>Game ID: {gameId}</span>
          <button
            className="copy-button"
            onClick={copyGameId}
            title="Copy game ID"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="player-info">
          You are player{" "}
          <span className={`player-symbol ${playerSymbol}`}>
            {playerSymbol}
          </span>
        </div>

        <div className={`game-status ${gameOver ? "game-over" : ""}`}>
          {status}
        </div>
      </div>

      <GameBoard
        board={board}
        onCellClick={handleCellClick}
        disabled={isDisabled}
        currentPlayer={currentPlayer}
        winner={winner}
      />

      {gameOver && (
        <div className="game-over-actions">
          <button className="primary-button" onClick={resetGame}>
            Play Again
          </button>
          <button className="secondary-button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      )}

      <div className="players-status">
        <div
          className={`player player-x ${currentPlayer === "X" ? "active" : ""}`}
        >
          Player X {players.X ? "(Joined)" : "(Waiting)"}
        </div>
        <div
          className={`player player-o ${currentPlayer === "O" ? "active" : ""}`}
        >
          Player O {players.O ? "(Joined)" : "(Waiting)"}
        </div>
      </div>
    </div>
  );
};

export default Game;
