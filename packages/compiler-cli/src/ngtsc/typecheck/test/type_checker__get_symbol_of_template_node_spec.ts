/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstBoundAttribute, TmplAstElement, TmplAstTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {InputBindingSymbol, OutputBindingSymbol, Symbol, SymbolKind, TypeCheckingConfig} from '../api';

import {getClass, ngForDeclaration, ngForTypeCheckTarget, setup as baseTestSetup, TypeCheckingTarget} from './test_utils';

runInEachFileSystem(() => {
  describe('TemplateTypeChecker.getSymbolOfNodeInComponentTemplate', () => {
    describe('input bindings', () => {
      it('can retrieve a symbol for an input binding', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const templateString =
            `<div dir [inputA]="'my input A'" [inputBRenamed]="'my inputB'"></div>`;
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': templateString},
            declarations: [{
              name: 'TestDir',
              selector: '[dir]',
              file: dirFile,
              type: 'directive',
              inputs: {inputA: 'inputA', inputB: 'inputBRenamed'},
            }]
          },
          {
            fileName: dirFile,
            source: `export class TestDir {inputA!: string; inputB!: string}`,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
        const aSymbol = templateTypeChecker.getSymbolOfNode(inputAbinding, cmp)!;
        assertInputBindingSymbol(aSymbol);
        expect((aSymbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
                   .name.getText())
            .toEqual('inputA');

        const inputBbinding = (nodes[0] as TmplAstElement).inputs[1];
        const bSymbol = templateTypeChecker.getSymbolOfNode(inputBbinding, cmp)!;
        // TODO(atscott): The BoundTarget is not assigning renamed properties correctly
        // assertInputBindingSymbol(bSymbol);
        // expect((bSymbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
        //            .name.getText())
        //     .toEqual('inputB');
      });

      it('does not retrieve a symbol for an input when undeclared', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const templateString = `<div dir [inputA]="'my input A'"></div>`;
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': templateString},
            declarations: [{
              name: 'TestDir',
              selector: '[dir]',
              file: dirFile,
              type: 'directive',
              inputs: {inputA: 'inputA'},
            }]
          },
          {
            fileName: dirFile,
            source: `export class TestDir {}`,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
        const aSymbol = templateTypeChecker.getSymbolOfNode(inputAbinding, cmp)!;
        expect(aSymbol).toBeNull();
      });

      it('can retrieve a symbol for an input of structural directive', () => {
        const fileName = absoluteFrom('/main.ts');
        const templateString = `<div *ngFor="let user of users"></div>`;
        const {program, templateTypeChecker} = setup([
          {fileName, templates: {'Cmp': templateString}, declarations: [ngForDeclaration()]},
          ngForTypeCheckTarget(),
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const ngForOfBinding =
            (nodes[0] as TmplAstTemplate).templateAttrs.find(a => a.name === 'ngForOf')! as
            TmplAstBoundAttribute;
        const symbol = templateTypeChecker.getSymbolOfNode(ngForOfBinding, cmp)!;
        assertInputBindingSymbol(symbol);
        expect(
            (symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration).name.getText())
            .toEqual('ngForOf');
      });

      it('returns empty list when there is no directive registered for the binding', () => {
        const fileName = absoluteFrom('/main.ts');
        const templateString = `<div dir [inputA]="'my input'"></div>`;
        const {program, templateTypeChecker} = setup([
          {fileName, templates: {'Cmp': templateString}, declarations: []},
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;
        const binding = (nodes[0] as TmplAstElement).inputs[0];

        const symbol = templateTypeChecker.getSymbolOfNode(binding, cmp);
        expect(symbol).toBeNull();
      });

      it('returns empty list when directive members do not match the input', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const templateString = `<div dir [inputA]="'my input A'"></div>`;
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': templateString},
            declarations: [{
              name: 'TestDir',
              selector: '[dir]',
              file: dirFile,
              type: 'directive',
              inputs: {},
            }]
          },
          {
            fileName: dirFile,
            source: `export class TestDir {}`,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
        const symbol = templateTypeChecker.getSymbolOfNode(inputAbinding, cmp);
        expect(symbol).toBeNull();
      });

      it('can match binding when there are two directives', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const templateString = `<div dir otherDir [inputA]="'my input A'"></div>`;
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': templateString},
            declarations: [
              {
                name: 'TestDir',
                selector: '[dir]',
                file: dirFile,
                type: 'directive',
                inputs: {inputA: 'inputA'},
              },
              {
                name: 'OtherDir',
                selector: '[otherDir]',
                file: dirFile,
                type: 'directive',
                inputs: {},
              }
            ]
          },
          {
            fileName: dirFile,
            source: `
              export class TestDir {inputA!: string;}
              export class OtherDir {}
              `,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
        const symbol = templateTypeChecker.getSymbolOfNode(inputAbinding, cmp)!;
        assertInputBindingSymbol(symbol);
        expect(
            (symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration).name.getText())
            .toEqual('inputA');
        expect((symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
                   .parent.name?.text)
            .toEqual('TestDir');
      });

      it('returns the first field match when directive maps same input to two fields', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': `<div dir [inputA]="'my input A'"></div>`},
            declarations: [
              {
                name: 'TestDir',
                selector: '[dir]',
                file: dirFile,
                type: 'directive',
                inputs: {inputA: 'inputA', otherInputA: 'inputA'},
              },
            ]
          },
          {
            fileName: dirFile,
            source: `
              export class TestDir {inputA!: string; otherInputA!: string;}
              `,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
        const symbol = templateTypeChecker.getSymbolOfNode(inputAbinding, cmp)!;
        assertInputBindingSymbol(symbol);
        expect(
            (symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration).name.getText())
            .toEqual('otherInputA');
        expect((symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
                   .parent.name?.text)
            .toEqual('TestDir');
      });

      it('returns the first directive match when two directives have the same input', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const templateString = `<div dir otherDir [inputA]="'my input A'"></div>`;
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': templateString},
            declarations: [
              {
                name: 'TestDir',
                selector: '[dir]',
                file: dirFile,
                type: 'directive',
                inputs: {inputA: 'inputA'},
              },
              {
                name: 'OtherDir',
                selector: '[otherDir]',
                file: dirFile,
                type: 'directive',
                inputs: {otherDirInputA: 'inputA'},
              }
            ]
          },
          {
            fileName: dirFile,
            source: `
              export class TestDir {inputA!: string;}
              export class OtherDir {otherDirInputA!: string;}
              `,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
        const symbol = templateTypeChecker.getSymbolOfNode(inputAbinding, cmp)!;
        assertInputBindingSymbol(symbol);
        expect(
            (symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration).name.getText())
            .toEqual('inputA');
        expect((symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
                   .parent.name?.text)
            .toEqual('TestDir');
      });
    });

    describe('output bindings', () => {
      it('should find symbol for output binding', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const templateString =
            `<div dir (outputA)="handle($event)" (renamedOutputB)="handle($event)"></div>`;
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': templateString},
            declarations: [
              {
                name: 'TestDir',
                selector: '[dir]',
                file: dirFile,
                type: 'directive',
                outputs: {outputA: 'outputA', outputB: 'renamedOutputB'},
              },
            ]
          },
          {
            fileName: dirFile,
            source: `
              export class TestDir {outputA!: EventEmitter<string>; outputB!: EventEmitter<string>}
              `,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
        const aSymbol = templateTypeChecker.getSymbolOfNode(outputABinding, cmp)!;
        assertOutputBindingSymbol(aSymbol);
        expect((aSymbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
                   .name.getText())
            .toEqual('outputA');

        const outputBBinding = (nodes[0] as TmplAstElement).outputs[1];
        const bSymbol = templateTypeChecker.getSymbolOfNode(outputBBinding, cmp)!;
        // TODO(atscott): The BoundTarget is not assigning renamed properties correctly
        // assertOutputBindingSymbol(bSymbol);
        // expect((bSymbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
        //            .name.getText())
        //     .toEqual('outputB');
      });

      it('should find symbol for output binding when there are multiple directives', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': `<div dir otherdir (outputA)="handle($event)"></div>`},
            declarations: [
              {
                name: 'TestDir',
                selector: '[dir]',
                file: dirFile,
                type: 'directive',
                outputs: {outputA: 'outputA'},
              },
              {
                name: 'OtherDir',
                selector: '[otherdir]',
                file: dirFile,
                type: 'directive',
                outputs: {unusedOutput: 'unusedOutput'},
              },
            ]
          },
          {
            fileName: dirFile,
            source: `
              export class TestDir {outputA!: EventEmitter<string>;}
              export class OtherDir {unusedOutput!: EventEmitter<string>;}
              `,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
        const symbol = templateTypeChecker.getSymbolOfNode(outputABinding, cmp)!;
        assertOutputBindingSymbol(symbol);
        expect(
            (symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration).name.getText())
            .toEqual('outputA');
        expect((symbol.bindings[0].tsSymbol!.declarations[0] as ts.PropertyDeclaration)
                   .parent.name?.text)
            .toEqual('TestDir');
      });

      it('returns empty list when binding does not match any directive output', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {'Cmp': `<div dir (doesNotExist)="handle($event)"></div>`},
            declarations: [
              {
                name: 'TestDir',
                selector: '[dir]',
                file: dirFile,
                type: 'directive',
                outputs: {outputA: 'outputA'},
              },
            ]
          },
          {
            fileName: dirFile,
            source: `export class TestDir {outputA!: EventEmitter<string>;}`,
            templates: {},
          }
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
        const symbol = templateTypeChecker.getSymbolOfNode(outputABinding, cmp);
        expect(symbol).toBeNull();
      });

      it('returns empty list when checkTypeOfOutputEvents is false', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const {program, templateTypeChecker} = setup(
            [
              {
                fileName,
                templates: {'Cmp': `<div dir (outputA)="handle($event)"></div>`},
                declarations: [
                  {
                    name: 'TestDir',
                    selector: '[dir]',
                    file: dirFile,
                    type: 'directive',
                    outputs: {outputA: 'outputA'},
                  },
                ]
              },
              {
                fileName: dirFile,
                source: `export class TestDir {outputA!: EventEmitter<string>;}`,
                templates: {},
              }
            ],
            {checkTypeOfOutputEvents: false});
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
        const symbol = templateTypeChecker.getSymbolOfNode(outputABinding, cmp);
        // TODO(atscott): should type checker still generate the subscription in this case?
        expect(symbol).toBeNull();
      });
    });
  });
});

function assertInputBindingSymbol(tSymbol: Symbol): asserts tSymbol is InputBindingSymbol {
  expect(tSymbol.kind).toEqual(SymbolKind.Input);
}

function assertOutputBindingSymbol(tSymbol: Symbol): asserts tSymbol is OutputBindingSymbol {
  expect(tSymbol.kind).toEqual(SymbolKind.Output);
}

export function setup(targets: TypeCheckingTarget[], config?: Partial<TypeCheckingConfig>) {
  return baseTestSetup(
      targets, {inlining: false, config: {...config, enableTemplateTypeChecker: true}});
}
