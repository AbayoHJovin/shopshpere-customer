// Simple toast hook for basic notifications
import * as React from "react"

type ToastVariant = "default" | "destructive"

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface Toast extends ToastProps {
  id: string;
}

let toastCount = 0;

// Simple toast implementation using browser alerts and console for now
// In production, you would want to use a proper toast library like react-hot-toast or sonner

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(({ title, description, variant = "default" }: ToastProps) => {
    const id = (++toastCount).toString();
    
    // For now, just use console logging and basic alerts
    // In production, you'd want a proper toast UI
    const message = `${title}${description ? `: ${description}` : ''}`;
    
    if (variant === "destructive") {
      console.error("Error:", message);
      // Could use alert for errors if needed: alert(`Error: ${message}`);
    } else {
      console.log("Success:", message);
      // Could use alert for success if needed: alert(message);
    }

    const newToast: Toast = { id, title, description, variant };
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);

    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)),
      update: (props: ToastProps) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, ...props } : t));
      }
    };
  }, []);

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      if (toastId) {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      } else {
        setToasts([]);
      }
    }
  };
}

export const toast = (props: ToastProps) => {
  const message = `${props.title}${props.description ? `: ${props.description}` : ''}`;
  
  if (props.variant === "destructive") {
    console.error("Error:", message);
  } else {
    console.log("Success:", message);
  }
  
  return {
    id: (++toastCount).toString(),
    dismiss: () => {},
    update: () => {}
  };
};
