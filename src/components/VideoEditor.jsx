import React, { useState, useRef } from 'react';
import TopBar from './TopBar';
import ToolSidebar from './ToolSidebar';
import PreviewCanvas from './PreviewCanvas';
import SettingsPanel from './SettingsPanel';
import TimelineEditor from './TimelineEditor';

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [clips, setClips] = useState([
    { id: 'clip-1', start: 0, end: 10 },
  ]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTool, setActiveTool] = useState('cursor');
  const [backgroundType, setBackgroundType] = useState('wallpaper');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundGradient, setBackgroundGradient] = useState('linear-gradient(to right, #6a11cb, #2575fc)');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [padding, setPadding] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  // Sync playhead with video
  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };
  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
    // Optionally, set clips to full duration
    setClips([{ id: 'clip-1', start: 0, end: e.target.duration }]);
  };

  // Seek video when timeline is clicked/dragged
  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Update clips when blocks are dragged
  const handleClipChange = (newClips) => {
    setClips(newClips);
  };

  // Playback controls
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };
  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
    }
  };

  // Keep isPlaying in sync with video events
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [videoRef]);

  // Debug log for backgroundType and backgroundImage
  console.log('VideoEditor bgType', backgroundType, 'bgImg', backgroundImage);

  return (
    <div className="relative h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <TopBar onUploadVideo={handleFileUpload} />
      <div className="flex flex-row h-full pb-20 pt-4">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center">
              <PreviewCanvas
                videoFile={videoFile}
                videoRef={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                isPlaying={isPlaying}
                backgroundType={backgroundType}
                backgroundColor={backgroundColor}
                backgroundGradient={backgroundGradient}
                backgroundImage={backgroundImage}
                backgroundBlur={backgroundBlur}
                padding={padding}
              />
              {/* Playback controls and upload button row */}
              <div className="flex justify-center items-center gap-6 mt-6 mb-2">
                <button onClick={handleBackward} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <button onClick={handlePlayPause} className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white mx-2">
                  {isPlaying ? (
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'><rect x='6' y='4' width='4' height='16' rx='1'/><rect x='14' y='4' width='4' height='16' rx='1'/></svg>
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'><polygon points='5,3 19,12 5,21 5,3'/></svg>
                  )}
                </button>
                <button onClick={handleForward} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </button>
              </div>
            </div>
            <ToolSidebar activeTool={activeTool} onToolSelect={setActiveTool} />
            <SettingsPanel
              activeTool={activeTool}
              backgroundType={backgroundType}
              setBackgroundType={setBackgroundType}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              backgroundGradient={backgroundGradient}
              setBackgroundGradient={setBackgroundGradient}
              backgroundImage={backgroundImage}
              setBackgroundImage={setBackgroundImage}
              backgroundBlur={backgroundBlur}
              setBackgroundBlur={setBackgroundBlur}
              padding={padding}
              setPadding={setPadding}
            />
          </div>
        </div>
      </div>
      <TimelineEditor
        clips={clips}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        onClipChange={handleClipChange}
      />
    </div>
  );
};

export default VideoEditor; 