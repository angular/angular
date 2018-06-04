/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Parameter, reflectConstructorParameters} from '../src/reflector';

import {getDeclaration, makeProgram} from './in_memory_typescript';

describe('reflector', () => {
  describe('ctor params', () => {
    it('should reflect a single argument', () => {
      const program = makeProgram([{
        name: 'entry.ts',
        contents: `
            class Bar {}

            class Foo {
              constructor(bar: Bar) {}
            }
        `
      }]);
      const clazz = getDeclaration(program, 'entry.ts', 'Foo', ts.isClassDeclaration);
      const checker = program.getTypeChecker();
      const args = reflectConstructorParameters(clazz, checker) !;
      expect(args.length).toBe(1);
      expectArgument(args[0], 'bar', 'Bar');
    });

    it('should reflect a decorated argument', () => {
      const program = makeProgram([
        {
          name: 'dec.ts',
          contents: `
          export function dec(target: any, key: string, index: number) {
          }
        `
        },
        {
          name: 'entry.ts',
          contents: `
            import {dec} from './dec';
            class Bar {}
            
            class Foo {
              constructor(@dec bar: Bar) {}
            }
        `
        }
      ]);
      const clazz = getDeclaration(program, 'entry.ts', 'Foo', ts.isClassDeclaration);
      const checker = program.getTypeChecker();
      const args = reflectConstructorParameters(clazz, checker) !;
      expect(args.length).toBe(1);
      expectArgument(args[0], 'bar', 'Bar', 'dec', './dec');
    });

    it('should reflect a decorated argument with a call', () => {
      const program = makeProgram([
        {
          name: 'dec.ts',
          contents: `
          export function dec(target: any, key: string, index: number) {
          }
        `
        },
        {
          name: 'entry.ts',
          contents: `
            import {dec} from './dec';
            class Bar {}
            
            class Foo {
              constructor(@dec bar: Bar) {}
            }
        `
        }
      ]);
      const clazz = getDeclaration(program, 'entry.ts', 'Foo', ts.isClassDeclaration);
      const checker = program.getTypeChecker();
      const args = reflectConstructorParameters(clazz, checker) !;
      expect(args.length).toBe(1);
      expectArgument(args[0], 'bar', 'Bar', 'dec', './dec');
    });

    it('should reflect a decorated argument with an indirection', () => {
      const program = makeProgram([
        {
          name: 'bar.ts',
          contents: `
          export class Bar {}
        `
        },
        {
          name: 'entry.ts',
          contents: `
            import {Bar} from './bar';
            import * as star from './bar';
            
            class Foo {
              constructor(bar: Bar, otherBar: star.Bar) {}
            }
        `
        }
      ]);
      const clazz = getDeclaration(program, 'entry.ts', 'Foo', ts.isClassDeclaration);
      const checker = program.getTypeChecker();
      const args = reflectConstructorParameters(clazz, checker) !;
      expect(args.length).toBe(2);
      expectArgument(args[0], 'bar', 'Bar');
      expectArgument(args[1], 'otherBar', 'star.Bar');
    });
  });
});

function expectArgument(
    arg: Parameter, name: string, type?: string, decorator?: string, decoratorFrom?: string): void {
  expect(argExpressionToString(arg.name)).toEqual(name);
  if (type === undefined) {
    expect(arg.typeValueExpr).toBeNull();
  } else {
    expect(arg.typeValueExpr).not.toBeNull();
    expect(argExpressionToString(arg.typeValueExpr !)).toEqual(type);
  }
  if (decorator !== undefined) {
    expect(arg.decorators.length).toBeGreaterThan(0);
    expect(arg.decorators.some(dec => dec.name === decorator && dec.from === decoratorFrom))
        .toBe(true);
  }
}

function argExpressionToString(name: ts.Node): string {
  if (ts.isIdentifier(name)) {
    return name.text;
  } else if (ts.isPropertyAccessExpression(name)) {
    return `${argExpressionToString(name.expression)}.${name.name.text}`;
  } else {
    throw new Error(`Unexpected node in arg expression: ${ts.SyntaxKind[name.kind]}.`);
  }
}