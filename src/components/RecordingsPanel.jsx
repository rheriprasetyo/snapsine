import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRecording } from '../contexts/RecordingContext';

const RecordingsPanel = ({ selectedRecording, onRecordingSelect }) => {
  const { state, actions } = useRecording();

  useEffect(() => {
    // Load recordings when component mounts
    console.log('RecordingsPanel: Component mounted, loading recordings...');
    const loadInitialRecordings = async () => {
      try {
        await actions.loadRecordings();
        console.log('RecordingsPanel: Initial recordings loaded, count:', state.recordings.length);
      } catch (error) {
        console.error('RecordingsPanel: Failed to load initial recordings:', error);
      }
    };
    
    loadInitialRecordings();
    
    // Set up an interval to check for new recordings periodically
    const intervalId = setInterval(async () => {
      try {
        await actions.loadRecordings();
      } catch (error) {
        console.error('RecordingsPanel: Failed to refresh recordings automatically:', error);
      }
    }, 5000); // Refresh every 5 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [actions]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleRefresh = async () => {
    console.log('RecordingsPanel: Manual refresh requested');
    try {
      // Show loading state
      const refreshButton = document.querySelector('[data-refresh-button]');
      if (refreshButton) {
        refreshButton.textContent = '🔄 Refreshing...';
        refreshButton.disabled = true;
      }
      
      // Force refresh with retry logic
      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`RecordingsPanel: Refresh attempt ${attempt}/3`);
          await actions.loadRecordings();
          success = true;
          break;
        } catch (error) {
          console.error(`RecordingsPanel: Refresh attempt ${attempt} failed:`, error);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }
      }
      
      if (success) {
        console.log('RecordingsPanel: Recordings refreshed successfully, count:', state.recordings.length);
        
        // Check if recordings directory exists and show debug info
        if (window.electronAPI) {
          try {
            const recordings = await window.electronAPI.getRecordings();
            console.log('RecordingsPanel: Direct API call returned:', recordings.length, 'recordings');
          } catch (error) {
            console.error('RecordingsPanel: Direct API call failed:', error);
          }
        }
        
        alert(`✅ Refreshed! Found ${state.recordings.length} recording(s)\n\nIf you just created a recording and don't see it, try:\n• Wait a few seconds and refresh again\n• Check the recordings folder manually\n• Restart the application`);
      } else {
        alert('❌ Failed to refresh recordings after 3 attempts. Please check:\n• File permissions\n• Disk space\n• Restart the application');
      }
      
      // Restore button state
      if (refreshButton) {
        refreshButton.textContent = '🔄 Refresh';
        refreshButton.disabled = false;
      }
      
    } catch (error) {
      console.error('RecordingsPanel: Failed to refresh recordings:', error);
      alert('❌ Failed to refresh recordings: ' + error.message);
    }
  };

  const checkDirectory = async () => {
    console.log('RecordingsPanel: Checking recordings directory...');
    try {
      if (window.electronAPI) {
        await window.electronAPI.openRecordingsFolder();
      }
    } catch (error) {
      console.error('Failed to open recordings folder:', error);
      alert('Failed to open recordings folder: ' + error.message);
    }
  };

  // Debug info
  useEffect(() => {
    console.log('RecordingsPanel: State updated, recordings count:', state.recordings.length);
    console.log('RecordingsPanel: Current recordings:', state.recordings);
  }, [state.recordings]);

  return (
    <div className="p-4 space-y-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="text-white text-lg font-semibold" style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
          Recent Recordings
        </h2>
        <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            onClick={handleRefresh}
            data-refresh-button
            className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded text-sm"
            style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Refresh
          </motion.button>
          <motion.button
            onClick={checkDirectory}
            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded text-sm"
            style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              color: '#60a5fa',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📁 Open Folder
          </motion.button>
        </div>
      </div>

      {/* Recordings List */}
      <div className="space-y-3 max-h-96 overflow-y-auto" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        maxHeight: '384px', 
        overflowY: 'auto' 
      }}>
        {state.recordings.length === 0 ? (
          <div className="text-center py-8" style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="text-6xl mb-4" style={{ fontSize: '60px', marginBottom: '16px' }}>🎬</div>
            <p className="text-white/60 text-lg mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '18px', marginBottom: '8px' }}>
              No recordings yet
            </p>
            <p className="text-white/40 text-sm" style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
              Start recording to see your videos here
            </p>
          </div>
        ) : (
          state.recordings.map((recording, index) => (
            <motion.div
              key={recording.filePath}
              className={`bg-white/5 border rounded-lg p-3 cursor-pointer transition-all ${
                selectedRecording?.filePath === recording.filePath 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
              style={{
                backgroundColor: selectedRecording?.filePath === recording.filePath 
                  ? 'rgba(168, 85, 247, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${
                  selectedRecording?.filePath === recording.filePath 
                    ? 'rgb(168, 85, 247)' 
                    : 'rgba(255, 255, 255, 0.1)'
                }`,
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onRecordingSelect(recording)}
            >
              <div className="flex items-start justify-between" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="text-white font-medium text-sm truncate" style={{
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {recording.filename}
                  </h3>
                  <div className="space-y-1 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                    <div className="flex items-center gap-2 text-xs text-white/60" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      <span>📅 {formatDate(recording.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/60" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {recording.duration && (
                        <span>⏱️ {formatDuration(recording.duration)}</span>
                      )}
                      {recording.fileSize && (
                        <span>💾 {formatFileSize(recording.fileSize)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent recording selection
                      actions.openRecording(recording.filePath);
                    }}
                    className="p-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded"
                    style={{
                      padding: '4px',
                      backgroundColor: 'rgba(22, 163, 74, 0.2)',
                      color: '#4ade80',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Open video"
                  >
                    ▶️
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent recording selection
                      actions.deleteRecording(recording.filePath);
                    }}
                    className="p-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded"
                    style={{
                      padding: '4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete recording"
                  >
                    🗑️
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-white/50 text-center pt-2 border-t border-white/10" style={{
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {state.recordings.length > 0 ? (
          `${state.recordings.length} recording${state.recordings.length === 1 ? '' : 's'} available`
        ) : (
          'Videos are saved as WebM files'
        )}
      </div>
    </div>
  );
};

export default RecordingsPanel; 