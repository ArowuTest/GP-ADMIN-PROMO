// src/components/DrawManagement/RunnerUpInvocationModal.tsx
import React, { useState } from 'react';
import { drawService } from '../../services/drawService';
import { toast } from 'react-toastify';

interface RunnerUpInvocationModalProps {
  winner: {
    id: string;
    msisdn: string;
    prizeName: string;
  };
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

const RunnerUpInvocationModal: React.FC<RunnerUpInvocationModalProps> = ({
  winner,
  onClose,
  onSuccess,
  token
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for invoking the runner-up');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use empty string as fallback if token is null
      // Updated to match the correct method signature (removed reason parameter)
      await drawService.invokeRunnerUp(winner.id, token || '');
      toast.success('Runner-up successfully invoked');
      onSuccess();
    } catch (err) {
      console.error('Error invoking runner-up:', err);
      setError(`Failed to invoke runner-up: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error('Failed to invoke runner-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Invoke Runner-Up</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-content">
          <p>
            You are about to invoke a runner-up for the following winner:
          </p>
          
          <div className="winner-info">
            <p><strong>MSISDN:</strong> {winner.msisdn}</p>
            <p><strong>Prize:</strong> {winner.prizeName}</p>
          </div>
          
          <p className="warning-text">
            This action will mark the current winner as forfeited and promote the next eligible runner-up.
            This action cannot be undone.
          </p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reason">Reason for Forfeit:</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason why the winner is forfeiting the prize..."
                rows={4}
                className="form-control"
                required
              />
            </div>
            
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="confirm-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Forfeit & Invoke Runner-Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>
        {`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #333;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }
        
        .modal-content {
          padding: 20px;
        }
        
        .winner-info {
          background-color: #f9f9f9;
          border-radius: 4px;
          padding: 12px;
          margin: 15px 0;
        }
        
        .winner-info p {
          margin: 5px 0;
        }
        
        .warning-text {
          color: #ff4d4f;
          font-weight: 500;
          margin: 15px 0;
        }
        
        .error-message {
          padding: 10px;
          margin: 15px 0;
          background-color: #fff1f0;
          border: 1px solid #ffa39e;
          border-radius: 4px;
          color: #f5222d;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          resize: vertical;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .cancel-button,
        .confirm-button {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
        }
        
        .cancel-button {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .confirm-button {
          background-color: #ff4d4f;
          color: white;
        }
        
        .cancel-button:hover {
          background-color: #e8e8e8;
        }
        
        .confirm-button:hover {
          background-color: #ff7875;
        }
        
        .cancel-button:disabled,
        .confirm-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        `}
      </style>
    </div>
  );
};

export default RunnerUpInvocationModal;
