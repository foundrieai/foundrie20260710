'use client';

import { useState, useEffect } from 'react';

export function ScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score === 0) {
        setDisplayScore(0);
        return;
    }
    // Animate score from 0 to actual score
    const animationDuration = 1000;
    const startTime = Date.now();

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      setDisplayScore(progress * score);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  }, [score]);
  
  const scorePercent = displayScore * 10; // score 8.5 -> 85%

  return (
    <div
      className="relative flex items-center justify-center w-32 h-32 rounded-full shadow-glow"
      style={{
        background: `conic-gradient(
          hsl(var(--primary)) ${scorePercent * 3.6}deg,
          hsl(var(--bg-tertiary)) 0
        )`,
      }}
    >
      <div className="absolute w-[104px] h-[104px] rounded-full bg-card" />
      <span className="relative z-10 font-code text-3xl font-bold text-primary-foreground">
        {displayScore.toFixed(1)}
      </span>
    </div>
  );
}
