// src/components/DrawManagement/DrawAnimation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button, Progress } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import './DrawAnimation.css';

interface DrawAnimationProps {
  onAnimationComplete: () => void;
  progress?: number; // External progress value (0-100)
  duration?: number; // in milliseconds
  autoStart?: boolean;
  isExecuting?: boolean; // Whether the backend draw execution is in progress
}

/**
 * Component for the draw animation that displays during backend draw execution
 */
const DrawAnimation: React.FC<DrawAnimationProps> = ({
  onAnimationComplete,
  progress: externalProgress,
  duration = 5000, // 5 seconds by default
  autoStart = false,
  isExecuting = false
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoStart);
  const [internalProgress, setInternalProgress] = useState<number>(0);
  const [currentNumber, setCurrentNumber] = useState<string>('0');
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Use external progress if provided, otherwise use internal progress
  const displayProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  // Generate random number with leading zeros
  const generateRandomNumber = (): string => {
    const randomNum = Math.floor(Math.random() * 10000000000);
    return randomNum.toString().padStart(10, '0');
  };

  // Animation loop - only used when no external progress is provided
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const newProgress = Math.min((elapsed / duration) * 100, 100);
    
    setInternalProgress(newProgress);
    
    // Generate new random number every 100ms
    if (elapsed % 100 < 20) {
      setCurrentNumber(generateRandomNumber());
    }

    if (newProgress < 100) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      onAnimationComplete();
    }
  };

  // Update number display based on progress changes
  useEffect(() => {
    if (displayProgress > 0 && displayProgress < 100) {
      // Generate new random number every time progress changes
      setCurrentNumber(generateRandomNumber());
    }
    
    // Call onAnimationComplete when progress reaches 100%
    if (displayProgress === 100) {
      setIsPlaying(false);
      onAnimationComplete();
    }
  }, [displayProgress, onAnimationComplete]);

  // Start or stop animation
  useEffect(() => {
    // Only use internal animation if no external progress is provided
    if (isPlaying && externalProgress === undefined) {
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, externalProgress]);

  // Auto-start when isExecuting changes to true
  useEffect(() => {
    if (isExecuting) {
      setIsPlaying(true);
    }
  }, [isExecuting]);

  // Toggle play/pause - only available when using internal progress
  const togglePlay = () => {
    if (externalProgress === undefined) {
      setIsPlaying(prev => !prev);
    }
  };

  // Reset animation - only available when using internal progress
  const resetAnimation = () => {
    if (externalProgress === undefined) {
      setIsPlaying(false);
      setInternalProgress(0);
      setCurrentNumber('0');
      startTimeRef.current = null;
    }
  };

  return (
    <div className="draw-animation-container">
      <div className="draw-animation-number-display">
        {currentNumber.split('').map((digit, index) => (
          <div key={index} className="draw-animation-digit">
            {digit}
          </div>
        ))}
      </div>
      
      <div className="draw-animation-progress">
        <Progress 
          percent={displayProgress} 
          showInfo={false} 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      </div>
      
      {/* Only show controls when using internal progress */}
      {externalProgress === undefined && (
        <div className="draw-animation-controls">
          <Button
            type="primary"
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={togglePlay}
            disabled={displayProgress === 100}
          >
            {isPlaying ? 'Pause' : displayProgress === 100 ? 'Complete' : 'Start'}
          </Button>
          
          {displayProgress > 0 && displayProgress < 100 && (
            <Button onClick={resetAnimation} className="draw-animation-reset-btn">
              Reset
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DrawAnimation;
