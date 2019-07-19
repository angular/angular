/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {TestFile, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {ClassMemberKind, CtorParameter, Import, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {getDeclaration} from '../../../src/ngtsc/testing';
import {loadFakeCore, loadTestFiles} from '../../../test/helpers';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {MockLogger} from '../helpers/mock_logger';
import {getRootFiles, makeTestBundleProgram} from '../helpers/utils';

import {expectTypeValueReferencesForParameters} from './util';

runInEachFileSystem(() => {
  describe('Esm2015ReflectionHost', () => {

    let _: typeof absoluteFrom;

    let SOME_DIRECTIVE_FILE: TestFile;
    let CTOR_DECORATORS_ARRAY_FILE: TestFile;
    let ACCESSORS_FILE: TestFile;
    let SIMPLE_CLASS_FILE: TestFile;
    let CLASS_EXPRESSION_FILE: TestFile;
    let FOO_FUNCTION_FILE: TestFile;
    let INVALID_DECORATORS_FILE: TestFile;
    let INVALID_DECORATOR_ARGS_FILE: TestFile;
    let INVALID_PROP_DECORATORS_FILE: TestFile;
    let INVALID_PROP_DECORATOR_ARGS_FILE: TestFile;
    let INVALID_CTOR_DECORATORS_FILE: TestFile;
    let INVALID_CTOR_DECORATOR_ARGS_FILE: TestFile;
    let IMPORTS_FILES: TestFile[];
    let EXPORTS_FILES: TestFile[];
    let FUNCTION_BODY_FILE: TestFile;
    let MARKER_FILE: TestFile;
    let DECORATED_FILES: TestFile[];
    let ARITY_CLASSES: TestFile[];
    let TYPINGS_SRC_FILES: TestFile[];
    let TYPINGS_DTS_FILES: TestFile[];
    let MODULE_WITH_PROVIDERS_PROGRAM: TestFile[];
    let NAMESPACED_IMPORT_FILE: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;

      SOME_DIRECTIVE_FILE = {
        name: _('/some_directive.js'),
        contents: `
    import { Directive, Inject, InjectionToken, Input, HostListener, HostBinding } from '@angular/core';

    const INJECTED_TOKEN = new InjectionToken('injected');
    const ViewContainerRef = {};
    const TemplateRef = {};

    class SomeDirective {
      constructor(_viewContainer, _template, injected) {
        this.instanceProperty = 'instance';
      }
      instanceMethod() {}

      onClick() {}

      @HostBinding('class.foo')
      get isClassFoo() { return false; }

      static staticMethod() {}
    }
    SomeDirective.staticProperty = 'static';
    SomeDirective.decorators = [
      { type: Directive, args: [{ selector: '[someDirective]' },] }
    ];
    SomeDirective.ctorParameters = () => [
      { type: ViewContainerRef, },
      { type: TemplateRef, },
      { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
    ];
    SomeDirective.propDecorators = {
      "input1": [{ type: Input },],
      "input2": [{ type: Input },],
      "target": [{ type: HostBinding, args: ['attr.target',] }, { type: Input },],
      "onClick": [{ type: HostListener, args: ['click',] },],
    };
  `,
      };

      CTOR_DECORATORS_ARRAY_FILE = {
        name: _('/ctor_decorated_as_array.js'),
        contents: `
          class CtorDecoratedAsArray {
            constructor(arg1) {
            }
          }
          CtorDecoratedAsArray.ctorParameters = [{ type: ParamType, decorators: [{ type: Inject },] }];
        `,
      };

      ACCESSORS_FILE = {
        name: _('/accessors.js'),
        contents: `
    import { Directive, Input, Output } from '@angular/core';

    class SomeDirective {
      set setterAndGetter(value) { this.value = value; }
      get setterAndGetter() { return null; }
    }
    SomeDirective.decorators = [
      { type: Directive, args: [{ selector: '[someDirective]' },] }
    ];
    SomeDirective.propDecorators = {
      "setterAndGetter": [{ type: Input },],
    };
  `,
      };

      SIMPLE_CLASS_FILE = {
        name: _('/simple_class.js'),
        contents: `
    class EmptyClass {}
    class NoDecoratorConstructorClass {
      constructor(foo) {}
    }
  `,
      };

      CLASS_EXPRESSION_FILE = {
        name: _('/class_expression.js'),
        contents: `
    var AliasedClass_1;
    let EmptyClass = class EmptyClass {};
    let AliasedClass = AliasedClass_1 = class AliasedClass {}
    let usageOfAliasedClass = AliasedClass_1;
  `,
      };

      FOO_FUNCTION_FILE = {
        name: _('/foo_function.js'),
        contents: `
    import { Directive } from '@angular/core';

    function foo() {}
    foo.decorators = [
      { type: Directive, args: [{ selector: '[ignored]' },] }
    ];
  `,
      };

      INVALID_DECORATORS_FILE = {
        name: _('/invalid_decorators.js'),
        contents: `
    import {Directive} from '@angular/core';
    class NotArrayLiteral {
    }
    NotArrayLiteral.decorators = () => [
      { type: Directive, args: [{ selector: '[ignored]' },] },
    ];

    class NotObjectLiteral {
    }
    NotObjectLiteral.decorators = [
      "This is not an object literal",
      { type: Directive },
    ];

    class NoTypeProperty {
    }
    NoTypeProperty.decorators = [
      { notType: Directive },
      { type: Directive },
    ];

    class NotIdentifier {
    }
    NotIdentifier.decorators = [
      { type: 'StringsLiteralsAreNotIdentifiers' },
      { type: Directive },
    ];
  `,
      };

      INVALID_DECORATOR_ARGS_FILE = {
        name: _('/invalid_decorator_args.js'),
        contents: `
    import {Directive} from '@angular/core';
    class NoArgsProperty {
    }
    NoArgsProperty.decorators = [
      { type: Directive },
    ];

    const args = [{ selector: '[ignored]' },];
    class NoPropertyAssignment {
    }
    NoPropertyAssignment.decorators = [
      { type: Directive, args },
    ];

    class NotArrayLiteral {
    }
    NotArrayLiteral.decorators = [
      { type: Directive, args: () => [{ selector: '[ignored]' },] },
    ];
  `,
      };

      INVALID_PROP_DECORATORS_FILE = {
        name: _('/invalid_prop_decorators.js'),
        contents: `
    import {Input} from '@angular/core';
    class NotObjectLiteral {
    }
    NotObjectLiteral.propDecorators = () => ({
      "prop": [{ type: Input },]
    });

    class NotObjectLiteralProp {
    }
    NotObjectLiteralProp.propDecorators = {
      "prop": [
        "This is not an object literal",
        { type: Input },
      ]
    };

    class NoTypeProperty {
    }
    NoTypeProperty.propDecorators = {
      "prop": [
        { notType: Input },
        { type: Input },
      ]
    };

    class NotIdentifier {
    }
    NotIdentifier.propDecorators = {
      "prop": [
        { type: 'StringsLiteralsAreNotIdentifiers' },
        { type: Input },
      ]
    };
  `,
      };

      INVALID_PROP_DECORATOR_ARGS_FILE = {
        name: _('/invalid_prop_decorator_args.js'),
        contents: `
    import {Input} from '@angular/core';
    class NoArgsProperty {
    }
    NoArgsProperty.propDecorators = {
      "prop": [{ type: Input },]
    };

    const args = [{ selector: '[ignored]' },];
    class NoPropertyAssignment {
    }
    NoPropertyAssignment.propDecorators = {
      "prop": [{ type: Input, args },]
    };

    class NotArrayLiteral {
    }
    NotArrayLiteral.propDecorators = {
      "prop": [{ type: Input, args: () => [{ selector: '[ignored]' },] },],
    };
  `,
      };

      INVALID_CTOR_DECORATORS_FILE = {
        name: _('/invalid_ctor_decorators.js'),
        contents: `
    import {Inject} from '@angular/core';
    class NoParameters {
      constructor() {
      }
    }

    const NotFromCoreDecorator = {};
    class NotFromCore {
      constructor(arg1) {
      }
    }
    NotFromCore.ctorParameters = () => [
      { type: 'ParamType', decorators: [{ type: NotFromCoreDecorator },] },
    ]

    class NotArrowFunction {
      constructor(arg1) {
      }
    }
    NotArrowFunction.ctorParameters = function() {
      return { type: 'ParamType', decorators: [{ type: Inject },] };
    };

    class NotArrayLiteral {
      constructor(arg1) {
      }
    }
    NotArrayLiteral.ctorParameters = () => 'StringsAreNotArrayLiterals';

    class NotObjectLiteral {
      constructor(arg1, arg2) {
      }
    }
    NotObjectLiteral.ctorParameters = () => [
      "This is not an object literal",
      { type: 'ParamType', decorators: [{ type: Inject },] },
    ];

    class NoTypeProperty {
      constructor(arg1, arg2) {
      }
    }
    NoTypeProperty.ctorParameters = () => [
      {
        type: 'ParamType',
        decorators: [
          { notType: Inject },
          { type: Inject },
        ]
      },
    ];

    class NotIdentifier {
      constructor(arg1, arg2) {
      }
    }
    NotIdentifier.ctorParameters = () => [
      {
        type: 'ParamType',
        decorators: [
          { type: 'StringsLiteralsAreNotIdentifiers' },
          { type: Inject },
        ]
      },
    ];
  `,
      };

      INVALID_CTOR_DECORATOR_ARGS_FILE = {
        name: _('/invalid_ctor_decorator_args.js'),
        contents: `
    import {Inject} from '@angular/core';
    class NoArgsProperty {
      constructor(arg1) {
      }
    }
    NoArgsProperty.ctorParameters = () => [
      { type: 'ParamType', decorators: [{ type: Inject },] },
    ];

    const args = [{ selector: '[ignored]' },];
    class NoPropertyAssignment {
      constructor(arg1) {
      }
    }
    NoPropertyAssignment.ctorParameters = () => [
      { type: 'ParamType', decorators: [{ type: Inject, args },] },
    ];

    class NotArrayLiteral {
      constructor(arg1) {
      }
    }
    NotArrayLiteral.ctorParameters = () => [
      { type: 'ParamType', decorators: [{ type: Inject, args: () => [{ selector: '[ignored]' },] },] },
    ];
  `,
      };

      IMPORTS_FILES = [
        {
          name: _('/index.js'),
          contents: `
          import * as a from './a';
          import * as b from './b';
          import * as c from './c';
          `
        },
        {
          name: _('/a.js'),
          contents: `
      export const a = 'a';
    `,
        },
        {
          name: _('/b.js'),
          contents: `
      import {a} from './a.js';
      import {a as foo} from './a.js';

      const b = a;
      const c = foo;
      const d = b;
    `,
        },
      ];

      EXPORTS_FILES = [
        {
          name: _('/index.js'),
          contents: `
          import * as a from './a';
          import * as b from './b';
          `
        },
        {
          name: _('/a.js'),
          contents: `
      export const a = 'a';
    `,
        },
        {
          name: _('/b.js'),
          contents: `
      import {Directive} from '@angular/core';
      import {a} from './a';
      import {a as foo} from './a';
      export {Directive} from '@angular/core';
      export {a} from './a';
      export const b = a;
      export const c = foo;
      export const d = b;
      export const e = 'e';
      export const DirectiveX = Directive;
      export class SomeClass {}
    `,
        },
      ];

      FUNCTION_BODY_FILE = {
        name: _('/function_body.js'),
        contents: `
    function foo(x) {
      return x;
    }
    function bar(x, y = 42) {
      return x + y;
    }
    function baz(x) {
      let y;
      if (y === void 0) { y = 42; }
      return x;
    }
    let y;
    function qux(x) {
      if (x === void 0) { y = 42; }
      return y;
    }
    function moo() {
      let x;
      if (x === void 0) { x = 42; }
      return x;
    }
    let x;
    function juu() {
      if (x === void 0) { x = 42; }
      return x;
    }
  `
      };

      MARKER_FILE = {
        name: _('/marker.js'),
        contents: `
    let compileNgModuleFactory = compileNgModuleFactory__PRE_R3__;

    function compileNgModuleFactory__PRE_R3__(injector, options, moduleType) {
      const compilerFactory = injector.get(CompilerFactory);
      const compiler = compilerFactory.createCompiler([options]);
      return compiler.compileModuleAsync(moduleType);
    }

    function compileNgModuleFactory__POST_R3__(injector, options, moduleType) {
      ngDevMode && assertNgModuleType(moduleType);
      return Promise.resolve(new R3NgModuleFactory(moduleType));
    }
  `
      };

      DECORATED_FILES = [
        {
          name: _('/primary.js'),
          contents: `
    import {Directive} from '@angular/core';
    import {D} from './secondary';
    class A {}
    A.decorators = [
      { type: Directive, args: [{ selector: '[a]' }] }
    ];
    function x() {}
    function y() {}
    class B {}
    B.decorators = [
      { type: Directive, args: [{ selector: '[b]' }] }
    ];
    class C {}
    export { A, x, C };
    `
        },
        {
          name: _('/secondary.js'),
          contents: `
    import {Directive} from '@angular/core';
    class D {}
    D.decorators = [
      { type: Directive, args: [{ selector: '[d]' }] }
    ];
    export {D};
    `
        }
      ];

      ARITY_CLASSES = [
        {
          name: _('/src/class.js'),
          contents: `
      export class NoTypeParam {}
      export class OneTypeParam {}
      export class TwoTypeParams {}
    `,
        },
        {
          name: _('/typings/class.d.ts'),
          contents: `
      export declare class NoTypeParam {}
      export declare class OneTypeParam<T> {}
      export declare class TwoTypeParams<T, K> {}
    `,
        },
      ];

      TYPINGS_SRC_FILES = [
        {
          name: _('/src/index.js'),
          contents: `
        import {InternalClass} from './internal';
        import * as func1 from './func1';
        import * as missing from './missing-class';
        import * as flatFile from './flat-file';
        export * from './class1';
        export * from './class2';
        `
        },
        {
          name: _('/src/class1.js'),
          contents: 'export class Class1 {}\nexport class MissingClass1 {}'
        },
        {name: _('/src/class2.js'), contents: 'export class Class2 {}'},
        {name: _('/src/func1.js'), contents: 'export function mooFn() {}'}, {
          name: _('/src/internal.js'),
          contents: 'export class InternalClass {}\nexport class Class2 {}'
        },
        {name: _('/src/missing-class.js'), contents: 'export class MissingClass2 {}'}, {
          name: _('/src/flat-file.js'),
          contents:
              'export class Class1 {}\nexport class MissingClass1 {}\nexport class MissingClass2 {}\class Class3 {}\nexport {Class3 as xClass3};',
        }
      ];

      TYPINGS_DTS_FILES = [
        {
          name: _('/typings/index.d.ts'),
          contents: `
            import {InternalClass} from './internal';
            import {mooFn} from './func1';
            export * from './class1';
            export * from './class2';
            `
        },
        {
          name: _('/typings/class1.d.ts'),
          contents: `export declare class Class1 {}\nexport declare class OtherClass {}`
        },
        {
          name: _('/typings/class2.d.ts'),
          contents:
              `export declare class Class2 {}\nexport declare interface SomeInterface {}\nexport {Class3 as xClass3} from './class3';`
        },
        {name: _('/typings/func1.d.ts'), contents: 'export declare function mooFn(): void;'},
        {
          name: _('/typings/internal.d.ts'),
          contents: `export declare class InternalClass {}\nexport declare class Class2 {}`
        },
        {name: _('/typings/class3.d.ts'), contents: `export declare class Class3 {}`},
      ];

      MODULE_WITH_PROVIDERS_PROGRAM = [
        {
          name: _('/src/index.js'),
          contents: `
        import * as functions from './functions';
        import * as methods from './methods';
        import * as aliased_class from './aliased_class';
        `
        },
        {
          name: _('/src/functions.js'),
          contents: `
    import {ExternalModule} from './module';
    import * as mod from './module';
    export class SomeService {}
    export class InternalModule {}
    export function aNumber() { return 42; }
    export function aString() { return 'foo'; }
    export function emptyObject() { return {}; }
    export function ngModuleIdentifier() { return { ngModule: InternalModule }; }
    export function ngModuleWithEmptyProviders() { return { ngModule: InternalModule, providers: [] }; }
    export function ngModuleWithProviders() { return { ngModule: InternalModule, providers: [SomeService] }; }
    export function onlyProviders() { return { providers: [SomeService] }; }
    export function ngModuleNumber() { return { ngModule: 42 }; }
    export function ngModuleString() { return { ngModule: 'foo' }; }
    export function ngModuleObject() { return { ngModule: { foo: 42 } }; }
    export function externalNgModule() { return { ngModule: ExternalModule }; }
    export function namespacedExternalNgModule() { return { ngModule: mod.ExternalModule }; }
    `
        },
        {
          name: _('/src/methods.js'),
          contents: `
    import {ExternalModule} from './module';
    import * as mod from './module';
    export class SomeService {}
    export class InternalModule {
      static aNumber() { return 42; }
      static aString() { return 'foo'; }
      static emptyObject() { return {}; }
      static ngModuleIdentifier() { return { ngModule: InternalModule }; }
      static ngModuleWithEmptyProviders() { return { ngModule: InternalModule, providers: [] }; }
      static ngModuleWithProviders() { return { ngModule: InternalModule, providers: [SomeService] }; }
      static onlyProviders() { return { providers: [SomeService] }; }
      static ngModuleNumber() { return { ngModule: 42 }; }
      static ngModuleString() { return { ngModule: 'foo' }; }
      static ngModuleObject() { return { ngModule: { foo: 42 } }; }
      static externalNgModule() { return { ngModule: ExternalModule }; }
      static namespacedExternalNgModule() { return { ngModule: mod.ExternalModule }; }

      instanceNgModuleIdentifier() { return { ngModule: InternalModule }; }
      instanceNgModuleWithEmptyProviders() { return { ngModule: InternalModule, providers: [] }; }
      instanceNgModuleWithProviders() { return { ngModule: InternalModule, providers: [SomeService] }; }
      instanceExternalNgModule() { return { ngModule: ExternalModule }; }
      instanceNamespacedExternalNgModule() { return { ngModule: mod.ExternalModule }; }
    }
    `
        },
        {
          name: _('/src/aliased_class.js'),
          contents: `
    var AliasedModule_1;
    let AliasedModule = AliasedModule_1 = class AliasedModule {
      static forRoot() { return { ngModule: AliasedModule_1 }; }
    };
    export { AliasedModule };
    `
        },
        {name: _('/src/module.js'), contents: 'export class ExternalModule {}'},
      ];

      NAMESPACED_IMPORT_FILE = {
        name: _('/some_directive.js'),
        contents: `
    import * as core from '@angular/core';

    class SomeDirective {
    }
    SomeDirective.decorators = [
      { type: core.Directive, args: [{ selector: '[someDirective]' },] }
    ];
    `
      };
    });

    describe('getDecoratorsOfDeclaration()', () => {
      it('should find the decorators on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators).toBeDefined();
        expect(decorators.length).toEqual(1);

        const decorator = decorators[0];
        expect(decorator.name).toEqual('Directive');
        expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
        expect(decorator.args !.map(arg => arg.getText())).toEqual([
          '{ selector: \'[someDirective]\' }',
        ]);
      });

      it('should return null if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const {program} = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const functionNode =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(functionNode);
        expect(decorators).toBe(null);
      });

      it('should return null if there are no decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode);
        expect(decorators).toBe(null);
      });

      it('should ignore `decorators` if it is not an array literal', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NotArrayLiteral', isNamedClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode);
        expect(decorators).toEqual([]);
      });

      it('should ignore decorator elements that are not object literals', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NotObjectLiteral', isNamedClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
      });

      it('should ignore decorator elements that have no `type` property', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NoTypeProperty', isNamedClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
      });

      it('should ignore decorator elements whose `type` value is not an identifier', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NotIdentifier', isNamedClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
      });

      it('should have import information on decorators', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toEqual(1);
        expect(decorators[0].import).toEqual({name: 'Directive', from: '@angular/core'});
      });

      describe('(returned decorators `args`)', () => {
        it('should be an empty array if decorator has no `args` property', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_DECORATOR_ARGS_FILE.name, 'NoArgsProperty', isNamedClassDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode) !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if decorator\'s `args` has no property assignment', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
              isNamedClassDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode) !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedClassDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode) !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });
      });
    });

    describe('getMembersOfClass()', () => {
      it('should find decorated properties on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);

        const input1 = members.find(member => member.name === 'input1') !;
        expect(input1.kind).toEqual(ClassMemberKind.Property);
        expect(input1.isStatic).toEqual(false);
        expect(input1.decorators !.map(d => d.name)).toEqual(['Input']);
        expect(input1.decorators ![0].import).toEqual({name: 'Input', from: '@angular/core'});

        const input2 = members.find(member => member.name === 'input2') !;
        expect(input2.kind).toEqual(ClassMemberKind.Property);
        expect(input2.isStatic).toEqual(false);
        expect(input2.decorators !.map(d => d.name)).toEqual(['Input']);
        expect(input2.decorators ![0].import).toEqual({name: 'Input', from: '@angular/core'});
      });

      it('should find non decorated properties on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);

        const instanceProperty = members.find(member => member.name === 'instanceProperty') !;
        expect(instanceProperty.kind).toEqual(ClassMemberKind.Property);
        expect(instanceProperty.isStatic).toEqual(false);
        expect(ts.isBinaryExpression(instanceProperty.implementation !)).toEqual(true);
        expect(instanceProperty.value !.getText()).toEqual(`'instance'`);
      });

      it('should handle equally named getter/setter pairs correctly', () => {
        loadTestFiles([ACCESSORS_FILE]);
        const {program} = makeTestBundleProgram(ACCESSORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, ACCESSORS_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);

        const [combinedSetter, combinedGetter] =
            members.filter(member => member.name === 'setterAndGetter');
        expect(combinedSetter.kind).toEqual(ClassMemberKind.Setter);
        expect(combinedSetter.isStatic).toEqual(false);
        expect(ts.isSetAccessor(combinedSetter.implementation !)).toEqual(true);
        expect(combinedSetter.value).toBeNull();
        expect(combinedSetter.decorators !.map(d => d.name)).toEqual(['Input']);
        expect(combinedGetter.kind).toEqual(ClassMemberKind.Getter);
        expect(combinedGetter.isStatic).toEqual(false);
        expect(ts.isGetAccessor(combinedGetter.implementation !)).toEqual(true);
        expect(combinedGetter.value).toBeNull();
        expect(combinedGetter.decorators !.map(d => d.name)).toEqual([]);
      });

      it('should find static methods on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);

        const staticMethod = members.find(member => member.name === 'staticMethod') !;
        expect(staticMethod.kind).toEqual(ClassMemberKind.Method);
        expect(staticMethod.isStatic).toEqual(true);
        expect(ts.isMethodDeclaration(staticMethod.implementation !)).toEqual(true);
      });

      it('should find static properties on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);

        const staticProperty = members.find(member => member.name === 'staticProperty') !;
        expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
        expect(staticProperty.isStatic).toEqual(true);
        expect(ts.isPropertyAccessExpression(staticProperty.implementation !)).toEqual(true);
        expect(staticProperty.value !.getText()).toEqual(`'static'`);
      });

      it('should throw if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const {program} = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const functionNode =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(() => {
          host.getMembersOfClass(functionNode);
        }).toThrowError(`Attempted to get members of a non-class: "function foo() {}"`);
      });

      it('should return an empty array if there are no prop decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);

        expect(members).toEqual([]);
      });

      it('should not process decorated properties in `propDecorators` if it is not an object literal',
         () => {
           loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
           const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const classNode = getDeclaration(
               program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteral',
               isNamedClassDeclaration);
           const members = host.getMembersOfClass(classNode);

           expect(members.map(member => member.name)).not.toContain('prop');
         });

      it('should ignore prop decorator elements that are not object literals', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteralProp',
            isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      it('should ignore prop decorator elements that have no `type` property', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATORS_FILE.name, 'NoTypeProperty', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      it('should ignore prop decorator elements whose `type` value is not an identifier', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATORS_FILE.name, 'NotIdentifier', isNamedClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      describe('(returned prop decorators `args`)', () => {
        it('should be an empty array if prop decorator has no `args` property', () => {
          loadTestFiles([INVALID_PROP_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_PROP_DECORATOR_ARGS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedClassDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop') !;
          const decorators = prop.decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Input');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if prop decorator\'s `args` has no property assignment',
           () => {
             loadTestFiles([INVALID_PROP_DECORATOR_ARGS_FILE]);
             const {program} = makeTestBundleProgram(INVALID_PROP_DECORATOR_ARGS_FILE.name);
             const host =
                 new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
             const classNode = getDeclaration(
                 program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
                 isNamedClassDeclaration);
             const members = host.getMembersOfClass(classNode);
             const prop = members.find(m => m.name === 'prop') !;
             const decorators = prop.decorators !;

             expect(decorators.length).toBe(1);
             expect(decorators[0].name).toBe('Input');
             expect(decorators[0].args).toEqual([]);
           });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_PROP_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_PROP_DECORATOR_ARGS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedClassDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop') !;
          const decorators = prop.decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Input');
          expect(decorators[0].args).toEqual([]);
        });
      });
    });

    describe('getConstructorParameters()', () => {
      it('should find the decorated constructor parameters', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;

        expect(parameters).toBeDefined();
        expect(parameters.map(parameter => parameter.name)).toEqual([
          '_viewContainer', '_template', 'injected'
        ]);
        expectTypeValueReferencesForParameters(
            parameters, ['ViewContainerRef', 'TemplateRef', null]);
      });

      it('should accept `ctorParameters` as an array', () => {
        loadTestFiles([CTOR_DECORATORS_ARRAY_FILE]);
        const {program} = makeTestBundleProgram(CTOR_DECORATORS_ARRAY_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, CTOR_DECORATORS_ARRAY_FILE.name, 'CtorDecoratedAsArray',
            isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;

        expect(parameters).toBeDefined();
        expect(parameters.map(parameter => parameter.name)).toEqual(['arg1']);
        expectTypeValueReferencesForParameters(parameters, ['ParamType']);
      });

      it('should throw if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const {program} = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const functionNode =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(() => { host.getConstructorParameters(functionNode); })
            .toThrowError(
                'Attempted to get constructor parameters of a non-class: "function foo() {}"');
      });

      it('should return `null` if there is no constructor', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        expect(parameters).toBe(null);
      });

      it('should return an array even if there are no decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SIMPLE_CLASS_FILE.name, 'NoDecoratorConstructorClass',
            isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;

        expect(parameters).toEqual(jasmine.any(Array));
        expect(parameters.length).toEqual(1);
        expect(parameters[0].name).toEqual('foo');
        expect(parameters[0].decorators).toBe(null);
      });

      it('should return an empty array if there are no constructor parameters', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NoParameters', isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters).toEqual([]);
      });

      it('should ignore decorators that are not imported from core', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotFromCore', isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;

        expect(parameters.length).toBe(1);
        expect(parameters[0]).toEqual(jasmine.objectContaining<CtorParameter>({
          name: 'arg1',
          decorators: [],
        }));
      });

      it('should ignore `ctorParameters` if it is not an arrow function', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrowFunction',
            isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;

        expect(parameters.length).toBe(1);
        expect(parameters[0]).toEqual(jasmine.objectContaining<CtorParameter>({
          name: 'arg1',
          decorators: null,
        }));
      });

      it('should ignore `ctorParameters` if it does not return an array literal', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrayLiteral', isNamedClassDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;

        expect(parameters.length).toBe(1);
        expect(parameters[0]).toEqual(jasmine.objectContaining<CtorParameter>({
          name: 'arg1',
          decorators: null,
        }));
      });

      describe('synthesized constructors', () => {
        function getConstructorParameters(constructor: string) {
          const file = {
            name: _('/synthesized_constructors.js'),
            contents: `
            class BaseClass {}
            class TestClass extends BaseClass {
              ${constructor}
            }
          `,
          };

          loadTestFiles([file]);
          const {program} = makeTestBundleProgram(file.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode =
              getDeclaration(program, file.name, 'TestClass', isNamedClassDeclaration);
          return host.getConstructorParameters(classNode);
        }

        it('recognizes super call as first statement', () => {
          const parameters = getConstructorParameters(`
          constructor() {
            super(...arguments);
            this.synthesizedProperty = null;
          }`);

          expect(parameters).toBeNull();
        });

        it('does not consider super call without spread element as synthesized', () => {
          const parameters = getConstructorParameters(`
          constructor() {
            super(arguments);
          }`);

          expect(parameters !.length).toBe(0);
        });

        it('does not consider constructors with parameters as synthesized', () => {
          const parameters = getConstructorParameters(`
          constructor(arg) {
            super(...arguments);
          }`);

          expect(parameters !.length).toBe(1);
        });

        it('does not consider manual super calls as synthesized', () => {
          const parameters = getConstructorParameters(`
          constructor() {
            super();
          }`);

          expect(parameters !.length).toBe(0);
        });

        it('does not consider empty constructors as synthesized', () => {
          const parameters = getConstructorParameters(`
          constructor() {
          }`);

          expect(parameters !.length).toBe(0);
        });
      });

      describe('(returned parameters `decorators`)', () => {
        it('should ignore param decorator elements that are not object literals', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATORS_FILE.name, 'NotObjectLiteral',
              isNamedClassDeclaration);
          const parameters = host.getConstructorParameters(classNode);

          expect(parameters !.length).toBe(2);
          expect(parameters ![0]).toEqual(jasmine.objectContaining<CtorParameter>({
            name: 'arg1',
            decorators: null,
          }));
          expect(parameters ![1]).toEqual(jasmine.objectContaining<CtorParameter>({
            name: 'arg2',
            decorators: jasmine.any(Array) as any
          }));
        });

        it('should ignore param decorator elements that have no `type` property', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATORS_FILE.name, 'NoTypeProperty',
              isNamedClassDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters ![0].decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
        });

        it('should ignore param decorator elements whose `type` value is not an identifier', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATORS_FILE.name, 'NotIdentifier', isNamedClassDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters ![0].decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
        });

        it('should have import information on decorators', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
          const parameters = host.getConstructorParameters(classNode) !;
          const decorators = parameters[2].decorators !;

          expect(decorators.length).toEqual(1);
          expect(decorators[0].import).toEqual({name: 'Inject', from: '@angular/core'});
        });
      });

      describe('(returned parameters `decorators.args`)', () => {
        it('should be an empty array if param decorator has no `args` property', () => {
          loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedClassDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          expect(parameters !.length).toBe(1);
          const decorators = parameters ![0].decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Inject');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if param decorator\'s `args` has no property assignment',
           () => {
             loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
             const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
             const host =
                 new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
             const classNode = getDeclaration(
                 program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
                 isNamedClassDeclaration);
             const parameters = host.getConstructorParameters(classNode);
             const decorators = parameters ![0].decorators !;

             expect(decorators.length).toBe(1);
             expect(decorators[0].name).toBe('Inject');
             expect(decorators[0].args).toEqual([]);
           });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
          const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedClassDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters ![0].decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Inject');
          expect(decorators[0].args).toEqual([]);
        });
      });
    });

    describe('getDefinitionOfFunction()', () => {
      it('should return an object describing the function declaration passed as an argument',
         () => {
           loadTestFiles([FUNCTION_BODY_FILE]);
           const {program} = makeTestBundleProgram(FUNCTION_BODY_FILE.name);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());

           const fooNode = getDeclaration(
               program, FUNCTION_BODY_FILE.name, 'foo', isNamedFunctionDeclaration) !;
           const fooDef = host.getDefinitionOfFunction(fooNode) !;
           expect(fooDef.node).toBe(fooNode);
           expect(fooDef.body !.length).toEqual(1);
           expect(fooDef.body ![0].getText()).toEqual(`return x;`);
           expect(fooDef.parameters.length).toEqual(1);
           expect(fooDef.parameters[0].name).toEqual('x');
           expect(fooDef.parameters[0].initializer).toBe(null);

           const barNode = getDeclaration(
               program, FUNCTION_BODY_FILE.name, 'bar', isNamedFunctionDeclaration) !;
           const barDef = host.getDefinitionOfFunction(barNode) !;
           expect(barDef.node).toBe(barNode);
           expect(barDef.body !.length).toEqual(1);
           expect(ts.isReturnStatement(barDef.body ![0])).toBeTruthy();
           expect(barDef.body ![0].getText()).toEqual(`return x + y;`);
           expect(barDef.parameters.length).toEqual(2);
           expect(barDef.parameters[0].name).toEqual('x');
           expect(fooDef.parameters[0].initializer).toBe(null);
           expect(barDef.parameters[1].name).toEqual('y');
           expect(barDef.parameters[1].initializer !.getText()).toEqual('42');

           const bazNode = getDeclaration(
               program, FUNCTION_BODY_FILE.name, 'baz', isNamedFunctionDeclaration) !;
           const bazDef = host.getDefinitionOfFunction(bazNode) !;
           expect(bazDef.node).toBe(bazNode);
           expect(bazDef.body !.length).toEqual(3);
           expect(bazDef.parameters.length).toEqual(1);
           expect(bazDef.parameters[0].name).toEqual('x');
           expect(bazDef.parameters[0].initializer).toBe(null);

           const quxNode = getDeclaration(
               program, FUNCTION_BODY_FILE.name, 'qux', isNamedFunctionDeclaration) !;
           const quxDef = host.getDefinitionOfFunction(quxNode) !;
           expect(quxDef.node).toBe(quxNode);
           expect(quxDef.body !.length).toEqual(2);
           expect(quxDef.parameters.length).toEqual(1);
           expect(quxDef.parameters[0].name).toEqual('x');
           expect(quxDef.parameters[0].initializer).toBe(null);

           const mooNode = getDeclaration(
               program, FUNCTION_BODY_FILE.name, 'moo', isNamedFunctionDeclaration) !;
           const mooDef = host.getDefinitionOfFunction(mooNode) !;
           expect(mooDef.node).toBe(mooNode);
           expect(mooDef.body !.length).toEqual(3);
           expect(mooDef.parameters).toEqual([]);

           const juuNode = getDeclaration(
               program, FUNCTION_BODY_FILE.name, 'juu', isNamedFunctionDeclaration) !;
           const juuDef = host.getDefinitionOfFunction(juuNode) !;
           expect(juuDef.node).toBe(juuNode);
           expect(juuDef.body !.length).toEqual(2);
           expect(juuDef.parameters).toEqual([]);
         });
    });

    describe('getImportOfIdentifier()', () => {
      it('should find the import of an identifier', () => {
        loadTestFiles(IMPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const variableNode = getDeclaration(program, _('/b.js'), 'b', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
      });

      it('should find the name by which the identifier was exported, not imported', () => {
        loadTestFiles(IMPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const variableNode = getDeclaration(program, _('/b.js'), 'c', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
      });

      it('should return null if the identifier was not imported', () => {
        loadTestFiles(IMPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const variableNode = getDeclaration(program, _('/b.js'), 'd', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toBeNull();
      });
    });

    describe('getDeclarationOfIdentifier()', () => {
      it('should return the declaration of a locally defined identifier', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const ctrDecorators = host.getConstructorParameters(classNode) !;
        const identifierOfViewContainerRef = (ctrDecorators[0].typeValueReference !as{
                                               local: true,
                                               expression: ts.Identifier,
                                               defaultImportStatement: null,
                                             }).expression;

        const expectedDeclarationNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'ViewContainerRef', isNamedVariableDeclaration);
        const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfViewContainerRef);
        expect(actualDeclaration).not.toBe(null);
        expect(actualDeclaration !.node).toBe(expectedDeclarationNode);
        expect(actualDeclaration !.viaModule).toBe(null);
      });

      it('should return the declaration of an externally defined identifier', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedClassDeclaration);
        const classDecorators = host.getDecoratorsOfDeclaration(classNode) !;
        const identifierOfDirective = ((classDecorators[0].node as ts.ObjectLiteralExpression)
                                           .properties[0] as ts.PropertyAssignment)
                                          .initializer as ts.Identifier;

        const expectedDeclarationNode = getDeclaration(
            program, _('/node_modules/@angular/core/index.d.ts'), 'Directive',
            isNamedVariableDeclaration);
        const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfDirective);
        expect(actualDeclaration).not.toBe(null);
        expect(actualDeclaration !.node).toBe(expectedDeclarationNode);
        expect(actualDeclaration !.viaModule).toBe('@angular/core');
      });

      it('should return the source-file of an import namespace', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles([NAMESPACED_IMPORT_FILE]);
        const {program} = makeTestBundleProgram(NAMESPACED_IMPORT_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, NAMESPACED_IMPORT_FILE.name, 'SomeDirective', ts.isClassDeclaration);
        const classDecorators = host.getDecoratorsOfDeclaration(classNode) !;
        const identifier = (((classDecorators[0].node as ts.ObjectLiteralExpression)
                                 .properties[0] as ts.PropertyAssignment)
                                .initializer as ts.PropertyAccessExpression)
                               .expression as ts.Identifier;

        const expectedDeclarationNode =
            getSourceFileOrError(program, _('/node_modules/@angular/core/index.d.ts'));
        const actualDeclaration = host.getDeclarationOfIdentifier(identifier);
        expect(actualDeclaration).not.toBe(null);
        expect(actualDeclaration !.node).toBe(expectedDeclarationNode);
        expect(actualDeclaration !.viaModule).toBe(null);
      });

      it('should return the original declaration of an aliased class', () => {
        loadTestFiles([CLASS_EXPRESSION_FILE]);
        const {program} = makeTestBundleProgram(CLASS_EXPRESSION_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classDeclaration = getDeclaration(
            program, CLASS_EXPRESSION_FILE.name, 'AliasedClass', ts.isVariableDeclaration);
        const usageOfAliasedClass = getDeclaration(
            program, CLASS_EXPRESSION_FILE.name, 'usageOfAliasedClass', ts.isVariableDeclaration);
        const aliasedClassIdentifier = usageOfAliasedClass.initializer as ts.Identifier;
        expect(aliasedClassIdentifier.text).toBe('AliasedClass_1');
        expect(host.getDeclarationOfIdentifier(aliasedClassIdentifier) !.node)
            .toBe(classDeclaration);
      });
    });

    describe('getExportsOfModule()', () => {
      it('should return a map of all the exports from a given module', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles(EXPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const file = getSourceFileOrError(program, _('/b.js'));
        const exportDeclarations = host.getExportsOfModule(file);
        expect(exportDeclarations).not.toBe(null);
        expect(Array.from(exportDeclarations !.keys())).toEqual([
          'Directive',
          'a',
          'b',
          'c',
          'd',
          'e',
          'DirectiveX',
          'SomeClass',
        ]);

        const values = Array.from(exportDeclarations !.values())
                           .map(declaration => [declaration.node.getText(), declaration.viaModule]);
        expect(values).toEqual([
          [`Directive: FnWithArg<(clazz: any) => any>`, null],
          [`a = 'a'`, null],
          [`b = a`, null],
          [`c = foo`, null],
          [`d = b`, null],
          [`e = 'e'`, null],
          [`DirectiveX = Directive`, null],
          ['export class SomeClass {}', null],
        ]);
      });
    });

    describe('isClass()', () => {
      it('should return true if a given node is a TS class declaration', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const node =
            getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
        expect(host.isClass(node)).toBe(true);
      });

      it('should return true if a given node is a class expression assigned into a variable',
         () => {
           loadTestFiles([CLASS_EXPRESSION_FILE]);
           const {program} = makeTestBundleProgram(CLASS_EXPRESSION_FILE.name);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const node = getDeclaration(
               program, CLASS_EXPRESSION_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
           expect(host.isClass(node)).toBe(true);
         });

      it('should return true if a given node is a class expression assigned into two variables',
         () => {
           loadTestFiles([CLASS_EXPRESSION_FILE]);
           const {program} = makeTestBundleProgram(CLASS_EXPRESSION_FILE.name);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const node = getDeclaration(
               program, CLASS_EXPRESSION_FILE.name, 'AliasedClass', ts.isVariableDeclaration);
           expect(host.isClass(node)).toBe(true);
         });

      it('should return false if a given node is a TS function declaration', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const {program} = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const node =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(host.isClass(node)).toBe(false);
      });
    });

    describe('hasBaseClass()', () => {
      it('should not consider a class without extends clause as having a base class', () => {
        const file = {
          name: _('/base_class.js'),
          contents: `class TestClass {}`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(program, file.name, 'TestClass', isNamedClassDeclaration);
        expect(host.hasBaseClass(classNode)).toBe(false);
      });

      it('should consider a class with extends clause as having a base class', () => {
        const file = {
          name: _('/base_class.js'),
          contents: `
        class BaseClass {}
        class TestClass extends BaseClass {}`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(program, file.name, 'TestClass', isNamedClassDeclaration);
        expect(host.hasBaseClass(classNode)).toBe(true);
      });

      it('should consider an aliased class with extends clause as having a base class', () => {
        const file = {
          name: _('/base_class.js'),
          contents: `
        let TestClass_1;
        class BaseClass {}
        let TestClass = TestClass_1 = class TestClass extends BaseClass {}`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, file.name, 'TestClass', isNamedVariableDeclaration);
        expect(host.hasBaseClass(classNode)).toBe(true);
      });
    });

    describe('getBaseClassExpression()', () => {
      it('should not consider a class without extends clause as having a base class', () => {
        const file = {
          name: _('/base_class.js'),
          contents: `class TestClass {}`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(program, file.name, 'TestClass', isNamedClassDeclaration);
        expect(host.getBaseClassExpression(classNode)).toBe(null);
      });

      it('should find the base class of a class with an `extends` clause', () => {
        const file = {
          name: _('/base_class.js'),
          contents: `
        class BaseClass {}
        class TestClass extends BaseClass {}`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(program, file.name, 'TestClass', isNamedClassDeclaration);
        const baseIdentifier = host.getBaseClassExpression(classNode) !;
        if (!ts.isIdentifier(baseIdentifier)) {
          throw new Error(`Expected ${baseIdentifier.getText()} to be an identifier.`);
        }
        expect(baseIdentifier.text).toEqual('BaseClass');
      });

      it('should find the base class of an aliased class with an `extends` clause', () => {
        const file = {
          name: _('/base_class.js'),
          contents: `
        let TestClass_1;
        class BaseClass {}
        let TestClass = TestClass_1 = class TestClass extends BaseClass {}`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, file.name, 'TestClass', isNamedVariableDeclaration);
        const baseIdentifier = host.getBaseClassExpression(classNode) !;
        if (!ts.isIdentifier(baseIdentifier)) {
          throw new Error(`Expected ${baseIdentifier.getText()} to be an identifier.`);
        }
        expect(baseIdentifier.text).toEqual('BaseClass');
      });

      it('should find the base class expression of a class with a dynamic `extends` expression',
         () => {
           const file = {
             name: _('/base_class.js'),
             contents: `
        class BaseClass {}
        function foo() { return BaseClass; }
        class TestClass extends foo() {}`,
           };
           loadTestFiles([file]);
           const {program} = makeTestBundleProgram(file.name);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const classNode =
               getDeclaration(program, file.name, 'TestClass', isNamedClassDeclaration);
           const baseExpression = host.getBaseClassExpression(classNode) !;
           expect(baseExpression.getText()).toEqual('foo()');
         });
    });

    describe('getGenericArityOfClass()', () => {
      it('should properly count type parameters', () => {
        loadTestFiles(ARITY_CLASSES);
        const {program} = makeTestBundleProgram(ARITY_CLASSES[0].name);
        const dts = makeTestBundleProgram(ARITY_CLASSES[1].name);
        const host =
            new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);
        const noTypeParamClass =
            getDeclaration(program, _('/src/class.js'), 'NoTypeParam', isNamedClassDeclaration);
        expect(host.getGenericArityOfClass(noTypeParamClass)).toBe(0);
        const oneTypeParamClass =
            getDeclaration(program, _('/src/class.js'), 'OneTypeParam', isNamedClassDeclaration);
        expect(host.getGenericArityOfClass(oneTypeParamClass)).toBe(1);
        const twoTypeParamsClass =
            getDeclaration(program, _('/src/class.js'), 'TwoTypeParams', isNamedClassDeclaration);
        expect(host.getGenericArityOfClass(twoTypeParamsClass)).toBe(2);
      });
    });

    describe('getSwitchableDeclarations()', () => {
      it('should return a collection of all the switchable variable declarations in the given module',
         () => {
           loadTestFiles([MARKER_FILE]);
           const {program} = makeTestBundleProgram(MARKER_FILE.name);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const file = getSourceFileOrError(program, MARKER_FILE.name);
           const declarations = host.getSwitchableDeclarations(file);
           expect(declarations.map(d => [d.name.getText(), d.initializer !.getText()])).toEqual([
             ['compileNgModuleFactory', 'compileNgModuleFactory__PRE_R3__']
           ]);
         });
    });

    describe('findClassSymbols()', () => {
      it('should return an array of all classes in the given source file', () => {
        loadTestFiles(DECORATED_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(DECORATED_FILES)[0]);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const primaryFile = getSourceFileOrError(program, DECORATED_FILES[0].name);
        const secondaryFile = getSourceFileOrError(program, DECORATED_FILES[1].name);

        const classSymbolsPrimary = host.findClassSymbols(primaryFile);
        expect(classSymbolsPrimary.length).toEqual(3);
        expect(classSymbolsPrimary.map(c => c.name)).toEqual(['A', 'B', 'C']);

        const classSymbolsSecondary = host.findClassSymbols(secondaryFile);
        expect(classSymbolsSecondary.length).toEqual(1);
        expect(classSymbolsSecondary.map(c => c.name)).toEqual(['D']);
      });
    });

    describe('getDecoratorsOfSymbol()', () => {
      it('should return decorators of class symbol', () => {
        loadTestFiles(DECORATED_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(DECORATED_FILES)[0]);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const primaryFile = getSourceFileOrError(program, DECORATED_FILES[0].name);
        const secondaryFile = getSourceFileOrError(program, DECORATED_FILES[1].name);

        const classSymbolsPrimary = host.findClassSymbols(primaryFile);
        const classDecoratorsPrimary = classSymbolsPrimary.map(s => host.getDecoratorsOfSymbol(s));
        expect(classDecoratorsPrimary.length).toEqual(3);
        expect(classDecoratorsPrimary[0] !.map(d => d.name)).toEqual(['Directive']);
        expect(classDecoratorsPrimary[1] !.map(d => d.name)).toEqual(['Directive']);
        expect(classDecoratorsPrimary[2]).toBe(null);

        const classSymbolsSecondary = host.findClassSymbols(secondaryFile);
        const classDecoratorsSecondary =
            classSymbolsSecondary.map(s => host.getDecoratorsOfSymbol(s));
        expect(classDecoratorsSecondary.length).toEqual(1);
        expect(classDecoratorsSecondary[0] !.map(d => d.name)).toEqual(['Directive']);
      });
    });

    describe('getDtsDeclarationsOfClass()', () => {
      it('should find the dts declaration that has the same relative path to the source file',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const class1 =
               getDeclaration(program, _('/src/class1.js'), 'Class1', isNamedClassDeclaration);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

           const dtsDeclaration = host.getDtsDeclaration(class1);
           expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/class1.d.ts'));
         });

      it('should find the dts declaration for exported functions', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const mooFn =
            getDeclaration(program, _('/src/func1.js'), 'mooFn', isNamedFunctionDeclaration);
        const host =
            new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

        const dtsDeclaration = host.getDtsDeclaration(mooFn);
        expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/func1.d.ts'));
      });

      it('should return null if there is no matching class in the matching dts file', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const missingClass =
            getDeclaration(program, _('/src/class1.js'), 'MissingClass1', isNamedClassDeclaration);
        const host =
            new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

        expect(host.getDtsDeclaration(missingClass)).toBe(null);
      });

      it('should return null if there is no matching dts file', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const missingClass = getDeclaration(
            program, _('/src/missing-class.js'), 'MissingClass2', isNamedClassDeclaration);
        const host =
            new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

        expect(host.getDtsDeclaration(missingClass)).toBe(null);
      });

      it('should find the dts file that contains a matching class declaration, even if the source files do not match',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const class1 =
               getDeclaration(program, _('/src/flat-file.js'), 'Class1', isNamedClassDeclaration);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

           const dtsDeclaration = host.getDtsDeclaration(class1);
           expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/class1.d.ts'));
         });

      it('should find aliased exports', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const class3 =
            getDeclaration(program, _('/src/flat-file.js'), 'Class3', isNamedClassDeclaration);
        const host =
            new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

        const dtsDeclaration = host.getDtsDeclaration(class3);
        expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/class3.d.ts'));
      });

      it('should find the dts file that contains a matching class declaration, even if the class is not publicly exported',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const internalClass = getDeclaration(
               program, _('/src/internal.js'), 'InternalClass', isNamedClassDeclaration);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

           const dtsDeclaration = host.getDtsDeclaration(internalClass);
           expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/internal.d.ts'));
         });

      it('should prefer the publicly exported class if there are multiple classes with the same name',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const class2 =
               getDeclaration(program, _('/src/class2.js'), 'Class2', isNamedClassDeclaration);
           const internalClass2 =
               getDeclaration(program, _('/src/internal.js'), 'Class2', isNamedClassDeclaration);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

           const class2DtsDeclaration = host.getDtsDeclaration(class2);
           expect(class2DtsDeclaration !.getSourceFile().fileName)
               .toEqual(_('/typings/class2.d.ts'));

           const internalClass2DtsDeclaration = host.getDtsDeclaration(internalClass2);
           expect(internalClass2DtsDeclaration !.getSourceFile().fileName)
               .toEqual(_('/typings/class2.d.ts'));
         });
    });

    describe('getModuleWithProvidersFunctions()', () => {
      it('should find every exported function that returns an object that looks like a ModuleWithProviders object',
         () => {
           loadTestFiles(MODULE_WITH_PROVIDERS_PROGRAM);
           const {program} = makeTestBundleProgram(getRootFiles(MODULE_WITH_PROVIDERS_PROGRAM)[0]);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const file = getSourceFileOrError(program, _('/src/functions.js'));
           const fns = host.getModuleWithProvidersFunctions(file);
           expect(fns.map(fn => [fn.declaration.name !.getText(), fn.ngModule.node.name.text]))
               .toEqual([
                 ['ngModuleIdentifier', 'InternalModule'],
                 ['ngModuleWithEmptyProviders', 'InternalModule'],
                 ['ngModuleWithProviders', 'InternalModule'],
                 ['externalNgModule', 'ExternalModule'],
                 ['namespacedExternalNgModule', 'ExternalModule'],
               ]);
         });

      it('should find every static method on exported classes that return an object that looks like a ModuleWithProviders object',
         () => {
           loadTestFiles(MODULE_WITH_PROVIDERS_PROGRAM);
           const {program} = makeTestBundleProgram(getRootFiles(MODULE_WITH_PROVIDERS_PROGRAM)[0]);
           const host =
               new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const file = getSourceFileOrError(program, _('/src/methods.js'));
           const fn = host.getModuleWithProvidersFunctions(file);
           expect(fn.map(fn => [fn.declaration.name !.getText(), fn.ngModule.node.name.text]))
               .toEqual([
                 ['ngModuleIdentifier', 'InternalModule'],
                 ['ngModuleWithEmptyProviders', 'InternalModule'],
                 ['ngModuleWithProviders', 'InternalModule'],
                 ['externalNgModule', 'ExternalModule'],
                 ['namespacedExternalNgModule', 'ExternalModule'],
               ]);
         });

      // https://github.com/angular/angular/issues/29078
      it('should resolve aliased module references to their original declaration', () => {
        loadTestFiles(MODULE_WITH_PROVIDERS_PROGRAM);
        const {program} = makeTestBundleProgram(getRootFiles(MODULE_WITH_PROVIDERS_PROGRAM)[0]);
        const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const file = getSourceFileOrError(program, _('/src/aliased_class.js'));
        const fn = host.getModuleWithProvidersFunctions(file);
        expect(fn.map(fn => [fn.declaration.name !.getText(), fn.ngModule.node.name.text]))
            .toEqual([
              ['forRoot', 'AliasedModule'],
            ]);
      });
    });
  });
});
