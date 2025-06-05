import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Dropdown, Menu, Checkbox } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintSashWeldingTable = ({ batchNo, calculatedData, onCellChange }) => {
  const headerTitles = ['Customer', 'ID', 'Style', 'W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'];
  const initialFullWidths = [100, 60, 80, 60, 60, 70, 70, 50, 50]; 
  const dataKeys = ['Customer', 'ID', 'Style', 'SashW', 'SashH', 'WeldingCutW', 'WeldingCutH', 'Pcs', 'calculatedNo']; // 'calculatedNo' for rowIndex + 1

  const [columnVisibility, setColumnVisibility] = useState(() => headerTitles.map(() => true));
  const [columnWidths, setColumnWidths] = useState(() => initialFullWidths.filter((_, index) => columnVisibility[index]));

  useEffect(() => {
    setColumnWidths(initialFullWidths.filter((_, index) => columnVisibility[index]));
  }, [columnVisibility]);

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
              <tr key={rowIndex}>
                {headerTitles.map((title, colIndex) => {
                  if (!columnVisibility[colIndex]) return null;
                  const dataKey = dataKeys[colIndex];
                  const cellValue = row[dataKey] || '';
                  const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(title);
                  const currentTDStyle = isNumCol ? numberCellStyle : cellStyle;

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
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              {headerTitles.map((title, colIndex) => {
                if (!columnVisibility[colIndex]) return null;
                const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(title);
                const currentPlaceholderStyle = isNumCol ? numberCellStyle : cellStyle;
                return <td key={`empty-placeholder-${colIndex}`} style={currentPlaceholderStyle}></td>;
              })}
            </tr>
          )}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {headerTitles.map((title, colIndex) => {
                  if (!columnVisibility[colIndex]) return null;
                  const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(title);
                  const currentPlaceholderStyle = isNumCol ? numberCellStyle : cellStyle;
                  return <td key={`empty-${i}-${colIndex}`} style={currentPlaceholderStyle}></td>;
                })}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {headerTitles.map((title, colIndex) => {
                if (!columnVisibility[colIndex]) return null;
                const isNumCol = ['W', 'H', 'Sashw', 'Sashh', 'Pcs', 'No.'].includes(title);
                const currentPlaceholderStyle = isNumCol ? numberCellStyle : cellStyle;
                return <td key={`empty-final-${colIndex}`} style={currentPlaceholderStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintSashWeldingTable; 