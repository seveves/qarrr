import * as BitArray from './bit-array';
import { Color, colorToString } from './color';

export interface QRCodeData {
  qrCode: QRCode;
  pixelsPerModule: number;
  darkColor: Color;
  lightColor: Color;
  drawQuietZones: boolean;
}

export class QRCode {
  moduleMatrix: boolean[][];
  version: number;

  constructor(version: number) {
    this.version = version;
    const modulesPerSide = 21 + (version - 1) * 4;
    this.moduleMatrix = [];
    for (let i = 0; i < modulesPerSide; i++) {
      this.moduleMatrix.push(BitArray.init(modulesPerSide));
    }
  }
}
