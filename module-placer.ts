import { QRCode } from './qrcode';
import { ECCLevel } from './enums';
import { Rectangle } from './models';
import * as utils from './utils';
import * as Format from './format';
import * as BitArray from './bit-array';
import * as MaskPattern from './mask-pattern';

export function addQuietZone(qrCode: QRCode): void {
  const quietLine = BitArray.init(qrCode.moduleMatrix.length + 8);
  for (let i = 0; i < 4; i++) {
    qrCode.moduleMatrix = [ quietLine, ...qrCode.moduleMatrix ];
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
  return str.split('').reverse().join();
}

export function placeVersion(qrCode: QRCode, versionStr: string): void {
  const length = qrCode.moduleMatrix.length;
  const vStr = reverseString(versionStr);
  for (let i = 0; i < 6; i++) {
    for (let k = 0; k < 3; k++) {
      qrCode.moduleMatrix[k + length - 11][i] = vStr[i * 3 + k] === '1';
      qrCode.moduleMatrix[i][k + length - 11] = vStr[i * 3 + k] === '1';
    }
  }
}

export function placeFormat(qrCode: QRCode, formatStr: string): void {
  const length = qrCode.moduleMatrix.length;
  const fStr = reverseString(formatStr);
  const modules = [
    [ 8, 0, length - 1, 8 ],
    [ 8, 1, length - 2, 8 ],
    [ 8, 2, length - 3, 8 ],
    [ 8, 3, length - 4, 8 ],
    [ 8, 4, length - 5, 8 ],
    [ 8, 5, length - 6, 8 ],
    [ 8, 7, length - 7, 8 ],
    [ 8, 8, length - 8, 8 ],
    [ 7, 8, 8, length - 7 ],
    [ 5, 8, 8, length - 6 ],
    [ 4, 8, 8, length - 5 ],
    [ 3, 8, 8, length - 4 ],
    [ 2, 8, 8, length - 3 ],
    [ 1, 8, 8, length - 2 ],
    [ 0, 8, 8, length - 1 ]
  ];
    
  for (let i = 0; i < 15; i++) {
    const p1 = { x: modules[i][0], y: modules[i][1] };
    const p2 = { x: modules[i][2], y: modules[i][3] };
    qrCode.moduleMatrix[p1.y][p1.x] = fStr[i] === '1';
    qrCode.moduleMatrix[p2.y][p2.x] = fStr[i] === '1';
  }
}

export function maskCode(qrCode: QRCode, version: number, blockedModules: any[], ecc: ECCLevel) {
  let patternName = '';
  let patternScore = 0;
  const length = qrCode.moduleMatrix.length;

  for (const pName in MaskPattern.Patterns) {
    if (MaskPattern.Patterns.hasOwnProperty(pName)) {
      const pattern = MaskPattern.Patterns[pName];
      const qrTemp = new QRCode(version);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          qrTemp.moduleMatrix[y][x] = qrCode.moduleMatrix[y][x];
        }
      }

      const formatStr = Format.getFormatString(ecc, (+(pName.substr(7, 1))) - 1);
      placeFormat(qrTemp, formatStr);
      if (version >= 7) {
        const versionString = Format.getVersionString(version);
        placeVersion(qrTemp, versionString);
      }

      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          if (!isBlocked({ x, y, width: 1,  height: 1 } as Rectangle, blockedModules)) {
            qrTemp.moduleMatrix[y][x] = utils.bxor(qrTemp.moduleMatrix[y][x], pattern(x, y));
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

  const patternMethod = MaskPattern.Patterns[patternName];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      if (!isBlocked({ x, y, width: 1, height: 1 } as Rectangle, blockedModules)) {
        qrCode.moduleMatrix[y][x] = utils.bxor(qrCode.moduleMatrix[y][x], patternMethod(x, y));
      }
    }
  }

  return (+patternName.substr(patternName.length - 1, 1)) - 1;
}

