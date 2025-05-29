// src/components/PrizeStructure/PrizeStructureForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, Card, Divider, Space, InputNumber, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { PrizeStructureResponse, PrizeStructureCreateRequest, PrizeStructureUpdateRequest } from '../../types/api';
import { UUID } from '../../types/common';
import dayjs from 'dayjs';
import './PrizeStructureForm.css';

interface PrizeStructureFormProps {
  initialValues?: PrizeStructureResponse;
  onSubmit: (values: PrizeStructureCreateRequest | PrizeStructureUpdateRequest) => Promise<void>;
  loading: boolean;
}

/**
 * Component for creating or editing prize structures
 */
const PrizeStructureForm: React.FC<PrizeStructureFormProps> = ({
  initialValues,
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState<boolean>(!!initialValues);
  
  // Set initial form values when editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        validDateRange: [
          dayjs(initialValues.validFrom),
          dayjs(initialValues.validTo)
        ],
        isActive: initialValues.isActive,
        prizes: initialValues.prizes.map(prize => ({
          id: prize.id,
          name: prize.name,
          description: prize.description,
          value: prize.value,
          quantity: prize.quantity,
          numberOfRunnerUps: prize.numberOfRunnerUps
        }))
      });
    }
  }, [initialValues, form]);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      const [validFrom, validTo] = values.validDateRange.map((date: any) => 
        date.format('YYYY-MM-DD')
      );
      
      const formattedValues = {
        name: values.name,
        description: values.description,
        validFrom,
        validTo,
        isActive: values.isActive ?? true,
        prizes: values.prizes.map((prize: any) => ({
          ...(prize.id ? { id: prize.id } : {}),
          name: prize.name,
          description: prize.description,
          value: Number(prize.value),
          quantity: Number(prize.quantity),
          numberOfRunnerUps: Number(prize.numberOfRunnerUps)
        }))
      };
      
      await onSubmit(formattedValues);
      
      if (!isEditing) {
        form.resetFields();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
  
  return (
    <div className="prize-structure-form-container">
      <Card 
        title={isEditing ? "Edit Prize Structure" : "Create Prize Structure"} 
        className="prize-structure-form-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            prizes: [{ name: '', description: '', value: 0, quantity: 1, numberOfRunnerUps: 1 }]
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Enter prize structure name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter description" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="validDateRange"
            label="Valid Date Range"
            rules={[{ required: true, message: 'Please select valid date range' }]}
          >
            <DatePicker.RangePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
            />
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Divider orientation="left">Prizes</Divider>
          
          <Form.List name="prizes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="prize-form-item">
                    <Card className="prize-card">
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Prize Name"
                          rules={[{ required: true, message: 'Please enter prize name' }]}
                        >
                          <Input placeholder="Enter prize name" />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="Prize Description"
                        >
                          <Input.TextArea placeholder="Enter prize description" rows={2} />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          label="Prize Value"
                          rules={[{ required: true, message: 'Please enter prize value' }]}
                        >
                          <InputNumber 
                            placeholder="Enter prize value" 
                            style={{ width: '100%' }}
                            min={0}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          label="Quantity"
                          rules={[{ required: true, message: 'Please enter quantity' }]}
                        >
                          <InputNumber 
                            placeholder="Enter quantity" 
                            style={{ width: '100%' }}
                            min={1}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'numberOfRunnerUps']}
                          label="Number of Runner-ups"
                          rules={[{ required: true, message: 'Please enter number of runner-ups' }]}
                        >
                          <InputNumber 
                            placeholder="Enter number of runner-ups" 
                            style={{ width: '100%' }}
                            min={0}
                          />
                        </Form.Item>
                      </Space>
                      
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          className="prize-delete-btn"
                        >
                          Remove Prize
                        </Button>
                      )}
                    </Card>
                  </div>
                ))}
                
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Prize
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Form.Item className="form-actions">
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
            <Button 
              htmlType="button" 
              onClick={() => form.resetFields()}
              disabled={loading}
            >
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PrizeStructureForm;
