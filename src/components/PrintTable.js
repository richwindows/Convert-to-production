import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the general table
  const columns = [
    [
      { title: 'Batch NO.', rowSpan: 2 },
      { title: 'Customer', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 },
      { title: 'Style', rowSpan: 2 },
      { title: 'W', rowSpan: 2 },
      { title: 'H', rowSpan: 2 },
      { title: 'FH', rowSpan: 2 },
      { title: 'Frame', rowSpan: 2 },
      { title: 'Glass', rowSpan: 2 },
      { title: 'Argon', rowSpan: 2 },
      { title: 'Grid', rowSpan: 2 },
      { title: 'Color', rowSpan: 2 },
      { title: 'Note', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 }
    ],
    []
  ];

  // Custom row renderer for general data
  const renderGeneralRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.Customer || ''}</td>
      <td>{row.ID || index + 1}</td>
      <td>{row.Style || ''}</td>
      <td>{row.W || ''}</td>
      <td>{row.H || ''}</td>
      <td>{row.FH || ''}</td>
      <td>{row.Frame || ''}</td>
      <td>{row.Glass || ''}</td>
      <td>{row.Argon || ''}</td>
      <td>{row.Grid || ''}</td>
      <td>{row.Color || ''}</td>
      <td>{row.Note || ''}</td>
      <td>{row.ID || index + 1}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="General Information"
      headerClass="general-header"
      tableClass="general-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={10}
      renderRow={renderGeneralRow}
      debugTitle="通用信息表格数据"
    />
  );
};

export default PrintTable; 