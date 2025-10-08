# Axira V1 Prototype

A decentralized finance (DeFi) strategy platform prototype built with React and Node.js.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/StevenHung0318/Axira_V1_Prototype.git
   cd Axira_V1_Prototype
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   yarn install

# or

npm install
\`\`\`

3. **Start development server**
   \`\`\`bash
   yarn dev

# or

npm run dev
\`\`\`

4. **Open your browser**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 🛠️ Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

### Backend

- Node.js
- Express
- TypeScript

## 📁 Project Structure

\`\`\`
├── client/ # React frontend application
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── pages/ # Page components
│ │ └── lib/ # Utilities
├── server/ # Express backend
│ ├── index.ts # Server entry point
│ └── routes.ts # API routes
├── shared/ # Shared code between client/server
└── package.json # Dependencies and scripts
\`\`\`

## 📜 Available Scripts

\`\`\`bash

# Development

yarn dev # Start both client and server in development mode
yarn dev:client # Start only the frontend
yarn dev:server # Start only the backend

# Production

yarn build # Build for production
yarn start # Start production server

# Database (if using Drizzle)

yarn db:push # Push database schema changes
\`\`\`

## 🔧 Environment Variables

Create a \`.env\` file in the root directory (if needed):

\`\`\`env

# Add your environment variables here

# DATABASE_URL=

# API_KEY=

\`\`\`

## 🐛 Troubleshooting

### Port already in use

If ports 5173 or 5001 are already in use, you can change them in:

- Frontend: \`vite.config.ts\`
- Backend: \`server/index.ts\`

### Dependencies issues

\`\`\`bash

# Clear cache and reinstall

rm -rf node_modules yarn.lock
yarn install
\`\`\`

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

[Your License Here]

## 👤 Author

**Steven Hung**

- GitHub: [@StevenHung0318](https://github.com/StevenHung0318)
