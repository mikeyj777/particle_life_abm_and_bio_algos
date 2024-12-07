import Agent from 'Agent';
import Vector2 from "./Vector2";

class FluidCell extends Agent {
  constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = -1, pressPsia = 100, mw = 30, temperatureDegF=300) {
    super(gridSize, id, color, x, y, radius, brownian, mobile, velocity, maxVelocity);
    this.pressPsia = pressPsia;
    this.temperatureDegF = temperatureDegF;
    this.temperatureDegR = this.temperatureDegF + 459.67;
    this.mw = mw;
    this.mass = this.pressure * V_ft3 * this.mw / R_psia_ft3_lb_mol_deg_R / this.temperatureDegR;
  }

  calculateMass() {
    
  }

} 