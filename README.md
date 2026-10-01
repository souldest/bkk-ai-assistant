# BKK AI Assistant

A full-stack AI assistant application built as a **Databricks App** using **Databricks AppKit, React, TypeScript, Express, and Tailwind CSS**.

The project combines a modern React frontend with a TypeScript/Express backend and integrates **Databricks Vector Search, model serving endpoints, and a Retrieval-Augmented Generation (RAG) pipeline** to provide context-aware answers based on indexed documents.

The application is designed to run and be deployed directly within a Databricks workspace.

---

## AI & RAG Architecture

The core of the application is a Retrieval-Augmented Generation pipeline implemented with Databricks services.

```text
┌──────────────────────┐
│     React Frontend   │
│  TypeScript / Vite   │
└──────────┬───────────┘
           │ User Question
           ▼
┌──────────────────────┐
│   Express Backend    │
│  TypeScript / Node.js│
└──────────┬───────────┘
           │
           ├──────────────────────────────┐
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌─────────────────────────┐
│ Databricks AppKit    │      │ MiniLM Embedding Model  │
│ AI Search / Retrieval│      │ Serving Endpoint        │
└──────────┬───────────┘      └────────────┬────────────┘
           │                               │
           │ Retrieved Context             │ Embeddings
           └──────────────┬────────────────┘
                          ▼
               ┌─────────────────────────┐
               │ Databricks GPT OSS 120B │
               │ Model Serving Endpoint  │
               └────────────┬────────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ Answer + Sources  │
                  └───────────────────┘
```

### RAG Pipeline

1. **User question**
   The user enters a question through the React frontend.

2. **Document retrieval**
   The Express backend sends the question to the Databricks AppKit AI Search service, which retrieves relevant document chunks from the configured Vector Search index.

3. **Embeddings**
   The application integrates with the Databricks `minilm-embedding` serving endpoint for text embeddings.

4. **Context construction**
   Retrieved document chunks are combined into a structured context for the language model.

5. **LLM generation**
   The context and user question are sent to the `databricks-gpt-oss-120b` serving endpoint.

6. **Grounded response**
   The model is instructed to answer based on the provided context and avoid inventing information that is not supported by the retrieved documents.

7. **Sources**
   The application returns source metadata together with the generated answer so that the user can see which document chunks contributed to the response.

---

## Key Features

* Full-stack React + Express application
* TypeScript across frontend and backend
* Databricks App deployment
* Retrieval-Augmented Generation (RAG)
* Databricks Vector Search integration
* Databricks AI Search / AppKit integration
* MiniLM embedding model serving
* Databricks GPT OSS 120B model serving
* Context-grounded German responses
* Source metadata displayed alongside answers
* Explicit anti-hallucination prompt instructions
* Databricks Asset Bundle configuration
* Databricks App resource permissions
* OAuth-based Databricks authentication support

---

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

### AI & Data

* Databricks Vector Search
* Databricks AI Search / AppKit
* Databricks Model Serving
* MiniLM embeddings
* Databricks GPT OSS 120B
* Retrieval-Augmented Generation (RAG)

### Platform & Deployment

* Databricks Apps
* Databricks AppKit
* Databricks Asset Bundles
* Databricks CLI
* Unity Catalog resources

---

## Project Structure

```text
bkk-ai-assistant/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.tsx
│       └── ...
│
├── server/
│   └── server.ts
│
├── app.yaml
├── databricks.yml
├── package.json
├── README.md
└── ...
```

### Main Components

**`client/`**
React frontend responsible for the user interface and interaction with the assistant.

**`server/server.ts`**
Express backend containing the AI/RAG integration, Databricks service calls, prompt construction, and API handling.

**`databricks.yml`**
Databricks Asset Bundle configuration, including application resources and required permissions.

**`app.yaml`**
Databricks App configuration and environment variables.

---

## Databricks Resources

The application is configured to work with the following Databricks resources:

### Vector Search

A Unity Catalog Vector Search index is used for document retrieval.

```text
workspace.healthcare_ai.document_chunks_index
```

The Databricks App is configured with the required `SELECT` permission for the resource.

### Embedding Model

The application uses the following Databricks Model Serving endpoint:

```text
minilm-embedding
```

The endpoint generates vector embeddings used by the retrieval pipeline.

The current implementation expects **384-dimensional embeddings**.

### Language Model

The application uses:

```text
databricks-gpt-oss-120b
```

for response generation.

The model receives the user's question together with retrieved document context and is instructed to remain grounded in that context.

---

## Prerequisites

