// src/components/Reports/WinnersReportPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ensureString } from '../../utils/nullSafety';

interface Winner {
  id: string;
  msisdn: string;
  draw_id: string;
  prize_tier_id: string;
  prize_tier: {
    name: string;
    value: string;
  };
  is_runner_up: boolean;
  runner_up_rank: number;
  is_claimed: boolean;
  claim_date: string | null;
  created_at: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const WinnersReportPage: React.FC = () => {
  const { token, userRole } = useAuth();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [msisdn, setMsisdn] = useState<string>('');
  const [prizeTier, setPrizeTier] = useState<string>('');
  const [isRunnerUp, setIsRunnerUp] = useState<string>('');
  const [isClaimed, setIsClaimed] = useState<string>('');
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  
  // Fetch winners with current filters and pagination
  const fetchWinners = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (msisdn) params.append('msisdn', msisdn);
      if (prizeTier) params.append('prize_tier_id', prizeTier);
      if (isRunnerUp) params.append('is_runner_up', isRunnerUp);
      if (isClaimed) params.append('is_claimed', isClaimed);
      params.append('page', page.toString());
      params.append('page_size', meta.page_size.toString());
      
      // Use ensureString utility for null safety
      const response = await axios.get(`${API_URL}/admin/winners?${params.toString()}`, {
        headers: { Authorization: `Bearer ${ensureString(token)}` }
      });
      
      setWinners(response.data.data || []);
      setMeta(response.data.meta || {
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
        has_next: false,
        has_prev: false
      });
    } catch (err) {
      console.error('Error fetching winners:', err);
      setError('Failed to load winners. Please try again later.');
      toast.error('Failed to load winners');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchWinners();
  }, [token]);
  
  // Handle filter form submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWinners(1); // Reset to first page when applying new filters
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.total_pages) {
      fetchWinners(newPage);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Mask MSISDN (show only first 3 and last 3 digits)
  const maskMSISDN = (msisdn: string): string => {
    if (msisdn.length <= 6) return msisdn;
    return `${msisdn.substring(0, 3)}***${msisdn.substring(msisdn.length - 3)}`;
  };
  
  // Export winners to CSV
  const exportToCSV = async () => {
    try {
      // Use ensureString utility for null safety
      const response = await axios.get(`${API_URL}/admin/winners/export`, {
        headers: { Authorization: `Bearer ${ensureString(token)}` },
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `winners_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Winners report exported successfully');
    } catch (err) {
      console.error('Error exporting winners:', err);
      toast.error('Failed to export winners report');
    }
  };
  
  // Check if user has permission to view this page
  const hasPermission = ['SUPER_ADMIN', 'ADMIN', 'SENIOR_USER', 'WINNERS_REPORT_USER', 'ALL_REPORT_USER'].includes(userRole || '');
  
  if (!hasPermission) {
    return <p>You do not have permission to view this page.</p>;
  }
  
  return (
    <div className="winners-report-container">
      <h2>Winners Report</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-section">
        <h3>Filters</h3>
        <form onSubmit={handleFilterSubmit}>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="start-date">Start Date:</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="end-date">End Date:</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="msisdn">MSISDN:</label>
              <input
                type="text"
                id="msisdn"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                placeholder="Filter by phone number"
                className="form-control"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="prize-tier">Prize Tier:</label>
              <select
                id="prize-tier"
                value={prizeTier}
                onChange={(e) => setPrizeTier(e.target.value)}
                className="form-control"
              >
                <option value="">All Prize Tiers</option>
                <option value="1">Grand Prize</option>
                <option value="2">First Prize</option>
                <option value="3">Second Prize</option>
                <option value="4">Third Prize</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="is-runner-up">Runner-up Status:</label>
              <select
                id="is-runner-up"
                value={isRunnerUp}
                onChange={(e) => setIsRunnerUp(e.target.value)}
                className="form-control"
              >
                <option value="">All</option>
                <option value="true">Runner-ups Only</option>
                <option value="false">Winners Only</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="is-claimed">Claim Status:</label>
              <select
                id="is-claimed"
                value={isClaimed}
                onChange={(e) => setIsClaimed(e.target.value)}
                className="form-control"
              >
                <option value="">All</option>
                <option value="true">Claimed</option>
                <option value="false">Unclaimed</option>
              </select>
            </div>
          </div>
          
          <div className="filter-actions">
            <button type="submit" className="apply-filters-button" disabled={isLoading}>
              Apply Filters
            </button>
            <button
              type="button"
              className="reset-filters-button"
              onClick={() => {
                setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
                setMsisdn('');
                setPrizeTier('');
                setIsRunnerUp('');
                setIsClaimed('');
              }}
              disabled={isLoading}
            >
              Reset Filters
            </button>
            <button
              type="button"
              className="export-button"
              onClick={exportToCSV}
              disabled={isLoading}
            >
              Export to CSV
            </button>
          </div>
        </form>
      </div>
      
      <div className="results-section">
        <div className="results-header">
          <h3>Results ({meta.total})</h3>
          <div className="pagination-info">
            Showing {winners.length} of {meta.total} entries (Page {meta.page} of {meta.total_pages})
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-indicator">Loading winners...</div>
        ) : winners.length === 0 ? (
          <div className="no-results">No winners found matching the selected filters.</div>
        ) : (
          <div className="winners-table-container">
            <table className="winners-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>MSISDN</th>
                  <th>Prize</th>
                  <th>Status</th>
                  <th>Claimed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner) => (
                  <tr key={winner.id} className={winner.is_runner_up ? 'runner-up-row' : 'winner-row'}>
                    <td>{formatDate(winner.created_at)}</td>
                    <td>{maskMSISDN(winner.msisdn)}</td>
                    <td>
                      {winner.prize_tier?.name || 'Unknown'} 
                      <span className="prize-value">({winner.prize_tier?.value || 'N/A'})</span>
                    </td>
                    <td>{winner.is_runner_up ? `Runner-up ${winner.runner_up_rank}` : 'Winner'}</td>
                    <td>
                      <span className={`claim-status ${winner.is_claimed ? 'claimed' : 'unclaimed'}`}>
                        {winner.is_claimed ? 'Yes' : 'No'}
                      </span>
                      {winner.is_claimed && winner.claim_date && (
                        <div className="claim-date">
                          <small>{formatDate(winner.claim_date)}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <button className="view-details-button">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {meta.total_pages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(1)}
              disabled={!meta.has_prev || isLoading}
              className="pagination-button"
            >
              &laquo; First
            </button>
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={!meta.has_prev || isLoading}
              className="pagination-button"
            >
              &lsaquo; Prev
            </button>
            
            <span className="pagination-info">
              Page {meta.page} of {meta.total_pages}
            </span>
            
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.has_next || isLoading}
              className="pagination-button"
            >
              Next &rsaquo;
            </button>
            <button
              onClick={() => handlePageChange(meta.total_pages)}
              disabled={!meta.has_next || isLoading}
              className="pagination-button"
            >
              Last &raquo;
            </button>
          </div>
        )}
      </div>
      
      <style>
        {`
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
          margin-bottom: 15px;
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
        
        .filter-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .apply-filters-button,
        .reset-filters-button,
        .export-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .apply-filters-button {
          background-color: #1890ff;
          color: white;
        }
        
        .reset-filters-button {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .export-button {
          background-color: #52c41a;
          color: white;
          margin-left: auto;
        }
        
        .apply-filters-button:hover {
          background-color: #40a9ff;
        }
        
        .reset-filters-button:hover {
          background-color: #e8e8e8;
        }
        
        .export-button:hover {
          background-color: #73d13d;
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
        
        .winners-table-container {
          overflow-x: auto;
        }
        
        .winners-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
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
        
        .prize-value {
          color: #52c41a;
          margin-left: 5px;
          font-size: 0.9em;
        }
        
        .claim-status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.9em;
        }
        
        .claim-status.claimed {
          background-color: #f6ffed;
          color: #52c41a;
        }
        
        .claim-status.unclaimed {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        .claim-date {
          margin-top: 4px;
          color: #888;
        }
        
        .view-details-button {
          padding: 5px 10px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .view-details-button:hover {
          background-color: #40a9ff;
        }
        
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 10px;
        }
        
        .pagination-button {
          padding: 6px 12px;
          background-color: #f5f5f5;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .pagination-button:hover {
          background-color: #e8e8e8;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          margin: 0 10px;
        }
        
        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            gap: 10px;
          }
          
          .filter-group {
            width: 100%;
          }
          
          .filter-actions {
            flex-wrap: wrap;
          }
          
          .export-button {
            margin-left: 0;
            margin-top: 10px;
            width: 100%;
          }
          
          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
        `}
      </style>
    </div>
  );
};

export default WinnersReportPage;
