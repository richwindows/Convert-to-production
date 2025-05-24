import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';
import { formatSize } from '../utils/formattingUtils';

const PrintLabelTable = ({ batchNo, calculatedData }) => {
  // Generate barcode based on batch number and ID
  const generateBarcode = (batchNo, id) => {
    if (!batchNo || !id) return '';
    
    // Extract date parts from batch number (format: 05212025-01-16)
    const parts = batchNo.split('-');
    if (parts.length !== 3) return '';
    
    const monthDay = parts[0]; // 05212025
    // const orderNum = parts[1]; // 01
    const dayPart = parts[2]; // 16
    
    // Extract simplified date: 052125 (from 05212025, year 2025 -> 25)
    const month = monthDay.substring(0, 2); // 05
    const day = monthDay.substring(2, 4); // 21
    const year = monthDay.substring(6, 8); // 25 (from 2025)
    const simplifiedDate = month + day + year; // 052125
    
    // Format ID with leading zero (2 -> 02)
    const formattedId = String(id).padStart(2, '0');
    
    // Generate barcode: Rich-052125-16-02
    return `Rich-${simplifiedDate}-${dayPart}-${formattedId}`;
  };

  // Define column structure for the label table (removed Batch NO., added Barcode)
  const columns = [
    [
      { title: 'Customer', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 },
      { title: 'Style', rowSpan: 1 },
      { title: 'Size', rowSpan: 1 },
      { title: 'Frame', rowSpan: 1 },
      { title: 'Glass', rowSpan: 1 },
      { title: 'Grid', rowSpan: 1 },
      { title: 'P.O', rowSpan: 1 },
      { title: 'Invoice Num. Order Date', rowSpan: 1 },
      { title: 'Barcode', rowSpan: 1 },
    ],
    []
  ];

  // Custom row renderer for label data
  const renderLabelRow = (row, index, batchNo) => {
    const barcode = generateBarcode(batchNo, row.ID);
    
    // The row.Size should now be pre-formatted from WindowCalculator
    // Fallback to W and H if row.Size is somehow missing, but ideally row.Size is primary.
    let sizeDisplay = row.Size || ''; 
    if (!sizeDisplay && row.W && row.H) { // Fallback if row.Size is not present
      sizeDisplay = formatSize(row.W, row.H); 
    }
    
    // 调试输出
    console.log('Row data:', row);
    console.log('Size display:', sizeDisplay);
    
    return (
      <tr key={index}>
        <td>{row.Customer || ''}</td>
        <td>{row.ID}</td>
        <td>{row.Style || ''}</td>
        <td>{sizeDisplay}</td>
        <td>{row.Frame || ''}</td>
        <td>{row.Glass ? (row.Argon && row.Argon !== 'None' ? `${row.Glass}+${row.Argon}` : row.Glass) : ''}</td>
        <td>{row.Grid || ''}</td>
        <td>{row.PO || ''}</td>
        <td>{batchNo}</td>
        <td>{barcode}</td>
      </tr>
    );
  };

  return (
    <CommonPrintTable
      title="Label"
      headerClass="label-header"
      tableClass="label-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={9}
      renderRow={renderLabelRow}
      debugTitle="标签表格数据"
    />
  );
};

export default PrintLabelTable;