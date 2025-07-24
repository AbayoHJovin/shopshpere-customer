import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface DiscountTimerProps {
  endTime: Date;
  className?: string;
}

const DiscountTimer = ({ endTime, className = "" }: DiscountTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-destructive" />
      <div className="flex items-center gap-1 text-sm font-medium">
        <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
          {timeLeft.days}d
        </div>
        <span className="text-destructive">:</span>
        <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
          {timeLeft.hours.toString().padStart(2, '0')}h
        </div>
        <span className="text-destructive">:</span>
        <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
          {timeLeft.minutes.toString().padStart(2, '0')}m
        </div>
        <span className="text-destructive">:</span>
        <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
          {timeLeft.seconds.toString().padStart(2, '0')}s
        </div>
      </div>
    </div>
  );
};

export default DiscountTimer; 