export function isBlocked(r1: Rectangle, blockedModules: Rectangle[]): boolean {
  let isBlocked = false;
  blockedModules.forEach(blockedMod => {
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


            public static void PlaceDataWords(ref QRCodeData qrCode, string data, ref List<Rectangle> blockedModules)
            {
                var size = qrCode.ModuleMatrix.Count;
                var up = true;
                var datawords = new Queue<bool>();
                for (int i = 0; i< data.Length; i++)
                {
                    datawords.Enqueue(data[i] != '0');
                }
                for (var x = size - 1; x >= 0; x = x - 2)
                {
                    if (x == 6)
                        x = 5;
                    for (var yMod = 1; yMod <= size; yMod++)
                    {
                        int y;
                        if (up)
                        {
                            y = size - yMod;
                            if (datawords.Count > 0 && !IsBlocked(new Rectangle(x, y, 1, 1), blockedModules))
                                qrCode.ModuleMatrix[y][x] = datawords.Dequeue();
                            if (datawords.Count > 0 && x > 0 && !IsBlocked(new Rectangle(x - 1, y, 1, 1), blockedModules))
                                qrCode.ModuleMatrix[y][x - 1] = datawords.Dequeue();
                        }
                        else
                        {
                            y = yMod - 1;
                            if (datawords.Count > 0 && !IsBlocked(new Rectangle(x, y, 1, 1), blockedModules))
                                qrCode.ModuleMatrix[y][x] = datawords.Dequeue();
                            if (datawords.Count > 0 && x > 0 && !IsBlocked(new Rectangle(x - 1, y, 1, 1), blockedModules))
                                qrCode.ModuleMatrix[y][x - 1] = datawords.Dequeue();
                        }
                    }
                    up = !up;
                }
            }

            public static void ReserveSeperatorAreas(int size, ref List<Rectangle> blockedModules)
            {
                blockedModules.AddRange(new[]{
                    new Rectangle(7, 0, 1, 8),
                    new Rectangle(0, 7, 7, 1),
                    new Rectangle(0, size-8, 8, 1),
                    new Rectangle(7, size-7, 1, 7),
                    new Rectangle(size-8, 0, 1, 8),
                    new Rectangle(size-7, 7, 7, 1)
                });
            }

            public static void ReserveVersionAreas(int size, int version, ref List<Rectangle> blockedModules)
            {
                blockedModules.AddRange(new[]{
                    new Rectangle(8, 0, 1, 6),
                    new Rectangle(8, 7, 1, 1),
                    new Rectangle(0, 8, 6, 1),
                    new Rectangle(7, 8, 2, 1),
                    new Rectangle(size-8, 8, 8, 1),
                    new Rectangle(8, size-7, 1, 7)
                });

                if (version >= 7)
                {
                    blockedModules.AddRange(new[]{
                    new Rectangle(size-11, 0, 3, 6),
                    new Rectangle(0, size-11, 6, 3)
                });
                }
            }
            public static void PlaceDarkModule(ref QRCodeData qrCode, int version, ref List<Rectangle> blockedModules)
            {
                qrCode.ModuleMatrix[4 * version + 9][8] = true;
                blockedModules.Add(new Rectangle(8, 4 * version + 9, 1, 1));
            }

            public static void PlaceFinderPatterns(ref QRCodeData qrCode, ref List<Rectangle> blockedModules)
            {
                var size = qrCode.ModuleMatrix.Count;
                int[] locations = { 0, 0, size - 7, 0, 0, size - 7 };

                for (var i = 0; i < 6; i = i + 2)
                {
                    for (var x = 0; x < 7; x++)
                    {
                        for (var y = 0; y < 7; y++)
                        {
                            if (!(((x == 1 || x == 5) && y > 0 && y < 6) || (x > 0 && x < 6 && (y == 1 || y == 5))))
                            {
                                qrCode.ModuleMatrix[y + locations[i + 1]][x + locations[i]] = true;
                            }
                        }
                    }
                    blockedModules.Add(new Rectangle(locations[i], locations[i + 1], 7, 7));
                }
            }

            public static void PlaceAlignmentPatterns(ref QRCodeData qrCode, List<Point> alignmentPatternLocations, ref List<Rectangle> blockedModules)
            {
                foreach (var loc in alignmentPatternLocations)
                {
                    var alignmentPatternRect = new Rectangle(loc.X, loc.Y, 5, 5);
                    var blocked = false;
                    foreach (var blockedRect in blockedModules)
                    {
                        if (Intersects(alignmentPatternRect, blockedRect))
                        {
                            blocked = true;
                            break;
                        }
                    }
                    if (blocked)
                        continue;

                    for (var x = 0; x < 5; x++)
                    {
                        for (var y = 0; y < 5; y++)
                        {
                            if (y == 0 || y == 4 || x == 0 || x == 4 || (x == 2 && y == 2))
                            {
                                qrCode.ModuleMatrix[loc.Y + y][loc.X + x] = true;
                            }
                        }
                    }
                    blockedModules.Add(new Rectangle(loc.X, loc.Y, 5, 5));
                }
            }

            public static void PlaceTimingPatterns(ref QRCodeData qrCode, ref List<Rectangle> blockedModules)
            {
                var size = qrCode.ModuleMatrix.Count;
                for (var i = 8; i < size - 8; i++)
                {
                    if (i % 2 == 0)
                    {
                        qrCode.ModuleMatrix[6][i] = true;
                        qrCode.ModuleMatrix[i][6] = true;
                    }
                }
                blockedModules.AddRange(new[]{
                    new Rectangle(6, 8, 1, size-16),
                    new Rectangle(8, 6, size-16, 1)
                });
            }

            

            



        }