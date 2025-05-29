// src/components/PrizeStructure/PrizeStructureList.tsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Popconfirm, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { usePrizeStructure } from '../../hooks/usePrizeStructure';
import { PrizeStructureResponse } from '../../types/api';
import { UUID } from '../../types/common';
import './PrizeStructureList.css';

interface PrizeStructureListProps {
  onEdit: (prizeStructure: PrizeStructureResponse) => void;
  onAdd: () => void;
}

/**
 * Component for displaying and managing prize structures
 */
const PrizeStructureList: React.FC<PrizeStructureListProps> = ({
  onEdit,
  onAdd
}) => {
  const {
    isLoading,
    prizeStructures,
    error,
    loadPrizeStructures,
    deletePrizeStructure
  } = usePrizeStructure();
  
  // Load prize structures on mount
  useEffect(() => {
    loadPrizeStructures();
  }, [loadPrizeStructures]);
  
  // Handle delete
  const handleDelete = async (id: UUID) => {
    try {
      const success = await deletePrizeStructure(id);
      if (success) {
        message.success('Prize structure deleted successfully');
      }
    } catch (err) {
      console.error('Delete error:', err);
      message.error('Failed to delete prize structure');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="prize-structure-name">{text}</span>
      )
    },
    {
      title: 'Valid From',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Valid To',
      dataIndex: 'validTo',
      key: 'validTo',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Prizes',
      dataIndex: 'prizes',
      key: 'prizes',
      render: (prizes: any[]) => (
        <span>{prizes.length} prize{prizes.length !== 1 ? 's' : ''}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PrizeStructureResponse) => (
        <div className="prize-structure-actions">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this prize structure?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      )
    }
  ];
  
  return (
    <div className="prize-structure-list-container">
      <Card 
        title="Prize Structures" 
        className="prize-structure-list-card"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            Add Prize Structure
          </Button>
        }
      >
        {error && (
          <div className="prize-structure-error">
            Failed to load prize structures: {error}
          </div>
        )}
        
        <Table
          dataSource={prizeStructures}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="prize-structure-table"
          expandable={{
            expandedRowRender: (record) => (
              <div className="prize-structure-details">
                <p className="prize-structure-description">{record.description || 'No description provided.'}</p>
                <div className="prize-structure-prizes">
                  <h4>Prizes:</h4>
                  <ul>
                    {record.prizes.map((prize) => (
                      <li key={prize.id}>
                        <strong>{prize.name}</strong> - {prize.description || 'No description'}
                        <br />
                        Value: {prize.value}, Quantity: {prize.quantity}, Runner-ups: {prize.numberOfRunnerUps}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default PrizeStructureList;
