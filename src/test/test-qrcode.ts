import { QRCode, QRCodeData } from '../qrcode';
import { Color, colorToString } from '../color';
import * as BitArray from '../bit-array';

export class TestQRCode implements QRCode<QRCodeData> {
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

  public getGraphic(pixelsPerModule: number, darkColor: Color, lightColor: Color, drawQuietZones = true) {
    return { moduleMatrix: this.moduleMatrix, version: this.version };
  }
}
