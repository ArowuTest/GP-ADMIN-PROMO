// src/components/PrizeManagement/PrizeStructureListComponent.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PrizeStructureForm from "./PrizeStructureForm";
import { prizeStructureService } from "../../services/prizeStructureService";
import type { 
  ServicePrizeStructureData, 
  ServicePrizeTierData, 
  CreatePrizeStructurePayload,
  CreatePrizeTierPayload
} from "../../services/prizeStructureService";

// Define and export DayOfWeek type
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// Component state for a single prize tier
export interface PrizeTierData {
  id?: string; 
  name: string;
  value: string; // Display value like N1000 (used in form)
  prizeType: string;
  quantity: number;
  order: number;
  valueNGN: number; // Actual numeric value (used in form, converted from/to service.value)
  numberOfRunnerUps: number;
}

// Component state for a prize structure
export interface PrizeStructureData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  prizes: PrizeTierData[];
  createdAt: string;
  validFrom: string;
  validTo?: string | null;
  applicableDays: DayOfWeek[];
}

// Success notification component
const SuccessNotification = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div style={successNotificationStyle}>
      <span>{message}</span>
      <button onClick={onClose} style={closeButtonStyle}>×</button>
    </div>
  );
};

// Convert service data (for listing/display from GET) to component data
const convertServiceToComponentData = (serviceData: ServicePrizeStructureData): PrizeStructureData => {
  console.log("Converting service data to component data:", serviceData);
  
  // Ensure applicable_days is always an array
  const applicableDays = Array.isArray(serviceData.applicable_days) 
    ? serviceData.applicable_days 
    : [];
    
  return {
    id: serviceData.id || "",
    name: serviceData.name,
    description: serviceData.description,
    isActive: serviceData.is_active, // Changed to match backend field name
    prizes: (serviceData.prizes || []).map((pt: ServicePrizeTierData) => ({ 
      id: pt.id,
      name: pt.name,
      value: pt.value || `N${pt.valueNGN?.toLocaleString() || 0}`, 
      quantity: pt.quantity, // Changed from winnerCount to match backend
      prizeType: pt.prize_type, // Changed to match backend field name
      order: pt.order,
      valueNGN: pt.valueNGN || 0, 
      numberOfRunnerUps: pt.numberOfRunnerUps
    })),
    createdAt: serviceData.created_at || new Date().toISOString(), // Changed to match backend field name
    validFrom: serviceData.valid_from, // Changed to match backend field name
    validTo: serviceData.valid_to, // Changed to match backend field name
    applicableDays: applicableDays as DayOfWeek[] // Changed to match backend field name
  };
};

// Convert component data to service payload for CREATE/UPDATE
const convertComponentToServicePayload = (
  componentData: Omit<PrizeStructureData, "id" | "createdAt"> & { applicableDays: DayOfWeek[] }
): CreatePrizeStructurePayload => {
  const payload = {
    name: componentData.name,
    description: componentData.description,
    is_active: componentData.isActive, // Maps to backend json:"is_active"
    valid_from: componentData.validFrom, // Maps to backend json:"valid_from"
    valid_to: componentData.validTo, // Maps to backend json:"valid_to"
    prizes: componentData.prizes.map((p: PrizeTierData): CreatePrizeTierPayload => ({
      name: p.name, // json:"name"
      value: p.value, // This is the display string like "N1000", backend expects this for CreatePrizeRequest.Value
      prize_type: p.prizeType, // json:"prize_type"
      quantity: p.quantity, // json:"quantity"
      order: p.order, // json:"order"
      numberOfRunnerUps: p.numberOfRunnerUps // json:"numberOfRunnerUps"
      // valueNGN is a component-only field for calculation, not sent directly if backend takes display `value`
    })),
    applicable_days: componentData.applicableDays, // Explicitly include applicable_days in the payload
  };
  
  console.log("Converted payload for backend:", payload);
  return payload;
};

