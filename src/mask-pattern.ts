import { QRCode } from './qrcode';

export const patterns = {
  pattern1: (x: number, y: number) => ((x + y) % 2 === 0),
  pattern2: (x: number, y: number) => (y % 2 === 0),
  pattern3: (x: number, y: number) => (x % 3 === 0),
  pattern4: (x: number, y: number) => ((x + y) % 3 === 0),
  pattern5: (x: number, y: number) => ((((Math.floor(y / 2) + Math.floor(x / 3)) % 2) | 0) === 0),
  pattern6: (x: number, y: number) => (((x * y) % 2) + ((x * y) % 3) === 0),
  pattern7: (x: number, y: number) => ((((x * y) % 2) + ((x * y) % 3)) % 2 === 0),
  pattern8: (x: number, y: number) => ((((x + y) % 2) + ((x * y) % 3)) % 2 === 0),
};

export function score<T>(qrCode: QRCode<T>) {
  let score1 = 0;
  let score2 = 0;
  let score3 = 0;
  let score4 = 0;
  const length = qrCode.moduleMatrix.length;

  // penalty 1                   
  for (let y = 0; y < length; y++) {
    let modInRow = 0;
    let modInColumn = 0;
    let lastValRow = qrCode.moduleMatrix[y][0];
    let lastValColumn = qrCode.moduleMatrix[0][y];
    for (let x = 0; x < length; x++) {
      if (qrCode.moduleMatrix[y][x] === lastValRow) {
        modInRow++;
      } else {
        modInRow = 1;
      }
      if (modInRow === 5) {
        score1 += 3;
      } else if (modInRow > 5) {
        score1++;
      }
      lastValRow = qrCode.moduleMatrix[y][x];

      if (qrCode.moduleMatrix[x][y] === lastValColumn) {
        modInColumn++;
      } else {
        modInColumn = 1;
      }
      if (modInColumn === 5) {
        score1 += 3;
      } else if (modInColumn > 5) {
        score1++;
      }
      lastValColumn = qrCode.moduleMatrix[x][y];
    }
  }

  // penalty 2
  for (let y = 0; y < length - 1; y++) {
    for (let x = 0; x < length - 1; x++) {
      if (qrCode.moduleMatrix[y][x] === qrCode.moduleMatrix[y][x + 1] &&
          qrCode.moduleMatrix[y][x] === qrCode.moduleMatrix[y + 1][x] &&
          qrCode.moduleMatrix[y][x] === qrCode.moduleMatrix[y + 1][x + 1]) {
        score2 += 3;
      }
    }
  }

        // penalty 3
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < length - 10; x++) {
      if ((qrCode.moduleMatrix[y][x] && !qrCode.moduleMatrix[y][x + 1] &&
           qrCode.moduleMatrix[y][x + 2] && qrCode.moduleMatrix[y][x + 3] &&
           qrCode.moduleMatrix[y][x + 4] && !qrCode.moduleMatrix[y][x + 5] &&
           qrCode.moduleMatrix[y][x + 6] && !qrCode.moduleMatrix[y][x + 7] &&
           !qrCode.moduleMatrix[y][x + 8] && !qrCode.moduleMatrix[y][x + 9] &&
           !qrCode.moduleMatrix[y][x + 10]) ||
          (!qrCode.moduleMatrix[y][x] && !qrCode.moduleMatrix[y][x + 1] &&
           !qrCode.moduleMatrix[y][x + 2] && !qrCode.moduleMatrix[y][x + 3] &&
           qrCode.moduleMatrix[y][x + 4] && !qrCode.moduleMatrix[y][x + 5] &&
           qrCode.moduleMatrix[y][x + 6] && qrCode.moduleMatrix[y][x + 7] &&
           qrCode.moduleMatrix[y][x + 8] && !qrCode.moduleMatrix[y][x + 9] &&
           qrCode.moduleMatrix[y][x + 10])) {
        score3 += 40;
      }

      if ((qrCode.moduleMatrix[x][y] && !qrCode.moduleMatrix[x + 1][y] &&
           qrCode.moduleMatrix[x + 2][y] && qrCode.moduleMatrix[x + 3][y] &&
           qrCode.moduleMatrix[x + 4][y] && !qrCode.moduleMatrix[x + 5][y] &&
           qrCode.moduleMatrix[x + 6][y] && !qrCode.moduleMatrix[x + 7][y] &&
           !qrCode.moduleMatrix[x + 8][y] && !qrCode.moduleMatrix[x + 9][y] &&
           !qrCode.moduleMatrix[x + 10][y]) ||
          (!qrCode.moduleMatrix[x][y] && !qrCode.moduleMatrix[x + 1][y] &&
           !qrCode.moduleMatrix[x + 2][y] && !qrCode.moduleMatrix[x + 3][y] &&
           qrCode.moduleMatrix[x + 4][y] && !qrCode.moduleMatrix[x + 5][y] &&
           qrCode.moduleMatrix[x + 6][y] && qrCode.moduleMatrix[x + 7][y] &&
           qrCode.moduleMatrix[x + 8][y] && !qrCode.moduleMatrix[x + 9][y] &&
           qrCode.moduleMatrix[x + 10][y])) {
        score3 += 40;
      }
    }
  }

  // penalty 4
  let blackModules = 0;
  qrCode.moduleMatrix.forEach((row) => {
    row.forEach((bit) => {
      if (bit) {
        blackModules++;
      }
    });
  });
  
  const percent = (blackModules / (qrCode.moduleMatrix.length * qrCode.moduleMatrix.length)) * 100;
  const prevMultipleOf5 = Math.abs((Math.floor(percent / 5) | 0) * 5 - 50) / 5;
  const nextMultipleOf5 = Math.abs((Math.floor(percent / 5) | 0) * 5 - 45) / 5;
  score4 = Math.min(prevMultipleOf5, nextMultipleOf5) * 10;

  return score1 + score2 + score3 + score4;
}
