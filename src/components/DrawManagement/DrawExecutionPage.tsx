// Placeholder for Draw Execution Page Component
// This component will allow Super Admins to select a date, view draw details, and execute the draw.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Removed unused UserRole import

// Mock data types - replace with actual types from API/models
interface Prize {
  name: string;
  value: string;
  quantity: number;
}

interface PrizeStructure {
  name: string;
  prizes: Prize[];
}

interface DrawDetails {
  eligibleParticipants: number;
  totalPoints: number;
  prizeStructure: PrizeStructure | null;
  dayOfWeek: string;
}

const DrawExecutionPage = () => {
  const { userRole } = useAuth(); // Get user role from AuthContext
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [drawDetails, setDrawDetails] = useState<DrawDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [drawResults, setDrawResults] = useState<any | null>(null); // Replace 'any' with actual result type

  // Effect to fetch draw details when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setIsLoading(true);
      console.log(`Fetching draw details for ${selectedDate}...`);
      const dateObj = new Date(selectedDate + 'T00:00:00'); // Ensure date is parsed in local timezone or UTC consistently
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Simulate API call
      setTimeout(() => {
        setDrawDetails({
          eligibleParticipants: Math.floor(Math.random() * 10000) + 1000,
          totalPoints: Math.floor(Math.random() * 50000) + 5000,
          prizeStructure: {
            name: `Prize Structure for ${dayOfWeek}`,
            prizes: [
              { name: 'Jackpot', value: 'N1,000,000', quantity: 1 },
              { name: '2nd Prize', value: 'N500,000', quantity: 2 },
              { name: 'Consolation Prize', value: 'N50,000 Airtime', quantity: 10 },
            ],
          },
          dayOfWeek: dayOfWeek,
        });
        setIsLoading(false);
      }, 1500);
    }
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setDrawResults(null);
  };

  const handleExecuteDraw = () => {
    if (!drawDetails || userRole !== 'SUPER_ADMIN') return; 

    setIsExecuting(true);
    setDrawResults(null);
    console.log('Executing draw...');

    setTimeout(() => {
      setDrawResults([
        { prizeName: 'Jackpot', winnerMsisdn: '234***789', isRunnerUp: false, runnerUpRank: 0 },
        { prizeName: 'Jackpot', winnerMsisdn: '234***012', isRunnerUp: true, runnerUpRank: 1 },
        { prizeName: '2nd Prize', winnerMsisdn: '234***345', isRunnerUp: false, runnerUpRank: 0 },
        { prizeName: '2nd Prize', winnerMsisdn: '234***678', isRunnerUp: false, runnerUpRank: 0 },
      ]);
      setIsExecuting(false);
      console.log('Draw execution complete.');
    }, 5000);
  };

  if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN' && userRole !== 'SENIOR_USER') { 
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div>
      <h2>Draw Execution</h2>
      
      <div>
        <label htmlFor="draw-date">Select Draw Date: </label>
        <input 
          type="date" 
          id="draw-date" 
          value={selectedDate} 
          onChange={handleDateChange} 
        />
      </div>

      {isLoading && <p>Loading draw details...</p>}

      {drawDetails && !isLoading && (
        <div style={{ border: '1px solid #ccc', padding: '15px', margin: '15px 0' }}>
          <h3>Details for Draw on {new Date(selectedDate + 'T00:00:00').toLocaleDateString()} ({drawDetails.dayOfWeek})</h3>
          <p><strong>Eligible Participants:</strong> {drawDetails.eligibleParticipants.toLocaleString()}</p>
          <p><strong>Total Points in Draw:</strong> {drawDetails.totalPoints.toLocaleString()}</p>
          <h4>Prize Structure: {drawDetails.prizeStructure?.name}</h4>
          {drawDetails.prizeStructure && (
            <ul>
              {drawDetails.prizeStructure.prizes.map((prize, index) => (
                <li key={index}>
                  {prize.name} ({prize.quantity} to be won): {prize.value}
                </li>
              ))}
            </ul>
          )}
          {userRole === 'SUPER_ADMIN' && (
            <button onClick={handleExecuteDraw} disabled={isExecuting || isLoading}>
              {isExecuting ? 'Executing...' : 'Execute Draw'}
            </button>
          )}
          {(userRole === 'ADMIN' || userRole === 'SENIOR_USER') && (
            <p><i>Draw execution is reserved for Super Admins.</i></p>
          )}
        </div>
      )}

      {isExecuting && (
        <div style={{ margin: '15px 0' }}>
          <p><strong>Executing Draw... Please wait for animation to complete (5 seconds).</strong></p>
          <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'lightblue',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px auto'
              }}>
            Spinning...
          </div>
        </div>
      )}

      {drawResults && !isExecuting && (
        <div style={{ marginTop: '20px' }}>
          <h3>Draw Results</h3>
          <table>
            <thead>
              <tr>
                <th>Prize Name</th>
                <th>Winner MSISDN (Masked)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drawResults.map((result: any, index: number) => (
                <tr key={index}>
                  <td>{result.prizeName}</td>
                  <td>{result.winnerMsisdn}</td>
                  <td>{result.isRunnerUp ? `Runner-up ${result.runnerUpRank}` : 'Winner'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DrawExecutionPage;
