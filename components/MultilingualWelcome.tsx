'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface WelcomeText {
  text: string;
  language: string;
}

const welcomeTexts: WelcomeText[] = [
  { text: "स्वागत है", language: "Hindi" },
  { text: "ਜੀ ਆਇਆਂ ਨੂੰ", language: "Punjabi" },
  { text: "Willkommen", language: "German" },
  { text: "Bienvenue", language: "French" },
  { text: "أهلاً وسهلاً", language: "Arabic" },
  { text: "欢迎", language: "Chinese" },
];

interface MultilingualWelcomeProps {
  onComplete: () => void;
}

export default function MultilingualWelcome({ onComplete }: MultilingualWelcomeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showLanguage, setShowLanguage] = useState(true);

  const handleSkip = () => {
    setShowLanguage(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        if (currentIndex < welcomeTexts.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsVisible(true);
        } else {
          // Animation complete
          setShowLanguage(false);
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }, 400);
    }, 1500); // Show each language for 1.5 seconds

    return () => clearInterval(timer);
  }, [currentIndex, onComplete]);

  if (!showLanguage) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Skip Button */}
      <div className="absolute top-8 right-8 z-10">
        <Button
          onClick={handleSkip}
          variant="ghost"
          size="sm"
          className="text-purple-300 hover:text-white hover:bg-purple-900/50 transition-all duration-300 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400"
        >
          Skip
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div 
        className={`transition-all duration-500 transform ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-110 -translate-y-4'
        }`}
      >
        <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-3 leading-tight text-center">
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            {welcomeTexts[currentIndex].text}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-purple-300 font-medium text-center">
          Welcome in {welcomeTexts[currentIndex].language}
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-12 flex gap-2">
        {welcomeTexts.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              index <= currentIndex 
                ? 'bg-gradient-to-r from-purple-400 to-blue-400 scale-110' 
                : 'bg-purple-900/50 scale-75'
            }`}
          />
        ))}
      </div>
      
      {/* Skip hint text */}
      <div className="absolute bottom-6 text-xs text-purple-400/70 animate-pulse">
        Click Skip to go directly to the main content
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
