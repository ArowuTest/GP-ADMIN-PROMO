// src/pages/Reports/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { drawService, WinnerData } from '../../services/drawService';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
  const { token } = useAuth();
  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [filteredWinners, setFilteredWinners] = useState<WinnerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchWinners = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch winners from API
        const data = await drawService.listWinners(token);
        setWinners(data);
        setFilteredWinners(data);
      } catch (err: any) {
        console.error('Error fetching winners:', err);
        setError(`Failed to load winners: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, [token]);

  useEffect(() => {
    // Apply filters when search term or filter status changes
    let results = winners;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(winner => 
        winner.msisdn.includes(searchTerm) || 
        winner.prizeTierName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      results = results.filter(winner => winner.status.toLowerCase() === filterStatus);
    }
    
    setFilteredWinners(results);
  }, [searchTerm, filterStatus, winners]);

  // Format MSISDN to show only first 3 and last 3 digits
  const formatMSISDN = (msisdn: string) => {
    if (msisdn.length <= 6) return msisdn;
    return `${msisdn.substring(0, 3)}****${msisdn.substring(msisdn.length - 3)}`;
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['MSISDN', 'Prize', 'Value', 'Draw Date', 'Status', 'Payment Status'];
    const rows = filteredWinners.map(winner => [
      winner.msisdn,
      winner.prizeTierName,
      winner.prizeValue,
      new Date(winner.createdAt).toLocaleDateString(),
      winner.status,
      winner.paymentStatus
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `winners-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-page">
      <h1>Reports</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="winners-report-panel">
        <h2>Winners Report</h2>
        
        <div className="report-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by MSISDN or prize..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="claimed">Claimed</option>
              <option value="forfeited">Forfeited</option>
            </select>
          </div>
          
          <button 
            className="export-button"
            onClick={handleExportCSV}
            disabled={loading || filteredWinners.length === 0}
          >
            Export CSV
          </button>
        </div>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading winners data...</p>
          </div>
        ) : filteredWinners.length > 0 ? (
          <table className="winners-table">
            <thead>
              <tr>
                <th>MSISDN</th>
                <th>Prize</th>
                <th>Value</th>
                <th>Draw Date</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Runner-up</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.map(winner => (
                <tr key={winner.id}>
                  <td>{formatMSISDN(winner.msisdn)}</td>
                  <td>{winner.prizeTierName}</td>
                  <td>{winner.prizeValue}</td>
                  <td>{new Date(winner.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${winner.status.toLowerCase()}`}>
                      {winner.status}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${winner.paymentStatus.toLowerCase()}`}>
                      {winner.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {winner.isRunnerUp ? (
                      <span className="runner-up-badge">Yes</span>
                    ) : (
                      <span>No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-winners-message">
            <p>No winners found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
