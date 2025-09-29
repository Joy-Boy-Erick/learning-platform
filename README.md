# Yay Mon Digital Learning Platform

A digital learning management system built with React, featuring role-based dashboards for admins, teachers, and students. Teachers can leverage the Gemini API to auto-generate course content.

This project is configured with [Vite](https://vitejs.dev/) for a streamlined development and build process.

## Development

To run the application locally for development:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```

This will start the app, typically at `http://localhost:5173`.

## Building for Production

To create a production-ready build:

1.  **Run the build script:**
    ```bash
    npm run build
    ```

This command bundles the application into static files and outputs them to the `dist` directory. The API key for the Gemini API is expected to be available as an environment variable in your build environment.

## Deployment

After building the project, deploy the contents of the `dist` directory to any static hosting service.

You can test the production build locally with a static server:

```bash
npm install -g serve
serve -s dist
```
