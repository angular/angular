/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {CtorParameter} from '../../host';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {TypeScriptReflectionHost} from '../src/reflector';

describe('reflector', () => {
  describe('ctor params', () => {
    it('should reflect a single argument', () => {
      const {program} = makeProgram([{
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
      const host = new TypeScriptReflectionHost(checker);
      const args = host.getConstructorParameters(clazz) !;
      expect(args.length).toBe(1);
      expectParameter(args[0], 'bar', 'Bar');
    });

    it('should reflect a decorated argument', () => {
      const {program} = makeProgram([
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
      const host = new TypeScriptReflectionHost(checker);
      const args = host.getConstructorParameters(clazz) !;
      expect(args.length).toBe(1);
      expectParameter(args[0], 'bar', 'Bar', 'dec', './dec');
    });

    it('should reflect a decorated argument with a call', () => {
      const {program} = makeProgram([
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
      const host = new TypeScriptReflectionHost(checker);
      const args = host.getConstructorParameters(clazz) !;
      expect(args.length).toBe(1);
      expectParameter(args[0], 'bar', 'Bar', 'dec', './dec');
    });

    it('should reflect a decorated argument with an indirection', () => {
      const {program} = makeProgram([
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
      const host = new TypeScriptReflectionHost(checker);
      const args = host.getConstructorParameters(clazz) !;
      expect(args.length).toBe(2);
      expectParameter(args[0], 'bar', 'Bar');
      expectParameter(args[1], 'otherBar', 'star.Bar');
    });
  });

  it('should reflect a re-export', () => {
    const {program} = makeProgram([
      {name: '/node_modules/absolute/index.ts', contents: 'export class Target {}'},
      {name: 'local1.ts', contents: `export {Target as AliasTarget} from 'absolute';`},
      {name: 'local2.ts', contents: `export {AliasTarget as Target} from './local1';`}, {
        name: 'entry.ts',
        contents: `
          import {Target} from './local2';
          import {Target as DirectTarget} from 'absolute';

          const target = Target;
          const directTarget = DirectTarget;
      `
      }
    ]);
    const target = getDeclaration(program, 'entry.ts', 'target', ts.isVariableDeclaration);
    if (target.initializer === undefined || !ts.isIdentifier(target.initializer)) {
      return fail('Unexpected initializer for target');
    }
    const directTarget =
        getDeclaration(program, 'entry.ts', 'directTarget', ts.isVariableDeclaration);
    if (directTarget.initializer === undefined || !ts.isIdentifier(directTarget.initializer)) {
      return fail('Unexpected initializer for directTarget');
    }
    const Target = target.initializer;
    const DirectTarget = directTarget.initializer;

    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const targetDecl = host.getDeclarationOfIdentifier(Target);
    const directTargetDecl = host.getDeclarationOfIdentifier(DirectTarget);
    if (targetDecl === null) {
      return fail('No declaration found for Target');
    } else if (directTargetDecl === null) {
      return fail('No declaration found for DirectTarget');
    }
    expect(targetDecl.node.getSourceFile().fileName).toBe('/node_modules/absolute/index.ts');
    expect(ts.isClassDeclaration(targetDecl.node)).toBe(true);
    expect(directTargetDecl.viaModule).toBe('absolute');
    expect(directTargetDecl.node).toBe(targetDecl.node);
  });
});

function expectParameter(
    param: CtorParameter, name: string, type?: string, decorator?: string,
    decoratorFrom?: string): void {
  expect(param.name !).toEqual(name);
  if (type === undefined) {
    expect(param.type).toBeNull();
  } else {
    expect(param.type).not.toBeNull();
    expect(argExpressionToString(param.type !)).toEqual(type);
  }
  if (decorator !== undefined) {
    expect(param.decorators).not.toBeNull();
    expect(param.decorators !.length).toBeGreaterThan(0);
    expect(param.decorators !.some(
               dec => dec.name === decorator && dec.import !== null &&
                   dec.import.from === decoratorFrom))
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