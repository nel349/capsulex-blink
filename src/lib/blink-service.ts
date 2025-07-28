import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import { ActionGetResponse, ActionPostResponse, createPostResponse } from "@solana/actions";
import { solanaTransactionService } from "./solana-transaction-service";
import { capsuleXAPI } from "./capsulex-api";

export interface BlinkActionParams {
  capsuleId: string;
  userWallet: PublicKey;
  action?: string;
  guessContent?: string;
  isAnonymous?: boolean;
}

export class BlinkService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection("https://api.devnet.solana.com");
  }

  private async createInfoTransaction(userWallet: PublicKey): Promise<Transaction> {
    // Create a minimal transaction that transfers 0 lamports (no-op)
    const infoTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userWallet,
        toPubkey: userWallet, // Transfer to self
        lamports: 0, // 0 lamports = no actual transfer
      })
    );

    // Set required transaction properties
    const { blockhash } = await this.connection.getLatestBlockhash();
    infoTransaction.recentBlockhash = blockhash;
    infoTransaction.feePayer = userWallet;

    return infoTransaction;
  }

  createGetResponse(capsuleId: string): ActionGetResponse {
    return {
      title: `CapsuleX Time Capsule`,
      icon: "https://drive.usercontent.google.com/download?id=1Vk98CgAWpSJ0tac36vx4W4yo9EPxCYhn",
      description: `🎯 Time Capsule Game for ID: ${capsuleId}

🚀 CapsuleX - Decentralized Time Capsules on Solana
⏰ Submit your guess and compete with others!
🏆 Win prizes when the capsule is revealed

💡 Can't use Blinks? Visit: ${process.env.CAPSULEX_BLINK_BASE_URL || 'https://capsulex-blink-production.up.railway.app'}/game/${capsuleId}`,
      label: "Choose Action",
      links: {
        actions: [
          {
            type: "transaction",
            label: "🎯 Take Action",
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

    switch (action) {
      case "view":
        return await this.createViewResponse(capsuleId, userWallet);

      case "leaderboard":
        return await this.createLeaderboardResponse(capsuleId, userWallet);

      case "guess":
        if (!guessContent || guessContent.trim() === "") {
          throw new Error("Guess content is required for guess submission");
        }
        return await this.createGuessResponse(capsuleId, userWallet, guessContent, isAnonymous);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async createViewResponse(capsuleId: string, userWallet: PublicKey): Promise<ActionPostResponse> {
    console.log("🔍 createViewResponse: ", capsuleId, userWallet);
    try {
      const [capsuleDetails, gameDetails] = await Promise.all([
        capsuleXAPI.getCapsuleDetails(capsuleId),
        capsuleXAPI.getGameDetails(capsuleId)
      ]);

      console.log("🔍 createViewResponse: ", capsuleDetails, gameDetails);

      const timeUntilReveal = Math.max(
        0,
        Math.floor((new Date(capsuleDetails.reveal_date).getTime() - Date.now()) / 1000)
      );

      const isRevealed = capsuleDetails.status === 'revealed' || capsuleDetails.status === 'posted';

      // Create a properly formed no-op transaction for informational response
      const infoTransaction = await this.createInfoTransaction(userWallet);

      return await createPostResponse({
        fields: {
          type: "transaction",
          transaction: infoTransaction,
          message: "✅ Retrieving game details...",
          links: {
            next: {
              type: "post",
              href: `/api/game-details/${capsuleId}`,
            }
          }
        },
      });
    } catch (error) {
      throw new Error(`Failed to get game details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createLeaderboardResponse(capsuleId: string, userWallet: PublicKey): Promise<ActionPostResponse> {
    try {
      console.log(`Fetching leaderboard data for capsule: ${capsuleId}`);
      const [gameLeaderboard, capsuleDetails] = await Promise.all([
        capsuleXAPI.getGameLeaderboard(capsuleId),
        capsuleXAPI.getCapsuleDetails(capsuleId)
      ]);
      console.log(`Successfully fetched leaderboard data:`, { participants: gameLeaderboard.length });

      const participants = gameLeaderboard.length;
      const topParticipants = gameLeaderboard
        .slice(0, 5)
        .map((entry, index) => {
          const winner = entry.is_winner ? ' 🏆' : '';
          const points = entry.points_earned > 5 ? ` (+${entry.points_earned}pts)` : '';
          return `${index + 1}. ${entry.display_name}${winner}${points}`;
        })
        .join('\n');

      const userEntry = gameLeaderboard.find(entry => 
        entry.wallet_address === userWallet.toBase58()
      );

      // Create a properly formed no-op transaction for informational response
      const infoTransaction = await this.createInfoTransaction(userWallet);

      return await createPostResponse({
        fields: {
          type: "transaction",
          transaction: infoTransaction,
          message: "🏆 Retrieving leaderboard...",
          links: {
            next: {
              type: "post",
              href: `/api/game-leaderboard/${capsuleId}`,
            }
          }
        },
      });
    } catch (error) {
      console.error(`Error fetching leaderboard data for ${capsuleId}:`, error);
      throw new Error(`Failed to get leaderboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createGuessResponse(
    capsuleId: string, 
    userWallet: PublicKey, 
    guessContent: string, 
    isAnonymous?: boolean
  ): Promise<ActionPostResponse> {
    const transactionResult = await solanaTransactionService.createGuessSubmissionTransaction({
      capsuleId,
      guesserWallet: userWallet,
      guessContent,
      isAnonymous: Boolean(isAnonymous),
    });

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