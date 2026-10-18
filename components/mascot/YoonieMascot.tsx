"use client";

import * as React from "react";

export type MascotMood =
  | "calm"
  | "happy"
  | "checking"
  | "thinking"
  | "worried"
  | "sleeping";

const MASCOT_FILES: Record<MascotMood, string> = {
  calm: "/brand/mascot/yoonie-calm.png",
  happy: "/brand/mascot/yoonie-happy.png",
  checking: "/brand/mascot/yoonie-checking-booking.png",
  thinking: "/brand/mascot/yoonie-thinking.png",
  worried: "/brand/mascot/yoonie-worried.png",
  sleeping: "/brand/mascot/yoonie-sleeping.png",
};

const MOOD_TITLES: Record<MascotMood, string> = {
  calm: "Yoonie is welcoming you",
  happy: "Yoonie is thrilled!",
  checking: "Yoonie is reviewing details",
  thinking: "Yoonie is calculating options",
  worried: "Yoonie noticed something urgent",
  sleeping: "Yoonie is resting peacefully",
};

const SIZES = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-44 h-44",
};

export function YoonieMascot({
  mood = "calm",
  message,
  size = "md",
  interactive = false,
  className = "",
  badge,
}: {
  mood?: MascotMood;
  message?: React.ReactNode;
  size?: keyof typeof SIZES;
  interactive?: boolean;
  className?: string;
  badge?: string;
}) {
  const [currentMood, setCurrentMood] = React.useState<MascotMood>(mood);
  const [bouncing, setBouncing] = React.useState(false);

  React.useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  const cycleMood = () => {
    if (!interactive) return;
    setBouncing(true);
    setTimeout(() => setBouncing(false), 400);
    const moods: MascotMood[] = [
      "calm",
      "happy",
      "checking",
      "thinking",
      "worried",
      "sleeping",
    ];
    const nextIdx = (moods.indexOf(currentMood) + 1) % moods.length;
    setCurrentMood(moods[nextIdx]);
  };

  const imageSrc = MASCOT_FILES[currentMood] || MASCOT_FILES.calm;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech bubble if message is provided */}
      {message ? (
        <div className="relative mb-2 px-3.5 py-1.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] shadow-sm text-xs text-[#303A36] dark:text-[#F5EBDD] font-medium max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1.5">{message}</div>
          {/* Bubble tail */}
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-[#FFFFFF] dark:bg-[#202C27] border-r border-b border-[#E5DBD0] dark:border-[#2D3D36] rotate-45" />
        </div>
      ) : null}

      {/* Mascot Image Container */}
      <div
        onClick={cycleMood}
        title={MOOD_TITLES[currentMood]}
        className={`relative ${SIZES[size]} flex items-center justify-center ${
          interactive
            ? "cursor-pointer transition-transform duration-300 hover:scale-108 active:scale-95"
            : ""
        } ${bouncing ? "animate-bounce" : ""}`}
      >
        {/* Soft atmospheric glow behind mascot */}
        <div className="absolute inset-0 rounded-full bg-[#D8E6DA]/40 dark:bg-[#28594E]/20 blur-md -z-10" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={MOOD_TITLES[currentMood]}
          className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(40,89,78,0.15)] transition-all duration-300"
        />

        {/* Optional floating badge */}
        {badge ? (
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#E8A45B] text-[#303A36] text-[9px] font-bold shadow-xs">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
