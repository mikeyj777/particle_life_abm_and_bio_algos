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