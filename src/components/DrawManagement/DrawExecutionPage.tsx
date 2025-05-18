// src/components/DrawManagement/DrawExecutionPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { drawService } from '../../services/drawService';
import { prizeStructureService } from '../../services/prizeStructureService';
import type { ServicePrizeStructureData, ServicePrizeTierData } from '../../services/prizeStructureService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DrawAnimationComponent from './DrawAnimationComponent';
import { ensureString, ensureArray } from '../../utils/nullSafety';

// Types
interface PrizeTier {
  id: string;
  name: string;
  value: string;
  prizeType: string;
  quantity: number;
  numberOfRunnerUps: number;
}

interface PrizeStructure {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string;
  validTo: string | null;
  applicableDays: string[];
  prizeTiers: PrizeTier[];
}

interface DrawDetails {
  eligibleParticipants: number;
  totalPoints: number;
  prizeStructure: PrizeStructure | null;
  dayOfWeek: string;
}

interface DrawWinner {
  id: string;
  msisdn: string;
  prizeName: string;
  isRunnerUp: boolean;
  runnerUpRank: number;
}

// Helper function to convert ServicePrizeStructureData to PrizeStructure
const convertToPrizeStructure = (data: ServicePrizeStructureData): PrizeStructure => {
  return {
    id: data.id || '',
    name: data.name,
    description: data.description,
    isActive: data.isActive,
    validFrom: data.validFrom,
    validTo: data.validTo || null,
    applicableDays: ensureArray(data.applicableDays),
    prizeTiers: (ensureArray(data.prizes)).map((prize: ServicePrizeTierData) => ({
      id: prize.id || '',
      name: prize.name,
      value: prize.value,
      prizeType: prize.prizeType,
      quantity: prize.quantity,
      numberOfRunnerUps: prize.numberOfRunnerUps
    }))
  };
};

