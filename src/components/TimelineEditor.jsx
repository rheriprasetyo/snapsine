import React, { useRef, useState } from 'react';

const TimelineEditor = ({ clips, currentTime, duration, onSeek, onClipChange }) => {
  const timelineRef = useRef(null);
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  const [draggingClip, setDraggingClip] = useState(null); // idx of clip being dragged

  // Convert time to percent (for positioning)
  const timeToPercent = (time) => (duration ? (time / duration) * 100 : 0);
  const percentToTime = (percent) => (duration ? percent * duration : 0);

  // Handle click/drag on timeline to seek
  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const seekTime = Math.max(0, Math.min(duration, percent * duration));
    onSeek && onSeek(seekTime);
  };

  // Playhead drag logic
  const handlePlayheadMouseDown = (e) => {
    setDraggingPlayhead(true);
    e.stopPropagation();
  };

  // Clip drag logic (only start for now)
  const handleClipMouseDown = (e, idx) => {
    setDraggingClip(idx);
    e.stopPropagation();
  };

  // Mouse move and up listeners
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingPlayhead && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        const seekTime = Math.max(0, Math.min(duration, percent * duration));
        onSeek && onSeek(seekTime);
      }
      if (draggingClip !== null && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        const newStart = Math.max(0, Math.min(percent * duration, clips[draggingClip].end - 0.1));
        const newClips = clips.map((clip, i) =>
          i === draggingClip ? { ...clip, start: newStart } : clip
        );
        onClipChange && onClipChange(newClips);
      }
    };
    const handleMouseUp = () => {
      setDraggingPlayhead(false);
      setDraggingClip(null);
    };
    if (draggingPlayhead || draggingClip !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingPlayhead, draggingClip, clips, duration, onSeek, onClipChange]);

  return (
    <div className="fixed bottom-0 left-0 w-full h-20 z-40 bg-black/95 border-t border-gray-800 flex items-center px-8 select-none">
      <div
        className="flex-1 flex items-center relative h-full cursor-pointer"
        ref={timelineRef}
        onClick={handleTimelineClick}
      >
        {/* Time ruler */}
        {[...Array(11)].map((_, i) => (
          <div key={i} className="absolute left-0" style={{ left: `${i * 10}%` }}>
            <span className="text-xs text-gray-400 absolute top-0 left-0">{Math.round((i * duration) / 10)}s</span>
          </div>
        ))}
        {/* Clip blocks */}
        {clips.map((clip, idx) => (
          <div
            key={clip.id}
            className="absolute top-6 h-8 bg-yellow-400/80 rounded-md flex items-center group"
            style={{
              left: `${timeToPercent(clip.start)}%`,
              width: `${timeToPercent(clip.end - clip.start)}%`,
              minWidth: 24,
              cursor: draggingClip === idx ? 'grabbing' : 'ew-resize',
              zIndex: draggingClip === idx ? 20 : 1,
            }}
            onMouseDown={(e) => handleClipMouseDown(e, idx)}
          >
            <span className="text-xs text-black px-2">Clip {idx + 1}</span>
          </div>
        ))}
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-500 rounded-full cursor-pointer"
          style={{ left: `${timeToPercent(currentTime)}%`, zIndex: 10 }}
          onMouseDown={handlePlayheadMouseDown}
        />
      </div>
    </div>
  );
};

export default TimelineEditor; 