# 🏆 CapsuleX Leaderboard Blinks

This document describes the Solana Actions (Blinks) implementation for CapsuleX leaderboard functionality.

## Overview

CapsuleX Leaderboard Blinks provide users with direct access to game rankings, personal statistics, and competitive features through Solana wallet interfaces that support Actions.

## Available Blink Endpoints

### 1. Global Leaderboard
- **URL**: `/api/leaderboard/global`
- **Description**: Displays top 5 players with their points and rankings
- **Actions**: 
  - Join Active Game
  - View Personal Stats

### 2. User Statistics
- **URL**: `/api/leaderboard/user?wallet={wallet_address}`
- **Description**: Shows individual user stats including points, games played, wins, and badges
- **Actions**:
  - View Global Leaderboard
  - Join New Game

### 3. Game-Specific Leaderboard
- **URL**: `/api/leaderboard/game/{capsule_id}`
- **Description**: Displays participants and rankings for a specific game
- **Dynamic Actions**: Changes based on game status (active vs completed)

### 4. Leaderboard Hub
- **URL**: `/leaderboard`
- **Description**: Central hub with links to all leaderboard functionality
- **Actions**: Links to all other leaderboard Blinks

## Data Sources

The Blinks connect to the CapsuleX backend API to fetch real-time data:

- **Global Rankings**: Real user participation data from database
- **User Stats**: Calculated from confirmed game submissions  
- **Game Data**: Live participant counts and submission status
- **Points System**: 
  - Participation: 5 points per confirmed guess
  - Wins: 100 points per game won
  - Creator Bonus: 50 points per game created

## Integration

### Backend API Integration

The Blinks use the `CapsuleXAPIService` to communicate with:
- `GET /api/leaderboard/global` - Global rankings
- `GET /api/leaderboard/user/{wallet}` - Individual stats
- `GET /api/leaderboard/game/{capsule_id}` - Game leaderboards

### Environment Configuration

Set the backend URL in your environment:
```bash
CAPSULEX_BACKEND_URL=https://your-backend-domain.com
```

## Development

### Local Development
```bash
cd capsulex-blink
npm run dev
```

### Building
```bash
npm run build
```

### Testing Blinks

1. **Direct Testing**: Visit the Blink URLs directly in a browser
2. **Wallet Integration**: Use the URLs in Solana wallets that support Actions
3. **Blink Preview**: Test with Blink testing tools and previews

## Technical Features

- ✅ **Real-time Data**: Connects to live database for current rankings
- ✅ **CORS Support**: Proper headers for cross-origin Blink requests
- ✅ **Error Handling**: Graceful fallbacks for missing data
- ✅ **Responsive Actions**: Different buttons based on game/user state
- ✅ **Wallet Validation**: Input validation for wallet addresses
- ✅ **Type Safety**: Full TypeScript implementation

## Usage Examples

### In Solana Wallets
Copy any of these URLs into a Solana wallet that supports Actions:
- `https://your-domain.com/api/leaderboard/global`
- `https://your-domain.com/api/leaderboard/user?wallet=YOUR_WALLET`
- `https://your-domain.com/leaderboard`

### For Developers
```typescript
import { capsuleXAPI } from '@/lib/capsulex-api';

// Get global leaderboard
const leaderboard = await capsuleXAPI.getGlobalLeaderboard(10, 0);

// Get user stats
const userStats = await capsuleXAPI.getUserStats(walletAddress);

// Get game leaderboard
const gameStats = await capsuleXAPI.getGameLeaderboard(capsuleId);
```

## Future Enhancements

- [ ] **Blockchain Integration**: Direct queries to Solana program for winner determination
- [ ] **Time-based Rankings**: Leaderboards for weekly/monthly periods
- [ ] **Badge System**: Achievement-based rankings and rewards
- [ ] **Tournament Mode**: Special event leaderboards
- [ ] **NFT Integration**: Rankings based on NFT ownership and achievements

## Support

For issues or questions about the leaderboard Blinks:
1. Check the backend API health at `/health`
2. Verify wallet address format (base58 Solana address)
3. Ensure the backend URL environment variable is set correctly
4. Check browser console for detailed error messages