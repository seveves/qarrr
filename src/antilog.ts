export interface Antilog {
  exponentAlpha: number;
  value: number;
}

export const galoisField = createAntilogTable();

function createAntilogTable() {
  const gf: Antilog[] = [];

  for (let i = 0; i < 256; i++) {
    let gfItem = Math.pow(2, i) | 0;

    if (i > 7) {
      gfItem = gf[i - 1].value * 2;
    }
    if (gfItem > 255) {
      gfItem = gfItem ^ 285;
    }

    gf.push({ exponentAlpha: i, value: gfItem });
  }

  return gf;
}
