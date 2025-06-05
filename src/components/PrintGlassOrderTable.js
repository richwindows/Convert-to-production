import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Dropdown, Menu } from 'antd';
import { PlusOutlined, DeleteOutlined, BgColorsOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintGlassOrderTable = ({ batchNo, calculatedData, onCellChange }) => {
  // Customer, Style, W, H, FH, ID, line #, Quantity, Glass Type, Annealed/Tempered, Thickness, Glass Width, Glass Height, Notes
  const initialWidths = [100, 80, 60, 60, 60, 60, 60, 70, 100, 100, 70, 80, 80, 120];
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
    let styles = {
      fontSize: '21px',    // Added for screen view
      fontWeight: 'bold'   // Added for screen view
    };
    // 根据玻璃类型设置不同的文字颜色
    if (row['Glass Type'] === 'lowe2' || row['Glass Type'] === 'Lowe270') {
      return { ...styles, color: '#FF0000' }; // 红色文字
    }
    
    if (row['Glass Type'] === 'lowe3' || row['Glass Type'] === 'Lowe366') {
      return { ...styles, color: '#800080' }; // 紫色文字
    }
    
    if (row['Glass Type'] === 'OBS' || row['Glass Type'] === 'P516') {
      return { ...styles, color: '#008000' }; // 绿色文字
    }
    
    return styles;
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

  const handleRowColorChange = (rowIndex, color) => {
    if (onCellChange) {
      onCellChange('order', rowIndex, 'ROW_COLOR', color);
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
    textOverflow: 'ellipsis',
    fontSize: '21px',    // Added for screen view
    fontWeight: 'bold'   // Added for screen view
  };

  // 输入框样式
  const inputStyle = {
    minWidth: '50px',
    width: '100%',
    fontSize: '21px',    // Added for screen view
    fontWeight: 'bold'   // Added for screen view
  };

  // 数字列的样式
  const numberCellStyle = {
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    fontSize: '21px',    // Added for screen view
    fontWeight: 'bold'   // Added for screen view
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
            calculatedData.map((row, index) => {
              const rowStyle = {
                ...getTextStyle(row),
                backgroundColor: row.rowColor || 'transparent'
              };
              return (
                <tr key={index} style={rowStyle}>
                  {visibleHeaderTitles.map((title, colIndex) => {
                    const isLastVisibleCell = colIndex === visibleHeaderTitles.length - 1;
                    
                    const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Thickness', 'Glass Width', 'Glass Height'].includes(title);
                    let currentCellStyle = cellStyle;
                    if (isNumberColumn) currentCellStyle = numberCellStyle;
                    if (title === 'Notes') currentCellStyle = notesCellStyle;

                    // Define the cell style, allowing overflow for the last cell
                    const finalCellStyle = { ...currentCellStyle, position: 'relative' };
                    if (isLastVisibleCell) {
                      finalCellStyle.overflow = 'visible';
                    }

                    // Determine fieldKey and cellContent
                    let fieldKey, cellContent;
                    switch(title) {
                      case 'Customer': fieldKey = 'Customer'; break;
                      case 'Style': fieldKey = 'Style'; break;
                      case 'W': fieldKey = 'W'; break;
                      case 'H': fieldKey = 'H'; break;
                      case 'FH': fieldKey = 'FH'; break;
                      case 'ID': fieldKey = 'ID'; break;
                      case 'line #': fieldKey = 'line'; break;
                      case 'Quantity': fieldKey = 'quantity'; break;
                      case 'Glass Type': fieldKey = 'Glass Type'; break;
                      case 'Annealed/Tempered': fieldKey = 'Annealed/Tempered'; break;
                      case 'Thickness': fieldKey = 'Thickness'; break;
                      case 'Glass Width': fieldKey = 'Width'; break;
                      case 'Glass Height': fieldKey = 'Height'; break;
                      case 'Notes': fieldKey = 'Notes'; break;
                      default: fieldKey = title;
                    }
                    cellContent = row[fieldKey] || '';

                    // For readonly cells
                    if (title === 'ID') {
                      return <td key={`${title}-${index}`} style={finalCellStyle}>{cellContent}</td>;
                    }

                    return (
                      <td key={`${title}-${index}`} style={finalCellStyle}>
                        <Input 
                          value={cellContent} 
                          onChange={(e) => handleInputChange(e, index, fieldKey)} 
                          bordered={false}
                          size="small"
                          style={{...inputStyle, ...getTextStyle(row)}}
                        />
                        {isLastVisibleCell && (
                          <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '5px', marginLeft: '10px' }}>
                            <Dropdown
                              overlay={
                                <Menu onClick={({ key }) => handleRowColorChange(index, key)}>
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
                              onClick={() => onCellChange('order', index, 'DELETE_ROW')}
                            />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={visibleHeaderTitles.length} style={{ textAlign: 'center', padding: '20px' }}>
                No Data
              </td>
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