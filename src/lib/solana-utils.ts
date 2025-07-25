import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

// Program constants
const CAPSULE_SEED = "capsule";
const VAULT_SEED = "vault";
const GAME_SEED = "game";
const GUESS_SEED = "guess";

// Use the same program ID as your React Native app
export const CAPSULEX_PROGRAM_ID = new PublicKey("J1r7tHjxEuCcSYVrikUKxzyeeccuC3QbyHjUbY8Pw7uH");

export function getCapsulePda(
  creator: PublicKey,
  revealDate: anchor.BN,
  programId: PublicKey = CAPSULEX_PROGRAM_ID
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(CAPSULE_SEED),
      creator.toBuffer(),
      Buffer.from(revealDate.toArray("le", 8)),
    ],
    programId
  );
  return pda;
}

export function getGamePda(
  capsulePda: PublicKey,
  programId: PublicKey = CAPSULEX_PROGRAM_ID
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_SEED), capsulePda.toBuffer()],
    programId
  );
  return pda;
}

export function getGuessPda(
  gamePda: PublicKey,
  guesser: PublicKey,
  guessIndex: number,
  programId: PublicKey = CAPSULEX_PROGRAM_ID
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(GUESS_SEED),
      gamePda.toBuffer(),
      guesser.toBuffer(),
      Buffer.from(new Uint32Array([guessIndex]).buffer),
    ],
    programId
  );
  return pda;
}

export function getVaultPda(programId: PublicKey = CAPSULEX_PROGRAM_ID): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED)],
    programId
  );
  return pda;
}

export function parseRevealDate(dateString: string): anchor.BN {
  const timestamp = Math.floor(new Date(dateString).getTime() / 1000);
  return new anchor.BN(timestamp);
}