import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";
import { NextResponse } from "next/server";
import { current_blockchain_id, X_ACTION_VERSION } from "../constants";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      // Map all guess routes to the guess action
      {
        pathPattern: "/api/guess/**",
        apiPath: "/api/guess/**",
      },
      // Map game details routes
      {
        pathPattern: "/api/game-details/**",
        apiPath: "/api/game-details/**",
      },
      // Map game leaderboard routes
      {
        pathPattern: "/api/game-leaderboard/**",  
        apiPath: "/api/game-leaderboard/**",
      },
    ],
  };

  return NextResponse.json(payload, {
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "X-Action-Version": X_ACTION_VERSION,
      "X-Blockchain-Ids": current_blockchain_id,
    },
  });
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