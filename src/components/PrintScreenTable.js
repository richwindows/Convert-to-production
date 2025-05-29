import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintScreenTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('screen', rowIndex, columnKey, e.target.value);
    }
  };

  const headerTitles = [
    'Batch NO.', 'Customer', 'ID', 'Style', 'Screen', 'pcs', 'Screen T', 'pcs', 'Color', 'Original ID'
  ];

  return (
    <div className="print-container">
      <div className="print-header screen-header">
        Screen
      </div>
      <table className="screen-table bordered-print-table">
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
                <td><Input size="small" bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                <td>{row.ID || ''}</td>
                <td><Input size="small" bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td><Input size="small" bordered={false} value={row.screenSize || ''} onChange={(e) => handleInputChange(e, index, 'screenSize')} /></td>
                <td><Input size="small" bordered={false} value={row.screenPcs || ''} onChange={(e) => handleInputChange(e, index, 'screenPcs')} /></td>
                <td><Input size="small" bordered={false} value={row.screenT || ''} onChange={(e) => handleInputChange(e, index, 'screenT')} /></td>
                <td><Input size="small" bordered={false} value={row.screenTPcs || ''} onChange={(e) => handleInputChange(e, index, 'screenTPcs')} /></td>
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

export default PrintScreenTable; 