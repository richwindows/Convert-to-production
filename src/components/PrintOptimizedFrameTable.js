import React, { useState, useEffect } from 'react';
import './PrintTable.css'; // Assuming common print styles are useful

const PrintOptimizedFrameTable = ({ batchNo, calculatedData }) => {
  const [processedData, setProcessedData] = useState({ activeMaterialColumns: [], maxRows: 0 });

  const materialDefinitions = [
    { header: '82-02B —', lengthKey: '82-02B-H', pcsKey: '82-02B-H-Pcs' },
    { header: '82-02B |', lengthKey: '82-02B-V', pcsKey: '82-02B-V-Pcs' },
    { header: '82-10 —', lengthKey: '82-10-H', pcsKey: '82-10-H-Pcs' },
    { header: '82-10 |', lengthKey: '82-10-V', pcsKey: '82-10-V-Pcs' },
    { header: '82-01 —', lengthKey: '82-01-H', pcsKey: '82-01-H-Pcs' },
    { header: '82-01 |', lengthKey: '82-01-V', pcsKey: '82-01-V-Pcs' },
  ];

  useEffect(() => {
    if (!calculatedData || calculatedData.length === 0) {
      setProcessedData({ activeMaterialColumns: [], maxRows: 0 });
      return;
    }

    const allMaterialColumns = materialDefinitions.map(material => {
      const items = [];
      calculatedData.forEach(row => {
        const length = row[material.lengthKey];
        const pcs = row[material.pcsKey];
        const numericLength = parseFloat(length);
        if (length && !isNaN(numericLength) && numericLength > 0) {
          items.push({
            originalId: row.ID,
            length: numericLength,
            pcs: pcs || ''
          });
        }
      });
      items.sort((a, b) => b.length - a.length);
      return { ...material, sortedItems: items };
    });

    // Filter out columns that have no sorted items
    const activeMaterialColumns = allMaterialColumns.filter(col => col.sortedItems.length > 0);

    let maxRows = 0;
    if (activeMaterialColumns.length > 0) {
      activeMaterialColumns.forEach(col => {
        if (col.sortedItems.length > maxRows) {
          maxRows = col.sortedItems.length;
        }
      });
    }

    setProcessedData({ activeMaterialColumns, maxRows });

  }, [calculatedData]);

  if (!calculatedData || calculatedData.length === 0 || processedData.activeMaterialColumns.length === 0) {
    return (
        <div className="print-container optimized-frame-print-container">
            <div className="print-header frame-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                Frame
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
                Batch: {batchNo}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>No data available for optimized frame view or all materials have zero length.</div>
        </div>
    );
  }

  return (
    <div className="print-container optimized-frame-print-container">
      <div className="print-header frame-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Frame
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="bordered-print-table optimized-frame-table">
        <thead>
          <tr>
            {processedData.activeMaterialColumns.map((col, index) => (
              <React.Fragment key={index}>
                <th>ID</th>
                <th>{col.header}</th>
                <th>Pcs</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(processedData.maxRows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {processedData.activeMaterialColumns.map((col, colIndex) => {
                const item = col.sortedItems[rowIndex];
                return (
                  <React.Fragment key={`${rowIndex}-${colIndex}`}>
                    <td>{item ? item.originalId : ''}</td>
                    <td>{item ? item.length.toFixed(3) : ''}</td> 
                    <td>{item ? item.pcs : ''}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
          {/* Fill empty rows if maxRows < 10 for consistent print height */}
          {processedData.maxRows > 0 && processedData.maxRows < 10 &&
            [...Array(10 - processedData.maxRows)].map((_, i) => (
              <tr key={`empty-fill-${i}`}>
                {processedData.activeMaterialColumns.map((col, j) => (
                  <React.Fragment key={`empty-fill-${i}-${j}`}>
                    <td></td>
                    <td></td>
                    <td></td>
                  </React.Fragment>
                ))}
              </tr>
            ))
          }
          {/* If activeMaterialColumns exist but maxRows is 0 (e.g. after some user interaction or bug, though unlikely with current logic) 
              or if initial data had no processable items for active columns, render some empty rows based on column count.
              This case is less likely to be hit if the top-level guard for activeMaterialColumns.length === 0 handles it.
          */}
          {processedData.activeMaterialColumns.length > 0 && processedData.maxRows === 0 &&
            [...Array(10)].map((_, i) => (
              <tr key={`initial-empty-${i}`}>
                {processedData.activeMaterialColumns.map((col, j) => (
                  <React.Fragment key={`initial-empty-${i}-${j}`}>
                    <td></td>
                    <td></td>
                    <td></td>
                  </React.Fragment>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintOptimizedFrameTable; 