import Agent from './Agent';
import Vector2 from "./Vector2";
import { R_psia_ft3_lb_mol_deg_R, V_ft3, linearVelocity_ft_sec } from "../utils/fluidCalcsAndConstants";

export default class FluidCell extends Agent {
  constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = -1, pressPsig = 100, mw = 30, temperatureDegF=300) {
    super(gridSize, id, color, x, y, radius, brownian, mobile, velocity, maxVelocity);
    this.pressPsia = pressPsig + 14.959;
    this.temperatureDegR = this.temperatureDegF + 459.67;
    this.mw = mw;
    this.mass = this.pressure * V_ft3 * this.mw / R_psia_ft3_lb_mol_deg_R / this.temperatureDegR;
    this.densityLb_ft3 = this.mass / V_ft3;
  }

  getVelocity(area = 1) {
    return linearVelocity_ft_sec(this.pressPsia, this.densityLb_ft3) * area;
  }

} 