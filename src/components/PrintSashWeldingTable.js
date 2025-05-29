import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintSashWeldingTable = ({ batchNo, calculatedData, onCellChange }) => {

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('sashWelding', rowIndex, columnKey, e.target.value);
    }
  };

  return (
    <div className="print-container">
      <div className="print-header sash-welding-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Sash Welding List
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="sash-welding-table bordered-print-table" style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th style={{ width: 'max-content', whiteSpace: 'nowrap' }}>Batch NO.</th>
            <th style={{ width: 'max-content' }}>Customer</th>
            <th>ID</th>
            <th style={{ width: 'max-content' }}>Style</th>
            <th>W</th>
            <th>H</th>
            <th>Sashw</th>
            <th>Sashh</th>
            <th style={{ width: 'max-content' }}>Pcs</th>
            <th>No.</th> 
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
                <td><Input size="small" bordered={false} value={row.SashW || ''} onChange={(e) => handleInputChange(e, index, 'SashW')} /></td>
                <td><Input size="small" bordered={false} value={row.SashH || ''} onChange={(e) => handleInputChange(e, index, 'SashH')} /></td>
                <td><Input size="small" bordered={false} value={row.WeldingCutW || ''} onChange={(e) => handleInputChange(e, index, 'WeldingCutW')} /></td>
                <td><Input size="small" bordered={false} value={row.WeldingCutH || ''} onChange={(e) => handleInputChange(e, index, 'WeldingCutH')} /></td>
                <td><Input size="small" bordered={false} value={row.Pcs || ''} onChange={(e) => handleInputChange(e, index, 'Pcs')} /></td>
                <td>{index + 1}</td> 
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ whiteSpace: 'nowrap' }}>{batchNo}</td>
              {[...Array(9)].map((_, i) => <td key={`empty-placeholder-${i}`}></td>)}
            </tr>
          )}
          {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 &&
            [...Array(10 - calculatedData.length)].map((_, i) => (
              <tr key={`empty-fill-${i}`}>
                {[...Array(10)].map((_, j) => <td key={`empty-fill-${i}-${j}`}></td>)}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) &&
            [...Array(9)].map((_, i) => (
              <tr key={`initial-empty-${i}`}>
                {[...Array(10)].map((_, j) => <td key={`initial-empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintSashWeldingTable; 