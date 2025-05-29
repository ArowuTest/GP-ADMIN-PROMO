// src/components/ParticipantManagement/ParticipantListComponent.tsx
import React, { useState } from 'react';
import { Card, Table, Input, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePaginatedApi } from '../../hooks/useApi';
import { ParticipantResponse } from '../../types/api';
import './ParticipantListComponent.css';

const { Search } = Input;

/**
 * Component for displaying and searching participant data
 */
const ParticipantListComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch participant data with pagination
  const {
    data: participants,
    loading,
    pagination,
    changePage,
    changePageSize,
    fetchData,
    refresh
  } = usePaginatedApi<ParticipantResponse>(
    '/admin/participants',
    { page: 1, pageSize: 10 }
  );
  
  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchData({ page: 1, search: value });
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setSearchTerm('');
    refresh();
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Table columns
  const columns = [
    {
      title: 'MSISDN',
      dataIndex: 'msisdn',
      key: 'msisdn',
      render: (text: string) => (
        <span className="participant-msisdn">{text}</span>
      )
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      sorter: (a: ParticipantResponse, b: ParticipantResponse) => a.points - b.points,
      render: (points: number) => (
        <span className="participant-points">{points}</span>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => formatDate(text)
    }
  ];
  
  return (
    <div className="participant-list-container">
      <Card title="Participant List" className="participant-list-card">
        <div className="participant-list-actions">
          <Search
            placeholder="Search by MSISDN"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="participant-search"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            className="participant-refresh-btn"
          >
            Refresh
          </Button>
        </div>
        
        <Table
          dataSource={participants}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.pageSize || 10,
            total: pagination?.totalRows || 0,
            onChange: changePage,
            onShowSizeChange: (_, size) => changePageSize(size),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} participants`
          }}
          className="participant-table"
        />
      </Card>
    </div>
  );
};

export default ParticipantListComponent;
