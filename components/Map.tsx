
import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';

interface MapProps {
    role: UserRole;
    isTripActive: boolean;
}

const Dot: React.FC<{ style: React.CSSProperties, className?: string }> = ({ style, className }) => (
    <div style={style} className={`absolute w-1.5 h-1.5 bg-gray-600 rounded-full ${className}`}></div>
);

export const Map: React.FC<MapProps> = ({ role, isTripActive }) => {
    const [carPosition, setCarPosition] = useState({ top: '70%', left: '50%' });
    const riderPosition = { top: '70%', left: '50%' };
    const destinationPosition = { top: '20%', left: '30%' };

    useEffect(() => {
        let animationFrameId: number;
        if (isTripActive) {
            const carEl = document.getElementById('car-icon');
            if(carEl) {
                const startPos = { top: 70, left: 50 };
                const endPos = { top: 20, left: 30 };
                let progress = 0;
                const duration = 8000; // 8 seconds for trip
                let startTime: number | null = null;
                
                const animate = (timestamp: number) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    progress = Math.min(elapsed / duration, 1);
                    
                    const newTop = startPos.top + (endPos.top - startPos.top) * progress;
                    const newLeft = startPos.left + (endPos.left - startPos.left) * progress;
                    
                    setCarPosition({ top: `${newTop}%`, left: `${newLeft}%` });

                    if (progress < 1) {
                        animationFrameId = requestAnimationFrame(animate);
                    }
                };

                animationFrameId = requestAnimationFrame(animate);
            }
        } else {
             setCarPosition({ top: '70%', left: '50%' });
        }
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isTripActive]);
    
    // Generate a grid of dots to simulate city blocks
    const grid = Array.from({ length: 15 }).map((_, i) =>
        Array.from({ length: 10 }).map((_, j) => (
            <Dot key={`${i}-${j}`} style={{ top: `${5 + i * 6}%`, left: `${5 + j * 9}%` }} />
        ))
    );

    return (
        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
            <div className="relative w-full h-full">
                {/* Roads */}
                {Array.from({ length: 15 }).map((_, i) => <div key={`h-${i}`} className="absolute w-full h-px bg-gray-800" style={{ top: `${5 + i * 6}%` }}></div>)}
                {Array.from({ length: 10 }).map((_, i) => <div key={`v-${i}`} className="absolute h-full w-px bg-gray-800" style={{ left: `${5 + i * 9}%` }}></div>)}
                
                {/* Grid dots */}
                {grid}
                
                {/* Route line */}
                {isTripActive && (
                     <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }}>
                        <line x1="50%" y1="70%" x2="30%" y2="20%" strokeDasharray="5, 5" stroke="rgb(34 197 94)" strokeWidth="3"/>
                    </svg>
                )}

                {/* Rider position */}
                {role === UserRole.RIDER && (
                    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={riderPosition}>
                         <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse"></div>
                    </div>
                )}
                
                {/* Destination */}
                 {isTripActive && (
                    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={destinationPosition}>
                        <div className="relative">
                            <StarIcon className="w-8 h-8 text-yellow-400" />
                             <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-ping"></div>
                        </div>
                    </div>
                )}


                {/* Car Icon */}
                <div id="car-icon" className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-linear" style={carPosition}>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center transform -rotate-45 shadow-2xl border-2 border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 text-yellow-400 ${className}`}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434L10.788 3.21z" clipRule="evenodd" />
    </svg>
);
