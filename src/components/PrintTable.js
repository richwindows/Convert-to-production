import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('info', rowIndex, columnKey, e.target.value);
    }
  };

  return (
    <div className="print-container">
      <div className="print-header">
        {/* Title can be dynamic if needed */}
        General Information
      </div>
      <table className="bordered-print-table">
        <thead>
          <tr>
            <th>Batch NO.</th>
            <th>Customer</th>
            <th>ID</th>
            <th>Original ID</th>
            <th>Style</th>
            <th>W</th>
            <th>H</th>
            <th>FH</th>
            <th>Frame</th>
            <th>Glass</th>
            <th>Argon</th>
            <th>Grid</th>
            <th>Color</th>
            <th>Note</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index}>
                <td>{batchNo}</td>
                <td><Input size="small" bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                <td>{row.ID || ''}</td> 
                <td>{row.originalId || ''}</td> 
                <td><Input size="small" bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td><Input size="small" bordered={false} value={row.W || ''} onChange={(e) => handleInputChange(e, index, 'W')} /></td>
                <td><Input size="small" bordered={false} value={row.H || ''} onChange={(e) => handleInputChange(e, index, 'H')} /></td>
                <td><Input size="small" bordered={false} value={row.FH || ''} onChange={(e) => handleInputChange(e, index, 'FH')} /></td>
                <td><Input size="small" bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                <td><Input size="small" bordered={false} value={row.Glass || ''} onChange={(e) => handleInputChange(e, index, 'Glass')} /></td>
                <td><Input size="small" bordered={false} value={row.Argon || ''} onChange={(e) => handleInputChange(e, index, 'Argon')} /></td>
                <td><Input size="small" bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                <td><Input size="small" bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
                <td><Input size="small" bordered={false} value={row.Note || ''} onChange={(e) => handleInputChange(e, index, 'Note')} /></td>
                <td><Input size="small" bordered={false} value={row.Quantity || ''} onChange={(e) => handleInputChange(e, index, 'Quantity')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td>{batchNo}</td>
              {[...Array(14)].map((_, i) => <td key={i}></td>)}
            </tr>
          )}
          {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 &&
            [...Array(10 - calculatedData.length)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(15)].map((_, j) => <td key={`empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) &&
            [...Array(9)].map((_, i) => (
              <tr key={i}>
                 {[...Array(15)].map((_, j) => <td key={`empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintTable;