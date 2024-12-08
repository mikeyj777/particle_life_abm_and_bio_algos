  // Function to generate color distribution
export const generateColors = (numParticles) => {
  const stepsPerChannel = Math.ceil(Math.pow(numParticles, 1/3));
  const stepSize = 255 / (stepsPerChannel - 1);
  const channelValues = Array.from(
    { length: stepsPerChannel },
    (_, i) => Math.round(i * stepSize)
  );
  
  let colors = [];
  for (const r of channelValues) {
    for (const g of channelValues) {
      for (const b of channelValues) {
        colors.push([r, g, b]);
      }
    }
  }
  
  if (colors.length > numParticles) {
    const step = colors.length / numParticles;
    colors = Array.from(
      { length: numParticles },
      (_, i) => colors[Math.floor(i * step)]
    );
  }
  
  const colorsOutput = colors.slice(0, numParticles).map(([r, g, b]) => rgbToHex(r, g, b));

  return colorsOutput;
};

const rgbToHex = (r, g, b) => {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};


export const getPressureColor = (pressure, minPressure, maxPressure) => {
  // Add a small epsilon to prevent division by zero
  const epsilon = 0.0001;
  
  // Ensure we have a valid range
  if (Math.abs(maxPressure - minPressure) < epsilon) {
    return 'rgb(135, 206, 235)'; // Sky blue for zero/equal pressure
  }
  
  // Normalize pressure to 0-1 range
  const normalized = Math.max(0, Math.min(1, (pressure - minPressure) / (maxPressure - minPressure)));
  
  // Use a modified color scheme that ensures visible colors
  // Low pressure: sky blue (135, 206, 235)
  // Medium pressure: light green (144, 238, 144)
  // High pressure: red (255, 99, 71)
  
  let r, g, b;
  
  if (normalized <= 0.5) {
    // Sky blue to light green
    const t = normalized * 2;
    r = Math.round(135 + (144 - 135) * t);
    g = Math.round(206 + (238 - 206) * t);
    b = Math.round(235 + (144 - 235) * t);
  } else {
    // Light green to red
    const t = (normalized - 0.5) * 2;
    r = Math.round(144 + (255 - 144) * t);
    g = Math.round(238 + (99 - 238) * t);
    b = Math.round(144 + (71 - 144) * t);
  }

  const col = `rgb(${r}, ${g}, ${b})`;

  // if (!displayedValue) {
  //   console.log("col: ", col);
  // }
  
  return `rgb(${r}, ${g}, ${b})`;
};