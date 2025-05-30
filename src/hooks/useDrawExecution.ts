// src/hooks/useDrawExecution.ts
import { useState, useCallback } from 'react';
import { drawService } from '../services/drawService';
import { DrawExecutionResponse, WinnerResponse } from '../types/api';
import { UUID, PaymentStatus, DrawStatus, WinnerStatus } from '../types/common';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for draw execution functionality
 */
export const useDrawExecution = () => {
  const { token } = useAuth();
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
    prizeStructureId: UUID,
    token: string
  ): Promise<DrawExecutionResponse | null> => {
    setIsExecuting(true);
    setError(null);
    setProgress(0);
    
    try {
      // Execute draw without progress callback
      const result = await drawService.executeDraw(
        drawDate, 
        prizeStructureId,
        token
      );
      
      // Convert DrawData to DrawExecutionResponse format
      const executionResponse: DrawExecutionResponse = {
        id: result.id,
        drawId: result.id, // Using the same ID for both fields
        drawDate: result.drawDate,
        status: result.status as DrawStatus, // Cast string to DrawStatus enum
        prizeStructure: result.prizeStructureId,
        prizeStructureName: result.prizeStructureName,
        winnersCount: result.winners ? result.winners.filter(w => !w.isRunnerUp).length : 0,
        runnerUpsCount: result.winners ? result.winners.filter(w => w.isRunnerUp).length : 0,
        executedAt: result.createdAt,
        winners: result.winners ? result.winners.filter(w => !w.isRunnerUp).map(w => ({
          id: w.id,
          msisdn: w.msisdn,
          maskedMsisdn: w.msisdn.substring(0, 3) + '****' + w.msisdn.substring(w.msisdn.length - 3),
          prizeTierId: w.prizeTierId,
          prizeName: w.prizeTierName,
          prizeValue: parseFloat(w.prizeValue),
          status: w.status as WinnerStatus, // Cast string to WinnerStatus enum
          isRunnerUp: false,
          paymentStatus: w.paymentStatus as PaymentStatus, // Cast string to PaymentStatus enum
          paymentRef: '',
          paymentNotes: w.paymentNotes || '',
          createdAt: w.createdAt,
          updatedAt: w.updatedAt
        })) : [],
        runnerUps: result.winners ? result.winners.filter(w => w.isRunnerUp).map(w => ({
          id: w.id,
          msisdn: w.msisdn,
          maskedMsisdn: w.msisdn.substring(0, 3) + '****' + w.msisdn.substring(w.msisdn.length - 3),
          prizeTierId: w.prizeTierId,
          prizeName: w.prizeTierName,
          prizeValue: parseFloat(w.prizeValue),
          status: w.status as WinnerStatus, // Cast string to WinnerStatus enum
          isRunnerUp: true,
          runnerUpRank: w.runnerUpRank,
          paymentStatus: w.paymentStatus as PaymentStatus, // Cast string to PaymentStatus enum
          paymentRef: '',
          paymentNotes: w.paymentNotes || '',
          createdAt: w.createdAt,
          updatedAt: w.updatedAt
        })) : []
      };
      
      setDrawResult(executionResponse);
      setProgress(100); // Set progress to complete after execution
      
      // Fetch winners and runner-ups for the draw
      // Fixed: Added token parameter to match service function signature
      const drawWinners = await drawService.getDrawWinners(result.id, token);
      setWinners(drawWinners);
      
      return executionResponse;
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
    
    if (!token) {
      setError('Authentication token not available');
      return [];
    }
    
    try {
      // Fixed: Added token parameter to match service function signature
      const winners = await drawService.getDrawWinners(drawId, token);
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
  }, [token]);

  /**
   * Invoke a runner-up for a winner
   */
  const invokeRunnerUp = useCallback(async (winnerId: UUID): Promise<boolean> => {
    setError(null);
    
    if (!token) {
      setError('Authentication token not available');
      return false;
    }
    
    try {
      // Fixed: Added token parameter to match service function signature
      await drawService.invokeRunnerUp(winnerId, token);
      
      // Refresh winners list if we have a draw result
      if (drawResult) {
        // Fixed: Added token parameter to match service function signature
        const updatedWinners = await drawService.getDrawWinners(drawResult.drawId, token);
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
  }, [drawResult, token]);

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
    
    if (!token) {
      setError('Authentication token not available');
      return false;
    }
    
    try {
      // Fixed: Pass all parameters correctly to match updated service function signature
      await drawService.updateWinnerPaymentStatus(winnerId, status.toString(), token, ref, notes);
      
      // Refresh winners list if we have a draw result
      if (drawResult) {
        // Fixed: Added token parameter to match service function signature
        const updatedWinners = await drawService.getDrawWinners(drawResult.drawId, token);
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
  }, [drawResult, token]);

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
