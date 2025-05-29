import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('info', rowIndex, columnKey, e.target.value);
    }
  };

  const headerTitles = [
    'Batch NO.',
    'Customer',
    'ID',
    'Style',
    'W',
    'H',
    'FH',
    'Frame',
    'Glass',
    'Argon',
    'Grid',
    'Color',
    'Note',
    'Quantity',
  ];

  return (
    <div className="print-container">
      <div className="print-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        General Information
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="bordered-print-table" style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th style={{ width: 'max-content', whiteSpace: 'nowrap' }}>Batch NO.</th>
            <th style={{ width: 'max-content' }}>Customer</th>
            <th>ID</th>
            <th style={{ width: 'max-content' }}>Style</th>
            <th>W</th>
            <th>H</th>
            <th>FH</th>
            <th>Frame</th>
            <th style={{ width: 'max-content' }}>Glass</th>
            <th>Argon</th>
            <th>Grid</th>
            <th>Color</th>
            <th>Note</th>
            <th style={{ width: 'max-content' }}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index}>
                <td style={{ whiteSpace: 'nowrap' }}>{batchNo}</td>
                <td><Input size="small" bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                <td>{row.ID || ''}</td>
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
              <td style={{ whiteSpace: 'nowrap' }}>{batchNo}</td>
              {[...Array(13)].map((_, i) => <td key={i}></td>)}
            </tr>
          )}
          {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 &&
            [...Array(10 - calculatedData.length)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(14)].map((_, j) => <td key={`empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) &&
            [...Array(9)].map((_, i) => (
              <tr key={i}>
                 {[...Array(14)].map((_, j) => <td key={`empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintTable;