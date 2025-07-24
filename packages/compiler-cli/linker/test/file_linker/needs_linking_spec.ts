/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {needsLinking} from '../../src/file_linker/needs_linking';

describe('needsLinking', () => {
  it('should return true for directive declarations', () => {
    expect(
      needsLinking(
        'file.js',
        `
      export class Dir {
        ɵdir = ɵɵngDeclareDirective({type: Dir});
      }
    `,
      ),
    ).toBeTrue();
  });

  it('should return true for namespaced directive declarations', () => {
    expect(
      needsLinking(
        'file.js',
        `
      export class Dir {
        ɵdir = ng.ɵɵngDeclareDirective({type: Dir});
      }
    `,
      ),
    ).toBeTrue();
  });

  it('should return true for unrelated usages of ɵɵngDeclareDirective', () => {
    expect(
      needsLinking(
        'file.js',
        `
      const fnName = 'ɵɵngDeclareDirective';
    `,
      ),
    ).toBeTrue();
  });

  it('should return false when the file does not contain ɵɵngDeclareDirective', () => {
    expect(
      needsLinking(
        'file.js',
        `
      const foo = ngDeclareDirective;
    `,
      ),
    ).toBeFalse();
  });

  it('should return true for component declarations', () => {
    expect(
      needsLinking(
        'file.js',
        `
      export class Cmp {
        ɵdir = ɵɵngDeclareComponent({type: Cmp});
      }
    `,
      ),
    ).toBeTrue();
  });

  it('should return true for namespaced component declarations', () => {
    expect(
      needsLinking(
        'file.js',
        `
      export class Cmp {
        ɵdir = ng.ɵɵngDeclareComponent({type: Cmp});
      }
    `,
      ),
    ).toBeTrue();
  });

  it('should return true for unrelated usages of ɵɵngDeclareComponent', () => {
    expect(
      needsLinking(
        'file.js',
        `
      const fnName = 'ɵɵngDeclareComponent';
    `,
      ),
    ).toBeTrue();
  });

  it('should return false when the file does not contain ɵɵngDeclareComponent', () => {
    expect(
      needsLinking(
        'file.js',
        `
      const foo = ngDeclareComponent;
    `,
      ),
    ).toBeFalse();
  });
});
