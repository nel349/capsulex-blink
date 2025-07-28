import { NextRequest, NextResponse } from 'next/server';
import { ActionGetResponse, ACTIONS_CORS_HEADERS } from '@solana/actions';
import { capsuleXAPI } from '@/lib/capsulex-api';
import { current_blockchain_id, X_ACTION_VERSION } from '../../constants';
import { PublicKey } from '@solana/web3.js';

// GET handler for User Stats Blink
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      // Return a form to collect wallet address
      const actionResponse: ActionGetResponse = {
        type: 'action',
        title: '📊 Your CapsuleX Stats',
        icon: new URL('/icon.png', new URL(request.url).origin).toString(),
        description: 'Enter your wallet address to view your game statistics, points, and ranking in the CapsuleX leaderboard.',
        label: 'Get My Stats',
        links: {
          actions: [
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
    }

    // Validate wallet address
    try {
      new PublicKey(wallet);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { 
          status: 400,
          headers: {
            ...ACTIONS_CORS_HEADERS,
            'X-Action-Version': X_ACTION_VERSION,
            'X-Blockchain-Ids': current_blockchain_id,
          }
        }
      );
    }

    try {
      // Get user stats
      const stats = await capsuleXAPI.getUserStats(wallet);
      
      const actionResponse: ActionGetResponse = {
        type: 'action',
        title: `📊 ${stats.display_name} Stats`,
        icon: new URL('/icon.png', new URL(request.url).origin).toString(),
        description: `🏆 Points: ${stats.total_points}\n🎮 Games Played: ${stats.games_participated}\n🎯 Games Won: ${stats.games_won}\n🏅 Badges: ${stats.badge_count}${stats.global_rank ? `\n🌟 Global Rank: #${stats.global_rank}` : ''}`,
        label: 'View Global Leaderboard',
        links: {
          actions: [
            {
              type: 'external-link',
              label: '🏆 Global Leaderboard',
              href: new URL('/api/leaderboard/global', new URL(request.url).origin).toString(),
            },
            {
              type: 'external-link',
              label: '🎮 Join New Game',
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
      // User not found or no activity
      const actionResponse: ActionGetResponse = {
        type: 'action',
        title: '🎮 Start Your CapsuleX Journey',
        icon: new URL('/icon.png', new URL(request.url).origin).toString(),
        description: 'No game activity found for this wallet. Join a game to start earning points and competing in the leaderboard!',
        label: 'Join First Game',
        links: {
          actions: [
            {
              type: 'external-link',
              label: '🎮 Browse Active Games',
              href: new URL('/game', new URL(request.url).origin).toString(),
            },
            {
              type: 'external-link',
              label: '🏆 View Global Leaderboard',
              href: new URL('/api/leaderboard/global', new URL(request.url).origin).toString(),
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
    }
  } catch (error) {
    console.error('User stats Blink error:', error);
    return NextResponse.json(
      { error: 'Failed to load user stats' },
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