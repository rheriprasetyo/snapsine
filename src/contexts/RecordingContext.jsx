import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const RecordingContext = createContext();

const initialState = {
  isRecording: false,
  isPaused: false,
  recordingTime: 0,
  selectedSource: null,
  sources: [],
  recordings: [],
  currentRecordingInfo: null,
  settings: {
    videoQuality: '1080p',
    frameRate: 60,
    includeAudio: true,
    includeMicrophone: false,
    webcamEnabled: false,
    clickHighlights: true,
    autoZoom: false,
    outputFormat: 'webm'
  }
};

function recordingReducer(state, action) {
  switch (action.type) {
    case 'START_RECORDING':
      return { ...state, isRecording: true, isPaused: false, currentRecordingInfo: action.payload };
    case 'STOP_RECORDING':
      return { ...state, isRecording: false, isPaused: false, recordingTime: 0, currentRecordingInfo: null };
    case 'PAUSE_RECORDING':
      return { ...state, isPaused: !state.isPaused };
    case 'UPDATE_TIME':
      return { ...state, recordingTime: action.payload };
    case 'SELECT_SOURCE':
      return { ...state, selectedSource: action.payload };
    case 'SET_SOURCES':
      return { ...state, sources: action.payload };
    case 'SET_RECORDINGS':
      return { ...state, recordings: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESET_RECORDING':
      return { ...state, isRecording: false, isPaused: false, recordingTime: 0, selectedSource: null, currentRecordingInfo: null };
    default:
      return state;
  }
}

export const RecordingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recordingReducer, initialState);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Recording timer effect
  useEffect(() => {
    if (state.isRecording && !state.isPaused) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME', payload: state.recordingTime + 1 });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRecording, state.isPaused, state.recordingTime]);

  // Load recordings on mount
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getRecordings().then(recordings => {
        dispatch({ type: 'SET_RECORDINGS', payload: recordings });
      });
    }
  }, []);

  const actions = {
    startRecording: async () => {
      if (!state.selectedSource) {
        throw new Error('No source selected');
      }
      
      console.log('Starting recording with source:', state.selectedSource.name);
      console.log('Selected source ID:', state.selectedSource.id);
      
      try {
        // Get the source details from Electron
        const source = await window.electronAPI.getSourceById(state.selectedSource.id);
        console.log('Got source details:', {
          id: source.id,
          name: source.name,
          display_id: source.display_id
        });

        // Verify source ID matches
        if (source.id !== state.selectedSource.id) {
          console.warn('⚠️ Source ID mismatch:', {
            selected: state.selectedSource.id,
            retrieved: source.id
          });
        }

        // Verify it's not the Snapsine window
        if (source.name.includes('Snapsine')) {
          throw new Error('Cannot record the Snapsine window itself');
        }

        // Use getUserMedia with the source ID
        console.log('Getting screen capture stream using getUserMedia with source ID:', source.id);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080,
              maxFrameRate: 30
            }
          }
        });

        // Log video track details
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
          throw new Error('No video track available in the stream');
        }

        console.log('✅ Stream obtained successfully');
        console.log('Video track settings:', {
          ...videoTrack.getSettings(),
          label: videoTrack.label,
          enabled: videoTrack.enabled,
          muted: videoTrack.muted,
          readyState: videoTrack.readyState
        });
        
        streamRef.current = stream;
        recordedChunksRef.current = [];

        // Start actual recording through Electron first
        let recordingInfo = null;
        if (window.electronAPI) {
          const result = await window.electronAPI.startRecording({
            sourceId: source.id,
            settings: state.settings
          });
          recordingInfo = result;
          console.log('Electron recording started:', recordingInfo);
        }

        // Set up MediaRecorder with debugging
        let supportedMimeTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8', 
          'video/webm',
          'video/mp4'
        ];

        let selectedMimeType = 'video/webm';
        
        for (let mimeType of supportedMimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            console.log('✅ Using MIME type:', mimeType);
            break;
          }
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });
        
        mediaRecorderRef.current = mediaRecorder;

        // Handle data available with enhanced debugging
        mediaRecorder.ondataavailable = (event) => {
          console.log('Data available:', event.data.size, 'bytes, type:', event.data.type);
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
            console.log('Total chunks so far:', recordedChunksRef.current.length);
            console.log('Total size so far:', recordedChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0), 'bytes');
          }
        };

        // Handle recording stop with enhanced error handling and debugging
        mediaRecorder.onstop = async () => {
          console.log('MediaRecorder stopped, total chunks:', recordedChunksRef.current.length);
          
          // Calculate total size
          const totalSize = recordedChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
          console.log('Total recorded data size:', totalSize, 'bytes');
          
          if (recordedChunksRef.current.length === 0) {
            console.error('No chunks recorded');
            alert('❌ Recording failed: No data was captured. This might be due to:\n• Permission denied\n• Protected content\n• Browser limitations\n• Source became unavailable');
            return;
          }

          try {
            const blob = new Blob(recordedChunksRef.current, {
              type: selectedMimeType
            });

            console.log('Created blob with size:', blob.size, 'bytes, type:', blob.type);

            if (blob.size === 0) {
              console.error('Recording blob is empty - no data was recorded');
              alert('❌ Recording failed: No data was captured. Please try again and make sure:\n• You grant screen recording permission\n• The selected window/screen is not protected\n• You don\'t close the sharing dialog too quickly');
              return;
            }

            // Convert blob to array buffer with better error handling
            console.log('Converting blob to array buffer...');
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            console.log('Converted to Uint8Array, size:', uint8Array.length, 'bytes');

            // Save video data with enhanced error handling
            if (window.electronAPI && recordingInfo) {
              console.log('Saving video data for:', recordingInfo.filename);
              
              // Add a small delay to ensure everything is ready
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const result = await window.electronAPI.saveVideoData({
                videoBlob: Array.from(uint8Array),
                filename: recordingInfo.filename
              });
              
              if (result.success) {
                console.log('✅ Video saved successfully to:', result.filePath);
                
                // Show success message
                alert('✅ Recording saved successfully!\n\nFile: ' + recordingInfo.filename + '\nSize: ' + (blob.size / 1024 / 1024).toFixed(2) + ' MB');
                
                // Force refresh recordings list with retry logic
                console.log('Refreshing recordings list...');
                let retryCount = 0;
                let recordings = [];
                
                while (retryCount < 3) {
                  try {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait before refresh
                    recordings = await window.electronAPI.getRecordings();
                    
                    if (recordings.some(r => r.filename === recordingInfo.filename)) {
                      console.log('✅ Recording found in list, refresh successful');
                      break;
                    } else {
                      console.log('⚠️ Recording not yet in list, retrying...');
                      retryCount++;
                    }
                  } catch (error) {
                    console.error('Error refreshing recordings:', error);
                    retryCount++;
                  }
                }
                
                dispatch({ type: 'SET_RECORDINGS', payload: recordings });
                console.log('Recordings list updated, count:', recordings.length);
                
                // Auto-switch to recordings tab if not there already
                // This would need to be handled by the parent component
                
              } else {
                console.error('❌ Failed to save video:', result.error);
                alert('❌ Failed to save recording: ' + result.error);
              }
            } else {
              console.error('❌ Missing electronAPI or recordingInfo');
              alert('❌ Failed to save recording: Missing required components');
            }
          } catch (error) {
            console.error('❌ Failed to process recording:', error);
            alert('❌ Failed to save recording: ' + error.message + '\n\nThis could be due to:\n• Insufficient disk space\n• File permission issues\n• Large file size limitations');
          }
        };

        // Handle recording errors
        mediaRecorder.onerror = (event) => {
          console.error('❌ MediaRecorder error:', event.error);
          alert('❌ Recording error: ' + event.error + '\n\nTry:\n• Selecting a different source\n• Restarting the application\n• Checking available disk space');
        };

        // Handle stream ending (user stops sharing)
        stream.getVideoTracks()[0].onended = () => {
          console.log('Screen sharing stopped by user');
          if (state.isRecording) {
            console.log('Auto-stopping recording due to screen sharing end');
            actions.stopRecording();
          }
        };

        // Start recording
        console.log('Starting MediaRecorder with options:', {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 2500000
        });
        mediaRecorder.start(1000); // Record in 1-second chunks for better reliability
        
        dispatch({ type: 'START_RECORDING', payload: recordingInfo });
        console.log('✅ Recording started successfully');
        
      } catch (error) {
        console.error('❌ Failed to start recording:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.name === 'NotAllowedError') {
          errorMessage = '🚫 Screen recording permission denied!\n\nSolutions:\n• Click "Share Screen" when the browser asks\n• Check Windows Privacy Settings → Camera/Microphone\n• Try running as administrator\n• Restart the application';
        } else if (error.name === 'NotFoundError') {
          errorMessage = '❌ Screen source not found!\n\nSolutions:\n• Refresh the sources list\n• Select a different screen/window\n• Make sure the window is still open';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = '❌ Screen recording not supported in this environment.';
        } else if (error.name === 'AbortError') {
          errorMessage = '❌ Recording was aborted by user or system. Please try again.';
        } else if (error.message.includes('Source is not capturable')) {
          errorMessage = '❌ Selected source cannot be captured!\n\nSolutions:\n• Try selecting "Entire Screen" instead of a specific window\n• Make sure the window is not minimized\n• Some protected content cannot be recorded';
        }
        
        alert('❌ Failed to start recording: ' + errorMessage);
        throw new Error(errorMessage);
      }
    },

    stopRecording: async () => {
      console.log('Stopping recording...');
      
      try {
        // Stop MediaRecorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }

        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Stop actual recording through Electron
        if (window.electronAPI) {
          await window.electronAPI.stopRecording();
        }
        
        dispatch({ type: 'STOP_RECORDING' });
        console.log('Recording stopped successfully');
        
      } catch (error) {
        console.error('Failed to stop recording:', error);
        throw error;
      }
    },

    pauseRecording: () => {
      if (state.isRecording) {
        const newPausedState = !state.isPaused;
        
        // Pause/Resume MediaRecorder
        if (mediaRecorderRef.current) {
          if (newPausedState) {
            mediaRecorderRef.current.pause();
          } else {
            mediaRecorderRef.current.resume();
          }
        }
        
        dispatch({ type: 'PAUSE_RECORDING' });
        console.log(newPausedState ? 'Recording paused' : 'Recording resumed');
      }
    },

    resetRecording: () => {
      console.log('Resetting recording state');
      
      // Stop any active recording
      if (state.isRecording) {
        actions.stopRecording();
      }
      
      dispatch({ type: 'RESET_RECORDING' });
    },

    // Recording management
    loadRecordings: async () => {
      if (window.electronAPI) {
        const recordings = await window.electronAPI.getRecordings();
        dispatch({ type: 'SET_RECORDINGS', payload: recordings });
      }
    },

    openRecordingsFolder: async () => {
      if (window.electronAPI) {
        await window.electronAPI.openRecordingsFolder();
      }
    },

    openRecording: async (filePath) => {
      if (window.electronAPI) {
        await window.electronAPI.openRecordingFile(filePath);
      }
    },

    deleteRecording: async (filePath) => {
      if (window.electronAPI) {
        await window.electronAPI.deleteRecording(filePath);
        // Refresh list
        await actions.loadRecordings();
      }
    },

    updateTime: (time) => {
      dispatch({ type: 'UPDATE_TIME', payload: time });
    },

    selectSource: (source) => {
      console.log('Source selected:', source.name);
      dispatch({ type: 'SELECT_SOURCE', payload: source });
    },

    setSources: (sources) => {
      dispatch({ type: 'SET_SOURCES', payload: sources });
    },

    updateSettings: (settings) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    },

    // Convenience methods for menu shortcuts
    handleStartShortcut: async () => {
      if (!state.isRecording) {
        try {
          await actions.startRecording();
        } catch (error) {
          console.error('Failed to start recording from shortcut:', error);
          // Could show a notification here
        }
      }
    },

    handleStopShortcut: async () => {
      if (state.isRecording) {
        try {
          await actions.stopRecording();
        } catch (error) {
          console.error('Failed to stop recording from shortcut:', error);
        }
      }
    },

    handlePauseShortcut: () => {
      if (state.isRecording) {
        actions.pauseRecording();
      }
    }
  };

  return (
    <RecordingContext.Provider value={{ state, actions }}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }
  return context;
}; 