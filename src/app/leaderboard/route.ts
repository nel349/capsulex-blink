import { NextRequest, NextResponse } from 'next/server';
import { ActionGetResponse, ACTIONS_CORS_HEADERS } from '@solana/actions';
import { current_blockchain_id, X_ACTION_VERSION } from '../api/constants';

// GET handler for Leaderboard Home Blink
export async function GET(request: NextRequest) {
  try {
    const actionResponse: ActionGetResponse = {
      type: 'action',
      title: '🏆 CapsuleX Leaderboards',
      icon: new URL('/icon.png', new URL(request.url).origin).toString(),
      description: 'Explore CapsuleX leaderboards and rankings. View global standings, check your personal stats, or see game-specific rankings.',
      label: 'Explore Leaderboards',
      links: {
        actions: [
          {
            type: 'external-link',
            label: '🌍 Global Leaderboard',
            href: new URL('/api/leaderboard/global', new URL(request.url).origin).toString(),
          },
          {
            type: 'transaction',
            label: '📊 My Stats',
            href: new URL('/api/leaderboard/user', new URL(request.url).origin).toString(),
            parameters: [
              {
                name: 'wallet',
                label: 'Your wallet address',
                required: true,
              },
            ],
          },
          {
            type: 'external-link',
            label: '🎮 Join Game',
            href: new URL('/game', new URL(request.url).origin).toString(),
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
    console.error('Leaderboard home Blink error:', error);
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