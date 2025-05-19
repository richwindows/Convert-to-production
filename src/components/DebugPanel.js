import React, { useState } from 'react';
import './PrintTable.css';

const DebugPanel = ({ data, title = "调试信息" }) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };
  
  return (
    <div>
      <div className="debug-toggle" onClick={toggleDebug}>
        {showDebug ? '隐藏' : '显示'}{title}
      </div>
      {showDebug && (
        <div className="debug-info">
          {JSON.stringify(data, null, 2)}
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 