import { ECCLevel } from './enums';

export interface VersionInfoDetails {
  ecc: ECCLevel;
  capacitySet: { [key: number]: number };
}

export interface VersionInfo {
  version: number;
  details: VersionInfoDetails[];
}

export interface ECCInfo {
  version: number;
  ecc: ECCLevel;
  totalDataCodewords: number;
  eccPerBlock: number;
  blocksInGroup1: number;
  codewordsInGroup1: number;
  blocksInGroup2: number;
  codewordsInGroup2: number;
}

export interface CodewordBlock {
  group: number;
  block: number;
  bits: string;
  codewords: string[];
  codewordsInt: number[];
  eccWords: string[];
  eccWordsInt: number[];
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface AlignmentPattern {
  version: number;
  patternPositions: Point[];
}
