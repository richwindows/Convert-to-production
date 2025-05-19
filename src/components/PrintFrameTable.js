import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintFrameTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the frame table
  const columns = [
    [
      { title: 'Batch', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 },
      { title: 'Style', rowSpan: 2 },
      { title: '82-02B —', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-02B |', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-10 —', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-10 |', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-01 —', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: '82-01 |', rowSpan: 1 },
      { title: 'Pcs', rowSpan: 1 },
      { title: 'Color', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 }
    ],
    []
  ];

  // Custom row renderer for frame data
  const renderFrameRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.ID || index + 1}</td>
      <td>{row.Style || ''}</td>
      <td>{row['82-02B-H'] || ''}</td>
      <td>{row['82-02B-H-Pcs'] || ''}</td>
      <td>{row['82-02B-V'] || ''}</td>
      <td>{row['82-02B-V-Pcs'] || ''}</td>
      <td>{row['82-10-H'] || ''}</td>
      <td>{row['82-10-H-Pcs'] || ''}</td>
      <td>{row['82-10-V'] || ''}</td>
      <td>{row['82-10-V-Pcs'] || ''}</td>
      <td>{row['82-01-H'] || ''}</td>
      <td>{row['82-01-H-Pcs'] || ''}</td>
      <td>{row['82-01-V'] || ''}</td>
      <td>{row['82-01-V-Pcs'] || ''}</td>
      <td>{row.Color || ''}</td>
      <td>{row.ID || index + 1}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="Frame"
      headerClass="frame-header"
      tableClass="frame-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={9}
      renderRow={renderFrameRow}
      debugTitle="框架表格数据"
    />
  );
};

export default PrintFrameTable; 