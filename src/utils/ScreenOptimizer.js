/**
 * ScreenOptimizer - Utility for optimizing screen material cutting
 * Material length is fixed at 5900mm
 */

const MATERIAL_LENGTH = 5800; // Fixed material length in mm
const CUT_LOSS = 0; // Cutting loss per cut in mm
const ALLOWANCE = 0; // Safety allowance in mm

/**
 * Optimizes screen cutting to minimize waste
 * @param {Array} screenData - Array of screen items with screenSize and screenPcs
 * @returns {Array} Optimized screen data with cutting IDs
 */
export const optimizeScreenCutting = (screenData) => {
  if (!screenData || screenData.length === 0) {
    return [];
  }

  // Prepare pieces for optimization
  const pieces = [];
  screenData.forEach((item, index) => {
    const screenSize = parseFloat(item.screenSize) || 0;
    const screenPcs = parseInt(item.screenPcs) || 1;
    
    if (screenSize > 0) {
      // Create individual pieces for each quantity
      for (let i = 0; i < screenPcs; i++) {
        pieces.push({
          originalIndex: index,
          length: screenSize,
          originalItem: item,
          pieceId: `${index}-${i}`
        });
      }
    }
  });

  // Sort pieces by length (descending) for better optimization
  pieces.sort((a, b) => b.length - a.length);

  // Group pieces into cutting groups
  const cuttingGroups = [];
  const usedPieces = new Set();

  pieces.forEach(piece => {
    if (usedPieces.has(piece.pieceId)) return;

    const group = findBestCuttingGroup(pieces, piece, usedPieces);
    if (group.length > 0) {
      cuttingGroups.push(group);
      group.forEach(p => usedPieces.add(p.pieceId));
    }
  });

  // Assign cutting IDs and calculate metrics
  const optimizedData = screenData.map(item => ({ ...item }));
  
  cuttingGroups.forEach((group, groupIndex) => {
    const cuttingId = groupIndex + 1;
    const totalLength = group.reduce((sum, piece) => sum + piece.length, 0);
    const totalCutLoss = (group.length - 1) * CUT_LOSS; // No cut loss for single piece
    const usedLength = totalLength + totalCutLoss;
    const wasteLength = MATERIAL_LENGTH - usedLength - ALLOWANCE;
    const efficiency = ((usedLength / MATERIAL_LENGTH) * 100).toFixed(1);

    // Group pieces by original item
    const itemGroups = {};
    group.forEach(piece => {
      const originalIndex = piece.originalIndex;
      if (!itemGroups[originalIndex]) {
        itemGroups[originalIndex] = [];
      }
      itemGroups[originalIndex].push(piece);
    });

    // Update original items with cutting information
    Object.keys(itemGroups).forEach(originalIndex => {
      const idx = parseInt(originalIndex);
      const piecesInGroup = itemGroups[originalIndex].length;
      
      optimizedData[idx] = {
        ...optimizedData[idx],
        cuttingId: cuttingId,
        piecesInGroup: piecesInGroup,
        totalPiecesInCuttingGroup: group.length,
        materialUsed: usedLength,
        wasteLength: wasteLength,
        efficiency: efficiency,
        groupTotalLength: totalLength,
        groupCutLoss: totalCutLoss
      };
    });
  });

  return optimizedData;
};

/**
 * Finds the best cutting group starting with a given piece
 * @param {Array} allPieces - All available pieces
 * @param {Object} startPiece - The piece to start the group with
 * @param {Set} usedPieces - Set of already used piece IDs
 * @returns {Array} Best fitting group of pieces
 */
const findBestCuttingGroup = (allPieces, startPiece, usedPieces) => {
  const maxUsableLength = MATERIAL_LENGTH - ALLOWANCE;
  const group = [startPiece];
  let currentLength = startPiece.length;

  // Try to add more pieces to the group
  const availablePieces = allPieces.filter(piece => 
    !usedPieces.has(piece.pieceId) && piece.pieceId !== startPiece.pieceId
  );

  // Sort by length descending for greedy approach
  availablePieces.sort((a, b) => b.length - a.length);

  for (const piece of availablePieces) {
    const lengthWithCut = currentLength + piece.length + CUT_LOSS;
    
    if (lengthWithCut <= maxUsableLength) {
      group.push(piece);
      currentLength = lengthWithCut;
    }
  }

  return group;
};

/**
 * Calculates optimization summary statistics
 * @param {Array} optimizedData - Optimized screen data
 * @returns {Object} Summary statistics
 */
export const calculateOptimizationSummary = (optimizedData) => {
  const cuttingGroups = new Set();
  let totalPieces = 0;
  let totalMaterialUsed = 0;
  let totalWaste = 0;

  optimizedData.forEach(item => {
    if (item.cuttingId) {
      cuttingGroups.add(item.cuttingId);
      totalPieces += parseInt(item.screenPcs) || 0;
    }
  });

  // Calculate totals from unique cutting groups
  const groupMetrics = {};
  optimizedData.forEach(item => {
    if (item.cuttingId && !groupMetrics[item.cuttingId]) {
      groupMetrics[item.cuttingId] = {
        materialUsed: item.materialUsed || 0,
        wasteLength: item.wasteLength || 0
      };
      totalMaterialUsed += item.materialUsed || 0;
      totalWaste += item.wasteLength || 0;
    }
  });

  const totalMaterials = cuttingGroups.size;
  const averageEfficiency = totalMaterials > 0 ? 
    ((totalMaterialUsed / (totalMaterials * MATERIAL_LENGTH)) * 100).toFixed(1) : 0;

  return {
    totalMaterials,
    totalPieces,
    totalMaterialUsed: totalMaterialUsed.toFixed(0),
    totalWaste: totalWaste.toFixed(0),
    averageEfficiency: `${averageEfficiency}%`,
    materialLength: MATERIAL_LENGTH
  };
};

/**
 * Generates a detailed cutting plan
 * @param {Array} optimizedData - Optimized screen data
 * @returns {Array} Detailed cutting plan by material
 */
export const generateCuttingPlan = (optimizedData) => {
  const cuttingPlan = {};

  optimizedData.forEach(item => {
    if (item.cuttingId) {
      const cuttingId = item.cuttingId;
      if (!cuttingPlan[cuttingId]) {
        cuttingPlan[cuttingId] = {
          cuttingId,
          pieces: [],
          totalLength: 0,
          wasteLength: item.wasteLength || 0,
          efficiency: item.efficiency || '0%',
          materialUsed: item.materialUsed || 0
        };
      }

      const screenPcs = parseInt(item.screenPcs) || 1;
      for (let i = 0; i < screenPcs; i++) {
        cuttingPlan[cuttingId].pieces.push({
          id: item.ID,
          customer: item.Customer,
          style: item.Style,
          length: parseFloat(item.screenSize) || 0,
          pieceNumber: i + 1
        });
      }
    }
  });

  return Object.values(cuttingPlan).sort((a, b) => a.cuttingId - b.cuttingId);
};

const ScreenOptimizer = {
  optimizeScreenCutting,
  calculateOptimizationSummary,
  generateCuttingPlan,
  MATERIAL_LENGTH,
  CUT_LOSS,
  ALLOWANCE
};

export default ScreenOptimizer;