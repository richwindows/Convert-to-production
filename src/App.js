import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, Button, Table, message, Checkbox, Spin, Layout, Menu, Tabs, Card, Alert,
  Modal, Select, Input, Form, Row, Col, Space
} from 'antd';
import { UploadOutlined, FileExcelOutlined, SettingOutlined, ClearOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, PrinterOutlined, ExportOutlined, BarcodeOutlined, BuildOutlined, DatabaseOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
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
import { generateBarcode } from './utils/barcodeUtils';
import { fetchInvoiceData, transformInvoiceDataToWindowData, fetchOrderItemsWithBatch } from './services/supabaseService';
import { convertToDecimal } from './utils/numberUtils';

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

const frameMapping = {
  'RT': 'Retrofit',
  'Nailon': 'Nailon',
  'Block': 'Block',
  'BS1 3/4': 'Block-slop 1 3/4',
  'BS1/2': 'Block-slop 1/2',
};

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]); // 存储多个文件信息
  const [allExcelData, setAllExcelData] = useState([]); // 合并后的所有数据
  const [selectedFileIds, setSelectedFileIds] = useState([]);
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
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedRow, setHighlightedRow] = useState(null);
  
  // Supabase相关状态
  const [invoiceId, setInvoiceId] = useState('');
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  


  // States for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ 
    current: 1, 
    pageSize: 10, 
    showSizeChanger: true, 
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total) => `共 ${total} 条记录`
  });
  const [highlightedRowKey, setHighlightedRowKey] = useState(null);

  const handleTableChange = (p, filters, sorter) => {
    setPagination(p);
    // Clear highlight when changing page manually
    if (highlightedRowKey) {
      const rowIndex = allExcelData.findIndex(item => item.ID === highlightedRowKey);
      if (rowIndex > -1) {
        const pageOfHighlight = Math.floor(rowIndex / p.pageSize) + 1;
        if (pageOfHighlight !== p.current) {
          setHighlightedRowKey(null);
        }
      } else {
        setHighlightedRowKey(null);
      }
    }
  };

  const jumpToResult = useCallback((result) => {
    setPagination(p => ({ ...p, current: result.page }));
    setHighlightedRowKey(result.key);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setHighlightedRowKey(null);
      return;
    }

    const results = [];
    const lowercasedValue = searchTerm.toLowerCase();

    allExcelData.forEach((row, index) => {
      const rowKey = row.ID;
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const cellValue = row[key];
          if (cellValue && cellValue.toString().toLowerCase().includes(lowercasedValue)) {
            const page = Math.floor(index / pagination.pageSize) + 1;
            const rowIndex = (index % pagination.pageSize) + 1;
            results.push({
              key: rowKey,
              page,
              rowIndex,
              text: `在第 ${page} 页, 第 ${rowIndex} 行找到`,
              originalIndex: index,
            });
            break; 
          }
        }
      }
    });

    setSearchResults(results);
    if (results.length > 0) {
      jumpToResult(results[0]);
    } else {
      setHighlightedRowKey(null);
      message.info('未找到匹配项。');
    }
  }, [searchTerm, allExcelData, pagination.pageSize, jumpToResult]);

  // Function to parse filename and determine starting ID
  const parseFilenameForStartingId = (filename) => {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // Look for pattern with hyphens: xxxxxxxx-XX-xx where XX is the sequence number
    const match = nameWithoutExt.match(/-(\d{2})-/);
    
    if (match) {
      const sequenceNumber = parseInt(match[1], 10);
      
      // Map sequence numbers to starting IDs
      switch (sequenceNumber) {
        case 1:
          return 1;
        case 2:
          return 21;
        case 3:
          return 41;
        default:
          // For other sequence numbers, use a formula: (sequenceNumber - 1) * 20 + 1
          return (sequenceNumber - 1) * 20 + 1;
      }
    }
    
    // If no pattern found, default to 1
    console.warn(`No sequence pattern found in filename: ${filename}. Using default starting ID: 1`);
    return 1;
  };

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
      const validFrameTypes = Object.values(frameMapping);
      
      // Get starting ID based on filename
      const startingId = parseFilenameForStartingId(file.name);
      console.log(`File: ${file.name}, Starting ID: ${startingId}`);

      json.forEach((item, index) => {
        const excelRowNumber = index + 2;
        const idForErrorMessage = item.ID || `Excel Row ${excelRowNumber}`;
        let itemIsValid = true;
        const currentItemErrors = [];

        // 0. Pre-process Glass for "B-TP"
        let originalGlassString = item.Glass || '';
        let bottomTemperedValue = 0;
        let glassStringForFurtherProcessing = originalGlassString;

        // 改进的B-TP匹配模式，能更好地处理各种格式
        const btpPattern = /[\s,]*B\s*-\s*TP[\s,]*/gi; // 匹配前后可能有逗号或空格的B-TP

        console.log(`[Excel Import] Item ID [${idForErrorMessage}]: Original Glass: '${originalGlassString}'`);

        if (btpPattern.test(glassStringForFurtherProcessing)) {
            console.log(`[Excel Import] Item ID [${idForErrorMessage}]: 'B-TP' FOUND in '${glassStringForFurtherProcessing}'`);
            bottomTemperedValue = 1;
            
            // 移除B-TP及其前后的逗号和空格
            glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(btpPattern, ' ');
            
            // 清理多余的空格、逗号和斜杠
            glassStringForFurtherProcessing = glassStringForFurtherProcessing.trim();
            glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(/^[\s,/]+|[\s,/]+$/g, ''); // 移除开头结尾的分隔符
            glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(/\s*,\s*,\s*/g, ', '); // 处理连续逗号
            glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(/\s+/g, ' '); // 合并多个空格
            glassStringForFurtherProcessing = glassStringForFurtherProcessing.trim();
            
            // 如果只剩下分隔符，则清空
            if (/^[\s,/]*$/.test(glassStringForFurtherProcessing)) {
                glassStringForFurtherProcessing = "";
            }
            
            console.log(`[Excel Import] Item ID [${idForErrorMessage}]: Glass after B-TP removal: '${glassStringForFurtherProcessing}', bottomTemperedValue: ${bottomTemperedValue}`);
        } else {
            console.log(`[Excel Import] Item ID [${idForErrorMessage}]: 'B-TP' NOT FOUND in '${glassStringForFurtherProcessing}', bottomTemperedValue will be ${bottomTemperedValue}`);
        }
        // End of B-TP processing

        // 1. Process Frame and Color
        let rawFrameFromExcel = item.Frame || '';
        let rawColorFromExcel = item.Color || '';
        let processedFrame = rawFrameFromExcel;
        let processedColor = rawColorFromExcel;

        if (typeof rawFrameFromExcel === 'string' && rawFrameFromExcel.includes('-')) {
            const lastHyphenIndex = rawFrameFromExcel.lastIndexOf('-');
            const partBeforeHyphen = rawFrameFromExcel.substring(0, lastHyphenIndex).trim();
            const partAfterHyphen = rawFrameFromExcel.substring(lastHyphenIndex + 1).trim();

            if (partBeforeHyphen && partAfterHyphen) { 
                const potentialColorKey = partAfterHyphen.toLowerCase();
                if (extractableColors.includes(potentialColorKey)) {
                    processedFrame = partBeforeHyphen;
                    if (potentialColorKey === 'white') processedColor = 'White';
                    else if (potentialColorKey === 'almond') processedColor = 'Almond';
                }
            }
        }

        let mappedFrame = processedFrame; // Default to processedFrame if not in mapping
        if (frameMapping.hasOwnProperty(processedFrame)) {
            mappedFrame = frameMapping[processedFrame];
        }

        // Validate Frame (after potential mapping)
        // Allow empty frame during initial import, it can be defaulted or handled later.
        if (mappedFrame && !validFrameTypes.includes(mappedFrame)) {
            itemIsValid = false;
            currentItemErrors.push(`Invalid Frame: "${rawFrameFromExcel}" (maps to "${mappedFrame}", which is not a recognized type)`);
        }

        // 2. Validate FH (using item.FH directly from Excel)
        let fhValue = item.FH;
        // let isValidFH = true; // Replaced by itemIsValid logic
        // let specificFHValidationError = ''; // Replaced by currentItemErrors

        if (fhValue == null || (typeof fhValue === 'string' && fhValue.trim() === '')) {
          fhValue = '';
        } else if (typeof fhValue === 'number') {
          if (!isFinite(fhValue)) {
             itemIsValid = false;
             currentItemErrors.push(`FH value is a non-finite number (${fhValue})`);
          }
        } else if (typeof fhValue === 'string') {
          const fhStrTrimmed = fhValue.trim();
          if (/[a-zA-Z]/.test(fhStrTrimmed)) {
            itemIsValid = false;
            currentItemErrors.push(`FH value "${fhStrTrimmed}" contains letters. Only numbers are allowed.`);
          } else {
            const parsedNum = parseFloat(fhStrTrimmed);
            if (isFinite(parsedNum)) {
              fhValue = parsedNum;
            } else {
              itemIsValid = false;
              currentItemErrors.push(`FH value "${fhStrTrimmed}" is not a valid number.`);
            }
          }
        } else {
          itemIsValid = false;
          currentItemErrors.push(`FH value has an unexpected type (${typeof fhValue})`);
        }

        // 3. Push data or error
        if (!itemIsValid) {
          const errorString = currentItemErrors.join('; ');
          message.error(`Item [${idForErrorMessage}]: ${errorString}. This item will not be processed.`, 7);
          errorItems.push({ id: idForErrorMessage, value: item, errors: currentItemErrors });
        } else {
          successfullyProcessedData.push({
            Customer: item.Customer || '',
            ID: (item.ID || excelRowNumber).toString(),
            Style: item.Style || '',
            W: convertToDecimal(item.W || ''),
            H: convertToDecimal(item.H || ''),
            FH: convertToDecimal(fhValue), // Validated and converted FH
            Frame: mappedFrame, // Validated and mapped Frame
            Glass: glassStringForFurtherProcessing, // Use the processed glass string
            Argon: item.Argon || '',
            Grid: item.Grid || '',
            Color: processedColor, // Potentially extracted and overridden Color
            Note: item.Note || '',
            Quantity: item.Quantity || 1,
            bottomtempered: bottomTemperedValue, // Add the extracted value here
          });
        }
      });

      // 为新数据分配基于文件名的ID
      const successfullyProcessedDataWithNewIds = successfullyProcessedData.map((item, index) => ({
        ...item,
        ID: (startingId + index).toString() // 使用基于文件名的起始ID
      }));
      
      // 创建文件信息对象
      const fileId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
      const now = new Date();
      const uploadTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const fileInfo = {
        id: fileId,
        name: file.name,
        uploadTime: uploadTime,
        data: successfullyProcessedDataWithNewIds,
        rowCount: successfullyProcessedDataWithNewIds.length
      };

      // 更新文件列表
      setUploadedFiles(prevFiles => [...prevFiles, fileInfo]);
      
      // 更新合并数据
      setAllExcelData(prevData => [...prevData, ...successfullyProcessedDataWithNewIds]);
      
      setSelectedRowKeys([]);
      setCalculatedData({ 
        info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: []
      });
      setIsDataLoaded(true);

      if (errorItems.length > 0) {
        message.warning(`Excel import complete. ${successfullyProcessedData.length} items loaded. ${errorItems.length} items were skipped due to validation errors. Check console for details.`, 7);
        console.warn("The following items were skipped due to validation errors:", errorItems);
      } else if (json.length === 0 && file.size > 0) {
        message.info("The Excel file appears to be empty or has no data rows after the header.");
      } else if (successfullyProcessedData.length === 0 && json.length > 0 && errorItems.length === json.length) { // All items had errors
        message.error(`No items could be processed from the Excel file. All ${json.length} items had validation errors.`, 7);
      } else if (successfullyProcessedData.length === 0 && json.length > 0) { // No items processed, but not all were errors (e.g. empty after header but header existed)
         message.error("No items could be processed from the Excel file. Please check file content and data validity.", 7);
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
        // Display the actual assigned ID from the filename-based logic
        return text;
      }
    },
    { title: 'Customer', dataIndex: 'Customer', key: 'customer' },
    {
      title: 'Style',
      dataIndex: 'Style',
      key: 'style',
      render: (text, record) => {
        // Highlight if Style is empty (basic check)
        if (!text || text.trim() === '') {
          return <span style={{ backgroundColor: 'yellow', padding: '5px', display: 'block', width: '100%' }}>{text}</span>;
        }
        return text;
      }
    },
    { title: 'W', dataIndex: 'W', key: 'w' },
    { title: 'H', dataIndex: 'H', key: 'h' },
    { title: 'FH', dataIndex: 'FH', key: 'fh' },
    {
      title: 'Frame',
      dataIndex: 'Frame',
      key: 'frame',
      render: (text, record) => {
        const validFrameValues = Object.values(frameMapping);
        // Highlight if text exists and is not a valid mapped value
        if (text && !validFrameValues.includes(text)) {
          return <span style={{ backgroundColor: 'yellow', padding: '5px', display: 'block', width: '100%' }}>{text}</span>;
        }
        // Also highlight if the original frame value (before mapping) was problematic, indicated by processExcelFile
        // This requires processExcelFile to add a flag, e.g., record.originalFrameHadError. 
        // For now, this only checks the processed value.
        return text;
      }
    },
    {
      title: 'Glass',
      dataIndex: 'Glass',
      key: 'glass',
      render: (text, record) => {
        // 如果bottomtempered字段为1，则在Glass后添加' B-TP'
        let displayText = text || '';
        if (record.bottomtempered === 1 && displayText) {
          displayText = displayText + ' B-TP';
        }
        
        // Highlight if Glass is empty after initial B-TP processing
        if (!displayText || displayText.trim() === '') {
          return <span style={{ backgroundColor: 'yellow', padding: '5px', display: 'block', width: '100%' }}>{displayText}</span>;
        }
        return displayText;
      }
    },
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
    const headers = ['Batch NO.', 'Customer', 'ID', 'Style', 'Size (WxH)', 'Frame', 'Glass+Argon', 'Grid', 'P.O / Note', 'Invoice Num. Batch NO.', 'Barcode'];
    const dataForSheet = calculatedData.label.map(row => {
      const barcode = generateBarcode(currentBatchNo, row.ID);
      return [currentBatchNo, row.Customer, row.ID, row.Style, row.Size, row.Frame, row.Glass, row.Grid, row.PO || row.Note || '', currentBatchNo, barcode];
    });
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
  const exportToExcel = async () => { // Changed to async for ExcelJS
    if (!isDataLoaded || Object.values(calculatedData).every(arr => arr.length === 0 && arr !== calculatedData.info && arr !== calculatedData.sashWelding)) {
      if ((!calculatedData.info || calculatedData.info.length === 0) && (!calculatedData.sashWelding || calculatedData.sashWelding.length === 0 )) {
        message.error('No data available to export.');
        return;
      }
    }
    setIsExporting(true);
    message.loading({ content: 'Generating Excel file with ExcelJS...', key: 'exporting' });

    const workbook = new ExcelJS.Workbook();
    const currentBatchNo = batchNo || 'N/A';

    const parseNumeric = (v) => {
      if (v === null || v === undefined || v === '') return '';
      const num = parseFloat(v);
      return isNaN(num) ? v : num;
    };

    // Sheet definitions: name, dataKey, headers, mapFn
    const sheetDefinitions = [
      {
        name: 'General Info',
        dataKey: 'info',
        headers: ['Customer', 'ID', 'Style', 'W', 'H', 'FH', 'Frame', 'Glass', 'Argon', 'Grid', 'Color', 'Note'],
        mapFn: (row) => [row.Customer, row.ID, row.Style, row.W, row.H, row.FH, row.Frame, row.Glass, row.Argon, row.Grid, row.Color, row.Note]
      },
      {
        name: 'Frame',
        dataKey: 'frame',
        headers: ['ID', 'Style', '82-02B —', 'Pcs', '82-02B |', 'Pcs', '82-10 —', 'Pcs', '82-10 |', 'Pcs', '82-01 —', 'Pcs', '82-01 |', 'Pcs', 'Color'],
        mapFn: (row) => [row.ID, row.Style, row['82-02B-H'] || '', row['82-02B-H-Pcs'] || '', row['82-02B-V'] || '', row['82-02B-V-Pcs'] || '', row['82-10-H'] || '', row['82-10-H-Pcs'] || '', row['82-10-V'] || '', row['82-10-V-Pcs'] || '', row['82-01-H'] || '', row['82-01-H-Pcs'] || '', row['82-01-V'] || '', row['82-01-V-Pcs'] || '', row.Color || '']
      },
      {
        name: 'Sash',
        dataKey: 'sash',
        headers: ['ID', 'Style', '82-03--', 'Pcs', '82-03 |', 'Pcs', '82-05', 'Pcs', '82-04--', 'Pcs', '82-04|', 'Pcs', 'Color'],
        mapFn: (row) => [row.ID, row.Style, row['82-03-H'] || '', row['82-03-H-Pcs'] || '', row['82-03-V'] || '', row['82-03-V-Pcs'] || '', row['82-05'] || '', row['82-05-Pcs'] || '', row['82-04-H'] || '', row['82-04-H-Pcs'] || '', row['82-04-V'] || '', row['82-04-V-Pcs'] || '', row.Color || '']
      },
      {
        name: 'Sash Welding',
        dataKey: 'sashWelding',
        headers: ['Customer', 'ID', 'Style', 'W', 'H', 'Sashw', 'Sashh', 'Pcs'],
        mapFn: (row) => [row.Customer, row.ID, row.Style, row.SashW, row.SashH, row.WeldingCutW, row.WeldingCutH, row.Pcs]
      },
      {
        name: 'Glass',
        dataKey: 'glass',
        headers: ['Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity', 'Glass Type', 'Tempered', 'Thickness', 'Width', 'Height', 'Grid', 'Argon'],
        mapFn: (row) => [row.Customer, row.Style, row.W, row.H, row.FH, row.ID, row.line, row.quantity, row.glassType, row.Tmprd, row.thickness, row.width, row.height, row.grid, row.argon]
      },
      {
        name: 'Screen',
        dataKey: 'screen',
        headers: ['Customer', 'ID', 'Style', 'Screen', 'pcs', 'Screen T', 'pcs', 'Color'],
        mapFn: (row) => [row.Customer, row.ID, row.Style, row.screenSize || '', row.screenPcs || '', row.screenT || '', row.screenTPcs || '', row.Color || '']
      },
      {
        name: 'Parts',
        dataKey: 'parts',
        headers: ['ID', 'Style', '中框', '中铝', '手铝', 'Pcs', 'Track', 'Cover--', 'Cover|', '大中', 'pcs', '大中2', 'pcs', 'Slop', 'Color'],
        mapFn: (row) => [row.ID, row.Style, row.mullion || '', row.mullionA || '', row.handleA || '', row.quantity || '', row.track || '', row.coverH || '', row.coverV || '', row.bigMu1 || '', row.bigMu1Q || '', row.bigMu2 || '', row.bigMu2Q || '', row.slop || '', row.Color || '']
      },
      {
        name: 'Grid',
        dataKey: 'grid',
        headers: ['ID', 'Style', 'Grid Style', 'Sash W1', 'Pcs', '一刀', 'Sash H1', 'Pcs', '一刀', 'Fixed W2', 'Pcs', '一刀', 'Fixed H2', 'Pcs', '一刀', 'Note', 'Color'],
        mapFn: (row) => [
          row.ID, 
          row.Style, 
          row.Grid || '', 
          parseNumeric(row.sashW), 
          parseNumeric(row.sashWq), 
          parseNumeric(row.holeW1), 
          parseNumeric(row.sashH), 
          parseNumeric(row.sashHq), 
          parseNumeric(row.holeH1), 
          parseNumeric(row.fixW), 
          parseNumeric(row.fixWq), 
          parseNumeric(row.holeW2), 
          parseNumeric(row.fixH), 
          parseNumeric(row.fixHq), 
          parseNumeric(row.holeH2), 
          row.Note || '', 
          row.Color || ''
        ]
      },
      {
        name: 'Glass Order',
        dataKey: 'order',
        headers: ['Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity', 'Glass Type', 'Annealed/Tempered', 'Thickness', 'Glass Width', 'Glass Height', 'Notes'],
        mapFn: (row) => [row.Customer, row.Style, row.W, row.H, row.FH, row.ID, row.line, row.Quantity, row['Glass Type'], row['Annealed/Tempered'], row.Thickness, row.Width, row.Height, row.Notes]
      },
      { 
        name: 'Label',
        dataKey: 'label',
        headers: ['Customer', 'ID', 'Style', 'Size (WxH)', 'Frame', 'Glass+Argon', 'Grid', 'P.O / Note', 'Invoice Num. Batch NO.', 'Barcode'],
        mapFn: (row) => {
          const barcode = generateBarcode(currentBatchNo, row.ID);
          return [
            row.Customer,
            row.ID,
            row.Style,
            row.Size,
            row.Frame,
            row.Glass,
            row.Grid,
            row.PO || row.Note || '', 
            currentBatchNo,
            barcode
          ];
        }
      }
    ];

    const thinBorder = { style: 'thin', color: { argb: 'FF000000' } };
    const allSideBorders = {
      top: thinBorder,
      left: thinBorder,
      bottom: thinBorder,
      right: thinBorder
    };

    for (const def of sheetDefinitions) {
      const worksheet = workbook.addWorksheet(def.name);
      const dataToExport = calculatedData[def.dataKey];
      const numCols = def.headers.length;

      // Row 1: Sheet Name
      const titleRow = worksheet.addRow([def.name]);
      worksheet.mergeCells(1, 1, 1, numCols); // 合并第一行的单元格
      titleRow.getCell(1).font = { name: 'Calibri', size: 16, bold: true };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; // 居中对齐
      titleRow.getCell(1).border = allSideBorders;
      titleRow.height = 30;

      // Row 2: Batch Number
      const batchRow = worksheet.addRow([`Batch NO.: ${currentBatchNo}`]);
      worksheet.mergeCells(2, 1, 2, numCols); // 合并第二行的单元格
      batchRow.getCell(1).font = { name: 'Calibri', size: 12, bold: true };
      batchRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; // 居中对齐
      batchRow.getCell(1).border = allSideBorders;
      batchRow.height = 25;

      // Row 3: Headers
      const headerRow = worksheet.addRow(def.headers);
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 12, bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' } // 浅灰色 (Light Gray)
        };
        cell.border = allSideBorders;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set column width based on header - adjust as needed
        const column = worksheet.getColumn(colNumber);
        column.width = Math.max(15, (def.headers[colNumber-1] || '').length + 2);
      });
      headerRow.height = 20;

      // Data Rows
      if (dataToExport && dataToExport.length > 0) {
        dataToExport.forEach((rowDataItem, index) => {
          const rowValues = def.mapFn(rowDataItem, index);
          const dataRow = worksheet.addRow(rowValues);
          dataRow.eachCell((cell, colNumber) => {
            cell.font = { name: 'Calibri', size: 12 };
            cell.border = allSideBorders;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };

            if (def.name === 'Grid') {
              const header = def.headers[colNumber - 1];
              if (header === '一刀') {
                cell.font = { ...cell.font, color: { argb: 'FFFF0000' } }; // Red color
              }
              // Check if the value is a number and not in an 'ID' or 'Pcs' column
              if (typeof cell.value === 'number' && !['ID', 'Pcs'].includes(header)) {
                cell.numFmt = '0.0';
              }
            }
          });
        });
      } else {
        // Add a row indicating no data if sheet is empty, below headers
        const noDataRow = worksheet.addRow(Array(numCols).fill('')); // Add an empty row first
        worksheet.mergeCells(noDataRow.number, 1, noDataRow.number, numCols);
        const cell = noDataRow.getCell(1);
        cell.value = 'No data available for this sheet.';
        cell.font = { name: 'Calibri', size: 12, italic: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = allSideBorders;
      }
       // Adjust column widths dynamically based on content including data, after all rows are added.
      worksheet.columns.forEach((column, i) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          let columnLength = cell.value ? cell.value.toString().length : 0;
          if (cell.font && cell.font.bold){ // Make bold text count a bit more
             columnLength *= 1.1;
          }
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.max(15, Math.min(50, maxLength + 2)); // Min 15, Max 50
      });
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const fileName = `${currentBatchNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_ProductionData.xlsx`;
    
    // Use FileSaver.js logic (or a similar approach for download)
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up

    message.success({ content: 'Excel file generated successfully with ExcelJS!', key: 'exporting', duration: 2 });
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

    const headers = ['Batch NO.-ID', 'Customer-ID', 'ID', 'Style', 'Sash W', 'Sash H', 'Pcs'];
    
    const dataForSheet = calculatedData.sashWelding.map((row, index) => [
      `${currentBatchNo}-${row.ID}`,
      `${row.Customer || 'N/A'}-${row.ID}`,
      row.ID,
      row.Style,
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

  // Function to export DECA Cutting data to CSV format
  const exportDecaCuttingToCSV = async () => {
    if (!calculatedData.materialCutting || calculatedData.materialCutting.length === 0) {
      message.error('No DECA Cutting data available to export.');
      return;
    }
    
    setIsExportingDecaCutting(true);
    message.loading({ content: 'Generating DECA Cutting CSV file...', key: 'exportingDecaCutting' });

    const currentBatchNo = batchNo || 'N/A';
    
    try {
      // 定义CSV列头
      const headers = [
        'Batch No', 'Order No', 'Order Item', 'Material Name',
        'Cutting ID', 'Pieces ID', 'Length', 'Angles', 'Qty',
        'Bin No', 'Cart No', 'Position', 'Label Print', 'Barcode No', 'PO No', 'Style', 'Frame', 'Product Size', 'Color', 'Grid', 'Glass', 'Argon', 'Painting', 'Product Date', 'Balance', 'Shift', 'Ship date', 'Note', 'Customer'
      ];
      
      // 创建CSV内容数组，模拟csv.writer的行为
      const csvRows = [];
      csvRows.push(headers);
      
      // 添加数据行
      calculatedData.materialCutting.forEach((item, index) => {
        const rowValues = [
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
          item.CartNo || '',
          item.Position || '',
          item.LabelPrint || '',
          item.BarcodeNo || '',
          item.PO || '',
          item.Style || '',
          item.Frame || '',
          item.ProductSize || '',
          item.Color || '',
          item.Grid || '',
          item.Glass || '',
          item.Argon || '',
          item.Painting || '',
          item.ProductDate || '',
          item.Balance || '',
          item.Shift || '',
          item.ShipDate || '',
          item.Note || '',
          item.Customer || ''
        ];
        
        csvRows.push(rowValues);
      });
      
      // 使用标准CSV格式化，模拟Python csv.writer的"excel"方言
      const formatCSVValue = (value) => {
        const stringValue = String(value);
        // 如果包含逗号、引号、换行符或以空格开头/结尾，则需要引号包围
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r') || stringValue.trim() !== stringValue) {
          return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
      };
      
      // 生成CSV内容，使用\r\n作为行分隔符（Excel标准）
      const csvContent = csvRows.map(row => 
        row.map(formatCSVValue).join(',')
      ).join('\r\n') + '\r\n';
      
      // 创建并下载CSV文件，使用与Python相同的文件名格式
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileNameDecaCutting = `${currentBatchNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_CutFrame.csv`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNameDecaCutting;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      message.success({ content: 'DECA Cutting CSV file generated successfully!', key: 'exportingDecaCutting', duration: 2 });
    } catch (error) {
      console.error('Error exporting DECA Cutting CSV:', error);
      message.error({ content: `Failed to generate DECA Cutting CSV: ${error.message}`, key: 'exportingDecaCutting', duration: 3 });
    }
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
    console.log('generateDetailedDataAndNotify called'); // Log when function is called
    console.log('isDataLoaded:', isDataLoaded, 'allExcelData.length:', allExcelData ? allExcelData.length : 'allExcelData is null/undefined');
    if (!isDataLoaded || !allExcelData || allExcelData.length === 0) {
      message.error('No base data available. Please upload an Excel file or add data first.');
      return;
    }

    console.log('selectedRowKeys:', selectedRowKeys, 'selectedRowKeys.length:', selectedRowKeys ? selectedRowKeys.length : 'selectedRowKeys is null/undefined');
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      message.info('Please select rows from the table to process detailed data.');
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: [] });
      return;
    }
    
    setIsProcessing(true);
    message.loading({ content: 'Processing selected rows...', key: 'processing' });

    // 获取选中的数据，但保持原始顺序
    const selectedDataUnsorted = allExcelData.filter(item => selectedRowKeys.includes(item.ID.toString()));
    
    // 按照用户选择的顺序排序数据
    const selectedData = [];
    selectedRowKeys.forEach(key => {
      const item = selectedDataUnsorted.find(data => data.ID.toString() === key);
      if (item) {
        selectedData.push(item);
      }
    });

    if (selectedData.length === 0) {
      message.error('No rows selected for processing.');
      setIsProcessing(false);
      setCalculatedData({ info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: [] });
      return;
    }
    
    const calculator = new WindowCalculator();
    calculator.resetData(); // Reset before processing a new batch of selected rows

    selectedData.forEach((windowData, index) => {
      // Use the actual ID from the Excel data (which includes filename-based assignment)
      const actualId = windowData.ID;

      let mappedFrameType = windowData.Frame || '';
      if (mappedFrameType in frameMapping) {
        mappedFrameType = frameMapping[mappedFrameType];
      }

      const windowDataForCalc = {
        ...windowData, 
        ID: actualId,      // Use the actual ID from Excel data
        Frame: mappedFrameType, 
        BatchNO: batchNo,
        bottomtempered: windowData.bottomtempered, // Pass the extracted value
      };
      
      calculator.processWindow(windowDataForCalc);
    });

    // Finalize material cutting before getting all data
    await calculator.finalizeMaterialCutting();

    const allCalculatedData = calculator.getAllData();
    console.log("🔍 [GLASS DEBUG] Final calculated data from calculator:");
    console.log("🔍 [GLASS DEBUG] Glass data length:", allCalculatedData.glass ? allCalculatedData.glass.length : 0);
    if (allCalculatedData.glass && allCalculatedData.glass.length > 0) {
      console.log("🔍 [GLASS DEBUG] First 3 glass entries:", allCalculatedData.glass.slice(0, 3));
    } else {
      console.log("⚠️ [GLASS WARNING] No glass data found in calculator results!");
    }
    
    const finalInfoData = allCalculatedData.info || [];
    
    // Sash Welding Data is now directly from the calculator
    const sashWeldingDataFromCalc = allCalculatedData.sashWelding || [];

    // Sort MaterialCutting data
    let sortedMaterialCuttingData = allCalculatedData.materialCutting || [];
    if (Array.isArray(sortedMaterialCuttingData)) {
      sortedMaterialCuttingData.sort((a, b) => {
        // 1. 首先按材料名称分组（字母顺序）
        const materialNameA = a.MaterialName || '';
        const materialNameB = b.MaterialName || '';
        if (materialNameA < materialNameB) return -1;
        if (materialNameA > materialNameB) return 1;
        
        // 2. 然后按数量从小到大排序
        const qtyA = parseInt(a.Qty );
        const qtyB = parseInt(b.Qty );
        if (qtyA !== qtyB) return qtyA - qtyB;
        
        // 3. 最后在相同数量内按长度从大到小排序
        const lengthA = parseFloat(a.Length) ;
        const lengthB = parseFloat(b.Length) ;
        return lengthB - lengthA; // 从大到小排序
      });
    }

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
      sashWelding: sashWeldingDataFromCalc, 
      materialCutting: sortedMaterialCuttingData, // Use sorted data
    });
    message.success(`Processed ${selectedData.length} selected rows. Detailed tables generated!`);
    console.log('===== Selective calculation complete =====');
    setIsProcessing(false);
  };

  // Add a new function to handle cell changes in print tables
  const handlePrintTableCellChange = (dataKey, rowIndex, columnKey, value) => {
    // 处理添加行
    if (columnKey === 'ADD_ROW') {
      setCalculatedData(prevData => {
        const updatedTableData = [...prevData[dataKey], {}]; // Add an empty object for the new row
        return { ...prevData, [dataKey]: updatedTableData };
      });
      return;
    }
    
    // 处理删除行
    if (columnKey === 'DELETE_ROW') {
      setCalculatedData(prevData => {
        const newData = { ...prevData };
        const itemToDelete = newData[dataKey][rowIndex];
        if (!itemToDelete) return prevData; // Row already gone or invalid index

        const idToDelete = itemToDelete.ID;

        // Iterate over all tables in calculatedData and filter out items with the matching ID
        for (const key in newData) {
          if (Array.isArray(newData[key])) {
            newData[key] = newData[key].filter(item => item.ID !== idToDelete);
          }
        }
        
        return newData;
      });
      return;
    }

    // 处理行颜色变更
    if (columnKey === 'ROW_COLOR') {
      setCalculatedData(prevData => {
        const newCalculatedData = JSON.parse(JSON.stringify(prevData)); // Deep clone for safety
        
        if (!newCalculatedData[dataKey] || !newCalculatedData[dataKey][rowIndex]) {
          console.error("Error: dataKey or rowIndex is invalid in handlePrintTableCellChange", dataKey, rowIndex);
          return prevData; // Return previous state if invalid access
        }
        
        newCalculatedData[dataKey][rowIndex].rowColor = value;
        return newCalculatedData;
      });
      return;
    }

    // Preserve existing FH validation logic
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
      value = validatedFH; // Use the validated FH value
    }


    setCalculatedData(prevData => {
      const newCalculatedData = JSON.parse(JSON.stringify(prevData)); // Deep clone for safety

      if (!newCalculatedData[dataKey] || !newCalculatedData[dataKey][rowIndex]) {
        console.error("Error: dataKey or rowIndex is invalid in handlePrintTableCellChange", dataKey, rowIndex);
        return prevData; // Return previous state if invalid access
      }

      newCalculatedData[dataKey][rowIndex][columnKey] = value;

      // If Tmprd changed in the glass table, update the corresponding order entry
      if (dataKey === 'glass' && columnKey === 'Tmprd') {
        const changedGlassEntry = newCalculatedData.glass[rowIndex];
        if (changedGlassEntry) {
          const orderEntryIndex = newCalculatedData.order.findIndex(
            o => o.ID === changedGlassEntry.ID && o.line === changedGlassEntry.line
          );

          if (orderEntryIndex !== -1) {
            newCalculatedData.order[orderEntryIndex]['Annealed/Tempered'] = value === 'T' ? 'Tempered' : 'Annealed';
          } else {
            // Attempt to find the window info to create a new order entry if one is missing
            const windowInfo = newCalculatedData.info.find(info => info.ID === changedGlassEntry.ID);
            if (windowInfo) {
              console.warn(`No matching order entry found for glass ID: ${changedGlassEntry.ID}, line: ${changedGlassEntry.line}. Attempting to create one.`);
              
              // Mock the structure WindowCalculator's writeOrderEntry might expect or produce.
              // This is a simplified version; the actual one in WindowCalculator.js might be more complex.
              let orderGlassTypeName = 'Unknown';
              if (changedGlassEntry.glassType.toLowerCase().includes('cl')) orderGlassTypeName = 'Clear';
              if (changedGlassEntry.glassType.toLowerCase().includes('le2')) orderGlassTypeName = 'Lowe2';
              if (changedGlassEntry.glassType.toLowerCase().includes('le3')) orderGlassTypeName = 'Lowe3';
              if (changedGlassEntry.glassType.toLowerCase().includes('obs')) orderGlassTypeName = 'OBS';

              const newOrderEntry = {
                Customer: windowInfo.Customer,
                Style: windowInfo.Style,
                W: windowInfo.W,
                H: windowInfo.H,
                FH: windowInfo.FH,
                ID: windowInfo.ID,
                line: changedGlassEntry.line,
                Quantity: changedGlassEntry.quantity,
                'Glass Type': orderGlassTypeName,
                'Annealed/Tempered': value === 'T' ? 'Tempered' : 'Annealed',
                Thickness: changedGlassEntry.thickness, // Assuming thickness is on glassEntry
                Width: changedGlassEntry.width,
                Height: changedGlassEntry.height,
                Notes: '', 
                // originalId removed as per requirements
              };
              newCalculatedData.order.push(newOrderEntry);
            } else {
              console.error(`Cannot create order entry: Window info not found for ID ${changedGlassEntry.ID}`);
            }
          }
        }
      }
      return newCalculatedData;
    });
  };

  // Add a new function to handle adding a window manually
  const handleAddWindow = (windowDataFromForm) => {
    const newId = allExcelData.length > 0 
      ? (Math.max(...allExcelData.map(item => parseInt(item.ID) || 0)) + 1).toString()
      : "1";
    
    // B-TP processing for manually added window
    let originalGlassString = windowDataFromForm.Glass || '';
    let bottomTemperedValue = 0;
    let glassStringForFurtherProcessing = originalGlassString;

    // 改进的B-TP匹配模式，能更好地处理各种格式
    const btpPattern = /[\s,]*B\s*-\s*TP[\s,]*/gi; // 匹配前后可能有逗号或空格的B-TP

    console.log(`[Manual Add] Item ID [${newId}]: Original Glass: '${originalGlassString}'`);

    if (btpPattern.test(glassStringForFurtherProcessing)) {
        console.log(`[Manual Add] Item ID [${newId}]: 'B-TP' FOUND in '${glassStringForFurtherProcessing}'`);
        bottomTemperedValue = 1;
        
        // 移除B-TP及其前后的逗号和空格
        glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(btpPattern, ' ');
        
        // 清理多余的空格、逗号和斜杠
        glassStringForFurtherProcessing = glassStringForFurtherProcessing.trim();
        glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(/^[\s,/]+|[\s,/]+$/g, ''); // 移除开头结尾的分隔符
        glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(/\s*,\s*,\s*/g, ', '); // 处理连续逗号
        glassStringForFurtherProcessing = glassStringForFurtherProcessing.replace(/\s+/g, ' '); // 合并多个空格
        glassStringForFurtherProcessing = glassStringForFurtherProcessing.trim();
        
        // 如果只剩下分隔符，则清空
        if (/^[\s,/]*$/.test(glassStringForFurtherProcessing)) {
            glassStringForFurtherProcessing = "";
        }
        
        console.log(`[Manual Add] Item ID [${newId}]: Glass after B-TP removal: '${glassStringForFurtherProcessing}', bottomTemperedValue: ${bottomTemperedValue}`);
    } else {
        console.log(`[Manual Add] Item ID [${newId}]: 'B-TP' NOT FOUND in '${glassStringForFurtherProcessing}', bottomTemperedValue will be ${bottomTemperedValue}`);
    }
    // End of B-TP processing for manually added window

    const newWindowExcelRow = {
      Customer: windowDataFromForm.Customer || '',
      ID: newId,
      Style: windowDataFromForm.Style || '',
      W: convertToDecimal(windowDataFromForm.W || ''),
      H: convertToDecimal(windowDataFromForm.H || ''),
      FH: convertToDecimal(windowDataFromForm.FH || ''),
      Frame: windowDataFromForm.Frame || '', 
      Glass: glassStringForFurtherProcessing, // Use processed glass string
      Argon: windowDataFromForm.Argon || '',
      Grid: windowDataFromForm.Grid || '',
      Color: windowDataFromForm.Color || '',
      Note: windowDataFromForm.Note || '',
      Quantity: parseInt(windowDataFromForm.Quantity) || 1,
      bottomtempered: bottomTemperedValue, // Add the extracted value here
    };
    
    // 创建新的文件信息对象用于手动添加的数据
    const fileId = Date.now().toString() + '_manual_' + Math.random().toString(36).substr(2, 9);
    const now = new Date();
    const uploadTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const fileInfo = {
      id: fileId,
      name: '手动添加',
      uploadTime: uploadTime,
      data: [newWindowExcelRow],
      rowCount: 1
    };

    // 更新文件列表和合并数据
    setUploadedFiles(prevFiles => [...prevFiles, fileInfo]);
    setAllExcelData(prevData => [...prevData, newWindowExcelRow]);
    setSelectedRowKeys([]); // Clear selections

    // Reset all calculated data
    setCalculatedData({ 
      info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: []
    });

    setIsDataLoaded(true); // allExcelData has content
    message.info('New window added to the preview table. Please select rows and process to update detailed data.');
  };

  // 处理从Supabase获取batch number数据
  const handleLoadInvoiceData = async () => {
    if (!invoiceId || invoiceId.trim() === '') {
      message.error('请输入Batch Number');
      return;
    }

    setIsLoadingInvoice(true);
    message.loading({ content: '正在从数据库获取Batch Number数据...', key: 'loading-invoice' });

    try {
      // 从Supabase获取数据
      const result = await fetchInvoiceData(invoiceId.trim());
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // 转换数据格式
      const transformedData = transformInvoiceDataToWindowData(result.data);
      
      if (!transformedData || transformedData.length === 0) {
        throw new Error('Batch Number数据为空或格式不正确');
      }

      // 获取当前最大ID
      const currentMaxId = allExcelData.length > 0 
        ? Math.max(...allExcelData.map(item => parseInt(item.ID) || 0))
        : 0;

      // 为新数据分配连续ID
      const dataWithNewIds = transformedData.map((item, index) => ({
        ...item,
        ID: (currentMaxId + index + 1).toString()
      }));

      // 创建文件信息对象
      const fileId = Date.now().toString() + '_batch_' + invoiceId;
      const now = new Date();
      const uploadTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const fileInfo = {
        id: fileId,
        name: `Batch-${invoiceId}`,
        uploadTime: uploadTime,
        data: dataWithNewIds,
        rowCount: dataWithNewIds.length
      };

      // 更新文件列表和合并数据
      setUploadedFiles(prevFiles => [...prevFiles, fileInfo]);
      setAllExcelData(prevData => [...prevData, ...dataWithNewIds]);
      setSelectedRowKeys([]); // Clear selections

      // Reset all calculated data
      setCalculatedData({ 
        info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: []
      });

      setIsDataLoaded(true);
      setInvoiceModal(false);
      setInvoiceId('');
      
      message.success({ 
        content: `成功加载Batch Number ${invoiceId}，共${dataWithNewIds.length}条窗户数据`, 
        key: 'loading-invoice' 
      });

    } catch (error) {
      console.error('加载Batch Number数据失败:', error);
      message.error({ 
        content: `加载Batch Number数据失败: ${error.message}`, 
        key: 'loading-invoice' 
      });
    } finally {
       setIsLoadingInvoice(false);
     }
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
        console.log("🔍 [GLASS DEBUG] 正在渲染glass表格");
        console.log("🔍 [GLASS DEBUG] calculatedData.glass数据:", calculatedData.glass);
        console.log("🔍 [GLASS DEBUG] calculatedData.glass长度:", calculatedData.glass ? calculatedData.glass.length : 0);
        if (calculatedData.glass && calculatedData.glass.length > 0) {
          console.log("🔍 [GLASS DEBUG] 前5个glass条目:", calculatedData.glass.slice(0, 5));
        } else {
          console.log("⚠️ [GLASS WARNING] 没有glass数据可显示!");
        }
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
                onClick={exportDecaCuttingToCSV}
                loading={isExportingDecaCutting}
                disabled={!calculatedData.materialCutting || calculatedData.materialCutting.length === 0}
              >
                导出DECA Cutting CSV
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
                      <Space size="middle">
                        <Upload beforeUpload={processExcelFile} showUploadList={false}>
                          <Button icon={<UploadOutlined />} size="large">上传 Excel 文件</Button>
                        </Upload>
                        <Button 
                          icon={<DatabaseOutlined />} 
                          size="large"
                          onClick={() => setInvoiceModal(true)}
                        >
                          从数据库获取Batch Number
                        </Button>
                        <Button 
                          onClick={generateDetailedDataAndNotify} 
                          disabled={!isDataLoaded || selectedRowKeys.length === 0 || isProcessing}
                          loading={isProcessing}
                          type="primary" 
                          size="large"
                        >
                          {isProcessing ? '处理中...' : '处理选中行'}
                        </Button>
                      </Space>
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
                      <>
                        {/* 文件管理区域 */}
                        <Card 
                          title="已上传文件" 
                          size="small" 
                          style={{ marginBottom: 16 }}
                          extra={
                            <Button 
                              size="small" 
                              danger 
                              onClick={() => {
                                setUploadedFiles([]);
                                setAllExcelData([]);
                                setSelectedFileIds([]);
                                setSelectedRowKeys([]);
                                setIsDataLoaded(false);
                                setCalculatedData({ 
                                  info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [], sashWelding: [], materialCutting: []
                                });
                                message.success('所有文件已清除');
                              }}
                            >
                              清除所有文件
                            </Button>
                          }
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {uploadedFiles.map(file => (
                              <div 
                                key={file.id}
                                style={{
                                  padding: '8px 12px',
                                  border: selectedFileIds.includes(file.id) ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: selectedFileIds.includes(file.id) ? '#f0f8ff' : '#fafafa',
                                  minWidth: '200px'
                                }}
                                onClick={() => {
                                  setSelectedFileIds(prev => 
                                    prev.includes(file.id) 
                                      ? prev.filter(id => id !== file.id)
                                      : [...prev, file.id]
                                  );
                                }}
                              >
                                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{file.name}</div>
                                <div style={{ fontSize: '11px', color: '#666' }}>上传时间: {file.uploadTime}</div>
                                <div style={{ fontSize: '11px', color: '#666' }}>数据行数: {file.rowCount}</div>
                                <Button 
                                  size="small" 
                                  danger 
                                  type="text"
                                  style={{ marginTop: '4px', padding: '0 4px', height: '20px', fontSize: '10px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // 从文件列表中移除
                                    setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                                    // 从合并数据中移除该文件的数据
                                    setAllExcelData(prev => prev.filter(item => {
                                      // 这里需要一个方法来识别数据属于哪个文件
                                      // 简单的方法是重新构建allExcelData
                                      return true; // 暂时保留所有数据，下面会重新构建
                                    }));
                                    // 重新构建allExcelData
                                    const remainingFiles = uploadedFiles.filter(f => f.id !== file.id);
                                    const newAllData = remainingFiles.flatMap(f => f.data);
                                    setAllExcelData(newAllData);
                                    // 清除选择
                                    setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                                    setSelectedRowKeys([]);
                                    // 如果没有文件了，设置为未加载状态
                                    if (remainingFiles.length === 0) {
                                      setIsDataLoaded(false);
                                    }
                                    message.success(`文件 ${file.name} 已删除`);
                                  }}
                                >
                                  删除
                                </Button>
                              </div>
                            ))}
                          </div>
                          {selectedFileIds.length > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#1890ff' }}>
                              已选择 {selectedFileIds.length} 个文件，共 {uploadedFiles.filter(f => selectedFileIds.includes(f.id)).reduce((sum, f) => sum + f.rowCount, 0)} 行数据
                            </div>
                          )}
                        </Card>
                        
                        <Form layout="inline" style={{ marginBottom: 16 }}>
                          <Form.Item label="搜索">
                            <Input.Search
                              placeholder="在表格中搜索..."
                              allowClear
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onSearch={setSearchTerm}
                              style={{ width: 240 }}
                            />
                          </Form.Item>
                        </Form>

                        {searchResults.length > 0 && (
                          <Alert
                            message={`找到 ${searchResults.length} 条结果。`}
                            description={
                              <div style={{maxHeight: '150px', overflowY: 'auto'}}>
                                {searchResults.map((r, i) => (
                                  <div key={i}>{r.text} <Button type="link" size="small" onClick={() => jumpToResult(r)}>跳转</Button></div>
                                ))}
                              </div>
                            }
                            type="success"
                            showIcon
                            closable
                            onClose={() => setSearchResults([])}
                            style={{ marginBottom: 16 }}
                          />
                        )}

                        <Table 
                          dataSource={allExcelData} 
                          columns={columns} 
                          rowKey="ID" 
                          rowSelection={rowSelectionConfig}
                          loading={!isDataLoaded && allExcelData.length === 0}
                          bordered
                          className="data-table"
                          pagination={pagination}
                          onChange={handleTableChange}
                          rowClassName={(record) => {
                            return record.ID === highlightedRowKey ? 'highlighted-row' : '';
                          }}
                        />
                      </>
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
        
        <Modal
          title={<span style={{ fontSize: '16px', fontWeight: '600' }}>从Supabase数据库获取Batch Number数据</span>}
          open={invoiceModal}
          onCancel={() => {
            setInvoiceModal(false);
            setInvoiceId('');
          }}
          onOk={handleLoadInvoiceData}
          confirmLoading={isLoadingInvoice}
          okText="获取数据"
          cancelText="取消"
          width={500}
          centered
        >
          <Form layout="vertical">
            <Form.Item 
              label="Batch Number" 
              required
              help="请输入要获取的Batch Number"
            >
              <Input
                placeholder="请输入Batch Number"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                onPressEnter={handleLoadInvoiceData}
                disabled={isLoadingInvoice}
              />
            </Form.Item>
          </Form>
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

const AppWrapper = () => (
  <Layout>
    <style>{`
      .highlighted-row td {
        background-color: #f6ffed !important;
      }
    `}</style>
    <App />
  </Layout>
);

export default AppWrapper;
