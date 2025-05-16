// src/components/PrizeManagement/PrizeStructureListComponent.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PrizeStructureForm from "./PrizeStructureForm";
import { prizeStructureService } from "../../services/prizeStructureService";
import type { 
  ServicePrizeStructureData, 
  ServicePrizeTierData, 
  CreatePrizeStructurePayload,
  CreatePrizeTierPayload // Import this type for clarity
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

// Convert service data (for listing/display from GET) to component data
const convertServiceToComponentData = (serviceData: ServicePrizeStructureData): PrizeStructureData => {
  return {
    id: serviceData.id || "",
    name: serviceData.name,
    description: serviceData.description,
    isActive: serviceData.is_active, // Changed to match backend field name
    prizes: (serviceData.prizeTiers || []).map((pt: ServicePrizeTierData) => ({ 
      id: pt.id,
      name: pt.name,
      // Assuming service GET response for tier has valueNGN and prizeType
      // If service.value is the display string, use that. Otherwise, construct from valueNGN.
      value: pt.value || `N${pt.valueNGN?.toLocaleString() || 0}`, 
      quantity: pt.winnerCount, // Service GET uses winnerCount
      prizeType: pt.prizeType,
      order: pt.order,
      valueNGN: pt.valueNGN || 0, 
      numberOfRunnerUps: pt.numberOfRunnerUps
    })),
    createdAt: serviceData.createdAt || new Date().toISOString(),
    validFrom: serviceData.valid_from, // Changed to match backend field name
    validTo: serviceData.valid_to, // Changed to match backend field name
    applicableDays: (serviceData.applicableDays || []) as DayOfWeek[] // applicableDays is part of GET response
  };
};

// Convert component data to service payload for CREATE/UPDATE
const convertComponentToServicePayload = (
  componentData: Omit<PrizeStructureData, "id" | "createdAt"> & { applicableDays: DayOfWeek[] }
): CreatePrizeStructurePayload => {
  return {
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
};

const PrizeStructureListComponent = () => {
  const { userRole, token } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<PrizeStructureData | null>(null);
  const [viewingStructure, setViewingStructure] = useState<PrizeStructureData | null>(null);

  const canManagePrizeStructures = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  useEffect(() => {
    if (!canManagePrizeStructures) return;
    
    const fetchPrizeStructures = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const serviceDataArray = await prizeStructureService.listPrizeStructures(token);
        const componentDataArray = serviceDataArray.map(convertServiceToComponentData);
        setPrizeStructures(componentDataArray);
      } catch (err: any) {
        console.error("Error fetching prize structures:", err);
        setError(err.message || "Failed to load prize structures");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrizeStructures();
  }, [canManagePrizeStructures, token]);

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
        const updatedServiceData = await prizeStructureService.updatePrizeStructure(
          editingStructure.id,
          payload, 
          token
        );
        const updatedComponentData = convertServiceToComponentData(updatedServiceData);
        setPrizeStructures(prizeStructures.map(ps => 
          ps.id === editingStructure.id ? updatedComponentData : ps
        ));
      } else {
        const newServiceData = await prizeStructureService.createPrizeStructure(
          payload, 
          token
        );
        const newComponentData = convertServiceToComponentData(newServiceData);
        setPrizeStructures([...prizeStructures, newComponentData]);
      }
      
      setIsFormOpen(false);
      setEditingStructure(null);
    } catch (err: any) {
      console.error("Error saving prize structure:", err);
      alert(`Failed to save prize structure: ${err.message}`);
    }
  };

  if (!canManagePrizeStructures) {
    return <p>You do not have permission to manage prize structures.</p>;
  }

  if (isLoading) {
    return <p>Loading prize structures...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Prize Structure Management</h2>
      <button onClick={handleAddStructure} style={{ marginBottom: "15px" }}>Add New Prize Structure</button>
      
      {prizeStructures.length === 0 ? (
        <p>No prize structures found. Create one to get started.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Active</th>
              <th>Prizes Count</th>
              <th>Applicable Days</th>
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
                <td>{new Date(ps.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleViewStructure(ps)} style={{ marginRight: "5px" }}>View</button>
                  <button onClick={() => handleEditStructure(ps)} style={{ marginRight: "5px" }}>Edit</button>
                  <button onClick={() => handleDeleteStructure(ps.id)}>Delete</button>
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
            
            <button onClick={() => setViewingStructure(null)} style={{ marginTop: "20px" }}>Close</button>
          </div>
        </div>
      )}
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
  width: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
};

export default PrizeStructureListComponent;
