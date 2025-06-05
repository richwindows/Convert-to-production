import React from 'react';
import { Input, Button, Dropdown, Menu } from 'antd';
import { PlusOutlined, DeleteOutlined, BgColorsOutlined } from '@ant-design/icons';
import './PrintTable.css';
import { formatSize } from '../utils/formattingUtils';

const PrintLabelTable = ({ batchNo, calculatedData, onCellChange }) => {

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
      // If editing the combined 'Glass' field, we might need special handling 
      // if you intend to update row.Glass and row.Argon separately.
      // For now, assumes direct update to the provided columnKey (e.g., row.Glass_Argon_Combined)
      // Or, if the original data structure has `row.Glass` and `row.PO` as distinct editable fields:
      onCellChange('label', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('label', null, 'ADD_ROW', null);
    }
  };

  const handleRowColorChange = (rowIndex, color) => {
    if (onCellChange) {
      onCellChange('label', rowIndex, 'ROW_COLOR', color);
    }
  };

  const generateBarcode = (batchNo, id) => {
    if (!batchNo || !id) return '';
    const parts = batchNo.split('-');
    if (parts.length < 1) return ''; // Basic check, adjust if batchNo format is strict
    // Simplified barcode generation for example, adjust to your exact needs
    const datePart = parts[0].replace(/\//g, ''); // Assuming first part is date-like
    const formattedId = String(id).padStart(2, '0');
    return `Rich-${datePart}-${formattedId}`;
  };

  const headerTitles = [
    'Customer', 'ID', 'Style', 'Size', 'Frame', 'Glass+Argon', 'Grid', 'P.O', 'Invoice Num. Order Date', 'Barcode'
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

  return (
    <div className="print-container">
      <div className="print-header label-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Label
      </div>
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
      <table className="label-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {headerTitles.map(title => (
              <th key={title} style={cellStyle}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => {
              const barcode = generateBarcode(batchNo, row.ID);
              let sizeDisplay = row.Size || '';
              if (!sizeDisplay && row.W && row.H) {
                sizeDisplay = formatSize(row.W, row.H);
              }
              const glassDisplay = row.Glass ? (row.Argon && row.Argon !== 'None' ? `${row.Glass}+${row.Argon}` : row.Glass) : '';

              return (
                <tr key={index} style={{ backgroundColor: row.rowColor || 'transparent' }}>
                  <td style={{...cellStyle, position: 'relative'}}><Input size="small" style={inputStyle} bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                  <td style={{...cellStyle, position: 'relative'}}>{row.ID}</td>
                  <td style={{...cellStyle, position: 'relative'}}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                  <td style={{...cellStyle, position: 'relative'}} className="label-size-cell">{sizeDisplay}</td>
                  <td style={{...cellStyle, position: 'relative'}}><Input size="small" style={inputStyle} bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                  {/* For simplicity, making the combined display string editable. 
                      If row.Glass and row.Argon need to be updated separately, this needs more complex logic 
                      or two separate input fields mapped to row.Glass and row.Argon respectively.*/}
                  <td style={{...cellStyle, position: 'relative'}}><Input size="small" style={inputStyle} bordered={false} value={glassDisplay} onChange={(e) => handleInputChange(e, index, 'Glass')} /></td>
                  <td style={{...cellStyle, position: 'relative'}}><Input size="small" style={inputStyle} bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                  <td style={{...cellStyle, position: 'relative'}}><Input size="small" style={inputStyle} bordered={false} value={row.PO || row.Note || ''} onChange={(e) => handleInputChange(e, index, 'PO')} /></td>
                  <td style={{...cellStyle, position: 'relative'}}>{batchNo}</td>
                  <td style={{...cellStyle, position: 'relative', overflow: 'visible'}} className="label-barcode-cell">
                    {barcode}
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
                        onClick={() => onCellChange('label', index, 'DELETE_ROW')}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={headerTitles.length} style={{ textAlign: 'center', padding: '20px' }}>
                No Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintLabelTable;