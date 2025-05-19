import React, { useState } from 'react';
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

function App() {
  const [excelData, setExcelData] = useState([]);
  const [batchNo, setBatchNo] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('data');
  const [printTab, setPrintTab] = useState('general');
  const [showForm, setShowForm] = useState(false);
  const [showMappingTool, setShowMappingTool] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
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
      
      // 确保每个数据项有唯一的ID
      const processedData = json.map((item, index) => {
        // 如果没有ID或ID为空，分配一个自动生成的ID
        if (!item.ID || item.ID === '') {
          item.ID = (index + 1).toString();
        }
        return item;
      });
      
      // Store original Excel data
      setExcelData(processedData);
      console.log('===== Excel数据导入 =====');
      console.log(`导入了${processedData.length}条数据`);

      // 首先将数据加载到General Information表格
      let infoData = [];
      processedData.forEach((item, index) => {
        infoData.push({
          Customer: item.Customer || '',
          ID: item.ID || (index + 1).toString(),
          Style: item.Style || '',
          W: item.W || '',
          H: item.H || '',
          FH: item.FH || '',
          Frame: item.Frame || '',
          Glass: item.Glass || '',
          Argon: item.Argon || '',
          Grid: item.Grid || '',
          Color: item.Color || '',
          Note: item.Note || '',
          BatchNO: batchNo
        });
      });

      // 更新计算数据，先只设置info部分
      const allCalculatedData = {
        info: infoData,
        frame: [],
        sash: [],
        glass: [],
        screen: [],
        parts: [],
        grid: [],
        order: [],
        label: [],
      };
      
      setCalculatedData(allCalculatedData);
      setIsDataLoaded(true);
      message.success(`${file.name} 导入成功，请点击"使用表格数据计算"生成详细数据`);
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
    if (!batchNo) {
      message.error('Please enter a Batch Number');
      return;
    }
    
    window.print();
  };

  // Switch to print view
  const handlePrintView = () => {
    setActiveTab('print');
  };

  // Add a new function to handle adding a window manually
  const handleAddWindow = (windowData) => {
    // Generate an ID for the new window
    const newId = excelData.length > 0 
      ? Math.max(...excelData.map(item => parseInt(item.ID) || 0)) + 1 
      : 1;
    
    // Create a new window object with the form data and batch number
    const newWindow = {
      ...windowData,
      ID: newId.toString(),
      BatchNO: batchNo
    };
    
    // Add the new window to the data
    setExcelData([...excelData, newWindow]);

    // Map the window data to the expected format
    const mappedWindow = DataMapper.mapExcelToCalculationFormat(newWindow, batchNo);
    
    // Calculate all window parts using the calculator
    const result = WindowCalculator.processWindow(mappedWindow);

    // Merge with existing calculated data
    const updatedCalculatedData = { ...calculatedData };
    Object.keys(result).forEach(key => {
      updatedCalculatedData[key] = [...updatedCalculatedData[key], ...result[key]];
    });

    setCalculatedData(updatedCalculatedData);
    setIsDataLoaded(true);
    setShowForm(false);
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

  // 添加一个函数，直接使用General Information数据进行计算
  const recalculateFromGeneralInfo = () => {
    if (!calculatedData.info || calculatedData.info.length === 0) {
      message.error('没有可用的General Information数据');
      return;
    }

    // 自动显示日志窗口
    setShowLogs(true);

    const generalInfoData = calculatedData.info;
    console.log('===== 使用General Information数据计算 =====');
    console.log(`找到${generalInfoData.length}条窗户数据`);

    // 重置计算数据，但保留info数据
    const newCalculatedData = {
      info: generalInfoData,
      frame: [],
      sash: [],
      glass: [],
      screen: [],
      parts: [],
      grid: [],
      order: [],
      label: [],
    };

    // 框架类型映射
    const frameMapping = {
      'RT': 'Retrofit',
      'Nailon': 'Nailon',
      'Block': 'Block',
      'BS1 3/4': 'Block-slop 1 3/4',
      'BS1/2': 'Block-slop 1/2',
    };

    // 按Style分组统计窗户数量
    const styleCount = {};
    
    // 对每条数据进行处理
    generalInfoData.forEach((windowData) => {
      // 确保数据有ID
      if (!windowData.ID) {
        console.log(`警告：发现没有ID的数据：${JSON.stringify(windowData)}`);
        return;
      }

      // 统计Style数量
      const style = windowData.Style || 'Unknown';
      styleCount[style] = (styleCount[style] || 0) + 1;
      
      console.log(`处理ID: ${windowData.ID} 的窗户数据 (Style: ${style})`);
      
      // 如果batchNo未设置但数据中有BatchNO，则使用数据中的BatchNO
      const currentBatchNo = batchNo || windowData.BatchNO || '';
      
      // 框架类型映射（例如 RT → Retrofit）
      let frameType = windowData.Frame || '';
      if (frameType in frameMapping) {
        frameType = frameMapping[frameType];
        console.log(`应用框架映射: ${windowData.Frame} → ${frameType}`);
      }
      
      // 使用WindowCalculator处理窗户
      const mappedWindow = {
        ...windowData,
        BatchNO: currentBatchNo,
        Frame: frameType, // 使用映射后的框架类型
        // 确保数值型字段都是数字
        W: parseFloat(windowData.W) || 0,
        H: parseFloat(windowData.H) || 0,
        FH: parseFloat(windowData.FH) || 0,
        Quantity: parseInt(windowData.Quantity) || 1
      };
      
      console.log(`窗户ID=${windowData.ID}, Style=${style}, 框架类型=${frameType}, 尺寸=${mappedWindow.W}x${mappedWindow.H}`);
      
      const result = WindowCalculator.processWindow(mappedWindow);
      
      // 合并结果，除了info之外（因为info已经存在）
      Object.keys(result).forEach(key => {
        if (key !== 'info') {
          newCalculatedData[key] = [...newCalculatedData[key], ...result[key]];
        }
      });
    });

    // 输出统计信息
    console.log('===== 窗户Style统计 =====');
    Object.keys(styleCount).forEach(style => {
      console.log(`Style ${style}: ${styleCount[style]}个窗户`);
    });

    // 输出结果表统计
    console.log('===== 生成的数据表统计 =====');
    Object.keys(newCalculatedData).forEach(key => {
      if (key !== 'info') {
        console.log(`${key}表: ${newCalculatedData[key].length}条记录`);
      }
    });

    // 更新计算数据
    setCalculatedData(newCalculatedData);
    setIsDataLoaded(true);
    message.success(`已处理${generalInfoData.length}条窗户数据，生成了详细表格数据`);
    console.log('===== 计算完成 =====');
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <h1 style={{ color: 'white' }}>Production Converter</h1>
      </Header>
      <Content className="content">
        <div className="upload-section">
          <Upload 
            accept=".xlsx, .xls" 
            beforeUpload={processExcelFile}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>上传Excel文件</Button>
          </Upload>
          
          <Space className="batch-input">
            <span>批次号:</span>
            <Input 
              placeholder="输入批次号" 
              value={batchNo} 
              onChange={handleBatchNoChange}
              style={{ width: 200 }}
            />
          </Space>

          <Space>
            <Button 
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '隐藏表单' : '手动添加窗户'}
            </Button>
            
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowMappingTool(!showMappingTool)}
            >
              {showMappingTool ? '隐藏映射工具' : '数据映射工具'}
            </Button>
            
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? '隐藏处理日志' : '显示处理日志'}
            </Button>
            
            {isDataLoaded && calculatedData.info.length > 0 && (
              <Button
                type="primary"
                onClick={recalculateFromGeneralInfo}
                style={{ backgroundColor: '#1890ff', fontWeight: 'bold' }}
              >
                生成详细表格数据
              </Button>
            )}
          </Space>

          {isDataLoaded && (
            <Space>
              <Button 
                type="primary" 
                icon={<PrinterOutlined />}
                onClick={handlePrintView}
              >
                打印预览
              </Button>
              
              <Button 
                type="primary" 
                onClick={handlePrint}
                disabled={!isDataLoaded || !batchNo}
              >
                打印
              </Button>
            </Space>
          )}
        </div>
        
        {!isDataLoaded && (
          <Card style={{ marginBottom: 16, textAlign: 'center' }}>
            <p>请上传Excel文件或手动添加窗户数据</p>
            <p style={{ fontSize: 12, color: '#666' }}>数据处理流程: 上传Excel → 生成基础信息表 → 点击"生成详细表格数据"按钮 → 查看各个表格数据</p>
          </Card>
        )}
        
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
        
        {isDataLoaded && (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Data View" key="data">
              <Card title="Data Preview" className="data-table">
                <Table 
                  dataSource={excelData} 
                  columns={columns} 
                  rowKey={(record, index) => index.toString()}
                  pagination={false}
                  bordered
                  scroll={{ x: true }}
                />
              </Card>
              
              <Card title="Detailed Information" className="tabs-section">
                <TabsComponent excelData={excelData} batchNo={batchNo} calculatedData={calculatedData} />
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
              <div className="print-view">
                {renderPrintTable()}
              </div>
            </TabPane>
          </Tabs>
        )}
      </Content>
      <Footer className="footer">Production Converter ©{new Date().getFullYear()}</Footer>
    </Layout>
  );
}

export default App;
