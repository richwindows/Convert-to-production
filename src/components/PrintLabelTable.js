import React from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';
import { formatSize } from '../utils/formattingUtils';

const PrintLabelTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      // If editing the combined 'Glass' field, we might need special handling 
      // if you intend to update row.Glass and row.Argon separately.
      // For now, assumes direct update to the provided columnKey (e.g., row.Glass_Argon_Combined)
      // Or, if the original data structure has `row.Glass` and `row.PO` as distinct editable fields:
      onCellChange('label', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('label', null, 'ADD_ROW', null);
    }
  };

  const generateBarcode = (batchNo, id) => {
    if (!batchNo || !id) return '';
    const parts = batchNo.split('-');
    if (parts.length < 1) return ''; // Basic check, adjust if batchNo format is strict
    // Simplified barcode generation for example, adjust to your exact needs
    const datePart = parts[0].replace(/\//g, ''); // Assuming first part is date-like
    const formattedId = String(id).padStart(2, '0');
    return `Rich-${datePart}-${formattedId}`;
  };

  const headerTitles = [
    'Customer', 'ID', 'Style', 'Size', 'Frame', 'Glass+Argon', 'Grid', 'P.O', 'Invoice Num. Order Date', 'Barcode'
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

  return (
    <div className="print-container">
      <div className="print-header label-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Label
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
      <table className="label-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {headerTitles.map(title => (
              <th key={title} style={cellStyle}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => {
              const barcode = generateBarcode(batchNo, row.ID);
              let sizeDisplay = row.Size || '';
              if (!sizeDisplay && row.W && row.H) {
                sizeDisplay = formatSize(row.W, row.H);
              }
              const glassDisplay = row.Glass ? (row.Argon && row.Argon !== 'None' ? `${row.Glass}+${row.Argon}` : row.Glass) : '';

              return (
                <tr key={index}>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                  <td style={cellStyle}>{row.ID}</td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                  <td style={cellStyle} className="label-size-cell">{sizeDisplay}</td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                  {/* For simplicity, making the combined display string editable. 
                      If row.Glass and row.Argon need to be updated separately, this needs more complex logic 
                      or two separate input fields mapped to row.Glass and row.Argon respectively.*/}
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={glassDisplay} onChange={(e) => handleInputChange(e, index, 'Glass')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.PO || row.Note || ''} onChange={(e) => handleInputChange(e, index, 'PO')} /></td>
                  <td style={cellStyle}>{batchNo}</td>
                  <td style={cellStyle} className="label-barcode-cell">{barcode}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              {headerTitles.map((title, i) => {
                if (title === 'Invoice Num. Order Date') {
                  return <td key={`empty-placeholder-${i}`} style={cellStyle}>{batchNo || ''}</td>;
                }
                return <td key={`empty-placeholder-${i}`} style={cellStyle}></td>;
              })}
            </tr>
          )}
          {/* 只在最后一行有数据时添加空行 */}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(headerTitles.length)].map((_, j) => <td key={`empty-${i}-${j}`} style={cellStyle}></td>)}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(headerTitles.length)].map((_, j) => <td key={`empty-${j}`} style={cellStyle}></td>)}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintLabelTable;