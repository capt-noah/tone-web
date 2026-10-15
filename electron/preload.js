const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,

  getStorageInfo: () => ipcRenderer.invoke('desktop:get-storage-info'),
  getDownloadedTracks: () => ipcRenderer.invoke('desktop:get-downloaded-tracks'),
  downloadTrack: (song, token) => ipcRenderer.invoke('desktop:download-track', { song, token }),
  deleteDownloadedTrack: (songId) => ipcRenderer.invoke('desktop:delete-downloaded-track', songId),
  saveLyrics: (songId, lyrics) => ipcRenderer.invoke('desktop:save-lyrics', { songId, lyrics }),
  getLyrics: (songId) => ipcRenderer.invoke('desktop:get-lyrics', songId),
  scanLocals: () => ipcRenderer.invoke('desktop:scan-locals'),
  openStorageFolder: (subfolder) => ipcRenderer.invoke('desktop:open-storage-folder', subfolder),
  toggleWidgetWindow: (show) => ipcRenderer.invoke('desktop:toggle-widget-window', show),
  toggleTrayPopover: (show) => ipcRenderer.invoke('desktop:toggle-tray-popover', show),
  syncPlaybackState: (state) => ipcRenderer.send('desktop:sync-playback-state', state),

  onPlaybackCommand: (callback) => {
    const handler = (_event, { command, payload }) => callback(command, payload);
    ipcRenderer.on('desktop:playback-command', handler);
    return () => ipcRenderer.removeListener('desktop:playback-command', handler);
  },

  onPlaybackStateUpdated: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('desktop:playback-state-updated', handler);
    return () => ipcRenderer.removeListener('desktop:playback-state-updated', handler);
  },

  onLocalTracksUpdated: (callback) => {
    const handler = (_event, tracks) => callback(tracks);
    ipcRenderer.on('desktop:local-tracks-updated', handler);
    return () => ipcRenderer.removeListener('desktop:local-tracks-updated', handler);
  },

  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('desktop:download-progress', handler);
    return () => ipcRenderer.removeListener('desktop:download-progress', handler);
  },
});
