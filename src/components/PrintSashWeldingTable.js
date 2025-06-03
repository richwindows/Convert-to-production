import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintSashWeldingTable = ({ batchNo, calculatedData, onCellChange }) => {
  // Customer, ID, Style, W, H, Sashw, Sashh, Pcs, No.
  const initialWidths = [100, 60, 80, 60, 60, 70, 70, 50, 50]; 
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('sashWelding', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('sashWelding', null, 'ADD_ROW', null);
    }
  };

  // 通用的单元格样式
  const cellStyle = {
    // width: 'max-content',
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
    // ...cellStyle, // Base styles will be inherited or applied directly
    // maxWidth: '60px' // Width is now controlled by colgroup
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden', 
    textOverflow: 'ellipsis' 
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

  const originalHeaderTitles = ['Batch NO.', 'Customer', 'ID', 'Style', 'W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'];
  const visibleHeaderTitles = originalHeaderTitles.filter(title => title !== 'Batch NO.');

  return (
    <div className="print-container">
      <div className="print-header sash-welding-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Sash Welding List
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
      <table ref={tableRef} className="sash-welding-table bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {/* <th style={cellStyle}>Batch NO.</th> */}
            {visibleHeaderTitles.map((title, index) => {
              const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(title);
              return (
                <th 
                  key={title} 
                  style={{ 
                    ...(isNumCol ? numberCellStyle : cellStyle),
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
              <tr key={index}>
                {/* <td style={cellStyle}>{batchNo}</td> */}
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.SashW || ''} onChange={(e) => handleInputChange(e, index, 'SashW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.SashH || ''} onChange={(e) => handleInputChange(e, index, 'SashH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.WeldingCutW || ''} onChange={(e) => handleInputChange(e, index, 'WeldingCutW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.WeldingCutH || ''} onChange={(e) => handleInputChange(e, index, 'WeldingCutH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Pcs || ''} onChange={(e) => handleInputChange(e, index, 'Pcs')} /></td>
                <td style={numberCellStyle}>{index + 1}</td> 
              </tr>
            ))
          ) : (
            <tr>
              {/* <td style={cellStyle}>{batchNo}</td> */}
              {[...Array(visibleHeaderTitles.length)].map((_, i) => { 
                const currentTitle = visibleHeaderTitles[i]; 
                const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(currentTitle);
                return <td key={`empty-placeholder-${i}`} style={isNumCol ? numberCellStyle : cellStyle}></td>;
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
                  const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(currentTitle);
                  return <td key={`empty-${i}-${j}`} style={isNumCol ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(visibleHeaderTitles.length)].map((_, j) => { 
                const currentTitle = visibleHeaderTitles[j];
                const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(currentTitle);
                return <td key={`empty-${j}`} style={isNumCol ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintSashWeldingTable; 