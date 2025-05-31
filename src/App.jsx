import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordingProvider, useRecording } from './contexts/RecordingContext';
import Header from './components/Header';
import RecordingPanel from './components/RecordingPanel';
import SourceSelector from './components/SourceSelector';
import RecordingsPanel from './components/RecordingsPanel';
import PreviewArea from './components/PreviewArea';
import VideoPlayer from './components/VideoPlayer';

// Inner App component that has access to RecordingContext
const AppContent = () => {
  const { state, actions } = useRecording();
  const [activeTab, setActiveTab] = useState('record');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [backgroundType, setBackgroundType] = useState('color');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundGradient, setBackgroundGradient] = useState('linear-gradient(45deg, #1a1a1a, #4a4a4a)');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [padding, setPadding] = useState(32);
  const [folderImages, setFolderImages] = useState([]);
  
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

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const DEFAULT_BG_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'; // Replace with your preferred default image URL

  const PUBLIC_BG_IMAGES = [
    '/backgrounds/wallpaper'
  ];

  // Wallpaper filenames (add your actual filenames here)
  const WALLPAPER_IMAGES = [
    '/backgrounds/wallpapers/wallpaper1.png',
    '/backgrounds/wallpapers/wallpaper2.png',
    '/backgrounds/wallpapers/wallpaper3.png',
    '/backgrounds/wallpapers/wallpaper4.png',

  ];

  const [backgroundTab, setBackgroundTab] = useState('wallpaper');

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

  useEffect(() => {
    if (window.electronAPI?.getBackgroundImages) {
      window.electronAPI.getBackgroundImages().then(setFolderImages);
    }
  }, []);

  // Playback control handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const seekBar = e.target;
    const rect = seekBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const seekTime = percent * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'record', label: 'Record', icon: '🎥' },
    { id: 'library', label: 'Library', icon: '📚' }
  ];

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header with tab navigation */}
      <Header
        isRecording={state.isRecording}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* Main content area: conditional on activeTab */}
      {activeTab === 'record' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Sources & Recording */}
          <div className="w-72 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col overflow-hidden">
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
          </div>
          {/* Center Preview Area */}
          <div className="flex-1 p-6">
            <PreviewArea
              selectedSource={state.selectedSource}
              isRecording={state.isRecording}
              isPaused={state.isPaused}
            />
          </div>
          {/* Right Sidebar - Quick Settings (optional, can be left empty or used for future settings) */}
          <div className="w-72 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-white text-lg font-semibold">Quick Settings</h2>
            </div>
            {/* Add quick settings here if needed */}
          </div>
        </div>
      ) : (
        // Library tab (existing new layout)
        <>
          <div className="flex-1 grid grid-cols-[260px_1fr_320px] grid-rows-1 h-full">
            {/* Left: Recordings List */}
            <div className="bg-gray-900/90 border-r border-white/10 overflow-y-auto">
              <RecordingsPanel
                selectedRecording={selectedRecording}
                onRecordingSelect={setSelectedRecording}
              />
            </div>
            {/* Center: Video Area with background and padding */}
            <div className="relative flex flex-col items-center justify-center bg-black/80">
              <div className="flex items-center justify-center w-full h-full">
                {selectedRecording ? (
                  <div
                    style={{
                      maxWidth: '80vw',
                      maxHeight: '60vh',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: `${padding}px`,
                      background: backgroundType === 'color'
                        ? backgroundColor
                        : backgroundType === 'gradient'
                        ? backgroundGradient
                        : undefined,
                      backgroundImage: (backgroundType === 'image' || backgroundType === 'wallpaper') && backgroundImage ? `url(${backgroundImage})` : undefined,
                      backgroundSize: 'cover',
                      backgroundRepeat: (backgroundType === 'image' || backgroundType === 'wallpaper') ? 'no-repeat' : undefined,
                      backgroundPosition: 'center',
                      opacity: backgroundOpacity,
                      filter: `blur(${backgroundBlur}px)`
                    }}
                  >
                    <VideoPlayer
                      ref={videoRef}
                      recording={selectedRecording}
                      onLoadedMetadata={handleLoadedMetadata}
                      onTimeUpdate={handleTimeUpdate}
                    />
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
                {/* Credit text for default image */}
                {backgroundType === 'image' && !backgroundImage && (
                  <div style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 24,
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}>
                    Image by <a href="https://raycast.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>raycast.com</a>
                  </div>
                )}
              </div>
            </div>
            {/* Right: Background Controls Sidebar */}
            <div className="bg-black/90 border-l border-white/10 p-6 flex flex-col gap-6">
              <div>
                <label className="text-white text-sm block mb-2">Background</label>
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium ${backgroundTab === 'wallpaper' ? 'bg-purple-700 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    onClick={() => setBackgroundTab('wallpaper')}
                  >
                    Wallpaper
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium ${backgroundTab === 'gradient' ? 'bg-purple-700 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    onClick={() => setBackgroundTab('gradient')}
                  >
                    Gradient
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium ${backgroundTab === 'color' ? 'bg-purple-700 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    onClick={() => setBackgroundTab('color')}
                  >
                    Color
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium ${backgroundTab === 'image' ? 'bg-purple-700 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    onClick={() => setBackgroundTab('image')}
                  >
                    Image
                  </button>
                </div>
                {/* Wallpaper Tab */}
                {backgroundTab === 'wallpaper' && (
                  <div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 32px)',
                      gap: '12px',
                      marginBottom: '12px',
                    }}>
                      {WALLPAPER_IMAGES.map((img, idx) => (
                        <img
                          key={img}
                          src={img}
                          alt={`Wallpaper ${idx + 1}`}
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: 'cover',
                            borderRadius: 6,
                            border: backgroundImage === img ? '2px solid #a855f7' : '2px solid transparent',
                            cursor: 'pointer',
                            boxShadow: backgroundImage === img ? '0 0 0 2px #a855f7' : undefined,
                            transition: 'border 0.2s, box-shadow 0.2s',
                          }}
                          onClick={() => {
                            setBackgroundImage(img);
                            setBackgroundType('wallpaper');
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>
                      Background gradients were created by <a href="https://raycast.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>raycast.com</a>
                    </div>
                  </div>
                )}
                {/* Gradient Tab */}
                {backgroundTab === 'gradient' && (
                  <div>
                    <label className="text-white text-sm block mb-2">Gradient</label>
                    <input
                      type="text"
                      value={backgroundGradient}
                      onChange={e => setBackgroundGradient(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                )}
                {/* Color Tab */}
                {backgroundTab === 'color' && (
                  <div>
                    <label className="text-white text-sm block mb-2">Color</label>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={e => setBackgroundColor(e.target.value)}
                      className="w-full h-8"
                    />
                  </div>
                )}
                {/* Image Tab */}
                {backgroundTab === 'image' && (
                  <div>
                    <label className="text-white text-sm block mb-2">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = e => setBackgroundImage(e.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-white text-sm"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-white text-sm block mb-2">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={backgroundOpacity}
                  onChange={e => setBackgroundOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">Blur</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={backgroundBlur}
                  onChange={e => setBackgroundBlur(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">Padding</label>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="4"
                  value={padding}
                  onChange={e => setPadding(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          {/* Bottom: Playback Controls Bar */}
          <div className="h-20 bg-black/90 border-t border-white/10 flex items-center justify-center px-8">
            {selectedRecording && (
              <div className="w-full max-w-3xl flex items-center gap-6">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Play/Pause"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                {/* Time Display */}
                <div className="text-white text-sm w-20 text-right">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                {/* Progress Bar */}
                <div
                  className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-blue-500 rounded-full absolute top-0 left-0"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors"
                    title="Mute/Unmute"
                  >
                    {isMuted ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24"
                    title="Volume"
                  />
                </div>
                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M15 9h4.5M15 9v-4.5M9 15v4.5M9 15H4.5M15 15h4.5M15 15v4.5" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
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