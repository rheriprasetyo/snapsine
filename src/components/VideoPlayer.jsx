import React, { useEffect } from 'react';

const VideoPlayer = React.forwardRef(({ recording, onLoadedMetadata, onTimeUpdate, onError }, ref) => {
  useEffect(() => {
    if (recording?.filePath && ref && ref.current) {
      const videoUrl = `file://${recording.filePath}`;
      ref.current.src = videoUrl;
      ref.current.load();
    }
  }, [recording, ref]);

  if (!recording) {
    return null;
  }

  return (
    <video
      ref={ref}
      className="max-w-full max-h-full rounded-lg shadow-lg"
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
      onError={onError}
      playsInline
    />
  );
});

export default VideoPlayer; 