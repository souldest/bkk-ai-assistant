# BKK AI Assistant

A full-stack AI assistant application built as a **Databricks App** using **Databricks AppKit, React, TypeScript, Express, and Tailwind CSS**.

The project combines a modern React frontend with an Express backend and is designed to run and be deployed within a Databricks workspace.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Radix UI
* shadcn/ui

### Backend

* Node.js
* Express
* TypeScript

### Platform & Deployment

* Databricks
* Databricks AppKit
* Databricks Apps
* Databricks Asset Bundles

---

## Project Structure

```text
bkk-ai-assistant/
│
├── client/
│   ├── src/                 # React application
│   └── public/              # Static assets
│
├── server/
│   ├── server.ts            # Express server entry point
│   └── routes/              # Backend routes
│
├── shared/                  # Shared types and definitions
├── scripts/                 # Utility scripts
│
├── app.yaml                 # Databricks App configuration
├── databricks.yml           # Databricks Asset Bundle configuration
├── appkit.plugins.json      # AppKit plugin configuration
│
├── .env.example             # Environment variable template
├── package.json
└── README.md
```

---

## Prerequisites

Before running the project locally, make sure you have:

* **Node.js v22+**
* **npm**
* **Databricks CLI**
* Access to a **Databricks workspace**

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a local `.env` file from the provided template:

```bash
cp .env.example .env
```

Then configure the required environment variables.

Example:

```env
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_APP_PORT=8000
```

Additional environment variables may be required depending on the enabled plugins and your Databricks configuration.

---

## Development

Start the application in development mode with hot reload:

```bash
npm run dev
```

The application will be available at the URL shown in the console.

---

## Production Build

Build the frontend and backend for production:

```bash
npm run build
```

The build generates:

```text
dist/server.js
client/dist/
```

Start the production application with:

```bash
npm start
```

---

## Databricks Authentication

The Databricks CLI requires authentication to deploy and manage applications.

### OAuth U2M

For interactive browser-based authentication:

```bash
databricks auth login --host https://your-workspace.cloud.databricks.com
```

This opens the browser to complete authentication. The Databricks CLI stores the authentication configuration locally.

### Configuration Profiles

Multiple workspaces can be configured using profiles:

```ini
[DEFAULT]
host = https://dev-workspace.cloud.databricks.com

[production]
host = https://prod-workspace.cloud.databricks.com
client_id = prod-client-id
client_secret = prod-client-secret
```

A specific profile can then be used for deployment:

```bash
databricks bundle deploy --profile production
```

> **Security:** Personal Access Tokens (PATs) are legacy authentication. OAuth is recommended for improved security.

---

## Deployment

The project uses **Databricks Asset Bundles** and **Databricks Apps** for deployment.

### Configure the bundle

Update `databricks.yml` with your Databricks workspace:

```yaml
targets:
  default:
    workspace:
      host: https://your-workspace.cloud.databricks.com
```

Replace the placeholder values with your actual workspace and resource configuration.

### Deploy the application

Deploy the application with:

```bash
databricks apps deploy
```

The deployment process validates the project, deploys the application, starts it, and outputs the application URL.

### Production deployment

Configure the production target in `databricks.yml` and deploy with:

```bash
databricks apps deploy -t prod
```

### Restart a stopped application

Databricks Apps may stop after a period of inactivity.

An existing application can be started again without redeploying:

```bash
databricks apps start <APP_NAME>
```

---

## Code Quality

The project includes scripts for type checking, linting, and formatting.

### Type checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

Automatically fix linting issues where possible:

```bash
npm run lint:fix
```

### Formatting

```bash
npm run format
```

Apply formatting automatically:

```bash
npm run format:fix
```

---

## Enabled Plugins

The project currently includes the following application component:

### Server

An **Express HTTP server** providing static file serving and Vite development mode.

Additional AppKit plugins can be configured according to the project's Databricks environment.

---

## Architecture

The application is structured as a full-stack web application:

```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│ TypeScript · Vite           │
│ Tailwind · shadcn/ui        │
└──────────────┬──────────────┘
               │
               │ HTTP / API
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│                             │
│ Node.js · TypeScript        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         Databricks          │
│                             │
│ AppKit · Databricks Apps    │
└─────────────────────────────┘
```

---

## Project Goals

The project explores the development of an AI assistant as a **Databricks application**, combining:

* Modern React frontend development
* Full-stack TypeScript
* Express-based backend development
* Databricks AppKit
* Databricks application deployment
* Environment-based configuration
* Development and production workflows

---

## Status

**Proof of Concept**

The project is actively developed and serves as an implementation and exploration of an AI assistant running as a Databricks App.

---

## Author

**souldest**

[GitHub](https://github.com/souldest)
