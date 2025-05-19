import React, { useState, useEffect } from 'react';
import { Layout, Upload, Button, Input, Table, message, Space, Card, Tabs } from 'antd';
import { UploadOutlined, PrinterOutlined, SettingOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import 'antd/dist/antd.css';
import './App.css';
import TabsComponent from './components/TabsComponent';
import PrintTable from './components/PrintTable';
import PrintFrameTable from './components/PrintFrameTable';
import PrintSashTable from './components/PrintSashTable';
import PrintGlassTable from './components/PrintGlassTable';
import PrintScreenTable from './components/PrintScreenTable';
import PrintPartsTable from './components/PrintPartsTable';
import PrintGridTable from './components/PrintGridTable';
import PrintGlassOrderTable from './components/PrintGlassOrderTable';
import PrintLabelTable from './components/PrintLabelTable';
import WindowForm from './components/WindowForm';
import WindowCalculator from './utils/WindowCalculator';
import DataMapper from './utils/DataMapper';
import DataMappingTest from './components/DataMappingTest';
import ProcessingLog from './components/ProcessingLog';

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

const frameMapping = {
  'RT': 'Retrofit',
  'Nailon': 'Nailon',
  'Block': 'Block',
  'BS1 3/4': 'Block-slop 1 3/4',
  'BS1/2': 'Block-slop 1/2',
};

function App() {
  const [excelData, setExcelData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchNo, setBatchNo] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('data');
  const [printTab, setPrintTab] = useState('general');
  const [showForm, setShowForm] = useState(false);
  const [showMappingTool, setShowMappingTool] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedData, setCalculatedData] = useState({
    info: [],
    frame: [],
    sash: [],
    glass: [],
    screen: [],
    parts: [],
    grid: [],
    order: [],
    label: [],
  });

  // Process the Excel file
  const processExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      const processedData = json.map((item, index) => {
        if (!item.ID || item.ID === '') {
          item.ID = (index + 1).toString();
        }
        // Ensure basic fields exist, even if empty, consistent with form fields
        return {
          Customer: item.Customer || '',
          ID: item.ID.toString(),
          Style: item.Style || '',
          W: item.W || '',
          H: item.H || '',
          FH: item.FH || '',
          Frame: item.Frame || '', // Original frame type
          Glass: item.Glass || '',
          Argon: item.Argon || '',
          Grid: item.Grid || '',
          Color: item.Color || '',
          Note: item.Note || '',
          Quantity: item.Quantity || 1, // Default quantity
          // BatchNO will be applied during processing if needed
        };
      });
      
      setExcelData(processedData);
      setSelectedRowKeys([]); // Clear selections from previous data
      
      // Reset all calculated data, as it's derived from selection
      setCalculatedData({ 
        info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [] 
      });
      
      setIsDataLoaded(true);
      message.success(`${file.name} imported successfully. Please select rows and click 'Process Selected Rows'.`);
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto upload
  };

  // Columns for the data table
  const columns = [
    { title: 'Customer', dataIndex: 'Customer', key: 'customer' },
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: 'W', dataIndex: 'W', key: 'w' },
    { title: 'H', dataIndex: 'H', key: 'h' },
    { title: 'FH', dataIndex: 'FH', key: 'fh' },
    { title: 'Frame', dataIndex: 'Frame', key: 'frame' },
    { title: 'Glass', dataIndex: 'Glass', key: 'glass' },
    { title: 'Argon', dataIndex: 'Argon', key: 'argon' },
    { title: 'Grid', dataIndex: 'Grid', key: 'grid' },
    { title: 'Color', dataIndex: 'Color', key: 'color' },
    { title: 'Note', dataIndex: 'Note', key: 'note' },
    { title: 'Batch NO.', dataIndex: 'Batch NO.', key: 'batchNo', render: () => batchNo },
    { title: 'Checked', dataIndex: 'Checked', key: 'checked' },
  ];

  // Handle batch number input
  const handleBatchNoChange = (e) => {
    setBatchNo(e.target.value);
  };

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Switch to print view
  const handlePrintView = () => {
    setActiveTab('print');
  };

  // Row selection configuration for the main table
  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelectionConfig = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Renamed from recalculateFromGeneralInfo
  const generateDetailedDataAndNotify = () => {
    if (!isDataLoaded || excelData.length === 0) {
      message.error('No base data available. Please upload an Excel file or add data first.');
      return;
    }

    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      message.info('Please select rows from the table to process detailed data.');
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [] });
      return;
    }
    
    setIsProcessing(true);

    const selectedExcelItems = excelData.filter(item => selectedRowKeys.includes(item.ID.toString()));

    if (selectedExcelItems.length === 0) {
      message.warn('Selected rows not found in the dataset or ID mismatch. Please check selection.');
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [] });
      setIsProcessing(false);
      return;
    }
    
    const itemsToProcessAndForInfo = selectedExcelItems.map(item => {
      let frameType = item.Frame || '';
      if (frameType in frameMapping) frameType = frameMapping[frameType];

      return {
        Customer: item.Customer || '',
        ID: item.ID.toString(),
        Style: item.Style || '',
        W: parseFloat(item.W) || 0,
        H: parseFloat(item.H) || 0,
        FH: parseFloat(item.FH) || 0,
        Frame: frameType, // Mapped frame type for calculation and display in 'info'
        OriginalFrame: item.Frame || '', // Store original for reference if needed
        Glass: item.Glass || '',
        Argon: item.Argon || '',
        Grid: item.Grid || '',
        Color: item.Color || '',
        Note: item.Note || '',
        BatchNO: batchNo, 
        Quantity: parseInt(item.Quantity) || 1
      };
    });

    const newCalculatedData = {
      info: itemsToProcessAndForInfo,
      frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [],
    };

    const styleCount = {};

    itemsToProcessAndForInfo.forEach((windowData) => {
      const style = windowData.Style || 'Unknown';
      styleCount[style] = (styleCount[style] || 0) + 1;
      const currentBatchNo = batchNo || windowData.BatchNO || '';
      let frameType = windowData.Frame || '';
      if (frameType in frameMapping) frameType = frameMapping[frameType];
      
      const mappedWindow = {
        ...windowData, // This already has Customer, ID, Style, W, H, FH, Frame, Glass, Argon, Grid, Color, Note
        BatchNO: currentBatchNo,
        Frame: frameType,
        W: parseFloat(windowData.W) || 0,
        H: parseFloat(windowData.H) || 0,
        FH: parseFloat(windowData.FH) || 0,
        Quantity: parseInt(windowData.Quantity) || 1 // Assuming Quantity might be in excel or default to 1
      };
      const result = WindowCalculator.processWindow(mappedWindow);
      Object.keys(result).forEach(key => {
        if (key !== 'info') { 
          newCalculatedData[key] = [...newCalculatedData[key], ...result[key]];
        }
      });
    });
    
    console.log('===== Selected Window Style Count =====');
    Object.keys(styleCount).forEach(style => console.log(`Style ${style}: ${styleCount[style]} windows`));
    console.log('===== Generated Data Table Stats =====');
    Object.keys(newCalculatedData).forEach(key => {
      if (key !== 'info') {
        console.log(`${key} table: ${newCalculatedData[key].length} records`);
      }
    });

    setCalculatedData(newCalculatedData);
    message.success(`Processed ${selectedExcelItems.length} selected rows. Detailed tables generated!`);
    console.log('===== Selective calculation complete =====');
    setIsProcessing(false);
  };

  // useEffect(() => {
  //   if (!isDataLoaded || !excelData || excelData.length === 0) {
  //     // Not ready, or no base data from Excel yet
  //     setCalculatedData(prev => ({ ...prev, frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [] }));
  //     return;
  //   }

  //   if (selectedRowKeys.length === 0) {
  //     // If data is loaded but no rows are selected, clear derived data and prompt
  //     console.log("useEffect detected no selected rows. Clearing derived data.");
  //     setCalculatedData(prev => ({
  //       ...prev,
  //       frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: []
  //     }));
  //     // message.info(\'Please select rows from the preview table to generate detailed data.\'); // Message might be too frequent here
  //     return;
  //   }
    
  //   // Only proceed if data is loaded and there are selected rows
  //   console.log("useEffect triggering generateDetailedDataAndNotify due to selectedRowKeys change.");
  //   setIsProcessing(true);
  //   generateDetailedDataAndNotify();
  //   // setShowLogs(true); // Optional: show logs after processing
  // }, [selectedRowKeys, calculatedData.info, isDataLoaded]); // Ensure calculatedData.info is stable or handled

  // Add a new function to handle adding a window manually
  const handleAddWindow = (windowDataFromForm) => {
    const newId = excelData.length > 0 
      ? (Math.max(...excelData.map(item => parseInt(item.ID) || 0)) + 1).toString()
      : "1";
    
    const newWindowExcelRow = {
      Customer: windowDataFromForm.Customer || '',
      ID: newId,
      Style: windowDataFromForm.Style || '',
      W: windowDataFromForm.W || '',
      H: windowDataFromForm.H || '',
      FH: windowDataFromForm.FH || '',
      Frame: windowDataFromForm.Frame || '', // Original frame type from form
      Glass: windowDataFromForm.Glass || '',
      Argon: windowDataFromForm.Argon || '',
      Grid: windowDataFromForm.Grid || '',
      Color: windowDataFromForm.Color || '',
      Note: windowDataFromForm.Note || '',
      Quantity: parseInt(windowDataFromForm.Quantity) || 1,
    };
    
    setExcelData(prevExcelData => [...prevExcelData, newWindowExcelRow]);
    setSelectedRowKeys([]); // Clear selections

    // Reset all calculated data
    setCalculatedData({ 
      info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [] 
    });

    setIsDataLoaded(true); // excelData has content
    setShowForm(false); // Close the form
    message.info('New window added to the preview table. Please select rows and process to update detailed data.');
  };

  // Add a function to clear the form
  const handleClearForm = () => {
    // Just reset the form
  };

  // 渲染打印选择的表格
  const renderPrintTable = () => {
    // 添加调试信息
    console.log("当前打印标签:", printTab);
    console.log("calculatedData:", calculatedData);
    
    switch (printTab) {
      case 'general':
        console.log("正在渲染general表格，数据:", calculatedData.info);
        return <PrintTable batchNo={batchNo} calculatedData={calculatedData.info} />;
      case 'frame':
        console.log("正在渲染frame表格，数据:", calculatedData.frame);
        return <PrintFrameTable batchNo={batchNo} calculatedData={calculatedData.frame} />;
      case 'sash':
        console.log("正在渲染sash表格，数据:", calculatedData.sash);
        return <PrintSashTable batchNo={batchNo} calculatedData={calculatedData.sash} />;
      case 'glass':
        console.log("正在渲染glass表格，数据:", calculatedData.glass);
        return <PrintGlassTable batchNo={batchNo} calculatedData={calculatedData.glass} />;
      case 'screen':
        console.log("正在渲染screen表格，数据:", calculatedData.screen);
        return <PrintScreenTable batchNo={batchNo} calculatedData={calculatedData.screen} />;
      case 'parts':
        console.log("正在渲染parts表格，数据:", calculatedData.parts);
        return <PrintPartsTable batchNo={batchNo} calculatedData={calculatedData.parts} />;
      case 'grid':
        console.log("正在渲染grid表格，数据:", calculatedData.grid);
        return <PrintGridTable batchNo={batchNo} calculatedData={calculatedData.grid} />;
      case 'order':
        console.log("正在渲染order表格，数据:", calculatedData.order);
        return <PrintGlassOrderTable batchNo={batchNo} calculatedData={calculatedData.order} />;
      case 'label':
        console.log("正在渲染label表格，数据:", calculatedData.label);
        return <PrintLabelTable batchNo={batchNo} calculatedData={calculatedData.label} />;
      default:
        return <PrintTable batchNo={batchNo} calculatedData={calculatedData.info} />;
    }
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo">Production Converter</div>
        <Space>
          <Input 
            placeholder="Enter Batch NO." 
            value={batchNo} 
            onChange={handleBatchNoChange} 
            style={{ width: 200 }}
          />
          <Button 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
            disabled={!isDataLoaded}
          >
            打印
          </Button>
          <Button onClick={() => setShowForm(true)}>添加窗户</Button>
          <Button onClick={() => setShowMappingTool(true)}>数据映射工具</Button>
          <Button onClick={() => setShowLogs(!showLogs)}>{showLogs ? '隐藏日志' : '显示日志'}</Button>
        </Space>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: '20px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="数据总览" key="data">
            <Card title="导入数据预览 (Excel Data Preview)">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="upload-section">
                  <Upload beforeUpload={processExcelFile} showUploadList={false}>
                    <Button icon={<UploadOutlined />}>上传 Excel 文件</Button>
                  </Upload>
                  <Button 
                    onClick={generateDetailedDataAndNotify} 
                    disabled={!isDataLoaded || selectedRowKeys.length === 0 || isProcessing}
                    loading={isProcessing}
                    style={{ marginLeft: 8 }}
                  >
                    {isProcessing ? 'Processing...' : '处理选中行'}
                  </Button>
                </div>
                {isDataLoaded && (
                  <Table
                    dataSource={excelData} 
                    columns={columns} 
                    rowKey="ID" 
                    rowSelection={rowSelectionConfig}
                    loading={!isDataLoaded && excelData.length === 0}
                    bordered
                  />
                )}
              </Space>
            </Card>
          </TabPane>
          <TabPane tab="Print View" key="print">
            <Card className="print-selector">
              <Tabs activeKey={printTab} onChange={setPrintTab}>
                <TabPane tab="General Information" key="general" />
                <TabPane tab="Frame" key="frame" />
                <TabPane tab="Sash" key="sash" />
                <TabPane tab="Glass" key="glass" />
                <TabPane tab="Screen" key="screen" />
                <TabPane tab="Parts" key="parts" />
                <TabPane tab="Grid" key="grid" />
                <TabPane tab="Glass Order" key="order" />
                <TabPane tab="Label" key="label" />
              </Tabs>
            </Card>
            <div className="print-container">
              {renderPrintTable()}
            </div>
          </TabPane>
        </Tabs>
        {showForm && (
          <Card title="手动添加窗户数据" className="manual-form">
            <WindowForm onAdd={handleAddWindow} onClear={handleClearForm} />
          </Card>
        )}
        {showMappingTool && (
          <DataMappingTest />
        )}
        {showLogs && (
          <ProcessingLog />
        )}
      </Content>
      <Footer className="footer">Production Converter ©{new Date().getFullYear()}</Footer>
    </Layout>
  );
}

export default App;
