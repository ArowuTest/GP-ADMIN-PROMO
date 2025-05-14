import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getDataUploadAudits, DataUploadAudit } from '../services/auditService'; // Assuming auditService.ts is in a services folder
import { BeatLoader } from 'react-spinners';

const AuditLogsPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [auditLogs, setAuditLogs] = useState<DataUploadAudit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!authContext || !authContext.token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getDataUploadAudits(authContext.token);
        setAuditLogs(data);
        setError(null);
      } catch (err: any) {
        console.error("Error in fetchAuditLogs:", err);
        setError(err.message || 'Failed to fetch audit logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [authContext]);

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

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <h1 style={styles.header}>Audit Logs</h1>
        <div style={styles.loadingContainer}>
            <BeatLoader color="#007bff" loading={loading} size={15} />
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
                <td style={styles.td}>{new Date(log.upload_timestamp).toLocaleString()}</td>
                <td style={styles.td}>{log.file_name}</td>
                <td style={styles.td}>{log.uploaded_by_user_id}</td>
                <td style={styles.td}>{log.status}</td>
                <td style={styles.td}>{log.operation_type}</td>
                <td style={styles.td}>{log.record_count}</td>
                <td style={styles.td}>{log.successfully_imported}</td>
                <td style={styles.td}>{log.duplicates_skipped}</td>
                <td style={styles.td}>{log.errors_encountered}</td>
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

