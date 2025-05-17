// src/components/AuditLogs/SystemAuditLogsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ensureString, ensureArray } from '../../utils/nullSafety';

interface AuditLog {
  id: string;
  user_id: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
  action_type: string;
  resource_type: string;
  resource_id: string;
  description: string;
  ip_address: string;
  user_agent: string;
  action_details: string;
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

const SystemAuditLogsPage: React.FC = () => {
  const { token, userRole } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [userId, setUserId] = useState<string>('');
  const [actionType, setActionType] = useState<string>('');
  const [resourceType, setResourceType] = useState<string>('');
  const [resourceId, setResourceId] = useState<string>('');
  
  // Available filter options
  const [availableActionTypes, setAvailableActionTypes] = useState<string[]>([]);
  const [availableResourceTypes, setAvailableResourceTypes] = useState<string[]>([]);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  
  // Fetch audit logs with current filters and pagination
  const fetchAuditLogs = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (userId) params.append('user_id', userId);
      if (actionType) params.append('action_type', actionType);
      if (resourceType) params.append('resource_type', resourceType);
      if (resourceId) params.append('resource_id', resourceId);
      params.append('page', page.toString());
      params.append('page_size', meta.page_size.toString());
      
      // Use ensureString utility for null safety
      const response = await axios.get(`${API_URL}/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${ensureString(token)}` }
      });
      
      setAuditLogs(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again later.');
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch available filter options
  const fetchFilterOptions = async () => {
    try {
      // Use ensureString utility for null safety
      const response = await axios.get(`${API_URL}/admin/audit-logs/types`, {
        headers: { Authorization: `Bearer ${ensureString(token)}` }
      });
      
      setAvailableActionTypes(ensureArray(response.data.action_types));
      setAvailableResourceTypes(ensureArray(response.data.resource_types));
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Don't show error toast for this, as it's not critical
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchAuditLogs();
    fetchFilterOptions();
  }, [token]);
  
  // Handle filter form submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditLogs(1); // Reset to first page when applying new filters
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.total_pages) {
      fetchAuditLogs(newPage);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Parse and format action details JSON
  const formatActionDetails = (detailsJson: string) => {
    try {
      const details = JSON.parse(detailsJson);
      return (
        <div className="action-details">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-key">{key}:</span>
              <span className="detail-value">
                {typeof value === 'object' 
                  ? JSON.stringify(value) 
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    } catch (err) {
      return <span className="detail-value">{detailsJson}</span>;
    }
  };
  
  // Check if user has permission to view this page
  const hasPermission = ['SUPER_ADMIN', 'ADMIN'].includes(userRole || '');
  
  if (!hasPermission) {
    return <p>You do not have permission to view this page.</p>;
  }
  
  return (
    <div className="audit-logs-container">
      <h2>System Audit Logs</h2>
      
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
              <label htmlFor="user-id">User ID:</label>
              <input
                type="text"
                id="user-id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Filter by user ID"
                className="form-control"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="action-type">Action Type:</label>
              <select
                id="action-type"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="form-control"
              >
                <option value="">All Action Types</option>
                {availableActionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="resource-type">Resource Type:</label>
              <select
                id="resource-type"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="form-control"
              >
                <option value="">All Resource Types</option>
                {availableResourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="resource-id">Resource ID:</label>
              <input
                type="text"
                id="resource-id"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="Filter by resource ID"
                className="form-control"
              />
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
                setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
                setUserId('');
                setActionType('');
                setResourceType('');
                setResourceId('');
              }}
              disabled={isLoading}
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>
      
      <div className="results-section">
        <div className="results-header">
          <h3>Results ({meta.total})</h3>
          <div className="pagination-info">
            Showing {auditLogs.length} of {meta.total} entries (Page {meta.page} of {meta.total_pages})
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-indicator">Loading audit logs...</div>
        ) : auditLogs.length === 0 ? (
          <div className="no-results">No audit logs found matching the selected filters.</div>
        ) : (
          <div className="audit-logs-table-container">
            <table className="audit-logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Description</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>
                    <td>{log.user?.username || log.user_id}</td>
                    <td>{log.action_type}</td>
                    <td>
                      {log.resource_type}
                      {log.resource_id && <span className="resource-id">: {log.resource_id}</span>}
                    </td>
                    <td>{log.description}</td>
                    <td>
                      {log.action_details && formatActionDetails(log.action_details)}
                      <div className="ip-info">
                        <small>IP: {log.ip_address}</small>
                      </div>
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
        .audit-logs-container {
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
        .reset-filters-button {
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
        
        .apply-filters-button:hover {
          background-color: #40a9ff;
        }
        
        .reset-filters-button:hover {
          background-color: #e8e8e8;
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
        
        .audit-logs-table-container {
          overflow-x: auto;
        }
        
        .audit-logs-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }
        
        .audit-logs-table th,
        .audit-logs-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }
        
        .audit-logs-table th {
          background-color: #fafafa;
          font-weight: 600;
        }
        
        .resource-id {
          color: #888;
          font-size: 0.9em;
        }
        
        .action-details {
          font-size: 0.9em;
          max-width: 300px;
        }
        
        .detail-item {
          margin-bottom: 4px;
        }
        
        .detail-key {
          font-weight: 500;
          margin-right: 5px;
        }
        
        .detail-value {
          word-break: break-word;
        }
        
        .ip-info {
          margin-top: 8px;
          color: #888;
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

export default SystemAuditLogsPage;
