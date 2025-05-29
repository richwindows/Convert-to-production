import React, { useState, useEffect } from 'react';
import { Layout, Upload, Button, Input, Table, message, Space, Card, Tabs, Modal } from 'antd';
import { UploadOutlined, PrinterOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import 'antd/dist/antd.css';
import './App.css';
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
import DataMappingTest from './components/DataMappingTest';
import ProcessingLog from './components/ProcessingLog';
import PrintMaterialCuttingTable from './components/PrintMaterialCuttingTable';
import PrintOptimizedFrameTable from './components/PrintOptimizedFrameTable';
import PrintOptimizedSashTable from './components/PrintOptimizedSashTable';
import PrintOptimizedPartsTable from './components/PrintOptimizedPartsTable';

const { Header, Content, Footer } = Layout;

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
  const [printTimestamp, setPrintTimestamp] = useState('');
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [windowFormModal, setWindowFormModal] = useState(false);
  const [showMappingTool, setShowMappingTool] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSashWelding, setIsExportingSashWelding] = useState(false);
  const [isExportingDecaCutting, setIsExportingDecaCutting] = useState(false);
  const [isExportingGlassOrder, setIsExportingGlassOrder] = useState(false);
  const [isExportingLabel, setIsExportingLabel] = useState(false);
  const [customStartId, setCustomStartId] = useState(1);
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
    materialCutting: []
  });

  // Process the Excel file
  const processExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      
      const successfullyProcessedData = [];
      const errorItems = [];
      const extractableColors = ['white', 'almond']; // lowercase for matching

      json.forEach((item, index) => {
        const excelRowNumber = index + 2;
        const idForErrorMessage = item.ID || `Excel Row ${excelRowNumber}`;

        // 1. Process Frame and Color
        let rawFrameFromExcel = item.Frame || '';
        let rawColorFromExcel = item.Color || '';
        let processedFrame = rawFrameFromExcel;
        let processedColor = rawColorFromExcel;

        if (typeof rawFrameFromExcel === 'string' && rawFrameFromExcel.includes('-')) {
            const lastHyphenIndex = rawFrameFromExcel.lastIndexOf('-');
            const partBeforeHyphen = rawFrameFromExcel.substring(0, lastHyphenIndex).trim();
            const partAfterHyphen = rawFrameFromExcel.substring(lastHyphenIndex + 1).trim();

            if (partBeforeHyphen && partAfterHyphen) { // Both parts must exist
                const potentialColorKey = partAfterHyphen.toLowerCase();
                if (extractableColors.includes(potentialColorKey)) {
                    processedFrame = partBeforeHyphen;
                    // Normalize capitalization for the extracted color
                    if (potentialColorKey === 'white') processedColor = 'White';
                    else if (potentialColorKey === 'almond') processedColor = 'Almond';
                }
            }
        }

        let mappedFrame = processedFrame;
        if (frameMapping.hasOwnProperty(processedFrame)) {
            mappedFrame = frameMapping[processedFrame];
        }

        // 2. Validate FH (using item.FH directly from Excel)
        let fhValue = item.FH;
        let isValidFH = true;
        let specificFHValidationError = '';

        if (fhValue == null || (typeof fhValue === 'string' && fhValue.trim() === '')) {
          fhValue = '';
        } else if (typeof fhValue === 'number') {
          if (!isFinite(fhValue)) {
             isValidFH = false;
             specificFHValidationError = `Item [${idForErrorMessage}]: FH value is a non-finite number (${fhValue}).`;
          }
        } else if (typeof fhValue === 'string') {
          const fhStrTrimmed = fhValue.trim();
          if (/[a-zA-Z]/.test(fhStrTrimmed)) {
            isValidFH = false;
            specificFHValidationError = `Item [${idForErrorMessage}]: FH value "${fhStrTrimmed}" contains letters and is invalid. Only numbers are allowed.`;
          } else {
            const parsedNum = parseFloat(fhStrTrimmed);
            if (isFinite(parsedNum)) {
              fhValue = parsedNum;
            } else {
              isValidFH = false;
              specificFHValidationError = `Item [${idForErrorMessage}]: FH value "${fhStrTrimmed}" is not a valid number.`;
            }
          }
        } else {
          isValidFH = false;
          specificFHValidationError = `Item [${idForErrorMessage}]: FH value has an unexpected type (${typeof fhValue}).`;
        }

        // 3. Push data or error
        if (!isValidFH) {
          message.error(specificFHValidationError + " This item will not be processed.", 6);
          errorItems.push({ id: idForErrorMessage, value: item.FH, error: specificFHValidationError });
        } else {
          successfullyProcessedData.push({
            Customer: item.Customer || '',
            ID: (item.ID || excelRowNumber).toString(),
            Style: item.Style || '',
            W: item.W || '',
            H: item.H || '',
            FH: fhValue, // Validated FH
            Frame: mappedFrame, // Processed and mapped Frame
            Glass: item.Glass || '',
            Argon: item.Argon || '',
            Grid: item.Grid || '',
            Color: processedColor, // Potentially extracted and overridden Color
            Note: item.Note || '',
            Quantity: item.Quantity || 1,
          });
        }
      });

      setExcelData(successfullyProcessedData);
      setSelectedRowKeys([]);
      setCalculatedData({ 
        info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: []
      });
      setIsDataLoaded(successfullyProcessedData.length > 0);

      if (errorItems.length > 0) {
        message.warning(`Excel import complete. ${successfullyProcessedData.length} items loaded. ${errorItems.length} items were skipped due to invalid FH values. Check console for details.`, 7);
        console.warn("The following items were skipped due to invalid FH values:", errorItems);
      } else if (json.length === 0 && file.size > 0) {
        message.info("The Excel file appears to be empty or has no data rows after the header.");
      } else if (successfullyProcessedData.length === 0 && json.length > 0) {
        message.error("No items could be processed from the Excel file. Check FH values or file content.", 7);
      } else if (successfullyProcessedData.length > 0) {
        message.success(`${file.name} imported successfully. ${successfullyProcessedData.length} items loaded.`);
      }
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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    setPrintTimestamp(formattedTimestamp);
    setActiveTab('print');
    setIsPreparingPrint(true); // Signal that we are preparing to print
  };

  // Effect to handle actual printing after state updates
  useEffect(() => {
    if (isPreparingPrint && activeTab === 'print' && printTimestamp) {
      const timer = setTimeout(() => {
        window.print();
        setIsPreparingPrint(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isPreparingPrint, activeTab, printTimestamp]);

  // Ensure exportGlassOrderToExcel is defined within App scope
  const exportGlassOrderToExcel = () => {
    if (!calculatedData.order || calculatedData.order.length === 0) {
      message.error('没有Glass Order数据可导出。');
      return;
    }
    setIsExportingGlassOrder(true);
    message.loading({ content: '正在生成Glass Order Excel文件...', key: 'exportingGlassOrder' });
    const wb = XLSX.utils.book_new();
    const currentBatchNo = batchNo || 'N/A';
    const defaultCellStyle = { font: { name: 'Calibri', sz: 12 }, border: { top: { style: 'thin', color: { rgb: "000000" } }, bottom: { style: 'thin', color: { rgb: "000000" } }, left: { style: 'thin', color: { rgb: "000000" } }, right: { style: 'thin', color: { rgb: "000000" } } }, alignment: { horizontal: "center", vertical: "center" } };
    const headerCellStyle = { ...defaultCellStyle, font: { ...defaultCellStyle.font, bold: true }, fill: { fgColor: { rgb: "FFFF00" } } };
    const headers = ['Batch NO.', 'Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity', 'Glass Type', 'Annealed/Tempered', 'Thickness', 'Glass Width', 'Glass Height', 'Notes'];
    const dataForSheet = calculatedData.order.map(row => [currentBatchNo, row.Customer, row.Style, row.W, row.H, row.FH, row.ID, row.line, row.Quantity, row['Glass Type'], row['Annealed/Tempered'], row.Thickness, row.Width, row.Height, row.Notes]);
    const ws_data = [headers, ...dataForSheet];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) { for (let C = range.s.c; C <= range.e.c; ++C) { const cell_address = { c: C, r: R }; const cell_ref = XLSX.utils.encode_cell(cell_address); if (!ws[cell_ref]) continue; ws[cell_ref].s = (R === 0) ? headerCellStyle : defaultCellStyle; } }
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Glass Order');
    const glassOrderFileName = `${currentBatchNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_GlassOrder.xlsx`;
    XLSX.writeFile(wb, glassOrderFileName);
    message.success({ content: 'Glass Order Excel文件生成成功！', key: 'exportingGlassOrder', duration: 2 });
    setIsExportingGlassOrder(false);
  };

  // Ensure exportLabelToExcel is defined within App scope
  const exportLabelToExcel = () => {
    if (!calculatedData.label || calculatedData.label.length === 0) {
      message.error('没有Label数据可导出。');
      return;
    }
    setIsExportingLabel(true);
    message.loading({ content: '正在生成Label Excel文件...', key: 'exportingLabel' });
    const wb = XLSX.utils.book_new();
    const currentBatchNo = batchNo || 'N/A';
    const defaultCellStyle = { font: { name: 'Calibri', sz: 12 }, border: { top: { style: 'thin', color: { rgb: "000000" } }, bottom: { style: 'thin', color: { rgb: "000000" } }, left: { style: 'thin', color: { rgb: "000000" } }, right: { style: 'thin', color: { rgb: "000000" } } }, alignment: { horizontal: "center", vertical: "center" } };
    const headerCellStyle = { ...defaultCellStyle, font: { ...defaultCellStyle.font, bold: true }, fill: { fgColor: { rgb: "FFFF00" } } };
    const headers = ['Batch NO.', 'Customer', 'ID', 'Style', 'Size (WxH)', 'Frame', 'Glass+Argon', 'Grid', 'P.O / Note', 'Invoice Num. Batch NO.'];
    const dataForSheet = calculatedData.label.map(row => [currentBatchNo, row.Customer, row.ID, row.Style, row.Size, row.Frame, row.Glass, row.Grid, row.PO || row.Note || '', currentBatchNo]);
    const ws_data = [headers, ...dataForSheet];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) { for (let C = range.s.c; C <= range.e.c; ++C) { const cell_address = { c: C, r: R }; const cell_ref = XLSX.utils.encode_cell(cell_address); if (!ws[cell_ref]) continue; ws[cell_ref].s = (R === 0) ? headerCellStyle : defaultCellStyle; } }
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Labels');
    const labelFileName = `${currentBatchNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_Labels.xlsx`;
    XLSX.writeFile(wb, labelFileName);
    message.success({ content: 'Label Excel文件生成成功！', key: 'exportingLabel', duration: 2 });
    setIsExportingLabel(false);
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
        mapFn: (row) => [currentBatchNo, row.Customer, row.Style, row.W, row.H, row.FH, row.ID, row.line, row.quantity, row.glassType, row.Tmprd, row.thickness, row.width, row.height, row.grid, row.argon]
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
        mapFn: (row) => [currentBatchNo, row.Customer, row.Style, row.W, row.H, row.FH, row.ID, row.line, row.Quantity, row['Glass Type'], row['Annealed/Tempered'], row.Thickness, row.Width, row.Height, row.Notes]
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
    
    const fileName = `${currentBatchNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_ProductionData.xlsx`;
    XLSX.writeFile(wb, fileName);
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

    XLSX.utils.book_append_sheet(wb, ws, 'Sash Welding');
    const fileNameSashWelding = `${currentBatchNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_SashWelding.xlsx`;
    XLSX.writeFile(wb, fileNameSashWelding);
    message.success({ content: 'Sash Welding Excel file generated successfully!', key: 'exportingSashWelding', duration: 2 });
    setIsExportingSashWelding(false);
  };

  // New function to export only DECA Cutting data to Excel
  const exportDecaCuttingToExcel = () => {
    if (!calculatedData.materialCutting || calculatedData.materialCutting.length === 0) {
      message.error('No DECA Cutting data available to export.');
      return;
    }
    
    setIsExportingDecaCutting(true);
    message.loading({ content: 'Generating DECA Cutting Excel file...', key: 'exportingDecaCutting' });

    const currentBatchNo = batchNo || 'N/A';
    
    // Get today's date in MMDDYYYY format (variables month, day, year are not used further)
    // const today = new Date(); 
    // const month = String(today.getMonth() + 1).padStart(2, '0');
    // const day = String(today.getDate()).padStart(2, '0');
    // const year = today.getFullYear();

    // Format headers and data for Excel
    const headers = [
      'Batch No', 'Order No', 'Order Item', 'Material Name',
      'Cutting ID', 'Pieces ID', 'Length', 'Angles', 'Qty',
      'Bin No', 'Position', 'Style', 'Frame', 'Color', 'Painting'
    ];
    
    const dataForSheet = calculatedData.materialCutting.map(item => [
      currentBatchNo,
      item.OrderNo || item.ID || '',
      item.OrderItem || '1',
      item.MaterialName || '',
      item.CuttingID || item['Cutting ID'] || '',
      item.PiecesID || item['Pieces ID'] || '',
      item.Length || '',
      item.Angles || 'V',
      item.Qty || '',
      item.BinNo || item.ID || '',
      item.Position || '',
      item.Style || '',
      item.Frame || '',
      item.Color || '',
      item.Painting || ''
    ]);

    // Create the Excel workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataForSheet]);

    // Apply styles
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue;
        ws[cell_ref].s = {
          font: { name: 'Calibri', sz: 12 },
          border: { top: { style: 'thin', color: { rgb: "000000" } }, bottom: { style: 'thin', color: { rgb: "000000" } }, left: { style: 'thin', color: { rgb: "000000" } }, right: { style: 'thin', color: { rgb: "000000" } } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }
    
    // Set column widths (optional, but good for readability)
    const colWidths = headers.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;

    // Create the filename
    const fileNameDecaCutting = `${currentBatchNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_DECA_Cutting.xlsx`;
    
    // Save the workbook to a file
    XLSX.writeFile(wb, fileNameDecaCutting);
    message.success({ content: 'DECA Cutting Excel file generated successfully!', key: 'exportingDecaCutting', duration: 2 });
    setIsExportingDecaCutting(false);
  };

  // Switch to print view
  const handlePrintView = () => {
    setActiveTab('print');
    setPrintTab('general'); // 确保切换到打印视图时默认显示General Information标签页
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
  const generateDetailedDataAndNotify = async () => {
    if (!isDataLoaded || excelData.length === 0) {
      message.error('No base data available. Please upload an Excel file or add data first.');
      return;
    }

    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      message.info('Please select rows from the table to process detailed data.');
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: [] });
      return;
    }
    
    setIsProcessing(true);
    message.loading({ content: 'Processing selected rows...', key: 'processing' });

    const selectedData = excelData.filter(item => selectedRowKeys.includes(item.ID.toString()));

    if (selectedData.length === 0) {
      message.error('No rows selected for processing.');
      setIsProcessing(false);
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: [] });
      return;
    }
    
    const calculator = new WindowCalculator();
    calculator.resetData(); // Reset before processing a new batch of selected rows

    selectedData.forEach((windowData, index) => {
      const sequentialId = index + customStartId; // 使用自定义起始ID
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

    // Finalize material cutting before getting all data
    await calculator.finalizeMaterialCutting();

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
      materialCutting: allCalculatedData.materialCutting || [],
    });
    message.success(`Processed ${selectedData.length} selected rows. Detailed tables generated!`);
    console.log('===== Selective calculation complete =====');
    setIsProcessing(false);
  };

  // Add a new function to handle cell changes in print tables
  const handlePrintTableCellChange = (dataKey, rowIndex, columnKey, value) => {
    if (columnKey === 'FH') {
      let validatedFH = value;
      let rejectChange = false;
      let errorMessage = '';

      if (value == null || (typeof value === 'string' && value.trim() === '')) {
        validatedFH = ''; // Normalize
      } else if (typeof value === 'number') {
        if (!isFinite(value)){
            rejectChange = true;
            errorMessage = `Invalid FH: Non-finite number (${value}).`;
        }
        // else validatedFH remains the finite number
      } else if (typeof value === 'string') {
        const valTrimmed = value.trim();
        if (/[a-zA-Z]/.test(valTrimmed)) {
          rejectChange = true;
          errorMessage = `Invalid FH: "${valTrimmed}" contains letters. Only numbers allowed.`;
        } else {
          const parsedNum = parseFloat(valTrimmed);
          if (isFinite(parsedNum)) {
            validatedFH = parsedNum;
          } else {
            rejectChange = true;
            errorMessage = `Invalid FH: "${valTrimmed}" is not a valid number.`;
          }
        }
      } else {
        rejectChange = true;
        errorMessage = `Invalid FH: Unexpected data type (${typeof value}).`;
      }

      if (rejectChange) {
        message.error(errorMessage + ' Change rejected.', 5);
        return; // Reject the change by not proceeding to setCalculatedData
      }
      // If validation passed, value will be updated with validatedFH
      value = validatedFH;
    }

    setCalculatedData(prevData => {
      const updatedTableData = [...prevData[dataKey]];
      if (updatedTableData[rowIndex]) {
        updatedTableData[rowIndex] = { ...updatedTableData[rowIndex], [columnKey]: value };
      }
      return { ...prevData, [dataKey]: updatedTableData };
    });
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
      info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: []
    });

    setIsDataLoaded(true); // excelData has content
    message.info('New window added to the preview table. Please select rows and process to update detailed data.');
  };

  // 渲染打印选择的表格
  const renderPrintTable = () => {
    // 添加调试信息
    console.log("当前打印标签:", printTab);
    console.log("calculatedData:", calculatedData);
    
    let tableToRender;
    switch (printTab) {
      case 'general':
        console.log("正在渲染general表格，数据:", calculatedData.info);
        tableToRender = <PrintTable batchNo={batchNo} calculatedData={calculatedData.info} onCellChange={handlePrintTableCellChange} />;
        break;
      case 'frame':
        console.log("正在渲染frame表格，数据:", calculatedData.frame);
        tableToRender = <PrintFrameTable batchNo={batchNo} calculatedData={calculatedData.frame} onCellChange={handlePrintTableCellChange} />;
        break;
      case 'optimizedFrame':
        console.log("正在渲染optimized frame表格，数据:", calculatedData.frame);
        tableToRender = <PrintOptimizedFrameTable batchNo={batchNo} calculatedData={calculatedData.frame} />;
        break;
      case 'sash':
        console.log("正在渲染sash表格，数据:", calculatedData.sash);
        tableToRender = <PrintSashTable batchNo={batchNo} calculatedData={calculatedData.sash} onCellChange={handlePrintTableCellChange} />;
        break;
      case 'optimizedSash':
        console.log("正在渲染optimized sash表格，数据:", calculatedData.sash);
        tableToRender = <PrintOptimizedSashTable batchNo={batchNo} calculatedData={calculatedData.sash} />;
        break;
      case 'optimizedParts':
        console.log("正在渲染optimized parts表格，数据:", calculatedData.parts);
        tableToRender = <PrintOptimizedPartsTable batchNo={batchNo} calculatedData={calculatedData.parts} />;
        break;
      case 'sashWelding':
        console.log("正在渲染sashWelding表格，数据:", calculatedData.sashWelding);
        tableToRender = (
          <div>
            <div className="table-actions">
              <Button 
                type="primary"
                icon={<FileExcelOutlined />} 
                onClick={exportSashWeldingToExcel}
                loading={isExportingSashWelding}
                disabled={!calculatedData.sashWelding || calculatedData.sashWelding.length === 0}
              >
                导出Sash Welding Excel
              </Button>
            </div>
            <PrintSashWeldingTable batchNo={batchNo} calculatedData={calculatedData.sashWelding} onCellChange={handlePrintTableCellChange} />
          </div>
        );
        break;
      case 'glass':
        console.log("正在渲染glass表格，数据:", calculatedData.glass);
        tableToRender = <PrintGlassTable batchNo={batchNo} calculatedData={calculatedData.glass} onCellChange={handlePrintTableCellChange} />;
        break;
      case 'screen':
        console.log("正在渲染screen表格，数据:", calculatedData.screen);
        tableToRender = <PrintScreenTable batchNo={batchNo} calculatedData={calculatedData.screen} onCellChange={handlePrintTableCellChange} />;
        break;
      case 'parts':
        console.log("正在渲染parts表格，数据:", calculatedData.parts);
        tableToRender = <PrintPartsTable batchNo={batchNo} calculatedData={calculatedData.parts} onCellChange={handlePrintTableCellChange} />;
        break;
      case 'grid':
        console.log("正在渲染grid表格，数据:", calculatedData.grid);
        tableToRender = <PrintGridTable batchNo={batchNo} calculatedData={calculatedData.grid} onCellChange={handlePrintTableCellChange} />;
        break;
      case 'order':
        console.log("正在渲染order表格，数据:", calculatedData.order);
        tableToRender = (
          <div>
            <div className="table-actions">
              <Button 
                type="primary"
                icon={<FileExcelOutlined />} 
                onClick={exportGlassOrderToExcel}
                loading={isExportingGlassOrder}
                disabled={!calculatedData.order || calculatedData.order.length === 0}
              >
                导出Glass Order Excel
              </Button>
            </div>
            <PrintGlassOrderTable 
              batchNo={batchNo} 
              calculatedData={calculatedData.order} 
              onCellChange={handlePrintTableCellChange} // Pass the handler
            />
          </div>
        );
        break;
      case 'label':
        console.log("正在渲染label表格，数据:", calculatedData.label);
        tableToRender = (
          <div>
            <div className="table-actions">
              <Button 
                type="primary"
                icon={<FileExcelOutlined />} 
                onClick={exportLabelToExcel}
                loading={isExportingLabel}
                disabled={!calculatedData.label || calculatedData.label.length === 0}
              >
                导出Label Excel
              </Button>
            </div>
            <PrintLabelTable batchNo={batchNo} calculatedData={calculatedData.label} onCellChange={handlePrintTableCellChange} />
          </div>
        );
        break;
      case 'materialCutting':
        console.log("正在渲染DECA Cutting表格，数据:", calculatedData.materialCutting);
        tableToRender = (
          <div>
            <div className="table-actions">
              <Button 
                type="primary"
                icon={<FileExcelOutlined />} 
                onClick={exportDecaCuttingToExcel}
                loading={isExportingDecaCutting}
                disabled={!calculatedData.materialCutting || calculatedData.materialCutting.length === 0}
              >
                导出DECA Cutting Excel
              </Button>
            </div>
            <PrintMaterialCuttingTable batchNo={batchNo} calculatedData={calculatedData.materialCutting} onCellChange={handlePrintTableCellChange} />
          </div>
        );
        break;
      default:
        tableToRender = <PrintTable batchNo={batchNo} calculatedData={calculatedData.info} />;
    }

    return (
      <>
        {printTimestamp && activeTab === 'print' && <div className="print-timestamp">{printTimestamp}</div>}
        {tableToRender}
      </>
    );
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="header-content-wrapper">
          <div className="logo">Production Converter</div>
          <Space size="middle">
            <Input
              placeholder="ID起始值"
              type="number"
              value={customStartId}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                setCustomStartId(value);
              }}
              style={{ width: 150 }}
              prefix={<span style={{ color: 'var(--text-secondary)' }}>起始ID:</span>}
            />
            <Input 
              placeholder="Enter Batch NO." 
              value={batchNo} 
              onChange={handleBatchNoChange}
              style={{ width: 200 }}
              prefix={<span style={{ color: 'var(--text-secondary)' }}>批次号:</span>}
            />
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
              disabled={!isDataLoaded || calculatedData.info.length === 0}
              type="primary"
              ghost
            >
              打印
            </Button>
            <Button
              icon={<FileExcelOutlined />} 
              onClick={exportToExcel}
              disabled={!isDataLoaded || calculatedData.info.length === 0 || isExporting}
              loading={isExporting}
              type="primary"
            >
              导出Excel
            </Button>
          <Button 
            onClick={() => setWindowFormModal(true)}
            type="default"
          >
            添加窗户
          </Button>
            <Button
            onClick={() => setShowMappingTool(true)}
            type="default"
            >
            数据映射工具
            </Button>
              <Button
            onClick={() => setShowLogs(!showLogs)}
            type={showLogs ? "primary" : "default"}
            ghost={showLogs}
          >
            {showLogs ? '隐藏日志' : '显示日志'}
              </Button>
          </Space>
        </div>
      </Header>
      <Content className="content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            {
              label: <span><span role="img" aria-label="database">📊</span> 数据总览</span>,
              key: 'data',
              children: (
                <Card 
                  title={<span style={{ fontSize: '16px', fontWeight: '600' }}>导入数据预览 (Excel Data Preview)</span>}
                  bordered={false}
                  className="data-preview-card"
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="upload-section">
                      <Upload beforeUpload={processExcelFile} showUploadList={false}>
                        <Button icon={<UploadOutlined />} size="large">上传 Excel 文件</Button>
                      </Upload>
                      <Button 
                        onClick={generateDetailedDataAndNotify} 
                        disabled={!isDataLoaded || selectedRowKeys.length === 0 || isProcessing}
                        loading={isProcessing}
                        type="primary" 
                        size="large"
                      >
                        {isProcessing ? '处理中...' : '处理选中行'}
                      </Button>
                      {isDataLoaded && calculatedData.info.length > 0 && (
                        <Button 
                          onClick={handlePrintView}
                          type="primary" 
                          ghost
                          size="large"
                          icon={<PrinterOutlined />}
                        >
                          打印视图
                        </Button>
                      )}
                    </div>
                    {isDataLoaded && (
                      <Table 
                        dataSource={excelData} 
                        columns={columns} 
                        rowKey="ID" 
                        rowSelection={rowSelectionConfig}
                        loading={!isDataLoaded && excelData.length === 0}
                        bordered
                        className="data-table"
                        pagination={{ 
                          defaultPageSize: 10, 
                          showSizeChanger: true, 
                          pageSizeOptions: ['10', '20', '50', '100'],
                          showTotal: (total) => `共 ${total} 条记录`
                        }}
                      />
                    )}
                  </Space>
                </Card>
              ),
            },
            {
              label: <span><span role="img" aria-label="printer">🖨️</span> 打印视图</span>,
              key: 'print',
              children: (
                <>
                  <Card className="print-selector" bordered={false}>
                    <Tabs 
                      activeKey={printTab} 
                      onChange={setPrintTab} 
                      type="line"
                      animated={{ inkBar: true, tabPane: false }}
                      tabBarStyle={{
                        marginBottom: '16px', 
                        backgroundColor: 'transparent',
                        padding: '8px 16px 0'
                      }}
                      items={[
                        { label: "General Information", key: "general" },
                        { label: "Frame", key: "frame" },
                        { label: "Frame Print", key: "optimizedFrame" },
                        { label: "Sash", key: "sash" },
                        { label: "Sash Print", key: "optimizedSash" },
                        { label: "Sash Welding", key: "sashWelding" },
                        { label: "Glass", key: "glass" },
                        { label: "Screen", key: "screen" },
                        { label: "Parts", key: "parts" },
                        { label: "Parts Print", key: "optimizedParts" },
                        { label: "Grid", key: "grid" },
                        { label: "Glass Order", key: "order" },
                        { label: "Label", key: "label" },
                        { label: "DECA Cutting", key: "materialCutting" },
                      ]}
                    />
                  </Card>
                  <div className="print-container">
                    {renderPrintTable()}
                  </div>
                </>
              ),
            },
          ]}
        />
        <Modal 
          title={<span style={{ fontSize: '16px', fontWeight: '600' }}>手动添加窗户数据</span>}
          open={windowFormModal}
          onCancel={() => setWindowFormModal(false)}
          footer={null}
          width={800}
          destroyOnClose
          centered
        >
          <WindowForm onAdd={handleAddWindow} onClear={() => setWindowFormModal(false)} />
        </Modal>
        {showMappingTool && (
          <div style={{ marginTop: '20px' }}>
            <DataMappingTest />
          </div>
        )}
        {showLogs && (
          <Card 
            title={<span style={{ fontSize: '16px', fontWeight: '600' }}>处理日志</span>}
            style={{ marginTop: '20px' }}
            bordered={false}
          >
            <ProcessingLog />
          </Card>
        )}
      </Content>
      <Footer className="footer">
        Production Converter &copy;{new Date().getFullYear()} | Rich Windows & Doors
      </Footer>
    </Layout>
  );
}

export default App;
