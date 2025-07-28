import { NextRequest, NextResponse } from 'next/server';
import { ActionGetResponse, ACTIONS_CORS_HEADERS } from '@solana/actions';
import { capsuleXAPI } from '@/lib/capsulex-api';
import { current_blockchain_id, X_ACTION_VERSION } from '../../constants';

// GET handler for Global Leaderboard Blink
export async function GET(request: NextRequest) {
  try {
    
    // Get leaderboard data
    const leaderboard = await capsuleXAPI.getGlobalLeaderboard(10, 0);
    
    // Format top users for display
    const topUsers = leaderboard
      .slice(0, 5)
      .map(user => `${user.rank}. ${user.display_name} - ${user.total_points} pts`)
      .join('\n');

    const actionResponse: ActionGetResponse = {
      type: 'action',
      title: '🏆 CapsuleX Global Leaderboard',
      icon: new URL('/icon.png', new URL(request.url).origin).toString(),
      description: `Top Players:\n${topUsers}\n\nCompete in time capsule guessing games to earn points and climb the rankings!`,
      label: 'View Leaderboard',
      links: {
        actions: [
          {
            type: 'external-link',
            label: '🎮 Join Active Game',
            href: new URL('/game', new URL(request.url).origin).toString(),
          },
          {
            type: 'transaction',
            label: '📊 View My Stats',
            href: new URL('/api/leaderboard/user', new URL(request.url).origin).toString(),
            parameters: [
              {
                name: 'wallet',
                label: 'Your wallet address',
                required: true,
              },
            ],
          },
        ],
      },
    };

    const response = NextResponse.json(actionResponse);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.set('X-Action-Version', X_ACTION_VERSION);
    response.headers.set('X-Blockchain-Ids', current_blockchain_id);
    
    return response;
  } catch (error) {
    console.error('Global leaderboard Blink error:', error);
    return NextResponse.json(
      { error: 'Failed to load leaderboard' },
      { 
        status: 500,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          'X-Action-Version': X_ACTION_VERSION,
          'X-Blockchain-Ids': current_blockchain_id,
        }
      }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      'X-Action-Version': X_ACTION_VERSION,
      'X-Blockchain-Ids': current_blockchain_id,
    },
  });
}