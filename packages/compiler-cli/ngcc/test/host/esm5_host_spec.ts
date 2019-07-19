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
import {ClassMemberKind, CtorParameter, Decorator, Import, TsHelperFn, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {getDeclaration} from '../../../src/ngtsc/testing';
import {loadFakeCore, loadTestFiles} from '../../../test/helpers';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {Esm5ReflectionHost, getIifeBody} from '../../src/host/esm5_host';
import {MockLogger} from '../helpers/mock_logger';
import {getRootFiles, makeTestBundleProgram} from '../helpers/utils';

import {expectTypeValueReferencesForParameters} from './util';

runInEachFileSystem(() => {
  describe('Esm5ReflectionHost', () => {

    let _: typeof absoluteFrom;

    let SOME_DIRECTIVE_FILE: TestFile;
    let CTOR_DECORATORS_ARRAY_FILE: TestFile;
    let ACCESSORS_FILE: TestFile;
    let SIMPLE_ES2015_CLASS_FILE: TestFile;
    let SIMPLE_CLASS_FILE: TestFile;
    let TOPLEVEL_DECORATORS_FILE: TestFile;
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
    let DECORATED_FILES: TestFile[];
    let UNWANTED_PROTOTYPE_EXPORT_FILE: TestFile;
    let TYPINGS_SRC_FILES: TestFile[];
    let TYPINGS_DTS_FILES: TestFile[];
    let MODULE_WITH_PROVIDERS_PROGRAM: TestFile[];
    let NAMESPACED_IMPORT_FILE: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;
      SOME_DIRECTIVE_FILE = {
        name: _('/some_directive.js'),
        contents: `
    import { Directive, Inject, InjectionToken, Input } from '@angular/core';

    var INJECTED_TOKEN = new InjectionToken('injected');
    var ViewContainerRef = {};
    var TemplateRef = {};

    var SomeDirective = (function() {
      function SomeDirective(_viewContainer, _template, injected) {
        this.instanceProperty = 'instance';
      }
      SomeDirective.prototype = {
        instanceMethod: function() {},
      };
      SomeDirective.staticMethod = function() {};
      SomeDirective.staticProperty = 'static';
      SomeDirective.decorators = [
        { type: Directive, args: [{ selector: '[someDirective]' },] }
      ];
      SomeDirective.ctorParameters = function() { return [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
      ]; };
      SomeDirective.propDecorators = {
        "input1": [{ type: Input },],
        "input2": [{ type: Input },],
      };
      return SomeDirective;
    }());
  `,
      };

      TOPLEVEL_DECORATORS_FILE = {
        name: _('/toplevel_decorators.js'),
        contents: `
    import { Directive, Inject, InjectionToken, Input } from '@angular/core';

    var INJECTED_TOKEN = new InjectionToken('injected');
    var ViewContainerRef = {};
    var TemplateRef = {};

    var SomeDirective = (function() {
      function SomeDirective(_viewContainer, _template, injected) {}
      return SomeDirective;
    }());
    SomeDirective.decorators = [
      { type: Directive, args: [{ selector: '[someDirective]' },] }
    ];
    SomeDirective.ctorParameters = function() { return [
      { type: ViewContainerRef, },
      { type: TemplateRef, },
      { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
    ]; };
    SomeDirective.propDecorators = {
      "input1": [{ type: Input },],
      "input2": [{ type: Input },],
    };
  `,
      };

      CTOR_DECORATORS_ARRAY_FILE = {
        name: _('/ctor_decorated_as_array.js'),
        contents: `
          var CtorDecoratedAsArray = (function() {
            function CtorDecoratedAsArray(arg1) {
            }
            CtorDecoratedAsArray.ctorParameters = [{ type: ParamType, decorators: [{ type: Inject },] }];
            return CtorDecoratedAsArray;
          }());
        `,
      };

      ACCESSORS_FILE = {
        name: _('/accessors.js'),
        contents: `
    import { Directive, Input, Output } from '@angular/core';

    var SomeDirective = (function() {
      function SomeDirective() {
      }
      Object.defineProperty(SomeDirective.prototype, "setter", {
          set: function (value) { this.value = value; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SomeDirective.prototype, "getter", {
          get: function () { return null; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SomeDirective.prototype, "setterAndGetter", {
          get: function () { return null; },
          set: function (value) { this.value = value; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SomeDirective, "staticSetter", {
          set: function (value) { this.value = value; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SomeDirective.prototype, "none", {
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SomeDirective.prototype, "incomplete");
      SomeDirective.decorators = [
        { type: Directive, args: [{ selector: '[someDirective]' },] }
      ];
      SomeDirective.propDecorators = {
        "setter": [{ type: Input },],
        "getter": [{ type: Output },],
        "setterAndGetter": [{ type: Input },],
      };
      return SomeDirective;
    }());
  `,
      };

      SIMPLE_ES2015_CLASS_FILE = {
        name: _('/simple_es2015_class.d.ts'),
        contents: `
    export class EmptyClass {}
  `,
      };

      SIMPLE_CLASS_FILE = {
        name: _('/simple_class.js'),
        contents: `
    var EmptyClass = (function() {
      function EmptyClass() {
      }
      return EmptyClass;
    }());
    var NoDecoratorConstructorClass = (function() {
      function NoDecoratorConstructorClass(foo) {
      }
      return NoDecoratorConstructorClass;
    }());
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
    import { Directive } from '@angular/core';
    var NotArrayLiteral = (function() {
      function NotArrayLiteral() {
      }
      NotArrayLiteral.decorators = () => [
        { type: Directive, args: [{ selector: '[ignored]' },] },
      ];
      return NotArrayLiteral;
    }());

    var NotObjectLiteral = (function() {
      function NotObjectLiteral() {
      }
      NotObjectLiteral.decorators = [
        "This is not an object literal",
        { type: Directive },
      ];
      return NotObjectLiteral;
    }());

    var NoTypeProperty = (function() {
      function NoTypeProperty() {
      }
      NoTypeProperty.decorators = [
        { notType: Directive },
        { type: Directive },
      ];
      return NoTypeProperty;
    }());

    var NotIdentifier = (function() {
      function NotIdentifier() {
      }
      NotIdentifier.decorators = [
        { type: 'StringsLiteralsAreNotIdentifiers' },
        { type: Directive },
      ];
      return NotIdentifier;
    }());
  `,
      };

      INVALID_DECORATOR_ARGS_FILE = {
        name: _('/invalid_decorator_args.js'),
        contents: `
    import { Directive } from '@angular/core';
    var NoArgsProperty = (function() {
      function NoArgsProperty() {
      }
      NoArgsProperty.decorators = [
        { type: Directive },
      ];
      return NoArgsProperty;
    }());

    var args = [{ selector: '[ignored]' },];
    var NoPropertyAssignment = (function() {
      function NoPropertyAssignment() {
      }
      NoPropertyAssignment.decorators = [
        { type: Directive, args },
      ];
      return NoPropertyAssignment;
    }());

    var NotArrayLiteral = (function() {
      function NotArrayLiteral() {
      }
      NotArrayLiteral.decorators = [
        { type: Directive, args: () => [{ selector: '[ignored]' },] },
      ];
      return NotArrayLiteral;
    }());
    `,
      };

      INVALID_PROP_DECORATORS_FILE = {
        name: _('/invalid_prop_decorators.js'),
        contents: `
    import { Input } from '@angular/core';
    var NotObjectLiteral = (function() {
      function NotObjectLiteral() {
      }
      NotObjectLiteral.propDecorators = () => ({
        "prop": [{ type: Input },]
      });
      return NotObjectLiteral;
    }());

    var NotObjectLiteralProp = (function() {
      function NotObjectLiteralProp() {
      }
      NotObjectLiteralProp.propDecorators = {
        "prop": [
          "This is not an object literal",
          { type: Input },
        ]
      };
      return NotObjectLiteralProp;
    }());

    var NoTypeProperty = (function() {
      function NoTypeProperty() {
      }
      NoTypeProperty.propDecorators = {
        "prop": [
          { notType: Input },
          { type: Input },
        ]
      };
      return NoTypeProperty;
    }());

    var NotIdentifier = (function() {
      function NotIdentifier() {
      }
      NotIdentifier.propDecorators = {
        "prop": [
          { type: 'StringsLiteralsAreNotIdentifiers' },
          { type: Input },
        ]
      };
      return NotIdentifier;
    }());
    `,
      };

      INVALID_PROP_DECORATOR_ARGS_FILE = {
        name: _('/invalid_prop_decorator_args.js'),
        contents: `
    import { Input } from '@angular/core';
    var NoArgsProperty = (function() {
      function NoArgsProperty() {
      }
      NoArgsProperty.propDecorators = {
        "prop": [{ type: Input },]
      };
      return NoArgsProperty;
    }());

    var args = [{ selector: '[ignored]' },];
    var NoPropertyAssignment = (function() {
      function NoPropertyAssignment() {
      }
      NoPropertyAssignment.propDecorators = {
        "prop": [{ type: Input, args },]
      };
      return NoPropertyAssignment;
    }());

    var NotArrayLiteral = (function() {
      function NotArrayLiteral() {
      }
      NotArrayLiteral.propDecorators = {
        "prop": [{ type: Input, args: () => [{ selector: '[ignored]' },] },],
      };
      return NotArrayLiteral;
    }());
    `,
      };

      INVALID_CTOR_DECORATORS_FILE = {
        name: _('/invalid_ctor_decorators.js'),
        contents: `
    import { Inject } from '@angular/core';
    var NoParametersDecorator = {};
    var NoParameters = (function() {
      function NoParameters() {}
      return NoParameters;
    }());

    var NotArrayLiteral = (function() {
      function NotArrayLiteral(arg1) {
      }
      NotArrayLiteral.ctorParameters = function() { return 'StringsAreNotArrayLiterals'; };
      return NotArrayLiteral;
    }());

    var NotObjectLiteral = (function() {
      function NotObjectLiteral(arg1, arg2) {
      }
      NotObjectLiteral.ctorParameters = function() { return [
        "This is not an object literal",
        { type: 'ParamType', decorators: [{ type: Inject },] },
      ]; };
      return NotObjectLiteral;
    }());

    var NoTypeProperty = (function() {
      function NoTypeProperty(arg1, arg2) {
      }
      NoTypeProperty.ctorParameters = function() { return [
        {
          type: 'ParamType',
          decorators: [
            { notType: Inject },
            { type: Inject },
          ]
        },
      ]; };
      return NoTypeProperty;
    }());

    var NotIdentifier = (function() {
      function NotIdentifier(arg1, arg2) {
      }
      NotIdentifier.ctorParameters = function() { return [
        {
          type: 'ParamType',
          decorators: [
            { type: 'StringsLiteralsAreNotIdentifiers' },
            { type: Inject },
          ]
        },
      ]; };
      return NotIdentifier;
    }());
    `,
      };

      INVALID_CTOR_DECORATOR_ARGS_FILE = {
        name: _('/invalid_ctor_decorator_args.js'),
        contents: `
    import { Inject } from '@angular/core';
    var NoArgsProperty = (function() {
      function NoArgsProperty(arg1) {
      }
      NoArgsProperty.ctorParameters = function() { return [
        { type: 'ParamType', decorators: [{ type: Inject },] },
      ]; };
      return NoArgsProperty;
    }());

    var args = [{ selector: '[ignored]' },];
    var NoPropertyAssignment = (function() {
      function NoPropertyAssignment(arg1) {
      }
      NoPropertyAssignment.ctorParameters = function() { return [
        { type: 'ParamType', decorators: [{ type: Inject, args },] },
      ]; };
      return NoPropertyAssignment;
    }());

    var NotArrayLiteral = (function() {
      function NotArrayLiteral(arg1) {
      }
      NotArrayLiteral.ctorParameters = function() { return [
        { type: 'ParamType', decorators: [{ type: Inject, args: () => [{ selector: '[ignored]' },] },] },
      ]; };
      return NotArrayLiteral;
    }());
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
      export var a = 'a';
    `,
        },
        {
          name: _('/b.js'),
          contents: `
      import {a} from './a.js';
      import {a as foo} from './a.js';

      var b = a;
      var c = foo;
      var d = b;
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
      export var a = 'a';
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
      export var b = a;
      export var c = foo;
      export var d = b;
      export var e = 'e';
      export var DirectiveX = Directive;
      export var SomeClass = (function() {
        function SomeClass() {}
        return SomeClass;
      }());
    `,
        },
      ];

      FUNCTION_BODY_FILE = {
        name: _('/function_body.js'),
        contents: `
    function foo(x) {
      return x;
    }
    function bar(x, y) {
      if (y === void 0) { y = 42; }
      return x + y;
    }
    function complex() {
      var x = 42;
      return 42;
    }
    function baz(x) {
      var y;
      if (x === void 0) { y = 42; }
      return y;
    }
    var y;
    function qux(x) {
      if (x === void 0) { y = 42; }
      return y;
    }
    function moo() {
      var x;
      if (x === void 0) { x = 42; }
      return x;
    }
    var x;
    function juu() {
      if (x === void 0) { x = 42; }
      return x;
    }
  `
      };

      DECORATED_FILES = [
        {
          name: _('/primary.js'),
          contents: `
    import {Directive} from '@angular/core';
    import { D } from './secondary';
    var A = (function() {
      function A() {}
      A.decorators = [
        { type: Directive, args: [{ selector: '[a]' }] }
      ];
      return A;
    }());
     var B = (function() {
      function B() {}
      B.decorators = [
        { type: Directive, args: [{ selector: '[b]' }] }
      ];
      return B;
    }());
     function x() {}
     function y() {}
     var C = (function() {
      function C() {}
      return C;
    });
    export { A, x, C };
    `
        },
        {
          name: _('/secondary.js'),
          contents: `
    import {Directive} from '@angular/core';
    var D = (function() {
      function D() {}
      D.decorators = [
        { type: Directive, args: [{ selector: '[d]' }] }
      ];
      return D;
    }());
    export { D };
    `
        }
      ];

      UNWANTED_PROTOTYPE_EXPORT_FILE = {
        name: _('/library.d.ts'),
        contents: `
    export declare class SomeParam {
      someInstanceMethod(): void;
      static someStaticProp: any;
    }`
      };

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
          contents: `
        var Class1 = (function() {
          function Class1() {}
          return Class1;
        }());
        var MissingClass1 = (function() {
          function MissingClass1() {}
          return MissingClass1;
        }());
        export {Class1, MissingClass1};
        `
        },
        {
          name: _('/src/class2.js'),
          contents: `
        var Class2 = (function() {
          function Class2() {}
          return Class2;
        }());
        export {Class2};
      `
        },
        {name: _('/src/func1.js'), contents: 'function mooFn() {} export {mooFn}'}, {
          name: _('/src/internal.js'),
          contents: `
        var InternalClass = (function() {
          function InternalClass() {}
          return InternalClass;
        }());
        var Class2 = (function() {
          function Class2() {}
          return Class2;
        }());
        export {InternalClass, Class2};
      `
        },
        {
          name: _('/src/missing-class.js'),
          contents: `
        var MissingClass2 = (function() {
          function MissingClass2() {}
          return MissingClass2;
        }());
        export {MissingClass2};
      `
        },
        {
          name: _('/src/flat-file.js'),
          contents: `
        var Class1 = (function() {
          function Class1() {}
          return Class1;
        }());
        var MissingClass1 = (function() {
          function MissingClass1() {}
          return MissingClass1;
        }());
        var MissingClass2 = (function() {
          function MissingClass2() {}
          return MissingClass2;
        }());
        var Class3 = (function() {
          function Class3() {}
          return Class3;
        }());
        export {Class1, Class3 as xClass3, MissingClass1, MissingClass2};
      `
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

    var SomeService = (function() {
      function SomeService() {}
      return SomeService;
    }());

    var InternalModule = (function() {
      function InternalModule() {}
      return InternalModule;
    }());
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
    export {SomeService, InternalModule};
    `
        },
        {
          name: _('/src/methods.js'),
          contents: `
    import {ExternalModule} from './module';
    import * as mod from './module';
    var SomeService = (function() {
      function SomeService() {}
      return SomeService;
    }());

    var InternalModule = (function() {
      function InternalModule() {}
      InternalModule.prototype = {
        instanceNgModuleIdentifier: function() { return { ngModule: InternalModule }; },
        instanceNgModuleWithEmptyProviders: function() { return { ngModule: InternalModule, providers: [] }; },
        instanceNgModuleWithProviders: function() { return { ngModule: InternalModule, providers: [SomeService] }; },
        instanceExternalNgModule: function() { return { ngModule: ExternalModule }; },
        namespacedExternalNgModule = function() { return { ngModule: mod.ExternalModule }; },
      };
      InternalModule.aNumber = function() { return 42; };
      InternalModule.aString = function() { return 'foo'; };
      InternalModule.emptyObject = function() { return {}; };
      InternalModule.ngModuleIdentifier = function() { return { ngModule: InternalModule }; };
      InternalModule.ngModuleWithEmptyProviders = function() { return { ngModule: InternalModule, providers: [] }; };
      InternalModule.ngModuleWithProviders = function() { return { ngModule: InternalModule, providers: [SomeService] }; };
      InternalModule.onlyProviders = function() { return { providers: [SomeService] }; };
      InternalModule.ngModuleNumber = function() { return { ngModule: 42 }; };
      InternalModule.ngModuleString = function() { return { ngModule: 'foo' }; };
      InternalModule.ngModuleObject = function() { return { ngModule: { foo: 42 } }; };
      InternalModule.externalNgModule = function() { return { ngModule: ExternalModule }; };
      InternalModule.namespacedExternalNgModule = function() { return { ngModule: mod.ExternalModule }; };
      return InternalModule;
    }());
    export {SomeService, InternalModule};
    `
        },
        {
          name: _('/src/aliased_class.js'),
          contents: `
    var AliasedModule = (function() {
      function AliasedModule() {}
      AliasedModule_1 = AliasedModule;
      AliasedModule.forRoot = function() { return { ngModule: AliasedModule_1 }; };
      var AliasedModule_1;
      return AliasedModule;
    }());
    export { AliasedModule };
    `
        },
        {name: _('/src/module.js'), contents: 'export class ExternalModule {}'},
      ];

      NAMESPACED_IMPORT_FILE = {
        name: _('/some_directive.js'),
        contents: `
    import * as core from '@angular/core';

    var SomeDirective = (function() {
      function SomeDirective() {
      }
      SomeDirective.decorators = [
        { type: core.Directive, args: [{ selector: '[someDirective]' },] }
      ];
      return SomeDirective;
    }());
    `
      };
    });

    describe('getDecoratorsOfDeclaration()', () => {
      it('should find the decorators on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
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

      it('should find the decorators on a class at the top level', () => {
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
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
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const functionNode =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(functionNode);
        expect(decorators).toBe(null);
      });

      it('should return null if there are no decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode);
        expect(decorators).toBe(null);
      });

      it('should ignore `decorators` if it is not an array literal', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NotArrayLiteral', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode);
        expect(decorators).toEqual([]);
      });

      it('should ignore decorator elements that are not object literals', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NotObjectLiteral', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining<Decorator>({name: 'Directive'}));
      });

      it('should ignore decorator elements that have no `type` property', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NoTypeProperty', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
      });

      it('should ignore decorator elements whose `type` value is not an identifier', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATORS_FILE.name, 'NotIdentifier', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
      });

      it('should have import information on decorators', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toEqual(1);
        expect(decorators[0].import).toEqual({name: 'Directive', from: '@angular/core'});
      });

      describe('(returned decorators `args`)', () => {
        it('should be an empty array if decorator has no `args` property', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode) !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if decorator\'s `args` has no property assignment', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode) !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode) !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });
      });
    });

    describe('getMembersOfClass()', () => {
      it('should find decorated members on a class at the top level', () => {
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
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

      it('should find decorated members on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const input1 = members.find(member => member.name === 'input1') !;
        expect(input1.kind).toEqual(ClassMemberKind.Property);
        expect(input1.isStatic).toEqual(false);
        expect(input1.decorators !.map(d => d.name)).toEqual(['Input']);

        const input2 = members.find(member => member.name === 'input2') !;
        expect(input2.kind).toEqual(ClassMemberKind.Property);
        expect(input2.isStatic).toEqual(false);
        expect(input2.decorators !.map(d => d.name)).toEqual(['Input']);
      });

      it('should find Object.defineProperty members on a class', () => {
        loadTestFiles([ACCESSORS_FILE]);
        const {program} = makeTestBundleProgram(ACCESSORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, ACCESSORS_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const setter = members.find(member => member.name === 'setter') !;
        expect(setter.kind).toEqual(ClassMemberKind.Setter);
        expect(setter.isStatic).toEqual(false);
        expect(setter.value).toBeNull();
        expect(setter.decorators !.map(d => d.name)).toEqual(['Input']);
        expect(ts.isFunctionExpression(setter.implementation !)).toEqual(true);
        expect((setter.implementation as ts.FunctionExpression).body.statements[0].getText())
            .toEqual('this.value = value;');

        const getter = members.find(member => member.name === 'getter') !;
        expect(getter.kind).toEqual(ClassMemberKind.Getter);
        expect(getter.isStatic).toEqual(false);
        expect(getter.value).toBeNull();
        expect(getter.decorators !.map(d => d.name)).toEqual(['Output']);
        expect(ts.isFunctionExpression(getter.implementation !)).toEqual(true);
        expect((getter.implementation as ts.FunctionExpression).body.statements[0].getText())
            .toEqual('return null;');

        const [combinedSetter, combinedGetter] =
            members.filter(member => member.name === 'setterAndGetter');
        expect(combinedSetter.kind).toEqual(ClassMemberKind.Setter);
        expect(combinedSetter.isStatic).toEqual(false);
        expect(combinedSetter.decorators !.map(d => d.name)).toEqual(['Input']);
        expect(combinedGetter.kind).toEqual(ClassMemberKind.Getter);
        expect(combinedGetter.isStatic).toEqual(false);
        expect(combinedGetter.decorators !.map(d => d.name)).toEqual([]);

        const staticSetter = members.find(member => member.name === 'staticSetter') !;
        expect(staticSetter.kind).toEqual(ClassMemberKind.Setter);
        expect(staticSetter.isStatic).toEqual(true);
        expect(staticSetter.value).toBeNull();
        expect(staticSetter.decorators !.map(d => d.name)).toEqual([]);

        const none = members.find(member => member.name === 'none');
        expect(none).toBeUndefined();

        const incomplete = members.find(member => member.name === 'incomplete');
        expect(incomplete).toBeUndefined();
      });

      it('should find non decorated properties on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const instanceProperty = members.find(member => member.name === 'instanceProperty') !;
        expect(instanceProperty.kind).toEqual(ClassMemberKind.Property);
        expect(instanceProperty.isStatic).toEqual(false);
        expect(ts.isBinaryExpression(instanceProperty.implementation !)).toEqual(true);
        expect(instanceProperty.value !.getText()).toEqual(`'instance'`);
      });

      it('should find static methods on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const staticMethod = members.find(member => member.name === 'staticMethod') !;
        expect(staticMethod.kind).toEqual(ClassMemberKind.Method);
        expect(staticMethod.isStatic).toEqual(true);
        expect(staticMethod.value).toBeNull();
        expect(ts.isFunctionExpression(staticMethod.implementation !)).toEqual(true);
      });

      it('should find static properties on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const staticProperty = members.find(member => member.name === 'staticProperty') !;
        expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
        expect(staticProperty.isStatic).toEqual(true);
        expect(ts.isPropertyAccessExpression(staticProperty.implementation !)).toEqual(true);
        expect(staticProperty.value !.getText()).toEqual(`'static'`);
      });

      it('should accept `ctorParameters` as an array', () => {
        loadTestFiles([CTOR_DECORATORS_ARRAY_FILE]);
        const {program} = makeTestBundleProgram(CTOR_DECORATORS_ARRAY_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, CTOR_DECORATORS_ARRAY_FILE.name, 'CtorDecoratedAsArray',
            isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;

        expect(parameters).toBeDefined();
        expect(parameters.map(parameter => parameter.name)).toEqual(['arg1']);
        expectTypeValueReferencesForParameters(parameters, ['ParamType']);
      });

      it('should throw if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const {program} = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const functionNode =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(() => {
          host.getMembersOfClass(functionNode);
        }).toThrowError(`Attempted to get members of a non-class: "function foo() {}"`);
      });

      it('should return an empty array if there are no prop decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        expect(members).toEqual([]);
      });

      it('should not process decorated properties in `propDecorators` if it is not an object literal',
         () => {
           loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
           const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const classNode = getDeclaration(
               program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteral',
               isNamedVariableDeclaration);
           const members = host.getMembersOfClass(classNode);

           expect(members.map(member => member.name)).not.toContain('prop');
         });

      it('should ignore prop decorator elements that are not object literals', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteralProp',
            isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      it('should ignore prop decorator elements that have no `type` property', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATORS_FILE.name, 'NoTypeProperty',
            isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      it('should ignore prop decorator elements whose `type` value is not an identifier', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATORS_FILE.name, 'NotIdentifier',
            isNamedVariableDeclaration);
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
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedVariableDeclaration);
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
             const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
             const classNode = getDeclaration(
                 program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
                 isNamedVariableDeclaration);
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
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop') !;
          const decorators = prop.decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Input');
          expect(decorators[0].args).toEqual([]);
        });
      });

      it('should ignore the prototype pseudo-static property on class imported from typings files',
         () => {
           loadTestFiles([UNWANTED_PROTOTYPE_EXPORT_FILE]);
           const {program} = makeTestBundleProgram(UNWANTED_PROTOTYPE_EXPORT_FILE.name);
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const classNode = getDeclaration(
               program, UNWANTED_PROTOTYPE_EXPORT_FILE.name, 'SomeParam', isNamedClassDeclaration);
           const members = host.getMembersOfClass(classNode);
           expect(members.find(m => m.name === 'prototype')).toBeUndefined();
         });
    });

    describe('getConstructorParameters()', () => {
      it('should find the decorated constructor parameters', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters).toBeDefined();
        expect(parameters !.map(parameter => parameter.name)).toEqual([
          '_viewContainer', '_template', 'injected'
        ]);
        expectTypeValueReferencesForParameters(parameters !, [
          'ViewContainerRef',
          'TemplateRef',
          null,
        ]);
      });

      it('should find the decorated constructor parameters at the top level', () => {
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters).toBeDefined();
        expect(parameters !.map(parameter => parameter.name)).toEqual([
          '_viewContainer', '_template', 'injected'
        ]);
        expectTypeValueReferencesForParameters(parameters !, [
          'ViewContainerRef',
          'TemplateRef',
          null,
        ]);
      });

      it('should throw if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const {program} = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const functionNode =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(() => { host.getConstructorParameters(functionNode); })
            .toThrowError(
                'Attempted to get constructor parameters of a non-class: "function foo() {}"');
      });

      // In ES5 there is no such thing as a constructor-less class
      // it('should return `null` if there is no constructor', () => { });

      it('should return an array even if there are no decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SIMPLE_CLASS_FILE.name, 'NoDecoratorConstructorClass',
            isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters).toEqual(jasmine.any(Array));
        expect(parameters !.length).toEqual(1);
        expect(parameters ![0].name).toEqual('foo');
        expect(parameters ![0].decorators).toBe(null);
      });

      it('should return an empty array if there are no constructor parameters', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NoParameters', isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters).toEqual([]);
      });

      // In ES5 there are no arrow functions
      // it('should ignore `ctorParameters` if it is an arrow function', () => { });

      it('should ignore `ctorParameters` if it does not return an array literal', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrayLiteral',
            isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters !.length).toBe(1);
        expect(parameters ![0]).toEqual(jasmine.objectContaining<CtorParameter>({
          name: 'arg1',
          decorators: null,
        }));
      });

      describe('(returned parameters `decorators`)', () => {
        it('should ignore param decorator elements that are not object literals', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATORS_FILE.name, 'NotObjectLiteral',
              isNamedVariableDeclaration);
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
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATORS_FILE.name, 'NoTypeProperty',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters ![0].decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
        });

        it('should ignore param decorator elements whose `type` value is not an identifier', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATORS_FILE.name, 'NotIdentifier',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters ![0].decorators !;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
        });

        it('should have import information on decorators', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters ![2].decorators !;

          expect(decorators.length).toEqual(1);
          expect(decorators[0].import).toEqual({name: 'Inject', from: '@angular/core'});
        });
      });

      describe('synthesized constructors', () => {
        function getConstructorParameters(constructor: string) {
          const file = {
            name: _('/synthesized_constructors.js'),
            contents: `
            var TestClass = /** @class */ (function (_super) {
              __extends(TestClass, _super);
              ${constructor}
              return TestClass;
            }(null));
          `,
          };

          loadTestFiles([file]);
          const {program} = makeTestBundleProgram(file.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode =
              getDeclaration(program, file.name, 'TestClass', isNamedVariableDeclaration);
          return host.getConstructorParameters(classNode);
        }

        it('recognizes _this assignment from super call', () => {
          const parameters = getConstructorParameters(`
          function TestClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.synthesizedProperty = null;
            return _this;
          }`);

          expect(parameters).toBeNull();
        });

        it('recognizes super call as return statement', () => {
          const parameters = getConstructorParameters(`
          function TestClass() {
            return _super !== null && _super.apply(this, arguments) || this;
          }`);

          expect(parameters).toBeNull();
        });

        it('handles the case where a unique name was generated for _super or _this', () => {
          const parameters = getConstructorParameters(`
          function TestClass() {
            var _this_1 = _super_1 !== null && _super_1.apply(this, arguments) || this;
            _this_1._this = null;
            _this_1._super = null;
            return _this_1;
          }`);

          expect(parameters).toBeNull();
        });

        it('does not consider constructors with parameters as synthesized', () => {
          const parameters = getConstructorParameters(`
          function TestClass(arg) {
            return _super !== null && _super.apply(this, arguments) || this;
          }`);

          expect(parameters !.length).toBe(1);
        });

        it('does not consider manual super calls as synthesized', () => {
          const parameters = getConstructorParameters(`
          function TestClass() {
            return _super.call(this) || this;
          }`);

          expect(parameters !.length).toBe(0);
        });

        it('does not consider empty constructors as synthesized', () => {
          const parameters = getConstructorParameters(`
          function TestClass() {
          }`);

          expect(parameters !.length).toBe(0);
        });
      });

      describe('(returned parameters `decorators.args`)', () => {
        it('should be an empty array if param decorator has no `args` property', () => {
          loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedVariableDeclaration);
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
             const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
             const classNode = getDeclaration(
                 program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
                 isNamedVariableDeclaration);
             const parameters = host.getConstructorParameters(classNode);
             const decorators = parameters ![0].decorators !;

             expect(decorators.length).toBe(1);
             expect(decorators[0].name).toBe('Inject');
             expect(decorators[0].args).toEqual([]);
           });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
          const {program} = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
          const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
          const classNode = getDeclaration(
              program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedVariableDeclaration);
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
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());

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
         });

      it('should recognize TypeScript __spread helper function declaration', () => {
        const file: TestFile = {
          name: _('/declaration.d.ts'),
          contents: `export declare function __spread(...args: any[]): any[];`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());

        const node = getDeclaration(program, file.name, '__spread', isNamedFunctionDeclaration) !;

        const definition = host.getDefinitionOfFunction(node) !;
        expect(definition.node).toBe(node);
        expect(definition.body).toBeNull();
        expect(definition.helper).toBe(TsHelperFn.Spread);
        expect(definition.parameters.length).toEqual(0);
      });

      it('should recognize TypeScript __spread helper function implementation', () => {
        const file: TestFile = {
          name: _('/implementation.js'),
          contents: `
              var __spread = (this && this.__spread) || function () {
                for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
                return ar;
              };`,
        };
        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());

        const node = getDeclaration(program, file.name, '__spread', ts.isVariableDeclaration) !;

        const definition = host.getDefinitionOfFunction(node) !;
        expect(definition.node).toBe(node);
        expect(definition.body).toBeNull();
        expect(definition.helper).toBe(TsHelperFn.Spread);
        expect(definition.parameters.length).toEqual(0);
      });

      it('should recognize TypeScript __spread helper function implementation when suffixed',
         () => {
           const file: TestFile = {
             name: _('/implementation.js'),
             contents: `
              var __spread$2 = (this && this.__spread$2) || function () {
                for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
                return ar;
              };`,
           };
           loadTestFiles([file]);
           const {program} = makeTestBundleProgram(file.name);
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());

           const node =
               getDeclaration(program, file.name, '__spread$2', ts.isVariableDeclaration) !;

           const definition = host.getDefinitionOfFunction(node) !;
           expect(definition.node).toBe(node);
           expect(definition.body).toBeNull();
           expect(definition.helper).toBe(TsHelperFn.Spread);
           expect(definition.parameters.length).toEqual(0);
         });
    });

    describe('getImportOfIdentifier()', () => {
      it('should find the import of an identifier', () => {
        loadTestFiles(IMPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const variableNode = getDeclaration(program, _('/b.js'), 'b', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
      });

      it('should find the name by which the identifier was exported, not imported', () => {
        loadTestFiles(IMPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const variableNode = getDeclaration(program, _('/b.js'), 'c', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
      });

      it('should return null if the identifier was not imported', () => {
        loadTestFiles(IMPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const variableNode = getDeclaration(program, _('/b.js'), 'd', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toBeNull();
      });
    });

    describe('getDeclarationOfIdentifier()', () => {
      it('should return the declaration of a locally defined identifier', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const {program} = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
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
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
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
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, NAMESPACED_IMPORT_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
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

      it('should return the correct declaration for an inner function identifier inside an ES5 IIFE',
         () => {
           const superGetDeclarationOfIdentifierSpy =
               spyOn(Esm2015ReflectionHost.prototype, 'getDeclarationOfIdentifier')
                   .and.callThrough();
           loadTestFiles([SIMPLE_CLASS_FILE]);
           const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());

           const outerDeclaration = getDeclaration(
               program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
           const innerDeclaration = (((outerDeclaration.initializer as ts.ParenthesizedExpression)
                                          .expression as ts.CallExpression)
                                         .expression as ts.FunctionExpression)
                                        .body.statements[0] as ts.FunctionDeclaration;

           const outerIdentifier = outerDeclaration.name as ts.Identifier;
           const innerIdentifier = innerDeclaration.name as ts.Identifier;

           expect(host.getDeclarationOfIdentifier(outerIdentifier) !.node).toBe(outerDeclaration);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledWith(outerIdentifier);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledTimes(1);

           superGetDeclarationOfIdentifierSpy.calls.reset();

           expect(host.getDeclarationOfIdentifier(innerIdentifier) !.node).toBe(outerDeclaration);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledWith(outerIdentifier);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledTimes(1);
         });
    });

    describe('getExportsOfModule()', () => {
      it('should return a map of all the exports from a given module', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles(EXPORTS_FILES);
        const {program} = makeTestBundleProgram(_('/index.js'));
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
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
          [
            `SomeClass = (function() {
        function SomeClass() {}
        return SomeClass;
      }())`,
            null
          ],
        ]);
      });
    });

    describe('getClassSymbol()', () => {
      it('should return the class symbol for an ES2015 class', () => {
        loadTestFiles([SIMPLE_ES2015_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_ES2015_CLASS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const node = getDeclaration(
            program, SIMPLE_ES2015_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
        const classSymbol = host.getClassSymbol(node);

        expect(classSymbol).toBeDefined();
        expect(classSymbol !.valueDeclaration).toBe(node);
      });

      it('should return the class symbol for an ES5 class (outer variable declaration)', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const node = getDeclaration(
            program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const classSymbol = host.getClassSymbol(node);

        expect(classSymbol).toBeDefined();
        expect(classSymbol !.valueDeclaration).toBe(node);
      });

      it('should return the class symbol for an ES5 class (inner function declaration)', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const outerNode = getDeclaration(
            program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const innerNode = getIifeBody(outerNode) !.statements.find(isNamedFunctionDeclaration) !;
        const classSymbol = host.getClassSymbol(innerNode);

        expect(classSymbol).toBeDefined();
        expect(classSymbol !.valueDeclaration).toBe(outerNode);
      });

      it('should return the same class symbol (of the outer declaration) for outer and inner declarations',
         () => {
           loadTestFiles([SIMPLE_CLASS_FILE]);
           const {program} = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const outerNode = getDeclaration(
               program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
           const innerNode = getIifeBody(outerNode) !.statements.find(isNamedFunctionDeclaration) !;

           expect(host.getClassSymbol(innerNode)).toBe(host.getClassSymbol(outerNode));
         });

      it('should return undefined if node is not an ES5 class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const {program} = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const node =
            getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        const classSymbol = host.getClassSymbol(node);

        expect(classSymbol).toBeUndefined();
      });
    });

    describe('isClass()', () => {
      let host: Esm5ReflectionHost;
      let mockNode: ts.Node;
      let getClassDeclarationSpy: jasmine.Spy;
      let superGetClassDeclarationSpy: jasmine.Spy;

      beforeEach(() => {
        host = new Esm5ReflectionHost(new MockLogger(), false, null as any);
        mockNode = {} as any;

        getClassDeclarationSpy = spyOn(Esm5ReflectionHost.prototype, 'getClassDeclaration');
        superGetClassDeclarationSpy = spyOn(Esm2015ReflectionHost.prototype, 'getClassDeclaration');
      });

      it('should return true if superclass returns true', () => {
        superGetClassDeclarationSpy.and.returnValue(true);
        getClassDeclarationSpy.and.callThrough();

        expect(host.isClass(mockNode)).toBe(true);
        expect(getClassDeclarationSpy).toHaveBeenCalledWith(mockNode);
        expect(superGetClassDeclarationSpy).toHaveBeenCalledWith(mockNode);
      });

      it('should return true if it can find a declaration for the class', () => {
        getClassDeclarationSpy.and.returnValue(true);

        expect(host.isClass(mockNode)).toBe(true);
        expect(getClassDeclarationSpy).toHaveBeenCalledWith(mockNode);
      });

      it('should return false if it cannot find a declaration for the class', () => {
        getClassDeclarationSpy.and.returnValue(false);

        expect(host.isClass(mockNode)).toBe(false);
        expect(getClassDeclarationSpy).toHaveBeenCalledWith(mockNode);
      });
    });

    describe('hasBaseClass()', () => {
      function hasBaseClass(source: string) {
        const file = {
          name: _('/synthesized_constructors.js'),
          contents: source,
        };

        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, file.name, 'TestClass', isNamedVariableDeclaration);
        return host.hasBaseClass(classNode);
      }

      it('should consider an IIFE with _super parameter as having a base class', () => {
        const result = hasBaseClass(`
        var TestClass = /** @class */ (function (_super) {
          __extends(TestClass, _super);
          function TestClass() {}
          return TestClass;
        }(null));`);
        expect(result).toBe(true);
      });

      it('should consider an IIFE with a unique name generated for the _super parameter as having a base class',
         () => {
           const result = hasBaseClass(`
        var TestClass = /** @class */ (function (_super_1) {
          __extends(TestClass, _super_1);
          function TestClass() {}
          return TestClass;
        }(null));`);
           expect(result).toBe(true);
         });

      it('should not consider an IIFE without parameter as having a base class', () => {
        const result = hasBaseClass(`
        var TestClass = /** @class */ (function () {
          __extends(TestClass, _super);
          function TestClass() {}
          return TestClass;
        }(null));`);
        expect(result).toBe(false);
      });
    });

    describe('getBaseClassExpression()', () => {
      function getBaseClassIdentifier(source: string): ts.Identifier|null {
        const file = {
          name: _('/synthesized_constructors.js'),
          contents: source,
        };

        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, file.name, 'TestClass', isNamedVariableDeclaration);
        const expression = host.getBaseClassExpression(classNode);
        if (expression !== null && !ts.isIdentifier(expression)) {
          throw new Error(
              'Expected class to inherit via an identifier but got: ' + expression.getText());
        }
        return expression;
      }

      it('should find the base class of an IIFE with _super parameter', () => {
        const identifier = getBaseClassIdentifier(`
        var BaseClass = /** @class */ (function () {
          function BaseClass() {}
          return BaseClass;
        }());
        var TestClass = /** @class */ (function (_super) {
          __extends(TestClass, _super);
          function TestClass() {}
          return TestClass;
        }(BaseClass));`);
        expect(identifier !.text).toBe('BaseClass');
      });

      it('should find the base class of an IIFE with a unique name generated for the _super parameter',
         () => {
           const identifier = getBaseClassIdentifier(`
        var BaseClass = /** @class */ (function () {
          function BaseClass() {}
          return BaseClass;
        }());
        var TestClass = /** @class */ (function (_super_1) {
          __extends(TestClass, _super_1);
          function TestClass() {}
          return TestClass;
        }(BaseClass));`);
           expect(identifier !.text).toBe('BaseClass');
         });

      it('should not find a base class for an IIFE without parameter', () => {
        const identifier = getBaseClassIdentifier(`
        var BaseClass = /** @class */ (function () {
          function BaseClass() {}
          return BaseClass;
        }());
        var TestClass = /** @class */ (function () {
          __extends(TestClass, _super);
          function TestClass() {}
          return TestClass;
        }(BaseClass));`);
        expect(identifier).toBe(null);
      });

      it('should find a dynamic base class expression of an IIFE', () => {
        const file = {
          name: _('/synthesized_constructors.js'),
          contents: `
          var BaseClass = /** @class */ (function () {
            function BaseClass() {}
            return BaseClass;
          }());
          function foo() { return BaseClass; }
          var TestClass = /** @class */ (function (_super) {
            __extends(TestClass, _super);
            function TestClass() {}
            return TestClass;
          }(foo()));`,
        };

        loadTestFiles([file]);
        const {program} = makeTestBundleProgram(file.name);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const classNode =
            getDeclaration(program, file.name, 'TestClass', isNamedVariableDeclaration);
        const expression = host.getBaseClassExpression(classNode) !;
        expect(expression.getText()).toBe('foo()');
      });
    });

    describe('findClassSymbols()', () => {
      it('should return an array of all classes in the given source file', () => {
        loadTestFiles(DECORATED_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(DECORATED_FILES)[0]);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const primaryFile = getSourceFileOrError(program, DECORATED_FILES[0].name);
        const secondaryFile = getSourceFileOrError(program, DECORATED_FILES[1].name);

        const classSymbolsPrimary = host.findClassSymbols(primaryFile);
        expect(classSymbolsPrimary.length).toEqual(2);
        expect(classSymbolsPrimary.map(c => c.name)).toEqual(['A', 'B']);

        const classSymbolsSecondary = host.findClassSymbols(secondaryFile);
        expect(classSymbolsSecondary.length).toEqual(1);
        expect(classSymbolsSecondary.map(c => c.name)).toEqual(['D']);
      });
    });

    describe('getDecoratorsOfSymbol()', () => {
      it('should return decorators of class symbol', () => {
        loadTestFiles(DECORATED_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(DECORATED_FILES)[0]);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const primaryFile = getSourceFileOrError(program, DECORATED_FILES[0].name);
        const secondaryFile = getSourceFileOrError(program, DECORATED_FILES[1].name);

        const classSymbolsPrimary = host.findClassSymbols(primaryFile);
        const classDecoratorsPrimary = classSymbolsPrimary.map(s => host.getDecoratorsOfSymbol(s));
        expect(classDecoratorsPrimary.length).toEqual(2);
        expect(classDecoratorsPrimary[0] !.map(d => d.name)).toEqual(['Directive']);
        expect(classDecoratorsPrimary[1] !.map(d => d.name)).toEqual(['Directive']);

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
               getDeclaration(program, _('/src/class1.js'), 'Class1', ts.isVariableDeclaration);
           const host =
               new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

           const dtsDeclaration = host.getDtsDeclaration(class1);
           expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/class1.d.ts'));
         });

      it('should find the dts declaration for exported functions', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const mooFn =
            getDeclaration(program, _('/src/func1.js'), 'mooFn', ts.isFunctionDeclaration);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

        const dtsDeclaration = host.getDtsDeclaration(mooFn);
        expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/func1.d.ts'));
      });

      it('should return null if there is no matching class in the matching dts file', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const missingClass =
            getDeclaration(program, _('/src/class1.js'), 'MissingClass1', ts.isVariableDeclaration);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

        expect(host.getDtsDeclaration(missingClass)).toBe(null);
      });

      it('should return null if there is no matching dts file', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const missingClass = getDeclaration(
            program, _('/src/missing-class.js'), 'MissingClass2', ts.isVariableDeclaration);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

        expect(host.getDtsDeclaration(missingClass)).toBe(null);
      });

      it('should find the dts file that contains a matching class declaration, even if the source files do not match',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const class1 =
               getDeclaration(program, _('/src/flat-file.js'), 'Class1', ts.isVariableDeclaration);
           const host =
               new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

           const dtsDeclaration = host.getDtsDeclaration(class1);
           expect(dtsDeclaration !.getSourceFile().fileName).toEqual(_('/typings/class1.d.ts'));
         });

      it('should find aliased exports', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const {program} = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const class3 =
            getDeclaration(program, _('/src/flat-file.js'), 'Class3', ts.isVariableDeclaration);
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

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
               program, _('/src/internal.js'), 'InternalClass', ts.isVariableDeclaration);
           const host =
               new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

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
               getDeclaration(program, _('/src/class2.js'), 'Class2', ts.isVariableDeclaration);
           const internalClass2 =
               getDeclaration(program, _('/src/internal.js'), 'Class2', ts.isVariableDeclaration);
           const host =
               new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);

           const class2DtsDeclaration = host.getDtsDeclaration(class2);
           expect(class2DtsDeclaration !.getSourceFile().fileName)
               .toEqual(_('/typings/class2.d.ts'));

           const internalClass2DtsDeclaration = host.getDtsDeclaration(internalClass2);
           expect(internalClass2DtsDeclaration !.getSourceFile().fileName)
               .toEqual(_('/typings/class2.d.ts'));
         });
    });

    describe('getModuleWithProvidersFunctions', () => {
      it('should find every exported function that returns an object that looks like a ModuleWithProviders object',
         () => {
           loadTestFiles(MODULE_WITH_PROVIDERS_PROGRAM);
           const {program} = makeTestBundleProgram(_('/src/index.js'));
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
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
           const {program} = makeTestBundleProgram(_('/src/index.js'));
           const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
           const file = getSourceFileOrError(program, _('/src/methods.js'));
           const fn = host.getModuleWithProvidersFunctions(file);
           expect(fn.map(fn => [fn.declaration.getText(), fn.ngModule.node.name.text])).toEqual([
             [
               'function() { return { ngModule: InternalModule }; }',
               'InternalModule',
             ],
             [
               'function() { return { ngModule: InternalModule, providers: [] }; }',
               'InternalModule',
             ],
             [
               'function() { return { ngModule: InternalModule, providers: [SomeService] }; }',
               'InternalModule',
             ],
             [
               'function() { return { ngModule: ExternalModule }; }',
               'ExternalModule',
             ],
             [
               'function() { return { ngModule: mod.ExternalModule }; }',
               'ExternalModule',
             ],
           ]);
         });

      // https://github.com/angular/angular/issues/29078
      it('should resolve aliased module references to their original declaration', () => {
        loadTestFiles(MODULE_WITH_PROVIDERS_PROGRAM);
        const {program} = makeTestBundleProgram(_('/src/index.js'));
        const host = new Esm5ReflectionHost(new MockLogger(), false, program.getTypeChecker());
        const file = getSourceFileOrError(program, _('/src/aliased_class.js'));
        const fn = host.getModuleWithProvidersFunctions(file);
        expect(fn.map(fn => [fn.declaration.getText(), fn.ngModule.node.name.text])).toEqual([
          ['function() { return { ngModule: AliasedModule_1 }; }', 'AliasedModule'],
        ]);
      });
    });
  });
});
