/**
 * WindowCalculator - Handles calculations for window data based on input values
 * This mimics the VBA calculation logic from the original application
 */

import * as windowStyles from './windowStyles';

// Round a number to 3 decimal places
const round = (num) => Math.round(num * 1000) / 1000;

// Round a number to 0 decimal places
const roundInt = (num) => Math.round(num);

class WindowCalculator {
  constructor() {
    this.data = {
      info: [], // General information
      frame: [], // Frame data
      sash: [], // Sash data
      glass: [], // Glass data
      screen: [], // Screen data
      parts: [], // Parts data
      grid: [], // Grid data
      order: [], // Glass order data
      label: [], // Label data
    };
    
    // 调试选项
    this.debug = true; // 设置为true启用日志，设置为false禁用
  }

  // 日志函数
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  // Process a window and generate all required data
  processWindow(windowData) {
    // Reset data before processing
    this.data = {
      info: [],
      frame: [],
      sash: [],
      glass: [],
      screen: [],
      parts: [],
      grid: [],
      order: [],
      label: [],
    };

    // 确保窗口数据有ID
    const id = windowData.ID || 'unknown';
    
    // 记录开始处理窗户的日志
    this.log('\n========================================');
    this.log(`开始处理窗口 ID: ${id}`);
    this.log(`数据: 样式=${windowData.Style}, 尺寸=${windowData.W}x${windowData.H}, 框架=${windowData.Frame}, 玻璃=${windowData.Glass}`);
    this.log('========================================');

    // Write general info
    this.writeInfo(windowData);
    
    // Write label info
    this.writeLabel(windowData);
    
    // Process based on style
    const style = windowData.Style || '';
    
    // 统一分发，样式名中的-替换为_，如XOX-PPP => processXOX_PPP
    const funcName = `process${style.replace(/-/g, '_')}`;
    const processFunc = windowStyles[funcName];
    if (processFunc) {
      processFunc(windowData, this);
    } else {
      this.log(`未知样式: ${style}, 使用默认XO处理`);
      windowStyles.processXO_OX(windowData, this);
    }
    
    // 验证每个表中的数据是否都包含正确的ID
    Object.keys(this.data).forEach(key => {
      const tableData = this.data[key];
      if (tableData.length > 0) {
        const missingIds = tableData.filter(item => !item.ID || item.ID !== id);
        if (missingIds.length > 0) {
          this.log(`警告: ${key}表中有${missingIds.length}条记录ID不正确`);
        }
      }
    });
    
    // 记录处理完成的日志和结果统计
    this.log('----------------------------------------');
    this.log('窗口处理完成，生成的数据：');
    this.log(`信息: ${this.data.info.length}条`);
    this.log(`框架: ${this.data.frame.length}条`);
    this.log(`窗扇: ${this.data.sash.length}条`);
    this.log(`玻璃: ${this.data.glass.length}条`);
    this.log(`纱窗: ${this.data.screen.length}条`);
    this.log(`零件: ${this.data.parts.length}条`);
    this.log(`格条: ${this.data.grid.length}条`);
    this.log(`订单: ${this.data.order.length}条`);
    this.log(`标签: ${this.data.label.length}条`);
    this.log('========================================\n');

    return this.data;
  }

  // Write info data
  writeInfo(data) {
    const infoRow = {
      Customer: data.Customer || '',
      ID: data.ID || '',
      Style: data.Style || '',
      W: data.W || '',
      H: data.H || '',
      FH: data.FH || '',
      Frame: data.Frame || '',
      Glass: data.Glass || '',
      Argon: data.Argon || '',
      Grid: data.Grid || '',
      Color: data.Color || '',
      Note: data.Note || '',
    };
    
    this.data.info.push(infoRow);
    this.log(`写入基本信息 - ID: ${infoRow.ID}, 样式: ${infoRow.Style}, 尺寸: ${infoRow.W}x${infoRow.H}`);
  }