const DrawExecutionPage: React.FC = () => {
  const { userRole, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPrizeStructureId, setSelectedPrizeStructureId] = useState<string>('');
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructure[]>([]);
  const [drawDetails, setDrawDetails] = useState<DrawDetails | null>(null);
  const [isEligibilityLoading, setIsEligibilityLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [drawResults, setDrawResults] = useState<DrawWinner[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch prize structures on component mount
  useEffect(() => {
    const fetchPrizeStructures = async () => {
      try {
        const structures = await prizeStructureService.listPrizeStructures(ensureString(token));
        // Convert ServicePrizeStructureData[] to PrizeStructure[]
        const convertedStructures = structures.map(convertToPrizeStructure);
        setPrizeStructures(convertedStructures);
        if (convertedStructures.length > 0) {
          setSelectedPrizeStructureId(convertedStructures[0].id);
        }
      } catch (err) {
        console.error('Error fetching prize structures:', err);
        setError('Failed to load prize structures. Please try again later.');
        toast.error('Failed to load prize structures');
      }
    };

    fetchPrizeStructures();
  }, [token]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setDrawResults(null);
    setDrawDetails(null);
  };

  const handlePrizeStructureChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrizeStructureId(event.target.value);
    setDrawResults(null);
    setDrawDetails(null);
  };

  const handleCheckEligibility = async () => {
    if (!selectedDate || !selectedPrizeStructureId) {
      toast.warning('Please select both a date and prize structure');
      return;
    }

    setIsEligibilityLoading(true);
    setError(null);
    setDrawDetails(null);

    try {
      // Get eligibility stats
      const stats = await drawService.getDrawEligibilityStats(selectedDate, ensureString(token));
      
      // Find the selected prize structure
      const prizeStructure = prizeStructures.find(ps => ps.id === selectedPrizeStructureId);
      
      if (!prizeStructure) {
        throw new Error('Selected prize structure not found');
      }

      // Get day of week
      const dateObj = new Date(selectedDate + 'T00:00:00');
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      
      setDrawDetails({
        eligibleParticipants: stats.totalEligibleMSISDNs,
        totalPoints: stats.totalEntries,
        prizeStructure: prizeStructure,
        dayOfWeek: dayOfWeek
      });
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError('Failed to check eligibility. Please try again later.');
      toast.error('Failed to check eligibility');
    } finally {
      setIsEligibilityLoading(false);
    }
  };

  const handleExecuteDraw = async () => {
    if (!drawDetails || !selectedPrizeStructureId || userRole !== 'SUPER_ADMIN') {
      return;
    }

    setIsExecuting(true);
    setError(null);
    setDrawResults(null);
  };

  const handleAnimationComplete = async () => {
    try {
      const result = await drawService.executeDraw(selectedDate, selectedPrizeStructureId, ensureString(token));
      
      // Transform the result into the expected format
      const winners: DrawWinner[] = ensureArray(result.draw.winners).map(winner => ({
        id: winner.id,
        msisdn: maskMSISDN(winner.msisdn),
        prizeName: winner.prizeTierName || 'Unknown Prize',
        isRunnerUp: winner.isRunnerUp || false,
        runnerUpRank: winner.runnerUpRank || 0
      }));
      
      setDrawResults(winners);
      toast.success('Draw executed successfully');
    } catch (err) {
      console.error('Error executing draw:', err);
      setError(`Failed to execute draw: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error(`Draw execution failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Helper function to mask MSISDN (show only first 3 and last 3 digits)
  const maskMSISDN = (msisdn: string): string => {
    if (msisdn.length <= 6) return msisdn;
    return `${msisdn.substring(0, 3)}***${msisdn.substring(msisdn.length - 3)}`;
  };

  if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN' && userRole !== 'SENIOR_USER') { 
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="draw-management-container">
      <div className="draw-setup-section">
        <h2>Draw Management</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="draw-date">Select Draw Date: </label>
          <input 
            type="date" 
            id="draw-date" 
            value={selectedDate} 
            onChange={handleDateChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prize-structure">Prize Structure: </label>
          <select 
            id="prize-structure" 
            value={selectedPrizeStructureId} 
            onChange={handlePrizeStructureChange}
            className="form-control"
          >
            {prizeStructures.map(ps => (
              <option key={ps.id} value={ps.id}>
                {ps.name} ({ps.applicableDays.join(', ')})
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleCheckEligibility} 
          disabled={isEligibilityLoading || !selectedDate || !selectedPrizeStructureId}
          className="check-eligibility-button"
        >
          {isEligibilityLoading ? 'Checking...' : 'Check Eligibility'}
        </button>
        
        {drawDetails && (
          <div className="eligibility-results-section">
            <h3>Eligibility Results</h3>
            <p><strong>Eligible Participants:</strong> {drawDetails.eligibleParticipants.toLocaleString()}</p>
            <p><strong>Total Points in Draw:</strong> {drawDetails.totalPoints.toLocaleString()}</p>
            
            {userRole === 'SUPER_ADMIN' && (
              <button 
                onClick={handleExecuteDraw} 
                disabled={isExecuting || isEligibilityLoading}
                className="execute-draw-button"
              >
                {isExecuting ? 'Executing...' : 'Execute Draw'}
              </button>
            )}
            
            {(userRole === 'ADMIN' || userRole === 'SENIOR_USER') && (
              <p><i>Draw execution is reserved for Super Admins.</i></p>
            )}
          </div>
        )}
      </div>

      {drawDetails && drawDetails.prizeStructure && (
        <div className="prize-structure-section">
          <h3>Prize Structure Details</h3>
          <p><strong>Name:</strong> {drawDetails.prizeStructure.name}</p>
          <p><strong>Description:</strong> {drawDetails.prizeStructure.description}</p>
          <p><strong>Applicable Days:</strong> {drawDetails.prizeStructure.applicableDays.join(', ')}</p>
          <p><strong>Valid From:</strong> {new Date(drawDetails.prizeStructure.validFrom).toLocaleDateString()}</p>
          {drawDetails.prizeStructure.validTo && (
            <p><strong>Valid To:</strong> {new Date(drawDetails.prizeStructure.validTo).toLocaleDateString()}</p>
          )}
          
          <h4>Prize Tiers:</h4>
          <table className="prize-tiers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Quantity</th>
                <th>Runner-ups</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {drawDetails.prizeStructure.prizeTiers.map((tier, index) => (
                <tr key={index}>
                  <td>{tier.name}</td>
                  <td>{tier.value}</td>
                  <td>{tier.quantity}</td>
                  <td>{tier.numberOfRunnerUps}</td>
                  <td>{tier.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <p className="total-prize-pot">
            <strong>Total Prize Pot:</strong> {drawDetails.prizeStructure.prizeTiers.reduce((total, tier) => {
              // Extract numeric value from string like "N5,000,000"
              const valueMatch = tier.value.match(/[0-9,]+/);
              if (!valueMatch) return total;
              
              const numericValue = parseFloat(valueMatch[0].replace(/,/g, ''));
              return total + (numericValue * tier.quantity);
            }, 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
          </p>
        </div>
      )}

      {isExecuting && drawDetails && (
        <div className="draw-animation-section">
          <DrawAnimationComponent 
            isExecuting={isExecuting}
            participantCount={drawDetails.eligibleParticipants}
            onAnimationComplete={handleAnimationComplete}
            duration={5000} // 5 seconds
          />
        </div>
      )}

      {drawResults && !isExecuting && (
        <div className="draw-results-section">
          <h3>Draw Results</h3>
          <table className="draw-results-table">
            <thead>
              <tr>
                <th>Prize Name</th>
                <th>Winner MSISDN (Masked)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drawResults.map((result, index) => (
                <tr key={index} className={result.isRunnerUp ? 'runner-up-row' : 'winner-row'}>
                  <td>{result.prizeName}</td>
                  <td>{result.msisdn}</td>
                  <td>{result.isRunnerUp ? `Runner-up ${result.runnerUpRank}` : 'Winner'}</td>
                  <td>
                    {!result.isRunnerUp && (
                      <button className="view-details-button">View Details</button>
                    )}
                    {result.isRunnerUp && (
                      <button className="invoke-runner-up-button" disabled>Invoke Runner-up</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>
        {`
        .draw-management-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .draw-setup-section {
          grid-column: 1;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        
        .prize-structure-section {
          grid-column: 2;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        
        .eligibility-results-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #e6f7ff;
          border-radius: 8px;
          border: 1px solid #91d5ff;
        }
        
        .draw-animation-section {
          grid-column: 1 / span 2;
          margin-top: 20px;
        }
        
        .draw-results-section {
          grid-column: 1 / span 2;
          margin-top: 20px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .check-eligibility-button {
          padding: 10px 15px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .check-eligibility-button:hover {
          background-color: #40a9ff;
        }
        
        .check-eligibility-button:disabled {
          background-color: #d9d9d9;
          cursor: not-allowed;
        }
        
        .execute-draw-button {
          margin-top: 15px;
          padding: 12px 24px;
          background-color: #52c41a;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .execute-draw-button:hover {
          background-color: #73d13d;
        }
        
        .execute-draw-button:disabled {
          background-color: #d9d9d9;
          cursor: not-allowed;
        }
        
        .error-message {
          padding: 10px;
          margin-bottom: 15px;
          background-color: #fff1f0;
          border: 1px solid #ffa39e;
          border-radius: 4px;
          color: #f5222d;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f5f5f5;
        }
        
        .winner-row {
          background-color: #f6ffed;
        }
        
        .runner-up-row {
          background-color: #fcfcfc;
        }
        
        .view-details-button, .invoke-runner-up-button {
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .view-details-button {
          background-color: #1890ff;
          color: white;
        }
        
        .view-details-button:hover {
          background-color: #40a9ff;
        }
        
        .invoke-runner-up-button {
          background-color: #faad14;
          color: white;
        }
        
        .invoke-runner-up-button:hover {
          background-color: #ffc53d;
        }
        
        .invoke-runner-up-button:disabled {
          background-color: #d9d9d9;
          cursor: not-allowed;
        }
        `}
      </style>
    </div>
  );
};

export default DrawExecutionPage;
