/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computeMsgId, utf8Encode} from '../src/digest';

describe('computeMsgId()', () => {
  it('should work on well known inputs w/o meaning', () => {
    const fixtures: {[msg: string]: string} = {
      '  Spaced  Out  ': '3976450302996657536',
      'Last Name': '4407559560004943843',
      'First Name': '6028371114637047813',
      'View': '2509141182388535183',
      'START_BOLDNUMEND_BOLD of START_BOLDmillionsEND_BOLD': '29997634073898638',
      'The customer\'s credit card was authorized for AMOUNT and passed all risk checks.':
          '6836487644149622036',
      'Hello world!': '3022994926184248873',
      'Jalape\u00f1o': '8054366208386598941',
      'The set of SET_NAME is {XXX, ...}.': '135956960462609535',
      'NAME took a trip to DESTINATION.': '768490705511913603',
      'by AUTHOR (YEAR)': '7036633296476174078',
      '': '4416290763660062288',
    };

    Object.keys(fixtures).forEach((msg) => {
      expect(computeMsgId(msg, '')).toEqual(fixtures[msg]);
    });
  });

  it('should work on well known inputs with meaning', () => {
    const fixtures: {[msg: string]: [string, string]} = {
      '7790835225175622807': ['Last Name', 'Gmail UI'],
      '1809086297585054940': ['First Name', 'Gmail UI'],
      '3993998469942805487': ['View', 'Gmail UI'],
    };

    Object.keys(fixtures).forEach((id) => {
      expect(computeMsgId(fixtures[id][0], fixtures[id][1])).toEqual(id);
    });
  });

  it('should support arbitrary string size', () => {
    const prefix = `你好，世界`;
    let result = computeMsgId(prefix, '');
    for (let size = prefix.length; size < 5000; size += 101) {
      result = prefix + computeMsgId(result, '');
      while (result.length < size) {
        result += result;
      }
      result = result.slice(-size);
    }
    expect(computeMsgId(result, '')).toEqual('2122606631351252558');
  });
});

describe('utf8Encode()', () => {
  // tests from https://github.com/mathiasbynens/wtf-8
  it('should encode to utf8', () => {
    const tests = [
      ['abc', 'abc'],
      // // 1-byte
      ['\0', '\0'],
      // // 2-byte
      ['\u0080', '\xc2\x80'],
      ['\u05ca', '\xd7\x8a'],
      ['\u07ff', '\xdf\xbf'],
      // // 3-byte
      ['\u0800', '\xe0\xa0\x80'],
      ['\u2c3c', '\xe2\xb0\xbc'],
      ['\uffff', '\xef\xbf\xbf'],
      // //4-byte
      ['\uD800\uDC00', '\xF0\x90\x80\x80'],
      ['\uD834\uDF06', '\xF0\x9D\x8C\x86'],
      ['\uDBFF\uDFFF', '\xF4\x8F\xBF\xBF'],
      // unmatched surrogate halves
      // high surrogates: 0xD800 to 0xDBFF
      ['\uD800', '\xED\xA0\x80'],
      ['\uD800\uD800', '\xED\xA0\x80\xED\xA0\x80'],
      ['\uD800A', '\xED\xA0\x80A'],
      ['\uD800\uD834\uDF06\uD800', '\xED\xA0\x80\xF0\x9D\x8C\x86\xED\xA0\x80'],
      ['\uD9AF', '\xED\xA6\xAF'],
      ['\uDBFF', '\xED\xAF\xBF'],
      // low surrogates: 0xDC00 to 0xDFFF
      ['\uDC00', '\xED\xB0\x80'],
      ['\uDC00\uDC00', '\xED\xB0\x80\xED\xB0\x80'],
      ['\uDC00A', '\xED\xB0\x80A'],
      ['\uDC00\uD834\uDF06\uDC00', '\xED\xB0\x80\xF0\x9D\x8C\x86\xED\xB0\x80'],
      ['\uDEEE', '\xED\xBB\xAE'],
      ['\uDFFF', '\xED\xBF\xBF'],
    ];
    tests.forEach(([input, output]) => {
      expect(utf8Encode(input).map((byte) => String.fromCharCode(byte)).join('')).toEqual(output);
    });
  });
});
