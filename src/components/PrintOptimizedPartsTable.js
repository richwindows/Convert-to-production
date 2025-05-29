import React, { useState, useEffect } from 'react';
import './PrintTable.css';

const PrintOptimizedPartsTable = ({ batchNo, calculatedData }) => {
  const [processedData, setProcessedData] = useState({ activeMaterialColumns: [], maxRows: 0 });

  // Define material types and their corresponding data keys from calculatedData.parts
  // For Parts, 'Pcs' will likely come from the general 'quantity' field of the row if the material (length) exists.
  const materialDefinitions = [
    { header: '中框', lengthKey: 'mullion', pcsKey: 'quantity' },
    { header: '中铝', lengthKey: 'mullionA', pcsKey: 'quantity' },
    { header: '手铝', lengthKey: 'handleA', pcsKey: 'quantity' },
    { header: 'Track', lengthKey: 'track', pcsKey: 'quantity' },
    { header: 'Cover--', lengthKey: 'coverH', pcsKey: 'quantity' },
    { header: 'Cover|', lengthKey: 'coverV', pcsKey: 'quantity' },
    { header: '大中', lengthKey: 'bigMu1', pcsKey: 'bigMu1Q' }, // Assuming bigMu1Q is Pcs for bigMu1
    { header: '大中2', lengthKey: 'bigMu2', pcsKey: 'bigMu2Q' }, // Assuming bigMu2Q is Pcs for bigMu2
    { header: 'Slop', lengthKey: 'slop', pcsKey: 'quantity' },
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
        const pcs = row[material.pcsKey]; // Use the defined pcsKey
        const numericLength = parseFloat(length);

        // Add item if length is a positive number
        if (length && !isNaN(numericLength) && numericLength > 0) {
          items.push({
            originalId: row.ID, // Assuming 'ID' is the correct key for original ID
            length: numericLength,
            pcs: pcs || '' // Fallback for Pcs
          });
        }
      });
      items.sort((a, b) => b.length - a.length); // Sort by length descending
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
    
    // If all columns are empty but there was initial data, ensure at least 10 empty rows for display consistency if needed.
    // This logic is more aligned with how PrintFrameTable and PrintSashTable behave.
    // The conditional rendering for "No data" message handles cases where activeMaterialColumns is empty.

    setProcessedData({ activeMaterialColumns, maxRows });

  }, [calculatedData]);

  if (!calculatedData || calculatedData.length === 0 || processedData.activeMaterialColumns.length === 0) {
    return (
        <div className="print-container optimized-parts-print-container">
            <div className="print-header parts-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                Parts Print
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
                Batch: {batchNo}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>No data available for optimized parts view or all materials have zero/invalid length.</div>
        </div>
    );
  }

  return (
    <div className="print-container optimized-parts-print-container">
      <div className="print-header parts-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Parts Print
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="bordered-print-table optimized-parts-table">
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
          {/* Fill with empty rows to ensure a minimum of 10 rows if there's data */}
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
          {/* If there are active columns but no data rows (maxRows is 0), show 10 empty rows */}
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

export default PrintOptimizedPartsTable; 