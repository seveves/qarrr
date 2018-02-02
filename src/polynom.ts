import { btd, groupBy } from './utils';
import { galoisField } from './antilog';

export interface PolynomItem {
  coefficient: number;
  exponent: number;
}

export interface Polynom {
  polyItems: PolynomItem[];
}

export function calculateMessagePolynom(bits: string): Polynom {
  let b = bits;
  const messagePol: Polynom = { polyItems: [] };
  for (let i = b.length / 8 - 1; i >= 0; i--) {
    messagePol.polyItems.push({ coefficient: btd(b.substr(0, 8)), exponent: i });
    b = b.slice(8);
  }
  return messagePol;
}


export function calculateGeneratorPolynom(numEccWords: number): Polynom {
  let generatorPolynom: Polynom = { polyItems: [] };
  generatorPolynom.polyItems.push(
    { coefficient: 0, exponent: 1 },
    { coefficient: 0, exponent: 0 },
  );
  for (let i = 1; i <= numEccWords - 1; i++) {
    const multiplierPolynom: Polynom = { polyItems: [] };
    multiplierPolynom.polyItems.push(
      { coefficient: 0, exponent: 1 },
      { coefficient: i, exponent: 1 },
    );
    generatorPolynom = multiplyAlphaPolynoms(generatorPolynom, multiplierPolynom);
  }

  return generatorPolynom;
}

export function multiplyAlphaPolynoms(polynomBase: Polynom, polynomMultiplier: Polynom): Polynom {
  const resultPolynom: Polynom = { polyItems: [] };
  polynomMultiplier.polyItems.forEach((polItemBase) => {
    polynomBase.polyItems.forEach((polItemMulti) => {
      const polItemRes: PolynomItem = {
        coefficient: shrinkAlphaExp(polItemBase.coefficient + polItemMulti.coefficient),
        exponent: polItemBase.exponent + polItemMulti.exponent,
      };
      resultPolynom.polyItems.push(polItemRes);
    });
  });

  const exponentsToGlue: number[] = [];
  const groupedByExponent = groupBy<PolynomItem>(resultPolynom.polyItems, 'exponent');
  for (const key in groupedByExponent) {
    if (groupedByExponent.hasOwnProperty(key)) {
      const element = groupedByExponent[key];
      if (element.length > 1) {
        exponentsToGlue.push(element[0].exponent);
      }
    }
  }

  const gluedPolynoms: PolynomItem[] = [];
  exponentsToGlue.forEach((exponent) => {
    const coefficient = resultPolynom.polyItems
      .filter(x => x.exponent === exponent)
      .reduce((c, p) => c ^ getIntValFromAlphaExp(p.coefficient), 0);

    const polynomFixed: PolynomItem = { exponent, coefficient: getAlphaExpFromIntVal(coefficient) };
    gluedPolynoms.push(polynomFixed);
  });

  resultPolynom.polyItems = resultPolynom.polyItems.filter(x => !exponentsToGlue.some(g => g === x.exponent));
  resultPolynom.polyItems.push(...gluedPolynoms);
  resultPolynom.polyItems.sort((a, b) => { return b.exponent - a.exponent; });
  return resultPolynom;
}

export function multiplyGeneratorPolynomByLeadterm(genPolynom: Polynom, leadTerm: PolynomItem, lowerExponentBy: number): Polynom {
  const resultPolynom: Polynom = { polyItems: [] };
  genPolynom.polyItems.forEach((polItemBase) => {
    const polItemRes: PolynomItem = {
      coefficient: (polItemBase.coefficient + leadTerm.coefficient) % 255,
      exponent: polItemBase.exponent - lowerExponentBy,
    };
    resultPolynom.polyItems.push(polItemRes);
  });

  return resultPolynom;
}

export function xorPolynoms(messagePolynom: Polynom, resPolynom: Polynom): Polynom {
  const resultPolynom: Polynom = { polyItems: [] };
  let longPoly: Polynom;
  let shortPoly: Polynom;
  if (messagePolynom.polyItems.length >= resPolynom.polyItems.length) {
    longPoly = messagePolynom;
    shortPoly = resPolynom;
  } else {
    longPoly = resPolynom;
    shortPoly = messagePolynom;
  }

  for (let i = 0; i < longPoly.polyItems.length; i++) {
    const polItemRes: PolynomItem = {
      coefficient: longPoly.polyItems[i].coefficient ^ (shortPoly.polyItems.length > i ? shortPoly.polyItems[i].coefficient : 0),
      exponent: messagePolynom.polyItems[0].exponent - i,
    };
    resultPolynom.polyItems.push(polItemRes);
  }
  resultPolynom.polyItems.splice(0, 1);
  return resultPolynom;
}

export function convertToAlphaNotation(poly: Polynom): Polynom {
  const newPoly: Polynom = { polyItems: [] };
  for (let i = 0; i < poly.polyItems.length; i++) {
    newPoly.polyItems.push({
      coefficient: poly.polyItems[i].coefficient !== 0 ? getAlphaExpFromIntVal(poly.polyItems[i].coefficient) : 0,
      exponent: poly.polyItems[i].exponent,
    });
  }
  return newPoly;
}

export function convertToDecNotation(poly: Polynom): Polynom {
  const newPoly: Polynom = { polyItems: [] };
  for (let i = 0; i < poly.polyItems.length; i++) {
    newPoly.polyItems.push({
      coefficient: getIntValFromAlphaExp(poly.polyItems[i].coefficient),
      exponent: poly.polyItems[i].exponent,
    });
  }
  return newPoly;
}

export function getIntValFromAlphaExp(exp: number): number {
  return galoisField.find(alog => alog.exponentAlpha === exp).value;
}

export function getAlphaExpFromIntVal(value: number): number {
  return galoisField.find(alog => alog.value === value).exponentAlpha;
}

export function shrinkAlphaExp(alphaExp: number): number {
  return ((alphaExp % 256) + Math.floor(alphaExp / 256)) | 0;
}
