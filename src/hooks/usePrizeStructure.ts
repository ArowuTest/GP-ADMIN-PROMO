// src/hooks/usePrizeStructure.ts
import { useState, useCallback } from 'react';
import { prizeService } from '../services/prizeService';
import { PrizeStructureResponse, PrizeStructureCreateRequest, PrizeStructureUpdateRequest } from '../types/api';
import { UUID } from '../types/common';

/**
 * Custom hook for prize structure management functionality
 */
export const usePrizeStructure = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureResponse[]>([]);
  const [selectedPrizeStructure, setSelectedPrizeStructure] = useState<PrizeStructureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all prize structures
   */
  const loadPrizeStructures = useCallback(async (day?: number): Promise<PrizeStructureResponse[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const structures = await prizeService.getAllPrizeStructures(day?.toString());
      setPrizeStructures(structures);
      return structures;
    } catch (err: any) {
      console.error('Error loading prize structures:', err);
      setError(err.message || 'Failed to load prize structures');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load prize structure by ID
   */
  const loadPrizeStructureById = useCallback(async (id: UUID): Promise<PrizeStructureResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const structure = await prizeService.getPrizeStructureById(id);
      setSelectedPrizeStructure(structure);
      return structure;
    } catch (err: any) {
      console.error('Error loading prize structure:', err);
      setError(err.message || 'Failed to load prize structure');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new prize structure
   */
  const createPrizeStructure = useCallback(async (data: PrizeStructureCreateRequest): Promise<PrizeStructureResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newStructure = await prizeService.createPrizeStructure(data);
      
      // Update prize structures list
      setPrizeStructures(prev => [...prev, newStructure]);
      
      return newStructure;
    } catch (err: any) {
      console.error('Error creating prize structure:', err);
      setError(err.message || 'Failed to create prize structure');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update prize structure
   */
  const updatePrizeStructure = useCallback(async (id: UUID, data: PrizeStructureUpdateRequest): Promise<PrizeStructureResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedStructure = await prizeService.updatePrizeStructure(id, data);
      
      // Update prize structures list
      setPrizeStructures(prev => 
        prev.map(structure => 
          structure.id === updatedStructure.id ? updatedStructure : structure
        )
      );
      
      // Update selected prize structure if it's the one being updated
      if (selectedPrizeStructure && selectedPrizeStructure.id === updatedStructure.id) {
        setSelectedPrizeStructure(updatedStructure);
      }
      
      return updatedStructure;
    } catch (err: any) {
      console.error('Error updating prize structure:', err);
      setError(err.message || 'Failed to update prize structure');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPrizeStructure]);

  /**
   * Delete prize structure
   */
  const deletePrizeStructure = useCallback(async (id: UUID): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await prizeService.deletePrizeStructure(id);
      
      // Update prize structures list
      setPrizeStructures(prev => prev.filter(structure => structure.id !== id));
      
      // Clear selected prize structure if it's the one being deleted
      if (selectedPrizeStructure && selectedPrizeStructure.id === id) {
        setSelectedPrizeStructure(null);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error deleting prize structure:', err);
      setError(err.message || 'Failed to delete prize structure');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPrizeStructure]);

  /**
   * Check if a prize structure is valid for a specific date
   */
  const validatePrizeStructureForDate = useCallback(async (prizeStructureId: UUID, date: string): Promise<boolean> => {
    setError(null);
    
    try {
      return await prizeService.isPrizeStructureValidForDate(prizeStructureId, date);
    } catch (err: any) {
      console.error('Error validating prize structure:', err);
      setError(err.message || 'Failed to validate prize structure');
      return false;
    }
  }, []);

  return {
    isLoading,
    prizeStructures,
    selectedPrizeStructure,
    error,
    loadPrizeStructures,
    loadPrizeStructureById,
    createPrizeStructure,
    updatePrizeStructure,
    deletePrizeStructure,
    validatePrizeStructureForDate
  };
};

export default usePrizeStructure;
