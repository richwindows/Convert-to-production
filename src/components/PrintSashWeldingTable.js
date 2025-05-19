import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintSashWeldingTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the sash welding table
  const columns = [
    [
      { title: 'Batch NO.', rowSpan: 2 },
      { title: 'Customer', rowSpan: 2 },
      { title: 'ID', rowSpan: 2 }, // Window ID
      { title: 'Style', rowSpan: 2 },
      { title: 'W', rowSpan: 2 }, // Base dimension of sash panel
      { title: 'H', rowSpan: 2 }, // Base dimension of sash panel
      { title: 'Sashw', rowSpan: 2 },  // Calculated cut for welding
      { title: 'Sashh', rowSpan: 2 },  // Calculated cut for welding
      { title: 'Pcs', rowSpan: 2 },
      { title: 'No.', rowSpan: 2 } 
    ],
    [] // No second row of headers needed for this simple structure
  ];

  // Custom row renderer for sash welding data
  const renderSashWeldingRow = (row, index, batchNo) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.Customer || ''}</td>
      <td>{row.ID || ''}</td> 
      <td>{row.Style || ''}</td>
      <td>{row.SashW || ''}</td>     
      <td>{row.SashH || ''}</td>      
      <td>{row.WeldingCutW || ''}</td>   
      <td>{row.WeldingCutH || ''}</td>   
      <td>{row.Pcs || ''}</td>   
      <td>{index + 1}</td>     
    </tr>
  );

  return (
    <CommonPrintTable
      title="Sash Welding List"
      headerClass="sash-welding-header"
      tableClass="sash-welding-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={10} // Or a suitable number for this table
      renderRow={renderSashWeldingRow}
      debugTitle="Sash焊接表格数据"
    />
  );
};

export default PrintSashWeldingTable; 