import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    videoQuality: '1080p',
    frameRate: '60',
    audioQuality: 'high',
    outputFormat: 'mp4',
    includeAudio: true,
    includeMicrophone: false,
    webcamEnabled: false,
    clickHighlights: true,
    autoZoom: false,
    outputPath: 'Desktop/Recordings'
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 space-y-6" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 className="text-white text-lg font-semibold" style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
        Settings
      </h2>

      {/* Video Settings */}
      {/* <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2" style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '8px'
        }}>
          📹 Video Settings
        </h3>

        <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="text-white/80 text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Quality
            </label>
            <select 
              value={settings.videoQuality}
              onChange={(e) => updateSetting('videoQuality', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white'
              }}
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="1440p">1440p 2K</option>
              <option value="2160p">2160p 4K</option>
            </select>
          </div>

          <div>
            <label className="text-white/80 text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Frame Rate
            </label>
            <select 
              value={settings.frameRate}
              onChange={(e) => updateSetting('frameRate', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white'
              }}
            >
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
              <option value="120">120 FPS</option>
            </select>
          </div>
        </div>
      </div> */}

      {/* Audio Settings */}
      
      {/* <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2" style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '8px'
        }}>
          🔊 Audio Settings
        </h3>

        <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-white/80 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              System Audio
            </span>
            <motion.button
              onClick={() => toggleSetting('includeAudio')}
              className={`relative w-10 h-6 rounded-full ${settings.includeAudio ? 'bg-green-600' : 'bg-gray-600'}`}
              style={{
                position: 'relative',
                width: '40px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: settings.includeAudio ? '#16a34a' : '#4b5563',
                border: 'none',
                cursor: 'pointer'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'white',
                  borderRadius: '50%'
                }}
                animate={{
                  x: settings.includeAudio ? 20 : 4
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-white/80 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              Microphone
            </span>
            <motion.button
              onClick={() => toggleSetting('includeMicrophone')}
              className={`relative w-10 h-6 rounded-full ${settings.includeMicrophone ? 'bg-green-600' : 'bg-gray-600'}`}
              style={{
                position: 'relative',
                width: '40px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: settings.includeMicrophone ? '#16a34a' : '#4b5563',
                border: 'none',
                cursor: 'pointer'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'white',
                  borderRadius: '50%'
                }}
                animate={{
                  x: settings.includeMicrophone ? 20 : 4
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>
      </div> */}

      {/* Effects Settings */}
      {/* <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2" style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '8px'
        }}>
          ✨ Effects
        </h3>

        <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-white/80 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              Click Highlights
            </span>
            <motion.button
              onClick={() => toggleSetting('clickHighlights')}
              className={`relative w-10 h-6 rounded-full ${settings.clickHighlights ? 'bg-purple-600' : 'bg-gray-600'}`}
              style={{
                position: 'relative',
                width: '40px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: settings.clickHighlights ? '#9333ea' : '#4b5563',
                border: 'none',
                cursor: 'pointer'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'white',
                  borderRadius: '50%'
                }}
                animate={{
                  x: settings.clickHighlights ? 20 : 4
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-white/80 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              Webcam Overlay
            </span>
            <motion.button
              onClick={() => toggleSetting('webcamEnabled')}
              className={`relative w-10 h-6 rounded-full ${settings.webcamEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
              style={{
                position: 'relative',
                width: '40px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: settings.webcamEnabled ? '#2563eb' : '#4b5563',
                border: 'none',
                cursor: 'pointer'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'white',
                  borderRadius: '50%'
                }}
                animate={{
                  x: settings.webcamEnabled ? 20 : 4
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-white/80 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              Auto Zoom
            </span>
            <motion.button
              onClick={() => toggleSetting('autoZoom')}
              className={`relative w-10 h-6 rounded-full ${settings.autoZoom ? 'bg-orange-600' : 'bg-gray-600'}`}
              style={{
                position: 'relative',
                width: '40px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: settings.autoZoom ? '#ea580c' : '#4b5563',
                border: 'none',
                cursor: 'pointer'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'white',
                  borderRadius: '50%'
                }}
                animate={{
                  x: settings.autoZoom ? 20 : 4
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>
      </div> */}

      {/* Output Settings */}
      {/* <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="text-white text-sm font-medium border-b border-white/10 pb-2" style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '8px'
        }}>
          💾 Output
        </h3>

        <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="text-white/80 text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Format
            </label>
            <select 
              value={settings.outputFormat}
              onChange={(e) => updateSetting('outputFormat', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white'
              }}
            >
              <option value="mp4">MP4</option>
              <option value="mov">MOV</option>
              <option value="avi">AVI</option>
              <option value="webm">WebM</option>
            </select>
          </div>

          <div>
            <label className="text-white/80 text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Save Location
            </label>
            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                value={settings.outputPath}
                onChange={(e) => updateSetting('outputPath', e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white'
                }}
              />
              <button 
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded-lg"
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                📁
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Save Button */}
      <motion.button
        className="w-full px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded-lg font-medium"
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '8px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          console.log('Settings saved:', settings);
          alert('Settings saved!');
        }}
      >
        💾 Save Settings
      </motion.button>
    </div>
  );
};

export default SettingsPanel; 