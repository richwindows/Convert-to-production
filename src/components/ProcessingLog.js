import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import './PrintTable.css';

const { Text, Title } = Typography;

// 封装console.log以捕获日志
const originalConsoleLog = console.log;
let logMessages = [];

// 替换console.log函数
console.log = function(...args) {
  // 调用原始的console.log
  originalConsoleLog.apply(console, args);
  
  // 将日志添加到我们的数组中
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  logMessages.push(message);
  
  // 触发事件，这样React组件可以知道有新的日志
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('newLogMessage', { detail: message });
    window.dispatchEvent(event);
  }
};

const ProcessingLog = () => {
  const [logs, setLogs] = useState([]);
  const logContainerRef = useRef(null);
  
  // 初始化时设置日志数据
  useEffect(() => {
    setLogs([...logMessages]);
    
    // 监听新的日志消息
    const handleNewLog = () => {
      setLogs([...logMessages]);
    };
    
    window.addEventListener('newLogMessage', handleNewLog);
    
    return () => {
      window.removeEventListener('newLogMessage', handleNewLog);
    };
  }, []);
  
  // 当日志更新时，滚动到底部
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  // 清除日志
  const clearLogs = () => {
    logMessages = [];
    setLogs([]);
  };
  
  // 导出日志到文件
  const exportLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'window_processing_log.txt';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  
  return (
    <Card 
      title="窗口处理日志"
      extra={
        <Space>
          <Button onClick={clearLogs}>清除日志</Button>
          <Button onClick={exportLogs} type="primary">导出日志</Button>
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <div 
        ref={logContainerRef}
        style={{ 
          maxHeight: '400px', 
          overflowY: 'auto', 
          fontFamily: 'monospace',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px'
        }}
      >
        {logs.map((log, index) => {
          // 高亮不同类型的日志
          let color = 'black';
          let fontWeight = 'normal';
          
          if (log.includes('========')) {
            color = '#0066cc';
            fontWeight = 'bold';
          } else if (log.includes('错误') || log.includes('未知') || log.includes('警告')) {
            color = '#cc0000';
            fontWeight = 'bold';
          } else if (log.includes('写入')) {
            color = '#006600';
          } else if (log.includes('处理')) {
            color = '#663399';
          } else if (log.includes('ID:') || log.includes('ID：')) {
            color = '#ff6600';
            fontWeight = 'bold';
          }
          
          return (
            <div key={index} style={{ marginBottom: '4px' }}>
              <Text style={{ color, fontWeight }}>{log}</Text>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ProcessingLog; 