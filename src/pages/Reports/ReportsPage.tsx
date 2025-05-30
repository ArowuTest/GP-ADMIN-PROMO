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
    link.setAttribute('download', `mtn-mega-billion-winners-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MTN Mega Billion Reports</h1>
        <p className="page-description">View and export reports for the MTN Mega Billion promotion</p>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <span className="material-icons">error</span>
          <span>{error}</span>
        </div>
      )}
      
      <div className="page-content">
        <div className="card winners-report-card">
          <div className="card-header">
            <h2>
              <span className="material-icons">emoji_events</span>
              Winners Report
            </h2>
            
            <div className="header-actions">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleExportCSV}
                disabled={loading || filteredWinners.length === 0}
              >
                <span className="material-icons">download</span>
                Export CSV
              </button>
            </div>
          </div>
          
          <div className="card-body">
            <div className="filter-controls">
              <div className="search-control">
                <span className="material-icons search-icon">search</span>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search by MSISDN or prize..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-control">
                <label htmlFor="status-filter">Status:</label>
                <select
                  id="status-filter"
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="claimed">Claimed</option>
                  <option value="forfeited">Forfeited</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading winners data...</p>
              </div>
            ) : filteredWinners.length > 0 ? (
              <div className="table-responsive">
                <table className="table winners-table">
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
                            <span className="status-badge status-success">Yes</span>
                          ) : (
                            <span className="status-badge status-neutral">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="material-icons empty-icon">search_off</span>
                <p>No winners found matching the current filters.</p>
                <p>Try adjusting your search criteria or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
