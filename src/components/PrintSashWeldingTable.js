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
      <div className="print-header sash-welding-header">
        Sash Welding List
      </div>
      <table className="sash-welding-table bordered-print-table">
        <thead>
          <tr>
            <th>Batch NO.</th>
            <th>Customer</th>
            <th>ID</th>
            <th>Style</th>
            <th>W</th>
            <th>H</th>
            <th>Sashw</th>
            <th>Sashh</th>
            <th>Pcs</th>
            <th>No.</th> 
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
              <td>{batchNo}</td>
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