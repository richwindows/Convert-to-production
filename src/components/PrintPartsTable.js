import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintPartsTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('parts', rowIndex, columnKey, e.target.value);
    }
  };

  const headerTitles = [
    'Batch', 'ID', 'Style', '中框', '中铝', '手铝', 'Pcs', 'Track',
    'Cover--', 'Cover|', '大中', 'pcs', '大中2', 'pcs', 'Slop', 'Color', 'Original ID'
  ];

  return (
    <div className="print-container">
      <div className="print-header parts-header">
        Parts
      </div>
      <table className="parts-table bordered-print-table">
        <thead>
          <tr>
            {headerTitles.map(title => <th key={title}>{title}</th>)}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index}>
                <td>{batchNo}</td>
                <td>{row.ID || ''}</td>
                <td><Input size="small" bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td><Input size="small" bordered={false} value={row.mullion || ''} onChange={(e) => handleInputChange(e, index, 'mullion')} /></td>
                <td><Input size="small" bordered={false} value={row.mullionA || ''} onChange={(e) => handleInputChange(e, index, 'mullionA')} /></td>
                <td><Input size="small" bordered={false} value={row.handleA || ''} onChange={(e) => handleInputChange(e, index, 'handleA')} /></td>
                <td><Input size="small" bordered={false} value={row.quantity || ''} onChange={(e) => handleInputChange(e, index, 'quantity')} /></td>
                <td><Input size="small" bordered={false} value={row.track || ''} onChange={(e) => handleInputChange(e, index, 'track')} /></td>
                <td><Input size="small" bordered={false} value={row.coverH || ''} onChange={(e) => handleInputChange(e, index, 'coverH')} /></td>
                <td><Input size="small" bordered={false} value={row.coverV || ''} onChange={(e) => handleInputChange(e, index, 'coverV')} /></td>
                <td><Input size="small" bordered={false} value={row.bigMu1 || ''} onChange={(e) => handleInputChange(e, index, 'bigMu1')} /></td>
                <td><Input size="small" bordered={false} value={row.bigMu1Q || ''} onChange={(e) => handleInputChange(e, index, 'bigMu1Q')} /></td>
                <td><Input size="small" bordered={false} value={row.bigMu2 || ''} onChange={(e) => handleInputChange(e, index, 'bigMu2')} /></td>
                <td><Input size="small" bordered={false} value={row.bigMu2Q || ''} onChange={(e) => handleInputChange(e, index, 'bigMu2Q')} /></td>
                <td><Input size="small" bordered={false} value={row.slop || ''} onChange={(e) => handleInputChange(e, index, 'slop')} /></td>
                <td><Input size="small" bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
                <td>{row.originalId || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td>{batchNo}</td>
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
  );
};

export default PrintPartsTable; 