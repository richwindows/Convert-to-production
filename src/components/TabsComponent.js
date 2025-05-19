import React, { useState } from 'react';
import { Tabs, Table, Card } from 'antd';
import './PrintTable.css';

const { TabPane } = Tabs;

const TabsComponent = ({ excelData, batchNo, calculatedData }) => {
  const [activeTab, setActiveTab] = useState('frame');

  // Frame tab columns
  const frameColumns = [
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: '82-02B —', dataIndex: '82-02B-H', key: 'retroH' },
    { title: 'Pcs', dataIndex: '82-02B-H-Pcs', key: 'retroHQ' },
    { title: '82-02B |', dataIndex: '82-02B-V', key: 'retroV' },
    { title: 'Pcs', dataIndex: '82-02B-V-Pcs', key: 'retroVQ' },
    { title: '82-10 —', dataIndex: '82-10-H', key: 'nailonH' },
    { title: 'Pcs', dataIndex: '82-10-H-Pcs', key: 'nailonHQ' },
    { title: '82-10 |', dataIndex: '82-10-V', key: 'nailonV' },
    { title: 'Pcs', dataIndex: '82-10-V-Pcs', key: 'nailonVQ' },
    { title: '82-01 —', dataIndex: '82-01-H', key: 'blockH' },
    { title: 'Pcs', dataIndex: '82-01-H-Pcs', key: 'blockHQ' },
    { title: '82-01 |', dataIndex: '82-01-V', key: 'blockV' },
    { title: 'Pcs', dataIndex: '82-01-V-Pcs', key: 'blockVQ' },
    { title: 'Color', dataIndex: 'Color', key: 'color' },
    { title: 'ID', dataIndex: 'ID', key: 'id2' },
  ];

  // Sash tab columns
  const sashColumns = [
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: '82-03--', dataIndex: '82-03-H', key: 'sliderH' },
    { title: 'Pcs', dataIndex: '82-03-H-Pcs', key: 'sliderHQ' },
    { title: '82-03 |', dataIndex: '82-03-V', key: 'sliderV' },
    { title: 'Pcs', dataIndex: '82-03-V-Pcs', key: 'sliderVQ' },
    { title: '82-05', dataIndex: '82-05', key: 'handle' },
    { title: 'Pcs', dataIndex: '82-05-Pcs', key: 'handleQ' },
    { title: '82-04--', dataIndex: '82-04-H', key: 'shH' },
    { title: 'Pcs', dataIndex: '82-04-H-Pcs', key: 'shHQ' },
    { title: '82-04|', dataIndex: '82-04-V', key: 'shV' },
    { title: 'Pcs', dataIndex: '82-04-V-Pcs', key: 'shVQ' },
    { title: 'Color', dataIndex: 'Color', key: 'color' },
    { title: 'ID', dataIndex: 'ID', key: 'id2' },
  ];

  // Glass tab columns
  const glassColumns = [
    { title: 'Customer', dataIndex: 'Customer', key: 'customer' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: 'W', dataIndex: 'W', key: 'w' },
    { title: 'H', dataIndex: 'H', key: 'h' },
    { title: 'FH', dataIndex: 'FH', key: 'fh' },
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'line #', dataIndex: 'line', key: 'line' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Glass Type', dataIndex: 'glassType', key: 'glassType' },
    { title: 'Tmprd', dataIndex: 'tempered', key: 'tempered' },
    { title: 'Thick', dataIndex: 'thickness', key: 'thickness' },
    { title: 'Width', dataIndex: 'width', key: 'width' },
    { title: 'Height', dataIndex: 'height', key: 'height' },
    { title: 'Grid', dataIndex: 'grid', key: 'grid' },
    { title: 'Argon', dataIndex: 'argon', key: 'argon' },
    { title: 'ID', dataIndex: 'ID', key: 'id2' },
  ];

  // Screen tab columns
  const screenColumns = [
    { title: 'Customer', dataIndex: 'Customer', key: 'customer' },
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: 'Screen', dataIndex: 'screenSize', key: 'screensize' },
    { title: 'pcs', dataIndex: 'screenPcs', key: 'screenpcs' },
    { title: 'Screen T', dataIndex: 'screenT', key: 'screenT' },
    { title: 'pcs', dataIndex: 'screenTPcs', key: 'screenTpcs' },
    { title: 'Color', dataIndex: 'Color', key: 'color' },
    { title: 'ID', dataIndex: 'ID', key: 'id2' },
  ];

  // Parts tab columns
  const partsColumns = [
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: '中框', dataIndex: 'mullion', key: 'mullion' },
    { title: '中铝', dataIndex: 'mullionA', key: 'mullionA' },
    { title: '手铝', dataIndex: 'handleA', key: 'handleA' },
    { title: 'Pcs', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Track', dataIndex: 'track', key: 'track' },
    { title: 'Cover--', dataIndex: 'coverH', key: 'coverH' },
    { title: 'Cover|', dataIndex: 'coverV', key: 'coverV' },
    { title: '大中', dataIndex: 'bigMu1', key: 'bigMu1' },
    { title: 'pcs', dataIndex: 'bigMu1Q', key: 'bigMu1Q' },
    { title: '大中2', dataIndex: 'bigMu2', key: 'bigMu2' },
    { title: 'pcs', dataIndex: 'bigMu2Q', key: 'bigMu2Q' },
    { title: 'Slop', dataIndex: 'slop', key: 'slop' },
    { title: 'Color', dataIndex: 'Color', key: 'color' },
    { title: 'ID', dataIndex: 'ID', key: 'id2' },
  ];

  // Grid tab columns
  const gridColumns = [
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: 'Grid Style', dataIndex: 'Grid', key: 'grid' },
    { title: 'W1', dataIndex: 'sashW', key: 'sashW' },
    { title: 'Pcs', dataIndex: 'sashWq', key: 'sashWq' },
    { title: '一刀', dataIndex: 'holeW1', key: 'holeW1' },
    { title: 'H1', dataIndex: 'sashH', key: 'sashH' },
    { title: 'Pcs', dataIndex: 'sashHq', key: 'sashHq' },
    { title: '一刀', dataIndex: 'holeH1', key: 'holeH1' },
    { title: 'W2', dataIndex: 'fixW', key: 'fixW' },
    { title: 'Pcs', dataIndex: 'fixWq', key: 'fixWq' },
    { title: '一刀', dataIndex: 'holeW2', key: 'holeW2' },
    { title: 'H2', dataIndex: 'fixH', key: 'fixH' },
    { title: 'Pcs', dataIndex: 'fixHq', key: 'fixHq' },
    { title: '一刀', dataIndex: 'holeH2', key: 'holeH2' },
    { title: 'ID', dataIndex: 'ID', key: 'id2' },
    { title: 'Note', dataIndex: 'Note', key: 'note' },
    { title: 'Color', dataIndex: 'Color', key: 'color' },
  ];

  // Order tab columns
  const orderColumns = [
    { title: 'Customer', dataIndex: 'Customer', key: 'customer' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: 'W', dataIndex: 'W', key: 'w' },
    { title: 'H', dataIndex: 'H', key: 'h' },
    { title: 'FH', dataIndex: 'FH', key: 'fh' },
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'line #', dataIndex: 'line', key: 'line' },
    { title: 'Quantity', dataIndex: 'Quantity', key: 'quantity' },
    { title: 'Glass Type', dataIndex: 'Glass Type', key: 'glassType' },
    { title: 'A/T', dataIndex: 'Annealed/Tempered', key: 'annealed' },
    { title: 'Thick', dataIndex: 'Thickness', key: 'thickness' },
    { title: 'Width', dataIndex: 'Width', key: 'width' },
    { title: 'Height', dataIndex: 'Height', key: 'height' },
    { title: 'Notes', dataIndex: 'Notes', key: 'notes' },
  ];

  // Label tab columns
  const labelColumns = [
    { title: 'Customer', dataIndex: 'Customer', key: 'customer' },
    { title: 'ID', dataIndex: 'ID', key: 'id' },
    { title: 'Style', dataIndex: 'Style', key: 'style' },
    { title: 'Size', dataIndex: 'Size', key: 'size' },
    { title: 'Frame', dataIndex: 'Frame', key: 'frame' },
    { title: 'Glass', dataIndex: 'Glass', key: 'glass' },
    { title: 'Grid', dataIndex: 'Grid', key: 'grid' },
    { title: 'P.O', dataIndex: 'PO', key: 'po' },
    { title: 'Batch NO.', dataIndex: 'BatchNO', key: 'batchNo' },
    { title: 'ID', dataIndex: 'ID', key: 'id2' },
  ];

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <TabPane tab="Frame" key="frame">
        <Table 
          dataSource={calculatedData?.frame || []} 
          columns={frameColumns} 
          rowKey={(record, index) => `frame-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
      <TabPane tab="Sash" key="sash">
        <Table 
          dataSource={calculatedData?.sash || []} 
          columns={sashColumns} 
          rowKey={(record, index) => `sash-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
      <TabPane tab="Glass" key="glass">
        <Table 
          dataSource={calculatedData?.glass || []} 
          columns={glassColumns} 
          rowKey={(record, index) => `glass-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
      <TabPane tab="Screen" key="screen">
        <Table 
          dataSource={calculatedData?.screen || []} 
          columns={screenColumns} 
          rowKey={(record, index) => `screen-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
      <TabPane tab="Parts" key="parts">
        <Table 
          dataSource={calculatedData?.parts || []} 
          columns={partsColumns} 
          rowKey={(record, index) => `parts-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
      <TabPane tab="Grid" key="grid">
        <Table 
          dataSource={calculatedData?.grid || []} 
          columns={gridColumns}
          rowKey={(record, index) => `grid-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
      <TabPane tab="Glass Order" key="order">
        <Table 
          dataSource={calculatedData?.order || []} 
          columns={orderColumns} 
          rowKey={(record, index) => `order-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
      <TabPane tab="Label" key="label">
        <Table 
          dataSource={calculatedData?.label || []} 
          columns={labelColumns} 
          rowKey={(record, index) => `label-${index}`}
          pagination={false}
          bordered 
        />
      </TabPane>
    </Tabs>
  );
};

export default TabsComponent; 