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
      
      // Execute the draw
      const result = await drawService.executeDraw(drawDate, selectedPrizeStructure, token);
      
      // Update the draws list with the new draw
      setDraws(prevDraws => [result, ...prevDraws]);
      
      setSuccessMessage(`Draw executed successfully with ${result.winners?.length || 0} winners`);
    } catch (err: any) {
      console.error('Error executing draw:', err);
      setError(`Failed to execute draw: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  // Removed unused formatMSISDN function

  return (
    <div className="draw-management-page">
      <h1>Draw Management</h1>
      
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
      
      {canExecuteDraws && (
        <div className="draw-execution-panel">
          <h2>Execute New Draw</h2>
          <div className="form-group">
            <label htmlFor="prizeStructure">Prize Structure:</label>
            <select 
              id="prizeStructure"
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
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              disabled={loading || executing}
            />
          </div>
          
          <button 
            className="execute-draw-button"
            onClick={handleExecuteDraw}
            disabled={loading || executing || !selectedPrizeStructure || !drawDate}
          >
            {executing ? 'Executing...' : 'Execute Draw'}
          </button>
        </div>
      )}
      
      <div className="draws-list-panel">
        <h2>Previous Draws</h2>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading draws...</p>
          </div>
        ) : draws.length > 0 ? (
          <table className="draws-table">
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
                  <td>{draw.id.substring(0, 8)}...</td>
                  <td>{new Date(draw.drawDate).toLocaleDateString()}</td>
                  <td>{draw.prizeStructureName}</td>
                  <td>
                    <span className={`status-badge status-${draw.status.toLowerCase()}`}>
                      {draw.status}
                    </span>
                  </td>
                  <td>{draw.winners?.length || 0}</td>
                  <td>
                    <button className="view-details-button">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-draws-message">
            <p>No draws have been executed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawManagementPage;
