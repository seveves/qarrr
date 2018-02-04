import { QRCode } from './qrcode';
import { ECCLevel } from './enums';
import { Rectangle, Point } from './models';
import * as utils from './utils';
import * as Format from './format';
import * as BitArray from './bit-array';
import * as MaskPattern from './mask-pattern';

export function addQuietZone<T>(qrCode: QRCode<T>): void {
  const quietLine = BitArray.init(qrCode.moduleMatrix.length + 8);
  for (let i = 0; i < 4; i++) {
    qrCode.moduleMatrix = [quietLine, ...qrCode.moduleMatrix];
  }
  for (let i = 0; i < 4; i++) {
    qrCode.moduleMatrix.push(quietLine);
  }
  for (let i = 4; i < qrCode.moduleMatrix.length - 4; i++) {
    const quietPart = BitArray.init(4);
    quietPart.push(...qrCode.moduleMatrix[i], ...quietPart);
    qrCode.moduleMatrix[i] = quietPart;
  }
}

export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

export function placeVersion<T>(qrCode: QRCode<T>, versionStr: string): void {
  const length = qrCode.moduleMatrix.length;
  const vStr = reverseString(versionStr);
  for (let i = 0; i < 6; i++) {
    for (let k = 0; k < 3; k++) {
      qrCode.moduleMatrix[k + length - 11][i] = vStr[i * 3 + k] === '1';
      qrCode.moduleMatrix[i][k + length - 11] = vStr[i * 3 + k] === '1';
    }
  }
}

export function placeFormat<T>(qrCode: QRCode<T>, formatStr: string): void {
  const length = qrCode.moduleMatrix.length;
  const fStr = reverseString(formatStr);
  const modules = [
    [8, 0, length - 1, 8],
    [8, 1, length - 2, 8],
    [8, 2, length - 3, 8],
    [8, 3, length - 4, 8],
    [8, 4, length - 5, 8],
    [8, 5, length - 6, 8],
    [8, 7, length - 7, 8],
    [8, 8, length - 8, 8],
    [7, 8, 8, length - 7],
    [5, 8, 8, length - 6],
    [4, 8, 8, length - 5],
    [3, 8, 8, length - 4],
    [2, 8, 8, length - 3],
    [1, 8, 8, length - 2],
    [0, 8, 8, length - 1],
  ];
    
  for (let i = 0; i < 15; i++) {
    const p1 = { x: modules[i][0], y: modules[i][1] };
    const p2 = { x: modules[i][2], y: modules[i][3] };
    qrCode.moduleMatrix[p1.y][p1.x] = fStr[i] === '1';
    qrCode.moduleMatrix[p2.y][p2.x] = fStr[i] === '1';
  }
}

export function maskCode<T>(qrCode: QRCode<T>, factory: (version: number) => QRCode<T>, version: number, blockedModules: any[], ecc: ECCLevel) {
  let patternName = '';
  let patternScore = 0;
  const length = qrCode.moduleMatrix.length;

  for (const pName in MaskPattern.patterns) {
    if (MaskPattern.patterns.hasOwnProperty(pName)) {
      const pattern = MaskPattern.patterns[pName];
      const qrTemp = factory(version);
      for (let y = 0; y < length; y++) {
        for (let x = 0; x < length; x++) {
          qrTemp.moduleMatrix[y][x] = qrCode.moduleMatrix[y][x];
        }
      }

      const formatStr = Format.getFormatString(ecc, (+(pName.substr(7, 1))) - 1);
      placeFormat(qrTemp, formatStr);
      if (version >= 7) {
        const versionString = Format.getVersionString(version);
        placeVersion(qrTemp, versionString);
      }

      for (let x = 0; x < length; x++) {
        for (let y = 0; y < length; y++) {
          if (!isBlocked({ x, y, width: 1,  height: 1 } as Rectangle, blockedModules)) {
            const bPattern: boolean = pattern(x, y);
            const mPattern = qrTemp.moduleMatrix[y][x];
            qrTemp.moduleMatrix[y][x] = utils.bxor(mPattern, bPattern);
          }
        }
      }

      const score = MaskPattern.score(qrTemp);
      if (!patternName || patternScore > score) {
        patternName = pName;
        patternScore = score;
      }
    }
  }

  const patternMethod = MaskPattern.patterns[patternName];
  for (let x = 0; x < length; x++) {
    for (let y = 0; y < length; y++) {
      if (!isBlocked({ x, y, width: 1, height: 1 } as Rectangle, blockedModules)) {
        qrCode.moduleMatrix[y][x] = utils.bxor(qrCode.moduleMatrix[y][x], patternMethod(x, y));
      }
    }
  }

  return (+patternName.substr(patternName.length - 1, 1)) - 1;
}

export function isBlocked(r1: Rectangle, blockedModules: Rectangle[]): boolean {
  let isBlocked = false;
  blockedModules.forEach((blockedMod) => {
    if (intersects(blockedMod, r1)) {
      isBlocked = true;
    }
  });
  return isBlocked;
}

export function intersects(r1: Rectangle, r2: Rectangle): boolean {
  return r2.x < r1.x + r1.width &&
         r1.x < r2.x + r2.width &&
         r2.y < r1.y + r1.height &&
         r1.y < r2.y + r2.height;
}

