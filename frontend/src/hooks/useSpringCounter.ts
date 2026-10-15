import { useState, useEffect, useRef } from 'react';

/**
 * 60fps Spring Counter Hook
 * Animates a number from its previous value to targetValue using
 * a cubic ease-out spring.
 *
 * @param targetValue  The final number to count to
 * @param duration     Animation duration in ms (default 800)
 */
export function useSpringCounter(targetValue: number, duration: number = 800): number {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const targetRef = useRef(targetValue);

  useEffect(() => {
    startValueRef.current = displayValue;
    targetRef.current = targetValue;
    startTimeRef.current = null;

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out spring
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(
        startValueRef.current + (targetRef.current - startValueRef.current) * ease
      );

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetRef.current);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return displayValue;
}
