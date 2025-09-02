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
    <div className="flex items-center gap-1 text-xs font-medium">
      <div className="flex items-center gap-0.5">
        <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px] font-bold">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-600 text-[10px]">h</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px] font-bold">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-600 text-[10px]">m</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px] font-bold">
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-600 text-[10px]">s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
