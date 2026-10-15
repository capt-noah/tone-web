const { app, BrowserWindow, ipcMain, protocol, globalShortcut, Tray, screen, shell, net } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { pathToFileURL } = require('url');

// Register privileged scheme for media streaming and CORS BEFORE app ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'musicly-local',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true,
    },
  },
]);

// Enable GPU Hardware Acceleration & ProMotion 120Hz
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

app.setName('Musicly');

// Sideloading parser
let mm;
try {
  mm = require('music-metadata');
} catch (e) {
  console.warn('[Desktop] music-metadata loading defer:', e);
}

// Storage Directories
const MUSICLY_ROOT = path.join(os.homedir(), 'Music', 'Musicly');
const TRACKS_DIR = path.join(MUSICLY_ROOT, 'Tracks');
const ARTWORK_DIR = path.join(MUSICLY_ROOT, 'Artwork');
const LOCALS_DIR = path.join(MUSICLY_ROOT, 'Locals');
const LYRICS_DIR = path.join(MUSICLY_ROOT, 'Lyrics');
const INDEX_FILE = path.join(MUSICLY_ROOT, 'index.json');

function ensureDirectories() {
  [MUSICLY_ROOT, TRACKS_DIR, ARTWORK_DIR, LOCALS_DIR, LYRICS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify({}), 'utf-8');
  }
}

