import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Dropdown, Menu, Checkbox } from 'antd';
import { PlusOutlined, SettingOutlined, DeleteOutlined, BgColorsOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintSashWeldingTable = ({ batchNo, calculatedData, onCellChange }) => {
  const headerTitles = ['Customer', 'ID', 'Style', 'W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'];
  const initialFullWidths = [100, 60, 80, 60, 60, 70, 70, 50, 50]; 
  const dataKeys = ['Customer', 'ID', 'Style', 'SashW', 'SashH', 'WeldingCutW', 'WeldingCutH', 'Pcs', 'calculatedNo']; // Correct mapping: W->SashW, H->SashH, Sashw->WeldingCutW, Sashh->WeldingCutH

  const [columnVisibility, setColumnVisibility] = useState(() => headerTitles.map(() => true));
  const [columnWidths, setColumnWidths] = useState(() => initialFullWidths.filter((_, index) => columnVisibility[index]));

  useEffect(() => {
    setColumnWidths(initialFullWidths.filter((_, index) => columnVisibility[index]));
  }, [columnVisibility]);

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
      onCellChange('sashWelding', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('sashWelding', null, 'ADD_ROW', null);
    }
  };

  const handleRowColorChange = (rowIndex, color) => {
    if (onCellChange) {
      onCellChange('sashWelding', rowIndex, 'ROW_COLOR', color);
    }
  };

  const handleColumnVisibilityChange = (columnIndex, checked) => {
    setColumnVisibility(prev => {
      const newVisibility = [...prev];
      newVisibility[columnIndex] = checked;
      return newVisibility;
    });
  };

  const visibleRenderedHeaders = headerTitles.filter((_, i) => columnVisibility[i]);

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
      <div className="print-header sash-welding-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Sash Welding List
      </div>
      <div style={{ textAlign: 'center', fontSize: '21px', fontWeight: 'bold', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <table ref={tableRef} className="sash-welding-table bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={`col-visible-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {headerTitles.map((title, colIndex) => {
              if (!columnVisibility[colIndex]) return null;
              const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(title);
              const currentHeaderStyle = isNumCol ? numberCellStyle : cellStyle;
              return (
                <th 
                  key={title} 
                  style={{ 
                    ...currentHeaderStyle,
                    position: 'relative',
                  }}
                >
                  {title}
                  {visibleRenderedHeaders.indexOf(title) < visibleRenderedHeaders.length - 1 && (
                    <div
                      onMouseDown={(e) => startResize(e, visibleRenderedHeaders.indexOf(title))}
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
                {headerTitles.map((title, colIndex) => {
                  if (!columnVisibility[colIndex]) return null;

                  const visibleHeaders = headerTitles.filter((_, i) => columnVisibility[i]);
                  const isLastVisibleCell = visibleHeaders[visibleHeaders.length - 1] === title;

                  const dataKey = dataKeys[colIndex];
                  const cellValue = row[dataKey] || '';
                  const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(title);
                  
                  let currentTDStyle = isNumCol ? { ...numberCellStyle } : { ...cellStyle };
                  currentTDStyle.position = 'relative';

                  if (isLastVisibleCell) {
                    currentTDStyle.overflow = 'visible';
                  }

                  if (title === 'ID') {
                    return <td key={dataKey} style={currentTDStyle}>{row.ID || ''}</td>;
                  }
                  if (title === 'No.') {
                    return <td key={dataKey} style={currentTDStyle}>{rowIndex + 1}</td>;
                  }
                  return (
                    <td key={dataKey} style={currentTDStyle}>
                      <Input 
                        size="small" 
                        style={inputStyle} 
                        bordered={false} 
                        value={cellValue} 
                        onChange={(e) => handleInputChange(e, rowIndex, dataKey)} 
                      />
                      {isLastVisibleCell && (
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
                            onClick={() => onCellChange('sashWelding', rowIndex, 'DELETE_ROW')}
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
              <td colSpan={visibleRenderedHeaders.length} style={{ textAlign: 'center', padding: '20px' }}>
                No Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintSashWeldingTable;