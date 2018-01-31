import * as BitArray from './bit-array';

export class QRCode {
  moduleMatrix: boolean[][];

  constructor(public version: number) {
    const modulesPerSide = 21 + (version - 1) * 4;
    this.moduleMatrix = [];
    for (let i = 0; i < modulesPerSide; i++) {
      this.moduleMatrix.push(BitArray.init(modulesPerSide));
    }
  }
}
