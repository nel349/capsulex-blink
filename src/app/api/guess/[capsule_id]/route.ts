import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ capsule_id: string }> }
) => {
  try {
    const { capsule_id } = await params;

    const payload: ActionGetResponse = {
      title: `CapsuleX Time Capsule`,
      icon: new URL("/capsulex-1.png", new URL(req.url).origin).toString(),
      description: `🎯 Time Capsule Game for ID: ${capsule_id}

🚀 CapsuleX - Decentralized Time Capsules on Solana
⏰ Submit your guess and compete with others!
🏆 Win prizes when the capsule is revealed

This is a template Blink - guess submission coming soon!`,
      label: "View Capsule",
      links: {
        actions: [
          {
            type: "transaction",
            label: "🎮 Join Game",
            href: `/api/guess/${capsule_id}`,
            parameters: [
              {
                name: "action",
                label: "What would you like to do?",
                required: true,
                options: [
                  { label: "View Game Details", value: "view" },
                  { label: "Check Leaderboard", value: "leaderboard" },
                  { label: "Submit Guess (Coming Soon)", value: "guess" },
                ],
              },
            ],
          },
        ],
      },
    };

    return NextResponse.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.error("Error in GET /api/guess/[capsule_id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
};

export const OPTIONS = async () => {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ capsule_id: string }> }
) => {
  try {
    const { capsule_id } = await params;
    const body: ActionPostRequest = await req.json();

    // Validate request
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch {
      return NextResponse.json(
        { error: "Invalid account provided" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const action = (body.data as Record<string, unknown>)?.action as string;
    
    let message = "CapsuleX Blink interaction completed!";
    
    switch (action) {
      case "view":
        message = `📊 Viewing details for Time Capsule ${capsule_id}`;
        break;
      case "leaderboard":
        message = `🏆 Checking leaderboard for Time Capsule ${capsule_id}`;
        break;
      case "guess":
        message = `🎯 Guess submission for Time Capsule ${capsule_id} - Coming Soon!`;
        break;
      default:
        message = `🎮 Interacted with Time Capsule ${capsule_id}`;
    }

    // Create a simple demonstration transaction
    const connection = new Connection("https://api.devnet.solana.com");
    const transaction = new Transaction();

    // Add a simple transfer of 0 SOL to demonstrate functionality
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: account,
        lamports: 1,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = account;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message,
      },
    });

    return NextResponse.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.error("Error in POST /api/guess/[capsule_id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
};