/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {transformSync} from '@babel/core';

import {makeLocalePlugin} from '../../../src/translate/source_files/locale_plugin';

describe('makeLocalePlugin', () => {
  it('should replace $localize.locale with the locale string', () => {
    const input = '$localize.locale;';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('"fr";');
  });

  it('should replace $localize.locale with the locale string in the context of a variable assignment',
     () => {
       const input = 'const a = $localize.locale;';
       const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
       expect(output.code).toEqual('const a = "fr";');
     });

  it('should replace $localize.locale with the locale string in the context of a binary expression',
     () => {
       const input = '$localize.locale || "default";';
       const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
       expect(output.code).toEqual('"fr" || "default";');
     });

  it('should remove reference to `$localize` if used to guard the locale', () => {
    const input = 'typeof $localize !== "undefined" && $localize.locale;';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('"fr";');
  });

  it('should remove reference to `$localize` if used in a longer logical expression to guard the locale',
     () => {
       const input1 = 'x || y && typeof $localize !== "undefined" && $localize.locale;';
       const output1 = transformSync(input1, {plugins: [makeLocalePlugin('fr')]})!;
       expect(output1.code).toEqual('x || y && "fr";');

       const input2 = 'x || y && "undefined" !== typeof $localize && $localize.locale;';
       const output2 = transformSync(input2, {plugins: [makeLocalePlugin('fr')]})!;
       expect(output2.code).toEqual('x || y && "fr";');

       const input3 = 'x || y && typeof $localize != "undefined" && $localize.locale;';
       const output3 = transformSync(input3, {plugins: [makeLocalePlugin('fr')]})!;
       expect(output3.code).toEqual('x || y && "fr";');

       const input4 = 'x || y && "undefined" != typeof $localize && $localize.locale;';
       const output4 = transformSync(input4, {plugins: [makeLocalePlugin('fr')]})!;
       expect(output4.code).toEqual('x || y && "fr";');
     });

  it('should ignore properties on $localize other than `locale`', () => {
    const input = '$localize.notLocale;';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('$localize.notLocale;');
  });

  it('should ignore indexed property on $localize', () => {
    const input = '$localize["locale"];';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('$localize["locale"];');
  });

  it('should ignore `locale` on objects other than $localize', () => {
    const input = '$notLocalize.locale;';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('$notLocalize.locale;');
  });

  it('should ignore `$localize.locale` if `$localize` is not global', () => {
    const input = 'const $localize = {};\n$localize.locale;';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('const $localize = {};\n$localize.locale;');
  });

  it('should ignore `locale` if it is not directly accessed from `$localize`', () => {
    const input = 'const {locale} = $localize;\nconst a = locale;';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('const {\n  locale\n} = $localize;\nconst a = locale;');
  });

  it('should ignore `$localize.locale` on LHS of an assignment', () => {
    const input = 'let a;\na = $localize.locale = "de";';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('let a;\na = $localize.locale = "de";');
  });

  it('should handle `$localize.locale on RHS of an assignment', () => {
    const input = 'let a;\na = $localize.locale;';
    const output = transformSync(input, {plugins: [makeLocalePlugin('fr')]})!;
    expect(output.code).toEqual('let a;\na = "fr";');
  });
});
