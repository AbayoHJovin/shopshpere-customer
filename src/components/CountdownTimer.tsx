"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endDate: string;
  onExpired?: () => void;
}

const CountdownTimer = ({ endDate, onExpired }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        onExpired?.();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpired]);

  return (
    <div className="flex items-center justify-center gap-2 text-base font-medium">
      <div className="flex items-center gap-1">
        <span className="bg-red-500 text-white px-2 py-1.5 rounded-lg text-sm font-bold min-w-[2rem] text-center">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-red-600 text-sm font-semibold">h</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="bg-red-500 text-white px-2 py-1.5 rounded-lg text-sm font-bold min-w-[2rem] text-center">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-red-600 text-sm font-semibold">m</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="bg-red-500 text-white px-2 py-1.5 rounded-lg text-sm font-bold min-w-[2rem] text-center">
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-red-600 text-sm font-semibold">s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
