import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintSashTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the sash table
  const columns = [
    [
      { title: 'Batch', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 },
      { title: 'Style', rowSpan: 2 },
      { title: '82-03--', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-03 |', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-05', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-04--', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-04|', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: 'Color', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 }
    ],
    []
  ];

  // Custom row renderer for sash data
  const renderSashRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.ID || index + 1}</td>
      <td>{row.Style || ''}</td>
      <td>{row['82-03-H'] || ''}</td>
      <td>{row['82-03-H-Pcs'] || ''}</td>
      <td>{row['82-03-V'] || ''}</td>
      <td>{row['82-03-V-Pcs'] || ''}</td>
      <td>{row['82-05'] || ''}</td>
      <td>{row['82-05-Pcs'] || ''}</td>
      <td>{row['82-04-H'] || ''}</td>
      <td>{row['82-04-H-Pcs'] || ''}</td>
      <td>{row['82-04-V'] || ''}</td>
      <td>{row['82-04-V-Pcs'] || ''}</td>
      <td>{row.Color || ''}</td>
      <td>{row.ID || index + 1}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="Sash"
      headerClass="sash-header"
      tableClass="sash-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={9}
      renderRow={renderSashRow}
      debugTitle="窗扇表格数据"
    />
  );
};

export default PrintSashTable; 