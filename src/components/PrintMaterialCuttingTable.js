import React, { useEffect, useState } from 'react';
import { Input, Tag, Tooltip, Badge, Button, Dropdown, Menu } from 'antd';
import { FileTextOutlined, TagOutlined, ScissorOutlined, PlusOutlined, DeleteOutlined, BgColorsOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintMaterialCuttingTable = ({ batchNo, calculatedData, onCellChange }) => {
  const [sortedData, setSortedData] = useState([]);
  const [metrics, setMetrics] = useState({
    materialCount: 0,
    cuttingGroupCount: 0,
    totalItems: 0,
    totalLength: 0
  });

  const rowColors = [
    { name: '无颜色', value: '' },
    { name: '浅蓝色', value: '#bae0ff' },
    { name: '浅绿色', value: '#b7eb8f' },
    { name: '浅黄色', value: '#fffb8f' },
    { name: '浅红色', value: '#ffccc7' },
    { name: '浅紫色', value: '#d3adf7' },
  ];

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      const updatedRow = { ...sortedData[rowIndex], [columnKey]: e.target.value };
      const newData = [...sortedData];
      newData[rowIndex] = updatedRow;
      onCellChange('materialCutting', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      // For materialCutting, adding a new row might require specific default values 
      // or a different handling in App.js depending on how it should integrate with 'sortedData' logic.
      // For now, we'll send a generic ADD_ROW and App.js will append an empty object.
      // This might need refinement if newly added rows in this specific table require more structure upfront.
      onCellChange('materialCutting', null, 'ADD_ROW', null);
    }
  };

  const handleRowColorChange = (rowIndex, color) => {
    if (onCellChange) {
      onCellChange('materialCutting', rowIndex, 'ROW_COLOR', color);
    }
  };

  useEffect(() => {
    if (!calculatedData || !Array.isArray(calculatedData)) {
      setSortedData([]);
      setMetrics({ materialCount: 0, cuttingGroupCount: 0, totalItems: 0, totalLength: 0 });
      return;
    }
    const normalizedData = calculatedData.map(item => ({
      ...item,
      MaterialName: item.MaterialName || item['Material Name'] || '',
      CuttingID: item['Cutting ID'] || item.CuttingID || '',
      PiecesID: item['Pieces ID'] || item.PiecesID || '',
      Qty: parseInt(item.Qty || 1),
      Length: parseFloat(item.Length) || 0,
      cutCount: item.cutCount || item.CutCount || 0,
      cutLoss: item.cutLoss || item.CutLoss || 0,
      OrderNo: item.OrderNo || item.ID || '',
      OrderItem: item.OrderItem || '1',
      BinNo: item.BinNo || item.ID || '',
    }));
    
    const sortedItems = [...normalizedData].sort((a, b) => {
      // 1. 首先按材料名称分组
      if (a.MaterialName !== b.MaterialName) return a.MaterialName.localeCompare(b.MaterialName);
      
      // 2. 然后按数量从小到大排序
      if (a.Qty !== b.Qty) return a.Qty - b.Qty;
      
      // 3. 最后在相同数量内按长度从大到小排序
      return b.Length - a.Length;
    });
    
    const materials = [...new Set(sortedItems.map(item => item.MaterialName))];
    const cuttingGroups = [...new Set(sortedItems.map(item => (item.CuttingID) ? `${item.MaterialName}_${item.CuttingID}` : null).filter(item => item !== null))];
    const totalLength = sortedItems.reduce((sum, item) => sum + (parseFloat(item.Length) * parseInt(item.Qty || 1)), 0);
    
    setMetrics({
      materialCount: materials.length,
      cuttingGroupCount: cuttingGroups.length,
      totalItems: sortedItems.length,
      totalLength: totalLength.toFixed(2)
    });
    setSortedData(sortedItems);
  }, [calculatedData]);

  const headerTitles = [
    'Batch No', 'Order No', 'Order Item', 'Material Name', 'Cutting ID', 'Pieces ID',
    'Length', 'Angles', 'Qty', 'Bin No', 'Position', 'Style', 'Frame', 'Color', 'Painting'
  ];

  const dataKeys = [
    'batchNo', 'OrderNo', 'OrderItem', 'MaterialName', 'CuttingID', 'PiecesID', 
    'Length', 'Angles', 'Qty', 'BinNo', 'Position', 'Style', 'Frame', 'Color', 'Painting'
  ];

  // 通用的单元格样式
  const cellStyle = {
    width: 'max-content',
    whiteSpace: 'nowrap',
    padding: '4px 8px'
  };

  // 输入框样式
  const inputStyle = {
    minWidth: '50px',
    width: '100%'
  };

  // 数字列的样式
  const numberCellStyle = {
    ...cellStyle,
    maxWidth: '60px'
  };

  const renderOptimizationMetrics = () => {
    if (!sortedData || sortedData.length === 0) return null;
    return (
      <div className="optimization-metrics">
        <div className="metrics-title"><ScissorOutlined style={{ marginRight: '8px' }} />优化摘要</div>
        <div className="metrics-content">
          <div className="metric-item"><TagOutlined style={{ marginRight: '8px' }} /><span className="metric-label">材料种类:</span><span className="metric-value">{metrics.materialCount}</span></div>
          <div className="metric-item"><ScissorOutlined style={{ marginRight: '8px' }} /><span className="metric-label">切割组:</span><span className="metric-value">{metrics.cuttingGroupCount}</span></div>
          <div className="metric-item"><FileTextOutlined style={{ marginRight: '8px' }} /><span className="metric-label">物料项:</span><span className="metric-value">{metrics.totalItems}</span></div>
          <div className="metric-item"><span className="metric-label">总长度:</span><span className="metric-value">{metrics.totalLength}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="deca-cutting-container print-container">
      {renderOptimizationMetrics()}
      <div className="print-header material-cutting-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>DECA Cutting</div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddRow}
          size="small"
        >
          Add Row
        </Button>
      </div>
      <table className="material-cutting-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {headerTitles.map(title => {
              const isNumberColumn = ['Length', 'Qty'].includes(title);
              return <th key={title} style={isNumberColumn ? numberCellStyle : cellStyle}>{title}</th>;
            })}
            {/* Header for the actions column */}
            <th style={cellStyle}></th>
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((row, index) => {
              const cuttingID = row.CuttingID || '';
              const piecesID = row.PiecesID || '';
              let materialType = row.MaterialName;
              let colorSuffix = '';
              const lastDashIndex = row.MaterialName.lastIndexOf('-');
              if (lastDashIndex !== -1) {
                materialType = row.MaterialName.substring(0, lastDashIndex);
                colorSuffix = row.MaterialName.substring(lastDashIndex + 1);
              }
              return (
                <tr key={`${row.MaterialName}_${cuttingID}_${piecesID}_${index}_${row.ID || index}`} style={{ backgroundColor: row.rowColor || 'transparent' }}>
                  <td style={cellStyle}>{batchNo}</td>
                  <td style={cellStyle}>{row.OrderNo}</td>
                  <td style={cellStyle}>{row.OrderItem}</td>
                  <td style={cellStyle}>
                    <Tooltip title={`完整材料名称: ${row.MaterialName}`}>
                      <span className="material-name">
                        <span className="material-type">{materialType}</span>
                        {colorSuffix && <Tag color="blue" className="material-color">{colorSuffix}</Tag>}
                      </span>
                    </Tooltip>
                  </td>
                  <td style={cellStyle}>{cuttingID && <Badge status="processing" text={cuttingID} />}</td>
                  <td style={cellStyle}>{piecesID && <Badge status="success" text={piecesID} />}</td>
                  <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Length} onChange={(e) => handleInputChange(e, index, 'Length')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Angles || 'V'} onChange={(e) => handleInputChange(e, index, 'Angles')} /></td>
                  <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Qty} onChange={(e) => handleInputChange(e, index, 'Qty')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.BinNo} onChange={(e) => handleInputChange(e, index, 'BinNo')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Position || ''} onChange={(e) => handleInputChange(e, index, 'Position')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                  <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
                  <td style={{...cellStyle, overflow: 'visible', position: 'relative'}}>
                    <Input size="small" style={inputStyle} bordered={false} value={row.Painting || ''} onChange={(e) => handleInputChange(e, index, 'Painting')} />
                    <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '5px', marginLeft: '10px' }}>
                      <Dropdown
                        overlay={
                          <Menu onClick={({ key }) => handleRowColorChange(index, key)}>
                            {rowColors.map(color => (
                              <Menu.Item key={color.value}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{ width: '16px', height: '16px', backgroundColor: color.value || '#fff', border: '1px solid #ccc', marginRight: '8px' }}></div>
                                  {color.name}
                                </div>
                              </Menu.Item>
                            ))}
                          </Menu>
                        }
                        trigger={['click']}
                      >
                        <Button icon={<BgColorsOutlined />} size="small" type="text" />
                      </Dropdown>
                      <Button 
                        icon={<DeleteOutlined />} 
                        size="small" 
                        type="text" 
                        danger 
                        onClick={() => onCellChange('materialCutting', index, 'DELETE_ROW')}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={headerTitles.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
                No Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintMaterialCuttingTable;