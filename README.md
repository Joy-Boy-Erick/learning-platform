# Yay Mon Digital Learning Platform

This is a digital learning management system built with React and a Node.js/Express backend. It features role-based dashboards for admins, teachers, and students. Teachers can leverage the Gemini API to auto-generate course content.

## Project Structure

- **Frontend:** The React application is located in the `src` (implicitly) and public directories. It uses Vite for development and bundling.
- **Backend:** A simple Node.js Express server is defined in `server.js` at the root of the project. It serves a REST API and uses an in-memory database initialized with mock data.

## Setup & Installation

1.  **Prerequisites:**
    *   [Node.js](https://nodejs.org/) (version 18 or higher recommended)
    *   `npm` (usually comes with Node.js)

2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

3.  **Install dependencies:**
    This single command will install both frontend and backend dependencies listed in `package.json`.
    ```bash
    npm install
    ```

4.  **Configure Gemini API Key:**
    To enable AI features for course generation, you need a Gemini API key.
    *   Create a file named `.env` in the root of the project.
    *   Add your API key to this file:
        ```
        API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   The application is configured to read this key. The AI features will be disabled if the key is not provided, but the rest of the application will function normally.

## Running the Application

### Development Mode

For development, you should run both the frontend (Vite dev server) and the backend (Node.js server) at the same time. A convenient script is provided to do this concurrently.

```bash
npm run dev
```

This command will:
1.  Start the **backend server** on `http://localhost:3001` using `nodemon` (which automatically restarts on file changes).
2.  Start the **frontend Vite server** on `http://localhost:5173` (or another available port).
3.  Open your browser to the frontend application.

The frontend is configured to proxy API requests from `/api` to the backend server, avoiding CORS issues.

### Production Mode

1.  **Build the Frontend:**
    This command compiles the React application into static files in the `dist` directory.
    ```bash
    npm run build
    ```

2.  **Run the Backend Server:**
    This command starts only the Node.js server. For a real production deployment, you would typically serve the static files from the `dist` directory with the same server or a dedicated web server.
    ```bash
    npm start
    ```
