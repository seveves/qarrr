import { QArr } from '../qarrr';
import { ECCLevel } from '../enums';
import { TestQRCode } from './test-qrcode';
import { expect } from 'chai';

describe('QArrr', () => {

  it('basic_code_generation_ecc_h', () => {
    const generator = new QArr();
    const qrCodeData = generator.create('hello', v => new TestQRCode(v), { ecc: ECCLevel.H });
    expect(qrCodeData.version).to.equal(1);
    const expected = '[[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,true,true,true,true,true,true,true,false,false,false,false,false,true,false,true,true,true,true,true,true,true,false,false,false,false],[false,false,false,false,true,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,true,false,false,false,false],[false,false,false,false,true,false,true,true,true,false,true,false,true,true,false,true,false,false,true,false,true,true,true,false,true,false,false,false,false],[false,false,false,false,true,false,true,true,true,false,true,false,true,false,true,false,false,false,true,false,true,true,true,false,true,false,false,false,false],[false,false,false,false,true,false,true,true,true,false,true,false,false,false,true,true,true,false,true,false,true,true,true,false,true,false,false,false,false],[false,false,false,false,true,false,false,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,false,false,true,false,false,false,false],[false,false,false,false,true,true,true,true,true,true,true,false,true,false,true,false,true,false,true,true,true,true,true,true,true,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,true,true,false,true,true,false,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false],[false,false,false,false,true,false,true,false,false,true,false,true,false,true,true,false,false,false,true,true,true,true,true,false,false,false,false,false,false],[false,false,false,false,true,true,false,true,false,true,true,false,true,true,false,true,false,true,false,true,false,false,true,true,true,false,false,false,false],[false,false,false,false,true,true,false,false,true,true,false,true,false,true,false,false,true,true,false,true,true,false,true,false,false,false,false,false,false],[false,false,false,false,false,true,false,false,true,true,true,true,true,false,false,false,false,false,true,true,true,true,false,true,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,true,false,true,false,true,true,true,false,false,true,false,true,false,false,false,false,false],[false,false,false,false,true,true,true,true,true,true,true,false,true,false,true,false,false,false,true,false,false,false,true,false,false,false,false,false,false],[false,false,false,false,true,false,false,false,false,false,true,false,false,true,true,true,false,true,false,false,false,true,true,true,true,false,false,false,false],[false,false,false,false,true,false,true,true,true,false,true,false,true,false,true,false,true,false,false,false,true,true,false,true,true,false,false,false,false],[false,false,false,false,true,false,true,true,true,false,true,false,true,false,true,true,true,true,false,false,true,false,false,false,false,false,false,false,false],[false,false,false,false,true,false,true,true,true,false,true,false,false,false,true,true,false,true,true,true,true,true,true,true,true,false,false,false,false],[false,false,false,false,true,false,false,false,false,false,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false],[false,false,false,false,true,true,true,true,true,true,true,false,false,false,true,false,false,true,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]]';
    const result = JSON.stringify(qrCodeData.moduleMatrix);
    expect(qrCodeData.moduleMatrix.length).to.equal(29);
    expect(result).to.equal(expected);
  });

  /*
  it('basic_code_generation_ecc_l', () => {
    const generator = new QArr();
    const qrCodeData = generator.create('hello', v => new TestQRCode(v), { ecc: ECCLevel.L });
    expect(qrCodeData.version).toBe(10);
    expect(qrCodeData.moduleMatrix.length).toBe(10);
  });

  it('basic_code_generation_ecc_m', () => {
    const generator = new QArr();
    const qrCodeData = generator.create('hello', v => new TestQRCode(v), { ecc: ECCLevel.M });
    expect(qrCodeData.version).toBe(10);
    expect(qrCodeData.moduleMatrix.length).toBe(10);
  });

  it('basic_code_generation_ecc_q', () => {
    const generator = new QArr();
    const qrCodeData = generator.create('hello', v => new TestQRCode(v), { ecc: ECCLevel.Q });
    expect(qrCodeData.version).toBe(10);
    expect(qrCodeData.moduleMatrix.length).toBe(10);
  });

  it('basic_code_generation_numeric', () => {
    const generator = new QArr();
    const qrCodeData = generator.create('123', v => new TestQRCode(v), { ecc: ECCLevel.H });
    expect(qrCodeData.version).toBe(10);
    expect(qrCodeData.moduleMatrix.length).toBe(10);
  });

  it('basic_code_generation_alphanumeric', () => {
    const generator = new QArr();
    const qrCodeData = generator.create('123ABC', v => new TestQRCode(v), { ecc: ECCLevel.H });
    expect(qrCodeData.version).toBe(10);
    expect(qrCodeData.moduleMatrix.length).toBe(10);
  });

  it('basic_code_generation_utf8', () => {
    const generator = new QArr();
    const qrCodeData = generator.create('hello§ßöÜä+123', v => new TestQRCode(v), { ecc: ECCLevel.H });
    expect(qrCodeData.version).toBe(10);
    expect(qrCodeData.moduleMatrix.length).toBe(10);
  }); */

});
