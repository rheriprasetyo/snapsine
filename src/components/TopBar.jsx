import React from 'react';
import { Undo2, Redo2, Settings, SlidersHorizontal, Download, Upload } from 'lucide-react';

const TopBar = ({ onUploadVideo, onExport }) => (
  <header className="fixed top-0 left-0 w-full h-16 z-30 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center px-6 shadow-lg border-b border-gray-800">
    <div className="flex items-center gap-3 flex-1">
      <span className="font-bold text-lg text-white tracking-wide">Snapsine</span>
      <span className="ml-4 text-gray-400 text-sm hidden sm:inline">Project</span>
    </div>
    <div className="flex-1 text-center">
      <span className="text-white font-medium text-base truncate">External Device 2023-07-21 21:06:30</span>
    </div>
    <div className="flex items-center gap-3 flex-1 justify-end">
      <button className="p-2 rounded hover:bg-gray-700 text-gray-300"><Undo2 size={20} /></button>
      <button className="p-2 rounded hover:bg-gray-700 text-gray-300"><Redo2 size={20} /></button>
      <button className="p-2 rounded hover:bg-gray-700 text-gray-300"><SlidersHorizontal size={20} /></button>
      <button className="p-2 rounded hover:bg-gray-700 text-gray-300"><Settings size={20} /></button>
      <label htmlFor="video-upload-input" className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition cursor-pointer flex items-center gap-2">
        <Upload size={18} /> Upload Video
        <input
          id="video-upload-input"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onUploadVideo}
        />
      </label>
      <button 
        onClick={onExport}
        className="ml-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow transition flex items-center gap-2"
      >
        <Download size={18} /> Export
      </button>
    </div>
  </header>
);

export default TopBar; 