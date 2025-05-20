import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';
import { Button, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import exportSimpleExcel from '../utils/SimpleExcelExport';

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

  // 添加条件样式逻辑，根据各种条件为尺寸格子添加颜色
  const getCellStyle = (row, field) => {
    if (field === 'width' || field === 'height') {
      // 只有钢化标记或厚度大于3时才改变背景色
      if (row.Tmprd === 'T' || (row.thickness && parseFloat(row.thickness) > 3)) {
        return { backgroundColor: '#FFFF00' }; // 黄色背景
      }
    }
    
    return {};
  };
  
  // 添加文字颜色样式逻辑
  const getTextStyle = (row) => {
    // 根据玻璃类型设置不同的文字颜色
    if (row.glassType === 'lowe2' || row.glassType === 'Lowe270') {
      return { color: '#FF0000' }; // 红色文字
    }
    
    if (row.glassType === 'lowe3' || row.glassType === 'Lowe366') {
      return { color: '#800080' }; // 紫色文字
    }
    
    if (row.glassType === 'OBS' || row.glassType === 'P516') {
      return { color: '#008000' }; // 绿色文字
    }
    
    return {};
  };

  // Custom row renderer for glass data
  const renderGlassRow = (row, index) => (
    <tr key={index} style={getTextStyle(row)}>
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
      <td>{row.Tmprd || ''}</td>
      <td>{row.thickness || ''}</td>
      <td style={getCellStyle(row, 'width')}>{row.width || ''}</td>
      <td style={getCellStyle(row, 'height')}>{row.height || ''}</td>
      <td>{row.grid || ''}</td>
      <td>{row.argon || ''}</td>
      <td>{row.ID || ''}</td>
    </tr>
  );

  // 处理导出Excel
  const handleExportExcel = () => {
    if (calculatedData && calculatedData.length > 0) {
      // 先检查是否有非钢化3mm厚度的玻璃
      const hasValidGlass = calculatedData.some(item => 
        item.thickness === '3' && item.Tmprd !== 'T'
      );
      
      if (!hasValidGlass) {
        alert('没有找到符合条件的3mm非钢化玻璃！');
        return;
      }
      
      console.log('开始处理导出请求，数据条数:', calculatedData.length);
      
      try {
        exportSimpleExcel(calculatedData, batchNo);
        console.log('导出请求已发送');
      } catch (error) {
        console.error('导出Excel时发生错误:', error);
        alert(`导出失败: ${error.message}`);
      }
    } else {
      alert('没有数据可导出！');
    }
  };

  // 计算每种玻璃类型的数量
  const getGlassTypeCount = (type) => {
    if (!calculatedData || calculatedData.length === 0) return 0;
    
    return calculatedData.filter(item => 
      item.thickness === '3' && 
      item.Tmprd !== 'T' && 
      item.glassType && 
      item.glassType.toLowerCase().includes(type)
    ).length;
  };

  return (
    <div>
      <div className="export-button-container" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="glass-type-summary" style={{ fontSize: '14px' }}>
          <p style={{ margin: '0', color: '#0000FF' }}>Clear玻璃: {getGlassTypeCount('clear')}片</p>
          <p style={{ margin: '0', color: '#FF00FF' }}>Lowe270玻璃: {getGlassTypeCount('lowe2')}片</p>
          <p style={{ margin: '0', color: '#800080' }}>Lowe366玻璃: {getGlassTypeCount('lowe3')}片</p>
          <p style={{ margin: '0', color: '#008000' }}>OBS玻璃: {getGlassTypeCount('obs')}片</p>
        </div>
        
        <Tooltip title="导出四个工作表，包含按类型分组的3mm非钢化玻璃">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
            disabled={!calculatedData || calculatedData.length === 0}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            导出3mm非钢化玻璃优化表
          </Button>
        </Tooltip>
      </div>
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
    </div>
  );
};

export default PrintGlassTable; 