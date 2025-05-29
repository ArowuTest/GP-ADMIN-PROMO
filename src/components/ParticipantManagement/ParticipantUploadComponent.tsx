// src/components/ParticipantManagement/ParticipantUploadComponent.tsx
import React, { useState, useRef } from 'react';
import { Card, Upload, Button, Progress, Alert, Table, Popconfirm, message } from 'antd';
import { UploadOutlined, InboxOutlined, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useParticipantUpload } from '../../hooks/useParticipantUpload';
import { usePaginatedApi } from '../../hooks/useApi';
import { DataUploadAuditResponse } from '../../types/api';
import { UploadStatus } from '../../types/common';
import './ParticipantUploadComponent.css';

const { Dragger } = Upload;

/**
 * Component for uploading participant data via CSV
 */
const ParticipantUploadComponent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadRef = useRef<any>(null);
  
  // Initialize hooks
  const {
    isUploading,
    uploadProgress,
    uploadResult,
    error,
    validationErrors,
    uploadCsvFile,
    deleteUpload,
    resetUploadState
  } = useParticipantUpload();
  
  // Fetch upload audit history
  const {
    data: uploadHistory,
    loading: isLoadingHistory,
    pagination,
    changePage,
    refresh: refreshHistory
  } = usePaginatedApi<DataUploadAuditResponse>(
    '/admin/participants/uploads',
    { page: 1, pageSize: 10 }
  );
  
  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    return false; // Prevent automatic upload
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      message.error('Please select a CSV file to upload');
      return;
    }
    
    try {
      await uploadCsvFile(selectedFile);
      setSelectedFile(null);
      if (uploadRef.current) {
        uploadRef.current.fileList = [];
      }
      refreshHistory();
    } catch (err) {
      console.error('Upload error:', err);
    }
  };
  
  // Handle upload deletion
  const handleDeleteUpload = async (uploadId: string) => {
    try {
      const success = await deleteUpload(uploadId);
      if (success) {
        message.success('Upload deleted successfully');
        refreshHistory();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };
  
  // Reset upload state
  const handleReset = () => {
    resetUploadState();
    setSelectedFile(null);
    if (uploadRef.current) {
      uploadRef.current.fileList = [];
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case UploadStatus.COMPLETED:
        return 'green';
      case UploadStatus.PROCESSING:
        return 'blue';
      case UploadStatus.PENDING:
        return 'orange';
      case UploadStatus.FAILED:
        return 'red';
      default:
        return 'default';
    }
  };
  
  // Upload history columns
  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string) => (
        <span className="upload-history-filename">
          <FileExcelOutlined /> {text}
        </span>
      )
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy'
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <span className={`upload-status upload-status-${text.toLowerCase()}`}>
          {text}
        </span>
      )
    },
    {
      title: 'Records',
      dataIndex: 'totalUploaded',
      key: 'totalUploaded'
    },
    {
      title: 'Imported',
      dataIndex: 'successfullyImported',
      key: 'successfullyImported'
    },
    {
      title: 'Duplicates',
      dataIndex: 'duplicatesSkipped',
      key: 'duplicatesSkipped'
    },
    {
      title: 'Errors',
      dataIndex: 'errorsEncountered',
      key: 'errorsEncountered'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DataUploadAuditResponse) => (
        <Popconfirm
          title="Are you sure you want to delete this upload?"
          onConfirm={() => handleDeleteUpload(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      )
    }
  ];
  
  return (
    <div className="participant-upload-container">
      <Card title="Upload Participants" className="upload-card">
        {validationErrors.length > 0 && (
          <Alert
            message="Validation Errors"
            description={
              <ul className="validation-error-list">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            type="error"
            showIcon
            className="upload-validation-alert"
          />
        )}
        
        {error && (
          <Alert
            message="Upload Error"
            description={error}
            type="error"
            showIcon
            className="upload-error-alert"
          />
        )}
        
        {uploadResult && (
          <Alert
            message="Upload Successful"
            description={
              <div>
                <p>File: <strong>{uploadResult.fileName}</strong></p>
                <p>Total records: <strong>{uploadResult.totalUploaded}</strong></p>
                <p>Successfully imported: <strong>{uploadResult.successfullyImported}</strong></p>
                <p>Duplicates skipped: <strong>{uploadResult.duplicatesSkipped}</strong></p>
                <p>Errors encountered: <strong>{uploadResult.errorsEncountered}</strong></p>
              </div>
            }
            type="success"
            showIcon
            className="upload-success-alert"
            closable
            onClose={handleReset}
          />
        )}
        
        {!uploadResult && (
          <>
            <Dragger
              ref={uploadRef}
              name="file"
              multiple={false}
              beforeUpload={handleFileSelect}
              showUploadList={true}
              accept=".csv"
              disabled={isUploading}
              className="upload-dragger"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
              <p className="ant-upload-hint">
                The CSV file should contain MSISDN and points data for participants.
                Each MSISDN with N points will be entered N times in the draw.
              </p>
            </Dragger>
            
            {isUploading && (
              <div className="upload-progress">
                <Progress percent={Math.round(uploadProgress)} status="active" />
              </div>
            )}
            
            <div className="upload-actions">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                loading={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
              
              <Button onClick={handleReset} disabled={isUploading || (!selectedFile && !error)}>
                Reset
              </Button>
            </div>
          </>
        )}
      </Card>
      
      <Card title="Upload History" className="upload-history-card">
        <Table
          dataSource={uploadHistory}
          columns={columns}
          rowKey="id"
          loading={isLoadingHistory}
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.pageSize || 10,
            total: pagination?.totalRows || 0,
            onChange: changePage
          }}
          className="upload-history-table"
        />
      </Card>
    </div>
  );
};

export default ParticipantUploadComponent;
