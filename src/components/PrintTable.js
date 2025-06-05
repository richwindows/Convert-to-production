import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Dropdown, Menu, Checkbox } from 'antd';
import { PlusOutlined, BgColorsOutlined, SettingOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintTable = ({ batchNo, calculatedData, onCellChange }) => {
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

  const initialFullWidths = [150, 60, 80, 75, 75, 75, 80, 120, 70, 70, 70, 100]; // Renamed to avoid conflict

  const [columnVisibility, setColumnVisibility] = useState(
    () => headerTitles.map(() => true) // All columns visible initially
  );

  // Initialize columnWidths based on initially visible columns
  const [columnWidths, setColumnWidths] = useState(() =>
    initialFullWidths.filter((_, index) => columnVisibility[index])
  );

  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Update columnWidths when visibility changes
  useEffect(() => {
    setColumnWidths(initialFullWidths.filter((_, index) => columnVisibility[index]));
  }, [columnVisibility]);

  // 可选的行背景颜色
  const rowColors = [
    { name: '无颜色', value: '' },
    { name: '浅蓝色', value: '#e6f7ff' },
    { name: '浅绿色', value: '#e6fff7' },
    { name: '浅黄色', value: '#fffbe6' },
    { name: '浅红色', value: '#fff1f0' },
    { name: '浅紫色', value: '#f9f0ff' },
  ];

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

  const handleColumnVisibilityChange = (columnIndex, checked) => {
    const newVisibility = [...columnVisibility];
    newVisibility[columnIndex] = checked;
    setColumnVisibility(newVisibility);
  };

  // 处理行颜色变更
  const handleRowColorChange = (rowIndex, color) => {
    if (onCellChange) {
      onCellChange('info', rowIndex, 'ROW_COLOR', color);
    }
  };

  // 通用的单元格样式
  const cellStyle = {
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '21px',
    fontWeight: 'bold'
  };
  
  // Glass列专用样式（允许更宽的显示）
  const glassCellStyle = {
    ...cellStyle,
    minWidth: '120px',
    maxWidth: '200px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    fontSize: '21px',    // Explicitly ensure
    fontWeight: 'bold'   // Explicitly ensure
  };
  
  // 输入框样式
  const inputStyle = {
    minWidth: '50px',
    width: '100%',
    fontSize: '21px',    // Added for consistent styling
    fontWeight: 'bold'   // Added for consistent styling
  };
  
  // Glass输入框样式
  const glassInputStyle = {
    ...inputStyle,
    minWidth: '120px'
  };
  // 数字列的样式（更窄的宽度）
  const numberCellStyle = {
    ...cellStyle,
    minWidth: '75px',
    fontSize: '21px',    // Explicitly ensure
    fontWeight: 'bold'   // Explicitly ensure
  };

  // Customer列专用样式
  const customerCellStyle = {
    ...cellStyle,
    minWidth: '150px',
    fontSize: '21px',    // Explicitly ensure
    fontWeight: 'bold'   // Explicitly ensure
  };

  const customerInputStyle = {
    ...inputStyle,
    minWidth: '100%',
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

  const columnsDropdownMenu = (
    <Menu>
      {headerTitles.map((title, index) => (
        <Menu.Item key={title}>
          <Checkbox
            checked={columnVisibility[index]}
            onChange={(e) => handleColumnVisibilityChange(index, e.target.checked)}
          >
            {title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="print-container">
      <div className="print-header general-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        General Information
      </div>
      <div style={{ textAlign: 'center', fontSize: '21px', fontWeight: 'bold', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <Dropdown overlay={columnsDropdownMenu} trigger={['click']}>
          <Button>
            Columns <SettingOutlined />
          </Button>
        </Dropdown>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddRow}
          size="small"
        >
          Add Row
        </Button>
      </div>
      <div style={{ display: 'flex' }}>
        <table ref={tableRef} className="bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={`col-${index}`} style={{ width: `${width}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {headerTitles.map((title, index) => (
                columnVisibility[index] && (
                  <th 
                    key={title} 
                    style={{ 
                      ...(title === 'Customer' ? customerCellStyle : (['W', 'H', 'FH'].includes(title) ? numberCellStyle : cellStyle)),
                      position: 'relative', // For resizer positioning
                    }}
                  >
                    {title}
                    {headerTitles.filter(t => columnVisibility[headerTitles.indexOf(t)]).indexOf(title) < headerTitles.filter(t => columnVisibility[headerTitles.indexOf(t)]).length - 1 && (
                      <div
                        onMouseDown={(e) => {
                          // Find the index among visible columns for resizing
                          const visibleColumnIndex = headerTitles
                            .map((ht, i) => columnVisibility[i] ? ht : null)
                            .filter(ht => ht !== null)
                            .indexOf(title);
                          if (visibleColumnIndex !== -1) {
                            startResize(e, visibleColumnIndex);
                          }
                        }}
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
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {calculatedData && calculatedData.length > 0 ? (
              calculatedData.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ backgroundColor: row.rowColor || '' }}>
                  {columnVisibility[0] && <td style={customerCellStyle}><Input size="small" style={customerInputStyle} bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Customer')} /></td>}
                  {columnVisibility[1] && <td style={cellStyle}>{row.ID || ''}</td>}
                  {columnVisibility[2] && <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Style')} /></td>}
                  {columnVisibility[3] && <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.W || ''} onChange={(e) => handleInputChange(e, rowIndex, 'W')} /></td>}
                  {columnVisibility[4] && <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.H || ''} onChange={(e) => handleInputChange(e, rowIndex, 'H')} /></td>}
                  {columnVisibility[5] && <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.FH || ''} onChange={(e) => handleInputChange(e, rowIndex, 'FH')} /></td>}
                  {columnVisibility[6] && <td style={cellStyle}><Input size="small" style={{ ...inputStyle, width: 'auto', minWidth: '50px'}} bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Frame')} /></td>}
                  {columnVisibility[7] && <td style={glassCellStyle}><Input size="small" style={glassInputStyle} bordered={false} value={row.Glass || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Glass')} /></td>}
                  {columnVisibility[8] && <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Argon || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Argon')} /></td>}
                  {columnVisibility[9] && <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Grid')} /></td>}
                  {columnVisibility[10] && <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Color')} /></td>}
                  {columnVisibility[11] && <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Note || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Note')} /></td>}
                </tr>
              ))
            ) : (
              // 空表格行保持不变
              <tr>
                {[...Array(12)].map((_, i) => {
                  let currentStyle = cellStyle;
                  if (i === 0) currentStyle = customerCellStyle; // Customer column
                  else if ([3, 4, 5].includes(i)) currentStyle = numberCellStyle; // W, H, FH columns
                  return <td key={i} style={currentStyle}></td>;
                })}
              </tr>
            )}
            {/* 其余部分保持不变 */}
          </tbody>
        </table>
        
        {/* 颜色按钮区域 - 放在表格外部右侧 */}
        <div style={{ marginLeft: '5px', display: 'flex', flexDirection: 'column' }}>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <div 
                key={index} 
                style={{ 
                  height: '32px', // 与表格行高度保持一致
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Dropdown 
                  overlay={
                    <Menu>
                      {rowColors.map(color => (
                        <Menu.Item 
                          key={color.value} 
                          onClick={() => handleRowColorChange(index, color.value)}
                        >
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center'
                          }}>
                            <div style={{ 
                              width: '16px', 
                              height: '16px', 
                              backgroundColor: color.value || '#ffffff',
                              border: '1px solid #d9d9d9',
                              marginRight: '8px'
                            }} />
                            {color.name}
                          </div>
                        </Menu.Item>
                      ))}
                    </Menu>
                  } 
                  trigger={['click']}
                >
                  <Button 
                    type="text" 
                    icon={<BgColorsOutlined />} 
                    size="small"
                    style={{ 
                      padding: '0 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '2px'
                    }}
                  />
                </Dropdown>
              </div>
            ))
          ) : (
            <div style={{ height: '32px' }}></div>
          )}
          {/* 为空行添加占位 */}
          {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 && (
            [...Array(10 - calculatedData.length)].map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '32px' }}></div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintTable;
