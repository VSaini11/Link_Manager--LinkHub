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
          variant="outline"
          size="sm"
          className="bg-white/80 text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-300 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-full px-4 py-1.5 font-medium text-xs tracking-wide"
        >
          Skip Intro
          <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
        </Button>
      </div>

      <div 
        className={`transition-all duration-500 transform ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-105 -translate-y-3'
        }`}
      >
        <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading font-extrabold tracking-tight mb-3 leading-tight text-center">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {welcomeTexts[currentIndex].text}
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 font-medium text-center tracking-wide">
          Welcome in <span className="text-indigo-600 font-semibold">{welcomeTexts[currentIndex].language}</span>
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-12 flex gap-2">
        {welcomeTexts.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              index <= currentIndex 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 scale-110 shadow-sm' 
                : 'bg-slate-200 scale-90'
            }`}
          />
        ))}
      </div>
      
      {/* Skip hint text */}
      <div className="absolute bottom-6 text-xs text-slate-400 font-medium">
        Click Skip to jump directly to LinkHub
      </div>
      
      {/* Animated gentle light background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
