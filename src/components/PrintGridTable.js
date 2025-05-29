import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintGridTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('grid', rowIndex, columnKey, e.target.value);
    }
  };

  const headerTitles = [
    'Batch NO.', 'ID', 'Style', 'Grid Style',
    'Sash W1', 'Pcs', '一刀', 'Sash H1', 'Pcs', '一刀',
    'Fixed W2', 'Pcs', '一刀', 'Fixed H2', 'Pcs', '一刀',
    'Note', 'Color'
  ];

  return (
    <div className="print-container">
      <div className="print-header grid-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Grid
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="grid-table bordered-print-table" style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            {headerTitles.map(title => {
              if (title === 'Batch NO.') {
                return <th key={title} style={{ width: 'max-content', whiteSpace: 'nowrap' }}>{title}</th>;
              } else if (title === 'Style' || title === 'Grid Style' || title.includes('Pcs') || title === 'Note' || title === 'Color' || title === '一刀') {
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
                <td>{row.ID || ''}</td> 
                <td><Input size="small" bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td><Input size="small" bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                <td><Input size="small" bordered={false} value={row.sashW || ''} onChange={(e) => handleInputChange(e, index, 'sashW')} /></td>
                <td><Input size="small" bordered={false} value={row.sashWq || ''} onChange={(e) => handleInputChange(e, index, 'sashWq')} /></td>
                <td><Input size="small" bordered={false} value={row.holeW1 || ''} onChange={(e) => handleInputChange(e, index, 'holeW1')} /></td>
                <td><Input size="small" bordered={false} value={row.sashH || ''} onChange={(e) => handleInputChange(e, index, 'sashH')} /></td>
                <td><Input size="small" bordered={false} value={row.sashHq || ''} onChange={(e) => handleInputChange(e, index, 'sashHq')} /></td>
                <td><Input size="small" bordered={false} value={row.holeH1 || ''} onChange={(e) => handleInputChange(e, index, 'holeH1')} /></td>
                <td><Input size="small" bordered={false} value={row.fixW || ''} onChange={(e) => handleInputChange(e, index, 'fixW')} /></td>
                <td><Input size="small" bordered={false} value={row.fixWq || ''} onChange={(e) => handleInputChange(e, index, 'fixWq')} /></td>
                <td><Input size="small" bordered={false} value={row.holeW2 || ''} onChange={(e) => handleInputChange(e, index, 'holeW2')} /></td>
                <td><Input size="small" bordered={false} value={row.fixH || ''} onChange={(e) => handleInputChange(e, index, 'fixH')} /></td>
                <td><Input size="small" bordered={false} value={row.fixHq || ''} onChange={(e) => handleInputChange(e, index, 'fixHq')} /></td>
                <td><Input size="small" bordered={false} value={row.holeH2 || ''} onChange={(e) => handleInputChange(e, index, 'holeH2')} /></td>
                <td><Input size="small" bordered={false} value={row.Note || ''} onChange={(e) => handleInputChange(e, index, 'Note')} /></td>
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

export default PrintGridTable; 