/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {ClassMemberKind, isNamedVariableDeclaration, TypeValueReferenceKind} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadFakeCore, loadTestFiles, loadTsLib} from '../../../src/ngtsc/testing';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {convertToDirectTsLibImport, convertToInlineTsLib, makeTestBundleProgram} from '../helpers/utils';

import {expectTypeValueReferencesForParameters} from './util';

runInEachFileSystem(() => {
  describe('Fesm2015ReflectionHost [import helper style]', () => {
    let _: typeof absoluteFrom;
    let FILES: {[label: string]: TestFile[]};

    beforeEach(() => {
      _ = absoluteFrom;
      const NAMESPACED_IMPORT_FILES = [
        {
          name: _('/some_directive.js'),
          contents: `
  import * as tslib_1 from 'tslib';
  import { Directive, Inject, InjectionToken, Input } from '@angular/core';
  const INJECTED_TOKEN = new InjectionToken('injected');
  class ViewContainerRef {
  }
  class TemplateRef {
  }
  let SomeDirective = class SomeDirective {
      constructor(_viewContainer, _template, injected) {
          this.instanceProperty = 'instance';
          this.input1 = '';
          this.input2 = 0;
      }
      instanceMethod() { }
      static staticMethod() { }
  };
  SomeDirective.staticProperty = 'static';
  tslib_1.__decorate([
      Input(),
      tslib_1.__metadata("design:type", String)
  ], SomeDirective.prototype, "input1", void 0);
  tslib_1.__decorate([
      Input(),
      tslib_1.__metadata("design:type", Number)
  ], SomeDirective.prototype, "input2", void 0);
  SomeDirective = tslib_1.__decorate([
      Directive({ selector: '[someDirective]' }),
      tslib_1.__param(2, Inject(INJECTED_TOKEN)),
      tslib_1.__metadata("design:paramtypes", [ViewContainerRef,
          TemplateRef, String])
  ], SomeDirective);
  export { SomeDirective };
  `,
        },
        {
          name: _('/some_directive_ctor_parameters.js'),
          contents: `
  import * as tslib_1 from 'tslib';
  import { Directive, Inject, InjectionToken, Input } from '@angular/core';
  const INJECTED_TOKEN = new InjectionToken('injected');
  class ViewContainerRef {
  }
  class TemplateRef {
  }
  let SomeDirective = class SomeDirective {
      constructor(_viewContainer, _template, injected) {
          this.input1 = '';
      }
  };
  SomeDirective.ctorParameters = () => [
    { type: ViewContainerRef, },
    { type: TemplateRef, },
    { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
  ];
  tslib_1.__decorate([
      Input(),
  ], SomeDirective.prototype, "input1", void 0);
  SomeDirective = tslib_1.__decorate([
      Directive({ selector: '[someDirective]' }),
      tslib_1.__param(2, Inject(INJECTED_TOKEN)),
  ], SomeDirective);
  export { SomeDirective };
  `,
        },
        {
          name: _('/some_directive_ctor_parameters_iife.js'),
          contents: `
    import * as tslib_1 from 'tslib';
    import { Directive, Inject, InjectionToken, Input } from '@angular/core';
    const INJECTED_TOKEN = new InjectionToken('injected');
    let ViewContainerRef = /** class */ (() => { class ViewContainerRef {} return ViewContainerRef; })();
    let TemplateRef = /** class */ (() => { class TemplateRef {} return TemplateRef; })();
    let SomeDirective = /** @class */ (() => {
      let SomeDirective = class SomeDirective {
          constructor(_viewContainer, _template, injected) {
              this.input1 = '';
          }
      };
      SomeDirective.ctorParameters = () => [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
      ];
      tslib_1.__decorate([
          Input(),
      ], SomeDirective.prototype, "input1", void 0);
      SomeDirective = tslib_1.__decorate([
          Directive({ selector: '[someDirective]' }),
          tslib_1.__param(2, Inject(INJECTED_TOKEN)),
      ], SomeDirective);
    })();
    export { SomeDirective };
    `,
        },
        {
          name: _('/node_modules/@angular/core/some_directive.js'),
          contents: `
  import * as tslib_1 from 'tslib';
  import { Directive, Input } from './directives';
  let SomeDirective = class SomeDirective {
    constructor() { this.input1 = ''; }
  };
  tslib_1.__decorate([
      Input(),
      tslib_1.__metadata("design:type", String)
  ], SomeDirective.prototype, "input1", void 0);
  SomeDirective = tslib_1.__decorate([
    Directive({ selector: '[someDirective]' }),
  ], SomeDirective);
  export { SomeDirective };
  `,
        },
        {
          name: _('/ngmodule.js'),
          contents: `
    import * as tslib_1 from 'tslib';
    import { NgModule } from './directives';
    var HttpClientXsrfModule_1;
    let HttpClientXsrfModule = HttpClientXsrfModule_1 = class HttpClientXsrfModule {
      static withOptions(options = {}) {
        return {
          ngModule: HttpClientXsrfModule_1,
          providers: [],
        };
      }
    };
    HttpClientXsrfModule.staticProperty = 'static';
    HttpClientXsrfModule = HttpClientXsrfModule_1 = tslib_1.__decorate([
      NgModule({
        providers: [],
      })
    ], HttpClientXsrfModule);
    let missingValue;
    let nonDecoratedVar;
    nonDecoratedVar = 43;
    export { HttpClientXsrfModule };
    `
        },
      ];

      const DIRECT_IMPORT_FILES = convertToDirectTsLibImport(NAMESPACED_IMPORT_FILES);
      const INLINE_FILES = convertToInlineTsLib(NAMESPACED_IMPORT_FILES);
      const INLINE_SUFFIXED_FILES = convertToInlineTsLib(NAMESPACED_IMPORT_FILES, '$2');

      FILES = {
        'namespaced': NAMESPACED_IMPORT_FILES,
        'direct import': DIRECT_IMPORT_FILES,
        'inline': INLINE_FILES,
        'inline suffixed': INLINE_SUFFIXED_FILES,
      };
    });

    ['namespaced', 'direct import', 'inline', 'inline suffixed'].forEach(label => {
      describe(`[${label}]`, () => {
        beforeEach(() => {
          const fs = getFileSystem();
          loadTsLib(fs);
          loadFakeCore(fs);
          loadTestFiles(FILES[label]);
        });

        describe('getDecoratorsOfDeclaration()', () => {
          it('should find the decorators on a class', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const decorators = host.getDecoratorsOfDeclaration(classNode)!;

            expect(decorators).toBeDefined();
            expect(decorators.length).toEqual(1);

            const decorator = decorators[0];
            expect(decorator.name).toEqual('Directive');
            expect(decorator.identifier!.getText()).toEqual('Directive');
            expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
            expect(decorator.args!.map(arg => arg.getText())).toEqual([
              '{ selector: \'[someDirective]\' }',
            ]);
          });

          it('should find the decorators on a class when mixing `ctorParameters` and `__decorate`',
             () => {
               const bundle = makeTestBundleProgram(_('/some_directive_ctor_parameters.js'));
               const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
               const classNode = getDeclaration(
                   bundle.program, _('/some_directive_ctor_parameters.js'), 'SomeDirective',
                   isNamedVariableDeclaration);
               const decorators = host.getDecoratorsOfDeclaration(classNode)!;

               expect(decorators).toBeDefined();
               expect(decorators.length).toEqual(1);

               const decorator = decorators[0];
               expect(decorator.name).toEqual('Directive');
               expect(decorator.identifier!.getText()).toEqual('Directive');
               expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
               expect(decorator.args!.map(arg => arg.getText())).toEqual([
                 '{ selector: \'[someDirective]\' }',
               ]);
             });

          it('should find the decorators on an IIFE wrapped class when mixing `ctorParameters` and `__decorate`',
             () => {
               const bundle = makeTestBundleProgram(_('/some_directive_ctor_parameters_iife.js'));
               const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
               const classNode = getDeclaration(
                   bundle.program, _('/some_directive_ctor_parameters_iife.js'), 'SomeDirective',
                   isNamedVariableDeclaration);
               const decorators = host.getDecoratorsOfDeclaration(classNode)!;

               expect(decorators).toBeDefined();
               expect(decorators.length).toEqual(1);

               const decorator = decorators[0];
               expect(decorator.name).toEqual('Directive');
               expect(decorator.identifier!.getText()).toEqual('Directive');
               expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
               expect(decorator.args!.map(arg => arg.getText())).toEqual([
                 '{ selector: \'[someDirective]\' }',
               ]);
             });

          it('should support decorators being used inside @angular/core', () => {
            const bundle =
                makeTestBundleProgram(_('/node_modules/@angular/core/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), true, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/node_modules/@angular/core/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const decorators = host.getDecoratorsOfDeclaration(classNode)!;

            expect(decorators).toBeDefined();
            expect(decorators.length).toEqual(1);

            const decorator = decorators[0];
            expect(decorator.name).toEqual('Directive');
            expect(decorator.identifier!.getText()).toEqual('Directive');
            expect(decorator.import).toEqual({name: 'Directive', from: './directives'});
            expect(decorator.args!.map(arg => arg.getText())).toEqual([
              '{ selector: \'[someDirective]\' }',
            ]);
          });
        });

        describe('getMembersOfClass()', () => {
          it('should find decorated members on a class', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const members = host.getMembersOfClass(classNode);

            const input1 = members.find(member => member.name === 'input1')!;
            expect(input1.kind).toEqual(ClassMemberKind.Property);
            expect(input1.isStatic).toEqual(false);
            expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);

            const input2 = members.find(member => member.name === 'input2')!;
            expect(input2.kind).toEqual(ClassMemberKind.Property);
            expect(input2.isStatic).toEqual(false);
            expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);
          });

          it('should find decorated members on a class when mixing `ctorParameters` and `__decorate`',
             () => {
               const bundle = makeTestBundleProgram(_('/some_directive_ctor_parameters.js'));
               const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
               const classNode = getDeclaration(
                   bundle.program, _('/some_directive_ctor_parameters.js'), 'SomeDirective',
                   isNamedVariableDeclaration);
               const members = host.getMembersOfClass(classNode);

               const input1 = members.find(member => member.name === 'input1')!;
               expect(input1.kind).toEqual(ClassMemberKind.Property);
               expect(input1.isStatic).toEqual(false);
               expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);
             });

          it('should find decorated members on an IIFE wrapped class when mixing `ctorParameters` and `__decorate`',
             () => {
               const bundle = makeTestBundleProgram(_('/some_directive_ctor_parameters_iife.js'));
               const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
               const classNode = getDeclaration(
                   bundle.program, _('/some_directive_ctor_parameters_iife.js'), 'SomeDirective',
                   isNamedVariableDeclaration);
               const members = host.getMembersOfClass(classNode);

               const input1 = members.find(member => member.name === 'input1')!;
               expect(input1.kind).toEqual(ClassMemberKind.Property);
               expect(input1.isStatic).toEqual(false);
               expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);
             });

          it('should find non decorated properties on a class', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const members = host.getMembersOfClass(classNode);

            const instanceProperty = members.find(member => member.name === 'instanceProperty')!;
            expect(instanceProperty.kind).toEqual(ClassMemberKind.Property);
            expect(instanceProperty.isStatic).toEqual(false);
            expect(ts.isBinaryExpression(instanceProperty.implementation!)).toEqual(true);
            expect(instanceProperty.value!.getText()).toEqual(`'instance'`);
          });

          it('should find static methods on a class', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const members = host.getMembersOfClass(classNode);

            const staticMethod = members.find(member => member.name === 'staticMethod')!;
            expect(staticMethod.kind).toEqual(ClassMemberKind.Method);
            expect(staticMethod.isStatic).toEqual(true);
            expect(ts.isMethodDeclaration(staticMethod.implementation!)).toEqual(true);
          });

          it('should find static properties on a class', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);

            const members = host.getMembersOfClass(classNode);
            const staticProperty = members.find(member => member.name === 'staticProperty')!;
            expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
            expect(staticProperty.isStatic).toEqual(true);
            expect(ts.isPropertyAccessExpression(staticProperty.implementation!)).toEqual(true);
            expect(staticProperty.value!.getText()).toEqual(`'static'`);
          });

          it('should find static properties on a class that has an intermediate variable assignment',
             () => {
               const bundle = makeTestBundleProgram(_('/ngmodule.js'));
               const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
               const classNode = getDeclaration(
                   bundle.program, _('/ngmodule.js'), 'HttpClientXsrfModule',
                   isNamedVariableDeclaration);

               const members = host.getMembersOfClass(classNode);
               const staticProperty = members.find(member => member.name === 'staticProperty')!;
               expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
               expect(staticProperty.isStatic).toEqual(true);
               expect(ts.isPropertyAccessExpression(staticProperty.implementation!)).toEqual(true);
               expect(staticProperty.value!.getText()).toEqual(`'static'`);
             });

          it('should support decorators being used inside @angular/core', () => {
            const bundle =
                makeTestBundleProgram(_('/node_modules/@angular/core/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), true, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/node_modules/@angular/core/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const members = host.getMembersOfClass(classNode);

            const input1 = members.find(member => member.name === 'input1')!;
            expect(input1.kind).toEqual(ClassMemberKind.Property);
            expect(input1.isStatic).toEqual(false);
            expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);
          });
        });

        describe('getConstructorParameters', () => {
          it('should find the decorated constructor parameters', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const parameters = host.getConstructorParameters(classNode);

            expect(parameters).toBeDefined();
            expect(parameters!.map(parameter => parameter.name)).toEqual([
              '_viewContainer', '_template', 'injected'
            ]);
            expectTypeValueReferencesForParameters(parameters!, [
              'ViewContainerRef',
              'TemplateRef',
              'String',
            ]);
          });

          it('should find the decorated constructor parameters when mixing `ctorParameters` and `__decorate`',
             () => {
               const bundle = makeTestBundleProgram(_('/some_directive_ctor_parameters.js'));
               const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
               const classNode = getDeclaration(
                   bundle.program, _('/some_directive_ctor_parameters.js'), 'SomeDirective',
                   isNamedVariableDeclaration);
               const parameters = host.getConstructorParameters(classNode);

               expect(parameters).toBeDefined();
               expect(parameters!.map(parameter => parameter.name)).toEqual([
                 '_viewContainer', '_template', 'injected'
               ]);
               expectTypeValueReferencesForParameters(parameters!, [
                 'ViewContainerRef',
                 'TemplateRef',
                 null,
               ]);

               const decorators = parameters![2].decorators!;
               expect(decorators.length).toEqual(1);
               expect(decorators[0].name).toBe('Inject');
               expect(decorators[0].import!.from).toBe('@angular/core');
               expect(decorators[0].import!.name).toBe('Inject');
             });
        });

        it('should find the decorated constructor parameters on an IIFE wrapped class when mixing `ctorParameters` and `__decorate`',
           () => {
             const bundle = makeTestBundleProgram(_('/some_directive_ctor_parameters_iife.js'));
             const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
             const classNode = getDeclaration(
                 bundle.program, _('/some_directive_ctor_parameters_iife.js'), 'SomeDirective',
                 isNamedVariableDeclaration);
             const parameters = host.getConstructorParameters(classNode);

             expect(parameters).toBeDefined();
             expect(parameters!.map(parameter => parameter.name)).toEqual([
               '_viewContainer', '_template', 'injected'
             ]);
             expectTypeValueReferencesForParameters(parameters!, [
               'ViewContainerRef',
               'TemplateRef',
               null,
             ]);

             const decorators = parameters![2].decorators!;
             expect(decorators.length).toEqual(1);
             expect(decorators[0].name).toBe('Inject');
             expect(decorators[0].import!.from).toBe('@angular/core');
             expect(decorators[0].import!.name).toBe('Inject');
           });

        describe('getDeclarationOfIdentifier', () => {
          it('should return the declaration of a locally defined identifier', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const ctrDecorators = host.getConstructorParameters(classNode)!;
            const identifierOfViewContainerRef = (ctrDecorators[0].typeValueReference! as {
                                                   kind: TypeValueReferenceKind.LOCAL,
                                                   expression: ts.Identifier,
                                                   defaultImportStatement: null,
                                                 }).expression;

            const expectedDeclarationNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'ViewContainerRef', ts.isClassDeclaration);
            const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfViewContainerRef);
            expect(actualDeclaration).not.toBe(null);
            expect(actualDeclaration!.node).toBe(expectedDeclarationNode);
            expect(actualDeclaration!.viaModule).toBe(null);
          });

          it('should return the declaration of an externally defined identifier', () => {
            const bundle = makeTestBundleProgram(_('/some_directive.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classNode = getDeclaration(
                bundle.program, _('/some_directive.js'), 'SomeDirective',
                isNamedVariableDeclaration);
            const classDecorators = host.getDecoratorsOfDeclaration(classNode)!;
            const decoratorNode = classDecorators[0].node!;
            const identifierOfDirective =
                ts.isCallExpression(decoratorNode) && ts.isIdentifier(decoratorNode.expression) ?
                decoratorNode.expression :
                null;

            const expectedDeclarationNode = getDeclaration(
                bundle.program, _('/node_modules/@angular/core/index.d.ts'), 'Directive',
                isNamedVariableDeclaration);
            const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfDirective!);
            expect(actualDeclaration).not.toBe(null);
            expect(actualDeclaration!.node).toBe(expectedDeclarationNode);
            expect(actualDeclaration!.viaModule).toBe('@angular/core');
          });
        });

        describe('getVariableValue', () => {
          it('should find the "actual" declaration of an aliased variable identifier', () => {
            const bundle = makeTestBundleProgram(_('/ngmodule.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const ngModuleRef = findVariableDeclaration(
                getSourceFileOrError(bundle.program, _('/ngmodule.js')), 'HttpClientXsrfModule_1');

            const value = host.getVariableValue(ngModuleRef!);
            expect(value).not.toBe(null);
            if (!value || !ts.isClassExpression(value)) {
              throw new Error(
                  `Expected value to be a class expression: ${value && value.getText()}.`);
            }
            expect(value.name!.text).toBe('HttpClientXsrfModule');
          });

          it('should return null if the variable has no assignment', () => {
            const bundle = makeTestBundleProgram(_('/ngmodule.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const missingValue = findVariableDeclaration(
                getSourceFileOrError(bundle.program, _('/ngmodule.js')), 'missingValue');
            const value = host.getVariableValue(missingValue!);
            expect(value).toBe(null);
          });

          it('should return null if the variable is not assigned from a call to __decorate', () => {
            const bundle = makeTestBundleProgram(_('/ngmodule.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const nonDecoratedVar = findVariableDeclaration(
                getSourceFileOrError(bundle.program, _('/ngmodule.js')), 'nonDecoratedVar');
            const value = host.getVariableValue(nonDecoratedVar!);
            expect(value).toBe(null);
          });
        });

        describe('getEndOfClass()', () => {
          it('should return the last statement related to the class', () => {
            const bundle = makeTestBundleProgram(_('/ngmodule.js'));
            const host = new Esm2015ReflectionHost(new MockLogger(), false, bundle);
            const classSymbol =
                host.findClassSymbols(bundle.program.getSourceFile(_('/ngmodule.js'))!)[0];
            const endOfClass = host.getEndOfClass(classSymbol);
            expect(endOfClass.getText())
                .toMatch(
                    /HttpClientXsrfModule = HttpClientXsrfModule_1 = .*__decorate.*\(\[\n\s*NgModule\(\{\n\s*providers: \[],\n\s*}\)\n\s*], HttpClientXsrfModule\);/);
          });
        });
      });
    });

    function findVariableDeclaration(
        node: ts.Node|undefined, variableName: string): ts.VariableDeclaration|undefined {
      if (!node) {
        return;
      }
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
          node.name.text === variableName) {
        return node;
      }
      return node.forEachChild(node => findVariableDeclaration(node, variableName));
    }
  });
});
