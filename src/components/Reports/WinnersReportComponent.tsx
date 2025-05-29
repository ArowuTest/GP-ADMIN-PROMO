// src/components/Reports/WinnersReportComponent.tsx
import React, { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Button, Input, Select, Space, Tag } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePaginatedApi } from '../../hooks/useApi';
import { WinnerResponse } from '../../types/api';
import { WinnerStatus, PaymentStatus } from '../../types/common';
import dayjs from 'dayjs';
import './WinnersReportComponent.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Component for displaying and filtering winners report
 */
const WinnersReportComponent: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [runnerUpFilter, setRunnerUpFilter] = useState<string | null>(null);
  
  // Fetch winners with pagination and filters
  const {
    data: winners,
    loading,
    pagination,
    changePage,
    fetchData,
    refresh
  } = usePaginatedApi<WinnerResponse>(
    '/admin/reports/winners',
    { page: 1, pageSize: 10 }
  );
  
  // Apply filters
  const handleApplyFilters = () => {
    const filters: any = { page: 1 };
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      filters.startDate = dateRange[0].format('YYYY-MM-DD');
      filters.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    
    if (searchTerm) {
      filters.search = searchTerm;
    }
    
    if (statusFilter) {
      filters.status = statusFilter;
    }
    
    if (paymentFilter) {
      filters.paymentStatus = paymentFilter;
    }
    
    if (runnerUpFilter) {
      filters.isRunnerUp = runnerUpFilter === 'true';
    }
    
    fetchData(filters);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setDateRange(null);
    setSearchTerm('');
    setStatusFilter(null);
    setPaymentFilter(null);
    setRunnerUpFilter(null);
    refresh();
  };
  
  // Export to CSV
  const handleExportCsv = () => {
    // Implementation would call the export API
    // For now, we'll just show a message
    console.log('Exporting winners to CSV...');
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format MSISDN for display
  const formatMsisdn = (msisdn: string) => {
    return msisdn;
  };
  
  // Table columns
  const columns = [
    {
      title: 'Draw Date',
      dataIndex: 'drawDate',
      key: 'drawDate',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'MSISDN',
      dataIndex: 'maskedMsisdn',
      key: 'maskedMsisdn',
      render: (text: string) => (
        <span className="winner-msisdn">{formatMsisdn(text)}</span>
      )
    },
    {
      title: 'Prize',
      dataIndex: 'prizeName',
      key: 'prizeName'
    },
    {
      title: 'Value',
      dataIndex: 'prizeValue',
      key: 'prizeValue',
      render: (value: number) => `${value}`
    },
    {
      title: 'Type',
      dataIndex: 'isRunnerUp',
      key: 'isRunnerUp',
      render: (isRunnerUp: boolean) => (
        isRunnerUp ? 
          <Tag color="blue">Runner-up</Tag> : 
          <Tag color="green">Winner</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`winner-status winner-status-${status.toLowerCase()}`}>
          {status}
        </span>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <span className={`payment-status payment-status-${status.toLowerCase()}`}>
          {status}
        </span>
      )
    },
    {
      title: 'Notified At',
      dataIndex: 'notifiedAt',
      key: 'notifiedAt',
      render: (text: string) => text ? formatDate(text) : 'Not notified'
    }
  ];
  
  return (
    <div className="winners-report-container">
      <Card title="Winners & Runner-ups Report" className="winners-report-card">
        <div className="winners-report-filters">
          <Space direction="vertical" size="middle" className="winners-report-filters-space">
            <div className="filter-row">
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                placeholder={['Start Date', 'End Date']}
                className="date-range-picker"
              />
              <Input
                placeholder="Search by MSISDN"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                className="search-input"
              />
            </div>
            
            <div className="filter-row">
              <Select
                placeholder="Status Filter"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                className="status-filter"
              >
                <Option value={WinnerStatus.CONFIRMED}>Confirmed</Option>
                <Option value={WinnerStatus.NOTIFIED}>Notified</Option>
                <Option value={WinnerStatus.PENDING_NOTIFICATION}>Pending Notification</Option>
                <Option value={WinnerStatus.FORFEITED}>Forfeited</Option>
              </Select>
              
              <Select
                placeholder="Payment Filter"
                value={paymentFilter}
                onChange={setPaymentFilter}
                allowClear
                className="payment-filter"
              >
                <Option value={PaymentStatus.PAID}>Paid</Option>
                <Option value={PaymentStatus.PENDING}>Pending</Option>
                <Option value={PaymentStatus.FAILED}>Failed</Option>
              </Select>
              
              <Select
                placeholder="Type Filter"
                value={runnerUpFilter}
                onChange={setRunnerUpFilter}
                allowClear
                className="runner-up-filter"
              >
                <Option value="false">Winners Only</Option>
                <Option value="true">Runner-ups Only</Option>
              </Select>
              
              <div className="filter-actions">
                <Button type="primary" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </Space>
        </div>
        
        <div className="winners-report-actions">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCsv}
          >
            Export to CSV
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
          >
            Refresh
          </Button>
        </div>
        
        <Table
          dataSource={winners}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.pageSize || 10,
            total: pagination?.totalRows || 0,
            onChange: changePage,
            showTotal: (total) => `Total ${total} winners and runner-ups`
          }}
          className="winners-table"
        />
      </Card>
    </div>
  );
};

export default WinnersReportComponent;
