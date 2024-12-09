import FluidCell from "../classes/FluidCell";

export const R_psia_ft3_lb_mol_deg_R = 10.7316;
export const V_ft3 = 1.0;
export const SideLength_ft = 1.0;
const gc = 32.17405;
const Cd = 0.62;

export const PHYSICAL_CONSTANTS = {
  C: 0.62,       // Discharge coefficient
  g: 32.174,       // Gravitational acceleration (ft/sec²)
  R: 1545.349,   // Universal gas constant ft-lbf/(lb-mol°R)
  MW: 30,        // Molecular weight lb/lb-mol
  ATM: 14.7,     // Atmospheric pressure psia
  GCCONV: 32.174 // Conversion factor gc (lb-ft)/(lbf-sec²)
};

export const GRID_SIZE = 20;

export const PRESSURE_RANGES = {
  MIN: 0,
  MAX: 300
};

export const linearVelocity_ft_sec = (deltaP, densityLb_ft3) => {
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

export const calculateFiniteVolumeFlow = (cells, dt) => {
  const newCells = cells.map(row => [...row]);
  const fluxes = cells.map(row => row.map(() => ({ x: 0, y: 0 })));
  
  // First pass: calculate all fluxes
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[0].length; j++) {
      const cell = cells[i][j];
      
      // Check right neighbor
      if (j < cells[0].length - 1) {
        const rightCell = cells[i][j + 1];
        const deltaP = cell.pressPsia - rightCell.pressPsia;
        const avgDensity = (cell.densityLb_ft3 + rightCell.densityLb_ft3) / 2;
        const flux = calculateFlux(deltaP, avgDensity);
        fluxes[i][j].x = flux;
        fluxes[i][j + 1].x = -flux;
      }
      
      // Check bottom neighbor
      if (i < cells.length - 1) {
        const bottomCell = cells[i + 1][j];
        const deltaP = cell.pressPsia - bottomCell.pressPsia;
        const avgDensity = (cell.densityLb_ft3 + bottomCell.densityLb_ft3) / 2;
        const flux = calculateFlux(deltaP, avgDensity);
        fluxes[i][j].y = flux;
        fluxes[i + 1][j].y = -flux;
      }
    }
  }
  
  // Second pass: update cells based on net fluxes
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[0].length; j++) {
      const oldCell = cells[i][j];
      const netFlux = fluxes[i][j].x + fluxes[i][j].y;
      const massChange = netFlux * dt;
      
      const newCell = new FluidCell(
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
        oldCell.pressPsia - 14.6959,
        oldCell.mw,
        oldCell.temperatureDegF
      );
      
      newCell.massLb = oldCell.massLb - massChange;
      newCell.updatePropertiesForFlow();
      newCells[i][j] = newCell;
    }
  }
  
  return newCells;
};

const calculateFlux = (deltaP, avgDensity) => {
  // Using your existing velocity calculation but with averaged density
  const velocity = linearVelocity_ft_sec(Math.abs(deltaP), avgDensity);
  return Math.sign(deltaP) * velocity * avgDensity;
};