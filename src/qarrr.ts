import { Color } from './color';
import { QRCode, CanvasQRCode } from './qrcode';
import { ECCLevel, EncodingMode } from './enums';
import { CodewordBlock, ECCInfo, VersionInfo, VersionInfoDetails, Rectangle, AlignmentPattern, Point } from './models';

import * as Const from './const';
import * as Utils from './utils';
import * as Format from './format';
import * as PolynomUtils from './polynom';
import * as ModulePlacer from './module-placer';

export interface QArrOptions {
  ecc?: ECCLevel;
  pixelsPerModule?: number;
  darkColor?: Color;
  lightColor?: Color;
  drawQuietZones?: boolean;
}

export class QArr {
  public createCanvas(text: string, options?: QArrOptions) {
    return this.create<HTMLCanvasElement>(text, v => new CanvasQRCode(v), options);
  }

  public create<T>(text: string, factory: (version: number) => QRCode<T>,  options?: QArrOptions): T {
    const ecc = options && options.ecc ? options.ecc : ECCLevel.H;
    const encoding = this.getEncoding(text);
    const coded = this.textToBinary(text, encoding);
    const version = this.getVersion(text.length, encoding, ecc);
    const modeIndicator = Utils.dtb(encoding, 4);
    const countIndicator = Utils.dtb(text.length, this.getCountIndicatorLength(version, encoding));
    let bits = modeIndicator + countIndicator + coded;

    // filling up data code word
    const eccInfo = Const.CAPACITY_ECC_TABLE.find(x => x.version === version && x.ecc === ecc);
    const dataLength = eccInfo.totalDataCodewords * 8;
    const lengthDiff = dataLength - bits.length;
    if (lengthDiff > 0) {
      bits += Array.from({ length: Math.min(lengthDiff, 4) }, (k, v) => '0').join();
    }
    if ((bits.length % 8) !== 0) {
      bits += Array.from({ length: 8 - (bits.length % 8) }, (k, v) => '0').join();
    }
    while (bits.length < dataLength) {
      bits += '1110110000010001';
    }
    if (bits.length > dataLength) {
      bits = bits.substr(0, dataLength);
    }

    // calculating error correction words
    const codewordWithECC: CodewordBlock[] = [];
    for (let i = 0; i < eccInfo.blocksInGroup1; i++) {
      const bitStr = bits.substr(i * eccInfo.codewordsInGroup1 * 8, eccInfo.codewordsInGroup1 * 8);
      const bitBlockList = this.binaryStringToBitBlocks(bitStr);
      const bitBlockListDec = this.binaryStringsToDecimals(bitBlockList);
      const eccWordList = this.calculateECCWords(bitStr, eccInfo);
      const eccWordListDec = this.binaryStringsToDecimals(eccWordList);
      codewordWithECC.push({
        group: 1,
        block: i + 1,
        bits: bitStr,
        codewords: bitBlockList,
        eccWords: eccWordList,
        codewordsInt: bitBlockListDec,
        eccWordsInt: eccWordListDec,
      });
    }
    bits = bits.substr(eccInfo.blocksInGroup1 * eccInfo.codewordsInGroup1 * 8);
    for (let i = 0; i < eccInfo.blocksInGroup2; i++) {
      const bitStr = bits.substr(i * eccInfo.codewordsInGroup2 * 8, eccInfo.codewordsInGroup2 * 8);
      const bitBlockList = this.binaryStringToBitBlocks(bitStr);
      const bitBlockListDec = this.binaryStringsToDecimals(bitBlockList);
      const eccWordList = this.calculateECCWords(bitStr, eccInfo);
      const eccWordListDec = this.binaryStringsToDecimals(eccWordList);
      codewordWithECC.push({
        group: 2,
        block: i + 1,
        bits: bitStr,
        codewords: bitBlockList,
        eccWords: eccWordList,
        codewordsInt: bitBlockListDec,
        eccWordsInt: eccWordListDec,
      });
    }

    // interleave code words
    let interleavedData = '';
    for (let i = 0; i < Math.max(eccInfo.codewordsInGroup1, eccInfo.codewordsInGroup2); i++) {
      codewordWithECC.forEach((codeBlock) => {
        if (codeBlock.codewords.length > i) {
          interleavedData += codeBlock.codewords[i];
        }
      });
    }
    for (let i = 0; i < eccInfo.eccPerBlock; i++) {
      codewordWithECC.forEach((codeBlock) => {
        if (codeBlock.eccWords.length > i) {
          interleavedData += codeBlock.eccWords[i];
        }
      });
    }
    interleavedData += Array.from({ length: Const.REMAINDER_BITS[version - 1] }, (k, v) => '0').join();

    // place interleaved data on module matrix
    const qrCode = factory(version);
    const blockedModules: Rectangle[] = [];
    ModulePlacer.placeFinderPatterns(qrCode, blockedModules);
    ModulePlacer.reserveSeperatorAreas(qrCode.moduleMatrix.length, blockedModules);
    ModulePlacer.placeAlignmentPatterns(qrCode, Const.ALIGNMENT_PATTERN_TABLE.find(a => a.version === version).patternPositions, blockedModules);
    ModulePlacer.placeTimingPatterns(qrCode, blockedModules);
    ModulePlacer.placeDarkModule(qrCode, version, blockedModules);
    ModulePlacer.reserveVersionAreas(qrCode.moduleMatrix.length, version, blockedModules);
    ModulePlacer.placeDataWords(qrCode, interleavedData, blockedModules);
    const maskVersion = ModulePlacer.maskCode(qrCode, factory, version, blockedModules, ecc);
    const formatStr = Format.getFormatString(ecc, maskVersion);
    ModulePlacer.placeFormat(qrCode, formatStr);
    if (version >= 7) {
      const versionString = Format.getVersionString(version);
      ModulePlacer.placeVersion(qrCode, versionString);
    }
    ModulePlacer.addQuietZone(qrCode);

    let pixelsPerModule = 4;
    let darkColor = { r: 0, g: 0, b: 0 } as Color;
    let lightColor = { r: 255, g: 255, b: 255 } as Color;
    let drawQuietZones = true;
    if (options) {
      pixelsPerModule = options.pixelsPerModule == null ? pixelsPerModule : options.pixelsPerModule;
      darkColor = options.darkColor || darkColor;
      lightColor = options.lightColor || lightColor;
      drawQuietZones = options.drawQuietZones == null ? drawQuietZones : options.drawQuietZones;
    }
    return qrCode.getGraphic(pixelsPerModule, darkColor, lightColor, drawQuietZones);
  }

