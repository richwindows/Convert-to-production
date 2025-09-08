import React from 'react';
import { Form, Input, Select, Button, Row, Col, InputNumber } from 'antd';
import { convertToDecimal } from '../utils/numberUtils';
import './PrintTable.css';

const { Option } = Select;

const WindowForm = ({ onAdd, onClear }) => {
  const [form] = Form.useForm();

  // Form initialization with dropdown options
  const styleOptions = [
    "XO", "OX", "XOX", "XOX-1/3", "SH", "Picture", 
    "XO-P", "OX-P", "P-XO", "P-OX", "SH-P", "P-SH", 
    "H-PP", "V-PP", "XO-PP", "OX-PP", "PP-XO", "PP-OX", 
    "XOX-PPP", "PPP-XOX", "XOX-PP", "PP-XOX",  "3/4 IGU", "1 IGU", "5/8 IGU", "Screen", 
    "1/2 IGU", "7/8 IGU", "P-PP", "3mm","3.9mm","4.7mm",
    "5.7mm",
  ];

  const frameOptions = [
    "Nailon", "Retrofit", "Block", "Block-slop 1 3/4", "Block-slop 1/2"
  ];

  const colorOptions = [
    "White", "Almond", "Black", "Paint"
  ];

  const glassOptions = [
    "cl/cl", "cl/le2", "cl/le3", 
    "OBS/cl", "OBS/le2", "OBS/le3", 
    "cl/cl TP", "cl/le2 TP", "cl/le3 TP", 
    "OBS/cl TP", "OBS/le2 TP", "OBS/le3 TP",
    "cl","le2","le3","OBS","cl TP","le2 TP","le3 TP",
    "OBS TP",
  ];

  const argonOptions = [
    "None", "Argon"
  ];

  const topBottomOptions = [
    "No", "Buttom Tempered"
  ];

  const gridOptions = [
    "None", "Standard", "Marginal", "Perimeter"
  ];

  const handleSubmit = (values) => {
    // If Grid is 'Standard' and GridW & GridH are provided, format Grid value
    if (values.Grid === 'Standard') {
      const gridW = parseInt(values.GridW, 10);
      const gridH = parseInt(values.GridH, 10);
      if (gridW > 0 && gridH > 0) {
        values.Grid = `${gridW}W${gridH}H`;
      }
      // If GridW or GridH are not valid, values.Grid remains 'Standard' by default
      // or you might want to set it to 'None' or handle it differently.
      // For now, it will only change if both W and H are valid positive numbers.
    }

    // --- BTP and Glass merging logic ---
    if (values.BTP === 'Buttom Tempered' && values.Glass) {
      values.Glass = values.Glass + ' B-TP';
    }
    // --- End BTP and Glass merging ---

    // --- FH Validation and Conversion before submitting ---
    let fhValue = values.FH;
    if (fhValue != null && fhValue !== '') {
      const convertedFH = convertToDecimal(fhValue);
      if (convertedFH === fhValue.toString() && isNaN(parseFloat(convertedFH))) {
        // If conversion failed (returned original non-numeric value)
        form.setFields([{ name: 'FH', errors: ['FH must be a valid number or fraction (e.g., 14.5, 14 1/2, 1/2).'] }]);
        return;
      }
      values.FH = convertedFH;
    } else {
      values.FH = '';
    }
    // --- End FH Validation and Conversion ---

    if (onAdd) {
      onAdd(values);
    }
  };

  const handleClear = () => {
    form.resetFields();
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="window-form">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Customer" name="Customer">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="P.O." name="PO">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Style" name="Style">
              <Select>
                {styleOptions.map(option => (
                  <Option key={option} value={option}>{option}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Width" name="W">
              <Input placeholder="e.g., 14.5, 14 1/2, 1/2" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Height" name="H">
              <Input placeholder="e.g., 53.5, 53 1/2, 1/2" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              label="Fix H" 
              name="FH" 
              rules={[
                ({
                  validator(_, value) {
                    if (value == null || (typeof value === 'string' && value.trim() === '')) {
                      return Promise.resolve(); // Allow empty or null
                    }
                    if (typeof value === 'number' && isFinite(value)) {
                        return Promise.resolve(); // Allow finite numbers
                    }
                    if (typeof value === 'string') {
                      if (/[a-zA-Z]/.test(value)) {
                        return Promise.reject(new Error('FH cannot contain letters.'));
                      }
                      const parsedNum = parseFloat(value);
                      if (isFinite(parsedNum)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('FH must be a valid number.'));
                    }
                    return Promise.reject(new Error('FH has an invalid type.'));
                  },
                }),
              ]}
            >
              <Input style={{ width: '100%' }} placeholder="Enter number or leave empty" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Frame" name="Frame">
              <Select>
                {frameOptions.map(option => (
                  <Option key={option} value={option}>{option}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Color" name="Color">
              <Select>
                {colorOptions.map(option => (
                  <Option key={option} value={option}>{option}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Glass" name="Glass">
              <Select>
                {glassOptions.map(option => (
                  <Option key={option} value={option}>{option}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Argon" name="Argon">
              <Select>
                {argonOptions.map(option => (
                  <Option key={option} value={option}>{option}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="B TP" name="BTP">
              <Select>
                {topBottomOptions.map(option => (
                  <Option key={option} value={option}>{option}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Grid" name="Grid">
              <Select>
                {gridOptions.map(option => (
                  <Option key={option} value={option}>{option}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="W" name="GridW">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="H" name="GridH">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="GridNote" name="GridNote">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Note" name="Note">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Qty" name="Quantity">
              <InputNumber style={{ width: '100%' }} min={1} defaultValue={1} />
            </Form.Item>
          </Col>
          <Col span={9} offset={3}>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%', backgroundColor: '#A9A9A9', borderColor: '#A9A9A9' }}>
                Add
              </Button>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item>
              <Button onClick={handleClear} style={{ width: '100%', backgroundColor: '#A9A9A9', borderColor: '#A9A9A9' }}>
                Clear
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default WindowForm;