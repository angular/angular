/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {getDeclaration, makeProgram} from '../../testing';
import {CtorParameter} from '../src/host';
import {TypeScriptReflectionHost} from '../src/typescript';
import {isNamedClassDeclaration} from '../src/util';

runInEachFileSystem(() => {
  describe('reflector', () => {
    let _: typeof absoluteFrom;

    beforeEach(() => _ = absoluteFrom);

    describe('getConstructorParameters()', () => {
      it('should reflect a single argument', () => {
        const {program} = makeProgram([{
          name: _('/entry.ts'),
          contents: `
            class Bar {}

            class Foo {
              constructor(bar: Bar) {}
            }
        `
        }]);
        const clazz = getDeclaration(program, _('/entry.ts'), 'Foo', isNamedClassDeclaration);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const args = host.getConstructorParameters(clazz) !;
        expect(args.length).toBe(1);
        expectParameter(args[0], 'bar', 'Bar');
      });

      it('should reflect a decorated argument', () => {
        const {program} = makeProgram([
          {
            name: _('/dec.ts'),
            contents: `
          export function dec(target: any, key: string, index: number) {
          }
        `
          },
          {
            name: _('/entry.ts'),
            contents: `
            import {dec} from './dec';
            class Bar {}

            class Foo {
              constructor(@dec bar: Bar) {}
            }
        `
          }
        ]);
        const clazz = getDeclaration(program, _('/entry.ts'), 'Foo', isNamedClassDeclaration);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const args = host.getConstructorParameters(clazz) !;
        expect(args.length).toBe(1);
        expectParameter(args[0], 'bar', 'Bar', 'dec', './dec');
      });

      it('should reflect a decorated argument with a call', () => {
        const {program} = makeProgram([
          {
            name: _('/dec.ts'),
            contents: `
          export function dec(target: any, key: string, index: number) {
          }
        `
          },
          {
            name: _('/entry.ts'),
            contents: `
            import {dec} from './dec';
            class Bar {}

            class Foo {
              constructor(@dec bar: Bar) {}
            }
        `
          }
        ]);
        const clazz = getDeclaration(program, _('/entry.ts'), 'Foo', isNamedClassDeclaration);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const args = host.getConstructorParameters(clazz) !;
        expect(args.length).toBe(1);
        expectParameter(args[0], 'bar', 'Bar', 'dec', './dec');
      });

      it('should reflect a decorated argument with an indirection', () => {
        const {program} = makeProgram([
          {
            name: _('/bar.ts'),
            contents: `
          export class Bar {}
        `
          },
          {
            name: _('/entry.ts'),
            contents: `
            import {Bar} from './bar';
            import * as star from './bar';

            class Foo {
              constructor(bar: Bar, otherBar: star.Bar) {}
            }
        `
          }
        ]);
        const clazz = getDeclaration(program, _('/entry.ts'), 'Foo', isNamedClassDeclaration);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const args = host.getConstructorParameters(clazz) !;
        expect(args.length).toBe(2);
        expectParameter(args[0], 'bar', {moduleName: './bar', name: 'Bar'});
        expectParameter(args[1], 'otherBar', {moduleName: './bar', name: 'Bar'});
      });

      it('should reflect an argument from an aliased import', () => {
        const {program} = makeProgram([
          {
            name: _('/bar.ts'),
            contents: `
          export class Bar {}
        `
          },
          {
            name: _('/entry.ts'),
            contents: `
            import {Bar as LocalBar} from './bar';

            class Foo {
              constructor(bar: LocalBar) {}
            }
        `
          }
        ]);
        const clazz = getDeclaration(program, _('/entry.ts'), 'Foo', isNamedClassDeclaration);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const args = host.getConstructorParameters(clazz) !;
        expect(args.length).toBe(1);
        expectParameter(args[0], 'bar', {moduleName: './bar', name: 'Bar'});
      });

      it('should reflect an argument from a default import', () => {
        const {program} = makeProgram([
          {
            name: _('/bar.ts'),
            contents: `
          export default class Bar {}
        `
          },
          {
            name: _('/entry.ts'),
            contents: `
            import Bar from './bar';

            class Foo {
              constructor(bar: Bar) {}
            }
        `
          }
        ]);
        const clazz = getDeclaration(program, _('/entry.ts'), 'Foo', isNamedClassDeclaration);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const args = host.getConstructorParameters(clazz) !;
        expect(args.length).toBe(1);
        const param = args[0].typeValueReference;
        if (param === null || !param.local) {
          return fail('Expected local parameter');
        }
        expect(param).not.toBeNull();
        expect(param.defaultImportStatement).not.toBeNull();
      });

      it('should reflect a nullable argument', () => {
        const {program} = makeProgram([
          {
            name: _('/bar.ts'),
            contents: `
          export class Bar {}
        `
          },
          {
            name: _('/entry.ts'),
            contents: `
            import {Bar} from './bar';

            class Foo {
              constructor(bar: Bar|null) {}
            }
        `
          }
        ]);
        const clazz = getDeclaration(program, _('/entry.ts'), 'Foo', isNamedClassDeclaration);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const args = host.getConstructorParameters(clazz) !;
        expect(args.length).toBe(1);
        expectParameter(args[0], 'bar', {moduleName: './bar', name: 'Bar'});
      });
    });


    describe('getImportOfIdentifier()', () => {
      it('should resolve a direct import', () => {
        const {program} = makeProgram([
          {name: _('/node_modules/absolute/index.ts'), contents: 'export class Target {}'},
          {
            name: _('/entry.ts'),
            contents: `
            import {Target} from 'absolute';
            let foo: Target;
        `
          },
        ]);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);

        const foo = getDeclaration(program, _('/entry.ts'), 'foo', ts.isVariableDeclaration);
        if (foo.type === undefined || !ts.isTypeReferenceNode(foo.type) ||
            !ts.isIdentifier(foo.type.typeName)) {
          return fail('Unexpected type for foo');
        }
        const Target = foo.type.typeName;
        const directImport = host.getImportOfIdentifier(Target);
        expect(directImport).toEqual({
          name: 'Target',
          from: 'absolute',
        });
      });

      it('should resolve a namespaced import', () => {
        const {program} = makeProgram([
          {name: _('/node_modules/absolute/index.ts'), contents: 'export class Target {}'},
          {
            name: _('/entry.ts'),
            contents: `
            import * as abs from 'absolute';
            let foo: abs.Target;
        `
          },
        ]);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);

        const foo = getDeclaration(program, _('/entry.ts'), 'foo', ts.isVariableDeclaration);
        if (foo.type === undefined || !ts.isTypeReferenceNode(foo.type) ||
            !ts.isQualifiedName(foo.type.typeName)) {
          return fail('Unexpected type for foo');
        }
        const Target = foo.type.typeName.right;
        const namespacedImport = host.getImportOfIdentifier(Target);
        expect(namespacedImport).toEqual({
          name: 'Target',
          from: 'absolute',
        });
      });
    });

    describe('getDeclarationOfIdentifier()', () => {
      it('should reflect a re-export', () => {
        const {program} = makeProgram([
          {name: _('/node_modules/absolute/index.ts'), contents: 'export class Target {}'},
          {name: _('/local1.ts'), contents: `export {Target as AliasTarget} from 'absolute';`},
          {name: _('/local2.ts'), contents: `export {AliasTarget as Target} from './local1';`}, {
            name: _('/entry.ts'),
            contents: `
            import {Target} from './local2';
            import {Target as DirectTarget} from 'absolute';

            const target = Target;
            const directTarget = DirectTarget;
        `
          }
        ]);
        const target = getDeclaration(program, _('/entry.ts'), 'target', ts.isVariableDeclaration);
        if (target.initializer === undefined || !ts.isIdentifier(target.initializer)) {
          return fail('Unexpected initializer for target');
        }
        const directTarget =
            getDeclaration(program, _('/entry.ts'), 'directTarget', ts.isVariableDeclaration);
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
        expect(targetDecl.node.getSourceFile().fileName).toBe(_('/node_modules/absolute/index.ts'));
        expect(ts.isClassDeclaration(targetDecl.node)).toBe(true);
        expect(directTargetDecl.viaModule).toBe('absolute');
        expect(directTargetDecl.node).toBe(targetDecl.node);
      });

      it('should resolve a direct import', () => {
        const {program} = makeProgram([
          {name: _('/node_modules/absolute/index.ts'), contents: 'export class Target {}'},
          {
            name: _('/entry.ts'),
            contents: `
            import {Target} from 'absolute';
            let foo: Target;
        `
          },
        ]);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);

        const targetDecl = getDeclaration(
            program, _('/node_modules/absolute/index.ts'), 'Target', ts.isClassDeclaration);
        const foo = getDeclaration(program, _('/entry.ts'), 'foo', ts.isVariableDeclaration);
        if (foo.type === undefined || !ts.isTypeReferenceNode(foo.type) ||
            !ts.isIdentifier(foo.type.typeName)) {
          return fail('Unexpected type for foo');
        }
        const Target = foo.type.typeName;
        const decl = host.getDeclarationOfIdentifier(Target);
        expect(decl).toEqual({
          node: targetDecl,
          viaModule: 'absolute',
        });
      });

      it('should resolve a namespaced import', () => {
        const {program} = makeProgram([
          {name: _('/node_modules/absolute/index.ts'), contents: 'export class Target {}'},
          {
            name: _('/entry.ts'),
            contents: `
            import * as abs from 'absolute';
            let foo: abs.Target;
        `
          },
        ]);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);

        const targetDecl = getDeclaration(
            program, _('/node_modules/absolute/index.ts'), 'Target', ts.isClassDeclaration);
        const foo = getDeclaration(program, _('/entry.ts'), 'foo', ts.isVariableDeclaration);
        if (foo.type === undefined || !ts.isTypeReferenceNode(foo.type) ||
            !ts.isQualifiedName(foo.type.typeName)) {
          return fail('Unexpected type for foo');
        }
        const Target = foo.type.typeName.right;
        const decl = host.getDeclarationOfIdentifier(Target);
        expect(decl).toEqual({
          node: targetDecl,
          viaModule: 'absolute',
        });
      });
    });

    describe('getExportsOfModule()', () => {
      it('should handle simple exports', () => {
        const {program} = makeProgram([
          {
            name: _('/entry.ts'),
            contents: `
            export const x = 10;
            export function foo() {}
            export type T = string;
            export interface I {}
            export enum E {}
        `
          },
        ]);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const exportedDeclarations =
            host.getExportsOfModule(program.getSourceFile(_('/entry.ts')) !);
        expect(Array.from(exportedDeclarations !.keys())).toEqual(['foo', 'x', 'T', 'I', 'E']);
        expect(Array.from(exportedDeclarations !.values()).map(v => v.viaModule)).toEqual([
          null, null, null, null, null
        ]);
      });

      it('should handle re-exports', () => {
        const {program} = makeProgram([
          {name: _('/node_modules/absolute/index.ts'), contents: 'export class Target {}'},
          {name: _('/local1.ts'), contents: `export {Target as AliasTarget} from 'absolute';`},
          {name: _('/local2.ts'), contents: `export {AliasTarget as Target} from './local1';`},
          {
            name: _('/entry.ts'),
            contents: `
            export {Target as Target1} from 'absolute';
            export {AliasTarget} from './local1';
            export {Target as AliasTarget2} from './local2';
            export * from 'absolute';
        `
          },
        ]);
        const checker = program.getTypeChecker();
        const host = new TypeScriptReflectionHost(checker);
        const exportedDeclarations =
            host.getExportsOfModule(program.getSourceFile(_('/entry.ts')) !);
        expect(Array.from(exportedDeclarations !.keys())).toEqual([
          'Target1', 'AliasTarget', 'AliasTarget2', 'Target'
        ]);
        expect(Array.from(exportedDeclarations !.values()).map(v => v.viaModule)).toEqual([
          null, null, null, null
        ]);
      });
    });
  });

  function expectParameter(
      param: CtorParameter, name: string, type?: string | {name: string, moduleName: string},
      decorator?: string, decoratorFrom?: string): void {
    expect(param.name !).toEqual(name);
    if (type === undefined) {
      expect(param.typeValueReference).toBeNull();
    } else {
      if (param.typeValueReference === null) {
        return fail(`Expected parameter ${name} to have a typeValueReference`);
      }
      if (param.typeValueReference.local && typeof type === 'string') {
        expect(argExpressionToString(param.typeValueReference.expression)).toEqual(type);
      } else if (!param.typeValueReference.local && typeof type !== 'string') {
        expect(param.typeValueReference.moduleName).toEqual(type.moduleName);
        expect(param.typeValueReference.name).toEqual(type.name);
      } else {
        return fail(
            `Mismatch between typeValueReference and expected type: ${param.name} / ${param.typeValueReference.local}`);
      }
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

  function argExpressionToString(name: ts.Node | null): string {
    if (name == null) {
      throw new Error('\'name\' argument can\'t be null');
    }

    if (ts.isIdentifier(name)) {
      return name.text;
    } else if (ts.isPropertyAccessExpression(name)) {
      return `${argExpressionToString(name.expression)}.${name.name.text}`;
    } else {
      throw new Error(`Unexpected node in arg expression: ${ts.SyntaxKind[name.kind]}.`);
    }
  }
});
