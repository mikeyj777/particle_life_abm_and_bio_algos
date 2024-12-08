export const R_psia_ft3_lb_mol_deg_R = 10.7316;
export const V_ft3 = 1.0;
export const SideLength_ft = 1.0;
const gc = 32.17405;
const Cd = 0.62;


export const linearVelocity_ft_sec = (pressPsia, densityLb_ft3) => {
  return Cd *Math.sqrt(2*gc * 144 * pressPsia / densityLb_ft3);
};

export const getFluidFlowFieldsForAllCellsAndReturnUpdatedFluidCells = (fluidCells, dt_sec) => {
  for (let i = 0; i < fluidCells.length; i++) {
    for (let j = 0; j < fluidCells[0].length; j++) {
      const cell = fluidCells[i][j];
      let numSides = 2;
      const validNeighbors = {
        x: [0],
        y: [0],
      };
      if (cell.x > 0) {
        validNeighbors.x.push(-1);
        numSides += 1;
      }
      if (cell.x < GRID_SIZE-1) 
        {
          validNeighbors.x.push(1);
          numSides += 1;
        }
      if (cell.y > 0) {
        validNeighbors.y.push(-1);
        numSides += 1;
      }
      if (cell.y < GRID_SIZE-1) {
        validNeighbors.y.push(1);
        numSides += 1;
      }
      const totalMassRateOutLbSec = cell.getFlowPatternAndReturnTotalMassRateOut(validNeighbors, fluidCells);
      const massAvailableLb = cell.massLb - cell.baseMassLb;
      let totMassOut = 0
      for (const flowPattern of cell.flowPatterns) {
        const massRateLbSec = flowPattern.massRateLbSec;
        const massOutLb = massRateLbSec * dt_sec;
        totMassOut += massOutLb;
      }
      let scalingFactor = 1;
      if (totMassOut > massAvailableLb) scalingFactor = massAvailableLb / totMassOut;
      for (const flowPattern of cell.flowPatterns) {
        if (flowPattern.xOffset === 0 && flowPattern.yOffset === 0) continue;
        const otherCell = fluidCells[cell.x + flowPattern.xOffset][cell.y + flowPattern.yOffset];
        const massRateLbSec = flowPattern.massRateLbSec;
        const massOutLb = massRateLbSec * dt_sec * scalingFactor;
        cell.mass -= massOutLb;
        cell.updatePropertiesForFlow();
        otherCell.mass += massOutLb;
        otherCell.updatePropertiesForFlow();
      }
    }
  }
  return currentAgents;
};