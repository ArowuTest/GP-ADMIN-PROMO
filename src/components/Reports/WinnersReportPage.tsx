// src/components/Reports/WinnersReportPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { drawService } from '../../services/drawService';
import { toast } from 'react-toastify';

interface Winner {
  id: string;
  msisdn: string;
  prizeName: string;
  drawDate: string;
  prizeValue: string;
  status: string;
  isRunnerUp: boolean;
  runnerUpRank: number;
}

const WinnersReportPage: React.FC = () => {
  const { token, userRole } = useAuth();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [prizeFilter, setPrizeFilter] = useState<string>('all');
  const [showRunnerUps, setShowRunnerUps] = useState<boolean>(true);

  useEffect(() => {
    const fetchWinners = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allWinners = await drawService.listWinners(token);
        
        // Transform the data for display
        const transformedWinners = allWinners.map(winner => ({
          id: winner.id,
          msisdn: maskMSISDN(winner.msisdn),
          prizeName: winner.prizeTier?.name || 'Unknown Prize',
          drawDate: new Date(winner.createdAt).toLocaleDateString(),
          prizeValue: winner.prizeTier?.value || 'Unknown Value',
          status: winner.status,
          isRunnerUp: winner.isRunnerUp,
          runnerUpRank: winner.runnerUpRank
        }));
        
        setWinners(transformedWinners);
        setFilteredWinners(transformedWinners);
      } catch (err) {
        console.error('Error fetching winners:', err);
        setError('Failed to load winners data. Please try again later.');
        toast.error('Failed to load winners data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWinners();
  }, [token]);

  useEffect(() => {
    // Apply filters whenever filter states change
    let result = [...winners];
    
    // Apply search term filter (MSISDN)
    if (searchTerm) {
      result = result.filter(winner => 
        winner.msisdn.includes(searchTerm)
      );
    }
    
    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      result = result.filter(winner => {
        const winDate = new Date(winner.drawDate);
        return winDate >= startDate && winDate <= endDate;
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(winner => winner.status === statusFilter);
    }
    
    // Apply prize filter
    if (prizeFilter !== 'all') {
      result = result.filter(winner => winner.prizeName === prizeFilter);
    }
    
    // Apply runner-up filter
    if (!showRunnerUps) {
      result = result.filter(winner => !winner.isRunnerUp);
    }
    
    setFilteredWinners(result);
  }, [winners, searchTerm, dateRange, statusFilter, prizeFilter, showRunnerUps]);

  // Helper function to mask MSISDN (show only first 3 and last 3 digits)
  const maskMSISDN = (msisdn: string): string => {
    if (msisdn.length <= 6) return msisdn;
    return `${msisdn.substring(0, 3)}***${msisdn.substring(msisdn.length - 3)}`;
  };

  // Get unique prize names for filter dropdown
  const uniquePrizes = Array.from(new Set(winners.map(winner => winner.prizeName)));
  
  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(winners.map(winner => winner.status)));

  // Check if user has permission to view this page
  const hasPermission = ['SUPER_ADMIN', 'ADMIN', 'SENIOR_USER', 'WINNERS_REPORT_USER', 'ALL_REPORT_USER'].includes(userRole);
  
  if (!hasPermission) {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="winners-report-container">
      <h2>Winners Report</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search-msisdn">Search MSISDN:</label>
            <input
              type="text"
              id="search-msisdn"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter MSISDN..."
              className="form-control"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="date-start">Date Range:</label>
            <div className="date-range-inputs">
              <input
                type="date"
                id="date-start"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="form-control"
              />
              <span>to</span>
              <input
                type="date"
                id="date-end"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="form-control"
              />
            </div>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="prize-filter">Prize:</label>
            <select
              id="prize-filter"
              value={prizeFilter}
              onChange={(e) => setPrizeFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">All Prizes</option>
              {uniquePrizes.map(prize => (
                <option key={prize} value={prize}>{prize}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={showRunnerUps}
                onChange={(e) => setShowRunnerUps(e.target.checked)}
              />
              Show Runner-ups
            </label>
          </div>
        </div>
      </div>
      
      <div className="results-section">
        <div className="results-header">
          <h3>Results ({filteredWinners.length})</h3>
          <button className="export-button">Export to CSV</button>
        </div>
        
        {isLoading ? (
          <div className="loading-indicator">Loading winners data...</div>
        ) : filteredWinners.length === 0 ? (
          <div className="no-results">No winners found matching the selected filters.</div>
        ) : (
          <table className="winners-table">
            <thead>
              <tr>
                <th>MSISDN</th>
                <th>Draw Date</th>
                <th>Prize</th>
                <th>Value</th>
                <th>Status</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.map((winner) => (
                <tr key={winner.id} className={winner.isRunnerUp ? 'runner-up-row' : 'winner-row'}>
                  <td>{winner.msisdn}</td>
                  <td>{winner.drawDate}</td>
                  <td>{winner.prizeName}</td>
                  <td>{winner.prizeValue}</td>
                  <td>{winner.status}</td>
                  <td>{winner.isRunnerUp ? `Runner-up ${winner.runnerUpRank}` : 'Winner'}</td>
                  <td>
                    <button className="view-details-button">View Details</button>
                    {winner.status === 'Pending' && (
                      <button className="update-status-button">Update Status</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <style jsx>{`
        .winners-report-container {
          padding: 20px;
        }
        
        .error-message {
          padding: 10px;
          margin-bottom: 15px;
          background-color: #fff1f0;
          border: 1px solid #ffa39e;
          border-radius: 4px;
          color: #f5222d;
        }
        
        .filters-section {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid #eee;
        }
        
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 10px;
        }
        
        .filter-group {
          flex: 1;
          min-width: 200px;
        }
        
        .filter-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .date-range-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .date-range-inputs span {
          margin: 0 5px;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          margin-top: 25px;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .results-section {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          border: 1px solid #eee;
        }
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .export-button {
          padding: 8px 16px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .export-button:hover {
          background-color: #40a9ff;
        }
        
        .loading-indicator {
          text-align: center;
          padding: 20px;
          color: #1890ff;
        }
        
        .no-results {
          text-align: center;
          padding: 20px;
          color: #888;
        }
        
        .winners-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .winners-table th,
        .winners-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .winners-table th {
          background-color: #fafafa;
          font-weight: 600;
        }
        
        .winner-row {
          background-color: #f6ffed;
        }
        
        .runner-up-row {
          background-color: #fcfcfc;
        }
        
        .view-details-button,
        .update-status-button {
          padding: 5px 10px;
          margin-right: 5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .view-details-button {
          background-color: #1890ff;
          color: white;
        }
        
        .update-status-button {
          background-color: #faad14;
          color: white;
        }
        
        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            gap: 10px;
          }
          
          .filter-group {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default WinnersReportPage;
