import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { prizeStructureService, DayOfWeek } from '../../services/prizeStructureService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define types for prize structure form
interface PrizeTier {
  id?: string;
  name: string;
  prizeType: string;
  value: string;
  quantity: number;
  order: number;
  numberOfRunnerUps: number;
}

interface PrizeStructureFormData {
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string;
  validTo?: string;
  applicableDays: DayOfWeek[];
  prizes: PrizeTier[];
}

// Helper function to convert component data to service payload
const convertComponentToServicePayload = (data: PrizeStructureFormData) => {
  return {
    name: data.name,
    description: data.description,
    isActive: data.isActive,
    validFrom: data.validFrom,
    validTo: data.validTo,
    applicableDays: data.applicableDays,
    prizes: data.prizes.map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prizeType,
      value: prize.value,
      quantity: prize.quantity,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps
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
    isActive: true,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: undefined,
    applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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
      isActive: structure.isActive,
      validFrom: structure.validFrom,
      validTo: structure.validTo || undefined,
      applicableDays: structure.applicableDays || [],
      prizes: structure.prizes.map((prize: any) => ({
        id: prize.id,
        name: prize.name,
        prizeType: prize.prizeType,
        value: prize.value,
        quantity: prize.quantity,
        order: prize.order || 1,
        numberOfRunnerUps: prize.numberOfRunnerUps
      }))
    });
    setEditingStructureId(structure.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: undefined,
      applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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
          prizeType: 'Cash',
          value: '',
          quantity: 1,
          order: formData.prizes.length + 1,
          numberOfRunnerUps: 1
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
    const updatedDays = formData.applicableDays.includes(day)
      ? formData.applicableDays.filter(d => d !== day)
      : [...formData.applicableDays, day];
    
    setFormData({
      ...formData,
      applicableDays: updatedDays
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
              checked={formData.isActive} 
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            />
          </div>
          
          <div className="form-group">
            <label>Valid From:</label>
            <input 
              type="date" 
              value={formData.validFrom} 
              onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Valid To (optional):</label>
            <input 
              type="date" 
              value={formData.validTo || ''} 
              onChange={(e) => setFormData({...formData, validTo: e.target.value || undefined})}
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
                    checked={formData.applicableDays.includes(day as DayOfWeek)} 
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
                  value={prize.prizeType} 
                  onChange={(e) => handlePrizeTierChange(index, 'prizeType', e.target.value)}
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
                  value={prize.numberOfRunnerUps} 
                  onChange={(e) => handlePrizeTierChange(index, 'numberOfRunnerUps', parseInt(e.target.value))}
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
    </div>
  );
};

export default PrizeStructureListComponent;
