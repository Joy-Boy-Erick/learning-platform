# Yay Mon Digital Learning Platform

This is a digital learning management system built with React, featuring role-based dashboards for admins, teachers, and students. Teachers can leverage the Gemini API to auto-generate course content.

## Running the Application

This project includes a React frontend and a Node.js/Express backend server that must be run concurrently.

### Prerequisites

-   Node.js and npm installed.

### 1. Installation

Install all dependencies for both the frontend and backend by running the following command in the project's root directory:
```bash
npm install
```

### 2. Backend Proxy Configuration

The frontend development server (`vite`) is configured in `vite.config.js` to forward API requests to the backend server. This is a crucial step to prevent browser security errors (CORS) during development.

The `vite.config.js` file is included in the project and contains the following configuration:
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
> **Note:** If you encounter connection issues, please ensure this configuration is correct and that you have restarted your frontend development server after any changes.

### 3. Running Concurrently

You need to run two processes in separate terminals from the project root.

1.  **Start the Backend Server:**
    ```bash
    npm run server
    ```
    The server will start and listen on `http://localhost:3001`.

2.  **Start the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    This will start the frontend, typically on a URL like `http://localhost:5173`. Open this URL in your browser to use the application.

---

## Building for Production

To create a production-ready build of the frontend, run the following command:

```bash
npm run build
```

This will create a `dist` directory containing the optimized, static assets of your application. You can deploy the contents of this `dist` folder to any static hosting service.

---

Enjoy using the Yay Mon Digital Learning Platform!