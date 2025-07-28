import { NextRequest, NextResponse } from 'next/server';
import { ActionGetResponse, ACTIONS_CORS_HEADERS } from '@solana/actions';
import { capsuleXAPI } from '@/lib/capsulex-api';
import { current_blockchain_id, X_ACTION_VERSION } from '../../../constants';

// GET handler for Game Leaderboard Blink
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ capsule_id: string }> }
) {
  try {
    const { capsule_id } = await params;
    
    if (!capsule_id) {
      return NextResponse.json(
        { error: 'Capsule ID is required' },
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
      // Get capsule details to check if it's gamified
      const capsuleDetails = await capsuleXAPI.getCapsuleDetails(capsule_id);
      
      if (!capsuleDetails.is_gamified) {
        return NextResponse.json(
          { error: 'This capsule is not a game' },
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

      // Get game leaderboard
      const gameLeaderboard = await capsuleXAPI.getGameLeaderboard(capsule_id);
      
      const participants = gameLeaderboard.length;
      const topParticipants = gameLeaderboard
        .slice(0, 3)
        .map((entry, index) => `${index + 1}. ${entry.display_name}${entry.is_winner ? ' 🏆' : ''}`)
        .join('\n');

      // Calculate time until reveal
      const timeUntilReveal = Math.max(
        0,
        Math.floor((new Date(capsuleDetails.reveal_date).getTime() - Date.now()) / 1000)
      );

      const isRevealed = capsuleDetails.status === 'revealed' || capsuleDetails.status === 'posted';
      const canStillJoin = !isRevealed && timeUntilReveal > 0;

      const description = isRevealed
        ? `🎉 Game Complete!\n\n👥 ${participants} participants\n${topParticipants ? `\nTop Players:\n${topParticipants}` : ''}`
        : `🎮 Active Game\n⏰ ${Math.floor(timeUntilReveal / 3600)}h ${Math.floor((timeUntilReveal % 3600) / 60)}m left\n👥 ${participants} participants\n${topParticipants ? `\nCurrent Leaders:\n${topParticipants}` : ''}`;

      const actionResponse: ActionGetResponse = {
        type: 'action',
        title: `🎯 Game ${capsule_id.slice(0, 8)}... Leaderboard`,
        icon: new URL('/icon.png', new URL(request.url).origin).toString(),
        description,
        label: canStillJoin ? 'Join Game' : 'View Global Leaderboard',
        links: {
          actions: canStillJoin
            ? [
                {
                  type: 'external-link',
                  label: '🎮 Submit Guess',
                  href: new URL(`/game/${capsule_id}`, new URL(request.url).origin).toString(),
                },
                {
                  type: 'external-link',
                  label: '🏆 Global Leaderboard',
                  href: new URL('/api/leaderboard/global', new URL(request.url).origin).toString(),
                },
              ]
            : [
                {
                  type: 'external-link',
                  label: '🏆 Global Leaderboard',
                  href: new URL('/api/leaderboard/global', new URL(request.url).origin).toString(),
                },
                {
                  type: 'external-link',
                  label: '🎮 Find New Game',
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
      return NextResponse.json(
        { error: 'Game not found' },
        { 
          status: 404,
          headers: {
            ...ACTIONS_CORS_HEADERS,
            'X-Action-Version': X_ACTION_VERSION,
            'X-Blockchain-Ids': current_blockchain_id,
          }
        }
      );
    }
  } catch (error) {
    console.error('Game leaderboard Blink error:', error);
    return NextResponse.json(
      { error: 'Failed to load game leaderboard' },
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