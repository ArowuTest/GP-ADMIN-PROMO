// src/components/DrawManagement/PrizeStructureSelector.tsx
import React, { useState, useEffect } from 'react';
import { Select, Spin, Empty, Alert } from 'antd';
import { PrizeStructureResponse } from '../../types/api';
import './PrizeStructureSelector.css';

interface PrizeStructureProps {
  prizeStructures: PrizeStructureResponse[];
  selectedPrizeStructureId?: string;
  onSelect: (prizeStructureId: string) => void;
  loading?: boolean;
  isValid?: boolean;
  validationMessage?: string;
  selectedDate?: string;
}

/**
 * Component for selecting prize structures
 */
const PrizeStructureSelector: React.FC<PrizeStructureProps> = ({
  prizeStructures,
  selectedPrizeStructureId,
  onSelect,
  loading = false,
  isValid,
  validationMessage,
  selectedDate
}) => {
  const [filteredStructures, setFilteredStructures] = useState<PrizeStructureResponse[]>([]);

  // Filter prize structures based on selected date
  useEffect(() => {
    if (selectedDate && prizeStructures.length > 0) {
      const date = new Date(selectedDate);
      
      // Filter structures that are valid for the selected date
      const filtered = prizeStructures.filter(structure => {
        const validFrom = new Date(structure.validFrom);
        const validTo = new Date(structure.validTo);
        return date >= validFrom && date <= validTo && structure.isActive;
      });
      
      setFilteredStructures(filtered);
    } else {
      setFilteredStructures(prizeStructures);
    }
  }, [selectedDate, prizeStructures]);

  // Handle selection change
  const handleChange = (value: string) => {
    onSelect(value);
  };

  // Render prize structure options
  const renderOptions = () => {
    return filteredStructures.map(structure => (
      <Select.Option key={structure.id} value={structure.id}>
        {structure.name} ({structure.prizes.length} prizes)
      </Select.Option>
    ));
  };

  return (
    <div className="prize-structure-selector-container">
      <div className="prize-structure-selector-header">
        <h3>Select Prize Structure</h3>
        {selectedDate && (
          <span className="prize-structure-selector-date">for {selectedDate}</span>
        )}
      </div>
      
      {loading ? (
        <div className="prize-structure-selector-loading">
          <Spin size="small" />
          <span>Loading prize structures...</span>
        </div>
      ) : filteredStructures.length > 0 ? (
        <>
          <Select
            placeholder="Select a prize structure"
            value={selectedPrizeStructureId}
            onChange={handleChange}
            className="prize-structure-selector"
            disabled={loading || filteredStructures.length === 0}
          >
            {renderOptions()}
          </Select>
          
          {isValid !== undefined && (
            <div className="prize-structure-validation">
              {isValid ? (
                <Alert
                  message="Valid prize structure for selected date"
                  type="success"
                  showIcon
                  className="prize-structure-validation-alert"
                />
              ) : (
                <Alert
                  message={validationMessage || "Invalid prize structure for selected date"}
                  type="error"
                  showIcon
                  className="prize-structure-validation-alert"
                />
              )}
            </div>
          )}
        </>
      ) : (
        <Empty 
          description={
            selectedDate 
              ? `No valid prize structures for ${selectedDate}` 
              : "No prize structures available"
          }
          className="prize-structure-selector-empty"
        />
      )}
    </div>
  );
};

export default PrizeStructureSelector;