  // Write frame data
  writeFrame(id, style, retroH, retroHQ, retroV, retroVQ, nailonH, nailonHQ, nailonV, nailonVQ, blockH, blockHQ, blockV, blockVQ, color) {
    const frameRow = {
      ID: id,
      Style: style,
      '82-02B-H': retroH,
      '82-02B-H-Pcs': retroHQ,
      '82-02B-V': retroV,
      '82-02B-V-Pcs': retroVQ,
      '82-10-H': nailonH,
      '82-10-H-Pcs': nailonHQ,
      '82-10-V': nailonV,
      '82-10-V-Pcs': nailonVQ,
      '82-01-H': blockH,
      '82-01-H-Pcs': blockHQ,
      '82-01-V': blockV,
      '82-01-V-Pcs': blockVQ,
      Color: color
    };
    
    this.data.frame.push(frameRow);
    
    // 增强日志信息
    let frameType = "";
    if (retroH || retroV) frameType = "Retrofit";
    else if (nailonH || nailonV) frameType = "Nailon";
    else if (blockH || blockV) frameType = "Block";
    
    // 构建详细的日志消息
    this.log(`写入框架数据 - ID: ${id}, 样式: ${style}, 类型: ${frameType}`);
    if (retroH || retroV) this.log(`  Retrofit数据 - 水平: ${retroH || '无'} (${retroHQ || '0'}件), 垂直: ${retroV || '无'} (${retroVQ || '0'}件)`);
    if (nailonH || nailonV) this.log(`  Nailon数据 - 水平: ${nailonH || '无'} (${nailonHQ || '0'}件), 垂直: ${nailonV || '无'} (${nailonVQ || '0'}件)`);
    if (blockH || blockV) this.log(`  Block数据 - 水平: ${blockH || '无'} (${blockHQ || '0'}件), 垂直: ${blockV || '无'} (${blockVQ || '0'}件)`);
  }

  // Write sash data
  writeSash(id, style, sliderH, sliderHQ, sliderV, sliderVQ, handle, handleQ, shH, shHQ, shV, shVQ, color) {
    const sashRow = {
      ID: id,
      Style: style,
      '82-03-H': sliderH,
      '82-03-H-Pcs': sliderHQ,
      '82-03-V': sliderV,
      '82-03-V-Pcs': sliderVQ,
      '82-05': handle,
      '82-05-Pcs': handleQ,
      '82-04-H': shH,
      '82-04-H-Pcs': shHQ,
      '82-04-V': shV,
      '82-04-V-Pcs': shVQ,
      Color: color
    };
    
    this.data.sash.push(sashRow);
    this.log(`写入窗扇数据 - ID: ${id}, 82-03-H: ${sliderH}, 82-05: ${handle}`);
  }

  // Write glass data
  writeGlass(customer, style, w, h, fh, id, line, quantity, glassType, aOrT, width, height, grid, argon) {
    const glassArea = width / 25.4 * height / 25.4 / 144;
    let thickness = '';
    
    if (glassArea <= 21) thickness = '3';
    else if (glassArea > 21 && glassArea <= 26) thickness = '3.9';
    else if (glassArea > 26 && glassArea <= 46) thickness = '4.7';
    
    const glassRow = {
      Customer: customer,
      Style: style,
      W: w,
      H: h,
      FH: fh,
      ID: id,
      line: line,
      quantity: quantity,
      glassType: glassType,
      tempered: aOrT,
      thickness: thickness,
      width: roundInt(width),
      height: roundInt(height),
      grid: grid,
      argon: argon
    };
    
    this.data.glass.push(glassRow);
    this.log(`写入玻璃数据 - ID: ${id}, 行: ${line}, 类型: ${glassType}, 尺寸: ${roundInt(width)}x${roundInt(height)}, 厚度: ${thickness}`);
    
    // If glass needs tempered and certain size thresholds are met, add to order
    if (!aOrT && ((glassArea > 21 && glassArea <= 26) || (glassArea > 26 && glassArea <= 46))) {
      this.writeOrder(customer, style, w, h, fh, id, line, quantity, glassType, "Annealed", width, height);
    }
  }

