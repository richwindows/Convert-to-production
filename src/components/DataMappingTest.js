import React, { useState } from 'react';
import { Card, Button, Input, Table, Tabs, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import DataMapper from '../utils/DataMapper';

const { TabPane } = Tabs;
const { TextArea } = Input;

/**
 * This component helps test the data mapping functionality
 * It allows uploading an Excel file and seeing both the raw data and the mapped data
 */
const DataMappingTest = () => {
  const [rawData, setRawData] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [batchNo, setBatchNo] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  // Process an uploaded Excel file
  const processExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      setRawData(json);
      
      // Map the data
      const mapped = DataMapper.mapBulkExcelData(json, batchNo);
      setMappedData(mapped);
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto upload
  };

  // Process JSON input
  const processJsonInput = () => {
    try {
      const json = JSON.parse(jsonInput);
      const dataArray = Array.isArray(json) ? json : [json];
      
      setRawData(dataArray);
      
      // Map the data
      const mapped = DataMapper.mapBulkExcelData(dataArray, batchNo);
      setMappedData(mapped);
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  // Generate columns for the raw data table
  const generateRawDataColumns = () => {
    if (rawData.length === 0) return [];
    
    // Get all unique keys across all objects
    const allKeys = new Set();
    rawData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Create columns for each key
    return [...allKeys].map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      render: value => value === undefined ? '' : String(value)
    }));
  };

  // Generate columns for the mapped data table
  const generateMappedDataColumns = () => {
    if (mappedData.length === 0) return [];
    
    // Get all unique keys across all objects
    const allKeys = new Set();
    mappedData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Create columns for each key
    return [...allKeys].map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      render: value => value === undefined ? '' : String(value)
    }));
  };

  return (
    <Card title="Data Mapping Test Tool">
      <div style={{ marginBottom: 16 }}>
        <Input 
          placeholder="Batch Number" 
          value={batchNo} 
          onChange={e => setBatchNo(e.target.value)} 
          style={{ width: 200, marginRight: 16 }}
        />
        <Upload
          accept=".xlsx, .xls"
          beforeUpload={processExcelFile}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} style={{ marginRight: 16 }}>Upload Excel File</Button>
        </Upload>
        <Button onClick={() => setShowJsonInput(!showJsonInput)}>
          {showJsonInput ? 'Hide JSON Input' : 'Show JSON Input'}
        </Button>
      </div>

      {showJsonInput && (
        <div style={{ marginBottom: 16 }}>
          <TextArea
            rows={6}
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            placeholder="Paste JSON data here"
          />
          <Button onClick={processJsonInput} style={{ marginTop: 8 }}>Process JSON</Button>
        </div>
      )}

      <Tabs defaultActiveKey="raw">
        <TabPane tab="Raw Data" key="raw">
          <Table
            dataSource={rawData}
            columns={generateRawDataColumns()}
            rowKey={(record, index) => `raw-${index}`}
            scroll={{ x: true }}
            size="small"
            pagination={false}
          />
        </TabPane>
        <TabPane tab="Mapped Data" key="mapped">
          <Table
            dataSource={mappedData}
            columns={generateMappedDataColumns()}
            rowKey={(record, index) => `mapped-${index}`}
            scroll={{ x: true }}
            size="small"
            pagination={false}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default DataMappingTest; 