import {ASTWithSource, Binary, BindingPipe, Conditional, Interpolation, PropertyRead, TmplAstBoundAttribute, TmplAstBoundText, TmplAstElement, TmplAstNode, TmplAstTemplate,} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {ClassDeclaration} from '../../reflection';
import {TemplateTypeChecker} from '../api';

import {getClass, ngForDeclaration, ngForDts, setup, TestDeclaration} from './test_utils';

runInEachFileSystem(() => {
  describe('templateTypeChecker.getSymbolOfTemplateExpression()', () => {
    it('should get a symbol for just a component property used in an input binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div [inputA]="helloWorld"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `export class Cmp {helloWorld: string;}`,
            },
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const nodes = getAstElements(templateTypeChecker, cmp, templateString);

      const symbol =
          templateTypeChecker.getSymbolOfTemplateExpression(nodes[0].inputs[0].value, cmp)!;
      expect(symbol.escapedName.toString()).toEqual('helloWorld');
    });

    it('should get a symbol for properties several levels deep', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div [inputA]="person.address.street"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
              interface Address {
                street: string;
              }

              interface Person {
                address: Address;
              }
              export class Cmp {person?: Person;}
            `,
            },
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const nodes = getAstElements(templateTypeChecker, cmp, templateString);

      const symbol =
          templateTypeChecker.getSymbolOfTemplateExpression(nodes[0].inputs[0].value, cmp)!;
      expect(symbol.escapedName.toString()).toEqual('street');
      expect((symbol.declarations[0] as ts.PropertyDeclaration).parent.name!.getText())
          .toEqual('Address');
    });

    it('should get a symbol for conditionals', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `
        <div [inputA]="person?.address?.street"></div>
        <div [inputA]="person ? person.address : noPersonError"></div>
      `;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
              interface Address {
                street: string;
              }

              interface Person {
                address: Address;
              }
              export class Cmp {person?: Person; noPersonError = 'no person'}
            `,
            },
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const nodes = getAstElements(templateTypeChecker, cmp, templateString);

      const safePropertyRead = nodes[0].inputs[0].value as ASTWithSource;
      const symbol = templateTypeChecker.getSymbolOfTemplateExpression(safePropertyRead, cmp)!;
      expect(symbol.escapedName.toString()).toEqual('street');
      expect((symbol.declarations[0] as ts.PropertyDeclaration).parent.name!.getText())
          .toEqual('Address');

      const ternary = (nodes[1].inputs[0].value as ASTWithSource).ast as Conditional;
      expect(templateTypeChecker.getSymbolOfTemplateExpression(ternary, cmp)).toBeNull();

      const addrSymbol = templateTypeChecker.getSymbolOfTemplateExpression(ternary.trueExp, cmp)!;
      expect(addrSymbol.escapedName.toString()).toEqual('address');

      const noPersonSymbol =
          templateTypeChecker.getSymbolOfTemplateExpression(ternary.falseExp, cmp)!;
      expect(noPersonSymbol.escapedName.toString()).toEqual('noPersonError');
    });

    it('should get a symbol for function on a component used in an input binding', () => {
      const functionName = 'helloWorld';
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div [inputA]="${functionName}"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
            export class Cmp {
              ${functionName}() { return ''; }
            }`,
            },
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const nodes = getAstElements(templateTypeChecker, cmp, templateString);

      const symbol =
          templateTypeChecker.getSymbolOfTemplateExpression(nodes[0].inputs[0].value, cmp)!;
      expect(symbol.escapedName.toString()).toEqual(functionName);
    });

    it('should return null when requesting a symbol for an entire binary expression', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div [inputA]="a + b"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
            export class Cmp {
              a!: number;
              b!: number;
            }`,
            },
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const {nodes} = templateTypeChecker.overrideComponentTemplate(cmp, templateString);

      const symbol = templateTypeChecker.getSymbolOfTemplateExpression(
          (nodes[0] as TmplAstElement).inputs[0].value, cmp);
      expect(symbol).toBeNull();
    });

    it('should get a symbol for a component property in a binary expression', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div [inputA]="a + b"></div>`;
      const {program, templateTypeChecker} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
            export class Cmp {
              a!: number;
              b!: number;
            }`,
            },
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const nodes = getAstElements(templateTypeChecker, cmp, templateString);
      const valueAssignment = nodes[0].inputs[0].value as ASTWithSource;

      const aSymbol = templateTypeChecker.getSymbolOfTemplateExpression(
          (valueAssignment.ast as Binary).left, cmp)!;
      expect(aSymbol.escapedName.toString()).toBe('a');
      const bSymbol = templateTypeChecker.getSymbolOfTemplateExpression(
          (valueAssignment.ast as Binary).right, cmp)!;
      expect(bSymbol.escapedName.toString()).toBe('b');
    });

    it('should return member on directive bound with template var', () => {
      const fileName = absoluteFrom('/main.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const templateString = `
        <div dir #myDir="dir"></div>
        <div [inputA]="myDir.dirValue" [inputB]="myDir"></div>
        `;
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
                exportAs: ['dir'],
              }]
            },
            {
              fileName: dirFile,
              source: `export class TestDir { dirValue = 'helloWorld' }`,
              templates: {}
            }
          ],
          {inlining: false});
      const sf = getSourceFileOrError(program, fileName);
      const cmp = getClass(sf, 'Cmp');

      const nodes = getAstElements(templateTypeChecker, cmp, templateString);

      const dirValueSymbol =
          templateTypeChecker.getSymbolOfTemplateExpression(nodes[1].inputs[0].value, cmp)!;
      expect(dirValueSymbol.escapedName.toString()).toBe('dirValue');
      const dirSymbol =
          templateTypeChecker.getSymbolOfTemplateExpression(nodes[1].inputs[1].value, cmp)!;
      expect(dirSymbol.escapedName.toString()).toBe('TestDir');
    });
  });

  describe('AST Templates', () => {
    let templateTypeChecker: TemplateTypeChecker;
    let cmp: ClassDeclaration<ts.ClassDeclaration>;
    let templateNode: TmplAstTemplate;

    beforeEach(() => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `
              <div *ngFor="let user of users; let i = index;">
                {{user.name}} {{user.address}}
                <div [tabIndex]="i"></div>
              </div>`;
      const testValues = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
            export interface User {
              name: string;
              address: string;
            }
            export class Cmp { users: User[]; }
            `,
              declarations: [ngForDeclaration()],
            },
            ngForDts(),
          ],
          {inlining: false});
      templateTypeChecker = testValues.templateTypeChecker;
      const sf = getSourceFileOrError(testValues.program, fileName);
      cmp = getClass(sf, 'Cmp');
      templateNode = getAstTemplates(templateTypeChecker, cmp, templateString)[0];
    });

    it('should retrieve a symbol for an expression inside structural binding', () => {
      const ngForOfBinding =
          templateNode.templateAttrs.find(a => a.name === 'ngForOf')! as TmplAstBoundAttribute;
      const symbol = templateTypeChecker.getSymbolOfTemplateExpression(ngForOfBinding.value, cmp)!;
      expect(symbol.escapedName.toString()).toEqual('users');
    });

    it('should retrieve a symbol for property reads of implicit variable inside structural binding',
       () => {
         const boundText =
             (templateNode.children[0] as TmplAstElement).children[0] as TmplAstBoundText;
         const interpolation = (boundText.value as ASTWithSource).ast as Interpolation;
         const namePropRead = interpolation.expressions[0] as PropertyRead;
         const addressPropRead = interpolation.expressions[1] as PropertyRead;

         const nameSymbol = templateTypeChecker.getSymbolOfTemplateExpression(namePropRead, cmp)!;
         expect(nameSymbol.escapedName.toString()).toEqual('name');
         const addressSymbol =
             templateTypeChecker.getSymbolOfTemplateExpression(addressPropRead, cmp)!;
         expect(addressSymbol.escapedName.toString()).toEqual('address');
         const userSymbol =
             templateTypeChecker.getSymbolOfTemplateExpression(namePropRead.receiver, cmp)!;
         expect(userSymbol.escapedName).toContain('$implicit');
         expect(userSymbol.declarations[0].parent!.getText()).toContain('NgForOfContext');
       });

    it('finds symbol when using a template variable', () => {
      const innerElementNodes =
          onlyAstElements((templateNode.children[0] as TmplAstElement).children);
      const indexSymbol = templateTypeChecker.getSymbolOfTemplateExpression(
          innerElementNodes[0].inputs[0].value, cmp)!;
      expect(indexSymbol.escapedName).toContain('index');
      expect(indexSymbol.declarations[0].parent!.getText()).toContain('NgForOfContext');
    });
  });

  describe('pipes', () => {
    let templateTypeChecker: TemplateTypeChecker;
    let cmp: ClassDeclaration<ts.ClassDeclaration>;
    let binding: BindingPipe;

    beforeEach(() => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div [inputA]="a | test:b:c"></div>`;
      const testValues = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `
            export class Cmp { a: string; b: number; c: boolean }
            export class TestPipe {
              transform(value: string, repeat: number, commaSeparate: boolean) {
              }
            }
            `,
              declarations: [{
                type: 'pipe',
                name: 'TestPipe',
                pipeName: 'test',
              }],
            },
          ],
          {inlining: false});
      templateTypeChecker = testValues.templateTypeChecker;
      const sf = getSourceFileOrError(testValues.program, fileName);
      cmp = getClass(sf, 'Cmp');
      binding = (getAstElements(templateTypeChecker, cmp, templateString)[0].inputs[0].value as
                 ASTWithSource)
                    .ast as BindingPipe;
    });

    it('should get symbol for pipe', () => {
      const pipeSymbol = templateTypeChecker.getSymbolOfTemplateExpression(binding, cmp)!;
      expect(pipeSymbol.escapedName.toString()).toEqual('transform');
      expect((pipeSymbol.declarations[0].parent as ts.ClassDeclaration).name!.getText())
          .toEqual('TestPipe');
    });

    it('should get symbols for pipe expression and args', () => {
      const aSymbol = templateTypeChecker.getSymbolOfTemplateExpression(binding.exp, cmp)!;
      expect(aSymbol.escapedName.toString()).toEqual('a');
      const bSymbol = templateTypeChecker.getSymbolOfTemplateExpression(binding.args[0], cmp)!;
      expect(bSymbol.escapedName.toString()).toEqual('b');
      const cSymbol = templateTypeChecker.getSymbolOfTemplateExpression(binding.args[1], cmp)!;
      expect(cSymbol.escapedName.toString()).toEqual('c');
    });
  });
});

function onlyAstTemplates(nodes: TmplAstNode[]): TmplAstTemplate[] {
  return nodes.filter((n): n is TmplAstTemplate => n instanceof TmplAstTemplate);
}

function onlyAstElements(nodes: TmplAstNode[]): TmplAstElement[] {
  return nodes.filter((n): n is TmplAstElement => n instanceof TmplAstElement);
}

function getAstElements(
    templateTypeChecker: TemplateTypeChecker, cmp: ts.ClassDeclaration&{name: ts.Identifier},
    templateString: string) {
  return onlyAstElements(templateTypeChecker.overrideComponentTemplate(cmp, templateString).nodes);
}

function getAstTemplates(
    templateTypeChecker: TemplateTypeChecker, cmp: ts.ClassDeclaration&{name: ts.Identifier},
    templateString: string) {
  return onlyAstTemplates(templateTypeChecker.overrideComponentTemplate(cmp, templateString).nodes);
}
