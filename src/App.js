import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronUp, ChevronDown, Volume2 } from 'lucide-react';

const AudioPlayer = () => {
  // Sample playlist - replace with your actual audio files
  const playlist = [
    { id: 1, title: "Summer Breeze", artist: "Artist Name", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 2, title: "Night Drive", artist: "Another Artist", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: 3, title: "Morning Coffee", artist: "Third Artist", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: 4, title: "Sunset Boulevard", artist: "Fourth Artist", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
  ];

  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => skipToNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipToNext = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const skipToPrev = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <audio
        ref={audioRef}
        src={playlist[currentTrack].url}
        preload="metadata"
      />

      {/* Minimized Bar */}
      {!isExpanded && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center hover:bg-indigo-50 transition flex-shrink-0"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{playlist[currentTrack].title}</div>
                <div className="text-sm text-indigo-100 truncate">{playlist[currentTrack].artist}</div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="ml-4 p-2 hover:bg-white/10 rounded-full transition flex-shrink-0"
            >
              <ChevronUp size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Player */}
      {isExpanded && (
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl">
          <div className="max-w-4xl mx-auto p-6">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ChevronDown size={24} />
              </button>
            </div>

            {/* Current Track Info */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">{playlist[currentTrack].title}</h2>
              <p className="text-xl text-indigo-100">{playlist[currentTrack].artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%)`
                }}
              />
              <div className="flex justify-between text-sm mt-2 text-indigo-100">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={skipToPrev}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <SkipBack size={24} />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-indigo-600 flex items-center justify-center hover:scale-105 transition shadow-lg"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>
              <button
                onClick={skipToNext}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <SkipForward size={24} />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Volume2 size={20} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-32 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                }}
              />
            </div>

            {/* Playlist */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-3 text-lg">Playlist</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playlist.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      currentTrack === index
                        ? 'bg-white/20 border-l-4 border-white'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-indigo-100">{track.artist}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
