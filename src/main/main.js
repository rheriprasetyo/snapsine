const { app, BrowserWindow, ipcMain, desktopCapturer, session, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Store = require('electron-store');

// Initialize settings store
const store = new Store();

let mainWindow;
let isRecording = false;

// Create recordings directory with better error handling
const recordingsDir = path.join(os.homedir(), 'Desktop', 'snapsine');

const ensureRecordingsDirectory = () => {
  try {
    if (!fs.existsSync(recordingsDir)) {
      console.log('Creating recordings directory:', recordingsDir);
      fs.mkdirSync(recordingsDir, { recursive: true });
      console.log('✅ Recordings directory created successfully');
    } else {
      console.log('✅ Recordings directory already exists:', recordingsDir);
    }
    
    // Test write permissions
    const testFile = path.join(recordingsDir, '.write-test');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Recordings directory has write permissions');
    } catch (error) {
      console.error('❌ Recordings directory is not writable:', error);
      throw new Error(`Recordings directory is not writable: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to setup recordings directory:', error);
    return false;
  }
};

// Initialize recordings directory
const recordingsDirReady = ensureRecordingsDirectory();

// Better development detection
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev') || !app.isPackaged;

// Enable live reload for development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    console.log('Live reload not available (electron-reload not installed)');
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Required for media capture
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      enableBlinkFeatures: 'MediaRecorder,GetDisplayMedia,ScreenCapture'
    },
    titleBarStyle: 'default',
    frame: true,
    show: false
  });

  // Load the app
  if (isDev) {
    console.log('Loading development server at http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading production build');
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Snapsine window is ready');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorDescription);
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  // Log any console messages from the renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer console [${level}]:`, message);
  });

  // Add a timeout to check if page loads
  setTimeout(() => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`
        console.log('Electron main checking: Document ready state:', document.readyState);
        console.log('Electron main checking: Body innerHTML length:', document.body ? document.body.innerHTML.length : 'no body');
        console.log('Electron main checking: Root element:', document.getElementById('root') ? 'found' : 'not found');
      `);
    }
  }, 3000);
}

// App event listeners
app.whenReady().then(() => {
  // Set up media permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('Permission requested:', permission);
    // Allow all media permissions for screen recording
    if (permission === 'media' || permission === 'camera' || permission === 'microphone' || permission === 'screen') {
      callback(true);
    } else {
      callback(true); // Allow all permissions for development
    }
  });

  // Set up permissions check handler
  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    console.log('Permission check:', permission, requestingOrigin);
    return true; // Allow all permissions
  });

  // Enable media stream APIs
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    console.log('Display media request');
    // Automatically approve display media requests
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' });
    });
  });

  createWindow();
  
  // Set up menu
  createMenu();
  
  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for screen recording
ipcMain.handle('get-desktop-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });
    return sources;
  } catch (error) {
    console.error('Error getting desktop sources:', error);
    return [];
  }
});

ipcMain.handle('get-user-media-access', async () => {
  try {
    // Request camera and microphone permissions
    const access = await session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'camera' || permission === 'microphone') {
        callback(true);
      } else {
        callback(false);
      }
    });
    return true;
  } catch (error) {
    console.error('Error requesting media access:', error);
    return false;
  }
});

