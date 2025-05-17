// src/components/DrawManagement/DrawAnimationComponent.tsx
import React, { useEffect, useState } from 'react';

interface DrawAnimationProps {
  isExecuting: boolean;
  participantCount: number;
  onAnimationComplete: () => void;
  duration?: number; // in milliseconds
}

const DrawAnimationComponent: React.FC<DrawAnimationProps> = ({
  isExecuting,
  participantCount,
  onAnimationComplete,
  duration = 5000 // default 5 seconds
}) => {
  const [progress, setProgress] = useState(0);
  const [displayedNumbers, setDisplayedNumbers] = useState<string[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Generate a random MSISDN (Nigerian format)
  const generateRandomMSISDN = () => {
    const prefixes = ['0803', '0805', '0806', '0807', '0808', '0809', '0810', '0811', '0812', '0813', '0814', '0815', '0816', '0817', '0818', '0819', '0909', '0908'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return prefix + suffix;
  };

  // Mask MSISDN (show only first 3 and last 3 digits)
  const maskMSISDN = (msisdn: string): string => {
    if (msisdn.length <= 6) return msisdn;
    return `${msisdn.substring(0, 3)}***${msisdn.substring(msisdn.length - 3)}`;
  };

  useEffect(() => {
    if (!isExecuting) {
      setProgress(0);
      setDisplayedNumbers([]);
      setAnimationFrame(0);
      return;
    }

    // Update progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        if (newProgress >= 100) {
          clearInterval(interval);
          onAnimationComplete();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Update displayed numbers
    const numberInterval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
      
      // Generate new set of numbers
      const newNumbers = Array(5).fill(0).map(() => maskMSISDN(generateRandomMSISDN()));
      setDisplayedNumbers(newNumbers);
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(numberInterval);
    };
  }, [isExecuting, duration, onAnimationComplete]);

  if (!isExecuting) {
    return null;
  }

  return (
    <div className="draw-animation-container">
      <h3>Draw Execution in Progress</h3>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="animation-content">
        <div className="spinning-wheel">
          <div className="wheel-inner" style={{ transform: `rotate(${animationFrame * 20}deg)` }}>
            <div className="wheel-segment"></div>
            <div className="wheel-segment"></div>
            <div className="wheel-segment"></div>
            <div className="wheel-segment"></div>
          </div>
        </div>
        
        <div className="number-display">
          <p>Selecting from {participantCount.toLocaleString()} eligible participants</p>
          <div className="number-grid">
            {displayedNumbers.map((number, index) => (
              <div key={index} className="number-item" style={{ animationDelay: `${index * 0.1}s` }}>
                {number}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>
        {`
        .draw-animation-container {
          background-color: #f0f8ff;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }
        
        .progress-container {
          height: 10px;
          background-color: #e0e0e0;
          border-radius: 5px;
          margin: 20px 0;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #1890ff;
          transition: width 0.1s ease;
        }
        
        .animation-content {
          display: flex;
          justify-content: space-around;
          align-items: center;
          margin: 30px 0;
        }
        
        .spinning-wheel {
          width: 150px;
          height: 150px;
          position: relative;
        }
        
        .wheel-inner {
          width: 100%;
          height: 100%;
          position: absolute;
          transition: transform 0.2s ease;
        }
        
        .wheel-segment {
          position: absolute;
          width: 50%;
          height: 50%;
          background-color: #1890ff;
          opacity: 0.7;
        }
        
        .wheel-segment:nth-child(1) {
          top: 0;
          left: 0;
          border-radius: 100% 0 0 0;
          transform-origin: bottom right;
        }
        
        .wheel-segment:nth-child(2) {
          top: 0;
          right: 0;
          border-radius: 0 100% 0 0;
          transform-origin: bottom left;
        }
        
        .wheel-segment:nth-child(3) {
          bottom: 0;
          right: 0;
          border-radius: 0 0 100% 0;
          transform-origin: top left;
        }
        
        .wheel-segment:nth-child(4) {
          bottom: 0;
          left: 0;
          border-radius: 0 0 0 100%;
          transform-origin: top right;
        }
        
        .number-display {
          flex: 1;
          margin-left: 30px;
          text-align: left;
        }
        
        .number-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 15px;
        }
        
        .number-item {
          background-color: white;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          animation: fadeInOut 0.5s ease;
          font-family: monospace;
          font-size: 16px;
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .animation-content {
            flex-direction: column;
          }
          
          .number-display {
            margin-left: 0;
            margin-top: 20px;
            text-align: center;
          }
        }
        `}
      </style>
    </div>
  );
};

export default DrawAnimationComponent;
