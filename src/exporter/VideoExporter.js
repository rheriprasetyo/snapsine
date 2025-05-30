import useSnapsineStore from '../utils/store.js';

class VideoExporter {
  constructor() {
    this.isExporting = false;
    this.exportProgress = 0;
  }

  async exportVideo(recordedBlob, config = {}) {
    try {
      this.isExporting = true;
      this.exportProgress = 0;
      
      const store = useSnapsineStore.getState();
      const exportConfig = { ...store.exportConfig, ...config };
      
      store.addNotification({
        type: 'info',
        message: '🎬 Starting video export...'
      });

      // For now, we'll do client-side conversion
      // In a full implementation, this would use FFmpeg or send to a server
      const result = await this.processVideo(recordedBlob, exportConfig);
      
      this.isExporting = false;
      return result;
    } catch (error) {
      this.isExporting = false;
      console.error('❌ Export failed:', error);
      
      useSnapsineStore.getState().addNotification({
        type: 'error',
        message: `Export failed: ${error.message}`
      });
      
      throw error;
    }
  }

  async processVideo(blob, config) {
    // Simulate processing time
    for (let i = 0; i <= 100; i += 10) {
      this.exportProgress = i;
      await this.delay(200);
    }

    // Create download based on format
    const filename = this.generateFilename(config);
    
    if (config.format === 'mp4') {
      // For MP4, we'd need FFmpeg conversion
      // For now, just rename and download
      return this.downloadFile(blob, filename);
    } else if (config.format === 'webm') {
      // WebM is the native format, just download
      return this.downloadFile(blob, filename);
    } else {
      // Other formats would require conversion
      return this.downloadFile(blob, filename);
    }
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    useSnapsineStore.getState().addNotification({
      type: 'success',
      message: `✅ Video exported as ${filename}`
    });

    return { success: true, filename, url };
  }

  generateFilename(config) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preset = config.preset !== 'custom' ? `-${config.preset}` : '';
    const quality = config.quality !== 'medium' ? `-${config.quality}` : '';
    
    return `snapsine-${timestamp}${preset}${quality}.${config.format}`;
  }

  // Export presets for different platforms
  getExportPresets() {
    return {
      youtube: {
        format: 'mp4',
        quality: 'high',
        resolution: '1920x1080',
        framerate: 30,
        bitrate: '5000k',
        codec: 'h264'
      },
      shorts: {
        format: 'mp4',
        quality: 'high',
        resolution: '1080x1920',
        framerate: 30,
        bitrate: '4000k',
        codec: 'h264'
      },
      reels: {
        format: 'mp4',
        quality: 'high',
        resolution: '1080x1920',
        framerate: 30,
        bitrate: '4000k',
        codec: 'h264'
      },
      twitter: {
        format: 'mp4',
        quality: 'medium',
        resolution: '1280x720',
        framerate: 30,
        bitrate: '2500k',
        codec: 'h264'
      },
      linkedin: {
        format: 'mp4',
        quality: 'high',
        resolution: '1920x1080',
        framerate: 30,
        bitrate: '3000k',
        codec: 'h264'
      }
    };
  }

  // Quality settings
  getQualitySettings() {
    return {
      low: {
        bitrate: '1000k',
        crf: 28
      },
      medium: {
        bitrate: '2500k',
        crf: 23
      },
      high: {
        bitrate: '5000k',
        crf: 18
      },
      lossless: {
        bitrate: '10000k',
        crf: 0
      }
    };
  }

  // Future: FFmpeg integration for desktop app
  async ffmpegConvert(inputPath, outputPath, options) {
    // This would use FFmpeg for actual video conversion
    // Example command: ffmpeg -i input.webm -c:v libx264 -crf 23 output.mp4
    
    console.log('🎬 FFmpeg conversion would happen here');
    console.log('Input:', inputPath);
    console.log('Output:', outputPath);
    console.log('Options:', options);
    
    // Placeholder for actual FFmpeg integration
    return { success: true };
  }

  // Batch export multiple recordings
  async batchExport(recordings, configs) {
    const results = [];
    
    for (let i = 0; i < recordings.length; i++) {
      const recording = recordings[i];
      const config = configs[i] || configs[0];
      
      try {
        const result = await this.exportVideo(recording, config);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Export with custom watermark/branding
  async exportWithBranding(blob, config, brandingOptions = {}) {
    // This would overlay logo, text, or other branding elements
    console.log('🎨 Adding branding:', brandingOptions);
    
    // For now, just export normally
    return this.exportVideo(blob, config);
  }

  // Get export progress
  getProgress() {
    return {
      isExporting: this.isExporting,
      progress: this.exportProgress
    };
  }

  // Cancel export (for future implementation)
  cancelExport() {
    if (this.isExporting) {
      this.isExporting = false;
      this.exportProgress = 0;
      
      useSnapsineStore.getState().addNotification({
        type: 'info',
        message: '⏹️ Export cancelled'
      });
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get estimated file size
  estimateFileSize(durationMs, quality, format) {
    const bitrateMap = {
      low: 1000, // kbps
      medium: 2500,
      high: 5000,
      lossless: 10000
    };
    
    const bitrate = bitrateMap[quality] || 2500;
    const durationSeconds = durationMs / 1000;
    const estimatedSizeKB = (bitrate * durationSeconds) / 8;
    
    return {
      kb: estimatedSizeKB,
      mb: estimatedSizeKB / 1024,
      formatted: this.formatFileSize(estimatedSizeKB * 1024)
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Cleanup
  cleanup() {
    this.isExporting = false;
    this.exportProgress = 0;
  }
}

export default VideoExporter; 