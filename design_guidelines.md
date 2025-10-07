# Keltra DeFi Dapp Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern DeFi platforms like Uniswap and Aave, with clean, professional aesthetics that build trust while maintaining accessibility for both novice and experienced DeFi users.

## Core Design Elements

### Color Palette
**Dark Mode Primary** (default):
- Background: `240 10% 8%` (deep charcoal)
- Surface: `240 10% 12%` (elevated cards)
- Primary: `210 90% 60%` (trust-building blue)
- Success: `150 80% 50%` (gains/positive)
- Warning: `25 90% 60%` (risk indicators)
- Text Primary: `0 0% 95%`
- Text Secondary: `0 0% 70%`

**Light Mode**:
- Background: `0 0% 98%`
- Surface: `0 0% 100%`
- Primary: `210 90% 50%`
- Text Primary: `240 10% 15%`

### Typography
- **Primary**: Inter (Google Fonts) - Clean, modern readability
- **Accent**: JetBrains Mono - For addresses, numbers, and code
- Hierarchy: text-4xl, text-2xl, text-lg, text-base, text-sm

### Layout System
**Tailwind Spacing**: Consistent use of 4, 6, 8, 12, 16 units
- Component padding: `p-6`
- Section spacing: `gap-8`
- Container margins: `mx-4` mobile, `mx-8` desktop
- Card spacing: `space-y-4`

### Component Library

**Navigation**: Fixed header with wallet connection prominence
**Strategy Cards**: Clean cards with APY highlights, risk indicators, and clear CTAs
**Data Tables**: Sortable, responsive tables for portfolio/transaction history
**Wallet Integration**: Prominent connect button with status indicators
**Forms**: Input validation with clear error states
**Modals**: Strategy details, transaction confirmations with step-by-step progress

## Visual Hierarchy
1. **Wallet Connection**: Most prominent UI element
2. **Strategy Performance**: Large, clear APY/returns display
3. **Risk Indicators**: Subtle but noticeable warning colors
4. **Secondary Actions**: Muted but accessible

## Images
**Hero Section**: Large background featuring abstract financial/blockchain geometric patterns in subtle gradients (primary blue to deep purple). Hero should be single viewport height with centered content overlay.

**Strategy Icons**: Simple, consistent iconography for different DeFi strategies (lending, liquidity providing, yield farming) using line-style icons from Heroicons.

**No profile photos or complex imagery** - keep focus on data and functionality.

## Key UX Principles
- **Trust First**: Professional appearance with clear risk communication
- **Progressive Disclosure**: Simple overview → detailed strategy information
- **Responsive Data**: All financial data prominently displayed and mobile-optimized
- **Wallet-Centric**: Design assumes wallet connection is primary user flow
