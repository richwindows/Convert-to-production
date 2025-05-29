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
    'Batch NO.', 'Customer', 'ID', 'Style', 'Screen', 'pcs', 'Screen T', 'pcs', 'Color'
  ];

  return (
    <div className="print-container">
      <div className="print-header screen-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Screen
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="screen-table bordered-print-table" style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            {headerTitles.map(title => {
              if (title === 'Batch NO.') {
                return <th key={title} style={{ width: 'max-content', whiteSpace: 'nowrap' }}>{title}</th>;
              } else if (title === 'Customer' || title === 'Style' || title === 'Screen' || title.toLowerCase() === 'pcs' || title === 'Color') {
                return <th key={title} style={{ width: 'max-content' }}>{title}</th>;
              }
              return <th key={title}>{title}</th>;
            })}
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
                <td><Input size="small" bordered={false} value={row.screenSize || ''} onChange={(e) => handleInputChange(e, index, 'screenSize')} /></td>
                <td><Input size="small" bordered={false} value={row.screenPcs || ''} onChange={(e) => handleInputChange(e, index, 'screenPcs')} /></td>
                <td><Input size="small" bordered={false} value={row.screenT || ''} onChange={(e) => handleInputChange(e, index, 'screenT')} /></td>
                <td><Input size="small" bordered={false} value={row.screenTPcs || ''} onChange={(e) => handleInputChange(e, index, 'screenTPcs')} /></td>
                <td><Input size="small" bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
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
  );
};

export default PrintScreenTable; 