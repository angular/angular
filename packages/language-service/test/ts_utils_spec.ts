/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli';
import ts from 'typescript';

import {
  addElementToArrayLiteral,
  collectMemberMethods,
  ensureArrayWithIdentifier,
  findTightestNode,
  generateImport,
  hasImport,
  nonCollidingImportName,
  objectPropertyAssignmentForKey,
  printNode,
  updateImport,
  updateObjectValueForKey,
} from '../src/utils/ts_utils';
import {LanguageServiceTestEnv, OpenBuffer, Project} from '../testing';

describe('TS util', () => {
  describe('collectMemberMethods', () => {
    beforeEach(() => {
      initMockFileSystem('Native');
    });

    it('gets only methods in class, not getters, setters, or properties', () => {
      const files = {
        'app.ts': `
              export class AppCmp {
                prop!: string;
                get myString(): string {
                    return '';
                }
                set myString(v: string) {
                }

                one() {}
                two() {}
              }`,
      };
      const env = LanguageServiceTestEnv.setup();
      const project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('AppC¦mp');
      const memberMethods = getMemberMethodNames(project, appFile);
      expect(memberMethods).toEqual(['one', 'two']);
    });

    it('gets inherited methods in class', () => {
      const files = {
        'app.ts': `
              export class BaseClass {
                baseMethod() {}
              }
              export class AppCmp extends BaseClass {}`,
      };
      const env = LanguageServiceTestEnv.setup();
      const project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('AppC¦mp');
      const memberMethods = getMemberMethodNames(project, appFile);
      expect(memberMethods).toEqual(['baseMethod']);
    });

    it('does not return duplicates if base method is overridden', () => {
      const files = {
        'app.ts': `
              export class BaseClass {
                baseMethod() {}
              }
              export class AppCmp extends BaseClass {
                  baseMethod() {}
              }`,
      };
      const env = LanguageServiceTestEnv.setup();
      const project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('AppC¦mp');
      const memberMethods = getMemberMethodNames(project, appFile);
      expect(memberMethods).toEqual(['baseMethod']);
    });

    function getMemberMethodNames(project: Project, file: OpenBuffer): string[] {
      const sf = project.getSourceFile('app.ts')!;
      const node = findTightestNode(sf, file.cursor)!;
      expect(ts.isClassDeclaration(node.parent)).toBe(true);
      return collectMemberMethods(node.parent as ts.ClassDeclaration, project.getTypeChecker())
        .map((m) => m.name.getText())
        .sort();
    }
  });

  describe('AST method', () => {
    let printer: ts.Printer;
    let sourceFile: ts.SourceFile;

    function print(node: ts.Node): string {
      return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
    }

    beforeAll(() => {
      printer = ts.createPrinter();
      sourceFile = ts.createSourceFile(
        'placeholder.ts',
        '',
        ts.ScriptTarget.ESNext,
        true,
        ts.ScriptKind.TS,
      );
    });

    describe('addElementToArrayLiteral', () => {
      it('transforms an empty array literal expression', () => {
        const oldArr = ts.factory.createArrayLiteralExpression([], false);
        const newArr = addElementToArrayLiteral(oldArr, ts.factory.createStringLiteral('a'));
        expect(print(newArr)).toEqual('["a"]');
      });

      it('transforms an existing array literal expression', () => {
        const oldArr = ts.factory.createArrayLiteralExpression(
          [ts.factory.createStringLiteral('a')],
          false,
        );
        const newArr = addElementToArrayLiteral(oldArr, ts.factory.createStringLiteral('b'));
        expect(print(newArr)).toEqual('["a", "b"]');
      });
    });

    describe('objectPropertyAssignmentForKey', () => {
      let oldObj: ts.ObjectLiteralExpression;

      beforeEach(() => {
        oldObj = ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier('foo'),
              ts.factory.createStringLiteral('bar'),
            ),
          ],
          false,
        );
      });

      it('returns null when no property exists', () => {
        const prop = objectPropertyAssignmentForKey(oldObj, 'oops');
        expect(prop).toBeNull();
      });

      it('returns the requested property assignment', () => {
        const prop = objectPropertyAssignmentForKey(oldObj, 'foo');
        expect(print(prop!)).toEqual('foo: "bar"');
      });
    });

    describe('updateObjectValueForKey', () => {
      let oldObj: ts.ObjectLiteralExpression;

      const valueAppenderFn = (oldValue?: ts.Expression) => {
        if (!oldValue) return ts.factory.createStringLiteral('baz');
        if (!ts.isStringLiteral(oldValue)) return oldValue;
        return ts.factory.createStringLiteral(oldValue.text + 'baz');
      };

      beforeEach(() => {
        oldObj = ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier('foo'),
              ts.factory.createStringLiteral('bar'),
            ),
          ],
          false,
        );
      });

      it('creates a non-existent property', () => {
        const obj = updateObjectValueForKey(oldObj, 'newKey', valueAppenderFn);
        expect(print(obj)).toBe('newKey: "baz"');
      });

      it('updates an existing property', () => {
        const obj = updateObjectValueForKey(oldObj, 'foo', valueAppenderFn);
        expect(print(obj)).toBe('foo: "barbaz"');
      });
    });

    it('addElementToArrayLiteral', () => {
      let arr = ensureArrayWithIdentifier('foo', ts.factory.createIdentifier('foo'));
      arr = addElementToArrayLiteral(arr!, ts.factory.createIdentifier('bar'));
      expect(print(arr)).toEqual('[foo, bar]');
    });

    it('ensureArrayWithIdentifier', () => {
      let arr = ensureArrayWithIdentifier('foo', ts.factory.createIdentifier('foo'));
      expect(print(arr!)).toEqual('[foo]');
      arr = ensureArrayWithIdentifier('bar', ts.factory.createIdentifier('bar'), arr!);
      expect(print(arr!)).toEqual('[foo, bar]');
      arr = ensureArrayWithIdentifier('bar', ts.factory.createIdentifier('bar'), arr!);
      expect(arr).toEqual(null);
    });

    it('generateImport', () => {
      let imp = generateImport('Foo', null, './foo');
      expect(print(imp)).toEqual(`import { Foo } from "./foo";`);
      imp = generateImport('Foo', 'Bar', './foo');
      expect(print(imp)).toEqual(`import { Bar as Foo } from "./foo";`);
    });

    it('updateImport', () => {
      let imp = generateImport('Foo', null, './foo');
      let namedImp = updateImport(imp, 'Bar', null);
      expect(print(namedImp!)).toEqual(`{ Foo, Bar }`);
      namedImp = updateImport(imp, 'Foo_2', 'Foo');
      expect(print(namedImp!)).toEqual(`{ Foo, Foo as Foo_2 }`);
      namedImp = updateImport(imp, 'Bar', 'Bar');
      expect(print(namedImp!)).toEqual(`{ Foo, Bar }`);
      namedImp = updateImport(imp, 'default', 'Baz');
      expect(print(namedImp!)).toEqual(`Baz, { Foo }`);
      imp = generateImport('default', 'Foo', './foo');
      namedImp = updateImport(imp, 'Bar', null);
      expect(print(namedImp!)).toEqual(`Foo, { Bar }`);
    });

    it('nonCollidingImportName', () => {
      let imps = [
        generateImport('Foo', null, './foo'),
        generateImport('Bar', 'ExternalBar', './bar'),
      ];
      expect(nonCollidingImportName(imps, 'Other')).toEqual('Other');
      expect(nonCollidingImportName(imps, 'Foo')).toEqual('Foo_1');
      expect(nonCollidingImportName(imps, 'ExternalBar')).toEqual('ExternalBar');
    });
  });
});
