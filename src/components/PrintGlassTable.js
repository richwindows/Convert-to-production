import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Input, Button, Tooltip } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';
import exportSimpleExcel from '../utils/SimpleExcelExport';

const PrintGlassTable = ({ batchNo, calculatedData, onCellChange }) => {
  const initialWidths = [100, 80, 60, 60, 60, 60, 60, 70, 100, 70, 60, 70, 70, 70, 70];
  const [columnWidths, setColumnWidths] = useState(initialWidths);
  const tableRef = useRef(null);
  const currentlyResizingColumnIndex = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Helper function to determine if a value is effectively empty or "None"
  const isEffectivelyEmptyOrNone = (value) => {
    if (value == null) return true; // Covers null and undefined
    const trimmed = String(value).trim();
    return trimmed === '' || trimmed.toLowerCase() === 'none';
  };

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      // Ensure consistency if 'tmprd' (lowercase) is used elsewhere, map to 'Tmprd'
      const keyToUpdate = columnKey.toLowerCase() === 'tmprd' ? 'Tmprd' : columnKey;
      onCellChange('glass', rowIndex, keyToUpdate, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('glass', null, 'ADD_ROW', null);
    }
  };

  const getCellStyle = (row, field) => {
    if (field === 'width' || field === 'height') {
      if (row.Tmprd === 'T' || (row.thickness && parseFloat(row.thickness) > 3)) {
        return { backgroundColor: '#FFFF00' };
      }
    }
    return {};
  };

  const getTextStyle = (row) => {
    let styles = {
      fontSize: '21px',
      fontWeight: 'bold'
    };
    if (row.glassType === 'lowe2' || row.glassType === 'Lowe270') {
      return { ...styles, color: '#FF0000' };
    }
    if (row.glassType === 'lowe3' || row.glassType === 'Lowe366') {
      return { ...styles, color: '#800080' };
    }
    if (row.glassType === 'OBS' || row.glassType === 'P516') {
      return { ...styles, color: '#008000' };
    }
    return styles;
  };

  const handleExportExcel = () => {
    if (calculatedData && calculatedData.length > 0) {
      // Filter data specifically for 3mm non-tempered glass
      const dataToExport = calculatedData.filter(item => 
        item.thickness === '3' && item.Tmprd !== 'T'
      );

      if (dataToExport.length === 0) {
        alert('没有找到符合条件的3mm非钢化玻璃！');
        return;
      }

      try {
        exportSimpleExcel(dataToExport, batchNo); // Pass the filtered data
      } catch (error) {
        console.error('导出Excel时发生错误:', error);
        alert(`导出失败: ${error.message}`);
      }
    } else {
      alert('没有数据可导出！');
    }
  };

  const getGlassTypeCount = (type) => {
    if (!calculatedData || calculatedData.length === 0) return 0;
    return calculatedData
      .filter(item => 
        item.thickness === '3' && 
        item.Tmprd !== 'T' && 
        item.glassType && 
        item.glassType.toLowerCase().includes(type)
      )
      .reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0); // Summing quantities
  };
  
  const originalHeaderTitles = [
    'Batch NO.', 'Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity',
    'Glass Type', 'Tmprd', 'Thick', 'Width', 'Height', 'Grid', 'Argon'
  ];

  const shouldDisplayArgonColumn = useMemo(() => {
    if (!calculatedData || calculatedData.length === 0) {
      return true;
    }
    const allArgonEffectivelyEmpty = calculatedData.every(row => isEffectivelyEmptyOrNone(row.argon));
    return !allArgonEffectivelyEmpty;
  }, [calculatedData]);

  const shouldDisplayGridColumn = useMemo(() => {
    if (!calculatedData || calculatedData.length === 0) {
      return true;
    }
    const allGridEffectivelyEmpty = calculatedData.every(row => isEffectivelyEmptyOrNone(row.grid));
    return !allGridEffectivelyEmpty;
  }, [calculatedData]);

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

  // Prepare headers to be rendered, respecting shouldDisplayArgonColumn and shouldDisplayGridColumn
  const headersToRenderDetails = useMemo(() => {
    return originalHeaderTitles
      .filter(title => title !== 'Batch NO.')
      .map((title, originalDisplayIndex) => ({ title, originalDisplayIndex }))
      .filter(detail => !((detail.title === 'Argon' && !shouldDisplayArgonColumn) || 
                         (detail.title === 'Grid' && !shouldDisplayGridColumn)));
  }, [shouldDisplayArgonColumn, shouldDisplayGridColumn]); // Depends on shouldDisplayArgonColumn and shouldDisplayGridColumn, originalHeaderTitles is stable

  return (
    <div>
      <div className="export-button-container" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="glass-type-summary" style={{ fontSize: '14px' }}>
          <p style={{ margin: '0', color: '#0000FF' }}>Clear玻璃: {getGlassTypeCount('clear')}片</p>
          <p style={{ margin: '0', color: '#FF00FF' }}>Lowe270玻璃: {getGlassTypeCount('lowe2')}片</p>
          <p style={{ margin: '0', color: '#800080' }}>Lowe366玻璃: {getGlassTypeCount('lowe3')}片</p>
          <p style={{ margin: '0', color: '#008000' }}>OBS玻璃: {getGlassTypeCount('obs')}片</p>
        </div>
        <Tooltip title="导出四个工作表，包含按类型分组的3mm非钢化玻璃">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
            disabled={!calculatedData || calculatedData.length === 0}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            导出3mm非钢化玻璃优化表
          </Button>
        </Tooltip>
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
      <div className="print-container">
        <div className="print-header glass-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Glass
        </div>
        <div style={{ textAlign: 'center', fontSize: '21px', fontWeight: 'bold', marginBottom: '10px' }}>
          Batch: {batchNo}
        </div>
        <table ref={tableRef} className="glass-table bordered-print-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            {originalHeaderTitles
              .filter(title => title !== 'Batch NO.')
              .map((title, originalDisplayIndex) => {
                if (title === 'Argon' && !shouldDisplayArgonColumn) {
                  return null;
                }
                if (title === 'Grid' && !shouldDisplayGridColumn) {
                  return null;
                }
                return (
                  <col
                    key={`col-${originalDisplayIndex}`}
                    style={{ width: `${columnWidths[originalDisplayIndex]}px` }}
                  />
                );
              })
              .filter(Boolean)}
          </colgroup>
          <thead>
            <tr>
              {(() => {
                let visibleHeaderCount = 0;
                headersToRenderDetails.forEach(() => visibleHeaderCount++);
                
                let currentVisibleIndex = 0;
                return originalHeaderTitles
                  .filter(title => title !== 'Batch NO.')
                  .map((title, originalDisplayIndex) => {
                    if (title === 'Argon' && !shouldDisplayArgonColumn) {
                      return null;
                    }
                    if (title === 'Grid' && !shouldDisplayGridColumn) {
                      return null;
                    }

                    const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Width', 'Height', 'Thick'].includes(title);
                    const thStyleToApply = isNumberColumn ? numberCellStyle : cellStyle;
                    
                    const isLastVisibleColumn = currentVisibleIndex === visibleHeaderCount - 1;
                    currentVisibleIndex++;

                    return (
                      <th
                        key={title}
                        style={{
                          ...thStyleToApply,
                          position: 'relative',
                        }}
                      >
                        {title}
                        {!isLastVisibleColumn && (
                          <div
                            onMouseDown={(e) => startResize(e, originalDisplayIndex)}
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
                  })
                  .filter(Boolean);
              })()}
            </tr>
          </thead>
          <tbody>
            {calculatedData && calculatedData.length > 0 ? (
              calculatedData.map((row, index) => (
                <tr key={index} style={getTextStyle(row)}>
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                  <td style={numberCellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.W || ''} onChange={(e) => handleInputChange(e, index, 'W')} /></td>
                  <td style={numberCellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.H || ''} onChange={(e) => handleInputChange(e, index, 'H')} /></td>
                  <td style={numberCellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.FH || ''} onChange={(e) => handleInputChange(e, index, 'FH')} /></td>
                  <td style={cellStyle}>{row.ID || ''}</td>
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.line || ''} onChange={(e) => handleInputChange(e, index, 'line')} /></td>
                  <td style={numberCellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.quantity || ''} onChange={(e) => handleInputChange(e, index, 'quantity')} /></td>
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.glassType || ''} onChange={(e) => handleInputChange(e, index, 'glassType')} /></td>
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.Tmprd || ''} onChange={(e) => handleInputChange(e, index, 'Tmprd')} /></td>
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.thickness || ''} onChange={(e) => handleInputChange(e, index, 'thickness')} /></td>
                  <td style={{...numberCellStyle, ...getCellStyle(row, 'width'), ...getTextStyle(row)}}>{row.width || ''}</td>
                  <td style={{...numberCellStyle, ...getCellStyle(row, 'height'), ...getTextStyle(row)}}>{row.height || ''}</td>
                  {shouldDisplayGridColumn && <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.grid || ''} onChange={(e) => handleInputChange(e, index, 'grid')} /></td>}
                  {shouldDisplayArgonColumn && <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.argon || ''} onChange={(e) => handleInputChange(e, index, 'argon')} /></td>}
                </tr>
              ))
            ) : (
              <tr>
                {headersToRenderDetails.map((headerDetail, i) => {
                  const currentTitle = headerDetail.title;
                  const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Width', 'Height', 'Thick'].includes(currentTitle);
                  return <td key={`empty-placeholder-${i}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            )}
            {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
             Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
             calculatedData.length < 10 &&
              [...Array(1)].map((_, i) => (
                <tr key={`empty-${i}`}>
                  {headersToRenderDetails.map((headerDetail, j) => {
                    const currentTitle = headerDetail.title;
                    const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Width', 'Height', 'Thick'].includes(currentTitle);
                    return <td key={`empty-${i}-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                  })}
                </tr>
              ))
            }
            {(!calculatedData || calculatedData.length === 0) &&
              <tr>
                {headersToRenderDetails.map((headerDetail, j) => {
                  const currentTitle = headerDetail.title;
                  const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Width', 'Height', 'Thick'].includes(currentTitle);
                  return <td key={`empty-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrintGlassTable; 