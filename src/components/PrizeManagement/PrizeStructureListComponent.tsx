// src/components/PrizeManagement/PrizeStructureListComponent.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PrizeStructureForm from "./PrizeStructureForm"; // Import the form component

// Define and export DayOfWeek type
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// Updated PrizeTierData interface
export interface PrizeTierData {
  id?: number; // Or string, depending on backend
  name: string;
  value: string;
  quantity: number;
  prizeType: string;
  order: number;
  valueNGN: number; // Added field
  numberOfRunnerUps: number; // Added field
}

// Updated PrizeStructureData interface
export interface PrizeStructureData {
  id: number; // Or string
  name: string;
  description: string;
  isActive: boolean;
  prizes: PrizeTierData[];
  createdAt: string;
  validFrom: string;
  validTo?: string | null;
  applicableDays: DayOfWeek[]; // Added field using the new DayOfWeek type
}

// Mock initial data - this would typically come from an API
const initialMockStructures: PrizeStructureData[] = [
  {
    id: 1,
    name: "Daily Draw Week 1",
    description: "Standard daily draw for the first week.",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    validFrom: new Date(Date.now() - 86400000 * 7).toISOString(),
    applicableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    prizes: [
      { id: 1, name: "Jackpot", value: "N1,000,000", quantity: 1, prizeType: "Cash", order: 0, valueNGN: 1000000, numberOfRunnerUps: 2 },
      { id: 2, name: "Consolation", value: "N10,000 Airtime", quantity: 5, prizeType: "Airtime", order: 1, valueNGN: 10000, numberOfRunnerUps: 1 },
    ],
  },
  {
    id: 2,
    name: "Weekend Special",
    description: "Special draw for weekend participants.",
    isActive: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    validFrom: new Date(Date.now() - 86400000 * 2).toISOString(),
    applicableDays: ["Sat", "Sun"],
    prizes: [
      { id: 3, name: "Grand Weekend Prize", value: "N5,000,000", quantity: 1, prizeType: "Cash", order: 0, valueNGN: 5000000, numberOfRunnerUps: 1 },
    ],
  },
];

const PrizeStructureListComponent = () => {
  const { userRole } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureData[]>(initialMockStructures);
  const [isLoading] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<PrizeStructureData | null>(null);
  const [viewingStructure, setViewingStructure] = useState<PrizeStructureData | null>(null);

  const canManagePrizeStructures = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  useEffect(() => {
    if (!canManagePrizeStructures) return;
    // API call to fetch prize structures would go here
  }, [canManagePrizeStructures]);

  const handleAddStructure = () => {
    setEditingStructure(null);
    setIsFormOpen(true);
  };

  const handleEditStructure = (structure: PrizeStructureData) => {
    setEditingStructure(structure);
    setIsFormOpen(true);
  };

  const handleDeleteStructure = (id: number) => {
    if (window.confirm("Are you sure you want to delete this prize structure?")) {
      setPrizeStructures(prizeStructures.filter(ps => ps.id !== id));
      // TODO: Add API call for actual deletion later
      console.log(`Mock delete structure with id: ${id}`);
    }
  };

  const handleViewStructure = (structure: PrizeStructureData) => {
    setViewingStructure(structure);
  };

  const handleFormSubmit = (formData: Omit<PrizeStructureData, 'id' | 'createdAt'>) => {
    if (editingStructure) {
      setPrizeStructures(prizeStructures.map(ps => 
        ps.id === editingStructure.id ? { ...editingStructure, ...formData, prizes: formData.prizes.map(p => ({...p})) } : ps
      ));
      console.log("Mock update structure:", { ...editingStructure, ...formData });
    } else {
      const newId = prizeStructures.length > 0 ? Math.max(...prizeStructures.map(ps => ps.id)) + 1 : 1;
      const newStructure: PrizeStructureData = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      setPrizeStructures([...prizeStructures, newStructure]);
      console.log("Mock create structure:", newStructure);
    }
    setIsFormOpen(false);
    setEditingStructure(null);
  };

  if (!canManagePrizeStructures) {
    return <p>You do not have permission to manage prize structures.</p>;
  }

  if (isLoading) {
    return <p>Loading prize structures...</p>;
  }

  return (
    <div>
      <h2>Prize Structure Management</h2>
      <button onClick={handleAddStructure} style={{ marginBottom: "15px" }}>Add New Prize Structure</button>
      
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

      <PrizeStructureForm 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingStructure(null); }}
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
                    <strong>{prize.name}</strong> ({prize.prizeType}): {prize.value} (NGN: {prize.valueNGN}, Qty: {prize.quantity}, Order: {prize.order}, Runners: {prize.numberOfRunnerUps})
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

