// src/components/PrizeManagement/PrizeStructureForm.tsx
import React, { useState, useEffect } from 'react';
import type { PrizeStructureData, PrizeTierData, DayOfWeek } from './PrizeStructureListComponent';

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
      setPrizeTiers(initialData.prizeTiers.map(p => ({ 
        name: p.name, 
        value: p.value, 
        quantity: p.quantity, 
        prizeType: p.prizeType || 'Cash', 
        order: p.order || 0,
        numberOfRunnerUps: p.numberOfRunnerUps || 0
      })));
      setApplicableDays(initialData.applicableDays || []);
      setValidFrom(initialData.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setValidTo(initialData.validTo ? new Date(initialData.validTo).toISOString().split('T')[0] : null);
    } else {
      setName('');
      setDescription('');
      setIsActive(true);
      setPrizeTiers([{ name: '', value: '', quantity: 1, prizeType: 'Cash', order: 0, numberOfRunnerUps: 1 }]);
      setApplicableDays([]);
      setValidFrom(new Date().toISOString().split('T')[0]);
      setValidTo(null);
    }
  }, [initialData, isOpen]);

  const handleTierChange = (index: number, field: keyof Omit<PrizeTierData, 'id'>, value: string | number) => {
    const updatedTiers = [...prizeTiers];
    let numericValue = 0;
    if (typeof value === 'string') {
      numericValue = parseInt(value, 10);
      if (isNaN(numericValue)) numericValue = 0; // Default to 0 if parsing fails
    }
    if (typeof value === 'number') {
        numericValue = value;
    }

    if (field === 'quantity' || field === 'order' || field === 'numberOfRunnerUps') {
      updatedTiers[index] = { ...updatedTiers[index], [field]: numericValue };
      if (field === 'numberOfRunnerUps' && updatedTiers[index].numberOfRunnerUps < 0) {
        updatedTiers[index].numberOfRunnerUps = 0;
      }
      if (field === 'quantity' && updatedTiers[index].quantity < 1) {
        updatedTiers[index].quantity = 1;
      }
    } else {
      updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    }
    setPrizeTiers(updatedTiers);
  };

  const addTier = () => {
    setPrizeTiers([...prizeTiers, { name: '', value: '', quantity: 1, prizeType: 'Cash', order: prizeTiers.length, numberOfRunnerUps: 1 }]);
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
      prizeTiers: prizeTiers.map(pt => ({ 
          name: pt.name, 
          value: pt.value, 
          quantity: pt.quantity, 
          prizeType: pt.prizeType, 
          order: pt.order,
          numberOfRunnerUps: pt.numberOfRunnerUps ?? 1, // Ensure it's a number, default to 1 if undefined
        })),
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
        <h2 style={headerStyle}>{initialData ? 'Edit' : 'Add New'} Prize Structure</h2>
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Structure Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={inputStyle}
              placeholder="Enter prize structure name"
            />
          </div>
          
          <div style={formGroupStyle}>
            <label style={labelStyle}>Description:</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              style={inputStyle}
              placeholder="Enter optional description"
            />
          </div>
          
          <div style={formRowStyle}>
            <div style={formGroupHalfStyle}>
              <label style={labelStyle}>Valid From:</label>
              <input 
                type="date" 
                value={validFrom} 
                onChange={(e) => setValidFrom(e.target.value)} 
                required 
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupHalfStyle}>
              <label style={labelStyle}>Valid To (Optional):</label>
              <input 
                type="date" 
                value={validTo || ''} 
                onChange={(e) => setValidTo(e.target.value || null)} 
                style={inputStyle}
              />
            </div>
          </div>
          
          <div style={formGroupStyle}>
            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                style={checkboxStyle}
              />
              Is Active (Available for draws)
            </label>
          </div>
          
          <div style={sectionStyle}>
            <h3 style={subheaderStyle}>Applicable Days of Week:</h3>
            <p style={helperTextStyle}>Select which days of the week this prize structure applies to</p>
            <div style={daysSelectionStyle}>
              {allDays.map(day => (
                <label key={day} style={dayLabelStyle}>
                  <input 
                    type="checkbox" 
                    checked={applicableDays.includes(day)} 
                    onChange={() => handleDayToggle(day)} 
                    style={checkboxStyle}
                  /> 
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={subheaderStyle}>Prize Tiers</h3>
            <p style={helperTextStyle}>Define the prizes available in this structure</p>
            
            <div style={tierHeaderStyle}>
              <div style={{...tierColumnStyle, flex: 2}}>Tier Name</div>
              <div style={{...tierColumnStyle, flex: 2}}>Display Value</div>
              <div style={{...tierColumnStyle, flex: 1}}>Quantity</div>
              <div style={{...tierColumnStyle, flex: 1}}>Type</div>
              <div style={{...tierColumnStyle, flex: 1}}>Order</div>
              <div style={{...tierColumnStyle, flex: 1}}>Runner-ups</div>
              <div style={{width: '40px'}}></div>
            </div>
            
            {prizeTiers.map((tier, index) => (
              <div key={index} style={tierStyle}>
                <input 
                  type="text" 
                  value={tier.name} 
                  onChange={(e) => handleTierChange(index, 'name', e.target.value)} 
                  required 
                  style={{...tierInputStyle, flex: 2}}
                  placeholder="e.g., Jackpot"
                  title="Name of the prize tier (e.g., Jackpot, First Prize)"
                />
                <input 
                  type="text" 
                  value={tier.value} 
                  onChange={(e) => handleTierChange(index, 'value', e.target.value)} 
                  required 
                  style={{...tierInputStyle, flex: 2}}
                  placeholder="e.g., N1,000,000"
                  title="Display value shown to users (e.g., N1,000,000)"
                />
                <input 
                  type="number" 
                  value={tier.quantity} 
                  onChange={(e) => handleTierChange(index, 'quantity', e.target.value)} 
                  min="1" 
                  required 
                  style={{...tierInputStyle, flex: 1}}
                  placeholder="1"
                  title="Number of prizes available for this tier"
                />
                <select 
                  value={tier.prizeType} 
                  onChange={(e) => handleTierChange(index, 'prizeType', e.target.value)} 
                  style={{...tierInputStyle, flex: 1}}
                  title="Type of prize"
                >
                  <option value="Cash">Cash</option>
                  <option value="Airtime">Airtime</option>
                  <option value="Data">Data</option>
                  <option value="Physical">Physical</option>
                </select>
                <input 
                  type="number" 
                  value={tier.order} 
                  onChange={(e) => handleTierChange(index, 'order', e.target.value)} 
                  min="0" 
                  style={{...tierInputStyle, flex: 1}}
                  placeholder="0"
                  title="Display order (0 = highest/first)"
                />
                <input 
                  type="number" 
                  value={tier.numberOfRunnerUps} 
                  onChange={(e) => handleTierChange(index, 'numberOfRunnerUps', e.target.value)} 
                  min="0" 
                  required 
                  style={{...tierInputStyle, flex: 1}}
                  placeholder="0"
                  title="Number of runner-up winners for this tier"
                />
                <button 
                  type="button" 
                  onClick={() => removeTier(index)} 
                  style={removeButtonStyle}
                  title="Remove this tier"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addTier} 
              style={addTierButtonStyle}
            >
              + Add Prize Tier
            </button>
          </div>
          
          <div style={formActionsStyle}>
            <button type="submit" style={submitButtonStyle}>
              {initialData ? 'Save Changes' : 'Create Structure'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              style={cancelButtonStyle}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Improved styles with better spacing and organization
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1050,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '8px',
  width: '900px', // Increased from 700px
  maxWidth: '95%',
  maxHeight: '95vh',
  overflowY: 'auto',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
};

const headerStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '20px',
  color: '#333',
  borderBottom: '1px solid #eee',
  paddingBottom: '10px'
};

const subheaderStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '10px',
  color: '#444',
  fontSize: '18px'
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
};

const formRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  marginBottom: '20px',
};

const formGroupHalfStyle: React.CSSProperties = {
  flex: 1,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
  color: '#555',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontWeight: 'bold',
  color: '#555',
  cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
  marginRight: '8px',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '16px',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '30px',
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #eee',
};

const helperTextStyle: React.CSSProperties = {
  margin: '0 0 15px 0',
  color: '#666',
  fontSize: '14px',
};

const daysSelectionStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '15px',
};

const dayLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '8px 12px',
  backgroundColor: '#fff',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontWeight: 'bold',
};

const tierHeaderStyle: React.CSSProperties = {
  display: 'flex',
  marginBottom: '10px',
  padding: '0 5px',
  gap: '5px',
  alignItems: 'center',
};

const tierColumnStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#555',
};

const tierStyle: React.CSSProperties = {
  display: 'flex',
  marginBottom: '15px',
  gap: '5px',
  alignItems: 'center',
  backgroundColor: '#fff',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ddd',
};

const tierInputStyle: React.CSSProperties = {
  padding: '8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
};

const removeButtonStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ff4d4f',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
};

const addTierButtonStyle: React.CSSProperties = {
  padding: '10px 15px',
  backgroundColor: '#52c41a',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  marginTop: '10px',
};

const formActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '20px',
};

const submitButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#1890ff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#f5f5f5',
  color: '#333',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
};

export default PrizeStructureForm;
