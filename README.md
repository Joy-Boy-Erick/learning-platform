# Yay Mon Digital Learning Platform

A digital learning management system built with React, featuring role-based dashboards for admins, teachers, and students. This is a full-stack application with a React frontend and a Node.js/Express backend.

## Project Structure

-   `/`: Contains the React frontend source code.
-   `/backend`: Contains the Node.js + Express backend server.
-   `/frontend`: This directory will be **generated** when you build the frontend. It contains the optimized, static assets that the backend will serve.

## Setup & Running the Application

Follow these steps to get the full-stack application running.

### 1. Frontend Setup

First, navigate to the root directory to install dependencies and build the static frontend files.

```bash
# Install frontend dependencies
npm install

# Build the optimized frontend into the /frontend directory
npm run build
```

### 2. Backend Setup

Next, set up and run the backend server.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Copy the example environment file to create your own local configuration.
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and fill in your database credentials and your **Google Gemini API Key**.

4.  **Start the server:**
    -   For production:
        ```bash
        npm start
        ```
    -   For development (with auto-reloading via nodemon):
        ```bash
        npm run dev
        ```

The server will start on the port specified in your `.env` file (default is `3001`). You can now access the application at `http://localhost:3001`.
