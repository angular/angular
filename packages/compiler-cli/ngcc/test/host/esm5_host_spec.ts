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
import {ClassMemberKind, ConcreteDeclaration, CtorParameter, DeclarationKind, Decorator, DownleveledEnum, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration, KnownDeclaration, TypeScriptReflectionHost, TypeValueReferenceKind} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadFakeCore, loadTestFiles} from '../../../src/ngtsc/testing';
import {DelegatingReflectionHost} from '../../src/host/delegating_host';
import {Esm2015ReflectionHost, getIifeBody} from '../../src/host/esm2015_host';
import {Esm5ReflectionHost} from '../../src/host/esm5_host';
import {NgccReflectionHost} from '../../src/host/ngcc_host';
import {BundleProgram} from '../../src/packages/bundle_program';
import {getRootFiles, makeTestBundleProgram, makeTestDtsBundleProgram} from '../helpers/utils';

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
    let NAMESPACED_IMPORT_FILE: TestFile;

    // Helpers
    const createHost = (bundle: BundleProgram, ngccHost: Esm5ReflectionHost) => {
      const tsHost = new TypeScriptReflectionHost(bundle.program.getTypeChecker());
      return new DelegatingReflectionHost(tsHost, ngccHost);
    };

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
    var NoParensClass = function() {
      function EmptyClass() {
      }
      return EmptyClass;
    }();
    var InnerParensClass = (function() {
      function EmptyClass() {
      }
      return EmptyClass;
    })();
    var NoDecoratorConstructorClass = (function() {
      function NoDecoratorConstructorClass(foo) {
      }
      return NoDecoratorConstructorClass;
    }());
    var OuterClass1 = (function() {
      function InnerClass1() {
      }
      return InnerClass1;
    }());
    var OuterClass2 = (function() {
      function InnerClass2() {
      }
      InnerClass2_1 = InnerClass12
      var InnerClass2_1;
      return InnerClass2;
    }());
    var SuperClass = (function() { function SuperClass() {} return SuperClass; }());
    var ChildClass = /** @class */ (function (_super) {
      __extends(InnerChildClass, _super);
      function InnerChildClass() {}
      return InnerChildClass;
    }(SuperClass);
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
          name: _('/ep/src/index.js'),
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
          name: _('/ep/src/class1.js'),
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
          name: _('/ep/src/class2.js'),
          contents: `
        var Class2 = (function() {
          function Class2() {}
          return Class2;
        }());
        export {Class2};
      `
        },
        {name: _('/ep/src/func1.js'), contents: 'function mooFn() {} export {mooFn}'}, {
          name: _('/ep/src/internal.js'),
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
          name: _('/ep/src/missing-class.js'),
          contents: `
        var MissingClass2 = (function() {
          function MissingClass2() {}
          return MissingClass2;
        }());
        export {MissingClass2};
      `
        },
        {
          name: _('/ep/src/flat-file.js'),
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
        var SourceClass = (function() {
          function SourceClass() {}
          return SourceClass;
        }());
        export {Class1, SourceClass as AliasedClass, MissingClass1, MissingClass2};
      `
        }
      ];

      TYPINGS_DTS_FILES = [
        {
          name: _('/ep/typings/index.d.ts'),
          contents: `
            import '../../an_external_lib/index';
            import {InternalClass} from './internal';
            import {mooFn} from './func1';
            export * from './class1';
            export * from './class2';
            `
        },
        {
          name: _('/ep/typings/class1.d.ts'),
          contents: `export declare class Class1 {}\nexport declare class OtherClass {}`
        },
        {
          name: _('/ep/typings/class2.d.ts'),
          contents: `
            export declare class Class2 {}
            export declare interface SomeInterface {}
            export {TypingsClass as AliasedClass} from './typings-class';
          `
        },
        {name: _('/ep/typings/func1.d.ts'), contents: 'export declare function mooFn(): void;'},
        {
          name: _('/ep/typings/internal.d.ts'),
          contents: `export declare class InternalClass {}\nexport declare class Class2 {}`
        },
        {
          name: _('/ep/typings/typings-class.d.ts'),
          contents: `export declare class TypingsClass {}`
        },
        {name: _('/ep/typings/shadow-class.d.ts'), contents: `export declare class ShadowClass {}`},
        {name: _('/an_external_lib/index.d.ts'), contents: 'export declare class ShadowClass {}'},
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
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators).toBeDefined();
        expect(decorators.length).toEqual(1);

        const decorator = decorators[0];
        expect(decorator.name).toEqual('Directive');
        expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
        expect(decorator.args!.map(arg => arg.getText())).toEqual([
          '{ selector: \'[someDirective]\' }',
        ]);
      });

      it('should find the decorators on a class at the top level', () => {
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators).toBeDefined();
        expect(decorators.length).toEqual(1);

        const decorator = decorators[0];
        expect(decorator.name).toEqual('Directive');
        expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
        expect(decorator.args!.map(arg => arg.getText())).toEqual([
          '{ selector: \'[someDirective]\' }',
        ]);
      });

      it('should return null if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const bundle = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const functionNode = getDeclaration(
            bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(functionNode);
        expect(decorators).toBe(null);
      });

      it('should return null if there are no decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode);
        expect(decorators).toBe(null);
      });

      it('should ignore `decorators` if it is not an array literal', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_DECORATORS_FILE.name, 'NotArrayLiteral',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode);
        expect(decorators).toEqual([]);
      });

      it('should ignore decorator elements that are not object literals', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_DECORATORS_FILE.name, 'NotObjectLiteral',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining<Decorator>({name: 'Directive'}));
      });

      it('should ignore decorator elements that have no `type` property', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_DECORATORS_FILE.name, 'NoTypeProperty',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
      });

      it('should ignore decorator elements whose `type` value is not an identifier', () => {
        loadTestFiles([INVALID_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_DECORATORS_FILE.name, 'NotIdentifier',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
      });

      it('should have import information on decorators', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators.length).toEqual(1);
        expect(decorators[0].import).toEqual({name: 'Directive', from: '@angular/core'});
      });

      describe('(returned decorators `args`)', () => {
        it('should be an empty array if decorator has no `args` property', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode)!;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if decorator\'s `args` has no property assignment', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode)!;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode)!;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Directive');
          expect(decorators[0].args).toEqual([]);
        });
      });
    });

    describe('getMembersOfClass()', () => {
      it('should find decorated members on a class at the top level', () => {
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective',
            isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const input1 = members.find(member => member.name === 'input1')!;
        expect(input1.kind).toEqual(ClassMemberKind.Property);
        expect(input1.isStatic).toEqual(false);
        expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);
        expect(input1.decorators![0].import).toEqual({name: 'Input', from: '@angular/core'});

        const input2 = members.find(member => member.name === 'input2')!;
        expect(input2.kind).toEqual(ClassMemberKind.Property);
        expect(input2.isStatic).toEqual(false);
        expect(input2.decorators!.map(d => d.name)).toEqual(['Input']);
        expect(input2.decorators![0].import).toEqual({name: 'Input', from: '@angular/core'});
      });

      it('should find decorated members on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const input1 = members.find(member => member.name === 'input1')!;
        expect(input1.kind).toEqual(ClassMemberKind.Property);
        expect(input1.isStatic).toEqual(false);
        expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);

        const input2 = members.find(member => member.name === 'input2')!;
        expect(input2.kind).toEqual(ClassMemberKind.Property);
        expect(input2.isStatic).toEqual(false);
        expect(input2.decorators!.map(d => d.name)).toEqual(['Input']);
      });

      it('should find Object.defineProperty members on a class', () => {
        loadTestFiles([ACCESSORS_FILE]);
        const bundle = makeTestBundleProgram(ACCESSORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, ACCESSORS_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const setter = members.find(member => member.name === 'setter')!;
        expect(setter.kind).toEqual(ClassMemberKind.Setter);
        expect(setter.isStatic).toEqual(false);
        expect(setter.value).toBeNull();
        expect(setter.decorators!.map(d => d.name)).toEqual(['Input']);
        expect(ts.isFunctionExpression(setter.implementation!)).toEqual(true);
        expect((setter.implementation as ts.FunctionExpression).body.statements[0].getText())
            .toEqual('this.value = value;');

        const getter = members.find(member => member.name === 'getter')!;
        expect(getter.kind).toEqual(ClassMemberKind.Getter);
        expect(getter.isStatic).toEqual(false);
        expect(getter.value).toBeNull();
        expect(getter.decorators!.map(d => d.name)).toEqual(['Output']);
        expect(ts.isFunctionExpression(getter.implementation!)).toEqual(true);
        expect((getter.implementation as ts.FunctionExpression).body.statements[0].getText())
            .toEqual('return null;');

        const [combinedSetter, combinedGetter] =
            members.filter(member => member.name === 'setterAndGetter');
        expect(combinedSetter.kind).toEqual(ClassMemberKind.Setter);
        expect(combinedSetter.isStatic).toEqual(false);
        expect(combinedSetter.decorators!.map(d => d.name)).toEqual(['Input']);
        expect(combinedGetter.kind).toEqual(ClassMemberKind.Getter);
        expect(combinedGetter.isStatic).toEqual(false);
        expect(combinedGetter.decorators!.map(d => d.name)).toEqual([]);

        const staticSetter = members.find(member => member.name === 'staticSetter')!;
        expect(staticSetter.kind).toEqual(ClassMemberKind.Setter);
        expect(staticSetter.isStatic).toEqual(true);
        expect(staticSetter.value).toBeNull();
        expect(staticSetter.decorators!.map(d => d.name)).toEqual([]);

        const none = members.find(member => member.name === 'none');
        expect(none).toBeUndefined();

        const incomplete = members.find(member => member.name === 'incomplete');
        expect(incomplete).toBeUndefined();
      });

      it('should find non decorated properties on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const instanceProperty = members.find(member => member.name === 'instanceProperty')!;
        expect(instanceProperty.kind).toEqual(ClassMemberKind.Property);
        expect(instanceProperty.isStatic).toEqual(false);
        expect(ts.isBinaryExpression(instanceProperty.implementation!)).toEqual(true);
        expect(instanceProperty.value!.getText()).toEqual(`'instance'`);
      });

      it('should find static methods on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const staticMethod = members.find(member => member.name === 'staticMethod')!;
        expect(staticMethod.kind).toEqual(ClassMemberKind.Method);
        expect(staticMethod.isStatic).toEqual(true);
        expect(staticMethod.value).toBeNull();
        expect(ts.isFunctionExpression(staticMethod.implementation!)).toEqual(true);
      });

      it('should find static properties on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        const staticProperty = members.find(member => member.name === 'staticProperty')!;
        expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
        expect(staticProperty.isStatic).toEqual(true);
        expect(ts.isPropertyAccessExpression(staticProperty.implementation!)).toEqual(true);
        expect(staticProperty.value!.getText()).toEqual(`'static'`);
      });

      it('should accept `ctorParameters` as an array', () => {
        loadTestFiles([CTOR_DECORATORS_ARRAY_FILE]);
        const bundle = makeTestBundleProgram(CTOR_DECORATORS_ARRAY_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, CTOR_DECORATORS_ARRAY_FILE.name, 'CtorDecoratedAsArray',
            isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode)!;

        expect(parameters).toBeDefined();
        expect(parameters.map(parameter => parameter.name)).toEqual(['arg1']);
        expectTypeValueReferencesForParameters(parameters, ['ParamType']);
      });

      it('should throw if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const bundle = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const functionNode = getDeclaration(
            bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(() => {
          host.getMembersOfClass(functionNode);
        }).toThrowError(`Attempted to get members of a non-class: "function foo() {}"`);
      });

      it('should return an empty array if there are no prop decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);

        expect(members).toEqual([]);
      });

      it('should not process decorated properties in `propDecorators` if it is not an object literal',
         () => {
           loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
           const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
           const classNode = getDeclaration(
               bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteral',
               isNamedVariableDeclaration);
           const members = host.getMembersOfClass(classNode);

           expect(members.map(member => member.name)).not.toContain('prop');
         });

      it('should ignore prop decorator elements that are not object literals', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteralProp',
            isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop')!;
        const decorators = prop.decorators!;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      it('should ignore prop decorator elements that have no `type` property', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NoTypeProperty',
            isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop')!;
        const decorators = prop.decorators!;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      it('should ignore prop decorator elements whose `type` value is not an identifier', () => {
        loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NotIdentifier',
            isNamedVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop')!;
        const decorators = prop.decorators!;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
      });

      describe('(returned prop decorators `args`)', () => {
        it('should be an empty array if prop decorator has no `args` property', () => {
          loadTestFiles([INVALID_PROP_DECORATOR_ARGS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_PROP_DECORATOR_ARGS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop')!;
          const decorators = prop.decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Input');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if prop decorator\'s `args` has no property assignment',
           () => {
             loadTestFiles([INVALID_PROP_DECORATOR_ARGS_FILE]);
             const bundle = makeTestBundleProgram(INVALID_PROP_DECORATOR_ARGS_FILE.name);
             const host =
                 createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
             const classNode = getDeclaration(
                 bundle.program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
                 isNamedVariableDeclaration);
             const members = host.getMembersOfClass(classNode);
             const prop = members.find(m => m.name === 'prop')!;
             const decorators = prop.decorators!;

             expect(decorators.length).toBe(1);
             expect(decorators[0].name).toBe('Input');
             expect(decorators[0].args).toEqual([]);
           });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_PROP_DECORATOR_ARGS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_PROP_DECORATOR_ARGS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop')!;
          const decorators = prop.decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Input');
          expect(decorators[0].args).toEqual([]);
        });
      });

      it('should ignore the prototype pseudo-static property on class imported from typings files',
         () => {
           loadTestFiles([UNWANTED_PROTOTYPE_EXPORT_FILE]);
           const bundle = makeTestBundleProgram(UNWANTED_PROTOTYPE_EXPORT_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
           const classNode = getDeclaration(
               bundle.program, UNWANTED_PROTOTYPE_EXPORT_FILE.name, 'SomeParam',
               isNamedClassDeclaration);
           const members = host.getMembersOfClass(classNode);
           expect(members.find(m => m.name === 'prototype')).toBeUndefined();
         });
    });

    describe('getConstructorParameters()', () => {
      it('should retain imported name for type value references for decorated constructor parameter types',
         () => {
           const files = [
             {
               name: _('/node_modules/shared-lib/foo.d.ts'),
               contents: `
           declare class Foo {}
           export {Foo as Bar};
         `,
             },
             {
               name: _('/node_modules/shared-lib/index.d.ts'),
               contents: `
           export {Bar as Baz} from './foo';
         `,
             },
             {
               name: _('/local.js'),
               contents: `
           var Internal = (function() {
             function Internal() {
             }
             return Internal;
           }());
           export {Internal as External};
            `
             },
             {
               name: _('/main.js'),
               contents: `
           import {Baz} from 'shared-lib';
           import {External} from './local';
           var SameFile = (function() {
             function SameFile() {
             }
             return SameFile;
           }());
           export SameFile;

           var SomeClass = (function() {
             function SomeClass(arg1, arg2, arg3) {}
             return SomeClass;
           }());
           SomeClass.ctorParameters = function() { return [{ type: Baz }, { type: External }, { type: SameFile }]; };
           export SomeClass;
         `,
             },
           ];

           loadTestFiles(files);
           const bundle = makeTestBundleProgram(_('/main.js'));
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
           const classNode = getDeclaration(
               bundle.program, _('/main.js'), 'SomeClass', isNamedVariableDeclaration);

           const parameters = host.getConstructorParameters(classNode)!;

           expect(parameters.map(p => p.name)).toEqual(['arg1', 'arg2', 'arg3']);
           expectTypeValueReferencesForParameters(
               parameters, ['Baz', 'External', 'SameFile'], ['shared-lib', './local', null]);
         });

      it('should find the decorated constructor parameters', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
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
      });

      it('should find the decorated constructor parameters at the top level', () => {
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective',
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
      });

      it('should throw if the symbol is not a class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const bundle = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const functionNode = getDeclaration(
            bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(() => {
          host.getConstructorParameters(functionNode);
        })
            .toThrowError(
                'Attempted to get constructor parameters of a non-class: "function foo() {}"');
      });

      // In ES5 there is no such thing as a constructor-less class
      // it('should return `null` if there is no constructor', () => { });

      it('should return an array even if there are no decorators', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'NoDecoratorConstructorClass',
            isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters).toEqual(jasmine.any(Array));
        expect(parameters!.length).toEqual(1);
        expect(parameters![0].name).toEqual('foo');
        expect(parameters![0].decorators).toBe(null);
      });

      it('should return an empty array if there are no constructor parameters', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_CTOR_DECORATORS_FILE.name, 'NoParameters',
            isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters).toEqual([]);
      });

      // In ES5 there are no arrow functions
      // it('should ignore `ctorParameters` if it is an arrow function', () => { });

      it('should ignore `ctorParameters` if it does not return an array literal', () => {
        loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrayLiteral',
            isNamedVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters!.length).toBe(1);
        expect(parameters![0]).toEqual(jasmine.objectContaining<CtorParameter>({
          name: 'arg1',
          decorators: null,
        }));
      });

      describe('(returned parameters `decorators`)', () => {
        it('should ignore param decorator elements that are not object literals', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_CTOR_DECORATORS_FILE.name, 'NotObjectLiteral',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);

          expect(parameters!.length).toBe(2);
          expect(parameters![0]).toEqual(jasmine.objectContaining<CtorParameter>({
            name: 'arg1',
            decorators: null,
          }));
          expect(parameters![1]).toEqual(jasmine.objectContaining<CtorParameter>({
            name: 'arg2',
            decorators: jasmine.any(Array) as any
          }));
        });

        it('should ignore param decorator elements that have no `type` property', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_CTOR_DECORATORS_FILE.name, 'NoTypeProperty',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters![0].decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
        });

        it('should ignore param decorator elements whose `type` value is not an identifier', () => {
          loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_CTOR_DECORATORS_FILE.name, 'NotIdentifier',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters![0].decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
        });

        it('should have import information on decorators', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters![2].decorators!;

          expect(decorators.length).toEqual(1);
          expect(decorators[0].import).toEqual({name: 'Inject', from: '@angular/core'});
        });
      });

      function getConstructorParameters(
          constructor: string,
          mode?: 'inlined'|'inlined_with_suffix'|'imported'|'imported_namespace') {
        let fileHeader = '';

        switch (mode) {
          case 'imported':
            fileHeader = `import {__spread, __spreadArray, __read} from 'tslib';`;
            break;
          case 'imported_namespace':
            fileHeader = `import * as tslib from 'tslib';`;
            break;
          case 'inlined':
            fileHeader =
                `var __spread = (this && this.__spread) || function (...args) { /* ... */ };\n` +
                `var __spreadArray = (this && this.__spreadArray) || function (...args) { /* ... */ };\n` +
                `var __read = (this && this.__read) || function (...args) { /* ... */ };\n`;
            break;
          case 'inlined_with_suffix':
            fileHeader =
                `var __spread$1 = (this && this.__spread$1) || function (...args) { /* ... */ };\n` +
                `var __spreadArray$1 = (this && this.__spreadArray$1) || function (...args) { /* ... */ };\n` +
                `var __read$2 = (this && this.__read$2) || function (...args) { /* ... */ };\n`;
            break;
        }

        const file = {
          name: _('/synthesized_constructors.js'),
          contents: `
            ${fileHeader}
            var TestClass = /** @class */ (function (_super) {
              __extends(TestClass, _super);
              ${constructor}
              return TestClass;
            }(null));
          `,
        };

        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode =
            getDeclaration(bundle.program, file.name, 'TestClass', isNamedVariableDeclaration);
        return host.getConstructorParameters(classNode);
      }

      describe('TS -> ES5: synthesized constructors', () => {
        it('recognizes _this assignment from super call', () => {
          const parameters = getConstructorParameters(`
            function TestClass() {
              var _this = _super !== null && _super.apply(this, arguments) || this;
              _this.synthesizedProperty = null;
              return _this;
            }
          `);

          expect(parameters).toBeNull();
        });

        it('recognizes super call as return statement', () => {
          const parameters = getConstructorParameters(`
            function TestClass() {
              return _super !== null && _super.apply(this, arguments) || this;
            }
          `);

          expect(parameters).toBeNull();
        });

        it('handles the case where a unique name was generated for _super or _this', () => {
          const parameters = getConstructorParameters(`
            function TestClass() {
              var _this_1 = _super_1 !== null && _super_1.apply(this, arguments) || this;
              _this_1._this = null;
              _this_1._super = null;
              return _this_1;
            }
          `);

          expect(parameters).toBeNull();
        });

        it('does not consider constructors with parameters as synthesized', () => {
          const parameters = getConstructorParameters(`
            function TestClass(arg) {
              return _super !== null && _super.apply(this, arguments) || this;
            }
          `);

          expect(parameters!.length).toBe(1);
        });

        it('does not consider manual super calls as synthesized', () => {
          const parameters = getConstructorParameters(`
            function TestClass() {
              return _super.call(this) || this;
            }
          `);

          expect(parameters!.length).toBe(0);
        });

        it('does not consider empty constructors as synthesized', () => {
          const parameters = getConstructorParameters(`function TestClass() {}`);
          expect(parameters!.length).toBe(0);
        });
      });

      // See: https://github.com/angular/angular/issues/38453.
      describe('ES2015 -> ES5: synthesized constructors through TSC downleveling', () => {
        it('recognizes delegate super call using inline spread helper', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, __spread(arguments)) || this;
            }`,
              'inlined');

          expect(parameters).toBeNull();
        });

        it('recognizes delegate super call using inline spreadArray helper', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, __spreadArray([], __read(arguments))) || this;
            }`,
              'inlined');

          expect(parameters).toBeNull();
        });

        it('recognizes delegate super call using inline spread helper with suffix', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, __spread$1(arguments)) || this;
            }`,
              'inlined_with_suffix');

          expect(parameters).toBeNull();
        });

        it('recognizes delegate super call using inline spreadArray helper with suffix', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, __spreadArray$1([], __read$2(arguments))) || this;
            }`,
              'inlined_with_suffix');

          expect(parameters).toBeNull();
        });

        it('recognizes delegate super call using imported spread helper', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, __spread(arguments)) || this;
            }`,
              'imported');

          expect(parameters).toBeNull();
        });

        it('recognizes delegate super call using imported spreadArray helper', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, __spreadArray([], __read(arguments))) || this;
            }`,
              'imported');

          expect(parameters).toBeNull();
        });

        it('recognizes delegate super call using namespace imported spread helper', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, tslib.__spread(arguments)) || this;
            }`,
              'imported_namespace');

          expect(parameters).toBeNull();
        });

        it('recognizes delegate super call using namespace imported spreadArray helper', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              return _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments))) || this;
            }`,
              'imported_namespace');

          expect(parameters).toBeNull();
        });

        describe('with class member assignment', () => {
          it('recognizes delegate super call using inline spread helper', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, __spread(arguments)) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'inlined');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using inline spreadArray helper', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'inlined');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using inline spread helper with suffix', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, __spread$1(arguments)) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'inlined_with_suffix');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using inline spreadArray helper with suffix', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, __spreadArray$1([], __read$2(arguments))) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'inlined_with_suffix');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using imported spread helper', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, __spread(arguments)) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'imported');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using imported spreadArray helper', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'imported');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using namespace imported spread helper', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, tslib.__spread(arguments)) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'imported_namespace');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using namespace imported spreadArray helper', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments))) || this;
                _this.synthesizedProperty = null;
                return _this;
              }`,
                'imported_namespace');

            expect(parameters).toBeNull();
          });
        });

        it('handles the case where a unique name was generated for _super or _this', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass() {
              var _this_1 = _super_1.apply(this, __spread(arguments)) || this;
              _this_1._this = null;
              _this_1._super = null;
              return _this_1;
            }`,
              'inlined');

          expect(parameters).toBeNull();
        });

        it('does not consider constructors with parameters as synthesized', () => {
          const parameters = getConstructorParameters(
              `
            function TestClass(arg) {
              return _super.apply(this, __spread(arguments)) || this;
            }`,
              'inlined');

          expect(parameters!.length).toBe(1);
        });
      });

      describe('(returned parameters `decorators.args`)', () => {
        it('should be an empty array if param decorator has no `args` property', () => {
          loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          expect(parameters!.length).toBe(1);
          const decorators = parameters![0].decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0].name).toBe('Inject');
          expect(decorators[0].args).toEqual([]);
        });

        it('should be an empty array if param decorator\'s `args` has no property assignment',
           () => {
             loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
             const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
             const host =
                 createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
             const classNode = getDeclaration(
                 bundle.program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
                 isNamedVariableDeclaration);
             const parameters = host.getConstructorParameters(classNode);
             const decorators = parameters![0].decorators!;

             expect(decorators.length).toBe(1);
             expect(decorators[0].name).toBe('Inject');
             expect(decorators[0].args).toEqual([]);
           });

        it('should be an empty array if `args` property value is not an array literal', () => {
          loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
          const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
              isNamedVariableDeclaration);
          const parameters = host.getConstructorParameters(classNode);
          const decorators = parameters![0].decorators!;

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
           const bundle = makeTestBundleProgram(FUNCTION_BODY_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

           const fooNode = getDeclaration(
               bundle.program, FUNCTION_BODY_FILE.name, 'foo', isNamedFunctionDeclaration)!;
           const fooDef = host.getDefinitionOfFunction(fooNode)!;
           expect(fooDef.node).toBe(fooNode);
           expect(fooDef.body!.length).toEqual(1);
           expect(fooDef.body![0].getText()).toEqual(`return x;`);
           expect(fooDef.parameters.length).toEqual(1);
           expect(fooDef.parameters[0].name).toEqual('x');
           expect(fooDef.parameters[0].initializer).toBe(null);

           const barNode = getDeclaration(
               bundle.program, FUNCTION_BODY_FILE.name, 'bar', isNamedFunctionDeclaration)!;
           const barDef = host.getDefinitionOfFunction(barNode)!;
           expect(barDef.node).toBe(barNode);
           expect(barDef.body!.length).toEqual(1);
           expect(ts.isReturnStatement(barDef.body![0])).toBeTruthy();
           expect(barDef.body![0].getText()).toEqual(`return x + y;`);
           expect(barDef.parameters.length).toEqual(2);
           expect(barDef.parameters[0].name).toEqual('x');
           expect(fooDef.parameters[0].initializer).toBe(null);
           expect(barDef.parameters[1].name).toEqual('y');
           expect(barDef.parameters[1].initializer!.getText()).toEqual('42');

           const bazNode = getDeclaration(
               bundle.program, FUNCTION_BODY_FILE.name, 'baz', isNamedFunctionDeclaration)!;
           const bazDef = host.getDefinitionOfFunction(bazNode)!;
           expect(bazDef.node).toBe(bazNode);
           expect(bazDef.body!.length).toEqual(3);
           expect(bazDef.parameters.length).toEqual(1);
           expect(bazDef.parameters[0].name).toEqual('x');
           expect(bazDef.parameters[0].initializer).toBe(null);

           const quxNode = getDeclaration(
               bundle.program, FUNCTION_BODY_FILE.name, 'qux', isNamedFunctionDeclaration)!;
           const quxDef = host.getDefinitionOfFunction(quxNode)!;
           expect(quxDef.node).toBe(quxNode);
           expect(quxDef.body!.length).toEqual(2);
           expect(quxDef.parameters.length).toEqual(1);
           expect(quxDef.parameters[0].name).toEqual('x');
           expect(quxDef.parameters[0].initializer).toBe(null);
         });
    });

    describe('getImportOfIdentifier()', () => {
      it('should find the import of an identifier', () => {
        loadTestFiles(IMPORTS_FILES);
        const bundle = makeTestBundleProgram(_('/index.js'));
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const variableNode =
            getDeclaration(bundle.program, _('/b.js'), 'b', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
      });

      it('should find the name by which the identifier was exported, not imported', () => {
        loadTestFiles(IMPORTS_FILES);
        const bundle = makeTestBundleProgram(_('/index.js'));
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const variableNode =
            getDeclaration(bundle.program, _('/b.js'), 'c', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
      });

      it('should return null if the identifier was not imported', () => {
        loadTestFiles(IMPORTS_FILES);
        const bundle = makeTestBundleProgram(_('/index.js'));
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const variableNode =
            getDeclaration(bundle.program, _('/b.js'), 'd', isNamedVariableDeclaration);
        const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

        expect(importOfIdent).toBeNull();
      });
    });

    describe('getDeclarationOfIdentifier()', () => {
      // Helpers
      const createTestForTsHelper =
          (program: ts.Program, host: NgccReflectionHost, srcFile: TestFile,
           getHelperDeclaration: (name: string) => ts.Declaration) =>
              (varName: string, helperName: string, knownAs: KnownDeclaration,
               viaModule: string|null = null) => {
                const node =
                    getDeclaration(program, srcFile.name, varName, ts.isVariableDeclaration);
                const helperIdentifier = getIdentifierFromCallExpression(node);
                const helperDeclaration = host.getDeclarationOfIdentifier(helperIdentifier);

                expect(helperDeclaration).toEqual({
                  kind: DeclarationKind.Concrete,
                  known: knownAs,
                  node: getHelperDeclaration(helperName),
                  viaModule,
                  identity: null,
                });
              };

      const getIdentifierFromCallExpression = (decl: ts.VariableDeclaration) => {
        if (decl.initializer !== undefined && ts.isCallExpression(decl.initializer)) {
          const expr = decl.initializer.expression;
          if (ts.isIdentifier(expr)) return expr;
          if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.name)) return expr.name;
        }
        throw new Error(`Unable to extract identifier from declaration '${decl.getText()}'.`);
      };

      it('should return the declaration of a locally defined identifier', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const ctrDecorators = host.getConstructorParameters(classNode)!;
        const identifierOfViewContainerRef = (ctrDecorators[0].typeValueReference! as {
                                               kind: TypeValueReferenceKind.LOCAL,
                                               expression: ts.Identifier,
                                               defaultImportStatement: null,
                                             }).expression;

        const expectedDeclarationNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'ViewContainerRef',
            isNamedVariableDeclaration);
        const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfViewContainerRef);
        expect(actualDeclaration).not.toBe(null);
        expect(actualDeclaration!.node).toBe(expectedDeclarationNode);
        expect(actualDeclaration!.viaModule).toBe(null);
        expect((actualDeclaration as ConcreteDeclaration).identity).toBe(null);
      });

      it('should return the declaration of an externally defined identifier', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const classDecorators = host.getDecoratorsOfDeclaration(classNode)!;
        const identifierOfDirective =
            ((classDecorators[0].node as ts.ObjectLiteralExpression).properties[0] as
             ts.PropertyAssignment)
                .initializer as ts.Identifier;

        const expectedDeclarationNode = getDeclaration(
            bundle.program, _('/node_modules/@angular/core/index.d.ts'), 'Directive',
            isNamedVariableDeclaration);
        const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfDirective);
        expect(actualDeclaration).not.toBe(null);
        expect(actualDeclaration!.node).toBe(expectedDeclarationNode);
        expect(actualDeclaration!.viaModule).toBe('@angular/core');
      });

      it('should return the source-file of an import namespace', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles([NAMESPACED_IMPORT_FILE]);
        const bundle = makeTestBundleProgram(NAMESPACED_IMPORT_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode = getDeclaration(
            bundle.program, NAMESPACED_IMPORT_FILE.name, 'SomeDirective',
            isNamedVariableDeclaration);
        const classDecorators = host.getDecoratorsOfDeclaration(classNode)!;
        const identifier =
            (((classDecorators[0].node as ts.ObjectLiteralExpression).properties[0] as
              ts.PropertyAssignment)
                 .initializer as ts.PropertyAccessExpression)
                .expression as ts.Identifier;

        const expectedDeclarationNode =
            getSourceFileOrError(bundle.program, _('/node_modules/@angular/core/index.d.ts'));
        const actualDeclaration = host.getDeclarationOfIdentifier(identifier);
        expect(actualDeclaration).not.toBe(null);
        expect(actualDeclaration!.node).toBe(expectedDeclarationNode);
        expect(actualDeclaration!.viaModule).toBe('@angular/core');
      });

      it('should return the correct declaration for an inner function identifier inside an ES5 IIFE',
         () => {
           const superGetDeclarationOfIdentifierSpy =
               spyOn(Esm2015ReflectionHost.prototype, 'getDeclarationOfIdentifier')
                   .and.callThrough();
           loadTestFiles([SIMPLE_CLASS_FILE]);
           const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

           const outerDeclaration = getDeclaration(
               bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
           const innerDeclaration =
               (((outerDeclaration.initializer as ts.ParenthesizedExpression).expression as
                 ts.CallExpression)
                    .expression as ts.FunctionExpression)
                   .body.statements[0] as ts.FunctionDeclaration;

           const outerIdentifier = outerDeclaration.name as ts.Identifier;
           const innerIdentifier = innerDeclaration.name as ts.Identifier;

           expect(host.getDeclarationOfIdentifier(outerIdentifier)!.node).toBe(outerDeclaration);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledWith(outerIdentifier);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledTimes(1);

           superGetDeclarationOfIdentifierSpy.calls.reset();

           expect(host.getDeclarationOfIdentifier(innerIdentifier)!.node).toBe(outerDeclaration);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledWith(innerIdentifier);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledWith(outerIdentifier);
           expect(superGetDeclarationOfIdentifierSpy).toHaveBeenCalledTimes(2);
         });

      it('should return the correct declaration for an outer alias identifier', () => {
        const PROGRAM_FILE: TestFile = {
          name: _('/test.js'),
          contents: `
               var AliasedClass = AliasedClass_1 = (function () {
                 function InnerClass() {
                 }
                 return InnerClass;
               }());
               var AliasedClass_1;
             `,
        };

        loadTestFiles([PROGRAM_FILE]);
        const bundle = makeTestBundleProgram(PROGRAM_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const expectedDeclaration = getDeclaration(
            bundle.program, PROGRAM_FILE.name, 'AliasedClass', isNamedVariableDeclaration);
        // Grab the `AliasedClass_1` identifier (which is an alias for `AliasedClass`).
        const aliasIdentifier =
            (expectedDeclaration.initializer as ts.BinaryExpression).left as ts.Identifier;
        const actualDeclaration = host.getDeclarationOfIdentifier(aliasIdentifier)!;

        expect(aliasIdentifier.getText()).toBe('AliasedClass_1');
        expect(actualDeclaration.node!.getText()).toBe(expectedDeclaration.getText());
      });

      it('should return the correct outer declaration for an aliased inner class declaration inside an ES5 IIFE',
         () => {
           // Note that the inner class declaration `function FroalaEditorModule() {}` is aliased
           // internally to `FroalaEditorModule_1`, which is used in the object returned from
           // `forRoot()`.
           const PROGRAM_FILE: TestFile = {
             name: _('/test.js'),
             contents: `
            var FroalaEditorModule = /** @class */ (function () {
              function FroalaEditorModule() {
              }
              FroalaEditorModule_1 = FroalaEditorModule;
              FroalaEditorModule.forRoot = function () {
                  return { ngModule: FroalaEditorModule_1, providers: [] };
              };
              var FroalaEditorModule_1;
              FroalaEditorModule = FroalaEditorModule_1 = __decorate([
                  NgModule({
                      declarations: [FroalaEditorDirective],
                      exports: [FroalaEditorDirective]
                  })
              ], FroalaEditorModule);
              return FroalaEditorModule;
          }());
          export { FroalaEditorModule };
          `
           };

           loadTestFiles([PROGRAM_FILE]);
           const bundle = makeTestBundleProgram(PROGRAM_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

           const expectedDeclaration = getDeclaration(
               bundle.program, PROGRAM_FILE.name, 'FroalaEditorModule', isNamedVariableDeclaration);
           // Grab the `FroalaEditorModule_1` identifier returned from the `forRoot()` method
           const forRootMethod =
               ((((expectedDeclaration.initializer as ts.ParenthesizedExpression).expression as
                  ts.CallExpression)
                     .expression as ts.FunctionExpression)
                    .body.statements[2] as ts.ExpressionStatement);
           const identifier =
               (((((forRootMethod.expression as ts.BinaryExpression).right as ts.FunctionExpression)
                      .body.statements[0] as ts.ReturnStatement)
                     .expression as ts.ObjectLiteralExpression)
                    .properties[0] as ts.PropertyAssignment)
                   .initializer as ts.Identifier;
           const actualDeclaration = host.getDeclarationOfIdentifier(identifier)!;
           expect(actualDeclaration.node!.getText()).toBe(expectedDeclaration.getText());
         });

      it('should recognize TypeScript helpers (as function declarations)', () => {
        const file: TestFile = {
          name: _('/test.js'),
          contents: `
            function __assign(t, ...sources) { /* ... */ }
            function __spread(...args) { /* ... */ }
            function __spreadArrays(...args) { /* ... */ }
            function __spreadArray(to, from) { /* ... */ }
            function __read(o) { /* ... */ }

            var a = __assign({foo: 'bar'}, {baz: 'qux'});
            var b = __spread(['foo', 'bar'], ['baz', 'qux']);
            var c = __spreadArrays(['foo', 'bar'], ['baz', 'qux']);
            var d = __spreadArray(['foo', 'bar'], ['baz', 'qux']);
            var e = __read(['foo', 'bar']);
          `,
        };
        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = createTestForTsHelper(
            bundle.program, host, file,
            helperName =>
                getDeclaration(bundle.program, file.name, helperName, ts.isFunctionDeclaration));

        testForHelper('a', '__assign', KnownDeclaration.TsHelperAssign);
        testForHelper('b', '__spread', KnownDeclaration.TsHelperSpread);
        testForHelper('c', '__spreadArrays', KnownDeclaration.TsHelperSpreadArrays);
        testForHelper('d', '__spreadArray', KnownDeclaration.TsHelperSpreadArray);
        testForHelper('e', '__read', KnownDeclaration.TsHelperRead);
      });

      it('should recognize suffixed TypeScript helpers (as function declarations)', () => {
        const file: TestFile = {
          name: _('/test.js'),
          contents: `
            function __assign$1(t, ...sources) { /* ... */ }
            function __spread$2(...args) { /* ... */ }
            function __spreadArrays$3(...args) { /* ... */ }
            function __spreadArray$3(to, from) { /* ... */ }
            function __read$3(o) { /* ... */ }

            var a = __assign$1({foo: 'bar'}, {baz: 'qux'});
            var b = __spread$2(['foo', 'bar'], ['baz', 'qux']);
            var c = __spreadArrays$3(['foo', 'bar'], ['baz', 'qux']);
            var d = __spreadArray$3(['foo', 'bar'], ['baz', 'qux']);
            var e = __read$3(['foo', 'bar']);
          `,
        };
        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = createTestForTsHelper(
            bundle.program, host, file,
            helperName =>
                getDeclaration(bundle.program, file.name, helperName, ts.isFunctionDeclaration));

        testForHelper('a', '__assign$1', KnownDeclaration.TsHelperAssign);
        testForHelper('b', '__spread$2', KnownDeclaration.TsHelperSpread);
        testForHelper('c', '__spreadArrays$3', KnownDeclaration.TsHelperSpreadArrays);
        testForHelper('d', '__spreadArray$3', KnownDeclaration.TsHelperSpreadArray);
        testForHelper('e', '__read$3', KnownDeclaration.TsHelperRead);
      });

      it('should recognize TypeScript helpers (as variable declarations)', () => {
        const file: TestFile = {
          name: _('/test.js'),
          contents: `
            var __assign = (this && this.__assign) || function (t, ...sources) { /* ... */ }
            var __spread = (this && this.__spread) || function (...args) { /* ... */ }
            var __spreadArrays = (this && this.__spreadArrays) || function (...args) { /* ... */ }
            var __spreadArray = (this && this.__spreadArray) || function (to, from) { /* ... */ }
            var __read = (this && this._read) || function (o) { /* ... */ }

            var a = __assign({foo: 'bar'}, {baz: 'qux'});
            var b = __spread(['foo', 'bar'], ['baz', 'qux']);
            var c = __spreadArrays(['foo', 'bar'], ['baz', 'qux']);
            var d = __spreadArray(['foo', 'bar'], ['baz', 'qux']);
            var e = __read(['foo', 'bar']);
       `,
        };
        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = createTestForTsHelper(
            bundle.program, host, file,
            helperName =>
                getDeclaration(bundle.program, file.name, helperName, ts.isVariableDeclaration));

        testForHelper('a', '__assign', KnownDeclaration.TsHelperAssign);
        testForHelper('b', '__spread', KnownDeclaration.TsHelperSpread);
        testForHelper('c', '__spreadArrays', KnownDeclaration.TsHelperSpreadArrays);
        testForHelper('d', '__spreadArray', KnownDeclaration.TsHelperSpreadArray);
        testForHelper('e', '__read', KnownDeclaration.TsHelperRead);
      });

      it('should recognize suffixed TypeScript helpers (as variable declarations)', () => {
        const file: TestFile = {
          name: _('/test.js'),
          contents: `
            var __assign$1 = (this && this.__assign$1) || function (t, ...sources) { /* ... */ }
            var __spread$2 = (this && this.__spread$2) || function (...args) { /* ... */ }
            var __spreadArrays$3 = (this && this.__spreadArrays$3) || function (...args) { /* ... */ }
            var __spreadArray$3 = (this && this.__spreadArray$3) || function (to, from) { /* ... */ }
            var __read$3 = (this && this.__read$3) || function (o) { /* ... */ }

            var a = __assign$1({foo: 'bar'}, {baz: 'qux'});
            var b = __spread$2(['foo', 'bar'], ['baz', 'qux']);
            var c = __spreadArrays$3(['foo', 'bar'], ['baz', 'qux']);
            var d = __spreadArray$3(['foo', 'bar'], ['baz', 'qux']);
            var e = __read$3(['foo', 'bar']);
          `,
        };
        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = createTestForTsHelper(
            bundle.program, host, file,
            helperName =>
                getDeclaration(bundle.program, file.name, helperName, ts.isVariableDeclaration));

        testForHelper('a', '__assign$1', KnownDeclaration.TsHelperAssign);
        testForHelper('b', '__spread$2', KnownDeclaration.TsHelperSpread);
        testForHelper('c', '__spreadArrays$3', KnownDeclaration.TsHelperSpreadArrays);
        testForHelper('d', '__spreadArray$3', KnownDeclaration.TsHelperSpreadArray);
        testForHelper('e', '__read$3', KnownDeclaration.TsHelperRead);
      });

      it('should recognize imported TypeScript helpers (named imports)', () => {
        const files: TestFile[] = [
          {
            name: _('/test.js'),
            contents: `
              import {__assign, __spread, __spreadArrays, __spreadArray, __read} from 'tslib';

              var a = __assign({foo: 'bar'}, {baz: 'qux'});
              var b = __spread(['foo', 'bar'], ['baz', 'qux']);
              var c = __spreadArrays(['foo', 'bar'], ['baz', 'qux']);
              var d = __spreadArray(['foo', 'bar'], ['baz', 'qux']);
              var e = __read(['foo', 'bar']);
            `,
          },
          {
            name: _('/node_modules/tslib/index.d.ts'),
            contents: `
              export declare function __assign(t: any, ...sources: any[]): any;
              export declare function __spread(...args: any[][]): any[];
              export declare function __spreadArrays(...args: any[][]): any[];
              export declare function __spreadArray(to: any[], from: any[]): any[];
              export declare function __read(o: any, n?: number): any[];
            `,
          },
        ];
        loadTestFiles(files);

        const [testFile, tslibFile] = files;
        const bundle = makeTestBundleProgram(testFile.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = createTestForTsHelper(
            bundle.program, host, testFile,
            helperName => getDeclaration(
                bundle.program, tslibFile.name, helperName, ts.isFunctionDeclaration));

        testForHelper('a', '__assign', KnownDeclaration.TsHelperAssign, 'tslib');
        testForHelper('b', '__spread', KnownDeclaration.TsHelperSpread, 'tslib');
        testForHelper('c', '__spreadArrays', KnownDeclaration.TsHelperSpreadArrays, 'tslib');
        testForHelper('d', '__spreadArray', KnownDeclaration.TsHelperSpreadArray, 'tslib');
        testForHelper('e', '__read', KnownDeclaration.TsHelperRead, 'tslib');
      });

      it('should recognize imported TypeScript helpers (star import)', () => {
        const files: TestFile[] = [
          {
            name: _('/test.js'),
            contents: `
              import * as tslib_1 from 'tslib';

              var a = tslib_1.__assign({foo: 'bar'}, {baz: 'qux'});
              var b = tslib_1.__spread(['foo', 'bar'], ['baz', 'qux']);
              var c = tslib_1.__spreadArrays(['foo', 'bar'], ['baz', 'qux']);
              var d = tslib_1.__spreadArray(['foo', 'bar'], ['baz', 'qux']);
              var e = tslib_1.__read(['foo', 'bar']);
            `,
          },
          {
            name: _('/node_modules/tslib/index.d.ts'),
            contents: `
              export declare function __assign(t: any, ...sources: any[]): any;
              export declare function __spread(...args: any[][]): any[];
              export declare function __spreadArrays(...args: any[][]): any[];
              export declare function __spreadArray(to: any[], from: any[]): any[];
              export declare function __read(o: any, n?: number): any[];
            `,
          },
        ];
        loadTestFiles(files);

        const [testFile, tslibFile] = files;
        const bundle = makeTestBundleProgram(testFile.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = createTestForTsHelper(
            bundle.program, host, testFile,
            helperName => getDeclaration(
                bundle.program, tslibFile.name, helperName, ts.isFunctionDeclaration));

        testForHelper('a', '__assign', KnownDeclaration.TsHelperAssign, 'tslib');
        testForHelper('b', '__spread', KnownDeclaration.TsHelperSpread, 'tslib');
        testForHelper('c', '__spreadArrays', KnownDeclaration.TsHelperSpreadArrays, 'tslib');
        testForHelper('d', '__spreadArray', KnownDeclaration.TsHelperSpreadArray, 'tslib');
        testForHelper('e', '__read', KnownDeclaration.TsHelperRead, 'tslib');
      });

      it('should recognize undeclared, unimported TypeScript helpers (by name)', () => {
        const file: TestFile = {
          name: _('/test.js'),
          contents: `
            var a = __assign({foo: 'bar'}, {baz: 'qux'});
            var b = __spread(['foo', 'bar'], ['baz', 'qux']);
            var c = __spreadArrays(['foo', 'bar'], ['baz', 'qux']);
            var d = __spreadArray(['foo', 'bar'], ['baz', 'qux']);
            var e = __read(['foo', 'bar']);
          `,
        };
        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = (varName: string, helperName: string, knownAs: KnownDeclaration) => {
          const node = getDeclaration(bundle.program, file.name, varName, ts.isVariableDeclaration);
          const helperIdentifier = getIdentifierFromCallExpression(node);
          const helperDeclaration = host.getDeclarationOfIdentifier(helperIdentifier);

          expect(helperDeclaration).toEqual({
            kind: DeclarationKind.Inline,
            known: knownAs,
            node: helperIdentifier,
            viaModule: null,
          });
        };

        testForHelper('a', '__assign', KnownDeclaration.TsHelperAssign);
        testForHelper('b', '__spread', KnownDeclaration.TsHelperSpread);
        testForHelper('c', '__spreadArrays', KnownDeclaration.TsHelperSpreadArrays);
        testForHelper('d', '__spreadArray', KnownDeclaration.TsHelperSpreadArray);
        testForHelper('e', '__read', KnownDeclaration.TsHelperRead);
      });

      it('should recognize suffixed, undeclared, unimported TypeScript helpers (by name)', () => {
        const file: TestFile = {
          name: _('/test.js'),
          contents: `
            var a = __assign$1({foo: 'bar'}, {baz: 'qux'});
            var b = __spread$2(['foo', 'bar'], ['baz', 'qux']);
            var c = __spreadArrays$3(['foo', 'bar'], ['baz', 'qux']);
            var d = __spreadArray$3(['foo', 'bar'], ['baz', 'qux']);
            var e = __read$3(['foo', 'bar']);
          `,
        };
        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const testForHelper = (varName: string, helperName: string, knownAs: KnownDeclaration) => {
          const node = getDeclaration(bundle.program, file.name, varName, ts.isVariableDeclaration);
          const helperIdentifier = getIdentifierFromCallExpression(node);
          const helperDeclaration = host.getDeclarationOfIdentifier(helperIdentifier);

          expect(helperDeclaration).toEqual({
            kind: DeclarationKind.Inline,
            known: knownAs,
            node: helperIdentifier,
            viaModule: null,
          });
        };

        testForHelper('a', '__assign$1', KnownDeclaration.TsHelperAssign);
        testForHelper('b', '__spread$2', KnownDeclaration.TsHelperSpread);
        testForHelper('c', '__spreadArrays$3', KnownDeclaration.TsHelperSpreadArrays);
        testForHelper('d', '__spreadArray$3', KnownDeclaration.TsHelperSpreadArray);
        testForHelper('e', '__read', KnownDeclaration.TsHelperRead);
      });

      it('should recognize enum declarations with string values', () => {
        const testFile: TestFile = {
          name: _('/node_modules/test-package/some/file.js'),
          contents: `
          export var Enum;
          (function (Enum) {
              Enum["ValueA"] = "1";
              Enum["ValueB"] = "2";
          })(Enum || (Enum = {}));

          var value = Enum;`
        };
        loadTestFiles([testFile]);
        const bundle = makeTestBundleProgram(testFile.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const valueDecl = getDeclaration(
            bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
            ts.isVariableDeclaration);
        const declaration = host.getDeclarationOfIdentifier(
                                valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

        const enumMembers = (declaration.identity as DownleveledEnum).enumMembers;
        expect(declaration.node.parent.parent.getText()).toBe('export var Enum;');
        expect(enumMembers!.length).toBe(2);
        expect(enumMembers![0].name.getText()).toBe('"ValueA"');
        expect(enumMembers![0].initializer!.getText()).toBe('"1"');
        expect(enumMembers![1].name.getText()).toBe('"ValueB"');
        expect(enumMembers![1].initializer!.getText()).toBe('"2"');
      });

      it('should recognize enum declarations with numeric values', () => {
        const testFile: TestFile = {
          name: _('/node_modules/test-package/some/file.js'),
          contents: `
          export var Enum;
          (function (Enum) {
              Enum[Enum["ValueA"] = "1"] = "ValueA";
              Enum[Enum["ValueB"] = "2"] = "ValueB";
          })(Enum || (Enum = {}));

          var value = Enum;`
        };
        loadTestFiles([testFile]);
        const bundle = makeTestBundleProgram(testFile.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const valueDecl = getDeclaration(
            bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
            ts.isVariableDeclaration);
        const declaration = host.getDeclarationOfIdentifier(
                                valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

        const enumMembers = (declaration.identity as DownleveledEnum).enumMembers;
        expect(declaration.node.parent.parent.getText()).toBe('export var Enum;');
        expect(enumMembers!.length).toBe(2);
        expect(enumMembers![0].name.getText()).toBe('"ValueA"');
        expect(enumMembers![0].initializer!.getText()).toBe('"1"');
        expect(enumMembers![1].name.getText()).toBe('"ValueB"');
        expect(enumMembers![1].initializer!.getText()).toBe('"2"');
      });

      it('should not consider IIFEs that do no assign members to the parameter as an enum declaration',
         () => {
           const testFile: TestFile = {
             name: _('/node_modules/test-package/some/file.js'),
             contents: `
          export var Enum;
          (function (E) {
              Enum["ValueA"] = "1";
              Enum["ValueB"] = "2";
          })(Enum || (Enum = {}));

          var value = Enum;`
           };
           loadTestFiles([testFile]);
           const bundle = makeTestBundleProgram(testFile.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
           const valueDecl = getDeclaration(
               bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
               ts.isVariableDeclaration);
           const declaration = host.getDeclarationOfIdentifier(
                                   valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

           expect(declaration.node.parent.parent.getText()).toBe('export var Enum;');
           expect(declaration.identity).toBe(null);
         });

      it('should not consider IIFEs without call argument as an enum declaration', () => {
        const testFile: TestFile = {
          name: _('/node_modules/test-package/some/file.js'),
          contents: `
          export var Enum;
          (function (Enum) {
              Enum["ValueA"] = "1";
              Enum["ValueB"] = "2";
          })();

          var value = Enum;`
        };
        loadTestFiles([testFile]);
        const bundle = makeTestBundleProgram(testFile.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const valueDecl = getDeclaration(
            bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
            ts.isVariableDeclaration);
        const declaration = host.getDeclarationOfIdentifier(
                                valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

        expect(declaration.node.parent.parent.getText()).toBe('export var Enum;');
        expect(declaration.identity).toBe(null);
      });
    });

    describe('getExportsOfModule()', () => {
      it('should return a map of all the exports from a given module', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles(EXPORTS_FILES);
        const bundle = makeTestBundleProgram(_('/index.js'));
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const file = getSourceFileOrError(bundle.program, _('/b.js'));
        const exportDeclarations = host.getExportsOfModule(file);
        expect(exportDeclarations).not.toBe(null);
        expect(Array.from(exportDeclarations!.keys())).toEqual([
          'Directive',
          'a',
          'b',
          'c',
          'd',
          'e',
          'DirectiveX',
          'SomeClass',
        ]);

        const values =
            Array.from(exportDeclarations!.values())
                .map(declaration => [declaration.node!.getText(), declaration.viaModule]);
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

      it('should recognize declarations of known TypeScript helpers', () => {
        const tslib = {
          name: _('/tslib.d.ts'),
          contents: `
            export declare function __assign(t: any, ...sources: any[]): any;
            export declare function __spread(...args: any[][]): any[];
            export declare function __spreadArrays(...args: any[][]): any[];
            export declare function __spreadArray(to: any[], from: any[]): any[];
            export declare function __read(o: any, n?: number): any[];
            export declare function __unknownHelper(...args: any[]): any;
          `,
        };
        loadTestFiles([tslib]);
        const bundle = makeTestBundleProgram(tslib.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const sf = getSourceFileOrError(bundle.program, tslib.name);
        const exportDeclarations = host.getExportsOfModule(sf)!;

        expect([...exportDeclarations].map(([exportName, {known}]) => [exportName, known]))
            .toEqual([
              ['__assign', KnownDeclaration.TsHelperAssign],
              ['__spread', KnownDeclaration.TsHelperSpread],
              ['__spreadArrays', KnownDeclaration.TsHelperSpreadArrays],
              ['__spreadArray', KnownDeclaration.TsHelperSpreadArray],
              ['__read', KnownDeclaration.TsHelperRead],
              ['__unknownHelper', null],
            ]);
      });
    });

    describe('getClassSymbol()', () => {
      it('should return the class symbol for an ES2015 class', () => {
        loadTestFiles([SIMPLE_ES2015_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_ES2015_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const node = getDeclaration(
            bundle.program, SIMPLE_ES2015_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
        const classSymbol = host.getClassSymbol(node);

        expect(classSymbol).toBeDefined();
        expect(classSymbol!.declaration.valueDeclaration).toBe(node);
        expect(classSymbol!.implementation.valueDeclaration).toBe(node);
      });

      it('should return the class symbol for an ES5 class (outer variable declaration)', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const outerNode = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const innerNode = (getIifeBody(outerNode.initializer!) as ts.Block)
                              .statements.find(isNamedFunctionDeclaration)!;
        const classSymbol = host.getClassSymbol(outerNode);

        expect(classSymbol).toBeDefined();
        expect(classSymbol!.declaration.valueDeclaration).toBe(outerNode);
        expect(classSymbol!.implementation.valueDeclaration).toBe(innerNode);
      });

      it('should return the class symbol for an ES5 class (inner function declaration)', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const outerNode = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        const innerNode = (getIifeBody(outerNode.initializer!) as ts.Block)
                              .statements.find(isNamedFunctionDeclaration)!;
        const classSymbol = host.getClassSymbol(innerNode);

        expect(classSymbol).toBeDefined();
        expect(classSymbol!.declaration.valueDeclaration).toBe(outerNode);
        expect(classSymbol!.implementation.valueDeclaration).toBe(innerNode);
      });

      it('should return the same class symbol (of the outer declaration) for outer and inner declarations',
         () => {
           loadTestFiles([SIMPLE_CLASS_FILE]);
           const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
           const outerNode = getDeclaration(
               bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
           const innerNode = (getIifeBody(outerNode.initializer!) as ts.Block)
                                 .statements.find(isNamedFunctionDeclaration)!;

           const innerSymbol = host.getClassSymbol(innerNode)!;
           const outerSymbol = host.getClassSymbol(outerNode)!;
           expect(innerSymbol.declaration).toBe(outerSymbol.declaration);
           expect(innerSymbol.implementation).toBe(outerSymbol.implementation);
         });

      it('should return the class symbol for an ES5 class whose IIFE is not wrapped in parens',
         () => {
           loadTestFiles([SIMPLE_CLASS_FILE]);
           const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
           const outerNode = getDeclaration(
               bundle.program, SIMPLE_CLASS_FILE.name, 'NoParensClass', isNamedVariableDeclaration);
           const innerNode = (getIifeBody(outerNode.initializer!) as ts.Block)
                                 .statements.find(isNamedFunctionDeclaration)!;
           const classSymbol = host.getClassSymbol(outerNode);

           expect(classSymbol).toBeDefined();
           expect(classSymbol!.declaration.valueDeclaration).toBe(outerNode);
           expect(classSymbol!.implementation.valueDeclaration).toBe(innerNode);
         });

      it('should return the class symbol for an ES5 class whose IIFE is not wrapped with inner parens',
         () => {
           loadTestFiles([SIMPLE_CLASS_FILE]);
           const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
           const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
           const outerNode = getDeclaration(
               bundle.program, SIMPLE_CLASS_FILE.name, 'InnerParensClass',
               isNamedVariableDeclaration);
           const innerNode = (getIifeBody(outerNode.initializer!) as ts.Block)
                                 .statements.find(isNamedFunctionDeclaration)!;
           const classSymbol = host.getClassSymbol(outerNode);

           expect(classSymbol).toBeDefined();
           expect(classSymbol!.declaration.valueDeclaration).toBe(outerNode);
           expect(classSymbol!.implementation.valueDeclaration).toBe(innerNode);
         });

      it('should return undefined if node is not an ES5 class', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const bundle = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const node = getDeclaration(
            bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        const classSymbol = host.getClassSymbol(node);

        expect(classSymbol).toBeUndefined();
      });

      it('should return undefined if variable declaration is not initialized using an IIFE', () => {
        const testFile = {
          name: _('/test.js'),
          contents: `var MyClass = null;`,
        };
        loadTestFiles([testFile]);
        const bundle = makeTestBundleProgram(testFile.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const node =
            getDeclaration(bundle.program, testFile.name, 'MyClass', isNamedVariableDeclaration);
        const classSymbol = host.getClassSymbol(node);

        expect(classSymbol).toBeUndefined();
      });
    });

    describe('isClass()', () => {
      it('should return true if a given node is a TS class declaration', () => {
        loadTestFiles([SIMPLE_ES2015_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_ES2015_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const node = getDeclaration(
            bundle.program, SIMPLE_ES2015_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
        expect(host.isClass(node)).toBe(true);
      });

      it('should return true if a given node is the outer variable declaration of a class', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const node = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
        expect(host.isClass(node)).toBe(true);
      });

      it('should return true if a given node is the inner variable declaration of a class', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const outerNode = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
        const innerNode = (getIifeBody(outerNode.initializer!) as ts.Block)
                              .statements.find(isNamedFunctionDeclaration)!;
        expect(host.isClass(innerNode)).toBe(true);
      });

      it('should return false if a given node is a function declaration', () => {
        loadTestFiles([FOO_FUNCTION_FILE]);
        const bundle = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const node = getDeclaration(
            bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
        expect(host.isClass(node)).toBe(false);
      });
    });

    describe('hasBaseClass()', () => {
      function hasBaseClass(source: string) {
        const file = {
          name: _('/synthesized_constructors.js'),
          contents: source,
        };

        loadTestFiles([file]);
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode =
            getDeclaration(bundle.program, file.name, 'TestClass', isNamedVariableDeclaration);
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
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode =
            getDeclaration(bundle.program, file.name, 'TestClass', isNamedVariableDeclaration);
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
        expect(identifier!.text).toBe('BaseClass');
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
           expect(identifier!.text).toBe('BaseClass');
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
        const bundle = makeTestBundleProgram(file.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classNode =
            getDeclaration(bundle.program, file.name, 'TestClass', isNamedVariableDeclaration);
        const expression = host.getBaseClassExpression(classNode)!;
        expect(expression.getText()).toBe('foo()');
      });
    });

    describe('findClassSymbols()', () => {
      it('should return an array of all classes in the given source file', () => {
        loadTestFiles(DECORATED_FILES);
        const bundle = makeTestBundleProgram(getRootFiles(DECORATED_FILES)[0]);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const primaryFile = getSourceFileOrError(bundle.program, DECORATED_FILES[0].name);
        const secondaryFile = getSourceFileOrError(bundle.program, DECORATED_FILES[1].name);

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
        const bundle = makeTestBundleProgram(getRootFiles(DECORATED_FILES)[0]);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const primaryFile = getSourceFileOrError(bundle.program, DECORATED_FILES[0].name);
        const secondaryFile = getSourceFileOrError(bundle.program, DECORATED_FILES[1].name);

        const classSymbolsPrimary = host.findClassSymbols(primaryFile);
        const classDecoratorsPrimary = classSymbolsPrimary.map(s => host.getDecoratorsOfSymbol(s));
        expect(classDecoratorsPrimary.length).toEqual(2);
        expect(classDecoratorsPrimary[0]!.map(d => d.name)).toEqual(['Directive']);
        expect(classDecoratorsPrimary[1]!.map(d => d.name)).toEqual(['Directive']);

        const classSymbolsSecondary = host.findClassSymbols(secondaryFile);
        const classDecoratorsSecondary =
            classSymbolsSecondary.map(s => host.getDecoratorsOfSymbol(s));
        expect(classDecoratorsSecondary.length).toEqual(1);
        expect(classDecoratorsSecondary[0]!.map(d => d.name)).toEqual(['Directive']);
      });
    });

    describe('getDtsDeclaration()', () => {
      it('should find the dts declaration that has the same relative path to the source file',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const bundle = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const class1 = getDeclaration(
               bundle.program, _('/ep/src/class1.js'), 'Class1', ts.isVariableDeclaration);
           const host =
               createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

           const dtsDeclaration = host.getDtsDeclaration(class1);
           expect(dtsDeclaration!.getSourceFile().fileName).toEqual(_('/ep/typings/class1.d.ts'));
         });

      it('should find the dts declaration for exported functions', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const bundle = makeTestBundleProgram(_('/ep/src/func1.js'));
        const dts = makeTestDtsBundleProgram(_('/ep/typings/func1.d.ts'), _('/'));
        const mooFn = getDeclaration(
            bundle.program, _('/ep/src/func1.js'), 'mooFn', ts.isFunctionDeclaration);
        const host =
            createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

        const dtsDeclaration = host.getDtsDeclaration(mooFn);
        expect(dtsDeclaration!.getSourceFile().fileName).toEqual(_('/ep/typings/func1.d.ts'));
      });

      it('should return null if there is no matching class in the matching dts file', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const bundle = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const missingClass = getDeclaration(
            bundle.program, _('/ep/src/class1.js'), 'MissingClass1', ts.isVariableDeclaration);
        const host =
            createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

        expect(host.getDtsDeclaration(missingClass)).toBe(null);
      });

      it('should return null if there is no matching dts file', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const bundle = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const missingClass = getDeclaration(
            bundle.program, _('/ep/src/missing-class.js'), 'MissingClass2',
            ts.isVariableDeclaration);
        const host =
            createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

        expect(host.getDtsDeclaration(missingClass)).toBe(null);
      });

      it('should find the dts file that contains a matching class declaration, even if the source files do not match',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const bundle = makeTestBundleProgram(_('/ep/src/flat-file.js'));
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const class1 = getDeclaration(
               bundle.program, _('/ep/src/flat-file.js'), 'Class1', ts.isVariableDeclaration);
           const host =
               createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

           const dtsDeclaration = host.getDtsDeclaration(class1);
           expect(dtsDeclaration!.getSourceFile().fileName).toEqual(_('/ep/typings/class1.d.ts'));
         });

      it('should find aliased exports', () => {
        loadTestFiles(TYPINGS_SRC_FILES);
        loadTestFiles(TYPINGS_DTS_FILES);
        const bundle = makeTestBundleProgram(_('/ep/src/flat-file.js'));
        const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
        const sourceClass = getDeclaration(
            bundle.program, _('/ep/src/flat-file.js'), 'SourceClass', ts.isVariableDeclaration);
        const host =
            createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

        const dtsDeclaration = host.getDtsDeclaration(sourceClass);
        if (dtsDeclaration === null) {
          return fail('Expected dts class to be found');
        }
        if (!isNamedClassDeclaration(dtsDeclaration)) {
          return fail('Expected a named class to be found.');
        }
        expect(dtsDeclaration.name.text).toEqual('TypingsClass');
        expect(_(dtsDeclaration.getSourceFile().fileName))
            .toEqual(_('/ep/typings/typings-class.d.ts'));
      });

      it('should find the dts file that contains a matching class declaration, even if the class is not publicly exported',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const bundle = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const internalClass = getDeclaration(
               bundle.program, _('/ep/src/internal.js'), 'InternalClass', ts.isVariableDeclaration);
           const host =
               createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

           const dtsDeclaration = host.getDtsDeclaration(internalClass);
           expect(dtsDeclaration!.getSourceFile().fileName).toEqual(_('/ep/typings/internal.d.ts'));
         });

      it('should match publicly and internal exported classes correctly, even if they have the same name',
         () => {
           loadTestFiles(TYPINGS_SRC_FILES);
           loadTestFiles(TYPINGS_DTS_FILES);
           const bundle = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
           const dts = makeTestBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0]);
           const host =
               createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle, dts));

           const class2 = getDeclaration(
               bundle.program, _('/ep/src/class2.js'), 'Class2', isNamedVariableDeclaration);
           const class2DtsDeclaration = host.getDtsDeclaration(class2);
           expect(class2DtsDeclaration!.getSourceFile().fileName)
               .toEqual(_('/ep/typings/class2.d.ts'));

           const internalClass2 = getDeclaration(
               bundle.program, _('/ep/src/internal.js'), 'Class2', isNamedVariableDeclaration);
           const internalClass2DtsDeclaration = host.getDtsDeclaration(internalClass2);
           expect(internalClass2DtsDeclaration!.getSourceFile().fileName)
               .toEqual(_('/ep/typings/internal.d.ts'));
         });
    });

    describe('getInternalNameOfClass()', () => {
      it('should return the name of the inner class declaration', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const emptyClass = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        expect(host.getInternalNameOfClass(emptyClass).text).toEqual('EmptyClass');

        const class1 = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'OuterClass1', isNamedVariableDeclaration);
        expect(host.getInternalNameOfClass(class1).text).toEqual('InnerClass1');

        const class2 = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'OuterClass2', isNamedVariableDeclaration);
        expect(host.getInternalNameOfClass(class2).text).toEqual('InnerClass2');

        const childClass = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'ChildClass', isNamedVariableDeclaration);
        expect(host.getInternalNameOfClass(childClass).text).toEqual('InnerChildClass');
      });
    });

    describe('getAdjacentNameOfClass()', () => {
      it('should return the name of the inner class declaration', () => {
        loadTestFiles([SIMPLE_CLASS_FILE]);
        const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));

        const emptyClass = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
        expect(host.getAdjacentNameOfClass(emptyClass).text).toEqual('EmptyClass');

        const class1 = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'OuterClass1', isNamedVariableDeclaration);
        expect(host.getAdjacentNameOfClass(class1).text).toEqual('InnerClass1');

        const class2 = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'OuterClass2', isNamedVariableDeclaration);
        expect(host.getAdjacentNameOfClass(class2).text).toEqual('InnerClass2');

        const childClass = getDeclaration(
            bundle.program, SIMPLE_CLASS_FILE.name, 'ChildClass', isNamedVariableDeclaration);
        expect(host.getAdjacentNameOfClass(childClass).text).toEqual('InnerChildClass');
      });
    });

    describe('getEndOfClass()', () => {
      it('should return the last static property of the class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = createHost(bundle, new Esm5ReflectionHost(new MockLogger(), false, bundle));
        const classSymbol =
            host.findClassSymbols(bundle.program.getSourceFile(SOME_DIRECTIVE_FILE.name)!)[0];
        const endOfClass = host.getEndOfClass(classSymbol);
        expect(endOfClass.getText()).toEqual(`SomeDirective.propDecorators = {
        "input1": [{ type: Input },],
        "input2": [{ type: Input },],
      };`);
      });
    });
  });
});
