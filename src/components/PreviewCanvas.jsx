import React, { useRef, useEffect } from 'react';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const PreviewCanvas = ({ videoFile, videoRef, onTimeUpdate, onLoadedMetadata, isPlaying, backgroundType, backgroundColor, backgroundGradient, backgroundImage, backgroundBlur, padding, backgroundRef }) => {
  const containerRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  // Update backgroundRef to point to the offscreen canvas
  useEffect(() => {
    if (backgroundRef && offscreenCanvasRef.current) {
      backgroundRef.current = offscreenCanvasRef.current;
    }
  }, [backgroundRef]);

  // Draw background to offscreen canvas whenever background changes
  useEffect(() => {
    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (backgroundType === 'color') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else if (backgroundType === 'gradient') {
      // Parse gradient string (simple linear-gradient)
      // Fallback: hardcoded gradient
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, '#6a11cb');
      grad.addColorStop(1, '#2575fc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else if ((backgroundType === 'image' || backgroundType === 'wallpaper') && backgroundImage) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = backgroundImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      };
    } else {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    // Blur is not applied here; handled in CSS for preview only
  }, [backgroundType, backgroundColor, backgroundGradient, backgroundImage]);

  // Debug log
  // console.log('bgType', backgroundType, 'bgImg', backgroundImage);

  // Determine background style for preview div
  let bgStyle = {};
  if (backgroundType === 'color') {
    bgStyle.background = backgroundColor;
  } else if (backgroundType === 'gradient') {
    bgStyle.background = backgroundGradient;
  } else if (backgroundType === 'image' && backgroundImage) {
    bgStyle.backgroundImage = `url(${backgroundImage})`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  } else if (backgroundType === 'wallpaper' && backgroundImage) {
    bgStyle.backgroundImage = `url(${backgroundImage})`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  } else {
    bgStyle.background = 'black';
  }

  return (
    <div
      ref={containerRef}
      className="rounded-2xl shadow-lg max-w-3xl w-full flex flex-col items-center justify-center aspect-video relative"
      style={{ ...bgStyle, filter: `blur(${backgroundBlur}px)`, padding: padding, minHeight: 300 }}
    >
      {/* Offscreen canvas for export (hidden) */}
      <canvas
        ref={offscreenCanvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'none' }}
      />
      {videoFile ? (
        <video
          ref={videoRef}
          src={videoFile}
          className="max-w-[90%] max-h-[90%] mx-auto my-auto rounded-xl relative z-10 block"
          controls
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          style={{ background: 'black' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
          Upload a video to start editing
        </div>
      )}
    </div>
  );
};

export default PreviewCanvas; 