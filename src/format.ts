import { ECCLevel } from './enums';
import * as utils from './utils';

export function getFormatString(ecc: ECCLevel, maskVersion: number): string {
  let generator = '10100110111';
  let fStrMask = '101010000010010';

  let fStr = (ecc === ECCLevel.L)
    ? '01'
    : (ecc === ECCLevel.M)
      ? '00'
      : (ecc === ECCLevel.Q)
        ? '11'
        : '10';
  fStr += utils.dtb(maskVersion, 3);
  let fStrEcc = utils.trimStart(utils.padRight(fStr, '0', 15), '0');
  while (fStrEcc.length > 10) {
    let sb = '';
    generator = utils.padRight(generator, '0', fStrEcc.length);
    for (let i = 0; i < fStrEcc.length; i++) {
      sb += (+fStrEcc[i]) ^ (+generator[i]);
    }
    fStrEcc = utils.trimStart(sb, '0');
  }
  fStrEcc = utils.padLeft(fStrEcc, '0', 10);
  fStr += fStrEcc;

  let sbMask = '';
  for (let i = 0; i < fStr.length; i++) {
    sbMask += (+fStr[i]) ^ (+fStrMask[i]);
  }
  return sbMask;
}

export function getVersionString(version: number): string {
  let generator = '1111100100101';

  let vStr = utils.dtb(version, 6);
  let vStrEcc = utils.trimStart(utils.padRight(vStr, '0', 18), '0')
  while (vStrEcc.length > 12) {
    let sb = '';
    generator = utils.padRight(generator, '0', vStrEcc.length);
    for (let i = 0; i < vStrEcc.length; i++) {
      sb += (+vStrEcc[i]) ^ (+generator[i]);
    }
    vStrEcc = utils.trimStart(sb, '0');
  }
  vStrEcc = utils.padLeft(vStrEcc, '0', 12);
  vStr += vStrEcc;

  return vStr;
}
