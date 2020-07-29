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

import {getClass, ngForDeclaration, ngForDts, setup} from './test_utils';

runInEachFileSystem(() => {
  describe('TemplateTypeChecker.getSymbolsOfBinding', () => {
    it('can retrieve a symbol for an input binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString =
          `<div dir [inputA]="'my input A'" [inputBRenamed]="'my inputB'"></div>`;
      const {program, templateTypeChecker} = setup(
          [
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
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
      const [aSymbol] = templateTypeChecker.getSymbolsOfBinding(inputAbinding, cmp)!;
      expect((aSymbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('inputA');

      const inputBbinding = (nodes[0] as TmplAstElement).inputs[1];
      const [bSymbol] = templateTypeChecker.getSymbolsOfBinding(inputBbinding, cmp)!;
      expect((bSymbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('inputB');
    });

    it('can retrieve a symbol for an input of structural directive', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div *ngFor="let user of users"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {fileName, templates: {'Cmp': templateString}, declarations: [ngForDeclaration()]},
            ngForDts(),
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const ngForOfBinding =
          (nodes[0] as TmplAstTemplate).templateAttrs.find(a => a.name === 'ngForOf')! as
          TmplAstBoundAttribute;
      const [symbol] = templateTypeChecker.getSymbolsOfBinding(ngForOfBinding, cmp)!;
      expect((symbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('ngForOf');
    });

    it('returns empty list when there is no directive registered for the binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div dir [inputA]="'my input'"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {fileName, templates: {'Cmp': templateString}, declarations: []},
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);
      const binding = (nodes[0] as TmplAstElement).inputs[0];

      const symbols = templateTypeChecker.getSymbolsOfBinding(binding, cmp)!;
      expect(symbols.length).toBe(0);
    });

    it('returns empty list when directive members do not match the input', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `<div dir [inputA]="'my input A'"></div>`;
      const {program, templateTypeChecker} = setup(
          [
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
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
      const symbols = templateTypeChecker.getSymbolsOfBinding(inputAbinding, cmp)!;
      expect(symbols.length).toBe(0);
    });

    it('can match binding when there are two directives', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `<div dir otherDir [inputA]="'my input A'"></div>`;
      const {program, templateTypeChecker} = setup(
          [
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
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
      const [symbol] = templateTypeChecker.getSymbolsOfBinding(inputAbinding, cmp)!;
      expect((symbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('inputA');
      expect((symbol.declarations[0] as ts.PropertyDeclaration).parent.name?.text)
          .toEqual('TestDir');
    });

    it('returns the first field match when directive maps same input to two fields', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `<div dir [inputA]="'my input A'"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
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
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
      const [symbol] = templateTypeChecker.getSymbolsOfBinding(inputAbinding, cmp)!;
      expect((symbol.declarations[0] as ts.PropertyDeclaration).name.getText())
          .toEqual('otherInputA');
      expect((symbol.declarations[0] as ts.PropertyDeclaration).parent.name?.text)
          .toEqual('TestDir');
    });

    it('returns the first directive match when two directives have the same input', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `<div dir otherDir [inputA]="'my input A'"></div>`;
      const {program, templateTypeChecker} = setup(
          [
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
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const inputAbinding = (nodes[0] as TmplAstElement).inputs[0];
      const [symbol] = templateTypeChecker.getSymbolsOfBinding(inputAbinding, cmp)!;
      expect((symbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('inputA');
      expect((symbol.declarations[0] as ts.PropertyDeclaration).parent.name?.text)
          .toEqual('TestDir');
    });

    it('should find symbol for output binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString =
          `<div dir (outputA)="handle($event)" (renamedOutputB)="handle($event)"></div>`;
      const {program, templateTypeChecker} = setup(
          [
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
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
      const [aSymbol] = templateTypeChecker.getSymbolsOfBinding(outputABinding, cmp)!;
      expect((aSymbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('outputA');

      const outputBBinding = (nodes[0] as TmplAstElement).outputs[1];
      const [bSymbol] = templateTypeChecker.getSymbolsOfBinding(outputBBinding, cmp)!;
      expect((bSymbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('outputB');
    });

    it('should find symbol for output binding when there are multiple directives', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `<div dir otherdir (outputA)="handle($event)"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
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
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
      const [symbol] = templateTypeChecker.getSymbolsOfBinding(outputABinding, cmp)!;
      expect((symbol.declarations[0] as ts.PropertyDeclaration).name.getText()).toEqual('outputA');
      expect((symbol.declarations[0] as ts.PropertyDeclaration).parent.name?.text)
          .toEqual('TestDir');
    });

    it('returns empty list when binding does not match any directive output', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `<div dir (doesNotExist)="handle($event)"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
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
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
      const symbols = templateTypeChecker.getSymbolsOfBinding(outputABinding, cmp)!;
      expect(symbols.length).toBe(0);
    });

    it('returns empty list when checkTypeOfOutputEvents is false', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `<div dir (outputA)="handle($event)"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
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
          {inlining: false, config: {checkTypeOfOutputEvents: false}});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const outputABinding = (nodes[0] as TmplAstElement).outputs[0];
      const symbols = templateTypeChecker.getSymbolsOfBinding(outputABinding, cmp)!;
      expect(symbols.length).toBe(0);
    });
  });
});
