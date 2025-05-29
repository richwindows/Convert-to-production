import React from 'react';
import { Input } from 'antd';
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

  return (
    <div className="print-container">
      <div className="print-header label-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Label
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="label-table bordered-print-table" style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            {headerTitles.map(title => {
              if (title === 'Invoice Num. Order Date') {
                return <th key={title} style={{ width: 'max-content', whiteSpace: 'nowrap' }}>{title}</th>;
              } else if (['Customer', 'Style', 'Size', 'Frame', 'Glass+Argon', 'Grid', 'P.O', 'Barcode'].includes(title)) {
                return <th key={title} style={{ width: 'max-content' }}>{title}</th>;
              }
              return <th key={title}>{title}</th>;
            })}
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
                  <td><Input size="small" bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                  <td>{row.ID}</td>
                  <td><Input size="small" bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                  <td className="label-size-cell">{sizeDisplay}</td>
                  <td><Input size="small" bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                  {/* For simplicity, making the combined display string editable. 
                      If row.Glass and row.Argon need to be updated separately, this needs more complex logic 
                      or two separate input fields mapped to row.Glass and row.Argon respectively.*/}
                  <td><Input size="small" bordered={false} value={glassDisplay} onChange={(e) => handleInputChange(e, index, 'Glass')} /></td>
                  <td><Input size="small" bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                  <td><Input size="small" bordered={false} value={row.PO || row.Note || ''} onChange={(e) => handleInputChange(e, index, 'PO')} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{batchNo}</td>
                  <td className="label-barcode-cell">{barcode}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              {/* Render empty cells for all header titles in the placeholder row */}
              {headerTitles.map((title, i) => {
                if (title === 'Invoice Num. Order Date') {
                  return <td key={`empty-placeholder-${i}`} style={{ whiteSpace: 'nowrap' }}>{batchNo || ''}</td>;
                }
                return <td key={`empty-placeholder-${i}`}></td>;
              })}
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
            [...Array(10 -1)].map((_, i) => ( // Assuming 10 rows total including header, so 9 empty data rows initially
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

export default PrintLabelTable;