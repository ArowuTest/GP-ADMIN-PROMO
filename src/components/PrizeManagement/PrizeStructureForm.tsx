// src/components/PrizeManagement/PrizeStructureForm.tsx
import React, { useState, useEffect } from 'react';
// Assuming PrizeTierData includes numberOfRunnerUps or we add it to the local extension of the type
import type { PrizeStructureData, PrizeTierData as ImportedPrizeTierData, DayOfWeek } from './PrizeStructureListComponent';

// Extend PrizeTierData to include numberOfRunnerUps if not already present in imported type
interface PrizeTierData extends ImportedPrizeTierData {
  numberOfRunnerUps?: number; // Optional, as older structures might not have it
}

interface PrizeStructureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (structure: Omit<PrizeStructureData, 'id' | 'createdAt'>) => void;
  initialData?: PrizeStructureData | null;
}

const allDays: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PrizeStructureForm: React.FC<PrizeStructureFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [prizeTiers, setPrizeTiers] = useState<Omit<PrizeTierData, 'id'>[]>([]);
  const [applicableDays, setApplicableDays] = useState<DayOfWeek[]>([]);
  const [validFrom, setValidFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
      setPrizeTiers(initialData.prizes.map(p => ({ 
        name: p.name, 
        value: p.value, 
        quantity: p.quantity, 
        prizeType: p.prizeType || 'Cash', 
        order: p.order || 0,
        valueNGN: p.valueNGN || 0,
        numberOfRunnerUps: p.numberOfRunnerUps === undefined ? 1 : p.numberOfRunnerUps, // Default to 1 if undefined
      })));
      setApplicableDays(initialData.applicableDays || []);
      setValidFrom(initialData.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setValidTo(initialData.validTo ? new Date(initialData.validTo).toISOString().split('T')[0] : null);
    } else {
      // Reset form for new entry
      setName('');
      setDescription('');
      setIsActive(true);
      setPrizeTiers([{ name: '', value: '', quantity: 1, prizeType: 'Cash', order: 0, valueNGN: 0, numberOfRunnerUps: 1 }]);
      setApplicableDays([]);
      setValidFrom(new Date().toISOString().split('T')[0]);
      setValidTo(null);
    }
  }, [initialData, isOpen]);

  const handleTierChange = (index: number, field: keyof Omit<PrizeTierData, 'id'>, value: string | number) => {
    const updatedTiers = [...prizeTiers];
    if (field === 'quantity' || field === 'order' || field === 'valueNGN' || field === 'numberOfRunnerUps') {
      updatedTiers[index] = { ...updatedTiers[index], [field]: parseInt(value as string, 10) || 0 };
      // Ensure numberOfRunnerUps is not negative
      if (field === 'numberOfRunnerUps' && (updatedTiers[index] as PrizeTierData).numberOfRunnerUps! < 0) {
        (updatedTiers[index] as PrizeTierData).numberOfRunnerUps = 0;
      }
    } else {
      updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    }
    setPrizeTiers(updatedTiers);
  };

  const addTier = () => {
    setPrizeTiers([...prizeTiers, { name: '', value: '', quantity: 1, prizeType: 'Cash', order: prizeTiers.length, valueNGN: 0, numberOfRunnerUps: 1 }]);
  };

  const removeTier = (index: number) => {
    setPrizeTiers(prizeTiers.filter((_, i) => i !== index));
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setApplicableDays(prevDays => 
      prevDays.includes(day) ? prevDays.filter(d => d !== day) : [...prevDays, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicableDays.length === 0) {
        alert("Please select at least one applicable day for the prize structure.");
        return;
    }
    const structureToSubmit: Omit<PrizeStructureData, 'id' | 'createdAt'> = {
      name,
      description,
      isActive,
      prizes: prizeTiers.map(pt => ({ ...pt, id: undefined, numberOfRunnerUps: (pt as PrizeTierData).numberOfRunnerUps === undefined ? 1 : (pt as PrizeTierData).numberOfRunnerUps })),
      applicableDays,
      validFrom: new Date(validFrom).toISOString(),
      validTo: validTo ? new Date(validTo).toISOString() : null,
    };
    onSubmit(structureToSubmit);
    onClose();
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
            <label>Valid From:</label>
            <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
          </div>
          <div>
            <label>Valid To (Optional):</label>
            <input type="date" value={validTo || ''} onChange={(e) => setValidTo(e.target.value || null)} />
          </div>
          <div>
            <label>Is Active:</label>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{verticalAlign: 'middle', marginLeft: '5px'}}/>
          </div>
          
          <h4>Applicable Days of Week:</h4>
          <div style={daysSelectionStyle}>
            {allDays.map(day => (
              <label key={day} style={dayLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={applicableDays.includes(day)} 
                  onChange={() => handleDayToggle(day)} 
                /> {day}
              </label>
            ))}
          </div>

          <h4>Prize Tiers</h4>
          {prizeTiers.map((tier, index) => (
            <div key={index} style={tierStyle}>
              <input type="text" placeholder="Tier Name" value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value)} required style={{flex:2}}/>
              <input type="text" placeholder="Display Value (e.g., N1000)" value={tier.value} onChange={(e) => handleTierChange(index, 'value', e.target.value)} required style={{flex:2}}/>
              <input type="number" placeholder="Actual Value (NGN)" value={(tier as PrizeTierData).valueNGN} onChange={(e) => handleTierChange(index, 'valueNGN', e.target.value)} min="0" required style={{flex:1}}/>
              <input type="number" placeholder="Qty" value={tier.quantity} onChange={(e) => handleTierChange(index, 'quantity', e.target.value)} min="1" required style={{flex:1}}/>
              <select value={tier.prizeType} onChange={(e) => handleTierChange(index, 'prizeType', e.target.value)} style={{flex:1}}>
                <option value="Cash">Cash</option>
                <option value="Airtime">Airtime</option>
                <option value="Data">Data</option>
                <option value="Physical">Physical Item</option>
              </select>
              <input type="number" placeholder="Order" value={tier.order} onChange={(e) => handleTierChange(index, 'order', e.target.value)} min="0" style={{flex:1}}/>
              <input type="number" placeholder="Runner-ups" value={(tier as PrizeTierData).numberOfRunnerUps === undefined ? 1 : (tier as PrizeTierData).numberOfRunnerUps} onChange={(e) => handleTierChange(index, 'numberOfRunnerUps', e.target.value)} min="0" title="Number of Runner-ups" required style={{flex:1}}/>
              <button type="button" onClick={() => removeTier(index)} style={{ marginLeft: '10px' }}>X</button>
            </div>
          ))}
          <button type="button" onClick={addTier} style={{ marginTop: '10px' }}>Add Tier</button>
          
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button type="submit" style={buttonStyle}>{initialData ? 'Save Changes' : 'Create Structure'}</button>
            <button type="button" onClick={onClose} style={{ ...buttonStyle, backgroundColor: '#6c757d', marginLeft: '10px' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050,
};
const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '700px', /* Increased width */ maxHeight: '90vh', 
  overflowY: 'auto', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
};
const tierStyle: React.CSSProperties = {
  display: 'flex', marginBottom: '10px', gap: '5px', /* Reduced gap */ alignItems: 'center',
};
const daysSelectionStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px'
};
const dayLabelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', cursor: 'pointer' 
};
const buttonStyle: React.CSSProperties = {
    padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white'
}

export default PrizeStructureForm;

