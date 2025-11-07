/**
 * MaterialOptimizer - Functions for optimizing material cutting
 */

/**
 * Fetches material length from the configuration file
 * @param {string} materialName - The name of the material (e.g., HMST82-01-WH)
 * @returns {Promise<number>} The standard length of the material
 */
export const getMaterialLength = async (materialName) => {
    try {
        const response = await fetch('/config/materials.json');
        const data = await response.json();
        const baseId = materialName.split('-').slice(0, 2).join('-'); // Extract base ID without color suffix
        const material = data.materials.find(m => baseId === m.id || materialName.startsWith(m.id));
        
        if (!material) {
            // console.warn(`未找到材料 ${materialName} 的配置，使用默认长度233`);
            return 232; // Default to 233 if material not found
        }
        return material.length;
    } catch (error) {
        // console.error('获取材料长度失败:', error);
        // Default value in case of errors
        return 232;
    }
};

/**
 * Determines the cut loss based on material name.
 * @param {string} materialName - The name of the material.
 * @returns {number} The cut loss value.
 */
const getCutLoss = (materialName) => {
    if (materialName.includes('HMST82-02B')) {
        return 3.7;
    } else if (materialName.includes('HMST82-01')) {
        return 0.5;
    } else if (materialName.includes('HMST82-10')) {
        return 2;
    }
    return 4; // Default cut loss
};

/**
 * Optimizes cutting groups to minimize waste based on improved logic.
 * @param {Array} piecesInput - Array of pieces to optimize.
 * @param {number} materialStandardLength - The standard length of the material.
 * @returns {Array} Optimized pieces with cutting group assignments.
 */
export const optimizeCuttingGroups = (piecesInput, materialStandardLength) => {
    if (!piecesInput || piecesInput.length === 0) {
        return [];
    }

    const allOptimizedPieces = [];

    // 1. 按材料名称分组 (MaterialName)
    const piecesByMaterial = piecesInput.reduce((acc, piece) => {
        const key = piece.MaterialName;
        if (!acc[key]) acc[key] = [];
        acc[key].push({...piece});
        return acc;
    }, {});

    for (const materialName in piecesByMaterial) {
        let piecesForCurrentMaterial = piecesByMaterial[materialName];
        let materialSpecificCuttingId = 1; // 每种材料的CuttingID从1开始
        const cutLoss = getCutLoss(materialName);

        // 2. 在每个 MaterialName 组内，按 Qty 分组
        const piecesByQty = piecesForCurrentMaterial.reduce((acc, piece) => {
            const key = parseInt(piece.Qty) || 1;
            if (!acc[key]) acc[key] = [];
            acc[key].push(piece);
            return acc;
        }, {});

        const sortedQtys = Object.keys(piecesByQty).map(Number).sort((a, b) => a - b);

        for (const qty of sortedQtys) {
            let piecesForCurrentQty = [...piecesByQty[qty]];
            // 按长度降序排序，优先处理长件
            piecesForCurrentQty.sort((a, b) => parseFloat(b.Length) - parseFloat(a.Length));

            // 使用改进的贪心算法
            while (piecesForCurrentQty.length > 0) {
                const group = findBestFitGroup(piecesForCurrentQty, materialStandardLength, cutLoss);
                
                if (group.length > 0) {
                    const allowance = 6;
                    let piecesIdCounter = 1;
                    
                    const totalPieceLengthInGroup = group.reduce((sum, p) => sum + parseFloat(p.Length), 0);
                    const totalCutLossInGroup = group.length * cutLoss;
                    const actualLengthUsedOnRaw = totalPieceLengthInGroup + totalCutLossInGroup;
                    const remainingOnRaw = materialStandardLength - actualLengthUsedOnRaw - allowance;
                    
                    // 为组内每个件分配ID
                    group.forEach(piece => {
                        allOptimizedPieces.push({
                            ...piece,
                            'Cutting ID': materialSpecificCuttingId,
                            'CuttingID': materialSpecificCuttingId,
                            'Pieces ID': piecesIdCounter,
                            'PiecesID': piecesIdCounter,
                            actualLength: actualLengthUsedOnRaw,
                            RemainingLength: remainingOnRaw,
                            UsableRemainingLength: remainingOnRaw,
                            cutCount: group.length,
                            CutCount: group.length,
                            cutLoss: totalCutLossInGroup,
                            CutLoss: totalCutLossInGroup,
                        });
                        piecesIdCounter++;
                    });
                    
                    // 从待处理列表中移除已处理的件
                    group.forEach(usedPiece => {
                        const index = piecesForCurrentQty.findIndex(p => 
                            p === usedPiece // 直接比较对象引用
                        );
                        if (index !== -1) {
                            piecesForCurrentQty.splice(index, 1);
                        }
                    });
                    
                    materialSpecificCuttingId++; // 下一个切割组
                } else {
                    // 如果无法找到合适的组合，单独处理第一个件
                    const piece = piecesForCurrentQty.shift();
                    const allowance = 1;
                    const pieceLength = parseFloat(piece.Length);
                    const actualLengthWithLoss = pieceLength + cutLoss;
                    
                    allOptimizedPieces.push({
                        ...piece,
                        'Cutting ID': materialSpecificCuttingId,
                        'CuttingID': materialSpecificCuttingId,
                        'Pieces ID': 1,
                        'PiecesID': 1,
                        actualLength: actualLengthWithLoss,
                        RemainingLength: materialStandardLength - actualLengthWithLoss - allowance,
                        UsableRemainingLength: materialStandardLength - actualLengthWithLoss - allowance,
                        cutCount: 1,
                        CutCount: 1,
                        cutLoss: cutLoss,
                        CutLoss: cutLoss,
                    });
                    
                    materialSpecificCuttingId++;
                }
            }
        }
    }

    return allOptimizedPieces;
};

/**
 * 找到最佳拟合组合（改进的贪心算法）
 * @param {Array} pieces - 可选择的件
 * @param {number} materialLength - 原材料长度
 * @param {number} cutLoss - 切割损耗
 * @returns {Array} 最佳组合
 */
function findBestFitGroup(pieces, materialLength, cutLoss) {
    const allowance = 6;
    const maxUsableLength = materialLength - allowance;
    
    let bestGroup = [];
    let bestUtilization = 0;
    
    // 尝试不同的组合策略
    for (let startIndex = 0; startIndex < pieces.length; startIndex++) {
        const currentGroup = [];
        let currentLength = 0;
        const availablePieces = [...pieces];
        
        // 从startIndex开始贪心选择
        for (let i = startIndex; i < availablePieces.length; i++) {
            const piece = availablePieces[i];
            const pieceLength = parseFloat(piece.Length);
            const lengthWithCut = pieceLength + cutLoss;
            
            if (currentLength + lengthWithCut <= maxUsableLength) {
                currentGroup.push(piece);
                currentLength += lengthWithCut;
                availablePieces.splice(i, 1);
                i--; // 调整索引
            }
        }
        
        // 计算利用率
        const utilization = currentLength / maxUsableLength;
        
        // 选择利用率最高的组合
        if (utilization > bestUtilization) {
            bestUtilization = utilization;
            bestGroup = currentGroup;
        }
        
        // 如果利用率已经很高，提前结束
        if (utilization > 0.95) {
            break;
        }
    }
    
    return bestGroup;
}

// 移除复杂的动态规划函数，保持简单有效的算法
const materialOptimizerUtils = {
    getMaterialLength,
    optimizeCuttingGroups
};

export default materialOptimizerUtils;