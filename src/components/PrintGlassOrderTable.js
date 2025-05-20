import React from 'react';
import './PrintTable.css';

const PrintGlassOrderTable = ({ batchNo, calculatedData }) => {
  // 添加条件样式逻辑，根据各种条件为尺寸格子添加颜色
  const getCellStyle = (row, field) => {
    if (field === 'Width' || field === 'Height') {
      // 只有钢化标记或厚度大于3时才改变背景色
      if (row['Annealed/Tempered'] === 'Tempered' || (row.Thickness && parseFloat(row.Thickness) > 3)) {
        return { backgroundColor: '#FFFF00' }; // 黄色背景
      }
    }
    
    return {};
  };

  // 添加文字颜色样式逻辑
  const getTextStyle = (row) => {
    // 根据玻璃类型设置不同的文字颜色
    if (row['Glass Type'] === 'lowe2' || row['Glass Type'] === 'Lowe270') {
      return { color: '#FF0000' }; // 红色文字
    }
    
    if (row['Glass Type'] === 'lowe3' || row['Glass Type'] === 'Lowe366') {
      return { color: '#800080' }; // 紫色文字
    }
    
    if (row['Glass Type'] === 'OBS' || row['Glass Type'] === 'P516') {
      return { color: '#008000' }; // 绿色文字
    }
    
    return {};
  };

  return (
    <div className="print-container">
      <div className="print-header glass-order-header">
        <div className="glass-order-title">Glass Order</div>
      </div>
      
      <table className="glass-order-table bordered-print-table">
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
              <tr key={index} style={getTextStyle(row)}>
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
                <td style={getCellStyle(row, 'Width')}>{row.Width || ''}</td>
                <td style={getCellStyle(row, 'Height')}>{row.Height || ''}</td>
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