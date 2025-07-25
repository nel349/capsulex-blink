import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ capsule_id: string }> }
) {
  const { capsule_id } = await params;
  const userAgent = req.headers.get("user-agent") || "";
  
  // Check if this is a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  
  // Check if the user has the CapsuleX app installed (you can detect this various ways)
  // For now, we'll assume mobile users might have the app installed
  
  if (isMobile) {
    // Try deep link first, with web fallback
    const deepLink = `capsulex://game/${capsule_id}`;
    const webFallback = `https://capsulex.xyz/game/${capsule_id}`; // Update with your web app URL
    
    // Create a page that attempts deep link with fallback
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Opening CapsuleX...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .container { max-width: 400px; padding: 2rem; }
            .logo { font-size: 3rem; margin-bottom: 1rem; }
            .title { font-size: 1.5rem; margin-bottom: 1rem; }
            .subtitle { opacity: 0.8; margin-bottom: 2rem; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              border-radius: 8px;
              color: white;
              text-decoration: none;
              margin: 0.5rem;
              transition: all 0.2s;
            }
            .button:hover { background: rgba(255,255,255,0.3); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎯</div>
            <h1 class="title">Opening CapsuleX</h1>
            <p class="subtitle">Time Capsule Game</p>
            <p>Redirecting to the app...</p>
            
            <div style="margin-top: 2rem;">
              <a href="${deepLink}" class="button">Open in App</a>
              <a href="${webFallback}" class="button">Open in Browser</a>
            </div>
          </div>
          
          <script>
            // Attempt deep link immediately
            window.location.href = "${deepLink}";
            
            // If deep link fails, redirect to web after short delay
            setTimeout(() => {
              if (document.hasFocus()) {
                // User is still on this page, deep link probably failed
                window.location.href = "${webFallback}";
              }
            }, 2500);
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } else {
    // Desktop users - redirect to Blink or web app
    const blinkUrl = `/api/guess/${capsule_id}`;
    return NextResponse.redirect(new URL(blinkUrl, req.url));
  }
}