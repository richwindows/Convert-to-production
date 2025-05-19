import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintLabelTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the label table
  const columns = [
    [
      { title: 'Batch NO.', rowSpan: 2 },
      { title: 'Customer', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 },
      { title: 'Style', rowSpan: 1 },
      { title: 'Size', rowSpan: 1 },
      { title: 'Frame', rowSpan: 1 },
      { title: 'Glass', rowSpan: 1 },
      { title: 'Grid', rowSpan: 1 },
      { title: 'P.O', rowSpan: 1 },
      { title: 'Invoices Num. Batch NO.', rowSpan: 1 },
    ],
    []
  ];

  // Custom row renderer for label data
  const renderLabelRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.Customer || ''}</td>
      <td>{row.ID}</td>
      <td>{row.Style || ''}</td>
      <td>{row.W && row.H ? `${row.W}x${row.H}` : ''}</td>
      <td>{row.Frame || ''}</td>
      <td>{row.Glass ? (row.Argon && row.Argon !== 'None' ? `${row.Glass}+${row.Argon}` : row.Glass) : ''}</td>
      <td>{row.Grid || ''}</td>
      <td>{row.PO || ''}</td>
      <td>{batchNo}</td>
    </tr>
  );

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