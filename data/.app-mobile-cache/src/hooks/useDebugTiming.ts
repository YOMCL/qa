import { useCallback, useRef, useState } from 'react';

type TimingData = {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: string;
};

type DebugTimingReturn = {
  timings: TimingData[];
  startTiming: (operation: string) => void;
  endTiming: (operation: string, success?: boolean, error?: string) => void;
  clearTimings: () => void;
  getTimingSummary: () => string;
  getSlowestOperation: () => TimingData | null;
};

export const useDebugTiming = (): DebugTimingReturn => {
  const [timings, setTimings] = useState<TimingData[]>([]);
  const activeTimings = useRef<Map<string, number>>(new Map());

  const startTiming = useCallback((operation: string) => {
    const startTime = performance.now();
    activeTimings.current.set(operation, startTime);
    
    setTimings(prev => [...prev, {
      operation,
      startTime,
    }]);
  }, []);

  const endTiming = useCallback((operation: string, success: boolean = true, error?: string) => {
    const startTime = activeTimings.current.get(operation);
    if (!startTime) {
      console.warn(`⚠️ [DEBUG TIMING] No se encontró timing para: ${operation}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    activeTimings.current.delete(operation);
    
    setTimings(prev => prev.map(timing => 
      timing.operation === operation && !timing.endTime
        ? {
            ...timing,
            endTime,
            duration,
            success,
            error
          }
        : timing
    ));
    
    const status = success ? '✅' : '❌';
    const errorMsg = error ? ` - Error: ${error}` : '';
  }, []);

  const clearTimings = useCallback(() => {
    setTimings([]);
    activeTimings.current.clear();
  }, []);

  const getTimingSummary = useCallback(() => {
    const completedTimings = timings.filter(t => t.duration !== undefined);
    if (completedTimings.length === 0) return 'No hay timings completados';
    
    const totalTime = completedTimings.reduce((sum, t) => sum + (t.duration || 0), 0);
    const avgTime = totalTime / completedTimings.length;
    const slowest = completedTimings.reduce((slowest, current) => 
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );
    
    return `📊 Resumen: ${completedTimings.length} operaciones, Tiempo total: ${totalTime.toFixed(2)}ms, Promedio: ${avgTime.toFixed(2)}ms, Más lenta: ${slowest.operation} (${slowest.duration?.toFixed(2)}ms)`;
  }, [timings]);

  const getSlowestOperation = useCallback(() => {
    const completedTimings = timings.filter(t => t.duration !== undefined);
    if (completedTimings.length === 0) return null;
    
    return completedTimings.reduce((slowest, current) => 
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );
  }, [timings]);

  return {
    timings,
    startTiming,
    endTiming,
    clearTimings,
    getTimingSummary,
    getSlowestOperation,
  };
};
