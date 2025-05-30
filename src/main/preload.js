const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Screen capture
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  getUserMediaAccess: () => ipcRenderer.invoke('get-user-media-access'),
  
  // Recording controls
  startRecording: (options) => ipcRenderer.invoke('start-recording', options),
  stopRecording: () => ipcRenderer.invoke('stop-recording'),
  saveVideoData: (data) => ipcRenderer.invoke('save-video-data', data),
  
  // Recording management
  getRecordings: () => ipcRenderer.invoke('get-recordings'),
  openRecordingsFolder: () => ipcRenderer.invoke('open-recordings-folder'),
  openRecordingFile: (filePath) => ipcRenderer.invoke('open-recording-file', filePath),
  deleteRecording: (filePath) => ipcRenderer.invoke('delete-recording', filePath),
  
  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  
  // Event listeners
  onNewRecording: (callback) => ipcRenderer.on('new-recording', callback),
  onStartRecordingShortcut: (callback) => ipcRenderer.on('start-recording-shortcut', callback),
  onStopRecordingShortcut: (callback) => ipcRenderer.on('stop-recording-shortcut', callback),
  onPauseRecordingShortcut: (callback) => ipcRenderer.on('pause-recording-shortcut', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose version info
contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
}); 