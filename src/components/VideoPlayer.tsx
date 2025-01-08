import React from 'react';
import { BoxHover } from './BoxHover';
import { VideoBackground } from './VideoBackground';
import { Play, Volume2 } from 'lucide-react';

export function VideoPlayer() {
  return (
    <div className="w-full h-full">
      <BoxHover className="relative w-full h-full md:h-[300px] group">

        
        {/* Video Container with responsive aspect ratio */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Ambient background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
          
          {/* Main video container with proper aspect ratio */}
          <div className="relative w-full h-full aspect-video">
            <video
              className="absolute inset-0 w-full h-full object-contain rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-[1.02]"
              controls
              preload="metadata"
              poster="/src/components/mshaadi_skit_final.mp4?t=0"
            >
              <source src="/src/components/mshaadi_skit_final.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>



          </div>
        </div>
      </BoxHover>
    </div>
  );
}