  private calculateECCWords(bits: string, ecc: ECCInfo): string[] {
    const eccWords = ecc.eccPerBlock;
    const messagePolynom = PolynomUtils.calculateMessagePolynom(bits);
    const generatorPolynom = PolynomUtils.calculateGeneratorPolynom(eccWords);

    for (let i = 0; i < messagePolynom.polyItems.length; i++) {
      messagePolynom.polyItems[i] = {
        coefficient: messagePolynom.polyItems[i].coefficient,
        exponent: messagePolynom.polyItems[i].exponent + eccWords,
      };
    }

    for (let i = 0; i < generatorPolynom.polyItems.length; i++) {
      generatorPolynom.polyItems[i] = {
        coefficient: generatorPolynom.polyItems[i].coefficient,
        exponent: generatorPolynom.polyItems[i].exponent + (messagePolynom.polyItems.length - 1),
      };
    }
    
    let leadTermSource = messagePolynom;
    for (let i = 0; (leadTermSource.polyItems.length > 0 && leadTermSource.polyItems[leadTermSource.polyItems.length - 1].exponent > 0); i++) {
      if (leadTermSource.polyItems[0].coefficient === 0) {   
        leadTermSource.polyItems.splice(0, 1);
        leadTermSource.polyItems.push({
          coefficient: 0,
          exponent: leadTermSource.polyItems[leadTermSource.polyItems.length - 1].exponent - 1,
        });
      } else {
        let resPoly = PolynomUtils.multiplyGeneratorPolynomByLeadterm(
          generatorPolynom,
          PolynomUtils.convertToAlphaNotation(leadTermSource).polyItems[0], i,
        );
        resPoly = PolynomUtils.convertToDecNotation(resPoly);
        resPoly = PolynomUtils.xorPolynoms(leadTermSource, resPoly);
        leadTermSource = resPoly;
      }
    }
    return leadTermSource.polyItems.map(p => Utils.dtb(p.coefficient, 8));
  }

