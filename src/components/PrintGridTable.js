import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Dropdown, Menu } from 'antd';
import { PlusOutlined, DeleteOutlined, BgColorsOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintGridTable = ({ batchNo, calculatedData, onCellChange }) => {
  // ID, Style, Grid Style, Sash W1, Pcs, 一刀, Sash H1, Pcs, 一刀, Fixed W2, Pcs, 一刀, Fixed H2, Pcs, 一刀, Note, Color
  const initialWidths = [60, 80, 80, 70, 50, 50, 70, 50, 50, 70, 50, 50, 70, 50, 50, 100, 70];
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const rowColors = [
    { name: '无颜色', value: '' },
    { name: '浅蓝色', value: '#bae0ff' },
    { name: '浅绿色', value: '#b7eb8f' },
    { name: '浅黄色', value: '#fffb8f' },
    { name: '浅红色', value: '#ffccc7' },
    { name: '浅紫色', value: '#d3adf7' },
  ];

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

  const handleRowColorChange = (rowIndex, color) => {
    if (onCellChange) {
      onCellChange('grid', rowIndex, 'ROW_COLOR', color);
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
  const dataKeys = [
    'ID', 'Style', 'Grid',
    'sashW', 'sashWq', 'holeW1',
    'sashH', 'sashHq', 'holeH1',
    'fixW', 'fixWq', 'holeW2',
    'fixH', 'fixHq', 'holeH2',
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
            calculatedData.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ backgroundColor: row.rowColor || 'transparent' }}>
                {visibleHeaderTitles.map((title, colIndex) => {
                  const dataKey = dataKeys[colIndex];
                  const cellValue = row[dataKey] || '';
                  const isLastCell = colIndex === visibleHeaderTitles.length - 1;
                  
                  const isNumberColumn = title.toLowerCase().includes('pcs') || title.toLowerCase().includes('w') || title.toLowerCase().includes('h') || title === '一刀';
                  let currentCellStyle = isNumberColumn ? numberCellStyle : cellStyle;
                  const finalCellStyle = { ...currentCellStyle, position: 'relative' };

                  if (isLastCell) {
                    finalCellStyle.overflow = 'visible';
                  }

                  if (title === 'ID') {
                    return <td key={dataKey} style={finalCellStyle}>{cellValue}</td>;
                  }

                  return (
                    <td key={dataKey} style={finalCellStyle}>
                      <Input
                        size="small"
                        style={inputStyle}
                        bordered={false}
                        value={cellValue}
                        onChange={(e) => handleInputChange(e, rowIndex, dataKey)}
                      />
                      {isLastCell && (
                        <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '5px', marginLeft: '10px' }}>
                          <Dropdown
                            overlay={
                              <Menu onClick={({ key }) => handleRowColorChange(rowIndex, key)}>
                                {rowColors.map(color => (
                                  <Menu.Item key={color.value}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <div style={{ width: '16px', height: '16px', backgroundColor: color.value || '#fff', border: '1px solid #ccc', marginRight: '8px' }}></div>
                                      {color.name}
                                    </div>
                                  </Menu.Item>
                                ))}
                              </Menu>
                            }
                            trigger={['click']}
                          >
                            <Button icon={<BgColorsOutlined />} size="small" type="text" />
                          </Dropdown>
                          <Button 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            type="text" 
                            danger 
                            onClick={() => onCellChange('grid', rowIndex, 'DELETE_ROW')}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={visibleHeaderTitles.length} style={{ textAlign: 'center', padding: '20px' }}>
                No Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintGridTable; 