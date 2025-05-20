import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { prizeStructureService, type CreatePrizeStructurePayload, type PrizeTierPayload } from '../../services/prizeStructureService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define DayOfWeek type directly here to avoid circular import
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

// Define types for prize structure form - updated to use camelCase
interface PrizeTier {
  id?: string;
  name: string;
  prizeType: string; // Changed from snake_case to camelCase
  value: string;
  quantity: number;
  order: number;
  numberOfRunnerUps: number; // Changed from snake_case to camelCase
}

interface PrizeStructureFormData {
  name: string;
  description: string;
  isActive: boolean; // Changed from snake_case to camelCase
  validFrom: string; // Changed from snake_case to camelCase
  validTo?: string; // Changed from snake_case to camelCase
  applicableDays: DayOfWeek[]; // Changed from snake_case to camelCase
  prizes: PrizeTier[];
}

// Helper function to convert component data to service payload - updated to use camelCase
const convertComponentToServicePayload = (data: PrizeStructureFormData): CreatePrizeStructurePayload => {
  return {
    name: data.name,
    description: data.description,
    isActive: data.isActive, // Changed from snake_case to camelCase
    validFrom: data.validFrom, // Changed from snake_case to camelCase
    validTo: data.validTo, // Changed from snake_case to camelCase
    applicableDays: data.applicableDays, // Changed from snake_case to camelCase
    prizes: data.prizes.map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prizeType, // Changed from snake_case to camelCase
      value: prize.value,
      quantity: prize.quantity,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps // Changed from snake_case to camelCase
    }))
  };
};

