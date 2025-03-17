import { io } from "socket.io-client";

const SOCKET_URL = "https://tic-tac-toe-mexico.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Manually connect when needed
});
