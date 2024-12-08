import Agent from './Agent';
import Vector2 from "./Vector2";
import { R_psia_ft3_lb_mol_deg_R, V_ft3, linearVelocity_ft_sec } from "../utils/fluidCalcsAndConstants";

export default class FluidCell extends Agent {
  constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = -1, pressPsig = 100, mw = 30, temperatureDegF=300) {
    super(gridSize, id, color, x, y, radius, brownian, mobile, velocity, maxVelocity);
    this.pressPsia = pressPsig + 14.6959;
    this.temperatureDegR = temperatureDegF + 459.67;
    this.mw = mw;
    this.massLb = this.pressPsia * V_ft3 * this.mw / R_psia_ft3_lb_mol_deg_R / this.temperatureDegR;
    this.densityLb_ft3 = this.massLb / V_ft3;
    this.flowPatterns = [];
    this.baseMassLb = 14.6959 * V_ft3 * this.mw / R_psia_ft3_lb_mol_deg_R / this.temperatureDegR;
    this.color = "#87CEEB";
  }

  getVolRateFt3Sec(deltaP = 0, area=1) {
    return linearVelocity_ft_sec(deltaP, this.densityLb_ft3) * area;
  }

  setHighPressure(pressPsig) {
    this.pressPsia = pressPsig + 14.6959;
    this.massLb = this.pressPsia * V_ft3 * this.mw / R_psia_ft3_lb_mol_deg_R / this.temperatureDegR;
    this.densityLb_ft3 = this.massLb / V_ft3;
  }

  updateTemperature(temperatureDegF) {
    this.temperatureDegR = temperatureDegF + 459.67;
    this.updatePropertiesForFlow();
  }
  
  updatePropertiesForFlow() {
    const lbMoles = this.massLb / this.mw;
    this.pressPsia = (lbMoles * R_psia_ft3_lb_mol_deg_R * this.temperatureDegR) / (V_ft3);
    this.densityLb_ft3 = this.massLb / V_ft3;
  }

  getFlowPatternAndReturnTotalMassRateOut(validNeighbors, currentAgents) {
    // iterate across the adjacent cells.  for any that have a positive pressure difference, calculate the flow pattern
    // the flow pattern is the volumetric rate in ft^3/sec leaving the cell
    const flowPatterns = [];
    let totalMassRate = 0;
    const x = this.x;
    const y = this.y;
    for (const xOffset of validNeighbors.x) {
      for (const yOffset of validNeighbors.y) {
        if (xOffset === 0 && yOffset === 0) continue;
        const otherAgent = currentAgents[x+xOffset][y+yOffset];
        const deltaP = this.pressPsia - otherAgent.pressPsia;
        if (deltaP < 0) continue;
        const volRateFt3Sec = this.getVolRateFt3Sec(deltaP);
        const massRateLbSec = volRateFt3Sec * this.densityLb_ft3;
        totalMassRate += massRateLbSec;
        flowPatterns.push({ xOffset, yOffset, massRateLbSec });
      }
    }
    this.flowPatterns = flowPatterns;
    return totalMassRate;
  }

} 