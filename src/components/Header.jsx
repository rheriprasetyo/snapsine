import React from 'react';
import { motion } from 'framer-motion';
import { Video, Settings } from 'lucide-react';

const Header = ({ isRecording, activeTab, onTabChange, tabs }) => {
  const getTabIcon = (tabId) => {
    switch (tabId) {
      case 'record':
        return <Video size={18} />;
      case 'settings':
        return <Settings size={18} />;
      default:
        return null;
    }
  };

  return (
    <motion.header 
      className="h-16 bg-black/20 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6"
      style={{
        height: '64px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo and Title */}
      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="text-2xl">🎥</div>
        <h1 className="text-xl font-bold text-white" style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
          Snapsine
        </h1>
        {isRecording && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '9999px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full" style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%'
            }} />
            <span className="text-red-400 text-sm font-medium" style={{
              color: '#f87171',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              REC
            </span>
          </motion.div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.7)'
            }}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ marginRight: '8px' }}>{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="w-8 h-8 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 flex items-center justify-center text-yellow-400"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(234, 179, 8, 0.2)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#facc15',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (window.electronAPI) {
              // Use IPC to minimize window
              console.log('Minimize window requested');
            }
          }}
        >
          −
        </button>
        <button 
          className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (window.electronAPI) {
              // Use IPC to close window
              console.log('Close window requested');
            }
          }}
        >
          ×
        </button>
      </div>
    </motion.header>
  );
};

export default Header; 