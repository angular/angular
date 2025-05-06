/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {makeGenericsText} from '../../transforms/code-transforms.mjs';

describe('makeGenericsText', () => {
  it('should return an empty string if no generics are provided', () => {
    expect(makeGenericsText(undefined)).toBe('');
    expect(makeGenericsText([])).toBe('');
  });

  it('should return a single generic type without constraints or default', () => {
    const generics = [{name: 'T', constraint: undefined, default: undefined}];
    expect(makeGenericsText(generics)).toBe('<T>');
  });

  it('should handle a single generic type with a constraint', () => {
    const generics = [{name: 'T', constraint: 'string', default: undefined}];
    expect(makeGenericsText(generics)).toBe('<T extends string>');
  });

  it('should handle a single generic type with a default value', () => {
    const generics = [{name: 'T', default: 'number', constraint: undefined}];
    expect(makeGenericsText(generics)).toBe('<T = number>');
  });

  it('should handle a single generic type with both constraint and default value', () => {
    const generics = [{name: 'T', constraint: 'string', default: 'number'}];
    expect(makeGenericsText(generics)).toBe('<T extends string = number>');
  });

  it('should handle multiple generic types without constraints or defaults', () => {
    const generics = [
      {name: 'T', constraint: undefined, default: undefined},
      {name: 'U', constraint: undefined, default: undefined},
    ];
    expect(makeGenericsText(generics)).toBe('<T, U>');
  });

  it('should handle multiple generic types with constraints and defaults', () => {
    const generics = [
      {name: 'T', constraint: 'string', default: 'number'},
      {name: 'U', constraint: 'boolean', default: undefined},
      {name: 'V', default: 'any', constraint: undefined},
    ];
    expect(makeGenericsText(generics)).toBe(
      '<T extends string = number, U extends boolean, V = any>',
    );
  });

  it('should handle complex generics with mixed constraints and defaults', () => {
    const generics = [
      {name: 'A', constraint: 'string', default: undefined},
      {name: 'B', constraint: undefined, default: undefined},
      {name: 'C', default: 'number', constraint: undefined},
      {name: 'D', constraint: 'boolean', default: 'true'},
    ];
    expect(makeGenericsText(generics)).toBe(
      '<A extends string, B, C = number, D extends boolean = true>',
    );
  });
});
