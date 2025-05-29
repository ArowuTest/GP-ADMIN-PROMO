// src/components/DrawManagement/WinnersDisplay.tsx
import React, { useState } from 'react';
import { Table, Tabs, Button, Tag, Modal, Input, Form, Tooltip } from 'antd';
import { 
  TrophyOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  SwapOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { WinnerResponse } from '../../types/api';
import { WinnerStatus, PaymentStatus, UUID } from '../../types/common';
import './WinnersDisplay.css';

interface WinnersDisplayProps {
  winners: WinnerResponse[];
  loading: boolean;
  onInvokeRunnerUp: (winnerId: UUID) => Promise<boolean>;
  onUpdatePaymentStatus: (winnerId: UUID, status: PaymentStatus, ref?: string, notes?: string) => Promise<boolean>;
}

/**
 * Component to display winners and runner-ups
 */
const WinnersDisplay: React.FC<WinnersDisplayProps> = ({
  winners,
  loading,
  onInvokeRunnerUp,
  onUpdatePaymentStatus
}) => {
  const [activeTab, setActiveTab] = useState<string>('winners');
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [selectedWinner, setSelectedWinner] = useState<WinnerResponse | null>(null);
  const [form] = Form.useForm();

  // Filter winners and runner-ups
  const mainWinners = winners.filter(winner => !winner.isRunnerUp);
  const runnerUps = winners.filter(winner => winner.isRunnerUp);

  // Handle invoking runner-up
  const handleInvokeRunnerUp = (winner: WinnerResponse) => {
    Modal.confirm({
      title: 'Invoke Runner-up',
      content: `Are you sure you want to invoke a runner-up for ${winner.maskedMsisdn}? This will mark the current winner as forfeited.`,
      onOk: async () => {
        try {
          const success = await onInvokeRunnerUp(winner.id);
          if (success) {
            Modal.success({
              title: 'Runner-up Invoked',
              content: 'The runner-up has been successfully invoked.'
            });
          }
        } catch (err) {
          Modal.error({
            title: 'Error',
            content: 'Failed to invoke runner-up. Please try again.'
          });
        }
      }
    });
  };

  // Handle updating payment status
  const handleUpdatePaymentStatus = (winner: WinnerResponse) => {
    setSelectedWinner(winner);
    form.setFieldsValue({
      paymentStatus: winner.paymentStatus,
      paymentRef: winner.paymentRef || '',
      paymentNotes: winner.paymentNotes || ''
    });
    setPaymentModalVisible(true);
  };

  // Submit payment status update
  const handlePaymentFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedWinner) {
        const success = await onUpdatePaymentStatus(
          selectedWinner.id,
          values.paymentStatus as PaymentStatus,
          values.paymentRef,
          values.paymentNotes
        );
        
        if (success) {
          setPaymentModalVisible(false);
        } else {
          Modal.error({
            title: 'Error',
            content: 'Failed to update payment status. Please try again.'
          });
        }
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Get status tag color
  const getStatusTagColor = (status: WinnerStatus): string => {
    switch (status) {
      case WinnerStatus.CONFIRMED:
        return 'green';
      case WinnerStatus.NOTIFIED:
        return 'blue';
      case WinnerStatus.PENDING_NOTIFICATION:
        return 'orange';
      case WinnerStatus.FORFEITED:
        return 'red';
      default:
        return 'default';
    }
  };

  // Get payment status tag color
  const getPaymentStatusTagColor = (status: PaymentStatus): string => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'green';
      case PaymentStatus.PENDING:
        return 'orange';
      case PaymentStatus.FAILED:
        return 'red';
      default:
        return 'default';
    }
  };

  // Table columns
  const columns = [
    {
      title: 'MSISDN',
      dataIndex: 'maskedMsisdn',
      key: 'maskedMsisdn',
      render: (text: string) => (
        <span className="winner-msisdn">
          <UserOutlined /> {text}
        </span>
      )
    },
    {
      title: 'Prize',
      dataIndex: 'prizeName',
      key: 'prizeName',
      render: (text: string, record: WinnerResponse) => (
        <Tooltip title={`Value: ${record.prizeValue}`}>
          <span className="winner-prize">
            <TrophyOutlined /> {text}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: WinnerStatus) => (
        <Tag color={getStatusTagColor(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: PaymentStatus, record: WinnerResponse) => (
        <Tag color={getPaymentStatusTagColor(status)}>
          {status}
          {record.paymentRef && (
            <Tooltip title={`Ref: ${record.paymentRef}`}>
              <span className="payment-ref-indicator"> *</span>
            </Tooltip>
          )}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WinnerResponse) => (
        <div className="winner-actions">
          {!record.isRunnerUp && (
            <Button 
              icon={<SwapOutlined />} 
              size="small" 
              onClick={() => handleInvokeRunnerUp(record)}
              disabled={record.status === WinnerStatus.FORFEITED}
            >
              Invoke Runner-up
            </Button>
          )}
          <Button 
            icon={<DollarOutlined />} 
            size="small" 
            onClick={() => handleUpdatePaymentStatus(record)}
          >
            Update Payment
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="winners-display-container">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'winners',
            label: (
              <span>
                <TrophyOutlined />
                Winners ({mainWinners.length})
              </span>
            ),
            children: (
              <Table 
                dataSource={mainWinners} 
                columns={columns} 
                rowKey="id"
                loading={loading}
                pagination={false}
                className="winners-table"
              />
            )
          },
          {
            key: 'runnerUps',
            label: (
              <span>
                <UserOutlined />
                Runner-ups ({runnerUps.length})
              </span>
            ),
            children: (
              <Table 
                dataSource={runnerUps} 
                columns={columns} 
                rowKey="id"
                loading={loading}
                pagination={false}
                className="winners-table"
              />
            )
          }
        ]}
      />

      <Modal
        title="Update Payment Status"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onOk={handlePaymentFormSubmit}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="paymentStatus"
            label="Payment Status"
            rules={[{ required: true, message: 'Please select payment status' }]}
          >
            <select className="payment-status-select">
              <option value={PaymentStatus.PENDING}>{PaymentStatus.PENDING}</option>
              <option value={PaymentStatus.PAID}>{PaymentStatus.PAID}</option>
              <option value={PaymentStatus.FAILED}>{PaymentStatus.FAILED}</option>
            </select>
          </Form.Item>
          <Form.Item
            name="paymentRef"
            label="Payment Reference"
          >
            <Input placeholder="Enter payment reference" />
          </Form.Item>
          <Form.Item
            name="paymentNotes"
            label="Payment Notes"
          >
            <Input.TextArea placeholder="Enter payment notes" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WinnersDisplay;
