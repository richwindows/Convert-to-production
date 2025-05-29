import React, { useState, useEffect } from 'react';
import './PrintTable.css';

const PrintOptimizedSashTable = ({ batchNo, calculatedData }) => {
  const [processedData, setProcessedData] = useState({ activeMaterialColumns: [], maxRows: 0 });

  const materialDefinitions = [
    { header: '82-03--', lengthKey: '82-03-H', pcsKey: '82-03-H-Pcs' },
    { header: '82-03 |', lengthKey: '82-03-V', pcsKey: '82-03-V-Pcs' },
    { header: '82-05', lengthKey: '82-05', pcsKey: '82-05-Pcs' }, // Assuming lengthKey is same as header for '82-05' if no specific H/V
    { header: '82-04--', lengthKey: '82-04-H', pcsKey: '82-04-H-Pcs' },
    { header: '82-04|', lengthKey: '82-04-V', pcsKey: '82-04-V-Pcs' },
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
        <div className="print-container optimized-sash-print-container">
            <div className="print-header sash-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                Sash
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
                Batch: {batchNo}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>No data available for optimized sash view or all materials have zero length.</div>
        </div>
    );
  }

  return (
    <div className="print-container optimized-sash-print-container">
      <div className="print-header sash-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Sash
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="bordered-print-table optimized-sash-table">
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

export default PrintOptimizedSashTable; 