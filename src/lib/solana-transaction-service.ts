import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { capsuleXAPI, CapsuleDetails, GameDetails } from "./capsulex-api";
import { 
  getCapsulePda, 
  getGamePda, 
  getGuessPda, 
  getVaultPda, 
  parseRevealDate,
  CAPSULEX_PROGRAM_ID 
} from "./solana-utils";

// Import program IDL and types
import type { Capsulex as CapsulexProgramType } from "../assets/capsulex";
import idl from "../assets/capsulex.json";

export interface GuessSubmissionParams {
  capsuleId: string;
  guesserWallet: PublicKey;
  guessContent: string;
  isAnonymous: boolean;
}

export interface TransactionResult {
  transaction: Transaction;
  message: string;
}

export class SolanaTransactionService {
  private connection: Connection;

  constructor() {
    // Use devnet for now - can be made configurable
    this.connection = new Connection("https://api.devnet.solana.com");
  }

  async createGuessSubmissionTransaction(params: GuessSubmissionParams): Promise<TransactionResult> {
    const { capsuleId, guesserWallet, guessContent, isAnonymous } = params;

    // Validate input
    if (!guessContent || guessContent.trim() === "") {
      throw new Error("Guess content is required");
    }

    // Get capsule and game details from backend
    const capsuleDetails = await capsuleXAPI.getCapsuleDetails(capsuleId);
    const gameDetails = await capsuleXAPI.getGameDetails(capsuleId);

    // Validate game state
    this.validateGameState(capsuleDetails, gameDetails);

    // console.log('capsuleDetails', capsuleDetails);
    // console.log('gameDetails', gameDetails);

    // Derive PDAs
    const pdas = this.derivePDAs(capsuleDetails, gameDetails, guesserWallet);

    // Create the transaction
    const transaction = await this.buildSubmitGuessTransaction(
      pdas,
      guesserWallet,
      guessContent,
      isAnonymous
    );

    // Transaction info for debugging (signature only available after signing)
    console.log('Transaction created with blockhash:', transaction.recentBlockhash);
    console.log('Transaction instructions:', transaction.instructions.length);
    
    const message = `🎯 Submitted ${isAnonymous ? 'anonymous' : 'public'} guess: "${guessContent}"`;

    return { transaction, message };
  }

  async createViewTransaction(capsuleId: string, userWallet: PublicKey): Promise<TransactionResult> {
    // For view action, create a minimal transaction that doesn't change state
    // This could be a no-op instruction or a small fee to the vault
    const transaction = new Transaction();
    const vaultPda = getVaultPda();

    // Add a minimal instruction - could be a view fee or no-op
    // For now, we'll create a minimal transfer instruction
    const viewInstruction = new TransactionInstruction({
      keys: [
        { pubkey: userWallet, isSigner: true, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
      ],
      programId: CAPSULEX_PROGRAM_ID,
      data: Buffer.from([]), // Empty data for now
    });

    transaction.add(viewInstruction);
    await this.finalizeTransaction(transaction, userWallet);

    return {
      transaction,
      message: `📊 Viewing details for Time Capsule ${capsuleId}`,
    };
  }

  async createLeaderboardTransaction(capsuleId: string, userWallet: PublicKey): Promise<TransactionResult> {
    // Similar to view, but for leaderboard
    const transaction = new Transaction();
    const vaultPda = getVaultPda();

    const leaderboardInstruction = new TransactionInstruction({
      keys: [
        { pubkey: userWallet, isSigner: true, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
      ],
      programId: CAPSULEX_PROGRAM_ID,
      data: Buffer.from([]), // Empty data for now
    });

    transaction.add(leaderboardInstruction);
    await this.finalizeTransaction(transaction, userWallet);

    return {
      transaction,
      message: `🏆 Checking leaderboard for Time Capsule ${capsuleId}`,
    };
  }

  private validateGameState(capsuleDetails: CapsuleDetails, gameDetails: GameDetails): void {
    if (!capsuleDetails.is_gamified) {
      throw new Error("This capsule is not gamified");
    }

    if (!gameDetails.is_active) {
      throw new Error("This game is no longer active");
    }

    if (gameDetails.current_guesses >= gameDetails.max_guesses) {
      throw new Error("Maximum number of guesses reached for this game");
    }
  }

  private derivePDAs(capsuleDetails: CapsuleDetails, gameDetails: GameDetails, guesserWallet: PublicKey) {
    const creator = new PublicKey(capsuleDetails.users?.wallet_address);
    const revealDate = parseRevealDate(capsuleDetails.reveal_date);
    const capsulePda = getCapsulePda(creator, revealDate);
    const gamePda = getGamePda(capsulePda);
    const guessPda = getGuessPda(gamePda, guesserWallet, gameDetails.current_guesses);
    const vaultPda = getVaultPda();

    return {
      creator,
      capsulePda,
      gamePda,
      guessPda,
      vaultPda,
    };
  }

  private async buildSubmitGuessTransaction(
    pdas: ReturnType<typeof this.derivePDAs>,
    guesserWallet: PublicKey,
    guessContent: string,
    isAnonymous: boolean
  ): Promise<Transaction> {
    try {
      console.log('Building submitGuess transaction with PDAs:', {
        guesser: guesserWallet.toBase58(),
        game: pdas.gamePda.toBase58(),
        guess: pdas.guessPda.toBase58(),
        vault: pdas.vaultPda.toBase58(),
      });

      // Create a minimal provider for instruction building (no actual signing)
      const dummyWallet = {
        publicKey: guesserWallet,
        signTransaction: async () => { throw new Error("This wallet is for instruction building only"); },
        signAllTransactions: async () => { throw new Error("This wallet is for instruction building only"); },
      } satisfies Partial<anchor.Wallet>;
      
      const provider = new AnchorProvider(
        this.connection,
        dummyWallet as unknown as anchor.Wallet,
        { commitment: "confirmed" }
      );

      // Create program instance using the IDL
      const program = new Program<CapsulexProgramType>(
        idl as CapsulexProgramType,
        provider
      );

      console.log('Program ID from IDL:', program.programId.toBase58());
      console.log('Expected Program ID:', CAPSULEX_PROGRAM_ID.toBase58());

      // Create the submitGuess instruction using Anchor methods (like your React Native app)
      const instruction = await program.methods
        .submitGuess(guessContent, isAnonymous)
        .accountsPartial({
          guesser: guesserWallet,
          game: pdas.gamePda,
          guess: pdas.guessPda,
          vault: pdas.vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

      console.log('Created submitGuess instruction:', instruction);

      // Create transaction and add instruction
      const transaction = new Transaction();
      transaction.add(instruction);
      
      await this.finalizeTransaction(transaction, guesserWallet);
      
      console.log('Transaction finalized with recent blockhash');
      
      return transaction;
      
    } catch (error) {
      console.error("Error building submit guess transaction:", error);
      throw new Error(`Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async finalizeTransaction(transaction: Transaction, feePayer: PublicKey): Promise<void> {
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer;
  }
}

export const solanaTransactionService = new SolanaTransactionService();