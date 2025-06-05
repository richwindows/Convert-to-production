import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Dropdown, Menu, Checkbox } from 'antd';
import { PlusOutlined, BgColorsOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintTable = ({ batchNo, calculatedData, onCellChange }) => {
  const headerTitles = [
    'Customer', 'ID', 'Style', 'W', 'H', 'FH', 'Frame', 'Glass', 'Argon', 'Grid', 'Color', 'Note'
  ];

  const initialFullWidths = [150, 60, 80, 75, 75, 75, 80, 120, 70, 70, 70, 100, 80];

  const [columnVisibility, setColumnVisibility] = useState(() =>
    headerTitles.reduce((acc, title) => ({ ...acc, [title]: true }), {})
  );

  const [columnWidths, setColumnWidths] = useState(initialFullWidths);

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
      onCellChange('info', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('info', null, 'ADD_ROW', null);
    }
  };

  const handleColumnVisibilityChange = (title, checked) => {
    setColumnVisibility(prev => ({ ...prev, [title]: checked }));
  };

  const handleRowColorChange = (rowIndex, color) => {
    if (onCellChange) {
      onCellChange('info', rowIndex, 'ROW_COLOR', color);
    }
  };

  const cellStyle = {
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '21px',
    fontWeight: 'bold',
    textAlign: 'center'
  };

  const inputStyle = {
    width: '100%',
    fontSize: '21px',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'center'
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
    return () => stopResize();
  }, [stopResize]);

  const columnsDropdownMenu = (
    <Menu>
      {headerTitles.map((title) => (
        <Menu.Item key={title}>
          <Checkbox
            checked={columnVisibility[title]}
            onChange={(e) => handleColumnVisibilityChange(title, e.target.checked)}
          >
            {title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const visibleHeaders = headerTitles.filter(title => columnVisibility[title]);

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
      <table ref={tableRef} className="bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          {headerTitles.map((title, index) =>
            columnVisibility[title] && <col key={`col-${title}`} style={{ width: `${columnWidths[index]}px` }} />
          )}
        </colgroup>
        <thead>
          <tr>
            {visibleHeaders.map((title) => (
              <th key={`header-${title}`} style={cellStyle}>
                {title}
                <div
                  className="resizer"
                  onMouseDown={(e) => {
                    const originalIndex = headerTitles.indexOf(title);
                    startResize(e, originalIndex);
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ backgroundColor: row.rowColor || 'transparent' }}>
                {visibleHeaders.map((title, colIndex) => {
                  const isLastVisibleCell = colIndex === visibleHeaders.length - 1;
                  
                  // Define the cell style, allowing overflow for the last cell
                  const finalCellStyle = { ...cellStyle, position: 'relative' };
                  if (isLastVisibleCell) {
                    finalCellStyle.overflow = 'visible';
                  }

                  return (
                    <td key={`${title}-${rowIndex}`} style={finalCellStyle}>
                      <Input
                        size="small"
                        style={inputStyle}
                        bordered={false}
                        value={row[title] || ''}
                        onChange={(e) => handleInputChange(e, rowIndex, title)}
                        readOnly={title === 'ID'}
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
                            onClick={() => onCellChange('info', rowIndex, 'DELETE_ROW')}
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
              <td colSpan={visibleHeaders.length} style={{ textAlign: 'center', padding: '20px' }}>
                No Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintTable;
