import React, { useState } from 'react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'wallpaper', label: 'Wallpaper' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'color', label: 'Color' },
  { id: 'image', label: 'Image' },
];

const wallpapers = [
  '/backgrounds/wallpapers/wallpaper1.png',
  '/backgrounds/wallpapers/wallpaper2.png',
  '/backgrounds/wallpapers/wallpaper3.png',
  '/backgrounds/wallpapers/wallpaper4.png',

  // dst, sesuai file yang ada
];

const SettingsPanel = ({ activeTool, backgroundType, setBackgroundType, backgroundColor, setBackgroundColor, backgroundGradient, setBackgroundGradient, backgroundImage, setBackgroundImage, backgroundBlur, setBackgroundBlur, padding, setPadding }) => {
  const [activeTab, setActiveTab] = useState(backgroundType);

  // Sync tab with backgroundType
  React.useEffect(() => {
    setActiveTab(backgroundType);
  }, [backgroundType]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setBackgroundType(tab);
  };

  return (
    <aside className="w-96 h-full bg-black/80 border-l border-gray-800 p-6 flex flex-col z-20">
      <div className="mb-4 text-xs text-purple-400 font-semibold uppercase tracking-wider">Active Tool: {activeTool}</div>
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === tab.id ? 'bg-purple-700 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'wallpaper' && (
          <div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {wallpapers.map((img, idx) => (
                <img
                  key={img}
                  src={img}
                  alt={`Wallpaper ${idx + 1}`}
                  className={`w-16 h-12 object-cover rounded-lg border-2 cursor-pointer ${backgroundImage === img ? 'border-purple-500' : 'border-transparent hover:border-purple-500'}`}
                  onClick={() => { setBackgroundImage(img); setBackgroundType('wallpaper'); }}
                />
              ))}
            </div>
            <div className="text-xs text-gray-400 mb-4">Background gradients were created by <a href="https://raycast.com" target="_blank" rel="noopener noreferrer" className="underline">raycast.com</a></div>
            <div className="mb-4">
              <label className="block text-gray-300 text-xs mb-1">Background blur</label>
              <input type="range" min="0" max="20" step="1" className="w-full" value={backgroundBlur} onChange={e => setBackgroundBlur(Number(e.target.value))} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 text-xs mb-1">Padding</label>
              <input type="range" min="0" max="128" step="4" className="w-full" value={padding} onChange={e => setPadding(Number(e.target.value))} />
            </div>
          </div>
        )}
        {activeTab === 'gradient' && (
          <div className="mb-4">
            <label className="block text-gray-300 text-xs mb-1">Gradient</label>
            <input type="text" className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm" placeholder="linear-gradient(...)" value={backgroundGradient} onChange={e => setBackgroundGradient(e.target.value)} />
          </div>
        )}
        {activeTab === 'color' && (
          <div className="mb-4">
            <label className="block text-gray-300 text-xs mb-1">Color</label>
            <input type="color" className="w-full h-8" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
          </div>
        )}
        {activeTab === 'image' && (
          <div className="mb-4">
            <label className="block text-gray-300 text-xs mb-1">Image</label>
            <input type="file" accept="image/*" className="w-full text-white text-sm" onChange={e => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = ev => { setBackgroundImage(ev.target.result); setBackgroundType('image'); };
                reader.readAsDataURL(file);
              }
            }} />
          </div>
        )}
      </div>
    </aside>
  );
};

export default SettingsPanel; 