const PrizeStructureListComponent = () => {
  const { userRole, token } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<PrizeStructureData | null>(null);
  const [viewingStructure, setViewingStructure] = useState<PrizeStructureData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const canManagePrizeStructures = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  // Fetch prize structures function - extracted to be reusable
  const fetchPrizeStructures = useCallback(async () => {
    if (!canManagePrizeStructures) return;
    
    setIsRefreshing(true);
    setError(null);
    try {
      console.log("Fetching prize structures from API...");
      const serviceDataArray = await prizeStructureService.listPrizeStructures(token);
      console.log("Received prize structures:", serviceDataArray);
      
      const componentDataArray = serviceDataArray.map(convertServiceToComponentData);
      console.log("Converted prize structures for UI:", componentDataArray);
      
      setPrizeStructures(componentDataArray);
    } catch (err: any) {
      console.error("Error fetching prize structures:", err);
      setError(err.message || "Failed to load prize structures");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [canManagePrizeStructures, token]);

  // Initial load
  useEffect(() => {
    fetchPrizeStructures();
  }, [fetchPrizeStructures]);

  const handleAddStructure = () => {
    setEditingStructure(null);
    setIsFormOpen(true);
  };

  const handleEditStructure = (structure: PrizeStructureData) => {
    setEditingStructure(structure);
    setIsFormOpen(true);
  };

  const handleDeleteStructure = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this prize structure?")) {
      try {
        await prizeStructureService.deletePrizeStructure(id, token);
        setPrizeStructures(prizeStructures.filter(ps => ps.id !== id));
        setSuccessMessage("Prize structure deleted successfully");
      } catch (err: any) {
        console.error("Error deleting prize structure:", err);
        alert(`Failed to delete prize structure: ${err.message}`);
      }
    }
  };

  const handleViewStructure = (structure: PrizeStructureData) => {
    setViewingStructure(structure);
  };

  const handleFormSubmit = async (formData: Omit<PrizeStructureData, "id" | "createdAt">) => {
    try {
      // Include applicableDays in the payload
      const payload = convertComponentToServicePayload({ 
        ...formData, 
        applicableDays: formData.applicableDays 
      });
      
      if (editingStructure) {
        console.log(`Updating prize structure with ID ${editingStructure.id}...`);
        const updatedServiceData = await prizeStructureService.updatePrizeStructure(
          editingStructure.id,
          payload, 
          token
        );
        console.log("Update response from backend:", updatedServiceData);
        
        // Immediately refresh all prize structures to ensure we have the latest data
        await fetchPrizeStructures();
        
        setSuccessMessage(`Prize structure "${formData.name}" updated successfully`);
      } else {
        console.log("Creating new prize structure...");
        const newServiceData = await prizeStructureService.createPrizeStructure(
          payload, 
          token
        );
        console.log("Create response from backend:", newServiceData);
        
        // Immediately refresh all prize structures to ensure we have the latest data
        await fetchPrizeStructures();
        
        setSuccessMessage(`Prize structure "${formData.name}" created successfully`);
      }
      
      setIsFormOpen(false);
      setEditingStructure(null);
    } catch (err: any) {
      console.error("Error saving prize structure:", err);
      alert(`Failed to save prize structure: ${err.message}`);
    }
  };

  const handleRefresh = () => {
    fetchPrizeStructures();
  };

  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  if (!canManagePrizeStructures) {
    return <p>You do not have permission to manage prize structures.</p>;
  }

  return (
    <div>
      <h2>Prize Structure Management</h2>
      
      {successMessage && (
        <SuccessNotification 
          message={successMessage} 
          onClose={clearSuccessMessage} 
        />
      )}
      
      <div style={actionBarStyle}>
        <button onClick={handleAddStructure}>Add New Prize Structure</button>
        <button onClick={handleRefresh} disabled={isRefreshing} style={refreshButtonStyle}>
          {isRefreshing ? "Refreshing..." : "Refresh List"}
        </button>
      </div>
      
      {isLoading ? (
        <p>Loading prize structures...</p>
      ) : error ? (
        <div>
          <p style={errorStyle}>Error: {error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      ) : prizeStructures.length === 0 ? (
        <p>No prize structures found. Create one to get started.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Active</th>
              <th>Prizes Count</th>
              <th>Applicable Days</th>
              <th>Valid From</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prizeStructures.map(ps => (
              <tr key={ps.id}>
                <td>{ps.id}</td>
                <td>{ps.name}</td>
                <td>{ps.isActive ? "Yes" : "No"}</td>
                <td>{ps.prizes.length}</td>
                <td>{ps.applicableDays.join(", ")}</td>
                <td>{new Date(ps.validFrom).toLocaleDateString()}</td>
                <td>{new Date(ps.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleViewStructure(ps)} style={actionButtonStyle}>View</button>
                  <button onClick={() => handleEditStructure(ps)} style={actionButtonStyle}>Edit</button>
                  <button onClick={() => handleDeleteStructure(ps.id)} style={deleteButtonStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <PrizeStructureForm 
        isOpen={isFormOpen} 
        onClose={() => { 
          setIsFormOpen(false); 
          setEditingStructure(null); 
        }} 
        onSubmit={handleFormSubmit} 
        initialData={editingStructure} 
      />

      {viewingStructure && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Prize Structure Details: {viewingStructure.name}</h3>
            <p><strong>ID:</strong> {viewingStructure.id}</p>
            <p><strong>Description:</strong> {viewingStructure.description}</p>
            <p><strong>Active:</strong> {viewingStructure.isActive ? "Yes" : "No"}</p>
            <p><strong>Applicable Days:</strong> {viewingStructure.applicableDays.join(", ")}</p>
            <p><strong>Created At:</strong> {new Date(viewingStructure.createdAt).toLocaleString()}</p>
            <p><strong>Valid From:</strong> {new Date(viewingStructure.validFrom).toLocaleString()}</p>
            {viewingStructure.validTo && <p><strong>Valid To:</strong> {new Date(viewingStructure.validTo).toLocaleString()}</p>}
            
            <h4>Prizes:</h4>
            {viewingStructure.prizes.length > 0 ? (
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                {viewingStructure.prizes.map((prize, index) => (
                  <li key={prize.id || index}>
                    <strong>{prize.name}</strong> ({prize.prizeType}): {prize.value} 
                    (NGN: {prize.valueNGN}, Qty: {prize.quantity}, Order: {prize.order}, Runners: {prize.numberOfRunnerUps})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No prizes defined for this structure.</p>
            )}
            
            <button onClick={() => setViewingStructure(null)} style={closeViewButtonStyle}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced styles
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
  width: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
};

const successNotificationStyle: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '12px 20px',
  marginBottom: '20px',
  borderRadius: '4px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '20px',
  cursor: 'pointer',
  marginLeft: '10px',
};

const actionBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const refreshButtonStyle: React.CSSProperties = {
  backgroundColor: '#f0f0f0',
  border: '1px solid #ddd',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '20px',
};

const actionButtonStyle: React.CSSProperties = {
  marginRight: '5px',
  padding: '5px 10px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ddd',
  borderRadius: '3px',
  cursor: 'pointer',
};

const deleteButtonStyle: React.CSSProperties = {
  padding: '5px 10px',
  backgroundColor: '#ffebee',
  color: '#d32f2f',
  border: '1px solid #ffcdd2',
  borderRadius: '3px',
  cursor: 'pointer',
};

const closeViewButtonStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '8px 16px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  color: '#d32f2f',
  backgroundColor: '#ffebee',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '10px',
};

export default PrizeStructureListComponent;
