import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintScreenTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the screen table
  const columns = [
    [
      { title: 'Batch NO.', rowSpan: 2 },
      { title: 'Customer', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 },
      { title: 'Style', rowSpan: 1 },
      { title: 'Screen', rowSpan: 1 },
      { title: 'pcs', rowSpan: 1 },
      { title: 'Screen T', rowSpan: 1 },
      { title: 'pcs', rowSpan: 1 },
      { title: 'Color', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 }
    ],
    []
  ];

  // Custom row renderer for screen data
  const renderScreenRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.Customer || ''}</td>
      <td>{row.ID || index + 1}</td>
      <td>{row.Style || ''}</td>
      <td>{row.screenSize || ''}</td>
      <td>{row.screenPcs || ''}</td>
      <td>{row.screenT || ''}</td>
      <td>{row.screenTPcs || ''}</td>
      <td>{row.Color || ''}</td>
      <td>{row.ID || index + 1}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="Screen"
      headerClass="screen-header"
      tableClass="screen-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={9}
      renderRow={renderScreenRow}
      debugTitle="纱窗表格数据"
    />
  );
};

export default PrintScreenTable; 