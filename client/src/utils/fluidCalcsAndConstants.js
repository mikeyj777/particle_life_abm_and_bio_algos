export const R_psia_ft3_lb_mol_deg_R = 10.7316;
export const V_ft3 = 1.0;
export const SideLength_ft = 1.0;
const gc = 32.17405;
const Cd = 0.62;


export const linearVelocity_ft_sec = (pressPsia, densityLb_ft3) => {
  return Cd *Math.sqrt(2*gc * 144 * pressPsia / densityLb_ft3);
};