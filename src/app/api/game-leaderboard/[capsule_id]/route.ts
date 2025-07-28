import { NextRequest, NextResponse } from "next/server";
import { ACTIONS_CORS_HEADERS, ActionGetResponse } from "@solana/actions";
import { capsuleXAPI } from "../../../../lib/capsulex-api";
import { current_blockchain_id, X_ACTION_VERSION } from "../../constants";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ capsule_id: string }> }
) => {
  try {
    const { capsule_id } = await context.params;

    const [gameLeaderboard, capsuleDetails] = await Promise.all([
      capsuleXAPI.getGameLeaderboard(capsule_id),
      capsuleXAPI.getCapsuleDetails(capsule_id)
    ]);

    const participants = gameLeaderboard.length;
    const topParticipants = gameLeaderboard
      .slice(0, 5)
      .map((entry, index) => {
        const winner = entry.is_winner ? ' 🏆' : '';
        const points = entry.points_earned > 5 ? ` (+${entry.points_earned}pts)` : '';
        return `${index + 1}. ${entry.display_name}${winner}${points}`;
      })
      .join('\n');

    const leaderboardInfo = `🏆 Game Leaderboard\n\n` +
      `👥 Total Participants: ${participants}\n\n` +
      `${topParticipants ? `Top Players:\n${topParticipants}` : 'No participants yet'}`;

    const timeUntilReveal = Math.max(
      0,
      Math.floor((new Date(capsuleDetails.reveal_date).getTime() - Date.now()) / 1000)
    );
    const isRevealed = capsuleDetails.status === 'revealed' || capsuleDetails.status === 'posted';
    const canStillJoin = !isRevealed && timeUntilReveal > 0;

    const response: ActionGetResponse = {
      type: "action",
      title: "🏆 Game Leaderboard",
      icon: "https://drive.usercontent.google.com/download?id=1Vk98CgAWpSJ0tac36vx4W4yo9EPxCYhn",
      description: leaderboardInfo,
      label: canStillJoin ? "Join Game" : "Leaderboard",
      links: canStillJoin ? {
        actions: [
          {
            type: "transaction", 
            label: "🎮 Submit Guess",
            href: `/api/guess/${capsule_id}`,
            parameters: [
              {
                name: "action",
                label: "What would you like to do?",
                type: "select",
                required: true,
                options: [
                  { label: "Submit Guess", value: "guess" },
                ],
              },
              {
                name: "guess_content",
                label: "Your guess",
                type: "text",
                required: true,
              },
              {
                name: "is_anonymous",
                label: "Anonymous guess?",
                type: "checkbox",
                required: false,
                options: [
                  { label: "Make guess anonymous", value: "true" },
                ],
              },
            ],
          },
        ],
      } : undefined,
    };

    return NextResponse.json(response, {
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": X_ACTION_VERSION,
        "X-Blockchain-Ids": current_blockchain_id,
      },
    });
  } catch (error) {
    console.error(`Error in GET /api/game-leaderboard/${await (await context.params).capsule_id}:`, error);
    return NextResponse.json(
      { message: "Failed to get leaderboards" },
      { 
        status: 500,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "X-Action-Version": X_ACTION_VERSION,
          "X-Blockchain-Ids": current_blockchain_id,
        },
      }
    );
  }
};

export const POST = GET;

export const OPTIONS = async () => {
  return new Response(null, {
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "X-Action-Version": X_ACTION_VERSION,
      "X-Blockchain-Ids": current_blockchain_id,
    },
  });
};