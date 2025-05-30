import useSnapsineStore from '../utils/store.js';

class EffectsProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.cursorPosition = { x: 0, y: 0 };
    this.clickEvents = [];
    this.zoomLevel = 1;
    this.targetZoom = 1;
    this.panPosition = { x: 0, y: 0 };
    this.targetPan = { x: 0, y: 0 };
    this.animationFrame = null;
  }

  initialize(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isActive = true;
    
    // Setup cursor tracking
    this.setupCursorTracking();
    
    // Setup click detection
    this.setupClickDetection();
    
    console.log('✨ EffectsProcessor initialized');
    return true;
  }

  setupCursorTracking() {
    // Track cursor position (this would need to be enhanced for desktop app)
    document.addEventListener('mousemove', (event) => {
      if (this.isActive) {
        this.cursorPosition = {
          x: event.clientX,
          y: event.clientY
        };
        
        const store = useSnapsineStore.getState();
        if (store.effectsConfig.followCursor) {
          this.updateCursorFollow();
        }
      }
    });
  }

  setupClickDetection() {
    document.addEventListener('mousedown', (event) => {
      if (this.isActive) {
        const store = useSnapsineStore.getState();
        if (store.effectsConfig.clickHighlights) {
          this.addClickHighlight(event.clientX, event.clientY);
        }
        
        if (store.effectsConfig.autoZoom) {
          this.triggerAutoZoom(event.clientX, event.clientY);
        }
      }
    });
  }

  addClickHighlight(x, y) {
    const clickEvent = {
      id: Date.now(),
      x,
      y,
      timestamp: Date.now(),
      opacity: 1,
      scale: 0
    };
    
    this.clickEvents.push(clickEvent);
    
    // Remove click event after animation
    setTimeout(() => {
      this.clickEvents = this.clickEvents.filter(click => click.id !== clickEvent.id);
    }, 1000);
  }

  triggerAutoZoom(x, y) {
    const store = useSnapsineStore.getState();
    if (!store.effectsConfig.autoZoom) return;

    // Calculate zoom target based on click position
    this.targetZoom = this.zoomLevel === 1 ? 1.5 : 1;
    
    // Calculate pan to center the click
    if (this.targetZoom > 1) {
      const canvasRect = this.canvas.getBoundingClientRect();
      this.targetPan = {
        x: -(x - canvasRect.width / 2) * (this.targetZoom - 1),
        y: -(y - canvasRect.height / 2) * (this.targetZoom - 1)
      };
    } else {
      this.targetPan = { x: 0, y: 0 };
    }
  }

  updateCursorFollow() {
    const store = useSnapsineStore.getState();
    if (!store.effectsConfig.followCursor) return;

    // Smooth camera follow
    const followStrength = 0.1;
    const deadZone = 100; // Pixels from center before camera starts moving
    
    const canvasRect = this.canvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    
    const deltaX = this.cursorPosition.x - centerX;
    const deltaY = this.cursorPosition.y - centerY;
    
    if (Math.abs(deltaX) > deadZone || Math.abs(deltaY) > deadZone) {
      this.targetPan.x += deltaX * followStrength;
      this.targetPan.y += deltaY * followStrength;
      
      // Clamp pan values
      const maxPan = 200;
      this.targetPan.x = Math.max(-maxPan, Math.min(maxPan, this.targetPan.x));
      this.targetPan.y = Math.max(-maxPan, Math.min(maxPan, this.targetPan.y));
    }
  }

  applyEffects(sourceCanvas, timestamp) {
    if (!this.isActive || !this.canvas || !this.ctx) return;

    const store = useSnapsineStore.getState();
    const config = store.effectsConfig;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context state
    this.ctx.save();

    // Apply smooth motion effects
    if (config.smoothMotion) {
      this.updateSmoothMotion();
    }

    // Apply zoom and pan transformations
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(this.zoomLevel, this.zoomLevel);
    this.ctx.translate(-this.canvas.width / 2 + this.panPosition.x, -this.canvas.height / 2 + this.panPosition.y);

    // Draw the source video frame
    this.ctx.drawImage(sourceCanvas, 0, 0, this.canvas.width, this.canvas.height);

    // Restore context for overlay effects
    this.ctx.restore();

    // Apply overlay effects
    this.applyClickHighlights(timestamp);
    
    if (config.blurSensitive) {
      this.applyPrivacyBlur();
    }

    // Apply transition effects
    if (config.transitionEffects) {
      this.applyTransitionEffects(timestamp);
    }
  }

  updateSmoothMotion() {
    const smoothing = 0.1;
    
    // Smooth zoom transition
    this.zoomLevel += (this.targetZoom - this.zoomLevel) * smoothing;
    
    // Smooth pan transition
    this.panPosition.x += (this.targetPan.x - this.panPosition.x) * smoothing;
    this.panPosition.y += (this.targetPan.y - this.panPosition.y) * smoothing;
  }

  applyClickHighlights(timestamp) {
    this.clickEvents.forEach(click => {
      const age = timestamp - click.timestamp;
      const progress = age / 1000; // 1 second animation
      
      if (progress < 1) {
        // Animate click highlight
        click.opacity = 1 - progress;
        click.scale = progress * 2;
        
        this.ctx.save();
        this.ctx.globalAlpha = click.opacity;
        
        // Draw ripple effect
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(click.x, click.y, 20 * click.scale, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw inner circle
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.globalAlpha = click.opacity * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(click.x, click.y, 10 * (1 - progress), 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
      }
    });
  }

  applyPrivacyBlur() {
    // This would detect sensitive areas and blur them
    // For now, we'll implement a simple demo that blurs bottom-right corner
    const blurRegion = {
      x: this.canvas.width - 200,
      y: this.canvas.height - 100,
      width: 200,
      height: 100
    };

    this.ctx.save();
    this.ctx.filter = 'blur(10px)';
    
    // Create a path for the blur region
    this.ctx.beginPath();
    this.ctx.rect(blurRegion.x, blurRegion.y, blurRegion.width, blurRegion.height);
    this.ctx.clip();
    
    // This would redraw the content with blur, but requires more complex implementation
    // For now, just overlay a blurred rectangle
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(blurRegion.x, blurRegion.y, blurRegion.width, blurRegion.height);
    
    this.ctx.restore();
  }

  applyTransitionEffects(timestamp) {
    // Apply subtle transition effects between scenes
    const store = useSnapsineStore.getState();
    
    // Example: fade in/out effect when recording starts/stops
    if (store.isRecording && store.recordingStartTime) {
      const recordingAge = timestamp - store.recordingStartTime;
      
      if (recordingAge < 500) { // Fade in first 500ms
        const opacity = recordingAge / 500;
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
      }
    }
  }

  // Smart zoom functionality
  enableSmartZoom(enabled = true) {
    const store = useSnapsineStore.getState();
    store.updateEffectsConfig({ autoZoom: enabled });
  }

  // Cursor following
  enableCursorFollow(enabled = true) {
    const store = useSnapsineStore.getState();
    store.updateEffectsConfig({ followCursor: enabled });
  }

  // Click highlights
  enableClickHighlights(enabled = true) {
    const store = useSnapsineStore.getState();
    store.updateEffectsConfig({ clickHighlights: enabled });
  }

  // Motion blur for smooth movement
  applyMotionBlur(intensity = 0.1) {
    // This would implement motion blur for smooth camera movements
    // For now, just a placeholder
    console.log(`🎬 Motion blur applied with intensity: ${intensity}`);
  }

  // Gesture detection (future AI enhancement)
  detectGestures() {
    // This would use AI/ML to detect hand gestures for zoom control
    // Placeholder for future implementation
    console.log('🤖 Gesture detection placeholder');
  }

  // Reset all effects
  reset() {
    this.zoomLevel = 1;
    this.targetZoom = 1;
    this.panPosition = { x: 0, y: 0 };
    this.targetPan = { x: 0, y: 0 };
    this.clickEvents = [];
    this.cursorPosition = { x: 0, y: 0 };
  }

  // Preset effects
  applyPreset(presetName) {
    const presets = {
      'cinematic': {
        autoZoom: true,
        followCursor: true,
        clickHighlights: true,
        smoothMotion: true,
        transitionEffects: true,
        blurSensitive: false
      },
      'minimal': {
        autoZoom: false,
        followCursor: false,
        clickHighlights: true,
        smoothMotion: true,
        transitionEffects: false,
        blurSensitive: false
      },
      'privacy': {
        autoZoom: false,
        followCursor: false,
        clickHighlights: false,
        smoothMotion: true,
        transitionEffects: false,
        blurSensitive: true
      },
      'dynamic': {
        autoZoom: true,
        followCursor: true,
        clickHighlights: true,
        smoothMotion: true,
        transitionEffects: true,
        blurSensitive: false
      }
    };

    const preset = presets[presetName];
    if (preset) {
      const store = useSnapsineStore.getState();
      store.updateEffectsConfig(preset);
      
      store.addNotification({
        type: 'success',
        message: `✨ Applied ${presetName} effects preset`
      });
    }
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      zoomLevel: this.zoomLevel,
      panPosition: this.panPosition,
      activeClickEvents: this.clickEvents.length,
      isActive: this.isActive
    };
  }

  // Cleanup
  cleanup() {
    this.isActive = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.reset();
    
    // Remove event listeners (in a real implementation)
    console.log('✨ EffectsProcessor cleaned up');
  }
}

export default EffectsProcessor; 