# Snapsine – Cinematic Screen Recording for Creators on Windows

**Snapsine** is a smart, elegant screen recording application built for **creators, developers, educators, and storytellers** who want to turn everyday screen captures into **visually stunning, studio-grade content** — all without complex editing.

![Snapsine Interface](https://via.placeholder.com/800x400/667eea/ffffff?text=Snapsine+Preview)

## ✨ Key Features

- 🎥 **Ultra-Smooth Recording**: Capture full screen, windows, or selected regions in crisp HD or 4K
- 🎙️ **System + Mic Audio**: Record internal audio and your voice with perfect sync
- 👤 **Webcam Overlay**: Add a camera feed with stylish framing and layout options
- 🪄 **Smart Motion Effects**: Automatic zoom, cursor tracking, and click highlights
- 💡 **Minimal Editing Needed**: Live effects and transitions applied during recording
- 📤 **One-Click Export**: MP4, WebM, or social media-optimized formats
- ⚡ **Performance Optimized**: Hardware acceleration and resource management
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Desktop Framework**: Electron
- **UI Framework**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context + useReducer
- **Media Processing**: Web APIs + MediaRecorder
- **Build Tool**: Vite + Electron Builder

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Windows 10/11 (primary target)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd snapsine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run dist
   ```

## 📁 Project Structure

```
snapsine/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.js          # Main application entry
│   │   └── preload.js       # Bridge script
│   ├── components/          # React components
│   │   ├── Header.jsx       # App header with navigation
│   │   ├── SourceSelector.jsx  # Screen/window selector
│   │   ├── RecordingPanel.jsx  # Recording controls
│   │   ├── PreviewArea.jsx     # Live preview
│   │   └── SettingsPanel.jsx   # Settings interface
│   ├── contexts/            # React contexts
│   │   └── RecordingContext.jsx # Recording state management
│   ├── App.jsx              # Main React app
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── build/                   # Production build output
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── README.md               # This file
```

## 🎮 Usage

### Recording Your First Video

1. **Select a Source**: Choose from available screens or windows in the left panel
2. **Configure Settings**: Adjust audio, video quality, and effects as needed
3. **Preview**: See a live preview of your selected source
4. **Start Recording**: Click the red record button or press F9
5. **Control Recording**: Use pause/resume or stop when finished
6. **Export**: Choose your preferred format and export location

### Keyboard Shortcuts

- `F9` - Start Recording
- `F10` - Stop Recording  
- `F11` - Pause/Resume Recording
- `Ctrl+N` - New Recording
- `Ctrl+O` - Open Recordings Folder

### Settings & Configuration

Access the Settings panel to customize:

- **Video Quality**: Resolution, frame rate, output format
- **Audio**: System audio, microphone, quality levels
- **Webcam**: Enable overlay, position, size
- **Effects**: Click highlights, cursor tracking, auto-zoom
- **Export**: Default location, auto-open, quick presets
- **Performance**: Hardware acceleration, CPU limits

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build React app for production
- `npm run start` - Start Electron app
- `npm run dist` - Build and package for distribution
- `npm run preview` - Preview production build

### Development Setup

1. **Main Process** (`src/main/main.js`): Handles Electron window management, IPC, and system APIs
2. **Preload Script** (`src/main/preload.js`): Securely exposes APIs to renderer
3. **React App** (`src/`): Frontend UI and user interactions
4. **Context Provider** (`src/contexts/`): Global state management

### Key APIs Used

- **Electron desktopCapturer**: Screen and window enumeration
- **MediaDevices.getUserMedia**: Screen/audio capture
- **MediaRecorder**: Video encoding and recording
- **Electron IPC**: Communication between processes

## 🎯 Roadmap

### Phase 1: Core Features (Current)
- [x] Basic screen recording
- [x] Audio capture (system + mic)
- [x] Source selection
- [x] Live preview
- [x] Settings panel
- [x] Modern UI/UX

### Phase 2: Enhanced Features
- [ ] Webcam overlay implementation
- [ ] Click highlighting effects
- [ ] Cursor tracking improvements
- [ ] Auto-zoom functionality
- [ ] Export presets for social media

### Phase 3: AI-Powered Features
- [ ] Auto captions with Whisper
- [ ] Smart scene detection
- [ ] Gesture-based controls
- [ ] Content-aware editing suggestions

### Phase 4: Advanced Tools
- [ ] Basic video editing
- [ ] Screen annotation tools
- [ ] Multi-monitor support
- [ ] Cloud storage integration
- [ ] Live streaming capabilities

## 🐛 Known Issues

- Preview may not work with some applications due to DRM/security restrictions
- Hardware acceleration compatibility varies by system
- Large recordings may require significant disk space

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Electron team for the excellent desktop framework
- React team for the powerful UI library
- Tailwind CSS for the utility-first styling approach
- Framer Motion for smooth animations
- All contributors and beta testers

---

**Built with ❤️ for creators who want their screen recordings to look as good as their ideas.** 