import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintGlassTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the glass table based on the image
  const columns = [
    [
      { title: 'Batch NO.', rowSpan: 2 },
      { title: 'Customer', rowSpan: 1 },
      { title: 'Style', rowSpan: 1 },
      { title: 'W', rowSpan: 1 },
      { title: 'H', rowSpan: 1 },
      { title: 'FH', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 },
      { title: 'line #', rowSpan: 1 },
      { title: 'Quantity', rowSpan: 1 },
      { title: 'Glass Type', rowSpan: 1 },
      { title: 'Tmprd', rowSpan: 1 },
      { title: 'Thick', rowSpan: 1 },
      { title: 'Width', rowSpan: 1 },
      { title: 'Height', rowSpan: 1 },
      { title: 'Grid', rowSpan: 1 },
      { title: 'Argon', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 }
    ],
    []
  ];

  // Custom row renderer for glass data
  const renderGlassRow = (row, index) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.Customer || ''}</td>
      <td>{row.Style || ''}</td>
      <td>{row.W || ''}</td>
      <td>{row.H || ''}</td>
      <td>{row.FH || ''}</td>
      <td>{row.ID || ''}</td>
      <td>{row.line || ''}</td>
      <td>{row.quantity || ''}</td>
      <td>{row.glassType || ''}</td>
      <td>{row.tempered || ''}</td>
      <td>{row.thickness || ''}</td>
      <td>{row.width || ''}</td>
      <td>{row.height || ''}</td>
      <td>{row.grid || ''}</td>
      <td>{row.argon || ''}</td>
      <td>{row.ID || ''}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="Glass"
      headerClass="glass-header"
      tableClass="glass-table"
      columns={columns}
      data={calculatedData || []}
      batchNo={batchNo}
      emptyRowCount={10}
      renderRow={renderGlassRow}
      debugTitle="玻璃表格数据"
    />
  );
};

export default PrintGlassTable; 