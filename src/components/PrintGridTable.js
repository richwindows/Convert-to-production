import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintGridTable = ({ batchNo, calculatedData, onCellChange }) => {
  // ID, Style, Grid Style, Sash W1, Pcs, 一刀, Sash H1, Pcs, 一刀, Fixed W2, Pcs, 一刀, Fixed H2, Pcs, 一刀, Note, Color
  const initialWidths = [60, 80, 80, 70, 50, 50, 70, 50, 50, 70, 50, 50, 70, 50, 50, 100, 70];
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('grid', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('grid', null, 'ADD_ROW', null);
    }
  };

  const originalHeaderTitles = [
    'Batch NO.', 'ID', 'Style', 'Grid Style',
    'Sash W1', 'Pcs', '一刀',
    'Sash H1', 'Pcs', '一刀',
    'Fixed W2', 'Pcs', '一刀',
    'Fixed H2', 'Pcs', '一刀',
    'Note', 'Color'
  ];
  const visibleHeaderTitles = originalHeaderTitles.filter(title => title !== 'Batch NO.');

  // 通用的单元格样式
  const cellStyle = {
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    fontSize: '21px',
    fontWeight: 'bold'
  };

  // 输入框样式
  const inputStyle = {
    minWidth: '50px',
    width: '100%',
    fontSize: '21px',
    fontWeight: 'bold'
  };

  // 数字列的样式
  const numberCellStyle = {
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    fontSize: '21px',
    fontWeight: 'bold'
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
      <div className="print-header grid-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Grid
      </div>
      <div style={{ textAlign: 'center', fontSize: '21px', fontWeight: 'bold', marginBottom: '10px' }}>
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
      <table ref={tableRef} className="grid-table bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {visibleHeaderTitles.map((title, index) => {
              const isNumberColumn = title.toLowerCase().includes('pcs') || title.toLowerCase().includes('w') || title.toLowerCase().includes('h') || title === '一刀';
              return (
                <th 
                  key={title} 
                  style={{
                    ...(isNumberColumn ? numberCellStyle : cellStyle),
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
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashW || ''} onChange={(e) => handleInputChange(e, index, 'sashW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashWq || ''} onChange={(e) => handleInputChange(e, index, 'sashWq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeW1 || ''} onChange={(e) => handleInputChange(e, index, 'holeW1')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashH || ''} onChange={(e) => handleInputChange(e, index, 'sashH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashHq || ''} onChange={(e) => handleInputChange(e, index, 'sashHq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeH1 || ''} onChange={(e) => handleInputChange(e, index, 'holeH1')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixW || ''} onChange={(e) => handleInputChange(e, index, 'fixW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixWq || ''} onChange={(e) => handleInputChange(e, index, 'fixWq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeW2 || ''} onChange={(e) => handleInputChange(e, index, 'holeW2')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixH || ''} onChange={(e) => handleInputChange(e, index, 'fixH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixHq || ''} onChange={(e) => handleInputChange(e, index, 'fixHq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeH2 || ''} onChange={(e) => handleInputChange(e, index, 'holeH2')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Note || ''} onChange={(e) => handleInputChange(e, index, 'Note')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              {/* <td style={cellStyle}>{batchNo}</td> */}
              {[...Array(visibleHeaderTitles.length)].map((_, i) => {
                const currentTitle = visibleHeaderTitles[i];
                const isNumberColumn = currentTitle.toLowerCase().includes('pcs') || currentTitle.toLowerCase().includes('w') || currentTitle.toLowerCase().includes('h') || currentTitle === '一刀';
                return <td key={`empty-placeholder-${i}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
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
                  const isNumberColumn = currentTitle.toLowerCase().includes('pcs') || currentTitle.toLowerCase().includes('w') || currentTitle.toLowerCase().includes('h') || currentTitle === '一刀';
                  return <td key={`empty-${i}-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(visibleHeaderTitles.length)].map((_, j) => {
                const currentTitle = visibleHeaderTitles[j];
                const isNumberColumn = currentTitle.toLowerCase().includes('pcs') || currentTitle.toLowerCase().includes('w') || currentTitle.toLowerCase().includes('h') || currentTitle === '一刀';
                return <td key={`empty-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintGridTable; 