import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";
import { NextResponse } from "next/server";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      // Map all guess routes to the guess action
      {
        pathPattern: "/api/guess/**",
        apiPath: "/api/guess/**",
      },
    ],
  };

  return NextResponse.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = async () => {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
};