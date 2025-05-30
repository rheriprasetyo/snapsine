import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Pause, 
  Settings, 
  Camera, 
  Monitor, 
  Mic, 
  MicOff,
  Video,
  VideoOff,
  Zap,
  Download,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import useSnapsineStore from '../utils/store.js';
import ScreenRecorder from '../recorder/ScreenRecorder.js';
import EffectsProcessor from '../effects/EffectsProcessor.js';
import toast, { Toaster } from 'react-hot-toast';

const SnapsineMain = () => {
  const store = useSnapsineStore();
  const recorderRef = useRef(null);
  const effectsRef = useRef(null);
  const previewRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize components
  useEffect(() => {
    const initialize = async () => {
      try {
        recorderRef.current = new ScreenRecorder();
        effectsRef.current = new EffectsProcessor();
        
        const recorderInit = await recorderRef.current.initialize();
        if (recorderInit) {
          setIsInitialized(true);
          toast.success('🎬 Snapsine ready to record!');
        }
      } catch (error) {
        console.error('Failed to initialize Snapsine:', error);
        toast.error('Failed to initialize recording system');
      }
    };

    initialize();

    return () => {
      if (recorderRef.current) {
        recorderRef.current.cleanup();
      }
      if (effectsRef.current) {
        effectsRef.current.cleanup();
      }
      store.cleanup();
    };
  }, []);

  const handleStartRecording = async () => {
    if (!recorderRef.current || !isInitialized) {
      toast.error('Recorder not initialized');
      return;
    }

    try {
      const success = await recorderRef.current.startRecording();
      if (success) {
        toast.success('🎬 Recording started!');
      }
    } catch (error) {
      toast.error(`Failed to start recording: ${error.message}`);
    }
  };

  const handleStopRecording = async () => {
    if (recorderRef.current) {
      await recorderRef.current.stopRecording();
      toast.success('⏹️ Recording stopped!');
    }
  };

  const handlePauseRecording = () => {
    if (recorderRef.current) {
      if (store.isPaused) {
        recorderRef.current.resumeRecording();
        toast.success('▶️ Recording resumed');
      } else {
        recorderRef.current.pauseRecording();
        toast.success('⏸️ Recording paused');
      }
    }
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#374151',
            color: '#fff',
          },
        }}
      />

      {/* Header */}
      <motion.header 
        className="p-6 border-b border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Sparkles size={24} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Snapsine
              </h1>
              <p className="text-sm text-gray-400">Turn your screen into cinema</p>
            </div>
          </div>
          
          <motion.button
            onClick={() => store.setShowSettings(!store.showSettings)}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Recording Controls */}
        <motion.div 
          className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!store.isRecording ? (
            <motion.button
              onClick={handleStartRecording}
              disabled={!isInitialized}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={20} />
              Start Recording
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handlePauseRecording}
                className="flex items-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {store.isPaused ? <Play size={18} /> : <Pause size={18} />}
                {store.isPaused ? 'Resume' : 'Pause'}
              </motion.button>

              <motion.button
                onClick={handleStopRecording}
                className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Square size={18} />
                Stop
              </motion.button>
            </div>
          )}

          {store.isRecording && (
            <motion.div 
              className="flex items-center gap-3 ml-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-mono text-lg">
                  {formatDuration(store.recordingDuration)}
                </span>
              </div>
              {store.isPaused && (
                <span className="text-yellow-400 text-sm">PAUSED</span>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Quick Settings */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            onClick={() => store.updateRecordingConfig({ webcamEnabled: !store.recordingConfig.webcamEnabled })}
            className={`p-4 rounded-lg transition-colors ${
              store.recordingConfig.webcamEnabled 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera size={24} className="mx-auto mb-2" />
            <p className="text-sm">Webcam</p>
          </motion.button>

          <motion.button
            onClick={() => store.updateEffectsConfig({ autoZoom: !store.effectsConfig.autoZoom })}
            className={`p-4 rounded-lg transition-colors ${
              store.effectsConfig.autoZoom 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap size={24} className="mx-auto mb-2" />
            <p className="text-sm">Auto Zoom</p>
          </motion.button>

          <motion.button
            onClick={() => store.setShowPreview(!store.showPreview)}
            className={`p-4 rounded-lg transition-colors ${
              store.showPreview 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {store.showPreview ? <Eye size={24} /> : <EyeOff size={24} />}
            <p className="text-sm">Preview</p>
          </motion.button>

          <motion.button
            onClick={() => store.setShowSettings(!store.showSettings)}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings size={24} className="mx-auto mb-2" />
            <p className="text-sm">Settings</p>
          </motion.button>
        </motion.div>

        {/* System Audio Info Banner */}
        {store.recordingConfig.audioSource.includes('system') && (
          <motion.div 
            className="p-4 bg-yellow-900/30 border border-yellow-600/30 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                <span className="text-xs font-bold text-black">!</span>
              </div>
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">System Audio Capture</p>
                <p className="text-yellow-300/80">
                  System audio capture requires additional permissions. If it fails, recording will continue with microphone audio only. 
                  For reliable system audio, consider using the desktop version of Snapsine.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview */}
        {store.showPreview && (
          <motion.div 
            className="p-6 bg-gray-800 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Eye size={20} />
              Live Preview
            </h3>

            <motion.div 
              className="aspect-video bg-gray-900 rounded-lg border-2 border-gray-600 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <canvas
                ref={previewRef}
                className="w-full h-full rounded-lg"
                style={{ display: store.isRecording ? 'block' : 'none' }}
              />
              {!store.isRecording && (
                <div className="text-center text-gray-400">
                  <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Preview will appear when recording starts</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Status Bar */}
        <motion.div 
          className="p-4 bg-gray-800 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span className={`flex items-center gap-2 ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {isInitialized ? 'Ready' : 'Initializing...'}
              </span>
              <span className="flex items-center gap-2">
                <Monitor size={16} />
                {store.recordingConfig.quality}
              </span>
              <span className="flex items-center gap-2">
                {store.recordingConfig.audioSource.includes('mic') ? <Mic size={16} /> : <MicOff size={16} />}
                {store.recordingConfig.audioSource}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>Effects: {Object.values(store.effectsConfig).filter(Boolean).length} active</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SnapsineMain; 