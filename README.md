
# Tic Tac Toe Web App

![image](https://github.com/user-attachments/assets/8c432628-3feb-4cb7-b8f9-30683efc8742)
![Uploading image.png…]()


A fully functional Tic Tac Toe web application that allows users to play against the computer (AI opponent), play against other users in multiplayer mode, and spectate ongoing games. The app is built with **React** for the frontend and **Express.js** for the backend, with **PostgreSQL** as the database. The entire application is Dockerized and deployed using **Render**.

---

## Features

- **Single Player Mode**: Play against a basic AI opponent.
- **Multiplayer Mode**: Create or join a game room to play against another user.
- **Spectator Mode**: Join an ongoing game as a spectator.
- **Real-Time Updates**: WebSocket support for real-time game updates.
- **No Authentication Required**: Temporary session IDs are assigned to users upon visiting the site.
- **Responsive Design**: Clean and responsive UI built with React.

---

## Technologies Used

### Frontend
- **React**: Frontend framework for building the user interface.
- **Socket.IO Client**: Real-time communication with the backend.

### Backend
- **Express.js**: Backend framework for handling API requests.
- **Socket.IO**: Real-time communication with the frontend.
- **PostgreSQL**: Database for storing game states and session data.

### DevOps
- **Docker**: Containerization for easy deployment.
- **Render**: Cloud platform for hosting the application.

---

## Getting Started

### Prerequisites
- **Node.js**: Ensure Node.js is installed on your machine.
- **PostgreSQL**: Ensure PostgreSQL is installed and running.
- **Docker**: Ensure Docker is installed (optional, for containerization).

---

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/tic-tac-toe.git
   cd tic-tac-toe
   ```

2. **Set Up the Backend**:
   - Navigate to the `server/` directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file and add the following environment variables:
     ```env
     DB_HOST=your-database-host
     DB_PORT=5432
     DB_NAME=tictactoe
     DB_USER=your-database-user
     DB_PASSWORD=your-database-password
     PORT=5000
     ```

3. **Set Up the Frontend**:
   - Navigate to the `client/` directory:
     ```bash
     cd ../client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file and add the following environment variable:
     ```env
     REACT_APP_SOCKET_URL=http://localhost:5000
     ```

4. **Set Up the Database**:
   - Connect to your PostgreSQL database and create the `tictactoe` database:
     ```sql
     CREATE DATABASE tictactoe;
     ```
   - Run the following SQL queries to create the required tables:
     ```sql
     CREATE TABLE sessions (
       id VARCHAR(36) PRIMARY KEY,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );

     CREATE TABLE games (
       id VARCHAR(36) PRIMARY KEY,
       board JSON NOT NULL,
       current_player CHAR(1) NOT NULL,
       status VARCHAR(20) NOT NULL,
       player_x VARCHAR(36),
       player_o VARCHAR(36),
       winner VARCHAR(36),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );

     CREATE TABLE spectators (
       game_id VARCHAR(36) REFERENCES games(id),
       session_id VARCHAR(36) REFERENCES sessions(id),
       joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (game_id, session_id)
     );
     ```

---

### Running the Application

1. **Run the Backend**:
   - Navigate to the `server/` directory:
     ```bash
     cd server
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

2. **Run the Frontend**:
   - Navigate to the `client/` directory:
     ```bash
     cd ../client
     ```
   - Start the frontend development server:
     ```bash
     npm start
     ```

3. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

---

### Docker Deployment

1. **Build and Run with Docker Compose**:
   - Navigate to the root directory:
     ```bash
     cd ..
     ```
   - Build and run the application using Docker Compose:
     ```bash
     docker-compose up --build
     ```

2. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

---

### Deployment to Render

1. **Backend**:
   - Go to the Render dashboard and create a new **Web Service**.
   - Connect your GitHub repository and configure the backend service.

2. **Frontend**:
   - Go to the Render dashboard and create a new **Static Site**.
   - Connect your GitHub repository and configure the frontend service.

3. **PostgreSQL Database**:
   - Go to the Render dashboard and create a new **PostgreSQL** database.
   - Update the environment variables in your backend service with the new database credentials.

---

## API Documentation

### Endpoints

- **Create a Game**:
  - **POST** `/api/games/create`
  - Request Body:
    ```json
    {
      "isSinglePlayer": false
    }
    ```

- **Join a Game**:
  - **POST** `/api/games/:gameId/join`
  - Request Body:
    ```json
    {
      "playerOId": "player2"
    }
    ```

- **Make a Move**:
  - **POST** `/api/games/:gameId/move`
  - Request Body:
    ```json
    {
      "playerId": "player1",
      "row": 0,
      "col": 0
    }
    ```

- **Get Game Details**:
  - **GET** `/api/games/:gameId`

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [React](https://reactjs.org/) for the frontend framework.
- [Express.js](https://expressjs.com/) for the backend framework.
- [Socket.IO](https://socket.io/) for real-time communication.
- [Render](https://render.com/) for hosting the application.

---
