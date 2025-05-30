import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RecordingPanel = ({ 
  isRecording, 
  isPaused, 
  recordingTime, 
  selectedSource, 
  onStartRecording, 
  onStopRecording, 
  onPauseRecording 
}) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartRecording = async () => {
    if (!selectedSource) {
      alert('Please select a source to record');
      return;
    }

    setIsStarting(true);
    try {
      await onStartRecording();
    } catch (error) {
      alert('Failed to start recording: ' + error.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      await onStopRecording();
    } catch (error) {
      // Handle error silently or with user-friendly message
    }
  };

  const handlePauseRecording = () => {
    onPauseRecording();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Recording Timer */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
            style={{ textAlign: 'center' }}
          >
            <div className="text-4xl font-mono text-white font-bold mb-2" style={{
              fontSize: '36px',
              fontFamily: 'monospace',
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {formatTime(recordingTime)}
            </div>
            <div className={`text-sm ${isPaused ? 'text-yellow-400' : 'text-red-400'}`} style={{
              fontSize: '14px',
              color: isPaused ? '#facc15' : '#f87171'
            }}>
              {isPaused ? 'Paused' : 'Recording'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Recording Controls */}
      <div className="flex justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
        {isRecording ? (
          <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              onClick={handlePauseRecording}
              className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 rounded-lg font-medium"
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(217, 119, 6, 0.2)',
                color: '#facc15',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⏸️ {isPaused ? 'Resume' : 'Pause'}
            </motion.button>
            <motion.button
              onClick={handleStopRecording}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg font-medium"
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⏹️ Stop
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={handleStartRecording}
            disabled={!selectedSource || isStarting}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              !selectedSource || isStarting
                ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30'
            }`}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: (!selectedSource || isStarting) ? 'not-allowed' : 'pointer',
              backgroundColor: (!selectedSource || isStarting) 
                ? 'rgba(75, 85, 99, 0.2)' 
                : 'rgba(168, 85, 247, 0.2)',
              color: (!selectedSource || isStarting) 
                ? '#9ca3af' 
                : '#c084fc',
              border: (!selectedSource || isStarting) 
                ? '1px solid rgba(75, 85, 99, 0.3)' 
                : '1px solid rgba(168, 85, 247, 0.3)'
            }}
            whileHover={selectedSource && !isStarting ? { scale: 1.05 } : {}}
            whileTap={selectedSource && !isStarting ? { scale: 0.95 } : {}}
          >
            <AnimatePresence mode="wait">
              {isStarting ? (
                <motion.div
                  key="starting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Starting...
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  ▶️ Start Recording
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      {/* Status */}
      {!selectedSource && (
        <div className="text-center py-4" style={{ textAlign: 'center', padding: '16px 0' }}>
          <p className="text-white/50 text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
            Select a source to start recording
          </p>
        </div>
      )}
    </div>
  );
};

export default RecordingPanel; 