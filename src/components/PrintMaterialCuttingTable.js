import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintMaterialCuttingTable = ({ batchNo, calculatedData }) => {
  // Define column structure for the material cutting table
  const columns = [
    [
      { title: 'Batch No', rowSpan: 2 },
      { title: 'Order No', rowSpan: 2 },
      { title: 'Order Item', rowSpan: 2 },
      { title: 'Material Name', rowSpan: 2 },
      { title: 'Cutting ID', rowSpan: 2 },
      { title: 'Pieces ID', rowSpan: 2 },
      { title: 'Length', rowSpan: 2 },
      { title: 'Angles', rowSpan: 2 },
      { title: 'Qty', rowSpan: 2 },
      { title: 'Bin No', rowSpan: 2 },
      { title: 'Cart No', rowSpan: 2 },
      { title: 'Position', rowSpan: 2 },
      { title: 'Label', rowSpan: 2 },
      { title: 'Print', rowSpan: 2 },
      { title: 'Barcode', rowSpan: 2 },
      { title: 'PO No', rowSpan: 2 },
      { title: 'Style', rowSpan: 2 },
      { title: 'Frame', rowSpan: 2 },
      { title: 'Product Size', rowSpan: 2 },
      { title: 'Color', rowSpan: 2 },
      { title: 'Grid', rowSpan: 2 },
      { title: 'Glass', rowSpan: 2 },
      { title: 'Argon', rowSpan: 2 },
      { title: 'Painting', rowSpan: 2 },
      { title: 'Product Description', rowSpan: 2 },
      { title: 'Balance', rowSpan: 2 },
      { title: 'Shift', rowSpan: 2 },
      { title: 'Ship date', rowSpan: 2 },
      { title: 'Note', rowSpan: 2 },
      { title: 'Customer', rowSpan: 2 }
    ],
    []
  ];

  // Custom row renderer for material cutting data
  const renderMaterialCuttingRow = (row, index) => (
    <tr key={index}>
      <td>{batchNo}</td>
      <td>{row.ID}</td>
      <td>1</td>
      <td>{row.MaterialName}</td>
      <td>{index + 1}</td>
      <td>{index + 1}</td>
      <td>{row.Length}</td>
      <td>{row.Angles || '90°'}</td>
      <td>{row.Qty}</td>
      <td>{row.ID}</td>
      <td>{row.CartNo || ''}</td>
      <td>{row.Position}</td>
      <td>{row.Label || ''}</td>
      <td>{row.Print || ''}</td>
      <td>{row.Barcode || ''}</td>
      <td>{row.PONo || ''}</td>
      <td>{row.Style}</td>
      <td>{row.Frame}</td>
      <td>{row.ProductSize || ''}</td>
      <td>{row.Color}</td>
      <td>{row.Grid || ''}</td>
      <td>{row.Glass || ''}</td>
      <td>{row.Argon || ''}</td>
      <td>{row.Painting || ''}</td>
      <td>{row.ProductDescription || ''}</td>
      <td>{row.Balance || ''}</td>
      <td>{row.Shift || ''}</td>
      <td>{row.ShipDate || ''}</td>
      <td>{row.Note || ''}</td>
      <td>{row.Customer || ''}</td>
    </tr>
  );

  return (
    <CommonPrintTable
      title="Material Cutting"
      headerClass="material-cutting-header"
      tableClass="material-cutting-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={10}
      renderRow={renderMaterialCuttingRow}
      debugTitle="Material Cutting Data"
    />
  );
};

export default PrintMaterialCuttingTable; 