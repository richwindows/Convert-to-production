/**
 * WindowCalculator - Handles calculations for window data based on input values
 * This mimics the VBA calculation logic from the original application
 */

import * as windowStyles from './windowStyles';
import { getMaterialLength, optimizeCuttingGroups } from './MaterialOptimizer';
import { getMappedStyle } from './DataMapper'; // 导入样式映射函数
import { formatSize } from './formattingUtils'; // Import the new utility

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
      sashWelding: [], // Added for sash welding data
      materialCutting: [] // Added for material cutting data
    };
    
    // 调试选项
    this.debug = true; // 设置为true启用日志，设置为false禁用
    
    // Store optimized materials by material type - No longer used directly for storing final state
    // this.optimizedMaterials = {}; 
  }

  resetData() { // New method to explicitly reset
    this.data = {
      info: [], frame: [], sash: [], glass: [], screen: [], parts: [], grid: [], order: [], label: [],
      sashWelding: [], // Added for sash welding data
      materialCutting: [] // Added for material cutting data
    };
    // this.optimizedMaterials = {}; // No longer needed
    this.log("Calculator data reset.");
  }

  // 日志函数
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  standardizeGlassType(originalGlassType) {
    if (!originalGlassType || typeof originalGlassType !== 'string' || originalGlassType.trim() === '') {
      return { type: '', tempered: 'Annealed' };
    }

    let typeStr = originalGlassType.trim();
    let isTempered = false;

    // Detect and temporarily remove "TP" and associated junk, set tempered flag
    // Handles complex suffixes like ", B-TP", ", X-TP" and simple " TP"
    // Order matters: check for complex suffix first.
    const complexTpSuffixPattern = /(?:,\s*[A-Z]-)?\s*TP$/i; // e.g., ", B-TP" or " TP"
    const simpleTpSuffixPattern = /\sTP$/i; // e.g., " TP"

    if (complexTpSuffixPattern.test(typeStr)) {
        isTempered = true;
        typeStr = typeStr.replace(complexTpSuffixPattern, '').trim();
    } else if (simpleTpSuffixPattern.test(typeStr)) {
        isTempered = true;
        typeStr = typeStr.replace(simpleTpSuffixPattern, '').trim();
    }
    // typeStr is now base type, e.g., "CL/LE3, B-", "OBS/le2"

    // Clean up remaining non-TP related junk like ", B-", ", X-" that might not have been part of TP suffix
    // This regex targets a comma, optional space, ANY single uppercase letter, then a hyphen.
    typeStr = typeStr.replace(/,\s*[A-Z]-/g, '').trim();

    // Standardize components
    let components = typeStr.split('/');
    let standardizedComponents = components.map(comp => {
        const cTrimmed = comp.trim();
        const cUpper = cTrimmed.toUpperCase();
        if (cUpper === 'CL') return 'cl';
        if (cUpper === 'LE2') return 'le2';
        if (cUpper === 'LE3') return 'le3';
        if (cUpper === 'OBS') return 'OBS';
        return cTrimmed; // Return original trimmed component if not matched (e.g. "P516")
    }).filter(c => c.length > 0); // Filter out empty components

    let finalTypeString = standardizedComponents.join('/');

    // Append " TP" back to the type string if it was originally tempered
    if (isTempered) {
        if (finalTypeString.length > 0) {
            if (!finalTypeString.endsWith(' TP')) { // Avoid "type TP TP"
                 finalTypeString += ' TP';
            }
        } else {
            // If all components were junk and only TP was valid (e.g. input was just ", B-TP")
            // This case should ideally result in an empty type or specific "TP only" type if that's valid.
            // Based on the list "cl/cl TP", TP is always with a base type.
            // If finalTypeString is empty here, it means no valid base type was found.
            // For now, if no base type, don't just make it "TP". It will be empty, and status "Tempered".
            // Or, if an empty base type with TP is invalid, clear isTempered.
            // Given AddItem list, an empty base with TP is not listed. So, an empty type is fine.
            // If finalTypeString is empty, it remains empty. " TP" is not appended to an empty string.
        }
    }
    
    const finalTemperedStatus = isTempered ? 'Tempered' : 'Annealed';

    this.log(`Standardized glass: Original='${originalGlassType}', Standardized='${finalTypeString}', Tempered='${finalTemperedStatus}'`);
    return { type: finalTypeString, tempered: finalTemperedStatus };
  }

  writeSashWeldingEntry(data) {
    const originalSashW_str = data.sashw;
    const originalSashH_str = data.sashh;

    const id = data.ID; // This is the displaySequentialId
    const originalCustomer = data.Customer || ''; // Use original customer value
    const originalStyle = data.Style || '';

    // Helper to append ID, ensuring baseValue is treated as a string
    const appendId = (baseValue, idToAppend) => {
      const base = baseValue || ''; // Default to empty string if baseValue is null/undefined
      return base + "--" + idToAppend;
    };

    // Style still gets --ID appended
    const styleWithId = appendId(originalStyle, id);

    // Count occurrences of 'X' (case-insensitive) in the originalStyle string for Pcs calculation
    let PcsCount = (originalStyle.match(/x/gi) || []).length;
    const finalPcs = PcsCount > 0 ? PcsCount : 1;

    const originalSashW_numeric = parseFloat(originalSashW_str) || 0;
    const originalSashH_numeric = parseFloat(originalSashH_str) || 0;

    let weldingCutW = '';
    if (originalSashW_numeric > 0) {
      weldingCutW = (((originalSashW_numeric * 25.4) - 6) / 25.4).toFixed(2);
    }

    let weldingCutH = '';
    if (originalSashH_numeric > 0) {
      weldingCutH = (((originalSashH_numeric * 25.4) - 6) / 25.4).toFixed(2);
    }

    let displaySashW_numeric, displaySashH_numeric;
    if (originalSashW_numeric >= originalSashH_numeric) {
      displaySashW_numeric = originalSashW_numeric;
      displaySashH_numeric = originalSashH_numeric;
    } else {
      displaySashW_numeric = originalSashH_numeric;
      displaySashH_numeric = originalSashW_numeric;
    }

    const weldingEntry = {
      ID: id,
      Customer: originalCustomer, // Use original customer value directly
      Style: styleWithId,       // Style with --ID appended
      SashW: displaySashW_numeric.toFixed(3),
      SashH: displaySashH_numeric.toFixed(3),
      WeldingCutW: weldingCutW,
      WeldingCutH: weldingCutH,
      Pcs: finalPcs
    };
    this.data.sashWelding.push(weldingEntry);
    this.log(`写入窗扇焊接数据 - ID: ${id}, Customer: ${originalCustomer}, Style: ${styleWithId}, 显示窗扇 WxH: ${displaySashW_numeric.toFixed(3)}x${displaySashH_numeric.toFixed(3)}, 焊接切割 WxH: ${weldingCutW}x${weldingCutH}, Pcs: ${finalPcs}`);
  }

  // Process a window and generate all required data
  processWindow(windowData) {
    // DO NOT Reset data here anymore
    // this.data = { ... }; 

    // windowData.ID is now the sequential display ID from App.js
    // windowData.originalId is the stable underlying ID from Excel/manual add
    const displaySequentialId = windowData.ID; 
    const originalStableId = windowData.originalId || displaySequentialId; // Fallback if originalId is somehow missing

    // 记录开始处理窗户的日志
    this.log('\n========================================');
    this.log(`开始处理窗口 DisplayID: ${displaySequentialId} (OriginalID: ${originalStableId})`);
    this.log(`数据: 样式=${windowData.Style}, 尺寸=${windowData.W}x${windowData.H}, 框架=${windowData.Frame}, 玻璃=${windowData.Glass}`);
    this.log('========================================');

    // Write general info
    this.writeInfo(windowData);
    
    // Write label info
    this.writeLabel(windowData);

    console.log('windowData', windowData);
    
    // Process based on style
    const style = windowData.Style || '';
    
    // 使用DataMapper中的样式映射
    const mappedStyle = getMappedStyle(style);
    const funcName = `process${mappedStyle}`;
    const processFunc = windowStyles[funcName];
    if (processFunc) {
      processFunc(windowData, this);
    } else {
      this.log(`错误：未知样式: ${style}，映射后: ${mappedStyle}，无法处理。请检查输入数据或添加对应的处理函数。`);
    }
    
    // 验证每个表中的数据是否都包含正确的ID
    Object.keys(this.data).forEach(key => {
      const tableData = this.data[key];
      if (tableData.length > 0) {
        const missingIds = tableData.filter(item => !item.ID || item.ID !== displaySequentialId);
        if (missingIds.length > 0) {
          this.log(`警告: ${key}表中有${missingIds.length}条记录ID不正确 (expected displaySequentialId: ${displaySequentialId})`);
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

    return this.data; // This still returns the cumulative data, but processWindow is called for its side effect of appending
  }

  getAllData() { // Ensure this method exists
    return this.data;
  }

  // Write info data
  writeInfo(data) {
    const infoRow = {
      Customer: data.Customer || '',
      ID: data.ID, // This IS the sequential display ID from App.js
      originalId: data.originalId, // Preserve original for reference if needed
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
      ID: id, // This is the sequential display ID
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
    
    // Process material cutting data based on frame data
    this.processRawMaterialPieces(frameRow);
    
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

  // New method to ONLY collect raw pieces from frameData
  processRawMaterialPieces(frameData) {
    const id = frameData.ID;
    const style = frameData.Style;
    const color = frameData.Color || '';
    const frameMaterialMap = {
      '82-01-H': { name: 'HMST82-01', position: 'TOP+BOT', angles: 'V' }, '82-01-V': { name: 'HMST82-01', position: 'LEFT+RIGHT', angles: 'V' },
      '82-02B-H': { name: 'HMST82-02B', position: 'TOP+BOT', angles: 'V' }, '82-02B-V': { name: 'HMST82-02B', position: 'LEFT+RIGHT', angles: 'V' },
      '82-10-H': { name: 'HMST82-10', position: 'TOP+BOT', angles: 'V' }, '82-10-V': { name: 'HMST82-10', position: 'LEFT+RIGHT', angles: 'V' }
    };
    
    Object.entries(frameMaterialMap).forEach(([key, materialInfo]) => {
      if (frameData[key] && frameData[key] !== '' && frameData[`${key}-Pcs`] && frameData[`${key}-Pcs`] !== '') {
        let frameType = '';
        if (key.includes('82-01')) frameType = 'Block-stop';
        else if (key.includes('82-02B')) frameType = 'Retrofit';
        else if (key.includes('82-10')) frameType = 'Nailon';
        let colorSuffix = "";
        const colorLower = color.toLowerCase();
        if (!color || colorLower === "" || colorLower.includes("white") || colorLower.includes("wh")) colorSuffix = "-WH";
        else if (colorLower.includes("almond") || colorLower.includes("al")) colorSuffix = "-AL";
        else if (colorLower.includes("painting")) colorSuffix = "-WH";
        const materialNameWithColor = materialInfo.name + colorSuffix;
        const materialPiece = {
          ID: id, OrderNo: id, OrderItem: 1, MaterialName: materialNameWithColor,
          Length: frameData[key], Angles: materialInfo.angles, Qty: frameData[`${key}-Pcs`],
          BinNo: id, Position: materialInfo.position, Style: style, Frame: frameType,
          Color: color, Painting: colorLower.includes("painting") ? "Yes" : ""
        };
        this.data.materialCutting.push(materialPiece); // Add raw piece to be optimized later
        this.log(`收集材料片段 (待优化) - ID: ${id}, 材料: ${materialNameWithColor}, 长度: ${frameData[key]}`);
      }
    });
  }
  
  // Asynchronously optimize material pieces and update data - THIS FUNCTION IS NOW REMOVED / OBSOLETE
  // async optimizeMaterialPieces(materialName, pieces) { ... }

  // New method to finalize material cutting after all windows are processed
  async finalizeMaterialCutting() {
    this.log('开始最终化材料切割数据...');
    if (!this.data.materialCutting || this.data.materialCutting.length === 0) {
      this.log('没有材料切割数据需要处理。');
      return;
    }

    const allRawPieces = [...this.data.materialCutting]; // Copy of current raw pieces
    this.data.materialCutting = []; // Clear current materialCutting, will be repopulated with optimized pieces

    // Group pieces by MaterialName
    const piecesByMaterial = allRawPieces.reduce((acc, piece) => {
      const key = piece.MaterialName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(piece);
      return acc;
    }, {});

    this.log(`材料按名称分组: ${Object.keys(piecesByMaterial).length} 种材料`);

    const optimizedMaterialCuttingData = [];

    for (const materialName in piecesByMaterial) {
      if (Object.hasOwnProperty.call(piecesByMaterial, materialName)) {
        const piecesForMaterial = piecesByMaterial[materialName];
        this.log(`正在处理材料: ${materialName}, 共有 ${piecesForMaterial.length} 个原始片段`);

        try {
          // Fetch the standard length for this material
          const materialStandardLength = await getMaterialLength(materialName);
          this.log(`获取到材料 ${materialName} 的标准长度: ${materialStandardLength}`);

          if (typeof materialStandardLength !== 'number' || materialStandardLength <= 0) {
            this.log(`警告: 材料 ${materialName} 的标准长度无效 (${materialStandardLength}). 跳过此材料的优化.`);
            // Optionally, push raw pieces back if optimization is skipped, or handle as error
            // For now, we'll assume optimizer can handle it or pieces are just not added if length is invalid.
            // Or, we can push them unoptimized:
            // optimizedMaterialCuttingData.push(...piecesForMaterial.map(p => ({...p, CuttingID: '', PiecesID: '', RemainingLength: ''})));
            console.warn(`Standard length for ${materialName} is invalid: ${materialStandardLength}. Skipping optimization for this material.`);
            // Add pieces back without optimization attempt if length is invalid
            optimizedMaterialCuttingData.push(...piecesForMaterial.map(p => ({
              ...p,
              CuttingID: '', // Explicitly blank
              PiecesID: '',  // Explicitly blank
              StockLength: 0,
              TotalCutLength: 0,
              RemainingLength: 0,
              Wastage: 0,
              CutCount: 0
            })));
            continue; 
          }

          // Optimize the pieces for the current material
          const optimizedPieces = optimizeCuttingGroups(piecesForMaterial, materialStandardLength);
          this.log(`材料 ${materialName} 的优化结果: ${optimizedPieces.length} 个切割片段`);
          optimizedMaterialCuttingData.push(...optimizedPieces);
        } catch (error) {
          this.log(`处理材料 ${materialName} 时发生错误: ${error}`);
          console.error(`Error optimizing material ${materialName}:`, error);
          // If an error occurs, add the original pieces for this material back without optimization
          // to ensure data isn't lost, but mark them as unoptimized.
          optimizedMaterialCuttingData.push(...piecesForMaterial.map(p => ({
            ...p,
            CuttingID: 'ERROR', // Mark as error
            PiecesID: 'ERROR',
            Notes: `Optimization failed: ${error.message}`,
            StockLength: 0,
            TotalCutLength: 0,
            RemainingLength: 0,
            Wastage: 0,
            CutCount: 0
          })));
        }
      }
    }

    this.data.materialCutting = optimizedMaterialCuttingData;
    this.log('材料切割数据最终化完成。');
    this.log(`最终材料切割数据条目数: ${this.data.materialCutting.length}`);
    // Log the final optimized data to the console for inspection
    console.log('Finalized materialCutting data in WindowCalculator:', JSON.stringify(this.data.materialCutting, null, 2));
  }

  // Write sash data
  writeSash(id, style, sliderH, sliderHQ, sliderV, sliderVQ, handle, handleQ, shH, shHQ, shV, shVQ, color) {
    const sashRow = {
      ID: id, // This is the sequential display ID
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
  writeGlass(customer, style, w, h, fh, id, line, quantity, rawGlassType, incomingAorT, width, height, grid, argon, overrideThickness) {
    const { type: finalGlassString } = this.standardizeGlassType(rawGlassType);
    
    const glassArea = parseFloat(width) / 25.4 * parseFloat(height) / 25.4 / 144;
    let calculatedThickness = '';

    if (overrideThickness === undefined || overrideThickness === null || overrideThickness === '') {
      // Calculate thickness based on area only if not overridden
      if (glassArea <= 21) calculatedThickness = '3';
      else if (glassArea > 21 && glassArea <= 26) calculatedThickness = '3.9';
      else if (glassArea > 26 && glassArea <= 46) calculatedThickness = '4.7';
    } else {
      calculatedThickness = String(overrideThickness);
    }
    
    const glassRow = {
      Customer: customer,
      Style: style,
      W: w,
      H: h,
      FH: fh,
      ID: id, 
      line: line,
      quantity: quantity,
      glassType: finalGlassString,
      thickness: calculatedThickness, // Use determined thickness
      width: roundInt(width),
      height: roundInt(height),
      grid: grid,
      argon: argon
    };
    
    // 只使用incomingAorT参数来确定钢化状态
    if (incomingAorT === "T") {
      glassRow.tmprd = "T";
      // 添加Tmprd字段（首字母大写），确保在表格中正确显示
      glassRow.Tmprd = "T";
    }
    
    this.data.glass.push(glassRow);
    this.log(`写入玻璃数据 - ID: ${id}, 行: ${line}, 类型: ${finalGlassString}, 尺寸: ${roundInt(width)}x${roundInt(height)}, 厚度: ${calculatedThickness}${incomingAorT === "T" ? ", 钢化标记: T" : ""}`);
    
    // 检查面积来决定是否需要添加到订单
    const needsOrder = (glassArea > 21 && glassArea <= 26) || (glassArea > 26 && glassArea <= 46);
    if (needsOrder) {
      // 传递钢化状态到writeOrder方法
      this.writeOrder(customer, style, w, h, fh, id, line, quantity, rawGlassType, incomingAorT, width, height, calculatedThickness); 
    }
  }

  // Write glass order data
  writeOrder(customer, style, w, h, fh, id, line, quantity, rawGlassType, incomingAorT, width, height, overrideThickness) {
    const { type: finalGlassString } = this.standardizeGlassType(rawGlassType);
    
    let calculatedThickness = '';
    if (overrideThickness === undefined || overrideThickness === null || overrideThickness === '') {
      const glassArea = parseFloat(width) / 25.4 * parseFloat(height) / 25.4 / 144;
      if (glassArea <= 21) calculatedThickness = '3';
      else if (glassArea > 21 && glassArea <= 26) calculatedThickness = '3.9';
      else if (glassArea > 26 && glassArea <= 46) calculatedThickness = '4.7';
    } else {
      calculatedThickness = String(overrideThickness);
    }

    const orderRow = {
      Customer: customer,
      Style: style,
      W: w,
      H: h,
      FH: fh,
      ID: id, 
      line: line, // Corrected from 'Line' to 'line' if data uses 'line' consistently
      Quantity: quantity,
      'Glass Type': finalGlassString,
      'Annealed/Tempered': incomingAorT === "Tempered" || incomingAorT === "T" ? "Tempered" : "Annealed",
      Thickness: calculatedThickness, // Use determined thickness
      Width: round(width / 25.4),
      Height: round(height / 25.4),
      Notes: customer // Or other relevant notes
    };
    
   
    
    this.data.order.push(orderRow);
    this.log(`写入订单数据 - ID: ${id}, 行: ${line}, 类型: ${finalGlassString}, 回火: ${incomingAorT === "Tempered" ? "Tempered" : "Annealed"}, 尺寸: ${orderRow.Width}x${orderRow.Height}${incomingAorT === "Tempered" ? ", 钢化标记: T" : ""}`);
  }

  // Map internal glass type to order glass type names
  // This function is now OBSOLETE if standardizeGlassType produces the final display strings.
  // mapGlassType(type) {
  //   switch(type) {
  //     case 'clear': return 'Clear';
  //     case 'lowe2': return 'Lowe270';
  //     case 'lowe3': return 'Lowe366';
  //     case 'OBS': return 'P516';
  //     default: return type;
  //   }
  // }

  // Write screen data
  writeScreen(customer, id, style, screenH, screenHQ, screenV, screenVQ, color) {
    const screenRow = {
      Customer: customer,
      ID: id, // This is the sequential display ID
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
      ID: id, // This is the sequential display ID
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
      ID: id, // This is the sequential display ID
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
      ID: data.ID, // This IS the sequential display ID from App.js
      originalId: data.originalId, // Preserve original for reference if needed
      Style: data.Style || '',
      Size: formatSize(data.W, data.H), // Use formatSize here
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

export default WindowCalculator;