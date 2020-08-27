/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstBoundAttribute, TmplAstElement, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {ClassDeclaration} from '../../reflection';
import {DirectiveSymbol, ElementSymbol, InputBindingSymbol, OutputBindingSymbol, Symbol, SymbolKind, TemplateSymbol, TemplateTypeChecker, TypeCheckingConfig} from '../api';

import {getClass, ngForDeclaration, ngForTypeCheckTarget, setup as baseTestSetup, TypeCheckingTarget} from './test_utils';

runInEachFileSystem(() => {
  describe('TemplateTypeChecker.getSymbolOfNode', () => {
    describe('templates', () => {
      describe('ng-templates', () => {
        let templateTypeChecker: TemplateTypeChecker;
        let cmp: ClassDeclaration<ts.ClassDeclaration>;
        let templateNode: TmplAstTemplate;
        let program: ts.Program;

        beforeEach(() => {
          const fileName = absoluteFrom('/main.ts');
          const dirFile = absoluteFrom('/dir.ts');
          const templateString = `
              <ng-template dir #ref0 #ref1="dir" let-contextFoo="bar">
                <div [input0]="contextFoo" [input1]="ref0" [input2]="ref1"></div>
              </ng-template>`;
          const testValues = setup([
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
                    export class Cmp { }`,
              declarations: [{
                name: 'TestDir',
                selector: '[dir]',
                file: dirFile,
                type: 'directive',
                exportAs: ['dir'],
              }]
            },
            {
              fileName: dirFile,
              source: `export class TestDir {}`,
              templates: {},
            }
          ]);
          templateTypeChecker = testValues.templateTypeChecker;
          program = testValues.program;
          const sf = getSourceFileOrError(testValues.program, fileName);
          cmp = getClass(sf, 'Cmp');
          templateNode = getAstTemplates(templateTypeChecker, cmp)[0];
        });

        it('should get symbol for the template itself', () => {
          const symbol = templateTypeChecker.getSymbolOfNode(templateNode, cmp)!;
          assertTemplateSymbol(symbol);
          expect(symbol.directives.length).toBe(1);
          assertDirectiveSymbol(symbol.directives[0]);
          expect(symbol.directives[0].tsSymbol.getName()).toBe('TestDir');
        });
      });
    });

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

    describe('for elements', () => {
      it('for elements that are components with no inputs', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const {program, templateTypeChecker} = setup(
            [
              {
                fileName,
                templates: {'Cmp': `<child-component></child-component>`},
                declarations: [
                  {
                    name: 'ChildComponent',
                    selector: 'child-component',
                    file: dirFile,
                    type: 'directive',
                  },
                ]
              },
              {
                fileName: dirFile,
                source: `
              export class ChildComponent {}
            `,
                templates: {'ChildComponent': ''},
              }
            ],
        );
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const symbol = templateTypeChecker.getSymbolOfNode(nodes[0] as TmplAstElement, cmp)!;
        assertElementSymbol(symbol);
        expect(symbol.directives.length).toBe(1);
        assertDirectiveSymbol(symbol.directives[0]);
        expect(program.getTypeChecker().typeToString(symbol.directives[0].tsType))
            .toEqual('ChildComponent');
      });

      it('element with directive matches', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const {program, templateTypeChecker} = setup(
            [
              {
                fileName,
                templates: {'Cmp': `<div dir dir2></div>`},
                declarations: [
                  {
                    name: 'TestDir',
                    selector: '[dir]',
                    file: dirFile,
                    type: 'directive',
                  },
                  {
                    name: 'TestDir2',
                    selector: '[dir2]',
                    file: dirFile,
                    type: 'directive',
                  },
                  {
                    name: 'TestDirAllDivs',
                    selector: 'div',
                    file: dirFile,
                    type: 'directive',
                  },
                ]
              },
              {
                fileName: dirFile,
                source: `
              export class TestDir {}
              export class TestDir2 {}
              export class TestDirAllDivs {}
            `,
                templates: {},
              }
            ],
        );
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;

        const symbol = templateTypeChecker.getSymbolOfNode(nodes[0] as TmplAstElement, cmp)!;
        assertElementSymbol(symbol);
        expect(symbol.directives.length).toBe(3);
        const expectedDirectives = ['TestDir', 'TestDir2', 'TestDirAllDivs'].sort();
        const actualDirectives =
            symbol.directives.map(dir => program.getTypeChecker().typeToString(dir.tsType)).sort();
        expect(actualDirectives).toEqual(expectedDirectives);
      });
    });
  });
});

function onlyAstTemplates(nodes: TmplAstNode[]): TmplAstTemplate[] {
  return nodes.filter((n): n is TmplAstTemplate => n instanceof TmplAstTemplate);
}

function getAstTemplates(
    templateTypeChecker: TemplateTypeChecker, cmp: ts.ClassDeclaration&{name: ts.Identifier}) {
  return onlyAstTemplates(templateTypeChecker.getTemplate(cmp)!);
}

function assertDirectiveSymbol(tSymbol: Symbol): asserts tSymbol is DirectiveSymbol {
  expect(tSymbol.kind).toEqual(SymbolKind.Directive);
}

function assertInputBindingSymbol(tSymbol: Symbol): asserts tSymbol is InputBindingSymbol {
  expect(tSymbol.kind).toEqual(SymbolKind.Input);
}

function assertOutputBindingSymbol(tSymbol: Symbol): asserts tSymbol is OutputBindingSymbol {
  expect(tSymbol.kind).toEqual(SymbolKind.Output);
}

function assertTemplateSymbol(tSymbol: Symbol): asserts tSymbol is TemplateSymbol {
  expect(tSymbol.kind).toEqual(SymbolKind.Template);
}

function assertElementSymbol(tSymbol: Symbol): asserts tSymbol is ElementSymbol {
  expect(tSymbol.kind).toEqual(SymbolKind.Element);
}

export function setup(targets: TypeCheckingTarget[], config?: Partial<TypeCheckingConfig>) {
  return baseTestSetup(
      targets, {inlining: false, config: {...config, enableTemplateTypeChecker: true}});
}
