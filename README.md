# Yay Mon Digital Learning Platform

This is a digital learning management system built with React, featuring role-based dashboards for admins, teachers, and students. Teachers can leverage the Gemini API to auto-generate course content.

## Running the Application

This project includes a React frontend and a Node.js/Express backend server that must be run concurrently.

### Prerequisites

-   Node.js and npm installed.

### 1. Backend Setup

First, set up and start the backend server.

1.  **Install Backend Dependencies:**
    In the project's root directory, run:
    ```bash
    npm install express cors body-parser
    ```

2.  **Start the Backend Server:**
    Run the following command in a terminal. Keep this terminal window open.
    ```bash
    node server.js
    ```
    The server will start, listening on `http://localhost:3001`.

### 2. Frontend Setup

The frontend application requires a development server to handle API requests.

#### Backend Proxy Configuration

The frontend is configured to make API requests to `/api/...` (a relative path). For this to work in local development, you need to **proxy** these requests from the frontend dev server to your backend server running on `http://localhost:3001`.

If you are using a development server like **Vite**, you can add the following to your `vite.config.js` or `vite.config.ts` file:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

> **Note:** If you are not using Vite, please consult the documentation for your specific development server on how to set up a proxy.

### 3. Run the Frontend

Once the proxy is configured, run the frontend application in a **new terminal window**. When you navigate to your frontend's development URL (e.g., `http://localhost:5173`), all API calls will be correctly forwarded to your backend.

---

Enjoy using the Yay Mon Digital Learning Platform!