// src/pages/PrizeStructure/PrizeStructurePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { prizeService, PrizeStructureResponse, DayOfWeek } from '../../services/prizeService';
import './PrizeStructurePage.css';

const PrizeStructurePage: React.FC = () => {
  const { token, user } = useAuth();
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage] = useState<string | null>(null); // Removed unused setter function
  
  // Check if user has permission to manage prize structures
  const canManagePrizeStructures = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '');

  useEffect(() => {
    const fetchPrizeStructures = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch prize structures from API
        const data = await prizeService.listPrizeStructures(token);
        setPrizeStructures(data);
      } catch (err: any) {
        console.error('Error fetching prize structures:', err);
        setError(`Failed to load prize structures: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPrizeStructures();
  }, [token]);

  const formatDaysList = (days: DayOfWeek[]) => {
    if (!days || days.length === 0) return 'None';
    if (days.length === 7) return 'All days';
    return days.join(', ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="prize-structure-page">
      <h1>Prize Structure Management</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {canManagePrizeStructures && (
        <div className="action-buttons">
          <button className="create-button">Create New Prize Structure</button>
        </div>
      )}
      
      <div className="prize-structures-panel">
        <h2>Prize Structures</h2>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading prize structures...</p>
          </div>
        ) : prizeStructures.length > 0 ? (
          <div className="prize-structures-list">
            {prizeStructures.map(structure => (
              <div key={structure.id} className="prize-structure-card">
                <div className="prize-structure-header">
                  <h3>{structure.name}</h3>
                  <span className={`status-badge ${structure.isActive ? 'status-active' : 'status-inactive'}`}>
                    {structure.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="prize-structure-details">
                  <p className="description">{structure.description}</p>
                  
                  <div className="detail-item">
                    <span className="detail-label">Valid From:</span>
                    <span className="detail-value">{formatDate(structure.validFrom)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Valid To:</span>
                    <span className="detail-value">{formatDate(structure.validTo)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Applicable Days:</span>
                    <span className="detail-value">{formatDaysList(structure.applicableDays)}</span>
                  </div>
                </div>
                
                <div className="prize-tiers">
                  <h4>Prize Tiers</h4>
                  <table className="prize-tiers-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Quantity</th>
                        <th>Runner-ups</th>
                      </tr>
                    </thead>
                    <tbody>
                      {structure.prizes.map(prize => (
                        <tr key={prize.id}>
                          <td>{prize.name}</td>
                          <td>{prize.prizeType}</td>
                          <td>{prize.value}</td>
                          <td>{prize.quantity}</td>
                          <td>{prize.numberOfRunnerUps}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {canManagePrizeStructures && (
                  <div className="prize-structure-actions">
                    <button className="edit-button">Edit</button>
                    <button className="delete-button">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-prize-structures">
            <p>No prize structures found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrizeStructurePage;
