# Indian Handicrafts Portal

A static Next.js portal for discovering traditional Indian handicrafts.

## Live Site

- https://indian-handicrafts-portal.pages.dev

## Features

- Browse and discover various Indian handicrafts
- Detailed product/craft information and descriptions
- Interactive state-based filtering
- Responsive design with Tailwind CSS
- Modern UI components with Radix UI
- In-browser chatbot guidance (no backend required)
- Community craft submission stored in browser local storage

## Tech Stack

- **Framework**: Next.js 16.2.1
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Language**: TypeScript
- **Linting**: ESLint
- **Deployment**: Static export (`out/`) for free hosting on Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Indian-Handicrafts-Portal
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build and export static files to `out/`
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Static Deployment (Cloudflare Pages)

This project is configured for static export in `next.config.ts`.

1. Build command:
```bash
npm run build
```

2. Output directory:
```bash
out
```

3. Cloudflare Pages settings:
- Framework preset: `Next.js (Static HTML Export)` or `None`
- Build command: `npm run build`
- Build output directory: `out`
- Node version: `20` (recommended)

4. Optional local static preview:
```bash
npx serve out
```

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # Reusable React components
│   └── ui/          # UI components (cards, buttons, etc.)
├── data/            # Static data and types
└── lib/             # Utilities and helpers
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
