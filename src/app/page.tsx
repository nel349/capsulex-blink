import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-4">
          <Image
            src="/icon.png"
            alt="CapsuleX logo"
            width={60}
            height={60}
            priority
          />
          <div>
            <h1 className="text-3xl font-bold text-center sm:text-left">CapsuleX Blinks</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Solana Actions for Time Capsule Games</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">🏆 Leaderboard Blinks</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            CapsuleX now supports Solana Actions (Blinks) for leaderboard functionality. 
            Use these URLs in any Solana wallet that supports Actions to view rankings, 
            check your stats, and compete with other players.
          </p>
          
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">🌍 Global Leaderboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                View top players and global rankings
              </p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                /api/leaderboard/global
              </code>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">📊 User Stats</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Check your personal statistics and ranking
              </p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                /api/leaderboard/user?wallet=YOUR_WALLET
              </code>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">🎮 Game Leaderboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                View participants and rankings for specific games
              </p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                /api/leaderboard/game/[capsule_id]
              </code>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/api/leaderboard/global"
            target="_blank"
            rel="noopener noreferrer"
          >
            🏆 Test Global Leaderboard
          </a>
          <a
            className="rounded-full border border-solid border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/leaderboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            📊 Leaderboard Hub
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
