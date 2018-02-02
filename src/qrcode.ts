import * as BitArray from './bit-array';
import { Color, colorToString } from './color';

export interface QRCodeData {
  moduleMatrix: boolean[][];
  version: number;
}

export interface QRCode<T> extends QRCodeData {
  getGraphic: (pixelsPerModule: number, darkColor: Color, lightColor: Color, drawQuietZones: boolean) => T;
}

export class CanvasQRCode implements QRCode<HTMLCanvasElement> {
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
    const size = (this.moduleMatrix.length - (drawQuietZones ? 0 : 8)) * pixelsPerModule;
    const offset = drawQuietZones ? 0 : 4 * pixelsPerModule;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');
      for (let x = 0; x < size + offset; x = x + pixelsPerModule) {
        for (let y = 0; y < size + offset; y = y + pixelsPerModule) {
          const m = this.moduleMatrix[(y + pixelsPerModule) / pixelsPerModule - 1][(x + pixelsPerModule) / pixelsPerModule - 1];
          if (m) {
            ctx.fillStyle = colorToString(darkColor);
            ctx.fillRect(x - offset, y - offset, pixelsPerModule, pixelsPerModule);
          } else {
            ctx.fillStyle = colorToString(lightColor);
            ctx.fillRect(x - offset, y - offset, pixelsPerModule, pixelsPerModule);
          }
        }
      }
      return canvas;
    }
    return null;
  }
}
