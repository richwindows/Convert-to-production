import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintTable = ({ batchNo, calculatedData, onCellChange }) => {
  const initialWidths = [150, 60, 80, 75, 75, 75, 80, 120, 70, 70, 70, 100]; // Customer, ID, Style, W, H, FH, Frame, Glass, Argon, Grid, Color, Note
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('info', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('info', null, 'ADD_ROW', null);
    }
  };

  const headerTitles = [
    // 'Batch NO.', // It's not used directly for rendering, but good to keep consistent
    'Customer',
    'ID',
    'Style',
    'W',
    'H',
    'FH',
    'Frame',
    'Glass',
    'Argon',
    'Grid',
    'Color',
    'Note',
    // 'Quantity',
  ];

  // 通用的单元格样式
  const cellStyle = {
    // width: 'max-content', // Max-content might interfere with fixed layout
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden', // Prevent content spillover
    textOverflow: 'ellipsis' // Add ellipsis for overflow
  };
  
  // Glass列专用样式（允许更宽的显示）
  const glassCellStyle = {
    ...cellStyle,
    minWidth: '120px',  // 设置最小宽度确保Glass内容能完整显示
    maxWidth: '200px',  // 设置最大宽度避免过宽
    whiteSpace: 'normal', // 允许换行
    wordBreak: 'break-word' // 长单词可以断行
  };
  
  // 输入框样式
  const inputStyle = {
    minWidth: '50px',  // 最小宽度
    width: '100%'      // 填充单元格
  };
  
  // Glass输入框样式
  const glassInputStyle = {
    ...inputStyle,
    minWidth: '120px'  // 确保输入框有足够宽度
  };
  // 数字列的样式（更窄的宽度）
  const numberCellStyle = {
    ...cellStyle,
    minWidth: '75px'   // Increased to accommodate three decimal places (e.g., XXX.XXX)
  };

  // Customer列专用样式
  const customerCellStyle = {
    ...cellStyle,
    minWidth: '150px',
  };

  const customerInputStyle = {
    ...inputStyle,
    minWidth: '100%', // Ensure input uses cell width
  };

  const startResize = useCallback((event, index) => {
    currentlyResizingColumnIndex.current = index;
    startX.current = event.clientX;
    startWidth.current = columnWidths[index];
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
    event.preventDefault(); // Prevent text selection
  }, [columnWidths]);

  const doResize = useCallback((event) => {
    if (currentlyResizingColumnIndex.current === null) return;
    const currentIndex = currentlyResizingColumnIndex.current;
    const diffX = event.clientX - startX.current;
    let newWidth = startWidth.current + diffX;
    if (newWidth < 40) newWidth = 40; // Minimum column width

    setColumnWidths(prevWidths => {
      const newWidths = [...prevWidths];
      newWidths[currentIndex] = newWidth;
      return newWidths;
    });
  }, []);

  const stopResize = useCallback(() => {
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    currentlyResizingColumnIndex.current = null;
  }, [doResize]);

  useEffect(() => {
    // Cleanup listeners if component unmounts during resize
    return () => {
      stopResize();
    };
  }, [stopResize]);

  return (
    <div className="print-container">
      <div className="print-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        General Information
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddRow}
          size="small"
        >
          Add Row
        </Button>
      </div>
      <table ref={tableRef} className="bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {/* <th style={cellStyle}>Batch NO.</th> */}
            {headerTitles.map((title, index) => (
              <th 
                key={title} 
                style={{ 
                  ...(title === 'Customer' ? customerCellStyle : (['W', 'H', 'FH'].includes(title) ? numberCellStyle : cellStyle)),
                  position: 'relative', // For resizer positioning
                  // width is controlled by colgroup, but specific cell styles like padding are kept
                }}
              >
                {title}
                {index < headerTitles.length -1 && ( // No resizer for the last column
                  <div
                    onMouseDown={(e) => startResize(e, index)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '5px',
                      cursor: 'col-resize',
                      // backgroundColor: 'rgba(0,0,255,0.1)', // Optional: for visibility during dev
                    }}
                  />
                )}
              </th>
            ))}
            {/* <th style={numberCellStyle}>Quantity</th> */}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index}>
                {/* <td style={cellStyle}>{batchNo}</td> */}
                <td style={customerCellStyle}><Input size="small" style={customerInputStyle} bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.W || ''} onChange={(e) => handleInputChange(e, index, 'W')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.H || ''} onChange={(e) => handleInputChange(e, index, 'H')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.FH || ''} onChange={(e) => handleInputChange(e, index, 'FH')} /></td>
                <td style={cellStyle}><Input size="small" style={{ ...inputStyle, width: 'auto', minWidth: '50px'}} bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                <td style={glassCellStyle}><Input size="small" style={glassInputStyle} bordered={false} value={row.Glass || ''} onChange={(e) => handleInputChange(e, index, 'Glass')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Argon || ''} onChange={(e) => handleInputChange(e, index, 'Argon')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Note || ''} onChange={(e) => handleInputChange(e, index, 'Note')} /></td>
                {/* <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Quantity || ''} onChange={(e) => handleInputChange(e, index, 'Quantity')} /></td> */}
              </tr>
            ))
          ) : (
            <tr>
              {/* <td style={cellStyle}>{batchNo}</td> */}
              {[...Array(12)].map((_, i) => {
                let currentStyle = cellStyle;
                if (i === 0) currentStyle = customerCellStyle; // Customer column
                else if ([3, 4, 5].includes(i)) currentStyle = numberCellStyle; // W, H, FH columns
                return <td key={i} style={currentStyle}></td>;
              })}
            </tr>
          )}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(12)].map((_, j) => {
                  let currentStyle = cellStyle;
                  if (j === 0) currentStyle = customerCellStyle; // Customer
                  else if ([3, 4, 5].includes(j)) currentStyle = numberCellStyle; // W, H, FH
                  return <td key={`empty-${i}-${j}`} style={currentStyle}></td>;
                })}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(12)].map((_, j) => {
                let currentStyle = cellStyle;
                if (j === 0) currentStyle = customerCellStyle; // Customer
                else if ([3, 4, 5].includes(j)) currentStyle = numberCellStyle; // W, H, FH
                return <td key={`empty-${j}`} style={currentStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintTable;