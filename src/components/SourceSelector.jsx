import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SourceSelector = ({ selectedSource, onSourceSelect }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        const desktopSources = await window.electronAPI.getDesktopSources();
        setSources(desktopSources);
      } else {
        // Mock data for testing in browser
        setSources([
          { id: 'screen1', name: 'Entire Screen', thumbnail: '', appIcon: '' },
          { id: 'window1', name: 'Browser Window', thumbnail: '', appIcon: '' },
          { id: 'window2', name: 'Code Editor', thumbnail: '', appIcon: '' }
        ]);
      }
    } catch (error) {
      console.error('Error loading desktop sources:', error);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8" style={{ textAlign: 'center', padding: '32px 0' }}>
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-purple-400 rounded-full mx-auto mb-3" style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderTop: '2px solid #c084fc',
          borderRadius: '50%',
          margin: '0 auto 12px',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="text-white/60 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
          Loading sources...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="text-white/80 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
          Available Sources
        </span>
        <button
          onClick={loadSources}
          className="text-purple-400 hover:text-purple-300 text-sm"
          style={{
            background: 'none',
            border: 'none',
            color: '#c084fc',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-6" style={{ textAlign: 'center', padding: '24px 0' }}>
          <p className="text-white/50 text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginBottom: '8px' }}>
            No sources available
          </p>
          <p className="text-white/30 text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>
            Try opening applications, then click Refresh
          </p>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto overflow-x-hidden" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '8px',
            maxHeight: '256px',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '4px'
          }}
        >
          {sources.map((source) => (
            <motion.button
              key={source.id}
              className={`p-3 rounded-lg text-left transition-all border ${
                selectedSource?.id === source.id
                  ? 'bg-purple-500/20 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
              style={{
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                backgroundColor: selectedSource?.id === source.id 
                  ? 'rgba(168, 85, 247, 0.2)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: selectedSource?.id === source.id 
                  ? '1px solid rgba(168, 85, 247, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                color: selectedSource?.id === source.id 
                  ? 'white' 
                  : 'rgba(255, 255, 255, 0.8)'
              }}
              onClick={() => onSourceSelect(source)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center" style={{
                  width: '48px',
                  height: '32px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {source.name.toLowerCase().includes('screen') ? '🖥️' : '🪟'}
                  </span>
                </div>

                <div className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-medium" style={{ 
                    fontWeight: '500', 
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '14px',
                    lineHeight: '1.2',
                    maxHeight: '2.4em'
                  }}>
                    {source.name}
                  </div>
                  <div className="text-xs opacity-60 mt-0.5" style={{
                    fontSize: '12px',
                    opacity: 0.6,
                    marginTop: '2px'
                  }}>
                    {source.name.toLowerCase().includes('screen') ? 'Full Screen' : 'Application Window'}
                  </div>
                </div>

                {selectedSource?.id === source.id && (
                  <div className="flex-shrink-0 ml-2 self-start mt-1" style={{ 
                    flexShrink: 0, 
                    marginLeft: '8px',
                    alignSelf: 'flex-start',
                    marginTop: '4px'
                  }}>
                    <div className="w-2 h-2 bg-purple-400 rounded-full" style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#c084fc',
                      borderRadius: '50%'
                    }} />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourceSelector; 