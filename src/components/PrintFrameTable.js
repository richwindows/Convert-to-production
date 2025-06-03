import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintFrameTable = ({ batchNo, calculatedData, onCellChange }) => {
  // Adjusted initialWidths for Frame table columns
  // ID, Style, 82-02B —, Pcs, 82-02B |, Pcs, 82-10 —, Pcs, 82-10 |, Pcs, 82-01 —, Pcs, 82-01 |, Pcs, Color
  const initialWidths = [60, 80, 70, 50, 70, 50, 70, 50, 70, 50, 70, 50, 70, 50, 70]; 
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('frame', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('frame', null, 'ADD_ROW', null);
    }
  };

  const headerTitles = [
    // 'Batch NO.', 
    'ID', 'Style',
    '82-02B —', 'Pcs', '82-02B |', 'Pcs',
    '82-10 —', 'Pcs', '82-10 |', 'Pcs',
    '82-01 —', 'Pcs', '82-01 |', 'Pcs',
    'Color'
  ];

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
      <div className="print-header frame-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Frame
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
      <table ref={tableRef} className="frame-table bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {headerTitles.filter(title => title !== 'Batch NO.').map((title, index) => (
              <th 
                key={title} 
                style={{ 
                  ...cellStyle, // All cells use basic cellStyle for structure
                  position: 'relative',
                }}
              >
                {title}
                {index < headerTitles.filter(title => title !== 'Batch NO.').length -1 && (
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
            ))}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* <td style={cellStyle}>{batchNo}</td> */}
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Style')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-V-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-V-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-V-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Color')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              {/* <td style={cellStyle}>{batchNo}</td> */}
              {[...Array(headerTitles.filter(title => title !== 'Batch NO.').length)].map((_, i) => <td key={`empty-placeholder-${i}`} style={cellStyle}></td>)}
            </tr>
          )}
          {/* 只在最后一行有数据时添加空行 */}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(headerTitles.filter(title => title !== 'Batch NO.').length)].map((_, j) => <td key={`empty-${i}-${j}`} style={cellStyle}></td>)}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(headerTitles.filter(title => title !== 'Batch NO.').length)].map((_, j) => <td key={`empty-${j}`} style={cellStyle}></td>)}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintFrameTable; 