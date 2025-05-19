import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintPartsTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the parts table
  const columns = [
    [
      { title: 'Batch', rowSpan: 2 },
      { title: 'ID', rowSpan: 1 },
      { title: 'Style', rowSpan: 1 },
      { title: '中框', rowSpan: 1 },
      { title: '中铝', rowSpan: 1 },
      { title: '手铝', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: 'Track', rowSpan: 1 },
      { title: 'Cover--', rowSpan: 1 },
      { title: 'Cover|', rowSpan: 1 },
      { title: '大中', rowSpan: 1 },
      { title: 'pcs', rowSpan: 1 },
      { title: '大中2', rowSpan: 1 },
      { title: 'pcs', rowSpan: 1 },
      { title: 'Slop', rowSpan: 1 },
      { title: 'Color', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 }
    ],
    []
  ];

  // Custom row renderer for parts data
  const renderPartsRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.ID || index + 1}</td>
      <td>{row.Style || ''}</td>
      <td>{row.mullion || ''}</td>
      <td>{row.mullionA || ''}</td>
      <td>{row.handleA || ''}</td>
      <td>{row.quantity || ''}</td>
      <td>{row.track || ''}</td>
      <td>{row.coverH || ''}</td>
      <td>{row.coverV || ''}</td>
      <td>{row.bigMu1 || ''}</td>
      <td>{row.bigMu1Q || ''}</td>
      <td>{row.bigMu2 || ''}</td>
      <td>{row.bigMu2Q || ''}</td>
      <td>{row.slop || ''}</td>
      <td>{row.Color || ''}</td>
      <td>{row.ID || index + 1}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="Parts"
      headerClass="parts-header"
      tableClass="parts-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={9}
      renderRow={renderPartsRow}
      debugTitle="零件表格数据"
    />
  );
};

export default PrintPartsTable; 