  // Write glass order data
  writeOrder(customer, style, w, h, fh, id, line, quantity, glassType, aOrT, width, height) {
    const glassArea = width / 25.4 * height / 25.4 / 144;
    let thickness = '';
    
    if (glassArea <= 21) thickness = '3';
    else if (glassArea > 21 && glassArea <= 26) thickness = '3.9';
    else if (glassArea > 26 && glassArea <= 46) thickness = '4.7';
    
    const orderRow = {
      Customer: customer,
      Style: style,
      W: w,
      H: h,
      FH: fh,
      ID: id,
      line: line,
      Quantity: quantity,
      'Glass Type': this.mapGlassType(glassType),
      'Annealed/Tempered': aOrT,
      Thickness: thickness,
      Width: round(width / 25.4),
      Height: round(height / 25.4),
      Notes: customer
    };
    
    this.data.order.push(orderRow);
    this.log(`写入订单数据 - ID: ${id}, 行: ${line}, 玻璃类型: ${this.mapGlassType(glassType)}, 尺寸: ${round(width / 25.4)}x${round(height / 25.4)}`);
  }

  // Map internal glass type to order glass type names
  mapGlassType(type) {
    switch(type) {
      case 'clear': return 'Clear';
      case 'lowe2': return 'Lowe270';
      case 'lowe3': return 'Lowe366';
      case 'OBS': return 'P516';
      default: return type;
    }
  }

  // Write screen data
  writeScreen(customer, id, style, screenH, screenHQ, screenV, screenVQ, color) {
    const screenRow = {
      Customer: customer,
      ID: id,
      Style: style,
      screenSize: screenH,
      screenPcs: screenHQ,
      screenT: screenV,
      screenTPcs: screenVQ,
      Color: color
    };
    
    this.data.screen.push(screenRow);
    this.log(`写入纱窗数据 - ID: ${id}, 尺寸: ${screenH}, 数量: ${screenHQ}, 颜色: ${color}`);
  }

  // Write parts data
  writeParts(id, style, mullion, mullionA, handleA, quantity, track, coverH, coverV, bigMu1, bigMu1Q, bigMu2, bigMu2Q, slop, color) {
    const partsRow = {
      ID: id,
      Style: style,
      mullion: mullion,
      mullionA: mullionA,
      handleA: handleA,
      quantity: quantity,
      track: track,
      coverH: coverH,
      coverV: coverV,
      bigMu1: bigMu1,
      bigMu1Q: bigMu1Q,
      bigMu2: bigMu2,
      bigMu2Q: bigMu2Q,
      slop: slop,
      Color: color
    };
    
    this.data.parts.push(partsRow);
    this.log(`写入零件数据 - ID: ${id}, 中梃: ${mullion}, 轨道: ${track}, 数量: ${quantity}`);
  }

  // Write grid data
  writeGrid(id, style, gridType, sashW, sashWq, holeW1, sashH, sashHq, holeH1, fixW, fixWq, holeW2, fixH, fixHq, holeH2, gridNote, color) {
    const gridRow = {
      ID: id,
      Style: style,
      Grid: gridType,
      sashW: sashW,
      sashWq: sashWq,
      holeW1: holeW1,
      sashH: sashH,
      sashHq: sashHq,
      holeH1: holeH1,
      fixW: fixW,
      fixWq: fixWq,
      holeW2: holeW2,
      fixH: fixH,
      fixHq: fixHq,
      holeH2: holeH2,
      Note: gridNote,
      Color: color
    };
    
    this.data.grid.push(gridRow);
    this.log(`写入格条数据 - ID: ${id}, 类型: ${gridType}, 窗扇: ${sashW}x${sashH}, 固定扇: ${fixW}x${fixH}`);
  }

  // Write label data
  writeLabel(data) {
    const labelRow = {
      Customer: data.Customer || '',
      ID: data.ID || '',
      Style: data.Style || '',
      Size: data.W && data.H ? `${data.W}x${data.H}` : '',
      Frame: data.Frame || '',
      Glass: data.Glass && data.Argon && data.Argon !== 'None' 
        ? `${data.Glass}+${data.Argon}` 
        : data.Glass || '',
      Grid: data.Grid || '',
      PO: data.PO || '',
      BatchNO: data.BatchNO || '',
    };
    
    this.data.label.push(labelRow);
    this.log(`写入标签数据 - ID: ${labelRow.ID}, 尺寸: ${labelRow.Size}, 玻璃: ${labelRow.Glass}`);
  }
}

export default new WindowCalculator(); 