// src/hooks/usePrizeStructure.ts
import { useState, useCallback } from 'react';
import { prizeService, PrizeStructureResponse as ServicePrizeStructureResponse, DayOfWeek } from '../services/prizeService';
import { PrizeStructureResponse, PrizeStructureCreateRequest, PrizeStructureUpdateRequest } from '../types/api';
import { UUID } from '../types/common';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for prize structure management functionality
 */
export const usePrizeStructure = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureResponse[]>([]);
  const [selectedPrizeStructure, setSelectedPrizeStructure] = useState<PrizeStructureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Map service prize structure response to frontend API type
   */
  const mapServiceResponseToApiType = (structure: ServicePrizeStructureResponse): PrizeStructureResponse => {
    return {
      id: structure.id,
      name: structure.name,
      description: structure.description,
      validFrom: structure.validFrom,
      validTo: structure.validTo || '',
      isActive: structure.isActive,
      prizes: structure.prizes.map(prize => ({
        id: prize.id,
        name: prize.name,
        description: prize.prizeType,
        value: parseFloat(prize.value),
        quantity: prize.quantity,
        numberOfRunnerUps: prize.numberOfRunnerUps,
        prizeStructureId: structure.id,
        createdAt: structure.createdAt,
        updatedAt: structure.updatedAt
      })),
      createdAt: structure.createdAt,
      updatedAt: structure.updatedAt,
      createdBy: structure.id, // Using structure.id as a fallback since createdBy is missing
      updatedBy: structure.id  // Using structure.id as a fallback since updatedBy is missing
    };
  };

  /**
   * Load all prize structures
   */
  const loadPrizeStructures = useCallback(async (day?: number): Promise<PrizeStructureResponse[]> => {
    setIsLoading(true);
    setError(null);
    
    if (!token) {
      setError('Authentication token not available');
      setIsLoading(false);
      return [];
    }
    
    try {
      // Fixed: Changed getAllPrizeStructures to listPrizeStructures and removed day parameter
      const serviceStructures = await prizeService.listPrizeStructures(token);
      
      // Map service response to frontend API type
      const mappedStructures = serviceStructures.map(mapServiceResponseToApiType);
      
      setPrizeStructures(mappedStructures);
      return mappedStructures;
    } catch (err: any) {
      console.error('Error loading prize structures:', err);
      setError(err.message || 'Failed to load prize structures');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Load prize structure by ID
   */
  const loadPrizeStructureById = useCallback(async (id: UUID): Promise<PrizeStructureResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    if (!token) {
      setError('Authentication token not available');
      setIsLoading(false);
      return null;
    }
    
    try {
      // Fixed: Changed getPrizeStructureById to getPrizeStructure and added token parameter
      const serviceStructure = await prizeService.getPrizeStructure(id, token);
      
      // Map service response to frontend API type
      const mappedStructure = mapServiceResponseToApiType(serviceStructure);
      
      setSelectedPrizeStructure(mappedStructure);
      return mappedStructure;
    } catch (err: any) {
      console.error('Error loading prize structure:', err);
      setError(err.message || 'Failed to load prize structure');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Create new prize structure
   */
  const createPrizeStructure = useCallback(async (data: PrizeStructureCreateRequest): Promise<PrizeStructureResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    if (!token) {
      setError('Authentication token not available');
      setIsLoading(false);
      return null;
    }
    
    try {
      // Convert API request to service payload format
      const servicePayload = {
        name: data.name,
        description: data.description,
        is_active: data.isActive,
        valid_from: data.validFrom,
        valid_to: data.validTo,
        prizes: data.prizes.map(prize => ({
          name: prize.name,
          prize_type: prize.description,
          value: prize.value.toString(),
          quantity: prize.quantity,
          order: 0, // Default value since it's not in the API type
          number_of_runner_ups: prize.numberOfRunnerUps
        })),
        // Fixed: Use proper DayOfWeek type for applicable_days
        applicable_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as DayOfWeek[]
      };
      
      // Fixed: Added token parameter
      const serviceStructure = await prizeService.createPrizeStructure(servicePayload, token);
      
      // Map service response to frontend API type
      const mappedStructure = mapServiceResponseToApiType(serviceStructure);
      
      // Update prize structures list
      setPrizeStructures(prev => [...prev, mappedStructure]);
      
      return mappedStructure;
    } catch (err: any) {
      console.error('Error creating prize structure:', err);
      setError(err.message || 'Failed to create prize structure');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Update prize structure
   */
  const updatePrizeStructure = useCallback(async (id: UUID, data: PrizeStructureUpdateRequest): Promise<PrizeStructureResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    if (!token) {
      setError('Authentication token not available');
      setIsLoading(false);
      return null;
    }
    
    try {
      // Convert API request to service payload format
      const servicePayload: any = {};
      
      if (data.name !== undefined) servicePayload.name = data.name;
      if (data.description !== undefined) servicePayload.description = data.description;
      if (data.isActive !== undefined) servicePayload.is_active = data.isActive;
      if (data.validFrom !== undefined) servicePayload.valid_from = data.validFrom;
      if (data.validTo !== undefined) servicePayload.valid_to = data.validTo;
      
      if (data.prizes) {
        servicePayload.prizes = data.prizes.map(prize => {
          const prizeTier: any = {
            name: prize.name,
            prize_type: prize.description || 'Cash',
            value: prize.value?.toString() || '0',
            quantity: prize.quantity || 0,
            order: 0, // Default value since it's not in the API type
            number_of_runner_ups: prize.numberOfRunnerUps || 0
          };
          
          if ('id' in prize) {
            prizeTier.id = prize.id;
          }
          
          return prizeTier;
        });
      }
      
      // Fixed: Added token parameter
      const serviceStructure = await prizeService.updatePrizeStructure(id, servicePayload, token);
      
      // Map service response to frontend API type
      const mappedStructure = mapServiceResponseToApiType(serviceStructure);
      
      // Update prize structures list
      setPrizeStructures(prev => 
        prev.map(structure => 
          structure.id === mappedStructure.id ? mappedStructure : structure
        )
      );
      
      // Update selected prize structure if it's the one being updated
      if (selectedPrizeStructure && selectedPrizeStructure.id === mappedStructure.id) {
        setSelectedPrizeStructure(mappedStructure);
      }
      
      return mappedStructure;
    } catch (err: any) {
      console.error('Error updating prize structure:', err);
      setError(err.message || 'Failed to update prize structure');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPrizeStructure, token]);

  /**
   * Delete prize structure
   */
  const deletePrizeStructure = useCallback(async (id: UUID): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    if (!token) {
      setError('Authentication token not available');
      setIsLoading(false);
      return false;
    }
    
    try {
      // Fixed: Added token parameter
      await prizeService.deletePrizeStructure(id, token);
      
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
  }, [selectedPrizeStructure, token]);

  /**
   * Check if a prize structure is valid for a specific date
   * Note: This function is not implemented in prizeService, so we'll implement a simple check here
   */
  const validatePrizeStructureForDate = useCallback(async (prizeStructureId: UUID, date: string): Promise<boolean> => {
    setError(null);
    
    if (!token) {
      setError('Authentication token not available');
      return false;
    }
    
    try {
      // Since isPrizeStructureValidForDate doesn't exist in prizeService,
      // we'll implement a simple check by getting the prize structure and validating the date
      const serviceStructure = await prizeService.getPrizeStructure(prizeStructureId, token);
      
      if (!serviceStructure.isActive) {
        return false;
      }
      
      const checkDate = new Date(date);
      const validFrom = new Date(serviceStructure.validFrom);
      const validTo = serviceStructure.validTo ? new Date(serviceStructure.validTo) : null;
      
      // Check if date is within valid range
      if (checkDate < validFrom) {
        return false;
      }
      
      if (validTo && checkDate > validTo) {
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Error validating prize structure:', err);
      setError(err.message || 'Failed to validate prize structure');
      return false;
    }
  }, [token]);

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
