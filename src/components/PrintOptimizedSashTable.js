import React, { useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintOptimizedSashTable = ({ batchNo, calculatedData }) => {
  const [processedData, setProcessedData] = useState({ activeMaterialColumns: [], maxRows: 0 });
  const [manualRows, setManualRows] = useState([]);

  const materialDefinitions = [
    { header: '82-03--', lengthKey: '82-03-H', pcsKey: '82-03-H-Pcs' },
    { header: '82-03 |', lengthKey: '82-03-V', pcsKey: '82-03-V-Pcs' },
    { header: '82-05', lengthKey: '82-05', pcsKey: '82-05-Pcs' }, // Assuming lengthKey is same as header for '82-05' if no specific H/V
    { header: '82-04--', lengthKey: '82-04-H', pcsKey: '82-04-H-Pcs' },
    { header: '82-04|', lengthKey: '82-04-V', pcsKey: '82-04-V-Pcs' },
  ];

  const cellStyle = {
    width: 'max-content',
    whiteSpace: 'nowrap',
    padding: '4px 8px'
  };

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
      <div className="print-container optimized-sash-print-container">
        <div className="print-header sash-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Sash
        </div>
        <div style={{ textAlign: 'center', fontSize: '21px', fontWeight: 'bold', marginBottom: '10px' }}>
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
        <table className="bordered-print-table optimized-sash-table" style={{ tableLayout: 'auto', width: '100%' }}>
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
          { (calculatedData.length === 0 || processedData.activeMaterialColumns.length === 0) && manualRows.length === 0 && "No data available for optimized sash view."}
          { manualRows.length > 0 && processedData.activeMaterialColumns.length === 0 && "Displaying manually added rows."}
        </div>
      </div>
    );
  }

  return (
    <div className="print-container optimized-sash-print-container">
      <div className="print-header sash-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Sash
      </div>
      <div style={{ textAlign: 'center', fontSize: '21px', fontWeight: 'bold', marginBottom: '10px' }}>
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
      <table className="bordered-print-table optimized-sash-table" style={{ tableLayout: 'auto', width: '100%' }}>
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

export default PrintOptimizedSashTable; 