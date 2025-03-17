import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import "../styles/Home.css";

const Home = () => {
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();

    socket.on("gameCreated", (game) => {
      console.log("New game created:", game);
      setNotification({
        message: `Game created with ID: ${game.id}`,
        type: "success",
      });
      setTimeout(() => setNotification(null), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createGame = async () => {
    try {
      setLoading(true);
      const playerId = Math.random().toString(36).substring(7);
      const response = await fetch(
        `https://tic-tac-toe-mexico.onrender.com/api/games/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerXId: playerId, isSinglePlayer: false }),
        }
      );
      const game = await response.json();
      navigate(`/game/${game.id}`, { state: { playerId } });
    } catch (error) {
      setNotification({
        message: "Failed to create game. Please try again.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async () => {
    if (!gameId.trim()) {
      setNotification({
        message: "Please enter a game ID",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      setLoading(true);
      const playerId = Math.random().toString(36).substring(7);
      const response = await fetch(
        `https://tic-tac-toe-mexico.onrender.com/api/games/${gameId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerOId: playerId }),
        }
      );
      const result = await response.json();
      if (result.success) {
        navigate(`/game/${gameId}`, { state: { playerId } });
      } else {
        setNotification({
          message: result.message || "Failed to join game",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      setNotification({
        message: "Failed to join game. Please try again.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="game-title">Tic Tac Toe</h1>
        <div className="game-subtitle">Play with friends online!</div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="action-buttons">
          <button
            className="primary-button create-game"
            onClick={createGame}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create New Game"}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="join-game-container">
            <input
              type="text"
              className="game-id-input"
              placeholder="Enter Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              disabled={loading}
            />
            <button
              className="primary-button join-game"
              onClick={joinGame}
              disabled={loading}
            >
              {loading ? "Joining..." : "Join Game"}
            </button>
          </div>
        </div>

        <div className="game-instructions">
          <h3>How to play:</h3>
          <ol>
            <li>Create a game or join an existing one</li>
            <li>Share the game ID with your friend</li>
            <li>Take turns making moves</li>
            <li>Get three in a row to win!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;
