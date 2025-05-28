import React, { useEffect, useState } from 'react';
// Use the default import for AuthContext and the useAuth hook instead
import { useAuth } from '../contexts/AuthContext';
import { getDataUploadAudits } from '../services/auditService';
import type { DataUploadAudit } from '../services/auditService'; // Type-only import
import { BeatLoader } from 'react-spinners'; // Ensure 'react-spinners' is installed

const AuditLogsPage: React.FC = () => {
  const authContext = useAuth(); // Use the hook directly
  const [auditLogs, setAuditLogs] = useState<DataUploadAudit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      // Use isLoadingAuth from context to wait for auth check to complete
      if (authContext && authContext.isLoadingAuth) {
        // Still loading auth state, wait before fetching
        return;
      }

      if (!authContext || !authContext.isAuthenticated) {
        setError('User is not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError('Authentication token not found in storage. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getDataUploadAudits(token); // Pass the token from localStorage
        setAuditLogs(data);
        setError(null);
      } catch (err: any) {
        console.error("Error in fetchAuditLogs:", err);
        setError(err.message || 'Failed to fetch audit logs.');
      } finally {
        setLoading(false);
      }
    };

    // Trigger fetchAuditLogs when authContext changes, especially isLoadingAuth and isAuthenticated
    if (authContext && !authContext.isLoadingAuth) {
      fetchAuditLogs();
    }
  }, [authContext]); // Rerun effect if authContext (and its properties) changes

  const styles = {
    pageContainer: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      color: '#333',
      marginBottom: '20px',
      borderBottom: '2px solid #eee',
      paddingBottom: '10px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as 'collapse',
      marginTop: '20px',
      boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
    },
    th: {
      backgroundColor: '#f8f9fa',
      color: '#333',
      padding: '12px 15px',
      border: '1px solid #dee2e6',
      textAlign: 'left' as 'left',
      fontWeight: 'bold',
    },
    td: {
      padding: '12px 15px',
      border: '1px solid #dee2e6',
      textAlign: 'left' as 'left',
    },
    error: {
      color: 'red',
      marginTop: '20px',
      padding: '10px',
      border: '1px solid red',
      borderRadius: '4px',
      backgroundColor: '#ffebee',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    },
    noLogs: {
      textAlign: 'center' as 'center',
      padding: '20px',
      fontSize: '1.1em',
      color: '#555',
    }
  };

  // Show loading spinner if auth is still loading OR if data is being fetched
  if ((authContext && authContext.isLoadingAuth) || loading) {
    return (
      <div style={styles.pageContainer}>
        <h1 style={styles.header}>Audit Logs</h1>
        <div style={styles.loadingContainer}>
          <BeatLoader color="#007bff" loading={true} size={15} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <h1 style={styles.header}>Audit Logs</h1>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.header}>Audit Logs - Data Uploads</h1>
      {auditLogs.length === 0 ? (
        <p style={styles.noLogs}>No audit logs found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>File Name</th>
              <th style={styles.th}>User ID</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Operation</th>
              <th style={styles.th}>Total Rows</th>
              <th style={styles.th}>Imported</th>
              <th style={styles.th}>Duplicates</th>
              <th style={styles.th}>Errors</th>
              <th style={styles.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td style={styles.td}>{new Date(log.uploadTimestamp).toLocaleString()}</td>
                <td style={styles.td}>{log.fileName}</td>
                <td style={styles.td}>{log.uploadedByUserId}</td>
                <td style={styles.td}>{log.status}</td>
                <td style={styles.td}>{log.operationType}</td>
                <td style={styles.td}>{log.recordCount}</td>
                <td style={styles.td}>{log.successfullyImported}</td>
                <td style={styles.td}>{log.duplicatesSkipped}</td>
                <td style={styles.td}>{log.errorsEncountered}</td>
                <td style={styles.td}>{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditLogsPage;
