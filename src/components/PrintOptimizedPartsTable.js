import React, { useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintOptimizedPartsTable = ({ batchNo, calculatedData }) => {
  const [processedData, setProcessedData] = useState({ activeMaterialColumns: [], maxRows: 0 });
  const [manualRows, setManualRows] = useState([]);

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

  // 通用的单元格样式
  const cellStyle = {
    width: 'max-content',
    whiteSpace: 'nowrap',
    padding: '4px 8px'
  };

  // 数字列的样式
  const numberCellStyle = {
    ...cellStyle,
    maxWidth: '60px'
  };

  const inputStyle = {
    minWidth: '50px',
    width: '100%'
  };

  useEffect(() => {
    if (!calculatedData || calculatedData.length === 0) {
      setProcessedData({ activeMaterialColumns: [], maxRows: 0 });
      setManualRows([]);
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
    
    // If all columns are empty but there was initial data, ensure at least 10 empty rows for display consistency if needed.
    // This logic is more aligned with how PrintFrameTable and PrintSashTable behave.
    // The conditional rendering for "No data" message handles cases where activeMaterialColumns is empty.

    setProcessedData({ activeMaterialColumns, maxRows });

  }, [calculatedData]);

  const handleAddManualRow = () => {
    const newRow = processedData.activeMaterialColumns.map(() => ({ originalId: '', length: '', pcs: '' }));
    setManualRows(prevRows => [...prevRows, newRow]);
  };

  const handleManualInputChange = (value, manualRowIndex, columnIndex, field) => {
    setManualRows(prevRows => {
      const newRows = [...prevRows];
      newRows[manualRowIndex][columnIndex][field] = value;
      return newRows;
    });
  };

  const totalRows = processedData.maxRows + manualRows.length;

  if (!calculatedData || calculatedData.length === 0 || (processedData.activeMaterialColumns.length === 0 && manualRows.length === 0)) {
    return (
      <div className="print-container optimized-parts-print-container">
        <div className="print-header parts-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Parts Print
        </div>
        <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
          Batch: {batchNo}
        </div>
        <div style={{ marginBottom: '10px', textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddManualRow}
            size="small"
            disabled={materialDefinitions.length === 0}
          >
            Add Row
          </Button>
        </div>
        <table className="bordered-print-table optimized-parts-table" style={{ tableLayout: 'auto', width: '100%' }}>
          <thead>
            <tr>
              {(processedData.activeMaterialColumns.length > 0 ? processedData.activeMaterialColumns : materialDefinitions).map((col, index) => (
                <React.Fragment key={index}>
                  <th style={cellStyle}>ID</th>
                  <th style={numberCellStyle}>{col.header}</th>
                  <th style={numberCellStyle}>Pcs</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {manualRows.length > 0 && processedData.activeMaterialColumns.length === 0 &&
              manualRows.map((manualRowData, manualRowIndex) => (
                <tr key={`manual-only-${manualRowIndex}`}>
                  {manualRowData.map((cellData, colIndex) => (
                    <React.Fragment key={`manual-only-${manualRowIndex}-${colIndex}`}>
                      <td style={cellStyle}>
                        <Input size="small" style={inputStyle} bordered={false} value={cellData.originalId} onChange={(e) => handleManualInputChange(e.target.value, manualRowIndex, colIndex, 'originalId')} />
                      </td>
                      <td style={numberCellStyle}>
                        <Input size="small" style={inputStyle} bordered={false} value={cellData.length} onChange={(e) => handleManualInputChange(e.target.value, manualRowIndex, colIndex, 'length')} />
                      </td> 
                      <td style={numberCellStyle}>
                        <Input size="small" style={inputStyle} bordered={false} value={cellData.pcs} onChange={(e) => handleManualInputChange(e.target.value, manualRowIndex, colIndex, 'pcs')} />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
            ))}
            {(manualRows.length === 0 || processedData.activeMaterialColumns.length > 0) && (
                <tr>
                    {(processedData.activeMaterialColumns.length > 0 ? processedData.activeMaterialColumns : materialDefinitions).map((col, j) => (
                        <React.Fragment key={`empty-placeholder-${j}`}>
                        <td style={cellStyle}></td>
                        <td style={numberCellStyle}></td>
                        <td style={numberCellStyle}></td>
                        </React.Fragment>
                    ))}
                </tr>
            )}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          { (calculatedData.length === 0 || processedData.activeMaterialColumns.length === 0) && manualRows.length === 0 && "No data available for optimized parts view."}
          { manualRows.length > 0 && processedData.activeMaterialColumns.length === 0 && "Displaying manually added rows."}
        </div>
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
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddManualRow}
          size="small"
          disabled={processedData.activeMaterialColumns.length === 0} 
        >
          Add Row
        </Button>
      </div>
      <table className="bordered-print-table optimized-parts-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {processedData.activeMaterialColumns.map((col, index) => (
              <React.Fragment key={index}>
                <th style={cellStyle}>ID</th>
                <th style={numberCellStyle}>{col.header}</th>
                <th style={numberCellStyle}>Pcs</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(processedData.maxRows)].map((_, rowIndex) => (
            <tr key={`calculated-${rowIndex}`}>
              {processedData.activeMaterialColumns.map((col, colIndex) => {
                const item = col.sortedItems[rowIndex];
                return (
                  <React.Fragment key={`calculated-${rowIndex}-${colIndex}`}>
                    <td style={cellStyle}>{item ? item.originalId : ''}</td>
                    <td style={numberCellStyle}>{item ? item.length.toFixed(3) : ''}</td> 
                    <td style={numberCellStyle}>{item ? item.pcs : ''}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
          {manualRows.map((manualRowData, manualRowIndex) => (
            <tr key={`manual-${manualRowIndex}`}>
              {manualRowData.map((cellData, colIndex) => (
                <React.Fragment key={`manual-${manualRowIndex}-${colIndex}`}>
                  <td style={cellStyle}>
                    <Input size="small" style={inputStyle} bordered={false} value={cellData.originalId} onChange={(e) => handleManualInputChange(e.target.value, manualRowIndex, colIndex, 'originalId')} />
                  </td>
                  <td style={numberCellStyle}>
                    <Input size="small" style={inputStyle} bordered={false} value={cellData.length} onChange={(e) => handleManualInputChange(e.target.value, manualRowIndex, colIndex, 'length')} />
                  </td> 
                  <td style={numberCellStyle}>
                    <Input size="small" style={inputStyle} bordered={false} value={cellData.pcs} onChange={(e) => handleManualInputChange(e.target.value, manualRowIndex, colIndex, 'pcs')} />
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
          {totalRows > 0 && totalRows < 10 &&
            (() => {
              let lastRowHasContent = false;
              if (manualRows.length > 0) {
                const lastManualRow = manualRows[manualRows.length - 1];
                lastRowHasContent = lastManualRow.some(cell => cell.originalId || cell.length || cell.pcs);
              } else if (processedData.maxRows > 0) {
                lastRowHasContent = processedData.activeMaterialColumns.some(col => 
                  col.sortedItems[processedData.maxRows - 1] && 
                  (col.sortedItems[processedData.maxRows - 1].length > 0 || col.sortedItems[processedData.maxRows - 1].pcs)
                );
              }

              if (lastRowHasContent) {
                return (
                  <tr key="conditional-empty-row">
                    {processedData.activeMaterialColumns.map((col, j) => (
                      <React.Fragment key={`conditional-empty-${j}`}>
                        <td style={cellStyle}></td>
                        <td style={numberCellStyle}></td>
                        <td style={numberCellStyle}></td>
                      </React.Fragment>
                    ))}
                  </tr>
                );
              }
              return null;
            })()}
        </tbody>
      </table>
    </div>
  );
};

export default PrintOptimizedPartsTable; 