// src/pages/DrawManagement/DrawManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { drawService } from '../../services/drawService';
import { prizeService } from '../../services/prizeService';
import './DrawManagementPage.css';

interface DrawData {
  id: string;
  drawDate: string;
  status: string;
  prizeStructureId: string;
  prizeStructureName: string;
  executedByAdminID: string;
  totalEligibleMSISDNs: number;
  totalEntries: number;
  createdAt: string;
  updatedAt: string;
  winners: WinnerData[];
}

interface WinnerData {
  id: string;
  drawId: string;
  msisdn: string;
  prizeTierId: string;
  prizeTierName: string;
  prizeValue: string;
  status: string;
  paymentStatus: string;
  isRunnerUp: boolean;
  originalWinnerId?: string;
  runnerUpRank?: number;
  createdAt: string;
  updatedAt: string;
}

interface PrizeStructure {
  id: string;
  name: string;
}

const DrawManagementPage: React.FC = () => {
  const { token, user } = useAuth();
  const [draws, setDraws] = useState<DrawData[]>([]);
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructure[]>([]);
  const [selectedPrizeStructure, setSelectedPrizeStructure] = useState<string>('');
  const [drawDate, setDrawDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);

  // Check if user has permission to execute draws
  const canExecuteDraws = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch draws and prize structures in parallel
        const [drawsData, prizeStructuresData] = await Promise.all([
          drawService.listDraws(token),
          prizeService.listPrizeStructures(token)
        ]);
        
        setDraws(drawsData);
        setPrizeStructures(prizeStructuresData);
        
        // Set default draw date to today
        const today = new Date();
        setDrawDate(today.toISOString().split('T')[0]);
      } catch (err: any) {
        console.error('Error fetching draw management data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleExecuteDraw = async () => {
    if (!token || !selectedPrizeStructure || !drawDate) {
      setError('Please select a prize structure and draw date');
      return;
    }
    
    try {
      setExecuting(true);
      setError(null);
      setSuccessMessage(null);
      
      // Show animation for 5 seconds
      setShowAnimation(true);
      
      // Wait for animation to complete
      setTimeout(async () => {
        try {
          // Execute the draw
          const result = await drawService.executeDraw(drawDate, selectedPrizeStructure, token);
          
          // Update the draws list with the new draw
          setDraws(prevDraws => [result, ...prevDraws]);
          
          setSuccessMessage(`MTN Mega Billion Draw executed successfully with ${result.winners?.length || 0} winners`);
        } catch (err: any) {
          console.error('Error executing draw:', err);
          setError(`Failed to execute draw: ${err.message}`);
        } finally {
          setShowAnimation(false);
          setExecuting(false);
        }
      }, 5000);
      
    } catch (err: any) {
      console.error('Error executing draw:', err);
      setError(`Failed to execute draw: ${err.message}`);
      setShowAnimation(false);
      setExecuting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MTN Mega Billion Draw Management</h1>
        <p className="page-description">Execute and manage draws for the MTN Mega Billion promotion</p>
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
        {showAnimation && (
          <div className="draw-animation-overlay">
            <div className="draw-animation-container">
              <div className="draw-animation">
                <div className="draw-spinner"></div>
                <h2>Executing MTN Mega Billion Draw</h2>
                <p>Selecting winners from eligible participants...</p>
              </div>
            </div>
          </div>
        )}
        
        {canExecuteDraws && (
          <div className="card draw-execution-panel">
            <div className="card-header">
              <h2>Execute New MTN Mega Billion Draw</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="prizeStructure">Prize Structure:</label>
                <select 
                  id="prizeStructure"
                  className="form-control"
                  value={selectedPrizeStructure}
                  onChange={(e) => setSelectedPrizeStructure(e.target.value)}
                  disabled={loading || executing}
                >
                  <option value="">Select Prize Structure</option>
                  {prizeStructures.map(ps => (
                    <option key={ps.id} value={ps.id}>{ps.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="drawDate">Draw Date:</label>
                <input 
                  type="date"
                  id="drawDate"
                  className="form-control"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  disabled={loading || executing}
                />
              </div>
              
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleExecuteDraw}
                disabled={loading || executing || !selectedPrizeStructure || !drawDate}
              >
                {executing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Executing Draw...</span>
                  </>
                ) : (
                  <>
                    <i className="material-icons">shuffle</i>
                    <span>Execute MTN Mega Billion Draw</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <div className="card draws-list-panel">
          <div className="card-header">
            <h2>Previous MTN Mega Billion Draws</h2>
            <button className="btn-link">
              <i className="material-icons">refresh</i>
            </button>
          </div>
          
          <div className="card-body">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading draws...</p>
              </div>
            ) : draws.length > 0 ? (
              <div className="table-responsive">
                <table className="table draws-table">
                  <thead>
                    <tr>
                      <th>Draw ID</th>
                      <th>Date</th>
                      <th>Prize Structure</th>
                      <th>Status</th>
                      <th>Winners</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draws.map(draw => (
                      <tr key={draw.id}>
                        <td><span className="id-badge">{draw.id.substring(0, 8)}...</span></td>
                        <td>{new Date(draw.drawDate).toLocaleDateString()}</td>
                        <td>{draw.prizeStructureName}</td>
                        <td>
                          <span className={`status-badge status-${draw.status.toLowerCase()}`}>
                            {draw.status}
                          </span>
                        </td>
                        <td>{draw.winners?.length || 0}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="material-icons">visibility</i>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <i className="material-icons empty-icon">event_busy</i>
                <p>No MTN Mega Billion draws have been executed yet.</p>
                {canExecuteDraws && (
                  <p>Use the panel above to execute your first draw.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawManagementPage;
