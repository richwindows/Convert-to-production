import React, { useState, useEffect } from 'react';
import { Layout, Upload, Button, Input, Table, message, Space, Card, Tabs } from 'antd';
import { UploadOutlined, PrinterOutlined, SettingOutlined, FileExcelOutlined } from '@ant-design/icons';
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
import PrintSashWeldingTable from './components/PrintSashWeldingTable';
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
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSashWelding, setIsExportingSashWelding] = useState(false);
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
    sashWelding: [],
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
        info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: []
      });
      
      setIsDataLoaded(true);
      message.success(`${file.name} imported successfully. Please select rows and click 'Process Selected Rows'.`);
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto upload
  };

  // Columns for the data table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'id',
      render: (text, record) => {
        const recordIdStr = record.ID.toString();
        const selectionIndex = selectedRowKeys.indexOf(recordIdStr);
        if (selectionIndex !== -1) {
          return selectionIndex + 1; // Display 1-based selection order
        } else {
          return '-'; // Display '-' if not selected
        }
      }
    },
    { title: 'Customer', dataIndex: 'Customer', key: 'customer' },
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

  // Function to export data to Excel
  const exportToExcel = () => {
    if (!isDataLoaded || Object.values(calculatedData).every(arr => arr.length === 0 && arr !== calculatedData.info && arr !== calculatedData.sashWelding)) {
      // Check if info or sashWelding has data even if others don't
      if ((!calculatedData.info || calculatedData.info.length === 0) && (!calculatedData.sashWelding || calculatedData.sashWelding.length === 0 )) {
        message.error('No data available to export.');
        return;
      }
    }
    setIsExporting(true);
    message.loading({ content: 'Generating Excel file...', key: 'exporting' });

    const wb = XLSX.utils.book_new();
    const currentBatchNo = batchNo || 'N/A';

    const defaultCellStyle = {
      font: { name: 'Calibri', sz: 12 },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    const headerCellStyle = {
      ...defaultCellStyle,
      font: { ...defaultCellStyle.font, bold: true },
      fill: { fgColor: { rgb: "FFFF00" } } // Example: Yellow fill for headers
    };

    // Sheet definitions: name, dataKey, headers, mapFn
    const sheetDefinitions = [
      {
        name: 'General Info',
        dataKey: 'info',
        headers: ['Batch NO.', 'Customer', 'ID', 'Style', 'W', 'H', 'FH', 'Frame', 'Glass', 'Argon', 'Grid', 'Color', 'Note', 'Quantity', 'Original ID'],
        mapFn: (row) => [currentBatchNo, row.Customer, row.ID, row.Style, row.W, row.H, row.FH, row.Frame, row.Glass, row.Argon, row.Grid, row.Color, row.Note, row.Quantity, row.originalId]
      },
      {
        name: 'Frame',
        dataKey: 'frame',
        headers: ['Batch NO.', 'ID', 'Style', '82-02B —', 'Pcs', '82-02B |', 'Pcs', '82-10 —', 'Pcs', '82-10 |', 'Pcs', '82-01 —', 'Pcs', '82-01 |', 'Pcs', 'Color'],
        mapFn: (row) => [currentBatchNo, row.ID, row.Style, row['82-02B-H'] || '', row['82-02B-H-Pcs'] || '', row['82-02B-V'] || '', row['82-02B-V-Pcs'] || '', row['82-10-H'] || '', row['82-10-H-Pcs'] || '', row['82-10-V'] || '', row['82-10-V-Pcs'] || '', row['82-01-H'] || '', row['82-01-H-Pcs'] || '', row['82-01-V'] || '', row['82-01-V-Pcs'] || '', row.Color || '']
      },
      {
        name: 'Sash',
        dataKey: 'sash',
        headers: ['Batch NO.', 'ID', 'Style', '82-03--', 'Pcs', '82-03 |', 'Pcs', '82-05', 'Pcs', '82-04--', 'Pcs', '82-04|', 'Pcs', 'Color'],
        mapFn: (row) => [currentBatchNo, row.ID, row.Style, row['82-03-H'] || '', row['82-03-H-Pcs'] || '', row['82-03-V'] || '', row['82-03-V-Pcs'] || '', row['82-05'] || '', row['82-05-Pcs'] || '', row['82-04-H'] || '', row['82-04-H-Pcs'] || '', row['82-04-V'] || '', row['82-04-V-Pcs'] || '', row.Color || '']
      },
      {
        name: 'Sash Welding',
        dataKey: 'sashWelding',
        headers: ['Batch NO.', 'Customer', 'ID', 'Style', 'W', 'H', 'Sashw', 'Sashh', 'Pcs'],
        mapFn: (row) => [currentBatchNo, row.Customer, row.ID, row.Style,row.SashW, row.SashH,row.WeldingCutW, row.WeldingCutH,row.Pcs]
      },
      {
        name: 'Glass',
        dataKey: 'glass',
        headers: ['Batch NO.', 'Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity', 'Glass Type', 'Tempered', 'Thickness', 'Width', 'Height', 'Grid', 'Argon'],
        mapFn: (row) => [currentBatchNo, row.Customer, row.Style, row.W, row.H, row.FH, row.ID, row.line, row.quantity, row.glassType, row.tempered, row.thickness, row.width, row.height, row.grid, row.argon]
      },
      {
        name: 'Screen',
        dataKey: 'screen',
        headers: ['Batch NO.', 'Customer', 'ID', 'Style', 'Screen', 'pcs', 'Screen T', 'pcs', 'Color'],
        mapFn: (row) => [currentBatchNo, row.Customer, row.ID, row.Style, row.screenSize || '', row.screenPcs || '', row.screenT || '', row.screenTPcs || '', row.Color || '']
      },
      {
        name: 'Parts',
        dataKey: 'parts',
        headers: ['Batch NO.', 'ID', 'Style', '中框', '中铝', '手铝', 'Pcs', 'Track', 'Cover--', 'Cover|', '大中', 'pcs', '大中2', 'pcs', 'Slop', 'Color'],
        mapFn: (row) => [currentBatchNo, row.ID, row.Style, row.mullion || '', row.mullionA || '', row.handleA || '', row.quantity || '', row.track || '', row.coverH || '', row.coverV || '', row.bigMu1 || '', row.bigMu1Q || '', row.bigMu2 || '', row.bigMu2Q || '', row.slop || '', row.Color || '']
      },
      {
        name: 'Grid',
        dataKey: 'grid',
        headers: ['Batch NO.', 'ID', 'Style', 'Grid Style', 'Sash W1', 'Pcs', '一刀', 'Sash H1', 'Pcs', '一刀', 'Fixed W2', 'Pcs', '一刀', 'Fixed H2', 'Pcs', '一刀', 'Note', 'Color'],
        mapFn: (row) => [currentBatchNo, row.ID, row.Style, row.Grid || '', row.sashW || '', row.sashWq || '', row.holeW1 || '', row.sashH || '', row.sashHq || '', row.holeH1 || '', row.fixW || '', row.fixWq || '', row.holeW2 || '', row.fixH || '', row.fixHq || '', row.holeH2 || '', row.Note || '', row.Color || '']
      },
      {
        name: 'Glass Order',
        dataKey: 'order',
        headers: ['Batch NO.', 'Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity', 'Glass Type', 'Annealed/Tempered', 'Thickness', 'Glass Width', 'Glass Height', 'Notes'],
        mapFn: (row) => [currentBatchNo, row.Customer, row.Style, row.W, row.H, row.FH, row.ID, row.Line, row.Quantity, row['Glass Type'], row['Annealed/Tempered'], row.Thickness, row['Glass Width'], row['Glass Height'], row.Notes]
      },
      { // Label data comes from calculatedData.info
        name: 'Label',
        dataKey: 'info', // Source from 'info'
        headers: ['Batch NO.', 'Customer', 'ID', 'Style', 'Size (WxH)', 'Frame', 'Glass+Argon', 'Grid', 'P.O / Note', 'Invoice Num. Batch NO.'],
        mapFn: (row) => [
          currentBatchNo,
          row.Customer,
          row.ID,
          row.Style,
          (row.W && row.H) ? `${row.W}x${row.H}` : '',
          row.Frame,
          (row.Glass ? (row.Argon && row.Argon !== 'None' ? `${row.Glass}+${row.Argon}` : row.Glass) : ''),
          row.Grid,
          row.Note || (row.PO || ''), // Use Note as fallback for P.O.
          currentBatchNo // 'Invoice Num. Batch NO.' is the same as currentBatchNo
        ]
      }
    ];

    sheetDefinitions.forEach(def => {
      const dataToExport = calculatedData[def.dataKey];
      let ws;
      if (dataToExport && dataToExport.length > 0) {
        const sheetRows = dataToExport.map((row, index) => def.mapFn(row, index)); // Pass index to mapFn
        const aoaData = [def.headers, ...sheetRows];
        ws = XLSX.utils.aoa_to_sheet(aoaData);

        // Apply styles
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue; // Create cell if it doesn't exist (should not happen with aoa_to_sheet for full data)
            ws[cell_ref].s = (R === 0) ? headerCellStyle : defaultCellStyle; // Header style for first row
          }
        }
        
        // Attempt to set column widths (basic example: all columns 15 wide)
        // More sophisticated width calculation might be needed based on content.
        const colWidths = def.headers.map(() => ({ wch: 15 })); // or {width: 15} in some versions
        ws['!cols'] = colWidths;

      } else {
        // Create sheet with only headers if no data
        ws = XLSX.utils.aoa_to_sheet([def.headers]);
        // Apply styles to header row
         const range = XLSX.utils.decode_range(ws['!ref']);
         for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: 0 }; // Only header row
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) ws[cell_ref] = { t: 's', v: def.headers[C]}; // create cell if it doesn't exist
            ws[cell_ref].s = headerCellStyle;
         }
        const colWidths = def.headers.map(() => ({ wch: 15 }));
        ws['!cols'] = colWidths;
      }
      XLSX.utils.book_append_sheet(wb, ws, def.name);
    });
    
    const excelFileName = `ProductionData_${currentBatchNo === 'N/A' ? Date.now() : currentBatchNo.replace(/[^a-zA-Z0-9_\\-]/g, '_')}.xlsx`;
    XLSX.writeFile(wb, excelFileName);
    message.success({ content: 'Excel file generated successfully!', key: 'exporting', duration: 2 });
    setIsExporting(false);
  };

  // New function to export Sash Welding data to a separate Excel file
  const exportSashWeldingToExcel = () => {
    if (!calculatedData.sashWelding || calculatedData.sashWelding.length === 0) {
      message.error('No Sash Welding data available to export.');
      return;
    }
    setIsExportingSashWelding(true);
    message.loading({ content: 'Generating Sash Welding Excel file...', key: 'exportingSashWelding' });

    const wb = XLSX.utils.book_new();
    const currentBatchNo = batchNo || 'N/A';

    const defaultCellStyle = {
      font: { name: 'Calibri', sz: 12 },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    const headerCellStyle = {
      ...defaultCellStyle,
      font: { ...defaultCellStyle.font, bold: true },
      fill: { fgColor: { rgb: "FFFF00" } } 
    };

    const headers = ['Batch NO.-ID', 'Customer-ID', 'Style', 'W', 'H', 'Sash W', 'Sash H', 'Pcs'];
    
    const dataForSheet = calculatedData.sashWelding.map((row, index) => [
      `${currentBatchNo}-${row.ID}`,
      `${row.Customer || 'N/A'}-${row.ID}`,
      row.Style,
      row.SashW, // Assuming SashW from writeSashWeldingEntry is BaseSashW
      row.SashH, // Assuming SashH from writeSashWeldingEntry is BaseSashH
      row.WeldingCutW,
      row.WeldingCutH,
      row.Pcs
    ]);

    const ws_data = [headers, ...dataForSheet];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply styles
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue; 
        ws[cell_ref].s = (R === 0) ? headerCellStyle : defaultCellStyle;
      }
    }
    
    // Set column widths (optional, but good for readability)
    const colWidths = headers.map(() => ({ wch: 15 })); // Default width
    colWidths[0] = { wch: 25 }; // Batch NO.-ID
    colWidths[1] = { wch: 25 }; // Customer-ID
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Sash Welding List');
    const welderExcelFileName = `${currentBatchNo.replace(/[^a-zA-Z0-9_\-]/g, '_')}_welder.xlsx`;
    XLSX.writeFile(wb, welderExcelFileName);
    message.success({ content: 'Sash Welding Excel file generated successfully!', key: 'exportingSashWelding', duration: 2 });
    setIsExportingSashWelding(false);
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
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [] });
      return;
    }
    
    setIsProcessing(true);
    message.loading({ content: 'Processing selected rows...', key: 'processing' });

    const selectedData = excelData.filter(item => selectedRowKeys.includes(item.ID.toString()));

    if (selectedData.length === 0) {
      message.error('No rows selected for processing.');
      setIsProcessing(false);
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [] });
      return;
    }
    
    const calculator = new WindowCalculator();
    calculator.resetData(); // Reset before processing a new batch of selected rows

    selectedData.forEach((windowData, index) => {
      const sequentialId = index + 1;
      const originalId = windowData.ID;

      let mappedFrameType = windowData.Frame || '';
      if (mappedFrameType in frameMapping) {
        mappedFrameType = frameMapping[mappedFrameType];
      }

      const windowDataForCalc = {
        ...windowData, 
        ID: sequentialId,      
        originalId: originalId, 
        Frame: mappedFrameType, 
        BatchNO: batchNo        
      };
      
      calculator.processWindow(windowDataForCalc);
    });

    const allCalculatedData = calculator.getAllData();
    const finalInfoData = allCalculatedData.info || [];
    
    // Sash Welding Data is now directly from the calculator
    const sashWeldingDataFromCalc = allCalculatedData.sashWelding || [];

    setCalculatedData({
      info: finalInfoData,
      frame: allCalculatedData.frame || [],
      sash: allCalculatedData.sash || [],
      glass: allCalculatedData.glass || [],
      screen: allCalculatedData.screen || [],
      parts: allCalculatedData.parts || [],
      grid: allCalculatedData.grid || [],
      order: allCalculatedData.order || [],
      label: allCalculatedData.label || [],
      sashWelding: sashWeldingDataFromCalc, // Use directly from calculator
    });
    message.success(`Processed ${selectedData.length} selected rows. Detailed tables generated!`);
    console.log('===== Selective calculation complete =====');
    setIsProcessing(false);
  };

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
      info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: []
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
      case 'sashWelding':
        console.log("正在渲染sashWelding表格，数据:", calculatedData.sashWelding);
        return <PrintSashWeldingTable batchNo={batchNo} calculatedData={calculatedData.sashWelding} />;
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

  // Add a new function to handle clearing form and data (if not fully covered by processExcelFile reset)
  const handleClearAllData = () => {
    setExcelData([]);
    setSelectedRowKeys([]);
    setCalculatedData({
      info: [],
      frame: [],
      sash: [],
      glass: [],
      screen: [],
      parts: [],
      grid: [],
      order: [],
      label: [],
      sashWelding: [] // Ensure sashWelding is cleared
    });
    setIsDataLoaded(false);
    setBatchNo('');
    // Optionally clear logs or other states if needed
    // setLogs([]);
    message.info('All data cleared.');
  };

  // Adjust TabsComponent to include Sash Welding if tabs are used for print sections
  const printTabs = [
    { key: 'general', title: 'General Info' },
    { key: 'frame', title: 'Frame' },
    { key: 'sash', title: 'Sash' },
    { key: 'sashWelding', title: 'Sash Welding' }, // Added Sash Welding Tab
    { key: 'glass', title: 'Glass' },
    { key: 'screen', title: 'Screen' },
    { key: 'parts', title: 'Parts' },
    { key: 'grid', title: 'Grid' },
    { key: 'order', title: 'Glass Order' },
    { key: 'label', title: 'Label' },
  ];

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
            disabled={!isDataLoaded || calculatedData.info.length === 0}
          >
            打印
          </Button>
          <Button 
            icon={<FileExcelOutlined />} 
            onClick={exportToExcel}
            disabled={!isDataLoaded || calculatedData.info.length === 0 || isExporting}
            loading={isExporting}
          >
            导出Excel
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportSashWeldingToExcel} loading={isExportingSashWelding} disabled={!isDataLoaded || !calculatedData.sashWelding || calculatedData.sashWelding.length === 0} style={{ marginLeft: 8 }}>
            导出Sash Welding Excel
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
                <TabPane tab="Sash Welding" key="sashWelding" />
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
