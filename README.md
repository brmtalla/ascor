# Ascor

A community-powered savings circle app built with React Native and Expo. Ascor lets groups of people pool money together in structured, trust-based savings circles — a modern take on rotating savings and credit associations (ROSCAs).

## What It Does

- **Savings Circles** — Create or join circles where members contribute a fixed amount each cycle. One member receives the full pot per round, rotating until everyone has had a turn.
- **Browse & Join** — Discover open circles recruiting new members. Submit a request with income verification so organizers can assess trustworthiness and prevent defaults.
- **Reputation System** — On-time payment rates, completed cycles, and account age build your profile's credibility.
- **Vaults** — Collaborative goal-tracking vaults with milestones, media, and group messaging.
- **Social Feed** — Share updates within your circles. Investment solicitation is automatically flagged and blocked.
- **Deploy** — Discover and support community causes, businesses, and opportunities.
- **Learn** — Financial literacy modules covering budgeting, saving, and cooperative economics.
- **Shop** — Business users can create and manage storefronts for their products and services.
- **Dark Mode** — Full light/dark theme support with system preference detection.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo |
| Navigation | Expo Router (file-based) |
| Language | TypeScript |
| Icons | Lucide React Native |
| Styling | StyleSheet with dynamic theme colors |
| Storage | AsyncStorage (theme persistence) |

## Project Structure

```
app/
├── (tabs)/
│   ├── (circles)/       # Savings circles — browse, join, create, detail
│   ├── social/          # Community feed
│   ├── deploy/          # Causes & opportunities marketplace
│   ├── learn/           # Financial literacy modules
│   └── profile/         # User profile & wallet
├── messages/            # Direct messaging
├── shop/                # Business storefront management
├── vault/               # Collaborative vaults
├── settings.tsx         # App settings & theme selector
└── _layout.tsx          # Root layout
components/              # Reusable UI (GlassCard, CircleCard, PostCard, etc.)
constants/               # Theme colors & design tokens
contexts/                # ThemeContext, CartContext
services/                # Mock data services
mocks/                   # Mock datasets
types/                   # TypeScript interfaces
```

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start the dev server
npx expo start

# Scan the QR code with Expo Go (iOS/Android)
# or press 'w' to open in browser
```

## License

MIT