function getIndex() {
  try {
    ensureDirectories();
    const data = fs.readFileSync(INDEX_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch {
    return {};
  }
}

function saveIndex(indexData) {
  try {
    ensureDirectories();
    fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Desktop] Failed to write index:', err);
  }
}

let mainWindow = null;
let widgetWindow = null;
let trayWindow = null;
let tray = null;
let latestPlaybackState = null;
let localsWatcher = null;
let serverProcess = null;
let appBaseUrl = 'http://localhost:3000';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = process.env.PORT || 3000;

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = require('net').createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await net.fetch(url);
      if (res.ok || res.status === 200 || res.status === 304 || res.status === 404) {
        return true;
      }
    } catch {
      // wait a bit
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function initServer() {
  if (isDev) {
    try {
      const res = await net.fetch(`http://127.0.0.1:${PORT}`);
      if (res.ok || res.status === 200 || res.status === 304 || res.status === 404) {
        appBaseUrl = `http://127.0.0.1:${PORT}`;
        console.log('[Desktop] Connected to dev server on port:', PORT);
        return appBaseUrl;
      }
    } catch {
      // Dev server not active on PORT
    }
  }

  const possibleDirs = [
    path.join(__dirname, '../.next/standalone'),
    path.join(process.resourcesPath, 'app/.next/standalone'),
    path.join(process.resourcesPath, '.next/standalone'),
  ];

  const standaloneDir = possibleDirs.find((d) => fs.existsSync(path.join(d, 'server.js')));
  if (standaloneDir) {
    const freePort = await getFreePort();
    console.log('[Desktop] Launching internal Next.js server on port:', freePort, 'from:', standaloneDir);

    const { fork } = require('child_process');
    const serverScript = path.join(standaloneDir, 'server.js');
    serverProcess = fork(serverScript, [], {
      cwd: standaloneDir,
      env: {
        ...process.env,
        PORT: String(freePort),
        HOSTNAME: '127.0.0.1',
        NODE_ENV: 'production',
      },
      stdio: 'pipe',
    });

    appBaseUrl = `http://127.0.0.1:${freePort}`;
    const isReady = await waitForServer(appBaseUrl, 10000);
    console.log('[Desktop] Server ready status:', isReady, 'URL:', appBaseUrl);
    return appBaseUrl;
  }

  appBaseUrl = `http://127.0.0.1:${PORT}`;
  return appBaseUrl;
}

// Register custom protocol for local audio streaming with range support
function registerMediaProtocol() {
  protocol.handle('musicly-local', async (request) => {
    try {
      const url = new URL(request.url);
      const category = url.hostname; // 'tracks', 'locals', 'artwork'
      const relativePath = decodeURIComponent(url.pathname.replace(/^\//, ''));

      let targetDir = TRACKS_DIR;
      if (category === 'locals') targetDir = LOCALS_DIR;
      else if (category === 'artwork') targetDir = ARTWORK_DIR;

      const filePath = path.join(targetDir, relativePath);

      if (!fs.existsSync(filePath)) {
        console.warn('[Protocol] Local file not found:', filePath);
        return new Response('File not found', { status: 404 });
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const ext = path.extname(filePath).toLowerCase();

      let mimeType = 'audio/mpeg';
      if (ext === '.flac') mimeType = 'audio/flac';
      else if (ext === '.m4a' || ext === '.mp4') mimeType = 'audio/mp4';
      else if (ext === '.wav') mimeType = 'audio/wav';
      else if (ext === '.ogg' || ext === '.opus') mimeType = 'audio/ogg';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';

      const rangeHeader = request.headers.get('range');
      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10) || 0;
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const fileStream = fs.createReadStream(filePath, { start, end });
        const webStream = new ReadableStream({
          start(controller) {
            fileStream.on('data', (chunk) => controller.enqueue(chunk));
            fileStream.on('end', () => controller.close());
            fileStream.on('error', (err) => controller.error(err));
          },
          cancel() {
            fileStream.destroy();
          },
        });

        return new Response(webStream, {
          status: 206,
          statusText: 'Partial Content',
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const fileStream = fs.createReadStream(filePath);
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new Response(webStream, {
        status: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Accept-Ranges': 'bytes',
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      console.error('[Protocol] Error handling musicly-local:', err);
      return new Response('Internal error', { status: 500 });
    }
  });
}

function createMainWindow() {
  const iconPath = path.join(__dirname, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 980,
    minHeight: 640,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#0d0f0d',
    show: false,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      scrollBounce: true,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL(appBaseUrl);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });

  // Safety fallback to prevent any stuck hidden window
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 1000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createWidgetWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  widgetWindow = new BrowserWindow({
    width: 360,
    height: 104,
    x: width - 380,
    y: 60,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  widgetWindow.loadURL(`${appBaseUrl}/widget`);

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

function createTrayPopoverWindow() {
  trayWindow = new BrowserWindow({
    width: 340,
    height: 440,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    skipTaskbar: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  trayWindow.loadURL(`${appBaseUrl}/tray`);

  trayWindow.on('blur', () => {
    if (trayWindow && trayWindow.isVisible()) {
      trayWindow.hide();
    }
  });

  trayWindow.on('closed', () => {
    trayWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'tray-icon.png');
  const fallbackIcon = path.join(__dirname, 'icon.png');
  const selectedIcon = fs.existsSync(iconPath) ? iconPath : fallbackIcon;

  try {
    tray = new Tray(selectedIcon);
    tray.setToolTip('Musicly Audio Player');

    tray.on('click', (_event, bounds) => {
      toggleTrayWindow(bounds);
    });
  } catch (err) {
    console.warn('[Tray] Could not initialize tray icon:', err);
  }
}

function toggleTrayWindow(bounds) {
  if (!trayWindow) {
    createTrayPopoverWindow();
  }

  if (trayWindow.isVisible()) {
    trayWindow.hide();
    return;
  }

  const trayBounds = bounds || (tray ? tray.getBounds() : { x: 100, y: 0, width: 20 });
  const windowBounds = trayWindow.getBounds();

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  trayWindow.setPosition(x, y, false);
  trayWindow.show();
  trayWindow.focus();

  if (latestPlaybackState) {
    trayWindow.webContents.send('desktop:playback-state-updated', latestPlaybackState);
  }
}

function registerShortcuts() {
  try {
    globalShortcut.register('MediaPlayPause', () => {
      dispatchPlaybackCommand('toggle');
    });
    globalShortcut.register('MediaTrackNext', () => {
      dispatchPlaybackCommand('next');
    });
    globalShortcut.register('MediaTrackPrevious', () => {
      dispatchPlaybackCommand('previous');
    });
  } catch (err) {
    console.warn('[Shortcuts] Media keys register failed:', err);
  }
}

function dispatchPlaybackCommand(command, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('desktop:playback-command', { command, payload });
  }
}

function setupLocalsWatcher() {
  let chokidar;
  try {
    chokidar = require('chokidar');
  } catch {
    return;
  }

  ensureDirectories();
  localsWatcher = chokidar.watch(LOCALS_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    depth: 2,
  });

  const notifyUpdate = async () => {
    const tracks = await scanLocalFiles();
    [mainWindow, widgetWindow, trayWindow].forEach((win) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('desktop:local-tracks-updated', tracks);
      }
    });
  };

  localsWatcher.on('add', notifyUpdate).on('unlink', notifyUpdate);
}

async function scanLocalFiles() {
  ensureDirectories();
  if (!mm) {
    try {
      mm = require('music-metadata');
    } catch {
      return [];
    }
  }

  const files = fs.readdirSync(LOCALS_DIR);
  const audioExtensions = new Set(['.mp3', '.m4a', '.flac', '.wav', '.aac', '.ogg', '.opus']);
  const audioFiles = files.filter((f) => audioExtensions.has(path.extname(f).toLowerCase()));

  const tracks = [];

  for (const filename of audioFiles) {
    const filePath = path.join(LOCALS_DIR, filename);
    const id = `local_${encodeURIComponent(filename.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_'))}`;

    try {
      const metadata = await mm.parseFile(filePath);
      const title = metadata.common.title || filename.replace(/\.[^/.]+$/, '');
      const artistName = metadata.common.artist || 'Local Artist';
      const albumTitle = metadata.common.album || 'Standalone Tracks';
      const durationSec = Math.floor(metadata.format.duration || 0);

      // Extract cover art if present
      let coverFileId = null;
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        const ext = pic.format.includes('png') ? 'png' : 'jpg';
        const coverName = `${id}_cover.${ext}`;
        const coverFullPath = path.join(ARTWORK_DIR, coverName);

        if (!fs.existsSync(coverFullPath)) {
          fs.writeFileSync(coverFullPath, pic.data);
        }
        coverFileId = `musicly-local://artwork/${coverName}`;
      }

      tracks.push({
        id,
        title,
        artistName,
        albumTitle,
        durationSec,
        audioFileId: `musicly-local://locals/${encodeURIComponent(filename)}`,
        coverFileId,
        isLocalOnly: true,
        filePath,
      });
    } catch (err) {
      console.warn('[Scanner] Failed parsing:', filename, err);
    }
  }

  return tracks;
}

// IPC Handlers
function setupIpc() {
  ipcMain.handle('desktop:get-storage-info', async () => {
    ensureDirectories();
    const index = getIndex();
    const trackKeys = Object.keys(index);

    let totalSizeBytes = 0;
    trackKeys.forEach((key) => {
      totalSizeBytes += index[key].fileSizeBytes || 0;
    });

    const locals = fs.readdirSync(LOCALS_DIR);

    return {
      storagePath: MUSICLY_ROOT,
      tracksCount: trackKeys.length,
      totalSizeBytes,
      formattedSize: (totalSizeBytes / (1024 * 1024)).toFixed(1) + ' MB',
      localsCount: locals.length,
    };
  });

  ipcMain.handle('desktop:get-downloaded-tracks', async () => {
    return getIndex();
  });

  ipcMain.handle('desktop:download-track', async (_event, { song, token }) => {
    ensureDirectories();
    const songId = song.id;
    const targetAudioPath = path.join(TRACKS_DIR, `${songId}.mp3`);
    const targetCoverPath = path.join(ARTWORK_DIR, `${songId}.jpg`);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://musicly-4l0y.onrender.com';
      const audioStreamUrl = `${backendUrl}/media/audio/${encodeURIComponent(song.audioFileId || song.id)}`;

      // 1. Download audio file
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(audioStreamUrl, { headers });

      if (!res.ok) {
        throw new Error(`Audio download failed: ${res.status}`);
      }

      const fileStream = fs.createWriteStream(targetAudioPath);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(targetAudioPath, buffer);

      // 2. Download cover artwork if available
      let coverUrl = null;
      if (song.coverFileId || song.audioFileId) {
        const coverTarget = song.coverFileId || song.audioFileId;
        const coverFetchUrl = `${backendUrl}/media/cover/${encodeURIComponent(coverTarget)}`;
        try {
          const coverRes = await fetch(coverFetchUrl);
          if (coverRes.ok) {
            const coverBuffer = Buffer.from(await coverRes.arrayBuffer());
            fs.writeFileSync(targetCoverPath, coverBuffer);
            coverUrl = `musicly-local://artwork/${songId}.jpg`;
          }
        } catch {
          // ignore cover fail
        }
      }

      const downloadedTrack = {
        songId,
        audioPath: `musicly-local://tracks/${songId}.mp3`,
        coverPath: coverUrl,
        downloadedAt: new Date().toISOString(),
        fileSizeBytes: buffer.length,
      };

      const index = getIndex();
      index[songId] = downloadedTrack;
      saveIndex(index);

      return { success: true, track: downloadedTrack };
    } catch (err) {
      console.error('[Download] Failed for song:', songId, err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('desktop:delete-downloaded-track', async (_event, songId) => {
    const index = getIndex();
    const targetAudioPath = path.join(TRACKS_DIR, `${songId}.mp3`);
    const targetCoverPath = path.join(ARTWORK_DIR, `${songId}.jpg`);

    if (fs.existsSync(targetAudioPath)) fs.unlinkSync(targetAudioPath);
    if (fs.existsSync(targetCoverPath)) fs.unlinkSync(targetCoverPath);

    delete index[songId];
    saveIndex(index);
    return { success: true };
  });

  ipcMain.handle('desktop:save-lyrics', async (_event, { songId, lyrics }) => {
    try {
      ensureDirectories();
      if (!songId) return { success: false, error: 'No songId provided' };
      const lyricsPath = path.join(LYRICS_DIR, `${songId}.lrc`);
      if (lyrics && lyrics.trim()) {
        fs.writeFileSync(lyricsPath, lyrics, 'utf-8');
      } else if (fs.existsSync(lyricsPath)) {
        fs.unlinkSync(lyricsPath);
      }
      return { success: true };
    } catch (err) {
      console.error('[Desktop] Failed to save lyrics:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('desktop:get-lyrics', async (_event, songId) => {
    try {
      ensureDirectories();
      if (!songId) return null;
      const lyricsPath = path.join(LYRICS_DIR, `${songId}.lrc`);
      if (fs.existsSync(lyricsPath)) {
        return fs.readFileSync(lyricsPath, 'utf-8');
      }
      return null;
    } catch (err) {
      console.error('[Desktop] Failed to read lyrics:', err);
      return null;
    }
  });

  ipcMain.handle('desktop:scan-locals', async () => {
    return scanLocalFiles();
  });

  ipcMain.handle('desktop:open-storage-folder', async (_event, subfolder = '') => {
    let target = MUSICLY_ROOT;
    if (subfolder === 'Tracks') target = TRACKS_DIR;
    else if (subfolder === 'Locals') target = LOCALS_DIR;
    else if (subfolder === 'Artwork') target = ARTWORK_DIR;
    else if (subfolder === 'Lyrics') target = LYRICS_DIR;

    ensureDirectories();
    shell.openPath(target);
  });

  ipcMain.handle('desktop:toggle-widget-window', async (_event, show) => {
    if (!widgetWindow) {
      createWidgetWindow();
    }

    const shouldShow = show !== undefined ? show : !widgetWindow.isVisible();
    if (shouldShow) {
      widgetWindow.show();
      if (latestPlaybackState) {
        widgetWindow.webContents.send('desktop:playback-state-updated', latestPlaybackState);
      }
    } else {
      widgetWindow.hide();
    }
    return widgetWindow.isVisible();
  });

  ipcMain.handle('desktop:toggle-tray-popover', async () => {
    toggleTrayWindow();
    return trayWindow ? trayWindow.isVisible() : false;
  });

  ipcMain.on('desktop:sync-playback-state', (_event, state) => {
    latestPlaybackState = state;

    // Relay strictly to widget & tray windows that are currently open and visible
    if (widgetWindow && !widgetWindow.isDestroyed() && widgetWindow.isVisible()) {
      widgetWindow.webContents.send('desktop:playback-state-updated', state);
    }
    if (trayWindow && !trayWindow.isDestroyed() && trayWindow.isVisible()) {
      trayWindow.webContents.send('desktop:playback-state-updated', state);
    }
  });
}

// App lifecycle
app.whenReady().then(async () => {
  ensureDirectories();
  registerMediaProtocol();
  setupIpc();

  try {
    await initServer();
  } catch (err) {
    console.error('[Desktop] Server initialization error:', err);
  }

  createMainWindow();
  createTray();
  registerShortcuts();
  setupLocalsWatcher();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('before-quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill('SIGTERM');
    } catch {}
    serverProcess = null;
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (localsWatcher) {
    localsWatcher.close();
  }
  if (serverProcess) {
    try {
      serverProcess.kill('SIGTERM');
    } catch {}
    serverProcess = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
