import React, { useState, useEffect, useRef } from 'react';

const DesktopSourceTest = () => {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      if (window.electronAPI) {
        const desktopSources = await window.electronAPI.getDesktopSources();
        console.log('Loaded sources:', desktopSources.length);
        setSources(desktopSources);
      } else {
        setError('ElectronAPI not available');
      }
    } catch (error) {
      console.error('Error loading sources:', error);
      setError('Failed to load sources: ' + error.message);
    }
  };

  const testSource = async (source) => {
    try {
      setError(null);
      setSelectedSource(source);
      console.log('Testing source:', source.name, source.id);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Try to capture the source
      const testStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id
          }
        }
      });

      console.log('Stream captured successfully:', testStream.id);
      setStream(testStream);

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = testStream;
        videoRef.current.play().catch(e => console.error('Video play error:', e));
      }

    } catch (error) {
      console.error('Error capturing source:', error);
      setError('Failed to capture source: ' + error.message);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setSelectedSource(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Desktop Source Test</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button 
          onClick={loadSources}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Refresh Sources
        </button>
        <span className="ml-4 text-gray-400">Found {sources.length} sources</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sources List */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Sources</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sources.map((source) => (
              <div 
                key={source.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSource?.id === source.id
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => testSource(source)}
              >
                <div className="flex items-center gap-3">
                  {source.thumbnail ? (
                    <img
                      src={source.thumbnail.toDataURL()}
                      alt={source.name}
                      className="w-12 h-8 object-cover rounded bg-white/10"
                    />
                  ) : (
                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                      {source.name.toLowerCase().includes('screen') ? '🖥️' : '🪟'}
                    </div>
                  )}
                  <div>
                    <div className="font-medium truncate">{source.name}</div>
                    <div className="text-xs text-gray-400 truncate">ID: {source.id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Preview</h2>
            {stream && (
              <button 
                onClick={stopStream}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                Stop
              </button>
            )}
          </div>
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {stream ? (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {selectedSource ? 'Setting up preview...' : 'Select a source to preview'}
              </div>
            )}
          </div>

          {selectedSource && (
            <div className="mt-3 p-3 bg-white/5 rounded-lg">
              <div className="text-sm">
                <div><strong>Source:</strong> {selectedSource.name}</div>
                <div><strong>ID:</strong> {selectedSource.id}</div>
                {stream && (
                  <div><strong>Stream:</strong> {stream.getTracks().length} tracks</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopSourceTest; 