  private getVersion(length: number, encoding: EncodingMode, ecc: ECCLevel) {
    const version = Const.CAPACITY_TABLE
      .filter(c => c.details.some(d => d.ecc === ecc && d.capacitySet[encoding] >= length))
      .map(c => ({
        version: c.version,
        capacity: c.details.find(d => d.ecc === ecc).capacitySet[encoding],
      }));

    return Utils.min<{ version: number, capacity: number }>(version, (v1, v2) => v1.version > v2.version).version;
  }

  private getEncoding(text: string) {
    let result = EncodingMode.Numeric;

    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (!Const.NUM_TABLE.has(char)) {
        result = EncodingMode.Alphanumeric;
        if (!Const.ALPHANUM_ENC_TABLE.has(char)) {
          return EncodingMode.Byte;
        }
      }
    }

    return result;
  }

  private textToBinary(text: string, encoding: EncodingMode) {
    switch (encoding) {
      case EncodingMode.Numeric:
        return this.textToBinaryNumeric(text);
      case EncodingMode.Alphanumeric:
        return this.textToBinaryAlphanumeric(text);
      case EncodingMode.Byte:
        return this.textToBinaryByte(text);
      default:
        return '';
    }
  }

  private textToBinaryNumeric(text: string) {
    let t = text;
    let codeText = '';
    while (t.length >= 3) {
      const dec = +(t.substr(0, 3));
      codeText += Utils.dtb(dec, 10);
      t = t.substr(3);
    }
    if (t.length === 2) {
      const dec = (+t.substr(0, t.length)) | 0;
      codeText += Utils.dtb(dec, 7);
    } else if (t.length === 1) {
      const dec = (+t.substr(0, t.length)) | 0;
      codeText += Utils.dtb(dec, 4);
    }
    return codeText;
  }

  private textToBinaryAlphanumeric(text: string) {
    let t = text;
    let codeText = '';
    const tmp = [...Const.ALPHANUM_ENC_TABLE];
    while (t.length >= 2) {
      const token = t.substr(0, 2);
      const v1 = tmp.indexOf(token[0]);
      const v2 = tmp.indexOf(token[1]);
      const dec = v1 * 45 + v2;
      codeText += Utils.dtb(dec, 11);
      t = t.substr(2);
    }
    if (t.length > 0) {
      codeText += Utils.dtb(tmp.indexOf(t[0]), 6);
    }
    return codeText;
  }

  private textToBinaryByte(text: string) {
    let codeText = '';
    const codeBytes = this.toByteArray(text);

    for (let index = 0; index < codeBytes.length; index++) {
      const codeByte = codeBytes[index];
      codeText += Utils.dtb(codeByte, 8);
    }

    return codeText;
  }

  private toByteArray(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) {
        bytes.push(charcode);
      } else if (charcode < 0x800) {
        bytes.push(0xc0 | (charcode >> 6), 
                   0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        bytes.push(0xe0 | (charcode >> 12), 
                   0x80 | ((charcode >> 6) & 0x3f), 
                   0x80 | (charcode & 0x3f));
      } else {
        i++;
        charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
                   (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (charcode >> 18), 
                   0x80 | ((charcode >> 12) & 0x3f), 
                   0x80 | ((charcode >> 6) & 0x3f), 
                   0x80 | (charcode & 0x3f));
      }
    }
    return bytes;
  }

  private binaryStringToBitBlocks(bits: string): string[] {
    return Utils.chunks(Array.from(bits), 8).reduce((p, c) => [...p, c.join()], []);
  }

  private binaryStringsToDecimals(binaryStrings: string[]): number[] {
    return binaryStrings.map(b => Utils.btd(b));
  }

  private getCountIndicatorLength(version: number, encoding: EncodingMode) {
    if (version < 10) {
      if (encoding === EncodingMode.Numeric) {
        return 10;
      }
      if (encoding === EncodingMode.Alphanumeric) {
        return 9;
      }
      return 8;
    }

    if (version < 27) {
      if (encoding === EncodingMode.Numeric) {
        return 12;
      }
      if (encoding === EncodingMode.Alphanumeric) {
        return 11;
      }
      if (encoding === EncodingMode.Byte) {
        return 16;
      }
      return 10;
    }

    if (encoding === EncodingMode.Numeric) {
      return 14;
    }
    if (encoding === EncodingMode.Alphanumeric) {
      return 13;
    }
    if (encoding === EncodingMode.Byte) {
      return 16;
    }
    return 12;
  }
}