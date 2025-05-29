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
        <table className="glass-table bordered-print-table" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              {headerTitles.map(title => {
                if (title === 'Batch NO.') {
                  return <th key={title} style={{ width: 'max-content', whiteSpace: 'nowrap' }}>{title}</th>;
                } else if (title === 'Customer' || title === 'Style' || title === 'Quantity' || title === 'Glass Type') {
                  return <th key={title} style={{ width: 'max-content' }}>{title}</th>;
                }
                return <th key={title}>{title}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {calculatedData && calculatedData.length > 0 ? (
              calculatedData.map((row, index) => (
                <tr key={index} style={getTextStyle(row)}>
                  <td style={{ whiteSpace: 'nowrap' }}>{batchNo}</td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.W || ''} onChange={(e) => handleInputChange(e, index, 'W')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.H || ''} onChange={(e) => handleInputChange(e, index, 'H')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.FH || ''} onChange={(e) => handleInputChange(e, index, 'FH')} /></td>
                  <td>{row.ID || ''}</td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.line || ''} onChange={(e) => handleInputChange(e, index, 'line')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.quantity || ''} onChange={(e) => handleInputChange(e, index, 'quantity')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.glassType || ''} onChange={(e) => handleInputChange(e, index, 'glassType')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.Tmprd || ''} onChange={(e) => handleInputChange(e, index, 'Tmprd')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.thickness || ''} onChange={(e) => handleInputChange(e, index, 'thickness')} /></td>
                  <td style={{...getCellStyle(row, 'width'), ...getTextStyle(row)}}>{row.width || ''}</td>
                  <td style={{...getCellStyle(row, 'height'), ...getTextStyle(row)}}>{row.height || ''}</td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.grid || ''} onChange={(e) => handleInputChange(e, index, 'grid')} /></td>
                  <td><Input size="small" bordered={false} style={getTextStyle(row)} value={row.argon || ''} onChange={(e) => handleInputChange(e, index, 'argon')} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={{ whiteSpace: 'nowrap' }}>{batchNo}</td>
                {[...Array(headerTitles.length - 1)].map((_, i) => <td key={`empty-placeholder-${i}`}></td>)}
              </tr>
            )}
            {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 &&
              [...Array(10 - calculatedData.length)].map((_, i) => (
                <tr key={`empty-fill-${i}`}>
                  {[...Array(headerTitles.length)].map((_, j) => <td key={`empty-fill-${i}-${j}`}></td>)}
                </tr>
              ))
            }
            {(!calculatedData || calculatedData.length === 0) &&
              [...Array(9)].map((_, i) => (
                <tr key={`initial-empty-${i}`}>
                  {[...Array(headerTitles.length)].map((_, j) => <td key={`initial-empty-${i}-${j}`}></td>)}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrintGlassTable; 