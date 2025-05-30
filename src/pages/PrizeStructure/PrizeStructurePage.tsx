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
  const [successMessage] = useState<string | null>(null);
  
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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MTN Mega Billion Prize Structure</h1>
        <p className="page-description">Manage prize structures for the MTN Mega Billion promotion</p>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="material-icons">error</i>
          <span>{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          <i className="material-icons">check_circle</i>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="page-content">
        {canManagePrizeStructures && (
          <div className="action-bar">
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Implement create prize structure functionality
                console.log('Create prize structure button clicked');
                // TODO: Open create prize structure modal or navigate to create page
              }}
            >
              <i className="material-icons">add</i>
              Create New Prize Structure
            </button>
          </div>
        )}
        
        <div className="prize-structures-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading prize structures...</p>
            </div>
          ) : prizeStructures.length > 0 ? (
            <div className="prize-structures-grid">
              {prizeStructures.map(structure => (
                <div key={structure.id} className="card prize-structure-card">
                  <div className="card-header">
                    <h3>{structure.name}</h3>
                    <span className={`status-badge ${structure.isActive ? 'status-active' : 'status-inactive'}`}>
                      {structure.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <p className="prize-structure-description">{structure.description}</p>
                    
                    <div className="detail-grid">
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
                    
                    <div className="prize-tiers-section">
                      <h4 className="section-title">
                        <i className="material-icons">card_giftcard</i>
                        Prize Tiers
                      </h4>
                      <div className="table-responsive">
                        <table className="table prize-tiers-table">
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
                    </div>
                  </div>
                  
                  {canManagePrizeStructures && (
                    <div className="card-footer">
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="material-icons">edit</i>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="material-icons">delete</i>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="material-icons empty-icon">card_giftcard</i>
              <p>No MTN Mega Billion prize structures found.</p>
              {canManagePrizeStructures && (
                <p>Click the "Create New Prize Structure" button to add your first prize structure.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrizeStructurePage;
