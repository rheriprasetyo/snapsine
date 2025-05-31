import React, { useRef, useState } from 'react';
import { Download } from 'lucide-react';

const ExportManager = ({ videoRef, backgroundRef, settings }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isExportingRef = useRef(false);

  // Helper: wait until background image is loaded to canvas
  const ensureBackgroundReady = () => {
    return new Promise((resolve) => {
      if (!backgroundRef.current) return resolve();
      const ctx = backgroundRef.current.getContext('2d');
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      resolve();
    });
  };

  const startExport = async () => {
    if (!videoRef.current || !backgroundRef.current) {
      alert('Video atau background belum siap!');
      console.error('ExportManager: videoRef.current atau backgroundRef.current null');
      return;
    }
    if (!videoRef.current.duration || videoRef.current.duration === Infinity) {
      alert('Please load a valid video before exporting.');
      console.error('ExportManager: videoRef.current.duration invalid', videoRef.current.duration);
      return;
    }
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      alert('Video belum siap. Pastikan video sudah dimuat sepenuhnya.');
      console.error('ExportManager: videoRef.current.videoWidth/Height = 0');
      return;
    }

    await ensureBackgroundReady();

    try {
      setIsExporting(true);
      isExportingRef.current = true;
      setExportProgress(0);
      chunksRef.current = [];

      // Create canvas for composition
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = settings.width;
      canvas.height = settings.height;
      console.log('ExportManager: canvas created', settings.width, settings.height);

      // Create offscreen video element
      const offscreenVideo = document.createElement('video');
      offscreenVideo.src = videoRef.current.src;
      offscreenVideo.crossOrigin = 'anonymous';
      offscreenVideo.muted = true;
      offscreenVideo.playsInline = true;
      offscreenVideo.preload = 'auto';
      offscreenVideo.currentTime = 0;
      await new Promise((resolve, reject) => {
        offscreenVideo.onloadedmetadata = () => {
          resolve();
        };
        offscreenVideo.onerror = (e) => {
          reject(new Error('Failed to load video for export'));
        };
      });

      // Create MediaRecorder
      const stream = canvas.captureStream(30); // 30fps
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000 // 5Mbps
      });
      console.log('ExportManager: MediaRecorder created');

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapsine-export-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        isExportingRef.current = false;
        setExportProgress(0);
        cancelAnimationFrame(animationFrameRef.current);
        alert('Export selesai!');
        console.log('ExportManager: Export selesai, file didownload');
      };

      // Seek video to start
      offscreenVideo.currentTime = 0;
      offscreenVideo.pause();
      offscreenVideo.muted = true;
      console.log('ExportManager: Offscreen video seek ke 0, paused, muted');

      // Start recording
      mediaRecorderRef.current.start();
      console.log('ExportManager: MediaRecorder started');

      // Draw frames
      const drawFrame = () => {
        if (!isExportingRef.current) {
          console.warn('ExportManager: drawFrame keluar karena !isExportingRef.current');
          return;
        }
        // Log currentTime dan progress
        console.log('drawFrame', offscreenVideo.currentTime, '/', offscreenVideo.duration);
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw background
        if (backgroundRef.current) {
          try {
            ctx.drawImage(backgroundRef.current, 0, 0, canvas.width, canvas.height);
          } catch (err) {
            console.error('ExportManager: drawImage background error', err);
          }
        }
        // Draw video with padding and scaling
        try {
          const scale = settings.scale || 0.8;
          const padding = settings.padding || 0;
          const videoWidth = offscreenVideo.videoWidth * scale;
          const videoHeight = offscreenVideo.videoHeight * scale;
          const x = (canvas.width - videoWidth) / 2;
          const y = (canvas.height - videoHeight) / 2;
          ctx.drawImage(offscreenVideo, x, y, videoWidth, videoHeight);
        } catch (err) {
          console.error('ExportManager: drawImage video error', err);
        }
        // Update progress
        if (offscreenVideo && offscreenVideo.duration) {
          setExportProgress(Math.min(100, (offscreenVideo.currentTime / offscreenVideo.duration) * 100));
        }
        // Stop export if video ended
        if (offscreenVideo && offscreenVideo.currentTime >= offscreenVideo.duration - 0.05) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log('ExportManager: MediaRecorder stopped (video ended)');
          }
          return;
        }
        // Advance video frame
        if (offscreenVideo && !offscreenVideo.paused && !offscreenVideo.ended) {
          // do nothing, let video play
        } else if (offscreenVideo && offscreenVideo.readyState >= 2) {
          offscreenVideo.currentTime = Math.min(offscreenVideo.currentTime + 1 / 30, offscreenVideo.duration);
        }
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      };

      // Play video in background (muted, hidden)
      offscreenVideo.muted = true;
      offscreenVideo.play().then(() => {
        console.log('ExportManager: Offscreen video play() resolved, mulai drawFrame');
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      }).catch((err) => {
        alert('Gagal memulai video untuk export. Coba reload halaman.');
        console.error('ExportManager: offscreen video play() error', err);
        setIsExporting(false);
        isExportingRef.current = false;
      });
    } catch (error) {
      alert('Export failed: ' + error.message);
      console.error('Export failed:', error);
      setIsExporting(false);
      isExportingRef.current = false;
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const stopExport = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('ExportManager: MediaRecorder stopped (manual)');
    }
    setIsExporting(false);
    isExportingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);
  };

  return (
    <div className="flex items-center gap-4">
      {!isExporting ? (
        <button
          onClick={startExport}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow transition flex items-center gap-2"
        >
          <Download size={18} />
          Export Video
        </button>
      ) : (
        <>
          <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <button
            onClick={stopExport}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition"
          >
            Stop Export
          </button>
        </>
      )}
    </div>
  );
};

export default ExportManager; 