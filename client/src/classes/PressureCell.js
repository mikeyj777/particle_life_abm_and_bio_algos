import { PHYSICAL_CONSTANTS as C, PRESSURE_RANGES } from '../utils/fluidCalcsAndConstants';

class PressureCell {
  static R = C.R;        // Universal gas constant ft-lbf/(lb-mol°R)
  static MW = C.MW;      // Molecular weight lb/lb-mol
  static ATM = C.ATM;    // Atmospheric pressure psia

  constructor(x, y, pressure, temperature) {
    this.x = x;
    this.y = y;
    this.pressure = pressure + C.ATM;  // Convert gauge to absolute pressure
    this.temperature = temperature + 459.67;  // Convert °F to °R
    this.volume = 1.0;  // ft³
    this.mass = this.calculateMass();
    this.baseMass = this.calculateMassAtAtm();
    this.flows = { north: 0, south: 0, east: 0, west: 0 };
    this.pressureChangeRate = 0;
    this.lastPressure = this.pressure;
    this.pressureReversals = 0;
    this.updateColor();
  }

  calculateMass() {
    return (this.pressure * this.volume * C.MW) / (C.R * this.temperature);
  }

  calculateMassAtAtm() {
    return (C.ATM * this.volume * C.MW) / (C.R * this.temperature);
  }

  calculateDensity() {
    return this.mass / this.volume;
  }

  getPressureGauge() {
    return this.pressure - C.ATM;
  }

  get pressPsia() {
    return this.pressure;
  }

  updateColor() {
    const colorStops = [
      { percent: 0, color: {r: 135, g: 206, b: 235} },    // Light blue
      { percent: 25, color: {r: 255, g: 255, b: 0} },     // Yellow
      { percent: 50, color: {r: 0, g: 255, b: 0} },       // Green
      { percent: 75, color: {r: 255, g: 165, b: 0} },     // Orange
      { percent: 100, color: {r: 255, g: 0, b: 0} }       // Red
    ];
    
    // Clamp percentage between 0 and 100
    const percentage = Math.min(100, Math.max(0, 
      (this.getPressureGauge() / PRESSURE_RANGES.MAX) * 100
    ));

    // Find the appropriate color stop indices
    let i = 0;
    while (i < colorStops.length - 2 && percentage > colorStops[i + 1].percent) {
      i++;
    }
    
    const c1 = colorStops[i].color;
    const c2 = colorStops[i + 1].color;
    const range = colorStops[i + 1].percent - colorStops[i].percent;
    const fraction = (percentage - colorStops[i].percent) / range;
    
    this.colorRgb = `rgb(${
      Math.round(c1.r + (c2.r - c1.r) * fraction)}, ${
      Math.round(c1.g + (c2.g - c1.g) * fraction)}, ${
      Math.round(c1.b + (c2.b - c1.b) * fraction)})`;
  }

  calculateFlowTo(neighbor) {
    if (this.pressure <= neighbor.pressure) return 0;

    const deltaP = this.pressure - neighbor.pressure;
    const upstreamDensity = this.calculateDensity();
    const deltaPressure = deltaP * 144; // Convert psi to psf
    
    const velocity = C.C * Math.sqrt(
      (2 * C.GCCONV * deltaPressure) / upstreamDensity
    );
    
    return velocity * upstreamDensity;
  }

  updateMass(massChange) {
    this.mass += massChange;
    const newPressure = (this.mass * C.R * this.temperature) / 
                       (this.volume * C.MW);
    
    this.pressureChangeRate = (newPressure - this.lastPressure) / this.lastPressure;
    if (Math.sign(this.pressureChangeRate) !== Math.sign(this.pressure - this.lastPressure)) {
      this.pressureReversals++;
    }
    
    this.lastPressure = this.pressure;
    this.pressure = newPressure;
    this.updateColor();
  }

  updateTemperature(newTemp) {
    this.temperature = newTemp + 459.67;  // Convert °F to °R
    this.baseMass = this.calculateMassAtAtm();
    this.updateMass(0);  // Recalculate pressure with new temperature
  }

  resetFlows() {
    Object.keys(this.flows).forEach(direction => this.flows[direction] = 0);
  }

  isChangingRapidly(threshold = 0.5) {
    return Math.abs(this.pressureChangeRate) > threshold;
  }

  getDisplayInfo() {
    return {
      pressure: this.getPressureGauge().toFixed(2) + " psig",
      temperature: (this.temperature - 459.67).toFixed(2) + " °F",
      density: this.calculateDensity().toFixed(2) + " lb/ft³",
      flowRate: Object.values(this.flows)
        .reduce((sum, flow) => sum + flow, 0)
        .toFixed(2) + " lb/sec"
    };
  }
}

export default PressureCell;