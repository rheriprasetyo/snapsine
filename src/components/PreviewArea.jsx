import React from 'react';
import { motion } from 'framer-motion';

const PreviewArea = ({ selectedSource, isRecording }) => {
  return (
    <div className="flex-1 flex items-center justify-center" style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {selectedSource ? (
        <motion.div
          className="relative w-full max-w-2xl aspect-video bg-black/20 rounded-lg border border-white/10 overflow-hidden"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            aspectRatio: '16/9',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Preview Image */}
          {selectedSource.thumbnail ? (
            <img
              src={selectedSource.thumbnail.toDataURL()}
              alt={selectedSource.name}
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="text-center" style={{ textAlign: 'center' }}>
                <div className="text-4xl mb-3" style={{ fontSize: '48px', marginBottom: '12px' }}>
                  {selectedSource.name.toLowerCase().includes('screen') ? '🖥️' : '🪟'}
                </div>
                <p className="text-white/60 text-base" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
                  {selectedSource.name}
                </p>
              </div>
            </div>
          )}

          {/* Recording Overlay */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 bg-red-500/10 border-2 border-red-500/50"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.5)'
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-red-500/80 rounded-full" style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderRadius: '9999px'
              }}>
                <div className="w-1.5 h-1.5 bg-white rounded-full" style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: 'white',
                  borderRadius: '50%'
                }} />
                <span className="text-white text-xs font-medium" style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  REC
                </span>
              </div>
            </motion.div>
          )}

          {/* Preview Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between" style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded-full" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '9999px'
            }}>
              <span className="text-white/80 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                {selectedSource.name.toLowerCase().includes('screen') ? '🖥️ Full Screen' : '🪟 Window'}
              </span>
            </div>

            <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/80 transition-colors" style={{
                padding: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '50%',
                color: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                🔍
              </button>
              <button className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/80 transition-colors" style={{
                padding: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '50%',
                color: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                ⚙️
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="text-center max-w-md"
          style={{ textAlign: 'center', maxWidth: '384px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4" style={{ fontSize: '72px', marginBottom: '16px' }}>
            🎥
          </div>
          <h3 className="text-white text-xl font-bold mb-3" style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            Select a Source to Preview
          </h3>
          <p className="text-white/60 text-sm leading-relaxed" style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            Choose a screen or window from the left sidebar to see a live preview before recording
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-3" style={{
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ fontSize: '12px' }}>🖥️</span>
              <span className="text-white/70 text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                Screens
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ fontSize: '12px' }}>🪟</span>
              <span className="text-white/70 text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                Windows
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PreviewArea; 