import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordingProvider, useRecording } from './contexts/RecordingContext';
import Header from './components/Header';
import RecordingPanel from './components/RecordingPanel';
import SourceSelector from './components/SourceSelector';
import RecordingsPanel from './components/RecordingsPanel';
import PreviewArea from './components/PreviewArea';

// Inner App component that has access to RecordingContext
const AppContent = () => {
  const { state, actions } = useRecording();
  const [activeTab, setActiveTab] = useState('record');
  const [selectedRecording, setSelectedRecording] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    videoQuality: '1080p',
    frameRate: '60',
    audioQuality: 'high',
    outputFormat: 'mp4',
    includeAudio: true,
    includeMicrophone: false,
    webcamEnabled: false,
    clickHighlights: false,
    autoZoom: false,
    outputPath: 'Desktop/Recordings'
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Hide loading screen when component mounts
  useEffect(() => {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }, []);

  useEffect(() => {
    // Set up keyboard shortcuts
    const handleKeyDown = (event) => {
      if (event.key === 'F9') {
        event.preventDefault();
        actions.handleStartShortcut();
      } else if (event.key === 'F10') {
        event.preventDefault();
        actions.handleStopShortcut();
      } else if (event.key === 'F11') {
        event.preventDefault();
        actions.handlePauseShortcut();
      }
    };

    // Set up Electron menu event listeners
    const setupElectronListeners = () => {
      if (window.electronAPI) {
        window.electronAPI.onNewRecording(() => {
          setActiveTab('record');
          actions.resetRecording();
        });

        window.electronAPI.onStartRecordingShortcut(() => {
          actions.handleStartShortcut();
        });

        window.electronAPI.onStopRecordingShortcut(() => {
          actions.handleStopShortcut();
        });

        window.electronAPI.onPauseRecordingShortcut(() => {
          actions.handlePauseShortcut();
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setupElectronListeners();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('new-recording');
        window.electronAPI.removeAllListeners('start-recording-shortcut');
        window.electronAPI.removeAllListeners('stop-recording-shortcut');
        window.electronAPI.removeAllListeners('pause-recording-shortcut');
      }
    };
  }, [actions]);

  const tabs = [
    { id: 'record', label: 'Record', icon: '🎥' },
    { id: 'library', label: 'Library', icon: '📚' }
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <Header 
        isRecording={state.isRecording}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'record' ? (
          <>
            {/* Left Sidebar - Sources & Recording */}
            <motion.div 
              className="w-72 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col overflow-hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-white text-lg font-semibold mb-2">Screen Source</h2>
                <SourceSelector 
                  selectedSource={state.selectedSource}
                  onSourceSelect={actions.selectSource}
                />
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <RecordingPanel 
                  isRecording={state.isRecording}
                  isPaused={state.isPaused}
                  recordingTime={state.recordingTime}
                  selectedSource={state.selectedSource}
                  onStartRecording={actions.startRecording}
                  onStopRecording={actions.stopRecording}
                  onPauseRecording={actions.pauseRecording}
                />
              </div>
            </motion.div>

            {/* Center Preview Area */}
            <motion.div 
              className="flex-1 p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <PreviewArea 
                selectedSource={state.selectedSource}
                isRecording={state.isRecording}
                isPaused={state.isPaused}
              />
            </motion.div>

            {/* Right Sidebar - Quick Settings */}
            <motion.div 
              className="w-72 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col overflow-hidden"
              initial={{ x: 288 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-white text-lg font-semibold">Quick Settings</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Audio Settings */}
                <div className="space-y-4">
                  <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2">🎵 Audio</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">System Audio</span>
                      <button
                        onClick={() => toggleSetting('includeAudio')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.includeAudio ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.includeAudio ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Microphone</span>
                      <button
                        onClick={() => toggleSetting('includeMicrophone')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.includeMicrophone ? 'bg-red-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.includeMicrophone ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Settings */}
                <div className="space-y-4">
                  <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2">📹 Video</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Webcam Overlay</span>
                      <button
                        onClick={() => toggleSetting('webcamEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.webcamEnabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.webcamEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Click Highlights</span>
                      <button
                        onClick={() => toggleSetting('clickHighlights')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.clickHighlights ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.clickHighlights ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Auto Zoom</span>
                      <button
                        onClick={() => toggleSetting('autoZoom')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.autoZoom ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoZoom ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quality Settings */}
                <div className="space-y-4">
                  <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2">📺 Quality</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/80 text-xs block mb-1">Resolution</label>
                      <select 
                        value={settings.videoQuality}
                        onChange={(e) => updateSetting('videoQuality', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p Full HD</option>
                        <option value="1440p">1440p 2K</option>
                        <option value="2160p">2160p 4K</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/80 text-xs block mb-1">Frame Rate</label>
                      <select 
                        value={settings.frameRate}
                        onChange={(e) => updateSetting('frameRate', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="30">30 FPS</option>
                        <option value="60">60 FPS</option>
                        <option value="120">120 FPS</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Output Settings */}
                <div className="space-y-4">
                  <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2">💾 Output</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/80 text-xs block mb-1">Format</label>
                      <select 
                        value={settings.outputFormat}
                        onChange={(e) => updateSetting('outputFormat', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="mp4">MP4</option>
                        <option value="mov">MOV</option>
                        <option value="avi">AVI</option>
                        <option value="webm">WebM</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/80 text-xs block mb-1">Save Location</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={settings.outputPath}
                          onChange={(e) => updateSetting('outputPath', e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
                        />
                        <button className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded-lg text-sm">
                          📁
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          // Three-panel layout for recordings
          <>
            {/* Left Panel - Recordings List */}
            <div className="w-72 bg-gray-800/50 border-r border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-white text-lg font-semibold">Recordings</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <RecordingsPanel 
                  selectedRecording={selectedRecording}
                  onRecordingSelect={setSelectedRecording}
                />
              </div>
            </div>

            {/* Center Panel - Video Player */}
            <div className="flex-1 flex flex-col bg-black/20">
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-white text-lg font-medium">
                  {selectedRecording ? selectedRecording.name : 'Select a recording to preview'}
                </h3>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-4">
                {selectedRecording ? (
                  <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                    <div className="text-white/60 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5v14l11-7z" fill="currentColor"/>
                        </svg>
                      </div>
                      <p>Video Player</p>
                      <p className="text-sm text-white/40">Coming Soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/40 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
                      </svg>
                    </div>
                    <p className="text-lg mb-2">No Recording Selected</p>
                    <p className="text-sm">Choose a recording from the left panel to preview and edit</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Editing Tools */}
            <div className="w-72 bg-gray-800/50 border-l border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-white text-lg font-semibold">Editing</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {selectedRecording ? (
                  <div className="space-y-6">
                    {/* Smart Export */}
                    <div>
                      <h3 className="text-white text-sm font-medium mb-3">Smart Export</h3>
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white text-sm font-medium transition-all">
                          Export for Social Media
                        </button>
                        <button className="w-full p-2 bg-gray-600/30 hover:bg-gray-600/40 border border-gray-500/30 rounded-lg text-white text-sm transition-colors">
                          Custom Export
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-white/40">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                      </svg>
                    </div>
                    <p className="text-sm">Select a recording to access editing tools</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <motion.div 
        className="h-8 bg-black/20 backdrop-blur-sm border-t border-white/10 flex items-center justify-between px-4 text-xs text-white/70"
        initial={{ y: 32 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <span>
            {state.isRecording 
              ? (state.isPaused ? 'Paused' : 'Recording') 
              : 'Ready'
            }
          </span>
          {state.selectedSource && (
            <span>Source: {state.selectedSource.name}</span>
          )}
          {activeTab === 'library' && state.recordings.length > 0 && (
            <span>{state.recordings.length} recording{state.recordings.length === 1 ? '' : 's'}</span>
          )}
          <span>Quality: {settings.videoQuality} • {settings.frameRate} FPS • {settings.outputFormat.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>F9: Start</span>
          <span>F10: Stop</span>
          <span>F11: Pause</span>
          <span>Ctrl+O: Open Folder</span>
        </div>
      </motion.div>
    </div>
  );
};

// Main App component with RecordingProvider wrapper
function App() {
  return (
    <RecordingProvider>
      <AppContent />
    </RecordingProvider>
  );
}

export default App; 