export function placeDataWords<T>(qrCode: QRCode<T>, data: string, blockedModules: Rectangle[]): void {
  const length = qrCode.moduleMatrix.length;
  let up = true;
  const datawords: boolean[] = [];
  for (let i = 0; i < data.length; i++) {
    datawords.push(data[i] !== '0');
  }
  for (let x = length - 1; x >= 0; x = x - 2) {
    if (x === 6) {
      x = 5;
    }
    for (let yMod = 1; yMod <= length; yMod++) {
      let y: number;
      if (up) {
        y = length - yMod;
        if (datawords.length > 0 && !isBlocked({ x, y, width: 1,  height: 1 } as Rectangle, blockedModules)) {
          qrCode.moduleMatrix[y][x] = datawords.shift();
        }
        if (datawords.length > 0 && x > 0 && !isBlocked({ y, x: x - 1, width: 1, height: 1 } as Rectangle, blockedModules)) {
          qrCode.moduleMatrix[y][x - 1] = datawords.shift();
        }
      } else {
        y = yMod - 1;
        if (datawords.length > 0 && !isBlocked({ x, y, width: 1, height: 1 } as Rectangle, blockedModules)) {
          qrCode.moduleMatrix[y][x] = datawords.shift();
        }
        if (datawords.length > 0 && x > 0 && !isBlocked({ y, x: x - 1, width: 1, height: 1 } as Rectangle, blockedModules)) {
          qrCode.moduleMatrix[y][x - 1] = datawords.shift();
        }
      }
    }
    up = !up;
  }
}

export function reserveSeperatorAreas(length: number, blockedModules: Rectangle[]): void {
  blockedModules.push(
    { x: 7, y: 0, width: 1, height: 8 },
    { x: 0, y: 7, width: 7, height: 1 },
    { x: 0, y: length - 8, width: 8, height: 1 },
    { x: 7, y: length - 7, width: 1, height: 7 },
    { x: length - 8, y: 0, width: 1, height: 8 },
    { x: length - 7, y: 7, width: 7, height: 1 },
  );
}

export function reserveVersionAreas(length: number, version: number, blockedModules: Rectangle[]): void {
  blockedModules.push(
    { x: 8, y: 0, width: 1, height: 6 },
    { x: 8, y: 7, width: 1, height: 1 },
    { x: 0, y: 8, width: 6, height: 1 },
    { x: 7, y: 8, width: 2, height: 1 },
    { x: length - 8, y: 8, width: 8, height: 1 },
    { x: 8, y: length - 7, width: 1, height: 7 },
  );

  if (version >= 7) {
    blockedModules.push(
      { x: length - 11, y: 0, width: 3, height: 6 },
      { x: 0, y: length - 11, width: 6, height: 3 },
    );
  }
}

export function placeDarkModule<T>(qrCode: QRCode<T>, version: number, blockedModules: Rectangle[]): void {
  qrCode.moduleMatrix[4 * version + 9][8] = true;
  blockedModules.push({ x: 8, y: 4 * version + 9, width: 1, height: 1 });
}

export function placeFinderPatterns<T>(qrCode: QRCode<T>, blockedModules: Rectangle[]): void {
  const length = qrCode.moduleMatrix.length;
  const locations = [0, 0, length - 7, 0, 0, length - 7];

  for (let i = 0; i < 6; i = i + 2) {
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        if (!(((x === 1 || x === 5) && y > 0 && y < 6) || (x > 0 && x < 6 && (y === 1 || y === 5)))) {
          qrCode.moduleMatrix[y + locations[i + 1]][x + locations[i]] = true;
        }
      }
    }
    blockedModules.push({ x: locations[i], y: locations[i + 1], width: 7, height: 7 });
  }
}

export function placeAlignmentPatterns<T>(qrCode: QRCode<T>, alignmentPatternLocations: Point[], blockedModules: Rectangle[]) {
  alignmentPatternLocations.forEach((loc) => {
    const alignmentPatternRect: Rectangle = { x: loc.x, y: loc.y, width: 5, height: 5 };
    let blocked = false;
    blockedModules.some((blockedRect) => {
      if (intersects(alignmentPatternRect, blockedRect)) {
        blocked = true;
        return true;
      }
      return false;
    });
    if (!blocked) {
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          if (y === 0 || y === 4 || x === 0 || x === 4 || (x === 2 && y === 2)) {
            qrCode.moduleMatrix[loc.y + y][loc.x + x] = true;
          }
        }
      }
      blockedModules.push({ x: loc.x, y: loc.y, width: 5, height: 5 });
    }
  });
}

export function placeTimingPatterns<T>(qrCode: QRCode<T>, blockedModules: Rectangle[]): void {
  const length = qrCode.moduleMatrix.length;
  for (let i = 8; i < length - 8; i++) {
    if (i % 2 === 0) {
      qrCode.moduleMatrix[6][i] = true;
      qrCode.moduleMatrix[i][6] = true;
    }
  }
  blockedModules.push(
    { x: 6, y: 8, width: 1, height: length - 16 },
    { x: 8, y: 6, width: length - 16, height: 1 },
  );
}
