import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod');

  // If user is accessing from an iOS device, redirect straight to the native OTA installer
  if (isIOS) {
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/ios', origin));
  }

  // Graceful mobile/desktop page for Android download
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tone App Downloads</title>
  <style>
    body { background: #0d0f0d; color: #fff8f2; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #161c17; border: 1px solid rgba(185,203,186,0.25); border-radius: 28px; padding: 36px 24px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 30px 90px rgba(0,0,0,0.9); }
    .icon { font-size: 40px; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #fff8f2; }
    p { font-size: 13px; color: #a6ada6; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: block; width: 100%; box-sizing: border-box; padding: 14px 20px; border-radius: 9999px; font-size: 14px; font-weight: 700; text-decoration: none; transition: transform 0.2s, background 0.2s; margin-bottom: 10px; }
    .btn-primary { background: #b9cbba; color: #0d0f0d; }
    .btn-primary:hover { background: #fff8f2; transform: scale(1.02); }
    .btn-secondary { background: rgba(255,255,255,0.06); color: #fff8f2; border: 1px solid rgba(255,255,255,0.15); }
    .btn-secondary:hover { background: rgba(255,255,255,0.12); transform: scale(1.02); }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: rgba(185,203,186,0.15); color: #b9cbba; font-size: 11px; font-weight: 700; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎵</div>
    <div class="badge">TONE NATIVE APP</div>
    <h1>Install Tone</h1>
    <p>The Android APK build is currently being compiled for direct download. If you are on an iPhone or iPad, you can install the signed native app right now!</p>
    <a href="/ios" class="btn btn-primary">📱 Install Tone for iOS (OTA)</a>
    <a href="/" class="btn btn-secondary">🌐 Open Web Player</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
