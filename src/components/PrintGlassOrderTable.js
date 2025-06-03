import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintGlassOrderTable = ({ batchNo, calculatedData, onCellChange }) => {
  // Customer, Style, W, H, FH, ID, line #, Quantity, Glass Type, Annealed/Tempered, Thickness, Glass Width, Glass Height, Notes
  const initialWidths = [100, 80, 60, 60, 60, 60, 60, 70, 100, 100, 70, 80, 80, 120];
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // 添加条件样式逻辑，根据各种条件为尺寸格子添加颜色
  const getCellStyle = (row, field) => {
    if (field === 'Width' || field === 'Height') {
      // 只有钢化标记或厚度大于3时才改变背景色
      if (row['Annealed/Tempered'] === 'Tempered' || (row.Thickness && parseFloat(row.Thickness) > 3)) {
        return { backgroundColor: '#FFFF00' }; // 黄色背景
      }
    }
    
    return {};
  };

  // 添加文字颜色样式逻辑
  const getTextStyle = (row) => {
    // 根据玻璃类型设置不同的文字颜色
    if (row['Glass Type'] === 'lowe2' || row['Glass Type'] === 'Lowe270') {
      return { color: '#FF0000' }; // 红色文字
    }
    
    if (row['Glass Type'] === 'lowe3' || row['Glass Type'] === 'Lowe366') {
      return { color: '#800080' }; // 紫色文字
    }
    
    if (row['Glass Type'] === 'OBS' || row['Glass Type'] === 'P516') {
      return { color: '#008000' }; // 绿色文字
    }
    
    return {};
  };

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('order', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('order', null, 'ADD_ROW', null);
    }
  };

  const originalHeaderTitles = [
    'Batch NO.', 'Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity',
    'Glass Type', 'Annealed/Tempered', 'Thickness', 'Glass Width', 'Glass Height', 'Notes'
  ];
  const visibleHeaderTitles = originalHeaderTitles.filter(title => title !== 'Batch NO.');

  // 通用的单元格样式
  const cellStyle = {
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden', 
    textOverflow: 'ellipsis' 
  };

  // 输入框样式
  const inputStyle = {
    minWidth: '50px',
    width: '100%'
  };

  // 数字列的样式
  const numberCellStyle = {
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden', 
    textOverflow: 'ellipsis' 
  };

  // Notes 列特定样式
  const notesCellStyle = {
    ...cellStyle,
    whiteSpace: 'normal', // Allow wrapping for notes
    wordBreak: 'break-word'
  };
  const notesInputStyle = {
    ...inputStyle,
  };

  const startResize = useCallback((event, index) => {
    currentlyResizingColumnIndex.current = index;
    startX.current = event.clientX;
    startWidth.current = columnWidths[index];
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
    event.preventDefault();
  }, [columnWidths]);

  const doResize = useCallback((event) => {
    if (currentlyResizingColumnIndex.current === null) return;
    const currentIndex = currentlyResizingColumnIndex.current;
    const diffX = event.clientX - startX.current;
    let newWidth = startWidth.current + diffX;
    if (newWidth < 40) newWidth = 40;

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
    return () => {
      stopResize();
    };
  }, [stopResize]);

  return (
    <div className="print-container">
      <div className="print-header glass-order-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Glass Order
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
      
      <table ref={tableRef} className="glass-order-table bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {visibleHeaderTitles.map((title, index) => {
              const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Thickness', 'Glass Width', 'Glass Height'].includes(title);
              let thStyle = cellStyle;
              if (isNumberColumn) thStyle = numberCellStyle;
              if (title === 'Notes') thStyle = notesCellStyle;
              return (
                <th 
                  key={title} 
                  style={{
                    ...thStyle,
                    position: 'relative',
                  }}
                >
                  {title}
                  {index < visibleHeaderTitles.length -1 && (
                    <div
                      onMouseDown={(e) => startResize(e, index)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '5px',
                        cursor: 'col-resize',
                      }}
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index} style={getTextStyle(row)}>
                <td style={cellStyle}>
                  <Input 
                    value={row.Customer || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Customer')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row.Style || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Style')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.W || ''} 
                    onChange={(e) => handleInputChange(e, index, 'W')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.H || ''} 
                    onChange={(e) => handleInputChange(e, index, 'H')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.FH || ''} 
                    onChange={(e) => handleInputChange(e, index, 'FH')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}>
                  <Input 
                    value={row.line || ''} 
                    onChange={(e) => handleInputChange(e, index, 'line')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.Quantity || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Quantity')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row['Glass Type'] || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Glass Type')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row['Annealed/Tempered'] || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Annealed/Tempered')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.Thickness || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Thickness')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={{...numberCellStyle, ...getCellStyle(row, 'Width')}}>
                  <Input 
                    value={row.Width || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Width')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, backgroundColor: 'transparent', ...getTextStyle(row)}}
                  />
                </td>
                <td style={{...numberCellStyle, ...getCellStyle(row, 'Height')}}>
                  <Input 
                    value={row.Height || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Height')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, backgroundColor: 'transparent', ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row.Notes || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Notes')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              {[...Array(visibleHeaderTitles.length)].map((_, i) => {
                const currentTitle = visibleHeaderTitles[i];
                const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Thickness', 'Glass Width', 'Glass Height'].includes(currentTitle);
                let tdStyle = cellStyle;
                if (isNumberColumn) tdStyle = numberCellStyle;
                if (currentTitle === 'Notes') tdStyle = notesCellStyle;
                return <td key={`empty-placeholder-${i}`} style={tdStyle}></td>;
              })}
            </tr>
          )}
          {/* 只在最后一行有数据时添加空行 */}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(visibleHeaderTitles.length)].map((_, j) => {
                  const currentTitle = visibleHeaderTitles[j];
                  const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Thickness', 'Glass Width', 'Glass Height'].includes(currentTitle);
                  let tdStyle = cellStyle;
                  if (isNumberColumn) tdStyle = numberCellStyle;
                  if (currentTitle === 'Notes') tdStyle = notesCellStyle;
                  return <td key={`empty-${i}-${j}`} style={tdStyle}></td>;
                })}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(visibleHeaderTitles.length)].map((_, j) => {
                const currentTitle = visibleHeaderTitles[j];
                const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Thickness', 'Glass Width', 'Glass Height'].includes(currentTitle);
                let tdStyle = cellStyle;
                if (isNumberColumn) tdStyle = numberCellStyle;
                if (currentTitle === 'Notes') tdStyle = notesCellStyle;
                return <td key={`empty-${j}`} style={tdStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintGlassOrderTable; 