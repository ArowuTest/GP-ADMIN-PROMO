// Placeholder for Prize Structure List Component
// This component will display a list of prize structures and allow management.

import React, { useState, useEffect } from "react";
import { useAuth, UserRole } from "../../contexts/AuthContext"; // Adjusted path

// Mock data types - replace with actual types from API/models
interface Prize {
  id?: number;
  name: string;
  value: string;
  quantity: number;
}

interface PrizeStructure {
  id: number;
  name: string;
  isActive: boolean;
  prizes: Prize[];
  createdAt: string;
}

const PrizeStructureListComponent = () => {
  const { userRole } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Add state for showing create/edit modal/form

  const canManagePrizeStructures = userRole === "SuperAdmin" || userRole === "Admin";

  useEffect(() => {
    if (!canManagePrizeStructures) return; // Only authorized roles can list

    setIsLoading(true);
    // Mock fetching prize structures - replace with actual API call
    console.log("Fetching prize structures...");
    setTimeout(() => {
      setPrizeStructures([
        {
          id: 1,
          name: "Daily Draw Week 1",
          isActive: true,
          createdAt: new Date().toISOString(),
          prizes: [
            { id: 1, name: "Jackpot", value: "N1,000,000", quantity: 1 },
            { id: 2, name: "Consolation", value: "N10,000 Airtime", quantity: 5 },
          ],
        },
        {
          id: 2,
          name: "Weekend Special",
          isActive: false,
          createdAt: new Date().toISOString(),
          prizes: [
            { id: 3, name: "Grand Weekend Prize", value: "N5,000,000", quantity: 1 },
          ],
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, [canManagePrizeStructures]);

  if (!canManagePrizeStructures) {
    return <p>You do not have permission to manage prize structures.</p>;
  }

  if (isLoading) {
    return <p>Loading prize structures...</p>;
  }

  return (
    <div>
      <h2>Prize Structure Management</h2>
      {canManagePrizeStructures && (
        <>
          <button /* onClick={() => setShowCreateModal(true)} */>Add New Prize Structure</button>
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
                    <button /* onClick={() => handleEdit(ps)} */>Edit</button>
                    <button /* onClick={() => handleDelete(ps.id)} */>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {/* Add Modal/Form for Create/Edit Prize Structure here */}
    </div>
  );
};

export default PrizeStructureListComponent;

