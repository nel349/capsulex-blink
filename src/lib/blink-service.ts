import { PublicKey } from "@solana/web3.js";
import { ActionGetResponse, ActionPostResponse, createPostResponse } from "@solana/actions";
import { solanaTransactionService } from "./solana-transaction-service";

export interface BlinkActionParams {
  capsuleId: string;
  userWallet: PublicKey;
  action?: string;
  guessContent?: string;
  isAnonymous?: boolean;
}

export class BlinkService {
  createGetResponse(capsuleId: string): ActionGetResponse {
    return {
      title: `CapsuleX Time Capsule`,
      icon: "https://drive.usercontent.google.com/download?id=1Vk98CgAWpSJ0tac36vx4W4yo9EPxCYhn", // Update with your domain
      description: `🎯 Time Capsule Game for ID: ${capsuleId}

🚀 CapsuleX - Decentralized Time Capsules on Solana
⏰ Submit your guess and compete with others!
🏆 Win prizes when the capsule is revealed

💡 Can't use Blinks? Visit: ${process.env.CAPSULEX_BLINK_BASE_URL || 'https://capsulex-blink-production.up.railway.app'}/game/${capsuleId}`,
      label: "View Capsule",
      links: {
        actions: [
          {
            type: "transaction",
            label: "🎮 Join Game",
            href: `/api/guess/${capsuleId}`,
            parameters: [
              {
                name: "action",
                label: "What would you like to do?",
                type: "select",
                required: true,
                options: [
                  { label: "View Game Details", value: "view" },
                  { label: "Check Leaderboard", value: "leaderboard" },
                  { label: "Submit Guess", value: "guess" },
                ],
              },
              {
                name: "guess_content",
                label: "Your guess (only required for Submit Guess)",
                type: "text",
                required: false,
              },
              {
                name: "is_anonymous",
                label: "Anonymous guess? (only for Submit Guess)",
                type: "checkbox",
                required: false,
                options: [
                  { label: "Make guess anonymous", value: "true" },
                ],
              },
            ],
          },
        ],
      },
    };
  }

  async createPostResponse(params: BlinkActionParams): Promise<ActionPostResponse> {
    const { capsuleId, userWallet, action, guessContent, isAnonymous } = params;

    let transactionResult;

    switch (action) {
      case "view":
        transactionResult = await solanaTransactionService.createViewTransaction(
          capsuleId, 
          userWallet
        );
        break;

      case "leaderboard":
        transactionResult = await solanaTransactionService.createLeaderboardTransaction(
          capsuleId, 
          userWallet
        );
        break;

      case "guess":
        if (!guessContent || guessContent.trim() === "") {
          throw new Error("Guess content is required for guess submission");
        }

        transactionResult = await solanaTransactionService.createGuessSubmissionTransaction({
          capsuleId,
          guesserWallet: userWallet,
          guessContent,
          isAnonymous: Boolean(isAnonymous),
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return await createPostResponse({
      fields: {
        type: "transaction",
        transaction: transactionResult.transaction,
        message: transactionResult.message,
      },
    });
  }
}

export const blinkService = new BlinkService();