const PrizeStructureListComponent: React.FC = () => {
  const { token } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingStructureId, setEditingStructureId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PrizeStructureFormData>({
    name: '',
    description: '',
    isActive: true, // Changed from snake_case to camelCase
    validFrom: new Date().toISOString().split('T')[0], // Changed from snake_case to camelCase
    validTo: undefined, // Changed from snake_case to camelCase
    applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Changed from snake_case to camelCase
    prizes: []
  });

  // Fetch prize structures on component mount
  useEffect(() => {
    fetchPrizeStructures();
  }, [token]);

  const fetchPrizeStructures = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await prizeStructureService.listPrizeStructures(token || "");
      setPrizeStructures(data);
    } catch (err) {
      console.error('Error fetching prize structures:', err);
      setError('Failed to load prize structures. Please try again later.');
      toast.error('Failed to load prize structures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrizeStructure = async () => {
    try {
      const payload = convertComponentToServicePayload(formData);
      await prizeStructureService.createPrizeStructure(payload, token || "");
      toast.success('Prize structure created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchPrizeStructures();
    } catch (err) {
      console.error('Error creating prize structure:', err);
      toast.error('Failed to create prize structure');
    }
  };

  const handleUpdatePrizeStructure = async () => {
    if (!editingStructureId) return;
    
    try {
      const payload = convertComponentToServicePayload(formData);
      await prizeStructureService.updatePrizeStructure(editingStructureId, payload, token || "");
      toast.success('Prize structure updated successfully');
      setEditingStructureId(null);
      resetForm();
      fetchPrizeStructures();
    } catch (err) {
      console.error('Error updating prize structure:', err);
      toast.error('Failed to update prize structure');
    }
  };

  const handleDeletePrizeStructure = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prize structure?')) {
      return;
    }
    
    try {
      await prizeStructureService.deletePrizeStructure(id, token || "");
      toast.success('Prize structure deleted successfully');
      fetchPrizeStructures();
    } catch (err) {
      console.error('Error deleting prize structure:', err);
      toast.error('Failed to delete prize structure');
    }
  };

  const handleEditPrizeStructure = (structure: any) => {
    // Convert backend response to form data format
    setFormData({
      name: structure.name,
      description: structure.description,
      isActive: structure.isActive, // Already camelCase from backend
      validFrom: structure.validFrom, // Already camelCase from backend
      validTo: structure.validTo || undefined, // Already camelCase from backend
      applicableDays: structure.applicableDays || [], // Already camelCase from backend
      prizes: structure.prizes.map((prize: any) => ({
        id: prize.id,
        name: prize.name,
        prizeType: prize.prizeType, // Already camelCase from backend
        value: prize.value,
        quantity: prize.quantity,
        order: prize.order || 1,
        numberOfRunnerUps: prize.numberOfRunnerUps // Already camelCase from backend
      }))
    });
    setEditingStructureId(structure.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true, // Changed from snake_case to camelCase
      validFrom: new Date().toISOString().split('T')[0], // Changed from snake_case to camelCase
      validTo: undefined, // Changed from snake_case to camelCase
      applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Changed from snake_case to camelCase
      prizes: []
    });
  };

  const handleAddPrizeTier = () => {
    setFormData({
      ...formData,
      prizes: [
        ...formData.prizes,
        {
          name: '',
          prizeType: 'Cash', // Changed from snake_case to camelCase
          value: '',
          quantity: 1,
          order: formData.prizes.length + 1,
          numberOfRunnerUps: 1 // Changed from snake_case to camelCase
        }
      ]
    });
  };

  const handleRemovePrizeTier = (index: number) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes.splice(index, 1);
    setFormData({
      ...formData,
      prizes: updatedPrizes
    });
  };

  const handlePrizeTierChange = (index: number, field: keyof PrizeTier, value: any) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes[index] = {
      ...updatedPrizes[index],
      [field]: value
    };
    setFormData({
      ...formData,
      prizes: updatedPrizes
    });
  };

  const handleDayToggle = (day: DayOfWeek) => {
    const updatedDays = formData.applicableDays.includes(day) // Changed from snake_case to camelCase
      ? formData.applicableDays.filter(d => d !== day) // Changed from snake_case to camelCase
      : [...formData.applicableDays, day]; // Changed from snake_case to camelCase
    
    setFormData({
      ...formData,
      applicableDays: updatedDays // Changed from snake_case to camelCase
    });
  };

  if (loading) {
    return <div>Loading prize structures...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="prize-structure-list-container">
      <h2>Prize Structures</h2>
      
      {!showCreateForm && !editingStructureId && (
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-button"
        >
          Create New Prize Structure
        </button>
      )}
      
      {(showCreateForm || editingStructureId) && (
        <div className="prize-structure-form">
          <h3>{editingStructureId ? 'Edit Prize Structure' : 'Create New Prize Structure'}</h3>
          
          <div className="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Active:</label>
            <input 
              type="checkbox" 
              checked={formData.isActive} // Changed from snake_case to camelCase
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})} // Changed from snake_case to camelCase
            />
          </div>
          
          <div className="form-group">
            <label>Valid From:</label>
            <input 
              type="date" 
              value={formData.validFrom} // Changed from snake_case to camelCase
              onChange={(e) => setFormData({...formData, validFrom: e.target.value})} // Changed from snake_case to camelCase
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Valid To (optional):</label>
            <input 
              type="date" 
              value={formData.validTo || ''} // Changed from snake_case to camelCase
              onChange={(e) => setFormData({...formData, validTo: e.target.value || undefined})} // Changed from snake_case to camelCase
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Applicable Days:</label>
            <div className="days-checkboxes">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <label key={day} className="day-checkbox">
                  <input 
                    type="checkbox" 
                    checked={formData.applicableDays.includes(day as DayOfWeek)} // Changed from snake_case to camelCase
                    onChange={() => handleDayToggle(day as DayOfWeek)} 
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          
          <h4>Prize Tiers</h4>
          {formData.prizes.map((prize, index) => (
            <div key={index} className="prize-tier-form">
              <h5>Prize Tier {index + 1}</h5>
              
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  value={prize.name} 
                  onChange={(e) => handlePrizeTierChange(index, 'name', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Type:</label>
                <select 
                  value={prize.prizeType} // Changed from snake_case to camelCase
                  onChange={(e) => handlePrizeTierChange(index, 'prizeType', e.target.value)} // Changed from snake_case to camelCase
                  className="form-control"
                >
                  <option value="Cash">Cash</option>
                  <option value="Item">Item</option>
                  <option value="Service">Service</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Value:</label>
                <input 
                  type="text" 
                  value={prize.value} 
                  onChange={(e) => handlePrizeTierChange(index, 'value', e.target.value)}
                  className="form-control"
                  placeholder="e.g., N100,000"
                />
              </div>
              
              <div className="form-group">
                <label>Quantity:</label>
                <input 
                  type="number" 
                  value={prize.quantity} 
                  onChange={(e) => handlePrizeTierChange(index, 'quantity', parseInt(e.target.value))}
                  className="form-control"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Number of Runner-ups:</label>
                <input 
                  type="number" 
                  value={prize.numberOfRunnerUps} // Changed from snake_case to camelCase
                  onChange={(e) => handlePrizeTierChange(index, 'numberOfRunnerUps', parseInt(e.target.value))} // Changed from snake_case to camelCase
                  className="form-control"
                  min="0"
                />
              </div>
              
              <button 
                onClick={() => handleRemovePrizeTier(index)}
                className="remove-tier-button"
              >
                Remove Tier
              </button>
            </div>
          ))}
          
          <button 
            onClick={handleAddPrizeTier}
            className="add-tier-button"
          >
            Add Prize Tier
          </button>
          
          <div className="form-actions">
            <button 
              onClick={editingStructureId ? handleUpdatePrizeStructure : handleCreatePrizeStructure}
              className="save-button"
              disabled={formData.prizes.length === 0 || !formData.name}
            >
              {editingStructureId ? 'Update' : 'Create'}
            </button>
            
            <button 
              onClick={() => {
                setShowCreateForm(false);
                setEditingStructureId(null);
                resetForm();
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {!showCreateForm && !editingStructureId && prizeStructures.length > 0 && (
        <table className="prize-structures-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Valid Period</th>
              <th>Prize Tiers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prizeStructures.map((structure) => (
              <tr key={structure.id}>
                <td>{structure.name}</td>
                <td>{structure.description}</td>
                <td>{structure.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  {new Date(structure.validFrom).toLocaleDateString()}
                  {structure.validTo && ` - ${new Date(structure.validTo).toLocaleDateString()}`}
                </td>
                <td>{structure.prizes?.length || 0} tiers</td>
                <td>
                  <button 
                    onClick={() => handleEditPrizeStructure(structure)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePrizeStructure(structure.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {!showCreateForm && !editingStructureId && prizeStructures.length === 0 && (
        <p>No prize structures found. Create one to get started.</p>
      )}
      
      <style>
        {`
        .prize-structure-list-container {
          padding: 20px;
        }
        
        .create-button {
          margin-bottom: 20px;
          padding: 10px 15px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .prize-structures-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .prize-structures-table th,
        .prize-structures-table td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        
        .prize-structures-table th {
          background-color: #f5f5f5;
        }
        
        .edit-button,
        .delete-button {
          margin-right: 5px;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .edit-button {
          background-color: #1890ff;
          color: white;
        }
        
        .delete-button {
          background-color: #ff4d4f;
          color: white;
        }
        
        .prize-structure-form {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .days-checkboxes {
          display: flex;
          flex-wrap: wrap;
        }
        
        .day-checkbox {
          margin-right: 15px;
          margin-bottom: 5px;
        }
        
        .prize-tier-form {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .add-tier-button,
        .remove-tier-button {
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .add-tier-button {
          background-color: #52c41a;
          color: white;
          margin-bottom: 20px;
        }
        
        .remove-tier-button {
          background-color: #ff4d4f;
          color: white;
        }
        
        .form-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        
        .save-button,
        .cancel-button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .save-button {
          background-color: #1890ff;
          color: white;
        }
        
        .save-button:disabled {
          background-color: #d9d9d9;
          cursor: not-allowed;
        }
        
        .cancel-button {
          background-color: #f5f5f5;
          border: 1px solid #d9d9d9;
        }
        
        .error-message {
          color: #ff4d4f;
          padding: 10px;
          border: 1px solid #ff4d4f;
          border-radius: 4px;
          background-color: #fff1f0;
          margin-bottom: 20px;
        }
        `}
      </style>
    </div>
  );
};

export default PrizeStructureListComponent;
