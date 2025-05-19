import React from 'react';
import './PrintTable.css';

const PrintGlassOrderTable = ({ batchNo, calculatedData }) => {
  return (
    <div className="print-container">
      <div className="print-header glass-order-header">
        <div className="glass-order-title">Glass Order</div>
      </div>
      
      <table className="glass-order-table">
        <thead>
          <tr>
            <th rowSpan="2">Batch NO.</th>
            <th rowSpan="2">Customer</th>
            <th rowSpan="2">Style</th>
            <th rowSpan="2">W</th>
            <th rowSpan="2">H</th>
            <th rowSpan="2">FH</th>
            <th rowSpan="2">ID</th>
            <th rowSpan="2">line #</th>
            <th rowSpan="2">Quantity</th>
            <th rowSpan="2">Glass Type</th>
            <th rowSpan="2">Annealed/Tempered</th>
            <th rowSpan="2">Thickness</th>
            <th rowSpan="2">Width</th>
            <th rowSpan="2">Height</th>
            <th rowSpan="2">Notes</th>
          </tr>
          <tr></tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index}>
                <td>{batchNo}</td>
                <td>{row.Customer || ''}</td>
                <td>{row.Style || ''}</td>
                <td>{row.W || ''}</td>
                <td>{row.H || ''}</td>
                <td>{row.FH || ''}</td>
                <td>{row.ID || ''}</td>
                <td>{row.line || ''}</td>
                <td>{row.Quantity || ''}</td>
                <td>{row['Glass Type'] || ''}</td>
                <td>{row['Annealed/Tempered'] || ''}</td>
                <td>{row.Thickness || ''}</td>
                <td>{row.Width || ''}</td>
                <td>{row.Height || ''}</td>
                <td>{row.Notes || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td>{batchNo}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          )}
          {/* Add more empty rows if data is less than minimum rows */}
          {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 &&
            [...Array(10 - calculatedData.length)].map((_, index) => (
              <tr key={`empty-${index}`}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) && 
            [...Array(9)].map((_, index) => (
              <tr key={index}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintGlassOrderTable; 