ipcMain.handle('start-recording', async (event, options) => {
  try {
    isRecording = true;
    console.log('Recording started with options:', options);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `snapsine-recording-${timestamp}.webm`;
    const filePath = path.join(recordingsDir, filename);
    
    // Store recording info for the renderer process
    store.set('currentRecording', {
      filename,
      filePath,
      startTime: new Date().toISOString(),
      options
    });
    
    return { 
      success: true, 
      filename,
      filePath,
      recordingsDir
    };
  } catch (error) {
    console.error('Failed to start recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-recording', async () => {
  try {
    isRecording = false;
    console.log('Recording stopped');
    
    const currentRecording = store.get('currentRecording');
    if (currentRecording) {
      // Update recording with end time
      const recording = {
        ...currentRecording,
        endTime: new Date().toISOString(),
        duration: Date.now() - new Date(currentRecording.startTime).getTime()
      };
      
      // Add to recordings history
      const recordings = store.get('recordings', []);
      recordings.unshift(recording);
      store.set('recordings', recordings.slice(0, 50)); // Keep last 50 recordings
      
      // Clear current recording
      store.delete('currentRecording');
      
      return { 
        success: true, 
        recording,
        filePath: recording.filePath
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-video-data', async (event, { videoBlob, filename }) => {
  try {
    // Check if recordings directory is ready
    if (!recordingsDirReady) {
      throw new Error('Recordings directory is not ready. Please check file permissions and disk space.');
    }
    
    // Validate input
    if (!videoBlob || !Array.isArray(videoBlob)) {
      throw new Error('Invalid video data: videoBlob must be an array');
    }
    
    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename: must be a non-empty string');
    }
    
    // Ensure recordings directory still exists and is writable
    if (!ensureRecordingsDirectory()) {
      throw new Error('Cannot access recordings directory');
    }
    
    const filePath = path.join(recordingsDir, filename);
    console.log('Saving video to:', filePath);
    console.log('Video data size:', videoBlob.length, 'bytes');
    
    // Convert blob data to buffer
    const buffer = Buffer.from(videoBlob);
    console.log('Created buffer with size:', buffer.length, 'bytes');
    
    // Check available disk space (optional but helpful)
    try {
      const stats = fs.statSync(recordingsDir);
      console.log('Recordings directory exists, preparing to write file...');
    } catch (error) {
      console.error('Error checking recordings directory:', error);
    }
    
    // Write file with better error handling
    try {
      fs.writeFileSync(filePath, buffer);
      console.log('✅ File written successfully');
    } catch (writeError) {
      console.error('❌ Failed to write file:', writeError);
      throw new Error(`Failed to write file: ${writeError.message}. Check disk space and permissions.`);
    }
    
    // Verify file was written correctly
    try {
      const fileStats = fs.statSync(filePath);
      console.log('✅ File verification: exists =', fs.existsSync(filePath), ', size =', fileStats.size, 'bytes');
      
      if (fileStats.size !== buffer.length) {
        console.warn('⚠️ File size mismatch: expected', buffer.length, 'got', fileStats.size);
      }
      
      if (fileStats.size === 0) {
        fs.unlinkSync(filePath); // Remove empty file
        throw new Error('Written file is empty. Recording may have failed.');
      }
      
    } catch (statError) {
      console.error('❌ Failed to verify written file:', statError);
      throw new Error(`File verification failed: ${statError.message}`);
    }

    console.log('✅ Video saved successfully to:', filePath);
    return { success: true, filePath, fileSize: buffer.length };
  } catch (error) {
    console.error('❌ Failed to save video:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-recordings', async () => {
  try {
    // Get recordings from store
    const storedRecordings = store.get('recordings', []);
    
    // Also scan the actual directory for .webm files
    const directoryRecordings = [];
    if (fs.existsSync(recordingsDir)) {
      const files = fs.readdirSync(recordingsDir);
      
      for (const file of files) {
        if (file.endsWith('.webm')) {
          const filePath = path.join(recordingsDir, file);
          const stats = fs.statSync(filePath);
          
          // Check if this file is already in stored recordings
          const alreadyStored = storedRecordings.find(r => r.filePath === filePath);
          
          if (!alreadyStored) {
            // Create a recording entry for files not in store
            directoryRecordings.push({
              filename: file,
              filePath: filePath,
              startTime: stats.birthtime.toISOString(),
              endTime: stats.mtime.toISOString(),
              duration: 0, // Unknown for manually created files
              fileSize: stats.size,
              exists: true,
              source: 'directory' // Mark as found via directory scan
            });
          }
        }
      }
    }
    
    // Verify stored recordings still exist and add file stats
    const validStoredRecordings = storedRecordings.filter(recording => {
      if (fs.existsSync(recording.filePath)) {
        const stats = fs.statSync(recording.filePath);
        recording.fileSize = stats.size;
        recording.exists = true;
        recording.source = 'store'; // Mark as from store
        return true;
      }
      return false;
    });
    
    // Combine both sources and sort by creation time (newest first)
    const allRecordings = [...validStoredRecordings, ...directoryRecordings];
    allRecordings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    // Update store with valid recordings only (keep only store-originated ones)
    store.set('recordings', validStoredRecordings);
    
    console.log(`Found ${allRecordings.length} recordings (${validStoredRecordings.length} from store, ${directoryRecordings.length} from directory)`);
    
    return allRecordings;
  } catch (error) {
    console.error('Error getting recordings:', error);
    return [];
  }
});

ipcMain.handle('open-recordings-folder', async () => {
  try {
    await shell.openPath(recordingsDir);
    return { success: true };
  } catch (error) {
    console.error('Failed to open recordings folder:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-recording-file', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    console.error('Failed to open recording file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-recording', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from store
    const recordings = store.get('recordings', []);
    const updatedRecordings = recordings.filter(r => r.filePath !== filePath);
    store.set('recordings', updatedRecordings);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  store.set('settings', settings);
  return { success: true };
});

ipcMain.handle('get-settings', async () => {
  return store.get('settings', {});
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Recording',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-recording');
          }
        },
        {
          label: 'Open Recordings Folder',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            await shell.openPath(recordingsDir);
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Recording',
      submenu: [
        {
          label: 'Start Recording',
          accelerator: 'F9',
          click: () => {
            mainWindow.webContents.send('start-recording-shortcut');
          }
        },
        {
          label: 'Stop Recording',
          accelerator: 'F10',
          click: () => {
            mainWindow.webContents.send('stop-recording-shortcut');
          }
        },
        {
          label: 'Pause/Resume',
          accelerator: 'F11',
          click: () => {
            mainWindow.webContents.send('pause-recording-shortcut');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Snapsine',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Snapsine',
              message: 'Snapsine',
              detail: 'Cinematic Screen Recording\nVersion 1.0.0\n\nRecordings are saved to:\n' + recordingsDir
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
} 