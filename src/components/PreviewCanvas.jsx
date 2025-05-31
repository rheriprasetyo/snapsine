import React from 'react';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';

const PreviewCanvas = ({ videoFile, videoRef, onTimeUpdate, onLoadedMetadata, isPlaying, backgroundType, backgroundColor, backgroundGradient, backgroundImage, backgroundBlur, padding }) => {
  // Debug log
  console.log('bgType', backgroundType, 'bgImg', backgroundImage);

  // Determine background style
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
      className="rounded-2xl shadow-lg max-w-3xl w-full flex flex-col items-center justify-center aspect-video relative"
      style={{ ...bgStyle, filter: `blur(${backgroundBlur}px)`, padding: padding, minHeight: 300 }}
    >
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