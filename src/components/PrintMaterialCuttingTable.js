import React, { useEffect, useState } from 'react';
import { Input, Tag, Tooltip, Badge } from 'antd';
import { FileTextOutlined, TagOutlined, ScissorOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintMaterialCuttingTable = ({ batchNo, calculatedData, onCellChange }) => {
  const [sortedData, setSortedData] = useState([]);
  const [metrics, setMetrics] = useState({
    materialCount: 0,
    cuttingGroupCount: 0,
    totalItems: 0,
    totalLength: 0
  });

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      const updatedRow = { ...sortedData[rowIndex], [columnKey]: e.target.value };
      const newData = [...sortedData];
      newData[rowIndex] = updatedRow;
      // If you want to reflect changes immediately in parent for export or other processing:
      onCellChange('materialCutting', rowIndex, columnKey, e.target.value);
      // If only local state update is needed until a save/process action, 
      // then just setSortedData(newData) might be enough and call parent on a specific action.
      // For now, assuming immediate propagation to parent.
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
      OrderNo: item.OrderNo || item.ID || '', // Ensure OrderNo for display
      OrderItem: item.OrderItem || '1', // Ensure OrderItem for display
      BinNo: item.BinNo || item.ID || '', // Ensure BinNo for display
    }));
    
    const sortedItems = [...normalizedData].sort((a, b) => {
      if (a.MaterialName !== b.MaterialName) return a.MaterialName.localeCompare(b.MaterialName);
      if (a.CuttingID !== '' && b.CuttingID !== '') {
        const cuttingA = parseInt(a.CuttingID); const cuttingB = parseInt(b.CuttingID);
        if (cuttingA !== cuttingB) return cuttingA - cuttingB;
      }
      if (a.PiecesID !== '' && b.PiecesID !== '') {
        const piecesA = parseInt(a.PiecesID); const piecesB = parseInt(b.PiecesID);
        if (piecesA !== piecesB) return piecesA - piecesB;
      }
      return 0;
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
    'Length', 'Angles', 'Qty', 'Bin No', 'Position', 'Style', 'Frame', 'Color', 'Painting',
    'Original ID' // Added Original ID
  ];

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
      <div className="print-header material-cutting-header">DECA Cutting</div>
      <table className="material-cutting-table bordered-print-table">
        <thead>
          <tr>
            {headerTitles.map(title => <th key={title}>{title}</th>)}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
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
              <tr key={`${row.MaterialName}_${cuttingID}_${piecesID}_${index}_${row.ID || index}`}>
                <td>{batchNo}</td>
                <td>{row.OrderNo}</td>
                <td>{row.OrderItem}</td>
                <td>
                  <Tooltip title={`完整材料名称: ${row.MaterialName}`}>
                    <span className="material-name">
                      <span className="material-type">{materialType}</span>
                      {colorSuffix && <Tag color="blue" className="material-color">{colorSuffix}</Tag>}
                    </span>
                  </Tooltip>
                </td>
                <td>{cuttingID && <Badge status="processing" text={cuttingID} />}</td>
                <td>{piecesID && <Badge status="success" text={piecesID} />}</td>
                <td><Input size="small" bordered={false} value={row.Length} onChange={(e) => handleInputChange(e, index, 'Length')} /></td>
                <td><Input size="small" bordered={false} value={row.Angles || 'V'} onChange={(e) => handleInputChange(e, index, 'Angles')} /></td>
                <td><Input size="small" bordered={false} value={row.Qty} onChange={(e) => handleInputChange(e, index, 'Qty')} /></td>
                <td><Input size="small" bordered={false} value={row.BinNo} onChange={(e) => handleInputChange(e, index, 'BinNo')} /></td>
                <td><Input size="small" bordered={false} value={row.Position || ''} onChange={(e) => handleInputChange(e, index, 'Position')} /></td>
                <td><Input size="small" bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td><Input size="small" bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                <td><Input size="small" bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
                <td><Input size="small" bordered={false} value={row.Painting || ''} onChange={(e) => handleInputChange(e, index, 'Painting')} /></td>
                <td>{row.originalId || ''}</td>
              </tr>
            );
          })}
          {sortedData.length === 0 &&
            <tr>
              <td>{batchNo}</td>
              {[...Array(headerTitles.length - 1)].map((_, i) => <td key={`empty-placeholder-${i}`}></td>)}
            </tr>
          }
          {/* Placeholder rows for consistent table height - adjust as needed */}
          {sortedData.length > 0 && sortedData.length < 10 &&
            [...Array(10 - sortedData.length)].map((_, i) => (
              <tr key={`empty-fill-${i}`}>
                {[...Array(headerTitles.length)].map((_, j) => <td key={`empty-fill-${i}-${j}`}></td>)}
              </tr>
            ))
          }
          {sortedData.length === 0 &&
            [...Array(9)].map((_, i) => ( // If sortedData is empty, show 9 empty rows plus one with batchNo
              <tr key={`initial-empty-${i}`}>
                {[...Array(headerTitles.length)].map((_, j) => <td key={`initial-empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintMaterialCuttingTable; 