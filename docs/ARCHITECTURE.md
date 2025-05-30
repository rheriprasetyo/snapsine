# Snapsine Architecture Documentation

## Overview

Snapsine is a modern screen recording application built with Electron, React, and advanced web technologies. It's designed to create cinematic, professional-quality recordings with smart motion effects and minimal post-processing needed.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Snapsine                            │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React + Tailwind + Framer Motion)              │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                               │
├─────────────────────────────────────────────────────────────┤
│  Core Modules                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  Recorder   │ │   Effects   │ │  Exporter   │        │
│  │   Module    │ │  Processor  │ │   Module    │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Browser APIs                                             │
│  • MediaRecorder  • Canvas       • WebRTC                │
│  • getDisplayMedia • Web Audio   • File System          │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. UI Layer (`src/ui/`)

**Primary Component**: `SnapsineMain.jsx`
- Modern, responsive interface built with React
- Tailwind CSS for styling
- Framer Motion for smooth animations
- Real-time recording controls and live preview

**Key Features**:
- Recording controls (start/stop/pause)
- Live preview with effects
- Settings panels for configuration
- Status indicators and notifications

### 2. State Management (`src/utils/store.js`)

**Technology**: Zustand with devtools
- Centralized state management
- Recording state and configuration
- Effects settings
- Export preferences
- UI state and notifications

**State Structure**:
```javascript
{
  // Recording State
  isRecording: boolean,
  isPaused: boolean,
  recordingDuration: number,
  
  // Configuration
  recordingConfig: { quality, audio, webcam, etc. },
  effectsConfig: { autoZoom, followCursor, etc. },
  exportConfig: { format, quality, preset, etc. },
  
  // Media Streams
  screenStream: MediaStream,
  audioStream: MediaStream,
  webcamStream: MediaStream
}
```

### 3. Recording Engine (`src/recorder/`)

**Primary Class**: `ScreenRecorder`
- Manages screen, audio, and webcam capture
- Combines multiple media streams
- Handles MediaRecorder API
- Real-time stream processing

**Key Capabilities**:
- Multi-source recording (screen + audio + webcam)
- Quality settings (720p/1080p/4K)
- Frame rate control
- Audio mixing (system + microphone)

**Technology Stack**:
- `getDisplayMedia()` for screen capture
- `getUserMedia()` for webcam/microphone
- `MediaRecorder` for video encoding
- Canvas API for stream composition

### 4. Effects Processor (`src/effects/`)

**Primary Class**: `EffectsProcessor`
- Real-time visual effects during recording
- Smart motion tracking and zoom
- Click highlights and cursor following
- Transition effects

**Features**:
- **Auto Zoom**: Automatically zoom in on click locations
- **Cursor Following**: Smooth camera follow for cursor movement
- **Click Highlights**: Visual ripple effects on clicks
- **Motion Smoothing**: Smooth camera transitions
- **Privacy Blur**: Automatic sensitive area detection and blur

**Effect Presets**:
- `cinematic`: Full effects for professional videos
- `minimal`: Basic effects for clean recordings
- `privacy`: Privacy-focused with blur regions
- `dynamic`: High-energy with all motion effects

### 5. Export Pipeline (`src/exporter/`)

**Primary Class**: `VideoExporter`
- Multi-format export (MP4, WebM, MOV)
- Platform-specific presets
- Quality optimization
- Batch processing capabilities

**Export Presets**:
- YouTube (1920x1080, H.264, high quality)
- YouTube Shorts (1080x1920, vertical)
- Instagram Reels (1080x1920, optimized)
- Twitter (1280x720, compressed)
- LinkedIn (1920x1080, professional)

## Technology Stack

### Frontend
- **React 18**: Component-based UI
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **React Hot Toast**: Notifications

### State Management
- **Zustand**: Lightweight state management
- **Devtools**: Development debugging

### Desktop App
- **Electron**: Cross-platform desktop app
- **Vite**: Fast build tool and dev server
- **Node.js**: Backend runtime

### Media Processing
- **MediaRecorder API**: Video recording
- **Canvas API**: Video composition
- **Web Audio API**: Audio processing
- **WebRTC**: Real-time communication

## Data Flow

### Recording Flow
```
1. User clicks "Start Recording"
2. ScreenRecorder requests permissions
3. Capture screen/audio/webcam streams
4. EffectsProcessor applies real-time effects
5. MediaRecorder encodes combined stream
6. Chunks stored in memory/storage
7. User stops recording
8. VideoExporter processes final video
9. File saved/downloaded
```

### Effects Processing
```
1. Mouse/keyboard events captured
2. EffectsProcessor analyzes events
3. Motion calculations performed
4. Canvas transformations applied
5. Visual effects overlaid
6. Processed frame sent to recorder
```

## Performance Considerations

### Optimization Strategies
- **Stream Composition**: Efficient canvas-based video mixing
- **Effect Caching**: Cache computed effects for performance
- **Quality Scaling**: Adaptive quality based on system performance
- **Memory Management**: Proper cleanup of media streams

### Resource Management
- CPU: Optimized rendering loops
- Memory: Stream cleanup and garbage collection
- Disk: Efficient temporary file handling
- GPU: Hardware acceleration where available

## Security & Privacy

### Permissions
- Screen capture permission
- Microphone access permission
- Webcam access permission
- File system write permission

### Privacy Features
- Local processing (no cloud uploads)
- Sensitive area blur detection
- User-controlled recording boundaries
- Secure temporary file handling

## Extensibility

### Plugin Architecture (Future)
- Effect plugins for custom visual effects
- Export plugins for additional formats
- Integration plugins for cloud services
- AI plugins for smart features

### Future Enhancements
- **AI Captions**: Automatic speech-to-text
- **Smart Highlights**: AI-powered important moment detection
- **Gesture Control**: Hand gesture recognition for zoom/pan
- **Cloud Sync**: Optional cloud storage and collaboration

## Development Workflow

### Build Process
```bash
npm run dev          # Development with hot reload
npm run build        # Production build
npm run dist         # Electron distribution
npm run test         # Run tests
```

### Code Organization
```
src/
├── main/           # Electron main process
├── recorder/       # Recording engine
├── effects/        # Effects processing
├── exporter/       # Export pipeline
├── ui/             # React components
├── utils/          # Shared utilities
└── assets/         # Static assets
```

## Performance Benchmarks

### Target Performance
- **Recording**: 60fps at 1080p with minimal CPU usage
- **Effects**: Real-time processing at 30fps
- **Memory**: <500MB during typical recording
- **Export**: 2x realtime speed for HD video

### Browser Compatibility
- **Chrome/Edge**: Full feature support
- **Firefox**: Limited MediaRecorder codec support
- **Safari**: Basic functionality (some limitations)

---

This architecture enables Snapsine to deliver professional-quality screen recordings with smart effects while maintaining excellent performance and user experience. 