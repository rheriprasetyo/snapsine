import React from 'react';
import { MousePointer2, ZoomIn, Crop, Volume2, Scissors, Wand2 } from 'lucide-react';

const tools = [
  { icon: MousePointer2, label: 'Cursor' },
  { icon: ZoomIn, label: 'Zoom' },
  { icon: Crop, label: 'Crop' },
  { icon: Volume2, label: 'Audio' },
  { icon: Scissors, label: 'Cut' },
  { icon: Wand2, label: 'Effects' },
];

const ToolSidebar = ({ activeTool, onToolSelect }) => (
  <aside className="w-16 h-full flex flex-col items-center py-4 bg-black/80 border-r border-gray-800 z-20">
    {tools.map(({ icon: Icon, label }) => {
      const isActive = activeTool === label.toLowerCase();
      return (
        <button
          key={label}
          className={`mb-4 p-2 rounded-lg flex flex-col items-center transition-all ${isActive ? 'bg-purple-700 text-white shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}
          title={label}
          onClick={() => onToolSelect && onToolSelect(label.toLowerCase())}
        >
          <Icon size={22} />
          <span className="text-[10px] mt-1">{label}</span>
        </button>
      );
    })}
  </aside>
);

export default ToolSidebar; 