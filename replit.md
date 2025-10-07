# Keltra DeFi Dapp

## Overview

Keltra is a DeFi (Decentralized Finance) proof-of-concept application built for the Sui blockchain. The application provides a polished interface for users to interact with yield-generating vaults that earn crypto rewards (BTC, SUI, ETH) by depositing USDC. The app features a modern dark theme with blue accents, responsive design, and comprehensive mock data for demonstration purposes.

The application consists of two main routes: a home dashboard displaying available vaults and their performance metrics, and individual vault pages with detailed information, charts, and interaction capabilities. Key features include wallet connection simulation, vault deposits/withdrawals, reward claiming, and real-time APR tracking with visual charts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React-based architecture with TypeScript for type safety:
- **Framework**: Vite + React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom design system and Shadcn/ui components
- **State Management**: React Context API for global app state (wallet, positions, settings)
- **Data Visualization**: Chart.js for APR line charts and custom React components for progress rings
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency

### Component Structure
The UI follows a component-based architecture with:
- **Pages**: Home dashboard and individual Vault detail pages
- **Layout Components**: Header with wallet connection, Footer with TVL metrics
- **Data Components**: VaultCard for vault previews, LineAprChart for performance visualization
- **UI Components**: Comprehensive design system with buttons, cards, badges, and form elements
- **Custom Components**: TokenIcon for crypto symbols, Ring for progress indicators, MermaidFlow for strategy visualization

### Data Layer
The application uses a mock data approach for the proof-of-concept:
- **Type System**: Shared TypeScript interfaces defined in `shared/schema.ts`
- **Mock Data**: Comprehensive vault data with realistic APR histories, TVL amounts, and performance metrics
- **State Management**: Context-based state for wallet connection, user positions, and token prices
- **Data Persistence**: In-memory state management with simulated blockchain interactions

### Backend Architecture
The backend uses Express.js with a minimal API surface since the app primarily uses mock data:
- **Server Framework**: Express.js with TypeScript
- **Development Setup**: Vite middleware integration for HMR and asset serving
- **Database Schema**: Drizzle ORM configuration with PostgreSQL (prepared for future database integration)
- **Storage Interface**: Abstract storage layer ready for real blockchain integration

### Design System
The application implements a comprehensive design system:
- **Color Palette**: Dark mode primary with trust-building blue accents, success/warning indicators
- **Typography**: Inter for readability, JetBrains Mono for addresses and numbers
- **Spacing**: Consistent Tailwind spacing units (4, 6, 8, 12, 16)
- **Component Variants**: Hover effects, elevation states, and responsive breakpoints
- **Mobile-First**: Responsive design optimized for both desktop and mobile experiences

## External Dependencies

### Core Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript for component architecture
- **Build Tools**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS for utility-first styling, PostCSS for processing

### UI and Component Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives (@radix-ui/react-*)
- **Shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

### Data and State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities

### Visualization and Charts
- **Chart.js**: Canvas-based charting library for APR performance visualization
- **React-Chartjs-2**: React wrapper for Chart.js integration

### Backend Dependencies
- **Express.js**: Web server framework with TypeScript support
- **Drizzle ORM**: Type-safe SQL toolkit and query builder
- **Neon Database**: Serverless PostgreSQL database solution
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **Replit Integration**: Development environment plugins and error handling
