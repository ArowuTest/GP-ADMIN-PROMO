// src/components/PrizeManagement/PrizeStructureListComponent.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { prizeStructureService } from "../../services/prizeStructureService";
import PrizeStructureForm from "./PrizeStructureForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define and export DayOfWeek type
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// Component data types (used internally by the component)
export interface PrizeTierData {
  id?: string;
  name: string;
  prizeType: string;
  value: string;
  quantity: number;
  order: number;
  numberOfRunnerUps: number;
}

export interface PrizeStructureData {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string;
  validTo?: string | null;
  prizeTiers: PrizeTierData[];
  createdAt?: string;
  applicableDays: DayOfWeek[];
}

// Convert component data to service payload format
const convertComponentToServicePayload = (data: Omit<PrizeStructureData, "prizeTiers" | "id" | "createdAt">, prizeTiers: PrizeTierData[] = []) => {
  console.log("Converting component data to service payload:", data, prizeTiers);
  
  // Convert prize tiers to backend format
  const prizes = prizeTiers.map(tier => ({
    name: tier.name,
    value: tier.value,
    prizeType: tier.prizeType, // Use camelCase for backend
    quantity: tier.quantity,
    order: tier.order,
    numberOfRunnerUps: tier.numberOfRunnerUps
  }));
  
  // Create the payload with camelCase keys for backend
  const payload = {
    name: data.name,
    description: data.description,
    isActive: data.isActive,
    validFrom: data.validFrom,
    validTo: data.validTo,
    prizes: prizes,
    applicableDays: data.applicableDays
  };
  
  console.log("Converted payload for backend:", payload);
  return payload;
};

// Convert service data to component format
const convertServiceToComponentData = (data: any): PrizeStructureData => {
  console.log("Converting service data to component data:", data);
  
  // Ensure we have valid data
  if (!data) {
    console.error("Invalid data received from service");
    return {
      id: "",
      name: "",
      description: "",
      isActive: true,
      validFrom: new Date().toISOString(),
      validTo: null,
      prizeTiers: [],
      applicableDays: []
    };
  }
  
  // Convert prize tiers from backend format
  const prizeTiers = (data.prizes || []).map((prize: any) => ({
    id: prize.id,
    name: prize.name,
    prizeType: prize.prizeType, // Use camelCase from backend
    value: prize.value,
    quantity: prize.quantity,
    order: prize.order,
    numberOfRunnerUps: prize.numberOfRunnerUps
  }));
  
  // Create the component data with camelCase keys
  const componentData = {
    id: data.id,
    name: data.name,
    description: data.description || "",
    isActive: data.isActive,
    validFrom: data.validFrom,
    validTo: data.validTo,
    prizeTiers: prizeTiers,
    createdAt: data.createdAt,
    applicableDays: (data.applicableDays || []) as DayOfWeek[]
  };
  
  console.log("Converted prize structure for UI:", componentData);
  return componentData;
};

const PrizeStructureListComponent: React.FC = () => {
  const { token } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStructure, setEditingStructure] = useState<PrizeStructureData | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch prize structures when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchPrizeStructures = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching prize structures from API...");
        const data = await prizeStructureService.listPrizeStructures(token);
        console.log("Received prize structures:", data);
        
        // Convert service data to component format
        const convertedData = data.map(item => convertServiceToComponentData(item));
        console.log("Converted prize structures for UI:", convertedData);
        
        setPrizeStructures(convertedData);
      } catch (err: any) {
        console.error("Error fetching prize structures:", err);
        setError(`Failed to load prize structures: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPrizeStructures();
    }
  }, [token, refreshTrigger]);

  const handleRefresh = () => {
    // Increment refresh trigger to force data reload
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing prize structures...");
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingStructure(null);
  };

  const handleEdit = (structure: PrizeStructureData) => {
    setEditingStructure(structure);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this prize structure?")) {
      return;
    }

    try {
      await prizeStructureService.deletePrizeStructure(id, token);
      toast.success("Prize structure deleted successfully");
      // Refresh the list
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error("Error deleting prize structure:", err);
      toast.error(`Failed to delete prize structure: ${err.message || "Unknown error"}`);
    }
  };

  const handleFormSubmit = async (formData: Omit<PrizeStructureData, "id" | "createdAt">) => {
    try {
      if (isCreating) {
        console.log("Creating new prize structure...");
        const payload = convertComponentToServicePayload(formData, formData.prizeTiers);
        console.log("Sending payload to createPrizeStructure:", payload);
        
        const response = await prizeStructureService.createPrizeStructure(payload, token);
        console.log("Create response from backend:", response);
        
        toast.success("Prize structure created successfully");
      } else if (editingStructure?.id) {
        console.log(`Updating prize structure with ID ${editingStructure.id}...`);
        const payload = convertComponentToServicePayload(formData, formData.prizeTiers);
        console.log(`Sending payload to updatePrizeStructure for ID ${editingStructure.id}:`, payload);
        
        const response = await prizeStructureService.updatePrizeStructure(editingStructure.id, payload, token);
        console.log("Update response from backend:", response);
        
        toast.success("Prize structure updated successfully");
      }
      
      // Reset form state
      setIsCreating(false);
      setEditingStructure(null);
      
      // Refresh the list to show the latest data
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error("Error submitting prize structure:", err);
      toast.error(`Failed to save prize structure: ${err.message || "Unknown error"}`);
    }
  };

  const handleFormCancel = () => {
    setIsCreating(false);
    setEditingStructure(null);
  };

  return (
    <div className="prize-structure-management">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="header-actions">
        <h2>Prize Structure Management</h2>
        <div className="button-group">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh List"}
          </button>
          <button 
            className="create-button"
            onClick={handleCreateNew}
            disabled={isCreating || !!editingStructure}
          >
            Create New Prize Structure
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isCreating || editingStructure ? (
        <div className="form-container">
          <h3>{isCreating ? "Create New Prize Structure" : "Edit Prize Structure"}</h3>
          <PrizeStructureForm
            isOpen={true}
            onClose={handleFormCancel}
            onSubmit={handleFormSubmit}
            initialData={editingStructure || undefined}
          />
        </div>
      ) : (
        <div className="list-container">
          {loading ? (
            <div className="loading">Loading prize structures...</div>
          ) : prizeStructures.length === 0 ? (
            <div className="empty-state">
              No prize structures found. Click "Create New Prize Structure" to add one.
            </div>
          ) : (
            <table className="prize-structure-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Valid From</th>
                  <th>Valid To</th>
                  <th>Applicable Days</th>
                  <th>Prize Tiers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prizeStructures.map((structure) => (
                  <tr key={structure.id}>
                    <td>{structure.name}</td>
                    <td>{structure.description}</td>
                    <td>
                      <span className={`status ${structure.isActive ? "active" : "inactive"}`}>
                        {structure.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(structure.validFrom).toLocaleDateString()}</td>
                    <td>
                      {structure.validTo
                        ? new Date(structure.validTo).toLocaleDateString()
                        : "No End Date"}
                    </td>
                    <td>{structure.applicableDays.join(", ") || "All Days"}</td>
                    <td>{structure.prizeTiers.length} tiers</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(structure)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => structure.id && handleDelete(structure.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PrizeStructureListComponent;
