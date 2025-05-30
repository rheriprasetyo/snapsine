import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useSnapsineStore = create(
  devtools(
    (set, get) => ({
      // Recording State
      isRecording: false,
      isPaused: false,
      recordingDuration: 0,
      recordingStartTime: null,
      
      // Recording Configuration
      recordingConfig: {
        screenSource: 'fullscreen', // 'fullscreen', 'window', 'region'
        audioSource: 'system+mic', // 'none', 'system', 'mic', 'system+mic'
        quality: '1080p', // '720p', '1080p', '4k'
        framerate: 60,
        includeCursor: true,
        includeClicks: true,
        webcamEnabled: false,
        webcamPosition: 'bottom-right',
        webcamSize: 'medium'
      },

      // Effects Configuration
      effectsConfig: {
        autoZoom: false,
        followCursor: false,
        clickHighlights: true,
        smoothMotion: true,
        transitionEffects: true,
        blurSensitive: false
      },

      // Export Configuration
      exportConfig: {
        format: 'mp4', // 'mp4', 'webm', 'mov'
        quality: 'high', // 'low', 'medium', 'high', 'lossless'
        preset: 'youtube', // 'youtube', 'shorts', 'reels', 'custom'
        resolution: 'original',
        compression: 'balanced'
      },

      // UI State
      activeTab: 'record', // 'record', 'effects', 'export'
      showPreview: true,
      showSettings: false,
      notifications: [],

      // Media Streams
      screenStream: null,
      audioStream: null,
      webcamStream: null,
      mediaRecorder: null,
      recordedChunks: [],

      // Actions
      startRecording: () => {
        set({
          isRecording: true,
          recordingStartTime: Date.now(),
          recordedChunks: []
        });
      },

      stopRecording: () => {
        const state = get();
        if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
          state.mediaRecorder.stop();
        }
        set({
          isRecording: false,
          isPaused: false,
          recordingDuration: 0,
          recordingStartTime: null
        });
      },

      pauseRecording: () => {
        const state = get();
        if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
          state.mediaRecorder.pause();
          set({ isPaused: true });
        }
      },

      resumeRecording: () => {
        const state = get();
        if (state.mediaRecorder && state.mediaRecorder.state === 'paused') {
          state.mediaRecorder.resume();
          set({ isPaused: false });
        }
      },

      updateRecordingConfig: (config) => {
        set((state) => ({
          recordingConfig: { ...state.recordingConfig, ...config }
        }));
      },

      updateEffectsConfig: (config) => {
        set((state) => ({
          effectsConfig: { ...state.effectsConfig, ...config }
        }));
      },

      updateExportConfig: (config) => {
        set((state) => ({
          exportConfig: { ...state.exportConfig, ...config }
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setShowPreview: (show) => set({ showPreview: show }),
      
      setShowSettings: (show) => set({ showSettings: show }),

      setMediaStreams: (streams) => {
        set({
          screenStream: streams.screen || null,
          audioStream: streams.audio || null,
          webcamStream: streams.webcam || null
        });
      },

      setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),

      addRecordedChunk: (chunk) => {
        set((state) => ({
          recordedChunks: [...state.recordedChunks, chunk]
        }));
      },

      updateRecordingDuration: () => {
        const state = get();
        if (state.isRecording && state.recordingStartTime) {
          const duration = Date.now() - state.recordingStartTime;
          set({ recordingDuration: duration });
        }
      },

      addNotification: (notification) => {
        const id = Date.now().toString();
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }]
        }));
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        }, 5000);
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      // Cleanup function
      cleanup: () => {
        const state = get();
        
        // Stop all streams
        if (state.screenStream) {
          state.screenStream.getTracks().forEach(track => track.stop());
        }
        if (state.audioStream) {
          state.audioStream.getTracks().forEach(track => track.stop());
        }
        if (state.webcamStream) {
          state.webcamStream.getTracks().forEach(track => track.stop());
        }

        // Reset state
        set({
          isRecording: false,
          isPaused: false,
          recordingDuration: 0,
          recordingStartTime: null,
          screenStream: null,
          audioStream: null,
          webcamStream: null,
          mediaRecorder: null,
          recordedChunks: []
        });
      }
    }),
    {
      name: 'snapsine-store',
      version: 1
    }
  )
);

export default useSnapsineStore; 