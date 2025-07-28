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

    const [capsuleDetails, gameDetails] = await Promise.all([
      capsuleXAPI.getCapsuleDetails(capsule_id),
      capsuleXAPI.getGameDetails(capsule_id)
    ]);

    const timeUntilReveal = Math.max(
      0,
      Math.floor((new Date(capsuleDetails.reveal_date).getTime() - Date.now()) / 1000)
    );

    const isRevealed = capsuleDetails.status === 'revealed' || capsuleDetails.status === 'posted';
    const canStillJoin = !isRevealed && timeUntilReveal > 0 && gameDetails.is_active;

    const gameInfo = `🎯 Game Details for ${capsule_id.slice(0, 8)}...\n\n` +
      `📊 Participants: ${gameDetails.current_guesses}/${gameDetails.max_guesses}\n` +
      `🏆 Winners Found: ${gameDetails.winners_found}/${gameDetails.max_winners}\n` +
      `⏰ ${isRevealed ? 'Revealed!' : `${Math.floor(timeUntilReveal / 3600)}h ${Math.floor((timeUntilReveal % 3600) / 60)}m left`}\n` +
      `${canStillJoin ? '\n✅ You can still join this game!' : isRevealed ? '\n🎉 Game completed!' : '\n⏰ Game is ending soon!'}`;

    const response: ActionGetResponse = {
      type: "action",
      title: "🎯 Game Details",
      icon: "https://drive.usercontent.google.com/download?id=1Vk98CgAWpSJ0tac36vx4W4yo9EPxCYhn",
      description: gameInfo,
      label: canStillJoin ? "Join Game" : "Game Details",
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
    console.error(`Error in GET /api/game-details/${await (await context.params).capsule_id}:`, error);
    return NextResponse.json(
      { message: "Failed to get game details" },
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