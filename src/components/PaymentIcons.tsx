import Image from "next/image";
import { cn } from "@/lib/utils";

interface PaymentIconsProps {
  className?: string;
  showMTN?: boolean;
}

export function PaymentIcons({
  className,
  showMTN = false,
}: PaymentIconsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="h-8 w-12 bg-muted rounded flex items-center justify-center overflow-hidden">
        <Image
          src="/visa-icon.png"
          alt="VISA"
          width={32}
          height={20}
          className="object-contain"
        />
      </div>
      <div className="h-8 w-12 bg-muted rounded flex items-center justify-center overflow-hidden">
        <Image
          src="/mastercard-icon.png"
          alt="MasterCard"
          width={32}
          height={20}
          className="object-contain"
        />
      </div>
      {showMTN && (
        <div className="h-8 w-12 bg-muted rounded flex items-center justify-center overflow-hidden">
          <Image
            src="/mtn-icon.png"
            alt="MTN"
            width={32}
            height={20}
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
