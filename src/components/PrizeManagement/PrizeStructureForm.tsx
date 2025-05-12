// src/components/PrizeManagement/PrizeStructureForm.tsx
import React, { useState, useEffect } from 'react';
import type { PrizeStructureData, PrizeTierData } from './PrizeStructureListComponent'; // Assuming types are exported

interface PrizeStructureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (structure: Omit<PrizeStructureData, 'id' | 'createdAt'>) => void;
  initialData?: PrizeStructureData | null;
}

const PrizeStructureForm: React.FC<PrizeStructureFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState(''); // Added description
  const [isActive, setIsActive] = useState(true);
  const [prizeTiers, setPrizeTiers] = useState<Omit<PrizeTierData, 'id'>[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
      setPrizeTiers(initialData.prizes.map(p => ({ name: p.name, value: p.value, quantity: p.quantity, prizeType: p.prizeType || 'Cash', order: p.order || 0 }))); // Added prizeType and order for consistency with backend model if needed
    } else {
      // Reset form for new entry
      setName('');
      setDescription('');
      setIsActive(true);
      setPrizeTiers([{ name: '', value: '', quantity: 1, prizeType: 'Cash', order: 0 }]);
    }
  }, [initialData, isOpen]);

  const handleTierChange = (index: number, field: keyof Omit<PrizeTierData, 'id'>, value: string | number) => {
    const updatedTiers = [...prizeTiers];
    // Ensure correct type for quantity
    if (field === 'quantity') {
      updatedTiers[index] = { ...updatedTiers[index], [field]: parseInt(value as string, 10) || 0 };
    } else {
      updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    }
    setPrizeTiers(updatedTiers);
  };

  const addTier = () => {
    setPrizeTiers([...prizeTiers, { name: '', value: '', quantity: 1, prizeType: 'Cash', order: prizeTiers.length }]);
  };

  const removeTier = (index: number) => {
    setPrizeTiers(prizeTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const structureToSubmit: Omit<PrizeStructureData, 'id' | 'createdAt'> = {
      name,
      description,
      isActive,
      prizes: prizeTiers.map(pt => ({ ...pt, id: undefined })),
      validFrom: new Date().toISOString(), // Mock validFrom for now
    };
    onSubmit(structureToSubmit);
    onClose(); // Close modal after submit
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3>{initialData ? 'Edit' : 'Add New'} Prize Structure</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label>Description:</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label>Is Active:</label>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </div>
          <h4>Prize Tiers</h4>
          {prizeTiers.map((tier, index) => (
            <div key={index} style={tierStyle}>
              <input 
                type="text" 
                placeholder="Tier Name" 
                value={tier.name} 
                onChange={(e) => handleTierChange(index, 'name', e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Value (e.g., N1000)" 
                value={tier.value} 
                onChange={(e) => handleTierChange(index, 'value', e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Quantity" 
                value={tier.quantity} 
                onChange={(e) => handleTierChange(index, 'quantity', parseInt(e.target.value, 10))} 
                min="1"
                required 
              />
              <button type="button" onClick={() => removeTier(index)} style={{ marginLeft: '10px' }}>Remove Tier</button>
            </div>
          ))}
          <button type="button" onClick={addTier} style={{ marginTop: '10px' }}>Add Tier</button>
          <div style={{ marginTop: '20px' }}>
            <button type="submit">{initialData ? 'Save Changes' : 'Create Structure'}</button>
            <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '5px',
  width: '500px',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const tierStyle: React.CSSProperties = {
  display: 'flex',
  marginBottom: '10px',
  gap: '10px',
  alignItems: 'center',
};

export default PrizeStructureForm;
