// src/components/PrizeManagement/PrizeStructureListComponent.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PrizeStructureForm from "./PrizeStructureForm"; // Import the form component

export interface PrizeTierData {
  id?: number; 
  name: string;
  value: string;
  quantity: number;
  prizeType: string; 
  order: number;     
}

export interface PrizeStructureData {
  id: number; 
  name: string;
  description: string; 
  isActive: boolean;
  prizes: PrizeTierData[]; 
  createdAt: string;
  validFrom: string; 
  validTo?: string | null; 
}

const initialMockStructures: PrizeStructureData[] = [
  {
    id: 1,
    name: "Daily Draw Week 1",
    description: "Standard daily draw for the first week.",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), 
    validFrom: new Date(Date.now() - 86400000 * 7).toISOString(),
    prizes: [
      { id: 1, name: "Jackpot", value: "N1,000,000", quantity: 1, prizeType: "Cash", order: 0 },
      { id: 2, name: "Consolation", value: "N10,000 Airtime", quantity: 5, prizeType: "Airtime", order: 1 },
    ],
  },
  {
    id: 2,
    name: "Weekend Special",
    description: "Special draw for weekend participants.",
    isActive: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 2).toISOString(),
    prizes: [
      { id: 3, name: "Grand Weekend Prize", value: "N5,000,000", quantity: 1, prizeType: "Cash", order: 0 },
    ],
  },
];

const PrizeStructureListComponent = () => {
  const { userRole } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureData[]>(initialMockStructures);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<PrizeStructureData | null>(null);
  const [viewingStructure, setViewingStructure] = useState<PrizeStructureData | null>(null);

  const canManagePrizeStructures = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  useEffect(() => {
    if (!canManagePrizeStructures) return;
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
      console.log(`Mock delete structure with id: ${id}`);
    }
  };

  const handleViewStructure = (structure: PrizeStructureData) => {
    setViewingStructure(structure);
  };

  const handleFormSubmit = (formData: Omit<PrizeStructureData, 'id' | 'createdAt'>) => {
    if (editingStructure) {
      setPrizeStructures(prizeStructures.map(ps => 
        ps.id === editingStructure.id ? { ...editingStructure, ...formData, prizes: formData.prizes } : ps
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

  if (!canManagePrizeStructures && userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
    return <p>You do not have permission to manage prize structures.</p>;
  }

  if (isLoading) {
    return <p>Loading prize structures...</p>;
  }

  return (
    <div>
      <h2>Prize Structure Management</h2>
      {canManagePrizeStructures && (
        <button onClick={handleAddStructure} style={{ marginBottom: "15px" }}>Add New Prize Structure</button>
      )}
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Active</th>
            <th>Prizes Count</th>
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
              <td>{new Date(ps.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleViewStructure(ps)} style={{ marginRight: "5px" }}>View</button>
                {canManagePrizeStructures && (
                  <>
                    <button onClick={() => handleEditStructure(ps)} style={{ marginRight: "5px" }}>Edit</button>
                    <button onClick={() => handleDeleteStructure(ps.id)}>Delete</button>
                  </>
                )}
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
            <p><strong>Created At:</strong> {new Date(viewingStructure.createdAt).toLocaleString()}</p>
            <p><strong>Valid From:</strong> {new Date(viewingStructure.validFrom).toLocaleString()}</p>
            {viewingStructure.validTo && <p><strong>Valid To:</strong> {new Date(viewingStructure.validTo).toLocaleString()}</p>}
            <h4>Prizes:</h4>
            {viewingStructure.prizes.length > 0 ? (
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                {viewingStructure.prizes.map((prize, index) => (
                  <li key={prize.id || index}>
                    <strong>{prize.name}</strong> ({prize.prizeType}): {prize.value} (Quantity: {prize.quantity}, Order: {prize.order})
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
