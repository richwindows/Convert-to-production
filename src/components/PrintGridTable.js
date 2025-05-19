import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintGridTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the grid table
  const columns = [
    [
      { title: 'Batch', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 },
      { title: 'Style', rowSpan: 2 },
      { title: 'Grid Style', rowSpan: 2 },
      { title: 'Sash', colSpan: 6 },
      { title: 'Fixed', colSpan: 6 },
      { title: 'ID', rowSpan: 2 },
      { title: 'Note', rowSpan: 2 },
      { title: 'Color', rowSpan: 2 }
    ],
    [
      { title: 'W1' },
      { title: 'Pcs' },
      { title: '一刀' },
      { title: 'H1' },
      { title: 'Pcs' },
      { title: '一刀' },
      { title: 'W2' },
      { title: 'Pcs' },
      { title: '一刀' },
      { title: 'H2' },
      { title: 'Pcs' },
      { title: '一刀' }
    ]
  ];

  // Custom row renderer for grid data
  const renderGridRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.ID || index + 1}</td>
      <td>{row.Style || ''}</td>
      <td>{row.Grid || ''}</td>
      <td>{row.sashW || ''}</td>
      <td>{row.sashWq || ''}</td>
      <td>{row.holeW1 || ''}</td>
      <td>{row.sashH || ''}</td>
      <td>{row.sashHq || ''}</td>
      <td>{row.holeH1 || ''}</td>
      <td>{row.fixW || ''}</td>
      <td>{row.fixWq || ''}</td>
      <td>{row.holeW2 || ''}</td>
      <td>{row.fixH || ''}</td>
      <td>{row.fixHq || ''}</td>
      <td>{row.holeH2 || ''}</td>
      <td>{row.ID || index + 1}</td>
      <td>{row.Note || ''}</td>
      <td>{row.Color || ''}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="Grid"
      headerClass="grid-header"
      tableClass="grid-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={9}
      renderRow={renderGridRow}
      debugTitle="格栅表格数据"
    />
  );
};

export default PrintGridTable; 