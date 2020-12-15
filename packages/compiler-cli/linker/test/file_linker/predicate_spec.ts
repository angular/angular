/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {sourceFileMayNeedLinking} from '../../src/file_linker/predicate';

describe('sourceFileMayNeedLinking', () => {
  it('should return true for directive declarations', () => {
    expect(sourceFileMayNeedLinking(`
      export class Dir {
        ɵdir = ɵɵngDeclareDirective({type: Dir});
      }
    `)).toBeTrue();
  });

  it('should return true for unrelated usages of ɵɵngDeclareDirective', () => {
    expect(sourceFileMayNeedLinking(`
      const fnName = 'ɵɵngDeclareDirective';
    `)).toBeTrue();
  });

  it('should return false when the file does not contain ɵɵngDeclareDirective', () => {
    expect(sourceFileMayNeedLinking(`
      const foo = ngDeclareDirective;
    `)).toBeFalse();
  });

  it('should return true for component declarations', () => {
    expect(sourceFileMayNeedLinking(`
      export class Cmp {
        ɵdir = ɵɵngDeclareComponent({type: Cmp});
      }
    `)).toBeTrue();
  });

  it('should return true for unrelated usages of ɵɵngDeclareComponent', () => {
    expect(sourceFileMayNeedLinking(`
      const fnName = 'ɵɵngDeclareComponent';
    `)).toBeTrue();
  });

  it('should return false when the file does not contain ɵɵngDeclareComponent', () => {
    expect(sourceFileMayNeedLinking(`
      const foo = ngDeclareComponent;
    `)).toBeFalse();
  });
});
