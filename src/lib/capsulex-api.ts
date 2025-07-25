import axios, { AxiosInstance } from 'axios';

/*
capsuleDetails {
  capsule_id: '1cedf984-b6aa-4825-8bca-6bb7e71c7c9e',
  user_id: '348f62d2-51d4-48cc-a734-7abe2cdda256',
  content_encrypted: '{"encryptedData":"73d5d7f39dba7b8d55ed5b727df9f73332e89cc8510c114c","keyId":"6654de7f73043d37","createdAt":"2025-07-24T07:36:59.881Z","walletAddress":"B8U3WHFB1er8pivejKDaN6DBc8EjKsmyQSEYxTv387bh"}',
  content_hash: '3a59eb8068df4d6b5c8987d377ecebe25e11036ab6fa79efc22027bf5e0948b9',
  has_media: false,
  media_urls: [],
  reveal_date: '2025-07-31T07:36:00+00:00',
  revealed_at: null,
  posted_to_social: false,
  social_post_id: null,
  social_platform: 'twitter',
  on_chain_tx: '3oiiLQPMMkBpn31QMskLQawTPWBvkksCLsZ9H9uRYkYk5sHKTy23D743xWkZNsXwTmnxMwFVggbJ7GvgAfV2xKwa',
  sol_fee_amount: 0.00005,
  can_edit: true,
  created_at: '2025-07-24T07:37:10.809479+00:00',
  status: 'pending',
  is_gamified: true,
  users: { wallet_address: 'B8U3WHFB1er8pivejKDaN6DBc8EjKsmyQSEYxTv387bh' }
}*/
interface CapsuleDetails {
  capsule_id: string;
  user_id: string;
  content_encrypted: string;
  content_hash: string;
  has_media: boolean;
  media_urls: string[];
  reveal_date: string;
  revealed_at: string | null;
  posted_to_social: boolean;
  social_post_id: string | null;
  social_platform: string;
  on_chain_tx: string;
  sol_fee_amount: number;
  can_edit: boolean;
  status: string;
  is_gamified: boolean;
  users: {
    wallet_address: string;
  };
}

interface GameDetails {
  game_id: string;
  capsule_id: string;
  capsule_pda: string;
  creator: string;
  max_guesses: number;
  max_winners: number;
  current_guesses: number;
  winners_found: number;
  is_active: boolean;
  winner: string | null;
  total_participants: number;
  reveal_date: string;
  created_at: string;
  content_hint: string;
  is_revealed: boolean;
}

class CapsuleXAPIService {
  private api: AxiosInstance;

  constructor() {
    // Use environment variable for backend URL, fallback to localhost for development
    const baseUrl = process.env.CAPSULEX_BACKEND_URL || 'http://localhost:3001';
    
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
  }

  async getCapsuleDetails(capsuleId: string): Promise<CapsuleDetails> {
    try {
      const response = await this.api.get(`/api/capsules/${capsuleId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch capsule details');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch capsule details: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async getGameDetails(capsuleId: string): Promise<GameDetails> {
    try {
      const response = await this.api.get(`/api/games/${capsuleId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch game details');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch game details: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async submitGuess(capsuleId: string, guessContent: string, isAnonymous: boolean, guesserWallet: string) {
    try {
      const response = await this.api.post(`/api/games/${capsuleId}/guess`, {
        guess_content: guessContent,
        is_anonymous: isAnonymous,
        guesser_wallet: guesserWallet,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to submit guess');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to submit guess: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}

export const capsuleXAPI = new CapsuleXAPIService();
export type { CapsuleDetails, GameDetails };