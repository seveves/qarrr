export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export const colorToString = (c: Color) => c.a ? `rgba(${c.r},${c.g},${c.b},${c.a})` : `rgb(${c.r},${c.g},${c.b})`;