Before running or deploying the application, make sure the following are available:

* Node.js
* npm
* Databricks CLI
* Access to a Databricks workspace
* Appropriate Databricks permissions
* Configured Databricks authentication
* Required Vector Search resources
* Required Model Serving endpoints

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/souldest/bkk-ai-assistant.git
cd bkk-ai-assistant
```

Install dependencies:

```bash
npm install
```

Depending on the project configuration, frontend and backend dependencies are handled through the project scripts.

---

## Databricks Authentication

The application is intended to run within a Databricks environment and can use Databricks authentication mechanisms supported by the Databricks CLI and SDK.

For local development, configure a Databricks CLI profile:

```bash
databricks configure
```

OAuth-based authentication is recommended for current Databricks workflows.

Personal Access Tokens (PATs) are considered a legacy authentication approach and should generally be avoided for new setups where OAuth is available.

---

## Development

Start the development environment using the configured npm scripts:

```bash
npm run dev
```

The development setup provides the frontend and backend required to run the application locally.

---

## Production Build

Create a production build with:

```bash
npm run build
```

The resulting application can then be deployed as a Databricks App.

---

## Code Quality

The project includes scripts for type checking, linting, and formatting.

Typical commands include:

```bash
npm run typecheck
npm run lint
npm run format
```

These checks help maintain consistent TypeScript code quality across the frontend and backend.

---

## Deployment

The project uses **Databricks Asset Bundles** for deployment configuration.

The deployment configuration is defined in:

```text
databricks.yml
```

Deploy the application with:

```bash
databricks apps deploy
```

For a specific target:

```bash
databricks apps deploy -t prod
```

After deployment, an application can be restarted with:

```bash
databricks apps start <APP_NAME>
```

The Databricks bundle configuration also defines the resources required by the application, including:

* Vector Search resources
* Model Serving permissions
* Databricks App configuration

---

## Application Architecture

The application follows a separation between presentation, backend orchestration, retrieval, and generation.

```text
                         User
                          │
                          ▼
               ┌─────────────────────┐
               │   React Frontend    │
               │ TypeScript / Vite   │
               └──────────┬──────────┘
                          │
                          │ HTTP
                          ▼
               ┌─────────────────────┐
               │   Express Backend   │
               │    server.ts        │
               └──────────┬──────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
   ┌───────────────────┐    ┌────────────────────┐
   │ AppKit AI Search  │    │ MiniLM Embeddings  │
   │                   │    │ Model Serving      │
   └─────────┬─────────┘    └────────────────────┘
             │
             │ Relevant chunks
             ▼
   ┌──────────────────────┐
   │ Context + User Query │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ GPT OSS 120B Serving │
   │ Endpoint             │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Answer + Source Data │
   └──────────────────────┘
```

This architecture keeps the frontend focused on presentation while the backend coordinates retrieval, context preparation, model invocation, and response handling.

---

## Prompt & Grounding Strategy

The backend uses a structured prompt designed for document-grounded responses.

The model is instructed to:

* Answer in German.
* Use the retrieved context as the primary source of information.
* Avoid fabricating information.
* Clearly distinguish between information that is supported by the retrieved documents and information that is not available.
* Keep different topics separated.
* Provide an answer based on the available evidence rather than relying on unsupported assumptions.

This approach is intended to reduce hallucinations and make the generated responses more transparent and traceable.

---

## Source Handling

The application does not only return the generated answer.

Retrieved source information is also passed back to the frontend and displayed to the user.

The interface can show information such as:

* Document ID
* Retrieved chunk
* Relevance information

This provides additional transparency into the retrieval process and makes the RAG pipeline easier to inspect.

---

## Enabled Plugins

The project uses the following application plugin:

* Express HTTP server

The Express server acts as the backend layer between the React frontend and the Databricks AI services.

---

## Project Goals

The project demonstrates how a modern full-stack application can combine:

* React and TypeScript
* Express APIs
* Databricks Apps
* Databricks Vector Search
* Model Serving
* AI Search
* Retrieval-Augmented Generation
* Source-aware AI responses
* Infrastructure-as-code style deployment configuration

The main focus is on building a practical AI assistant architecture that can be deployed and operated inside a Databricks environment.

---

## Current Status

**Proof of Concept**

The application is currently a proof of concept demonstrating the integration of a full-stack web application with Databricks AI and data services.

The architecture is designed to provide a foundation for further development, including improvements to retrieval quality, UI/UX, evaluation, observability, and production hardening.

---

## Author

**souldest**

GitHub:
https://github.com/souldest/bkk-ai-assistant
