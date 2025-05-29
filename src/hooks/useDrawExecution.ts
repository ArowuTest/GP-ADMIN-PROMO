// src/hooks/useDrawExecution.ts
import { useState, useCallback } from 'react';
import { drawService } from '../services/drawService';
import { DrawExecutionResponse, WinnerResponse } from '../types/api';
import { UUID, PaymentStatus } from '../types/common';

/**
 * Custom hook for draw execution functionality
 */
export const useDrawExecution = () => {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [drawResult, setDrawResult] = useState<DrawExecutionResponse | null>(null);
  const [winners, setWinners] = useState<WinnerResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  /**
   * Execute a draw
   */
  const executeDraw = useCallback(async (
    drawDate: string, 
    prizeStructureId: UUID
  ): Promise<DrawExecutionResponse | null> => {
    setIsExecuting(true);
    setError(null);
    setProgress(0);
    
    try {
      // Use the progress callback to update UI during execution
      const result = await drawService.executeDraw(
        drawDate, 
        prizeStructureId,
        (progressValue) => setProgress(progressValue)
      );
      
      setDrawResult(result);
      
      // Fetch winners and runner-ups for the draw
      const drawWinners = await drawService.getDrawWinners(result.id);
      setWinners(drawWinners);
      
      return result;
    } catch (err: unknown) {
      console.error('Error executing draw:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to execute draw due to an unknown error');
      }
      
      return null;
    } finally {
      setIsExecuting(false);
      setProgress(100); // Ensure progress is complete even on error
    }
  }, []);

  /**
   * Get winners and runner-ups for a specific draw
   */
  const getDrawWinners = useCallback(async (drawId: UUID): Promise<WinnerResponse[]> => {
    setError(null);
    
    try {
      const winners = await drawService.getDrawWinners(drawId);
      setWinners(winners);
      return winners;
    } catch (err: unknown) {
      console.error('Error fetching draw winners:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch draw winners');
      }
      
      return [];
    }
  }, []);

  /**
   * Invoke a runner-up for a winner
   */
  const invokeRunnerUp = useCallback(async (winnerId: UUID): Promise<boolean> => {
    setError(null);
    
    try {
      await drawService.invokeRunnerUp(winnerId);
      
      // Refresh winners list if we have a draw result
      if (drawResult) {
        const updatedWinners = await drawService.getDrawWinners(drawResult.id);
        setWinners(updatedWinners);
      }
      
      return true;
    } catch (err: unknown) {
      console.error('Error invoking runner-up:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to invoke runner-up');
      }
      
      return false;
    }
  }, [drawResult]);

  /**
   * Update winner payment status
   */
  const updateWinnerPaymentStatus = useCallback(async (
    winnerId: UUID, 
    status: PaymentStatus, 
    ref?: string, 
    notes?: string
  ): Promise<boolean> => {
    setError(null);
    
    try {
      await drawService.updateWinnerPaymentStatus(winnerId, status, ref, notes);
      
      // Refresh winners list if we have a draw result
      if (drawResult) {
        const updatedWinners = await drawService.getDrawWinners(drawResult.id);
        setWinners(updatedWinners);
      }
      
      return true;
    } catch (err: unknown) {
      console.error('Error updating payment status:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update payment status');
      }
      
      return false;
    }
  }, [drawResult]);

  /**
   * Reset draw state
   */
  const resetDrawState = useCallback(() => {
    setDrawResult(null);
    setWinners([]);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isExecuting,
    drawResult,
    winners,
    error,
    progress,
    executeDraw,
    getDrawWinners,
    invokeRunnerUp,
    updateWinnerPaymentStatus,
    resetDrawState
  };
};

export default useDrawExecution;
