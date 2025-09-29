import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  muted?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

export const HlsVideoPlayer = ({ 
  src, 
  className = '', 
  controls = false, 
  muted = false,
  onError 
}: HlsVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHls = src.endsWith('.m3u8');

    if (isHls && Hls.isSupported()) {
      // Use hls.js for HLS streams
      const hls = new Hls();
      hlsRef.current = hls;
      
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          onError?.({ currentTarget: video } as React.SyntheticEvent<HTMLVideoElement, Event>);
        }
      });
    } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = src;
    } else {
      // Regular video file
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, onError]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      muted={muted}
      onError={onError}
    />
  );
};
