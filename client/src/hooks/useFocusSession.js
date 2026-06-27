import { useRef, useState, useCallback, useEffect } from 'react';
import { computePerception } from '../utils/perception';
import { useSessionStore } from '../store/sessionStore';

/**
 * Drives a real focus session measurement.
 *
 * Phases:
 *   idle       → nothing running
 *   running    → stopwatch is counting, but the elapsed time is HIDDEN from the
 *                user (you cannot measure perception if they can watch a clock)
 *   estimating → session stopped; waiting for the user's blind estimate
 *   done       → estimate submitted; measured perception result available
 *
 * The real elapsed time is tracked internally and only revealed after the
 * user commits their estimate.
 */
export const useFocusSession = () => {
  const startRef = useRef(null);
  const intervalRef = useRef(null);
  const actualRef = useRef(0);

  const [phase, setPhase] = useState('idle');
  // A coarse, deliberately non-numeric signal so the UI can animate without
  // revealing elapsed time. Increments roughly every few seconds.
  const [pulse, setPulse] = useState(0);
  const [result, setResult] = useState(null);

  const { startSession, endSession } = useSessionStore();

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const start = useCallback(async (context) => {
    setResult(null);
    actualRef.current = 0;
    startRef.current = Date.now();
    await startSession(context);
    setPhase('running');

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      actualRef.current = (Date.now() - startRef.current) / 1000;
      setPulse((p) => p + 1);
    }, 1000);
  }, [startSession]);

  // Stop the stopwatch and move to the estimate phase. Does NOT reveal the time.
  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    actualRef.current = (Date.now() - startRef.current) / 1000;
    setPhase('estimating');
  }, []);

  // Commit the user's blind estimate (in seconds) and finalise the session.
  const submitEstimate = useCallback(async (estimatedSeconds) => {
    const actualSeconds = Math.round(actualRef.current);
    const perception = computePerception(actualSeconds, estimatedSeconds);

    await endSession(actualSeconds, estimatedSeconds);

    const finalResult = { actualSeconds, estimatedSeconds, ...perception };
    setResult(finalResult);
    setPhase('done');
    return finalResult;
  }, [endSession]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    actualRef.current = 0;
    startRef.current = null;
    setPulse(0);
    setResult(null);
    setPhase('idle');
  }, []);

  return { phase, pulse, result, start, stop, submitEstimate, reset };
};
