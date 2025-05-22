import React, { useEffect, useState } from 'react';
import { Tag, Tooltip, Badge } from 'antd';
import { FileTextOutlined, TagOutlined, ScissorOutlined } from '@ant-design/icons';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintMaterialCuttingTable = ({ batchNo, calculatedData }) => {
  const [sortedData, setSortedData] = useState([]);
  const [metrics, setMetrics] = useState({
    materialCount: 0,
    cuttingGroupCount: 0,
    totalItems: 0,
    totalLength: 0
  });

  // Sort and process the data when it changes
  useEffect(() => {
    if (!calculatedData || !Array.isArray(calculatedData)) {
      setSortedData([]);
      setMetrics({ materialCount: 0, cuttingGroupCount: 0, totalItems: 0, totalLength: 0 });
      return;
    }

    // Normalize the data to ensure we have consistent property access
    const normalizedData = calculatedData.map(item => {
      // Make sure we have both property naming conventions
      return {
        ...item,
        MaterialName: item.MaterialName || item['Material Name'] || '',
        // Keep CuttingID and PiecesID as they are, or default to empty string if not present
        CuttingID: item['Cutting ID'] || item.CuttingID || '',
        PiecesID: item['Pieces ID'] || item.PiecesID || '',
        Qty: parseInt(item.Qty || 1),
        Length: parseFloat(item.Length) || 0,
        cutCount: item.cutCount || item.CutCount || 0,
        cutLoss: item.cutLoss || item.CutLoss || 0
      };
    });
    
    // Sort the data consistently:
    // 1. By MaterialName (alphabetically)
    // If CuttingID and PiecesID are not empty, then sort by them.
    const sortedItems = [...normalizedData].sort((a, b) => {
      // First sort by MaterialName
      if (a.MaterialName !== b.MaterialName) {
        return a.MaterialName.localeCompare(b.MaterialName);
      }
      
      // Then by CuttingID (ascending), only if both are not empty
      if (a.CuttingID !== '' && b.CuttingID !== '') {
        const cuttingA = parseInt(a.CuttingID);
        const cuttingB = parseInt(b.CuttingID);
        if (cuttingA !== cuttingB) {
            return cuttingA - cuttingB;
        }
      }
      
      // Finally by PiecesID (ascending), only if both are not empty
      if (a.PiecesID !== '' && b.PiecesID !== '') {
        const piecesA = parseInt(a.PiecesID);
        const piecesB = parseInt(b.PiecesID);
        if (piecesA !== piecesB) {
            return piecesA - piecesB;
        }
      }
      // Add any other fallback sorting if needed, e.g., by original index or another field
      return 0; // Keep original order if all primary sort keys are equal or not applicable
    });
    
    // Calculate metrics for the sorted data
    const materials = [...new Set(sortedItems.map(item => item.MaterialName))];
    const cuttingGroups = [...new Set(
        sortedItems
            .map(item => (item.CuttingID) ? `${item.MaterialName}_${item.CuttingID}` : null)
            .filter(item => item !== null)
    )];
    const totalLength = sortedItems.reduce((sum, item) => sum + (parseFloat(item.Length) * parseInt(item.Qty || 1)), 0);
    
    setMetrics({
      materialCount: materials.length,
      cuttingGroupCount: cuttingGroups.length,
      totalItems: sortedItems.length,
      totalLength: totalLength.toFixed(2)
    });
    
    setSortedData(sortedItems);
  }, [calculatedData]);

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
      { title: 'Position', rowSpan: 2 },
      { title: 'Style', rowSpan: 2 },
      { title: 'Frame', rowSpan: 2 },
      { title: 'Color', rowSpan: 2 },
      { title: 'Painting', rowSpan: 2 }
    ],
    []
  ];

  // Custom row renderer for material cutting data
  const renderMaterialCuttingRow = (row, index) => {
    // Get consistently named properties, defaulting to empty string if not present
    const cuttingID = row.CuttingID || '';
    const piecesID = row.PiecesID || '';
    
    // Get material type and color from material name (e.g., HMST82-02B-WH => HMST82-02B as type, WH as color)
    let materialType = row.MaterialName;
    let colorSuffix = '';
    
    const lastDashIndex = row.MaterialName.lastIndexOf('-');
    if (lastDashIndex !== -1) {
      materialType = row.MaterialName.substring(0, lastDashIndex);
      colorSuffix = row.MaterialName.substring(lastDashIndex + 1);
    }
    
    return (
      <tr key={`${row.MaterialName}_${cuttingID}_${piecesID}_${index}`}>
        <td>{batchNo}</td>
        <td>{row.ID}</td>
        <td>1</td>
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
        <td><strong>{row.Length}</strong></td>
        <td>{row.Angles || 'V'}</td>
        <td>{row.Qty}</td>
        <td>{row.ID}</td>
        <td>{row.Position}</td>
        <td>{row.Style}</td>
        <td>{row.Frame}</td>
        <td>{row.Color}</td>
        <td>{row.Painting || ''}</td>
      </tr>
    );
  };

  // Add a debug section to show optimization metrics if available
  const renderOptimizationMetrics = () => {
    if (!sortedData || sortedData.length === 0) {
      return null;
    }
    
    return (
      <div className="optimization-metrics">
        <div className="metrics-title">
          <ScissorOutlined style={{ marginRight: '8px' }} />
          优化摘要
        </div>
        <div className="metrics-content">
          <div className="metric-item">
            <TagOutlined style={{ marginRight: '8px' }} />
            <span className="metric-label">材料种类:</span>
            <span className="metric-value">{metrics.materialCount}</span>
          </div>
          <div className="metric-item">
            <ScissorOutlined style={{ marginRight: '8px' }} />
            <span className="metric-label">切割组:</span>
            <span className="metric-value">{metrics.cuttingGroupCount}</span>
          </div>
          <div className="metric-item">
            <FileTextOutlined style={{ marginRight: '8px' }} />
            <span className="metric-label">物料项:</span>
            <span className="metric-value">{metrics.totalItems}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">总长度:</span>
            <span className="metric-value">{metrics.totalLength}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="deca-cutting-container">
      {renderOptimizationMetrics()}
      <CommonPrintTable
        title="DECA Cutting"
        headerClass="material-cutting-header"
        tableClass="material-cutting-table"
        columns={columns}
        data={sortedData}
        batchNo={batchNo}
        emptyRowCount={10}
        renderRow={renderMaterialCuttingRow}
        debugTitle="DECA Cutting Data"
      />
    </div>
  );
};

export default PrintMaterialCuttingTable; 