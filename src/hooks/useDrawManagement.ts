// src/hooks/useDrawManagement.ts
import { useState, useCallback } from 'react';
import { drawService } from '../services/drawService';
import { useDrawExecution } from './useDrawExecution';
import { EligibilityStatsResponse } from '../types/api';
import { UUID } from '../types/common';

/**
 * Custom hook for draw management functionality
 */
export const useDrawManagement = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPrizeStructureId, setSelectedPrizeStructureId] = useState<UUID | null>(null);
  const [eligibilityStats, setEligibilityStats] = useState<EligibilityStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [isValidatingPrizeStructure, setIsValidatingPrizeStructure] = useState<boolean>(false);
  const [isPrizeStructureValid, setIsPrizeStructureValid] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  const {
    isExecuting: isExecutingDraw,
    drawResult,
    winners,
    executeDraw,
    invokeRunnerUp,
    updateWinnerPaymentStatus,
    resetDrawState
  } = useDrawExecution();
  
  /**
   * Handle date selection
   */
  const handleDateSelection = useCallback(async (date: string) => {
    setSelectedDate(date);
    setSelectedPrizeStructureId(null);
    setIsPrizeStructureValid(undefined);
    setError(null);
    
    try {
      setIsLoadingStats(true);
      const stats = await drawService.getEligibilityStats(date);
      setEligibilityStats(stats);
    } catch (err: unknown) {
      console.error('Error loading eligibility stats:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load eligibility statistics');
      }
      
      setEligibilityStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);
  
  /**
   * Handle prize structure selection
   */
  const handlePrizeStructureSelection = useCallback(async (prizeStructureId: UUID) => {
    setSelectedPrizeStructureId(prizeStructureId);
    setError(null);
    
    if (!selectedDate) {
      setIsPrizeStructureValid(false);
      return;
    }
    
    try {
      setIsValidatingPrizeStructure(true);
      
      // Validate prize structure for selected date by checking if it's active
      // and valid for the selected date
      const isValid = await drawService.validatePrizeStructureForDate(prizeStructureId, selectedDate);
      
      setIsPrizeStructureValid(isValid);
    } catch (err: unknown) {
      console.error('Error validating prize structure:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to validate prize structure');
      }
      
      setIsPrizeStructureValid(false);
    } finally {
      setIsValidatingPrizeStructure(false);
    }
  }, [selectedDate]);
  
  /**
   * Execute draw
   */
  const handleExecuteDraw = useCallback(async () => {
    if (!selectedDate || !selectedPrizeStructureId || !isPrizeStructureValid) {
      setError('Cannot execute draw: Invalid configuration');
      return null;
    }
    
    try {
      return await executeDraw(selectedDate, selectedPrizeStructureId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Draw execution failed: ${err.message}`);
      } else {
        setError('Draw execution failed due to an unknown error');
      }
      return null;
    }
  }, [selectedDate, selectedPrizeStructureId, isPrizeStructureValid, executeDraw]);
  
  return {
    selectedDate,
    selectedPrizeStructureId,
    eligibilityStats,
    isLoadingStats,
    isValidatingPrizeStructure,
    isPrizeStructureValid,
    isExecutingDraw,
    drawResult,
    winners,
    error,
    handleDateSelection,
    handlePrizeStructureSelection,
    executeDraw: handleExecuteDraw,
    invokeRunnerUp,
    updateWinnerPaymentStatus,
    resetDrawState
  };
};

export default useDrawManagement;
