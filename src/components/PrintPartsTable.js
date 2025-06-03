import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintPartsTable = ({ batchNo, calculatedData, onCellChange }) => {
  // ID, Style, 中框, 中铝, 手铝, Pcs, Track, Cover--, Cover|, 大中, pcs, 大中2, pcs, Slop, Color
  const initialWidths = [60, 80, 70, 70, 70, 50, 70, 70, 70, 70, 50, 70, 50, 70, 70];
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('parts', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('parts', null, 'ADD_ROW', null);
    }
  };

  const originalHeaderTitles = [
    'Batch NO.', 'ID', 'Style', '中框', '中铝', '手铝', 'Pcs', 'Track',
    'Cover--', 'Cover|', '大中', 'pcs', '大中2', 'pcs', 'Slop', 'Color'
  ];
  const visibleHeaderTitles = originalHeaderTitles.filter(title => title !== 'Batch NO.');

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
    // ...cellStyle,
    // maxWidth: '60px'
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

  return (
    <div className="print-container">
      <div className="print-header parts-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Parts
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
      <table ref={tableRef} className="parts-table bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {visibleHeaderTitles.map((title, index) => {
              const isNumberColumn = title.toLowerCase().includes('pcs');
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
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.mullion || ''} onChange={(e) => handleInputChange(e, index, 'mullion')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.mullionA || ''} onChange={(e) => handleInputChange(e, index, 'mullionA')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.handleA || ''} onChange={(e) => handleInputChange(e, index, 'handleA')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.quantity || ''} onChange={(e) => handleInputChange(e, index, 'quantity')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.track || ''} onChange={(e) => handleInputChange(e, index, 'track')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.coverH || ''} onChange={(e) => handleInputChange(e, index, 'coverH')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.coverV || ''} onChange={(e) => handleInputChange(e, index, 'coverV')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu1 || ''} onChange={(e) => handleInputChange(e, index, 'bigMu1')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu1Q || ''} onChange={(e) => handleInputChange(e, index, 'bigMu1Q')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu2 || ''} onChange={(e) => handleInputChange(e, index, 'bigMu2')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu2Q || ''} onChange={(e) => handleInputChange(e, index, 'bigMu2Q')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.slop || ''} onChange={(e) => handleInputChange(e, index, 'slop')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              {/* <td style={cellStyle}>{batchNo}</td> */}
              {[...Array(visibleHeaderTitles.length)].map((_, i) => {
                const currentTitle = visibleHeaderTitles[i];
                const isNumberColumn = currentTitle.toLowerCase().includes('pcs');
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
                  const isNumberColumn = currentTitle.toLowerCase().includes('pcs');
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
                const isNumberColumn = currentTitle.toLowerCase().includes('pcs');
                return <td key={`empty-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintPartsTable; 