import React from 'react';
import { Input, Button, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import './PrintTable.css';
import exportSimpleExcel from '../utils/SimpleExcelExport';

const PrintGlassTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      // Ensure consistency if 'tmprd' (lowercase) is used elsewhere, map to 'Tmprd'
      const keyToUpdate = columnKey.toLowerCase() === 'tmprd' ? 'Tmprd' : columnKey;
      onCellChange('glass', rowIndex, keyToUpdate, e.target.value);
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
    if (row.glassType === 'lowe2' || row.glassType === 'Lowe270') {
      return { color: '#FF0000' };
    }
    if (row.glassType === 'lowe3' || row.glassType === 'Lowe366') {
      return { color: '#800080' };
    }
    if (row.glassType === 'OBS' || row.glassType === 'P516') {
      return { color: '#008000' };
    }
    return {};
  };

  const handleExportExcel = () => {
    if (calculatedData && calculatedData.length > 0) {
      const hasValidGlass = calculatedData.some(item => 
        item.thickness === '3' && item.Tmprd !== 'T'
      );
      if (!hasValidGlass) {
        alert('没有找到符合条件的3mm非钢化玻璃！');
        return;
      }
      try {
        exportSimpleExcel(calculatedData, batchNo);
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
    return calculatedData.filter(item => 
      item.thickness === '3' && 
      item.Tmprd !== 'T' && 
      item.glassType && 
      item.glassType.toLowerCase().includes(type)
    ).length;
  };
  
  // Simplified header titles for a single row header
  const headerTitles = [
    'Batch NO.', 'Customer', 'Style', 'W', 'H', 'FH', 'ID', 'line #', 'Quantity',
    'Glass Type', 'Tmprd', 'Thick', 'Width', 'Height', 'Grid', 'Argon'
  ];

  // 通用的单元格样式
  const cellStyle = {
    width: 'max-content',
    whiteSpace: 'nowrap',
    padding: '4px 8px'
  };

  // 输入框样式
  const inputStyle = {
    minWidth: '50px',
    width: '100%'
  };

  // 数字列的样式
  const numberCellStyle = {
    ...cellStyle,
    maxWidth: '60px'
  };

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
      <div className="print-container">
        <div className="print-header glass-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Glass
        </div>
        <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
          Batch: {batchNo}
        </div>
        <table className="glass-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
          <thead>
            <tr>
              {headerTitles.map(title => {
                const isNumberColumn = ['W', 'H', 'FH', 'Quantity', 'Width', 'Height'].includes(title);
                return <th key={title} style={isNumberColumn ? numberCellStyle : cellStyle}>{title}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {calculatedData && calculatedData.length > 0 ? (
              calculatedData.map((row, index) => (
                <tr key={index} style={getTextStyle(row)}>
                  <td style={cellStyle}>{batchNo}</td>
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
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.grid || ''} onChange={(e) => handleInputChange(e, index, 'grid')} /></td>
                  <td style={cellStyle}><Input size="small" style={{...inputStyle, ...getTextStyle(row)}} bordered={false} value={row.argon || ''} onChange={(e) => handleInputChange(e, index, 'argon')} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={cellStyle}>{batchNo}</td>
                {[...Array(headerTitles.length - 1)].map((_, i) => {
                  const isNumberColumn = i === 2 || i === 3 || i === 4 || i === 7 || i === 11 || i === 12;
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
                  {[...Array(headerTitles.length)].map((_, j) => {
                    const isNumberColumn = j === 3 || j === 4 || j === 5 || j === 8 || j === 12 || j === 13;
                    return <td key={`empty-${i}-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                  })}
                </tr>
              ))
            }
            {/* 移除没有数据时的额外空行 */}
            {(!calculatedData || calculatedData.length === 0) &&
              <tr>
                {[...Array(headerTitles.length)].map((_, j) => {
                  const isNumberColumn = j === 3 || j === 4 || j === 5 || j === 8 || j === 12 || j === 13;
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