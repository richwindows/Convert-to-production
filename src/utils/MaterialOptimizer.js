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
 * Optimizes cutting groups to minimize waste based on new logic.
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
        // Add a unique index to each piece within its original group for stable processing if needed later
        // piece.originalPieceIndex = acc[key].length; 
        acc[key].push({...piece}); // Store a copy to avoid modifying original input objects directly
        return acc;
    }, {});

    for (const materialName in piecesByMaterial) {
        let piecesForCurrentMaterial = piecesByMaterial[materialName];
        let materialSpecificCuttingId = 1; // CuttingID 在同一个 MaterialName 内是连续的，从1开始

        // 2. 在每个 MaterialName 组内，按 Qty 分组
        const piecesByQty = piecesForCurrentMaterial.reduce((acc, piece) => {
            const key = parseInt(piece.Qty) || 1; // Ensure Qty is a number, default to 1
            if (!acc[key]) acc[key] = [];
            acc[key].push(piece);
            return acc;
        }, {});

        const sortedQtys = Object.keys(piecesByQty).map(Number).sort((a, b) => a - b);

        for (const qty of sortedQtys) {
            let piecesForCurrentQty = [...piecesByQty[qty]]; // Mutable copy for this Qty group
            // 按长度降序排序，优先切割长的，有助于优化填充
            piecesForCurrentQty.sort((a, b) => parseFloat(b.Length) - parseFloat(a.Length));

            while (piecesForCurrentQty.length > 0) {
                let currentRawMaterialPieces = [];
                let currentRawMaterialLengthUsed = 0;
                const allowance = 6;
                const cutLoss = 4;
                const maxLengthForCutting = materialStandardLength - allowance;
                let piecesIdCounter = 1;

                // 3. 贪心填充当前原材料 (尝试放入尽可能多的件)
                for (let i = 0; i < piecesForCurrentQty.length; i++) {
                    const pieceToConsider = piecesForCurrentQty[i];
                    const pieceLength = parseFloat(pieceToConsider.Length);

                    if (currentRawMaterialLengthUsed + pieceLength + cutLoss <= maxLengthForCutting) {
                        currentRawMaterialPieces.push({
                            ...pieceToConsider,
                            'Cutting ID': materialSpecificCuttingId,
                            'CuttingID': materialSpecificCuttingId,
                            'Pieces ID': piecesIdCounter,
                            'PiecesID': piecesIdCounter,
                        });
                        currentRawMaterialLengthUsed += pieceLength + cutLoss;
                        piecesIdCounter++;
                        piecesForCurrentQty.splice(i, 1); // 从待处理列表中移除
                        i--; // Adjust index due to splice
                    }
                }

                if (currentRawMaterialPieces.length > 0) {
                    const totalPieceLengthInGroup = currentRawMaterialPieces.reduce((sum, p) => sum + parseFloat(p.Length), 0);
                    // 修正：cutloss应该是cut count的倍数
                    const totalCutLossInGroup = currentRawMaterialPieces.length * cutLoss; // 这行是正确的
                    const actualLengthUsedOnRaw = totalPieceLengthInGroup + totalCutLossInGroup;
                    const remainingOnRaw = materialStandardLength - actualLengthUsedOnRaw - allowance;
                    
                    currentRawMaterialPieces.forEach(p => {
                        p.actualLength = actualLengthUsedOnRaw;
                        p.RemainingLength = remainingOnRaw;
                        p.UsableRemainingLength = remainingOnRaw; 
                        p.cutCount = currentRawMaterialPieces.length; // cut count = 件数
                        p.CutCount = currentRawMaterialPieces.length;
                        p.cutLoss = totalCutLossInGroup; // 总cutloss = cut count * 4
                        p.CutLoss = totalCutLossInGroup;
                    });

                    allOptimizedPieces.push(...currentRawMaterialPieces);
                    materialSpecificCuttingId++; // 当前原材料用完，为该材料准备下一个 CuttingID
                } else if (piecesForCurrentQty.length > 0) {
                    // If no pieces could be added to a new raw material (e.g., all remaining pieces are too long)
                    // Handle the first unprocessable piece by giving it its own cutting ID.
                    const unprocessablePiece = piecesForCurrentQty.shift(); // Take the first (longest) one
                    const pieceLength = parseFloat(unprocessablePiece.Length);
                    const actualLengthWithLoss = pieceLength + cutLoss;

                    allOptimizedPieces.push({
                        ...unprocessablePiece,
                        'Cutting ID': materialSpecificCuttingId,
                        'CuttingID': materialSpecificCuttingId,
                        'Pieces ID': 1,
                        'PiecesID': 1,
                        'actualLength': actualLengthWithLoss,
                        'RemainingLength': materialStandardLength - actualLengthWithLoss - allowance,
                        'UsableRemainingLength': materialStandardLength - actualLengthWithLoss - allowance,
                        'cutCount': 1,
                        'CutCount': 1,
                        'cutLoss': cutLoss,
                        'CutLoss': cutLoss,
                    });
                    materialSpecificCuttingId++;
                }
            } // End while (piecesForCurrentQty.length > 0)
        } // End for (const qty of sortedQtys)
    } // End for (const materialName in piecesByMaterial)

    return allOptimizedPieces;
};

const materialOptimizerUtils = {
    getMaterialLength,
    optimizeCuttingGroups
};

export default materialOptimizerUtils;