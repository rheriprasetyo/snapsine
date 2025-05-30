import useSnapsineStore from '../utils/store.js';

class ScreenRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.combinedStream = null;
    this.chunks = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      this.isInitialized = true;
      console.log('🎥 ScreenRecorder initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize ScreenRecorder:', error);
      return false;
    }
  }

  async startRecording(config = {}) {
    try {
      const store = useSnapsineStore.getState();
      const recordingConfig = { ...store.recordingConfig, ...config };

      // Get screen stream
      const screenStream = await this.getScreenStream(recordingConfig);
      
      // Get audio streams
      const audioStreams = await this.getAudioStreams(recordingConfig);
      
      // Get webcam stream if enabled
      let webcamStream = null;
      if (recordingConfig.webcamEnabled) {
        webcamStream = await this.getWebcamStream(recordingConfig);
      }

      // Combine all streams
      this.combinedStream = await this.combineStreams({
        screen: screenStream,
        audio: audioStreams,
        webcam: webcamStream
      });

      // Configure MediaRecorder
      const mimeType = this.getSupportedMimeType();
      const options = {
        mimeType,
        videoBitsPerSecond: this.getVideoBitrate(recordingConfig.quality),
        audioBitsPerSecond: 128000
      };

      this.mediaRecorder = new MediaRecorder(this.combinedStream, options);
      this.chunks = [];

      // Setup event handlers
      this.setupRecorderEvents();

      // Update store
      store.setMediaStreams({
        screen: screenStream,
        audio: audioStreams.combined,
        webcam: webcamStream
      });
      store.setMediaRecorder(this.mediaRecorder);

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      store.startRecording();

      store.addNotification({
        type: 'success',
        message: '🎬 Recording started successfully!'
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      useSnapsineStore.getState().addNotification({
        type: 'error',
        message: `Failed to start recording: ${error.message}`
      });
      return false;
    }
  }

  async stopRecording() {
    try {
      const store = useSnapsineStore.getState();
      
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        // Stop the recorder
        this.mediaRecorder.stop();
        
        // Stop all tracks
        if (this.combinedStream) {
          this.combinedStream.getTracks().forEach(track => track.stop());
        }

        store.stopRecording();
        store.addNotification({
          type: 'success',
          message: '⏹️ Recording stopped. Processing video...'
        });
      }
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      useSnapsineStore.getState().addNotification({
        type: 'error',
        message: `Failed to stop recording: ${error.message}`
      });
    }
  }

  pauseRecording() {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        useSnapsineStore.getState().pauseRecording();
        
        useSnapsineStore.getState().addNotification({
          type: 'info',
          message: '⏸️ Recording paused'
        });
      }
    } catch (error) {
      console.error('❌ Failed to pause recording:', error);
    }
  }

  resumeRecording() {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        useSnapsineStore.getState().resumeRecording();
        
        useSnapsineStore.getState().addNotification({
          type: 'info',
          message: '▶️ Recording resumed'
        });
      }
    } catch (error) {
      console.error('❌ Failed to resume recording:', error);
    }
  }

  async getScreenStream(config) {
    const constraints = {
      video: {
        cursor: config.includeCursor ? 'always' : 'never',
        frameRate: config.framerate,
        ...this.getVideoConstraints(config.quality)
      },
      audio: false // We'll handle audio separately for better control
    };

    // For region selection, we'll need to implement custom logic
    if (config.screenSource === 'region') {
      // This would require a screen region selector UI
      // For now, fallback to fullscreen
      console.log('🖼️ Region selection not yet implemented, using fullscreen');
    }

    return await navigator.mediaDevices.getDisplayMedia(constraints);
  }

  async getAudioStreams(config) {
    const streams = { system: null, mic: null, combined: null };

    try {
      // System audio (requires specific browser setup or desktop app)
      if (config.audioSource.includes('system')) {
        try {
          // Note: getDisplayMedia MUST include video=true, even for audio-only capture
          // We'll request both video and audio, then extract only the audio tracks
          const systemMediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true, // Required! Can't be false
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              sampleRate: 44100
            }
          });
          
          // Extract only audio tracks for system audio
          const audioTracks = systemMediaStream.getAudioTracks();
          if (audioTracks.length > 0) {
            // Create a new stream with only audio tracks
            streams.system = new MediaStream(audioTracks);
            
            // Stop and remove video tracks since we don't need them for audio
            systemMediaStream.getVideoTracks().forEach(track => {
              track.stop();
              systemMediaStream.removeTrack(track);
            });
            
            console.log('✅ System audio capture successful');
            useSnapsineStore.getState().addNotification({
              type: 'success',
              message: '🔊 System audio enabled'
            });
          } else {
            console.warn('⚠️ No audio tracks found in system capture');
            useSnapsineStore.getState().addNotification({
              type: 'warning', 
              message: '⚠️ System audio not available - continuing with microphone only'
            });
            // Stop the entire stream if no audio
            systemMediaStream.getTracks().forEach(track => track.stop());
          }
        } catch (error) {
          console.warn('⚠️ System audio capture failed:', error.message);
          useSnapsineStore.getState().addNotification({
            type: 'warning',
            message: '⚠️ System audio not available - continuing with microphone only'
          });
          // This is expected in some browsers/environments - don't throw, just continue
        }
      }

      // Microphone audio
      if (config.audioSource.includes('mic')) {
        try {
          streams.mic = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });
          console.log('✅ Microphone audio capture successful');
        } catch (error) {
          console.error('❌ Microphone access failed:', error);
          useSnapsineStore.getState().addNotification({
            type: 'error',
            message: '❌ Microphone access denied'
          });
          throw error; // This is more critical, so throw
        }
      }

      // Combine audio streams if both exist
      if (streams.system && streams.mic) {
        streams.combined = this.combineAudioStreams(streams.system, streams.mic);
        console.log('✅ Combined system + microphone audio');
      } else {
        streams.combined = streams.system || streams.mic;
        if (streams.combined) {
          const sourceType = streams.system ? 'system audio' : 'microphone';
          console.log(`✅ Using ${sourceType} only`);
        }
      }

      // Ensure we have at least some audio if requested
      if (config.audioSource !== 'none' && !streams.combined) {
        console.warn('⚠️ No audio sources available');
        useSnapsineStore.getState().addNotification({
          type: 'warning',
          message: '⚠️ No audio sources available - recording video only'
        });
      }

      return streams;
    } catch (error) {
      console.error('❌ Failed to get audio streams:', error);
      throw error;
    }
  }

  async getWebcamStream(config) {
    try {
      const constraints = {
        video: {
          width: this.getWebcamDimensions(config.webcamSize).width,
          height: this.getWebcamDimensions(config.webcamSize).height,
          frameRate: 30
        },
        audio: false // Audio is handled separately
      };

      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('❌ Failed to get webcam stream:', error);
      throw error;
    }
  }

  async combineStreams({ screen, audio, webcam }) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);

    // Set canvas size based on screen resolution
    canvas.width = screen.getVideoTracks()[0].getSettings().width || 1920;
    canvas.height = screen.getVideoTracks()[0].getSettings().height || 1080;

    const screenVideo = document.createElement('video');
    screenVideo.srcObject = screen;
    screenVideo.play();

    let webcamVideo = null;
    if (webcam) {
      webcamVideo = document.createElement('video');
      webcamVideo.srcObject = webcam;
      webcamVideo.play();
    }

    // Render loop
    const render = () => {
      if (screenVideo.readyState >= 2) {
        // Draw screen content
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

        // Draw webcam overlay if enabled
        if (webcamVideo && webcamVideo.readyState >= 2) {
          const config = useSnapsineStore.getState().recordingConfig;
          const { x, y, width, height } = this.getWebcamPosition(
            config.webcamPosition, 
            config.webcamSize, 
            canvas.width, 
            canvas.height
          );
          
          ctx.drawImage(webcamVideo, x, y, width, height);
        }
      }
      
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        requestAnimationFrame(render);
      }
    };

    render();

    // Add audio tracks if available
    if (audio && audio.combined) {
      audio.combined.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });
    }

    return stream;
  }

  combineAudioStreams(stream1, stream2) {
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();
    
    if (stream1.getAudioTracks().length > 0) {
      const source1 = audioContext.createMediaStreamSource(stream1);
      source1.connect(dest);
    }
    
    if (stream2.getAudioTracks().length > 0) {
      const source2 = audioContext.createMediaStreamSource(stream2);
      source2.connect(dest);
    }
    
    return dest.stream;
  }

  setupRecorderEvents() {
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
        useSnapsineStore.getState().addRecordedChunk(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.processRecording();
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event.error);
      useSnapsineStore.getState().addNotification({
        type: 'error',
        message: `Recording error: ${event.error.message}`
      });
    };
  }

  async processRecording() {
    try {
      const blob = new Blob(this.chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `snapsine-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      URL.revokeObjectURL(url);
      this.chunks = [];

      useSnapsineStore.getState().addNotification({
        type: 'success',
        message: '✅ Recording saved successfully!'
      });

      // TODO: Integrate with exporter for different formats
      return { success: true, blob, url };
    } catch (error) {
      console.error('❌ Failed to process recording:', error);
      useSnapsineStore.getState().addNotification({
        type: 'error',
        message: `Failed to process recording: ${error.message}`
      });
      return { success: false, error };
    }
  }

  // Helper methods
  getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/mp4;codecs=h264,aac',
      'video/webm'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'video/webm';
  }

  getVideoBitrate(quality) {
    const bitrates = {
      '720p': 2500000,  // 2.5 Mbps
      '1080p': 5000000, // 5 Mbps
      '4k': 20000000    // 20 Mbps
    };
    return bitrates[quality] || bitrates['1080p'];
  }

  getVideoConstraints(quality) {
    const constraints = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 }
    };
    return constraints[quality] || constraints['1080p'];
  }

  getWebcamDimensions(size) {
    const dimensions = {
      small: { width: 160, height: 120 },
      medium: { width: 320, height: 240 },
      large: { width: 480, height: 360 }
    };
    return dimensions[size] || dimensions.medium;
  }

  getWebcamPosition(position, size, canvasWidth, canvasHeight) {
    const { width, height } = this.getWebcamDimensions(size);
    const margin = 20;

    const positions = {
      'top-left': { x: margin, y: margin },
      'top-right': { x: canvasWidth - width - margin, y: margin },
      'bottom-left': { x: margin, y: canvasHeight - height - margin },
      'bottom-right': { x: canvasWidth - width - margin, y: canvasHeight - height - margin },
      'center': { x: (canvasWidth - width) / 2, y: (canvasHeight - height) / 2 }
    };

    return { ...positions[position], width, height };
  }

  cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    if (this.combinedStream) {
      this.combinedStream.getTracks().forEach(track => track.stop());
      this.combinedStream = null;
    }
    this.chunks = [];
    this.isInitialized = false;
  }
}

export default ScreenRecorder; 