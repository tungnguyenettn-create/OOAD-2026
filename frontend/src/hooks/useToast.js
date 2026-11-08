import { useCallback, useEffect, useRef, useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const notify = useCallback((message, variant = "success") => {
    clearTimeout(timer.current);
    setToast({ message, variant });
    timer.current = setTimeout(() => setToast(null), variant === "error" ? 4000 : 2200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, notify };
}
