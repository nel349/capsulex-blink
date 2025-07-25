import {
  ACTIONS_CORS_HEADERS,
  ActionPostRequest,
} from "@solana/actions";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { X_ACTION_VERSION, current_blockchain_id } from "../../constants";
import { blinkService } from "../../../../lib/blink-service";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ capsule_id: string }> }
) => {
  try {
    const { capsule_id } = await params;
    const payload = blinkService.createGetResponse(capsule_id);

    return NextResponse.json(payload, {
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": X_ACTION_VERSION,
        "X-Blockchain-Ids": current_blockchain_id,
      },
    });
  } catch (err) {
    console.error("Error in GET /api/guess/[capsule_id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500, 
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "X-Action-Version": X_ACTION_VERSION,
          "X-Blockchain-Ids": current_blockchain_id,
        }
      }
    );
  }
};

export const OPTIONS = async () => {
  return new Response(null, { 
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "X-Action-Version": X_ACTION_VERSION,
      "X-Blockchain-Ids": current_blockchain_id,
    }
  });
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ capsule_id: string }> }
) => {
  try {
    const { capsule_id } = await params;
    const body: ActionPostRequest = await req.json();

    // Validate user wallet
    let userWallet: PublicKey;
    try {
      userWallet = new PublicKey(body.account);
    } catch {
      return NextResponse.json(
        { error: "Invalid account provided" },
        { 
          status: 400, 
          headers: {
            ...ACTIONS_CORS_HEADERS,
            "X-Action-Version": X_ACTION_VERSION,
            "X-Blockchain-Ids": current_blockchain_id,
          }
        }
      );
    }

    // Extract action parameters
    const data = body.data as Record<string, unknown>;
    const action = data?.action as string;
    const guessContent = data?.guess_content as string;
    const isAnonymous = data?.is_anonymous === "true" || data?.is_anonymous === true;

    // Create transaction response using service
    const payload = await blinkService.createPostResponse({
      capsuleId: capsule_id,
      userWallet,
      action,
      guessContent,
      isAnonymous,
    });

    return NextResponse.json(payload, {
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": X_ACTION_VERSION,
        "X-Blockchain-Ids": current_blockchain_id,
      },
    });
  } catch (err) {
    console.error("Error in POST /api/guess/[capsule_id]:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: 500, 
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "X-Action-Version": X_ACTION_VERSION,
          "X-Blockchain-Ids": current_blockchain_id,
        }
      }
    );
  }
};