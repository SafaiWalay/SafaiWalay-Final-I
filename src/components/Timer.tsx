import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  isRunning: boolean;
  startTime: string | null;
  pausedAt: string | null;
  totalPauseDuration: number;
}

export default function Timer({ isRunning, startTime, pausedAt, totalPauseDuration }: TimerProps) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!startTime) return;

    const calculateElapsed = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      let duration = now - start - (totalPauseDuration * 60 * 1000);

      if (pausedAt) {
        duration -= (now - new Date(pausedAt).getTime());
      }

      return Math.max(0, Math.floor(duration / 1000));
    };

    setElapsed(calculateElapsed());

    if (isRunning && !pausedAt) {
      const timer = setInterval(() => {
        setElapsed(calculateElapsed());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isRunning, startTime, pausedAt, totalPauseDuration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-primary/10 rounded-lg p-4 text-center"
    >
      <div className="text-sm text-muted-foreground mb-1">Elapsed Time</div>
      <div className="text-3xl font-mono font-bold">{formatTime(elapsed)}</div>
    </motion.div>
  );
}