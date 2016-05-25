import {
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit
} from '@angular/core/testing/testing_internal';

import {IS_DART} from '../../facade/src/lang';
import {getSymbolsFromLibrary} from './symbol_inspector';

export function main() {
  describe('symbol inspector', () => {
    if (IS_DART) {
      it('should extract symbols (dart)', () => {
        var symbols = getSymbolsFromLibrary("simple_library");
        expect(symbols).toEqual([
          'A',
          'ClosureParam',
          'ClosureReturn',
          'ConsParamType',
          'FieldType',
          'Generic',
          'GetterType',
          'MethodReturnType',
          'ParamType',
          'SomeInterface',
          'StaticFieldType',
          'TypedefParam',
          'TypedefReturnType'
        ]);
      });
    } else {
      it('should extract symbols (js)', () => {
        var symbols = getSymbolsFromLibrary("simple_library");
        expect(symbols).toEqual([
          'A',
          'ClosureParam',
          'ClosureReturn',
          'ConsParamType',
          'FieldType',
          'Generic',
          'GetterType',
          'MethodReturnType',
          'ParamType',
          'StaticFieldType',
          'TypedefParam',
          'TypedefReturnType'
        ]);
      });
    }
  });
}
