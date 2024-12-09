import FluidCell from "../classes/FluidCell";

export const R_psia_ft3_lb_mol_deg_R = 10.7316;
export const V_ft3 = 1.0;
export const SideLength_ft = 1.0;
const gc = 32.17405;
const Cd = 0.62;


export const linearVelocity_ft_sec = (deltaP, densityLb_ft3) => {
  deltaP = Math.max(deltaP, 5);
  return Cd * Math.sqrt(2*gc * 144 * deltaP / densityLb_ft3);
};

export const getFluidFlowFieldsForAllCellsAndReturnUpdatedFluidCells = (fluidCells, dt_sec, exampleCell=null) => {
  const newCells = [...fluidCells];
  for (let i = 0; i < fluidCells.length; i++) {
    for (let j = 0; j < fluidCells[0].length; j++) {
      const oldCell = fluidCells[i][j];
      const cell = new FluidCell(
        oldCell.gridSize,
        oldCell.id,
        oldCell.color,
        oldCell.x,
        oldCell.y,
        oldCell.radius,
        oldCell.brownian,
        oldCell.mobile,
        oldCell.velocity,
        oldCell.maxVelocity,
        oldCell.pressPsia + 14.6959,
        oldCell.mw,
        oldCell.temperatureDegF
      )
      let numSides = 2;
      const validNeighbors = {
        x: [0],
        y: [0],
      };
      if (cell.x > 0) {
        validNeighbors.x.push(-1);
        numSides += 1;
      }
      if (cell.x < fluidCells.length-1) 
        {
          validNeighbors.x.push(1);
          numSides += 1;
        }
      if (cell.y > 0) {
        validNeighbors.y.push(-1);
        numSides += 1;
      }
      if (cell.y < fluidCells.length-1) {
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
        const otherCellNew = new FluidCell(
          otherCell.gridSize,
          otherCell.id,
          otherCell.color,
          otherCell.x,
          otherCell.y,
          otherCell.radius,
          otherCell.brownian,
          otherCell.mobile,
          otherCell.velocity,
          otherCell.maxVelocity,
          otherCell.pressPsia + 14.6959,
          otherCell.mw,
          otherCell.temperatureDegF
        )
        const massRateLbSec = flowPattern.massRateLbSec;
        const massOutLb = massRateLbSec * dt_sec * scalingFactor;
        cell.massLb -= massOutLb;
        cell.updatePropertiesForFlow();
        otherCellNew.massLb += massOutLb;
        otherCellNew.updatePropertiesForFlow();
        newCells[cell.x + flowPattern.xOffset][cell.y + flowPattern.yOffset] = otherCellNew;
      }
      newCells[i][j] = cell;
    }
  }
  return newCells;
};