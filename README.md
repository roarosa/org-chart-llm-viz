# llm-viz

A proof-of-concept chatbot + visualizer

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+

## Quick start

1. Install client dependencies:
   ```bash
   npm install
   ```
2. Enable git hooks:
   ```bash
   npm run setup:hooks
   ```
3. Set up server environment:
   ```bash
   cd apps/server
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   ```
4. Run both apps from repo root:
   ```bash
   npm run dev
   ```

- Client: http://localhost:5173
- Server: http://localhost:8000

## Useful commands

From repo root:

- `npm run dev` - run server + client together
- `npm run dev:client` - run client only
- `npm run dev:server` - run server only
- `npm run lint` - lint client and server
- `npm run format` - format client and server
- `npm run test` - run server tests
