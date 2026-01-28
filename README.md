# next-lm-chat

A modern, responsive chat interface for local language models using Next.js. Provides an OpenAI-compatible API client that can connect to various LLM backends with a beautiful and intuitive chat interface.

## Features

- OpenAI-compatible API - Works with any backend that implements the OpenAI API spec
- Modern chat interface with clean, responsive design
- Dark mode support with system preference detection
- Markdown rendering with GitHub Flavored Markdown support
- Fully responsive for mobile, tablet, and desktop

## Tech Stack

- [Next.js](https://nextjs.org/) 16 with App Router and Turbopack
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Biome](https://biomejs.dev/) for linting and formatting

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
git clone https://github.com/a14a-org/next-lm-chat.git
cd next-lm-chat
bun install
```

### Environment Variables

Create a `.env.local` file in the root directory:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `LM_STUDIO_API_KEY` | API key for authentication | Yes | - |
| `LM_STUDIO_API_URL` | Base URL for the LLM API | No | `https://example.com/v1` |
| `NEXT_PUBLIC_APP_NAME` | Application name displayed in UI | No | `Next LM Chat` |
| `NEXT_PUBLIC_DEFAULT_MODEL` | Default model to use | No | `local-model` |

### Running the App

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start development server with Turbopack |
| `bun run build` | Build for production |
| `bun start` | Start production server |
| `bun run lint` | Run Biome linting |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code with Biome |

## License

MIT - Copyright (c) 2025 A14A B.V.
