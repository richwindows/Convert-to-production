import React from 'react';
import './PrintTable.css';
import DebugPanel from './DebugPanel';

// 通用打印表格组件
const CommonPrintTable = ({ 
  title, // 表格标题
  headerClass, // 表格头部CSS类 (will be unused for title rendering now)
  tableClass, // 表格CSS类
  columns, // 列定义
  data, // 数据
  batchNo, // 批次号
  emptyRowCount = 8, // 空行数
  renderRow, // 自定义行渲染函数
  debugTitle // 调试标题
}) => {
  // Determine the colspan for the caption based on the last header row
  const captionColSpan = Array.isArray(columns) && columns.length > 0 && Array.isArray(columns[columns.length - 1]) 
    ? columns[columns.length - 1].reduce((acc, col) => acc + (col.colSpan || 1), 0)
    : 1;

  return (
    <div className="print-container">
      <DebugPanel data={data} title={debugTitle || `${title}数据`} />
      
      <table className={`${tableClass} bordered-print-table`}>
        <caption className="table-print-title">{title}</caption>
        <thead>
          {Array.isArray(columns) && columns.map((headerRow, rowIndex) => (
            <tr key={`header-row-${rowIndex}`}>
              {headerRow.map((col, colIndex) => (
                <th 
                  key={`header-${rowIndex}-${colIndex}`}
                  rowSpan={col.rowSpan || 1}
                  colSpan={col.colSpan || 1}
                  className={col.className || ''}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, index) => renderRow ? renderRow(row, index, batchNo) : (
              <tr key={index}>
                <td>{index + 1}</td>
                {/* 这里需要根据具体表格结构进行自定义，所以最好使用renderRow函数 */}
              </tr>
            ))
          ) : (
            <tr>
              {/* 生成空单元格 */}
              {Array.isArray(columns) && columns[columns.length - 1].map((_, colIndex) => (
                <td key={`empty-cell-${colIndex}`}>{colIndex === 0 ? batchNo : ''}</td>
              ))}
            </tr>
          )}
          
          {/* 添加额外的空行 */}
          {data && data.length > 0 && data.length < emptyRowCount &&
            [...Array(emptyRowCount - data.length)].map((_, index) => (
              <tr key={`empty-row-${index}`}>
                {/* 生成空单元格 */}
                {Array.isArray(columns) && columns[columns.length - 1].map((_, colIndex) => (
                  <td key={`empty-cell-${index}-${colIndex}`}></td>
                ))}
              </tr>
            ))
          }
          
          {/* 如果没有数据，添加空行 */}
          {(!data || data.length === 0) && 
            [...Array(emptyRowCount - 1)].map((_, index) => (
              <tr key={`empty-row-${index}`}>
                {/* 生成空单元格 */}
                {Array.isArray(columns) && columns[columns.length - 1].map((_, colIndex) => (
                  <td key={`empty-cell-${index}-${colIndex}`}></td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default CommonPrintTable; 