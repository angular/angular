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
import {ClassMemberKind, ConcreteDeclaration, CtorParameter, DeclarationKind, DownleveledEnum, InlineDeclaration, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration, KnownDeclaration, TypeScriptReflectionHost, TypeValueReferenceKind} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadFakeCore, loadTestFiles} from '../../../src/ngtsc/testing';
import {CommonJsReflectionHost} from '../../src/host/commonjs_host';
import {DelegatingReflectionHost} from '../../src/host/delegating_host';
import {getIifeBody} from '../../src/host/esm2015_host';
import {NgccReflectionHost} from '../../src/host/ngcc_host';
import {BundleProgram} from '../../src/packages/bundle_program';
import {getRootFiles, makeTestBundleProgram, makeTestDtsBundleProgram} from '../helpers/utils';

import {expectTypeValueReferencesForParameters} from './util';

runInEachFileSystem(() => {
  describe('CommonJsReflectionHost', () => {
    let _: typeof absoluteFrom;

    let SOME_DIRECTIVE_FILE: TestFile;
    let TOPLEVEL_DECORATORS_FILE: TestFile;
    let CTOR_DECORATORS_ARRAY_FILE: TestFile;
    let SIMPLE_ES2015_CLASS_FILE: TestFile;
    let SIMPLE_CLASS_FILE: TestFile;
    let FOO_FUNCTION_FILE: TestFile;
    let INLINE_EXPORT_FILE: TestFile;
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
    let TYPINGS_SRC_FILES: TestFile[];
    let TYPINGS_DTS_FILES: TestFile[];

    // Helpers
    const createHost = (bundle: BundleProgram, ngccHost: CommonJsReflectionHost) => {
      const tsHost = new TypeScriptReflectionHost(bundle.program.getTypeChecker());
      return new DelegatingReflectionHost(tsHost, ngccHost);
    };

    beforeEach(() => {
      _ = absoluteFrom;

      SOME_DIRECTIVE_FILE = {
        name: _('/some_directive.cjs.js'),
        contents: `
var core = require('@angular/core');

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
    { type: core.Directive, args: [{ selector: '[someDirective]' },] }
  ];
  SomeDirective.ctorParameters = function() { return [
    { type: ViewContainerRef, },
    { type: TemplateRef, },
    { type: undefined, decorators: [{ type: core.Inject, args: [INJECTED_TOKEN,] },] },
  ]; };
  SomeDirective.propDecorators = {
    "input1": [{ type: core.Input },],
    "input2": [{ type: core.Input },],
  };
  return SomeDirective;
}());
exports.SomeDirective = SomeDirective;
`
      };

      TOPLEVEL_DECORATORS_FILE = {
        name: _('/toplevel_decorators.cjs.js'),
        contents: `
var core = require('@angular/core');

var INJECTED_TOKEN = new InjectionToken('injected');
var ViewContainerRef = {};
var TemplateRef = {};

var SomeDirective = (function() {
  function SomeDirective(_viewContainer, _template, injected) {}
  return SomeDirective;
}());
SomeDirective.decorators = [
  { type: core.Directive, args: [{ selector: '[someDirective]' },] }
];
SomeDirective.ctorParameters = function() { return [
  { type: ViewContainerRef, },
  { type: TemplateRef, },
  { type: undefined, decorators: [{ type: core.Inject, args: [INJECTED_TOKEN,] },] },
]; };
SomeDirective.propDecorators = {
  "input1": [{ type: core.Input },],
  "input2": [{ type: core.Input },],
};
exports.SomeDirective = SomeDirective;
`
      };

      CTOR_DECORATORS_ARRAY_FILE = {
        name: _('/ctor_decorated_as_array.js'),
        contents: `
        var core = require('@angular/core');
        var CtorDecoratedAsArray = (function() {
          function CtorDecoratedAsArray(arg1) {
          }
          CtorDecoratedAsArray.ctorParameters = [{ type: ParamType, decorators: [{ type: Inject },] }];
          return CtorDecoratedAsArray;
        }());
        exports.SomeDirective = SomeDirective;
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
exports.EmptyClass = EmptyClass;
exports.NoDecoratorConstructorClass = NoDecoratorConstructorClass;
`,
      };

      FOO_FUNCTION_FILE = {
        name: _('/foo_function.js'),
        contents: `
var core = require('@angular/core');
function foo() {}
foo.decorators = [
  { type: core.Directive, args: [{ selector: '[ignored]' },] }
];
exports.foo = foo;
`,
      };

      INLINE_EXPORT_FILE = {
        name: _('/inline_export.js'),
        contents: `
var core = require('@angular/core');
function foo() {}
foo.decorators = [
  { type: core.Directive, args: [{ selector: '[ignored]' },] }
];
exports.directives = [foo];
exports.Inline = (function() { function Inline() {} return Inline; })();
`,
      };

      INVALID_DECORATORS_FILE = {
        name: _('/invalid_decorators.js'),
        contents: `
var core = require('@angular/core');
var NotArrayLiteral = (function() {
  function NotArrayLiteral() {
  }
  NotArrayLiteral.decorators = () => [
    { type: core.Directive, args: [{ selector: '[ignored]' },] },
  ];
  return NotArrayLiteral;
}());

var NotObjectLiteral = (function() {
  function NotObjectLiteral() {
  }
  NotObjectLiteral.decorators = [
    "This is not an object literal",
    { type: core.Directive },
  ];
  return NotObjectLiteral;
}());

var NoTypeProperty = (function() {
  function NoTypeProperty() {
  }
  NoTypeProperty.decorators = [
    { notType: core.Directive },
    { type: core.Directive },
  ];
  return NoTypeProperty;
}());

var NotIdentifier = (function() {
  function NotIdentifier() {
  }
  NotIdentifier.decorators = [
    { type: 'StringsLiteralsAreNotIdentifiers' },
    { type: core.Directive },
  ];
  return NotIdentifier;
}());
`,
      };

      INVALID_DECORATOR_ARGS_FILE = {
        name: _('/invalid_decorator_args.js'),
        contents: `
var core = require('@angular/core');
var NoArgsProperty = (function() {
  function NoArgsProperty() {
  }
  NoArgsProperty.decorators = [
    { type: core.Directive },
  ];
  return NoArgsProperty;
}());

var args = [{ selector: '[ignored]' },];
var NoPropertyAssignment = (function() {
  function NoPropertyAssignment() {
  }
  NoPropertyAssignment.decorators = [
    { type: core.Directive, args },
  ];
  return NoPropertyAssignment;
}());

var NotArrayLiteral = (function() {
  function NotArrayLiteral() {
  }
  NotArrayLiteral.decorators = [
    { type: core.Directive, args: () => [{ selector: '[ignored]' },] },
  ];
  return NotArrayLiteral;
}());
`,
      };

      INVALID_PROP_DECORATORS_FILE = {
        name: _('/invalid_prop_decorators.js'),
        contents: `
var core = require('@angular/core');
var NotObjectLiteral = (function() {
  function NotObjectLiteral() {
  }
  NotObjectLiteral.propDecorators = () => ({
    "prop": [{ type: core.Directive },]
  });
  return NotObjectLiteral;
}());

var NotObjectLiteralProp = (function() {
  function NotObjectLiteralProp() {
  }
  NotObjectLiteralProp.propDecorators = {
    "prop": [
      "This is not an object literal",
      { type: core.Directive },
    ]
  };
  return NotObjectLiteralProp;
}());

var NoTypeProperty = (function() {
  function NoTypeProperty() {
  }
  NoTypeProperty.propDecorators = {
    "prop": [
      { notType: core.Directive },
      { type: core.Directive },
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
      { type: core.Directive },
    ]
  };
  return NotIdentifier;
}());
`,
      };

      INVALID_PROP_DECORATOR_ARGS_FILE = {
        name: _('/invalid_prop_decorator_args.js'),
        contents: `
var core = require('@angular/core');
var NoArgsProperty = (function() {
  function NoArgsProperty() {
  }
  NoArgsProperty.propDecorators = {
    "prop": [{ type: core.Input },]
  };
  return NoArgsProperty;
}());

var args = [{ selector: '[ignored]' },];
var NoPropertyAssignment = (function() {
  function NoPropertyAssignment() {
  }
  NoPropertyAssignment.propDecorators = {
    "prop": [{ type: core.Input, args },]
  };
  return NoPropertyAssignment;
}());

var NotArrayLiteral = (function() {
  function NotArrayLiteral() {
  }
  NotArrayLiteral.propDecorators = {
    "prop": [{ type: core.Input, args: () => [{ selector: '[ignored]' },] },],
  };
  return NotArrayLiteral;
}());
`,
      };

      INVALID_CTOR_DECORATORS_FILE = {
        name: _('/invalid_ctor_decorators.js'),
        contents: `
var core = require('@angular/core');
var NoParameters = (function() {
  function NoParameters() {}
  return NoParameters;
}());

var ArrowFunction = (function() {
  function ArrowFunction(arg1) {
  }
  ArrowFunction.ctorParameters = () => [
    { type: 'ParamType', decorators: [{ type: core.Inject },] }
  ];
  return ArrowFunction;
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
    { type: 'ParamType', decorators: [{ type: core.Inject },] },
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
        { notType: core.Inject },
        { type: core.Inject },
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
        { type: core.Inject },
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
var core = require('@angular/core');
var NoArgsProperty = (function() {
  function NoArgsProperty(arg1) {
  }
  NoArgsProperty.ctorParameters = function() { return [
    { type: 'ParamType', decorators: [{ type: core.Inject },] },
  ]; };
  return NoArgsProperty;
}());

var args = [{ selector: '[ignored]' },];
var NoPropertyAssignment = (function() {
  function NoPropertyAssignment(arg1) {
  }
  NoPropertyAssignment.ctorParameters = function() { return [
    { type: 'ParamType', decorators: [{ type: core.Inject, args },] },
  ]; };
  return NoPropertyAssignment;
}());

var NotArrayLiteral = (function() {
  function NotArrayLiteral(arg1) {
  }
  NotArrayLiteral.ctorParameters = function() { return [
    { type: 'ParamType', decorators: [{ type: core.Inject, args: () => [{ selector: '[ignored]' },] },] },
  ]; };
  return NotArrayLiteral;
}());
`,
      };

      IMPORTS_FILES = [
        {
          name: _('/index.js'),
          contents: `
          var file_a = require('./file_a');
          var file_b = require('./file_b');
          var file_c = require('./file_c');
          `
        },
        {
          name: _('/file_a.js'),
          contents: `
var a = 'a';
exports.a = a;
`,
        },
        {
          name: _('/file_b.js'),
          contents: `
var file_a = require('./file_a');
var b = file_a.a;
var c = 'c';
var d = c;
`,
        },
        {
          name: _('/file_c.js'),
          contents: `
var file_a = require('./file_a');
var c = file_a.a;
`,
        },
      ];

      EXPORTS_FILES = [
        {
          name: _('/index.js'),
          contents: `var a_module = require('./a_module');\n` +
              `var b_module = require('./b_module');\n` +
              `var xtra_module = require('./xtra_module');\n` +
              `var wildcard_reexports_emitted_helpers = require('./wildcard_reexports_emitted_helpers');\n` +
              `var wildcard_reexports_imported_helpers = require('./wildcard_reexports_imported_helpers');\n` +
              `var define_property_reexports = require('./define_property_reexports');\n`
        },
        {
          name: _('/a_module.js'),
          contents: `// In TS 3.9 exports are initialized to undefined at the top of the file\n` +
              `exports.a = void 0;\n` +
              `var a = 'a';\n` +
              `exports.a = a;\n`,
        },
        {
          name: _('/b_module.js'),
          contents: `var core = require('@angular/core');\n` +
              `var a_module = require('./a_module');\n` +
              `var b = a_module.a;\n` +
              `var e = 'e';\n` +
              `var SomeClass = (function() {\n` +
              `  function SomeClass() {}\n` +
              `  return SomeClass;\n` +
              `}());\n` +
              `\n` +
              `exports.Directive = core.Directive;\n` +
              `exports.a = a_module.a;\n` +
              `exports.b = b;\n` +
              `exports.c = a_module.a;\n` +
              `exports.d = b;\n` +
              `exports.e = e;\n` +
              `exports.DirectiveX = core.Directive;\n` +
              `exports.SomeClass = SomeClass;\n`,
        },
        {
          name: _('/xtra_module.js'),
          contents: `var xtra1 = 'xtra1';\n` +
              `var xtra2 = 'xtra2';\n` +
              `exports.xtra1 = xtra1;\n` +
              `exports.xtra2 = xtra2;\n`,
        },
        {
          name: _('/wildcard_reexports_emitted_helpers.js'),
          contents: `function __export(m) {\n` +
              `  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n` +
              `}\n` +
              `var b_module = require("./b_module");\n` +
              `__export(b_module);\n` +
              `__export(require("./xtra_module"));\n`,
        },
        {
          name: _('/wildcard_reexports_imported_helpers.js'),
          contents: `var tslib_1 = require("tslib");\n` +
              `var b_module = require("./b_module");\n` +
              `tslib_1.__exportStar(b_module, exports);\n` +
              `tslib_1.__exportStar(require("./xtra_module"), exports);\n`,
        },
        {
          name: _('/define_property_reexports.js'),
          contents: `var moduleA = require("./a_module");\n` +
              `Object.defineProperty(exports, "newA", { enumerable: true, get: function () { return moduleA.a; } });`,
        }
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
var core = require('@angular/core');
var secondary = require('./secondary');
var A = (function() {
  function A() {}
  A.decorators = [
    { type: core.Directive, args: [{ selector: '[a]' }] }
  ];
  return A;
}());
  var B = (function() {
  function B() {}
  B.decorators = [
    { type: core.Directive, args: [{ selector: '[b]' }] }
  ];
  return B;
}());
  function x() {}
  function y() {}
  var C = (function() {
  function C() {}
  return C;
});
exports.A = A;
exports.x = x;
exports.C = C;
`
        },
        {
          name: _('/secondary.js'),
          contents: `
var core = require('@angular/core');
var D = (function() {
  function D() {}
  D.decorators = [
    { type: core.Directive, args: [{ selector: '[d]' }] }
  ];
  return D;
}());
exports.D = D;
    `
        }
      ];

      TYPINGS_SRC_FILES = [
        {
          name: _('/ep/src/index.js'),
          contents: `
var internal = require('./internal');
var class1 = require('./class1');
var class2 = require('./class2');
var missing = require('./missing-class');
var flatFile = require('./flat-file');
var func1 = require('./func1');
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var InternalClass = internal.InternalClass;
__export(class1);
__export(class2);
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
exports.Class1 = Class1;
exports.MissingClass1 = MissingClass1;
`
        },
        {
          name: _('/ep/src/class2.js'),
          contents: `
var Class2 = (function() {
  function Class2() {}
  return Class2;
}());
exports.Class2 = Class2;
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
exports.InternalClass =InternalClass;
exports.Class2 = Class2;
`
        },
        {
          name: _('/ep/src/missing-class.js'),
          contents: `
var MissingClass2 = (function() {
  function MissingClass2() {}
  return MissingClass2;
}());
exports. MissingClass2 = MissingClass2;
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
exports.Class1 = Class1;
exports.AliasedClass = SourceClass;
exports.MissingClass1 = MissingClass1;
exports.MissingClass2 = MissingClass2;
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
    });

    describe('CommonJsReflectionHost', () => {
      describe('getDecoratorsOfDeclaration()', () => {
        it('should find the decorators on a class', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
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

        it('should find the decorators on a class at the top level', () => {
          loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const functionNode = getDeclaration(
              bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(functionNode);
          expect(decorators).toBe(null);
        });

        it('should return null if there are no decorators', () => {
          loadTestFiles([SIMPLE_CLASS_FILE]);
          const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode);
          expect(decorators).toBe(null);
        });

        it('should ignore `decorators` if it is not an array literal', () => {
          loadTestFiles([INVALID_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_DECORATORS_FILE.name, 'NotArrayLiteral',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode);
          expect(decorators).toEqual([]);
        });

        it('should ignore decorator elements that are not object literals', () => {
          loadTestFiles([INVALID_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_DECORATORS_FILE.name, 'NotObjectLiteral',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode)!;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
        });

        it('should ignore decorator elements that have no `type` property', () => {
          loadTestFiles([INVALID_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_DECORATORS_FILE.name, 'NotIdentifier',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode)!;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
        });

        describe('(returned decorators `args`)', () => {
          it('should be an empty array if decorator has no `args` property', () => {
            loadTestFiles([INVALID_DECORATOR_ARGS_FILE]);
            const bundle = makeTestBundleProgram(INVALID_DECORATOR_ARGS_FILE.name);
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
        it('should find decorated members on a class', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
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

        it('should find decorated members on a class at the top level', () => {
          loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective',
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

        it('should find non decorated properties on a class', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
              isNamedVariableDeclaration);
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);

          const staticMethod = members.find(member => member.name === 'staticMethod')!;
          expect(staticMethod.kind).toEqual(ClassMemberKind.Method);
          expect(staticMethod.isStatic).toEqual(true);
          expect(ts.isFunctionExpression(staticMethod.implementation!)).toEqual(true);
        });

        it('should find static properties on a class', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);

          const staticProperty = members.find(member => member.name === 'staticProperty')!;
          expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
          expect(staticProperty.isStatic).toEqual(true);
          expect(ts.isPropertyAccessExpression(staticProperty.implementation!)).toEqual(true);
          expect(staticProperty.value!.getText()).toEqual(`'static'`);
        });

        it('should throw if the symbol is not a class', () => {
          loadTestFiles([FOO_FUNCTION_FILE]);
          const bundle = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const functionNode = getDeclaration(
              bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
          expect(() => {
            host.getMembersOfClass(functionNode);
          }).toThrowError(`Attempted to get members of a non-class: "function foo() {}"`);
        });

        it('should return an empty array if there are no prop decorators', () => {
          loadTestFiles([SIMPLE_CLASS_FILE]);
          const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);

          expect(members).toEqual([]);
        });

        it('should not process decorated properties in `propDecorators` if it is not an object literal',
           () => {
             loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
             const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
             const classNode = getDeclaration(
                 bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteral',
                 isNamedVariableDeclaration);
             const members = host.getMembersOfClass(classNode);

             expect(members.map(member => member.name)).not.toContain('prop');
           });

        it('should ignore prop decorator elements that are not object literals', () => {
          loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteralProp',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop')!;
          const decorators = prop.decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
        });

        it('should ignore prop decorator elements that have no `type` property', () => {
          loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NoTypeProperty',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop')!;
          const decorators = prop.decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
        });

        it('should ignore prop decorator elements whose `type` value is not an identifier', () => {
          loadTestFiles([INVALID_PROP_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(INVALID_PROP_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, INVALID_PROP_DECORATORS_FILE.name, 'NotIdentifier',
              isNamedVariableDeclaration);
          const members = host.getMembersOfClass(classNode);
          const prop = members.find(m => m.name === 'prop')!;
          const decorators = prop.decorators!;

          expect(decorators.length).toBe(1);
          expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
        });

        it('should have import information on decorators', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
              isNamedVariableDeclaration);
          const decorators = host.getDecoratorsOfDeclaration(classNode)!;

          expect(decorators.length).toEqual(1);
          expect(decorators[0].import).toEqual({name: 'Directive', from: '@angular/core'});
        });

        describe('(returned prop decorators `args`)', () => {
          it('should be an empty array if prop decorator has no `args` property', () => {
            loadTestFiles([INVALID_PROP_DECORATOR_ARGS_FILE]);
            const bundle = makeTestBundleProgram(INVALID_PROP_DECORATOR_ARGS_FILE.name);
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
                   createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
      });

      describe('getConstructorParameters', () => {
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
          exports.External = Internal;
           `
               },
               {
                 name: _('/main.js'),
                 contents: `
          var shared = require('shared-lib');
          var local = require('./local');
          var SameFile = (function() {
            function SameFile() {
            }
            return SameFile;
          }());
          exports.SameFile = SameFile;

          var SomeClass = (function() {
            function SomeClass(arg1, arg2, arg3) {}
            return SomeClass;
          }());
          SomeClass.ctorParameters = function() { return [{ type: shared.Baz }, { type: local.External }, { type: SameFile }]; };
          exports.SomeClass = SomeClass;
        `,
               },
             ];

             loadTestFiles(files);
             const bundle = makeTestBundleProgram(_('/main.js'));
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
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

        it('should find the decorated constructor parameters at the top level', () => {
          loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
          const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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

        it('should accept `ctorParameters` as an array', () => {
          loadTestFiles([CTOR_DECORATORS_ARRAY_FILE]);
          const bundle = makeTestBundleProgram(CTOR_DECORATORS_ARRAY_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
            const classNode = getDeclaration(
                bundle.program, INVALID_CTOR_DECORATORS_FILE.name, 'NoTypeProperty',
                isNamedVariableDeclaration);
            const parameters = host.getConstructorParameters(classNode);
            const decorators = parameters![0].decorators!;

            expect(decorators.length).toBe(1);
            expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
          });

          it('should ignore param decorator elements whose `type` value is not an identifier',
             () => {
               loadTestFiles([INVALID_CTOR_DECORATORS_FILE]);
               const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATORS_FILE.name);
               const host =
                   createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
            const classNode = getDeclaration(
                bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
                isNamedVariableDeclaration);

            const parameters = host.getConstructorParameters(classNode);
            const decorators = parameters![2].decorators!;

            expect(decorators.length).toEqual(1);
            expect(decorators[0].name).toBe('Inject');
            expect(decorators[0].import).toEqual({name: 'Inject', from: '@angular/core'});
          });
        });

        describe('(returned parameters `decorators.args`)', () => {
          it('should be an empty array if param decorator has no `args` property', () => {
            loadTestFiles([INVALID_CTOR_DECORATOR_ARGS_FILE]);
            const bundle = makeTestBundleProgram(INVALID_CTOR_DECORATOR_ARGS_FILE.name);
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
                   createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
            const host =
                createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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

        function getConstructorParameters(
            constructor: string, mode?: 'inlined'|'inlined_with_suffix'|'imported') {
          let fileHeader = '';

          switch (mode) {
            case 'imported':
              fileHeader = `const tslib = require('tslib');`;
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

                exports.TestClass = TestClass;`,
          };

          loadTestFiles([file]);
          const bundle = makeTestBundleProgram(file.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
                return _super.apply(this, tslib.__spread(arguments)) || this;
              }`,
                'imported');

            expect(parameters).toBeNull();
          });

          it('recognizes delegate super call using imported spreadArray helper', () => {
            const parameters = getConstructorParameters(
                `
              function TestClass() {
                return _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments))) || this;
              }`,
                'imported');

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
                  var _this = _super.apply(this, tslib.__spread(arguments)) || this;
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
                  var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments))) || this;
                  _this.synthesizedProperty = null;
                  return _this;
                }`,
                  'imported');

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
      });

      describe('getDefinitionOfFunction()', () => {
        it('should return an object describing the function declaration passed as an argument',
           () => {
             loadTestFiles([FUNCTION_BODY_FILE]);
             const bundle = makeTestBundleProgram(FUNCTION_BODY_FILE.name);
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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

      describe('getImportOfIdentifier', () => {
        it('should find the import of an identifier', () => {
          loadTestFiles(IMPORTS_FILES);
          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const variableNode =
              getDeclaration(bundle.program, _('/file_b.js'), 'b', isNamedVariableDeclaration);
          const identifier = (variableNode.initializer &&
                              ts.isPropertyAccessExpression(variableNode.initializer) &&
                              ts.isIdentifier(variableNode.initializer.name)) ?
              variableNode.initializer.name :
              null;

          expect(identifier).not.toBe(null);
          const importOfIdent = host.getImportOfIdentifier(identifier!);
          expect(importOfIdent).toEqual({name: 'a', from: './file_a'});
        });

        it('should return null if the identifier was not imported', () => {
          loadTestFiles(IMPORTS_FILES);
          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const variableNode =
              getDeclaration(bundle.program, _('/file_b.js'), 'd', isNamedVariableDeclaration);
          const importOfIdent =
              host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

          expect(importOfIdent).toBeNull();
        });

        it('should handle factory functions not wrapped in parentheses', () => {
          loadTestFiles(IMPORTS_FILES);
          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const variableNode =
              getDeclaration(bundle.program, _('/file_c.js'), 'c', isNamedVariableDeclaration);
          const identifier = (variableNode.initializer &&
                              ts.isPropertyAccessExpression(variableNode.initializer) &&
                              ts.isIdentifier(variableNode.initializer.name)) ?
              variableNode.initializer.name :
              null;

          expect(identifier).not.toBe(null);
          const importOfIdent = host.getImportOfIdentifier(identifier!);
          expect(importOfIdent).toEqual({name: 'a', from: './file_a'});
        });
      });

      describe('getDeclarationOfIdentifier', () => {
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
              isNamedVariableDeclaration);
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

          const expectedDeclaration = getDeclaration(
              bundle.program, PROGRAM_FILE.name, 'AliasedClass', isNamedVariableDeclaration);
          // Grab the `AliasedClass_1` identifier (which is an alias for `AliasedClass`).
          const aliasIdentifier =
              (expectedDeclaration.initializer as ts.BinaryExpression).left as ts.Identifier;
          const actualDeclaration = host.getDeclarationOfIdentifier(aliasIdentifier);

          expect(aliasIdentifier.getText()).toBe('AliasedClass_1');
          expect(actualDeclaration).not.toBe(null);
          expect(actualDeclaration!.node).toBe(expectedDeclaration);
        });

        it('should return the source-file of an import namespace', () => {
          loadFakeCore(getFileSystem());
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const classNode = getDeclaration(
              bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective',
              isNamedVariableDeclaration);
          const classDecorators = host.getDecoratorsOfDeclaration(classNode)!;
          const namespaceIdentifier =
              (((classDecorators[0].node as ts.ObjectLiteralExpression).properties[0] as
                ts.PropertyAssignment)
                   .initializer as ts.PropertyAccessExpression)
                  .expression as ts.Identifier;

          const expectedDeclarationNode =
              getSourceFileOrError(bundle.program, _('/node_modules/@angular/core/index.d.ts'));
          const actualDeclaration = host.getDeclarationOfIdentifier(namespaceIdentifier);
          expect(actualDeclaration).not.toBe(null);
          expect(actualDeclaration!.node).toBe(expectedDeclarationNode);
          expect(actualDeclaration!.viaModule).toBe('@angular/core');
        });

        it('should return viaModule: null for relative imports', () => {
          loadTestFiles([
            {
              name: _('/index.js'),
              contents: `
              const a = require('./a');
              var b = a.b;
            `,
            },
            {
              name: _('/a.js'),
              contents: `
              exports.b = 1;
              `
            }
          ]);

          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const variableNode =
              getDeclaration(bundle.program, _('/index.js'), 'b', isNamedVariableDeclaration);
          const identifier = variableNode.name as ts.Identifier;

          const importOfIdent = host.getDeclarationOfIdentifier(identifier!)!;
          expect(importOfIdent.node).not.toBeNull();
          expect(importOfIdent.viaModule).toBeNull();
        });

        it('should return a viaModule for absolute imports', () => {
          loadTestFiles([
            {
              name: _('/index.js'),
              contents: `
              var a = require('lib');
              var b = a.x;
            `,
            },
            {
              name: _('/node_modules/lib/index.d.ts'),
              contents: 'export declare const x: number;',
            },
          ]);

          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const variableNode =
              getDeclaration(bundle.program, _('/index.js'), 'b', isNamedVariableDeclaration);
          const identifier =
              (variableNode.initializer! as ts.PropertyAccessExpression).name as ts.Identifier;

          const importOfIdent = host.getDeclarationOfIdentifier(identifier!)!;
          expect(importOfIdent.viaModule).toBe('lib');
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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
              var __read = (this && this.__read) || function (o) { /* ... */ }

              var a = __assign({foo: 'bar'}, {baz: 'qux'});
              var b = __spread(['foo', 'bar'], ['baz', 'qux']);
              var c = __spreadArrays(['foo', 'bar'], ['baz', 'qux']);
              var d = __spreadArray(['foo', 'bar'], ['baz', 'qux']);
              var e = __read(['foo', 'bar']);
            `,
          };
          loadTestFiles([file]);
          const bundle = makeTestBundleProgram(file.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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

        it('should recognize imported TypeScript helpers', () => {
          const files: TestFile[] = [
            {
              name: _('/test.js'),
              contents: `
                var tslib_1 = require('tslib');

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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

          const testForHelper =
              (varName: string, helperName: string, knownAs: KnownDeclaration) => {
                const node =
                    getDeclaration(bundle.program, file.name, varName, ts.isVariableDeclaration);
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

          const testForHelper =
              (varName: string, helperName: string, knownAs: KnownDeclaration) => {
                const node =
                    getDeclaration(bundle.program, file.name, varName, ts.isVariableDeclaration);
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
          testForHelper('e', '__read$3', KnownDeclaration.TsHelperRead);
        });

        it('should recognize enum declarations with string values', () => {
          const testFile: TestFile = {
            name: _('/node_modules/test-package/some/file.js'),
            contents: `
          var Enum;
          (function (Enum) {
              Enum["ValueA"] = "1";
              Enum["ValueB"] = "2";
          })(exports.Enum || (exports.Enum = {}));

          var value = Enum;`
          };
          loadTestFiles([testFile]);
          const bundle = makeTestBundleProgram(testFile.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const valueDecl = getDeclaration(
              bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
              ts.isVariableDeclaration);
          const declaration = host.getDeclarationOfIdentifier(
                                  valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

          const enumMembers = (declaration.identity as DownleveledEnum).enumMembers;
          expect(declaration.node.parent.parent.getText()).toBe('var Enum;');
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
          var Enum;
          (function (Enum) {
              Enum[Enum["ValueA"] = "1"] = "ValueA";
              Enum[Enum["ValueB"] = "2"] = "ValueB";
          })(exports.Enum || (exports.Enum = {}));

          var value = Enum;`
          };
          loadTestFiles([testFile]);
          const bundle = makeTestBundleProgram(testFile.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const valueDecl = getDeclaration(
              bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
              ts.isVariableDeclaration);
          const declaration = host.getDeclarationOfIdentifier(
                                  valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

          const enumMembers = (declaration.identity as DownleveledEnum).enumMembers;
          expect(declaration.node.parent.parent.getText()).toBe('var Enum;');
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
          var Enum;
          (function (E) {
              Enum["ValueA"] = "1";
              Enum["ValueB"] = "2";
          })(exports.Enum || (exports.Enum = {}));

          var value = Enum;`
             };
             loadTestFiles([testFile]);
             const bundle = makeTestBundleProgram(testFile.name);
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
             const valueDecl = getDeclaration(
                 bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
                 ts.isVariableDeclaration);
             const declaration = host.getDeclarationOfIdentifier(
                                     valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

             expect(declaration.node.parent.parent.getText()).toBe('var Enum;');
             expect(declaration.identity).toBe(null);
           });

        it('should not consider IIFEs without call argument as an enum declaration', () => {
          const testFile: TestFile = {
            name: _('/node_modules/test-package/some/file.js'),
            contents: `
          var Enum;
          (function (Enum) {
              Enum["ValueA"] = "1";
              Enum["ValueB"] = "2";
          })();

          var value = Enum;`
          };
          loadTestFiles([testFile]);
          const bundle = makeTestBundleProgram(testFile.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const valueDecl = getDeclaration(
              bundle.program, _('/node_modules/test-package/some/file.js'), 'value',
              ts.isVariableDeclaration);
          const declaration = host.getDeclarationOfIdentifier(
                                  valueDecl.initializer as ts.Identifier) as ConcreteDeclaration;

          expect(declaration.node.parent.parent.getText()).toBe('var Enum;');
          expect(declaration.identity).toBe(null);
        });
      });

      describe('getExportsOfModule()', () => {
        it('should return a map of all the exports from a given module', () => {
          loadFakeCore(getFileSystem());
          loadTestFiles(EXPORTS_FILES);
          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const file = getSourceFileOrError(bundle.program, _('/b_module.js'));
          const exportDeclarations = host.getExportsOfModule(file);
          expect(exportDeclarations).not.toBe(null);
          expect(Array.from(exportDeclarations!.entries())
                     .map(entry => [entry[0], entry[1].node!.getText(), entry[1].viaModule]))
              .toEqual([
                ['Directive', `Directive: FnWithArg<(clazz: any) => any>`, '@angular/core'],
                ['a', `a = 'a'`, null],
                ['b', `b = a_module.a`, null],
                ['c', `a = 'a'`, null],
                ['d', `b = a_module.a`, null],
                ['e', `e = 'e'`, null],
                ['DirectiveX', `Directive: FnWithArg<(clazz: any) => any>`, '@angular/core'],
                [
                  'SomeClass',
                  `SomeClass = (function() {\n  function SomeClass() {}\n  return SomeClass;\n}())`,
                  null
                ],
              ]);
        });

        it('should handle wildcard re-exports of other modules (with emitted helpers)', () => {
          loadFakeCore(getFileSystem());
          loadTestFiles(EXPORTS_FILES);
          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const file =
              getSourceFileOrError(bundle.program, _('/wildcard_reexports_emitted_helpers.js'));
          const exportDeclarations = host.getExportsOfModule(file);
          expect(exportDeclarations).not.toBe(null);
          expect(Array.from(exportDeclarations!.entries())
                     .map(entry => [entry[0], entry[1].node!.getText(), entry[1].viaModule]))
              .toEqual([
                ['Directive', `Directive: FnWithArg<(clazz: any) => any>`, '@angular/core'],
                ['a', `a = 'a'`, null],
                ['b', `b = a_module.a`, null],
                ['c', `a = 'a'`, null],
                ['d', `b = a_module.a`, null],
                ['e', `e = 'e'`, null],
                ['DirectiveX', `Directive: FnWithArg<(clazz: any) => any>`, '@angular/core'],
                [
                  'SomeClass',
                  `SomeClass = (function() {\n  function SomeClass() {}\n  return SomeClass;\n}())`,
                  null
                ],
                ['xtra1', `xtra1 = 'xtra1'`, null],
                ['xtra2', `xtra2 = 'xtra2'`, null],
              ]);
        });

        it('should handle wildcard re-exports of other modules (with imported helpers)', () => {
          loadFakeCore(getFileSystem());
          loadTestFiles(EXPORTS_FILES);
          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const file =
              getSourceFileOrError(bundle.program, _('/wildcard_reexports_imported_helpers.js'));
          const exportDeclarations = host.getExportsOfModule(file);
          expect(exportDeclarations).not.toBe(null);
          expect(Array.from(exportDeclarations!.entries())
                     .map(entry => [entry[0], entry[1].node!.getText(), entry[1].viaModule]))
              .toEqual([
                ['Directive', `Directive: FnWithArg<(clazz: any) => any>`, '@angular/core'],
                ['a', `a = 'a'`, null],
                ['b', `b = a_module.a`, null],
                ['c', `a = 'a'`, null],
                ['d', `b = a_module.a`, null],
                ['e', `e = 'e'`, null],
                ['DirectiveX', `Directive: FnWithArg<(clazz: any) => any>`, '@angular/core'],
                [
                  'SomeClass',
                  `SomeClass = (function() {\n  function SomeClass() {}\n  return SomeClass;\n}())`,
                  null
                ],
                ['xtra1', `xtra1 = 'xtra1'`, null],
                ['xtra2', `xtra2 = 'xtra2'`, null],
              ]);
        });

        it('should handle inline exports', () => {
          loadTestFiles([INLINE_EXPORT_FILE]);
          const bundle = makeTestBundleProgram(_('/inline_export.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const file = getSourceFileOrError(bundle.program, _('/inline_export.js'));
          const exportDeclarations = host.getExportsOfModule(file);
          expect(exportDeclarations).not.toBeNull();
          const entries: [string, InlineDeclaration][] =
              Array.from(exportDeclarations!.entries()) as any;
          expect(
              entries.map(
                  ([name, decl]) =>
                      [name, decl.node!.getText(), decl.implementation!.getText(), decl.viaModule]))
              .toEqual([
                ['directives', 'exports.directives', '[foo]', null],
                ['Inline', 'exports.Inline', 'function Inline() {}', null],
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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

        it('should define property exports from a module', () => {
          loadFakeCore(getFileSystem());
          loadTestFiles(EXPORTS_FILES);
          const bundle = makeTestBundleProgram(_('/index.js'));
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const file = getSourceFileOrError(bundle.program, _('/define_property_reexports.js'));
          const exportDeclarations = host.getExportsOfModule(file);
          expect(exportDeclarations).not.toBe(null);
          expect(Array.from(exportDeclarations!.entries())
                     .map(entry => [entry[0], entry[1].node!.getText(), entry[1].viaModule]))
              .toEqual([
                ['newA', `a = 'a'`, null],
              ]);
        });
      });

      describe('getClassSymbol()', () => {
        it('should return the class symbol for an ES2015 class', () => {
          loadTestFiles([SIMPLE_ES2015_CLASS_FILE]);
          const bundle = makeTestBundleProgram(SIMPLE_ES2015_CLASS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
             const outerNode = getDeclaration(
                 bundle.program, SIMPLE_CLASS_FILE.name, 'NoParensClass',
                 isNamedVariableDeclaration);
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
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const node = getDeclaration(
              bundle.program, FOO_FUNCTION_FILE.name, 'foo', isNamedFunctionDeclaration);
          const classSymbol = host.getClassSymbol(node);

          expect(classSymbol).toBeUndefined();
        });

        it('should return undefined if variable declaration is not initialized using an IIFE',
           () => {
             const testFile = {
               name: _('/test.js'),
               contents: `var MyClass = null;`,
             };
             loadTestFiles([testFile]);
             const bundle = makeTestBundleProgram(testFile.name);
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
             const node = getDeclaration(
                 bundle.program, testFile.name, 'MyClass', isNamedVariableDeclaration);
             const classSymbol = host.getClassSymbol(node);

             expect(classSymbol).toBeUndefined();
           });
      });

      describe('isClass()', () => {
        it('should return true if a given node is a TS class declaration', () => {
          loadTestFiles([SIMPLE_ES2015_CLASS_FILE]);
          const bundle = makeTestBundleProgram(SIMPLE_ES2015_CLASS_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const node = getDeclaration(
              bundle.program, SIMPLE_ES2015_CLASS_FILE.name, 'EmptyClass', isNamedClassDeclaration);
          expect(host.isClass(node)).toBe(true);
        });

        it('should return true if a given node is the outer variable declaration of a class',
           () => {
             loadTestFiles([SIMPLE_CLASS_FILE]);
             const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
             const node = getDeclaration(
                 bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
             expect(host.isClass(node)).toBe(true);
           });

        it('should return true if a given node is the inner variable declaration of a class',
           () => {
             loadTestFiles([SIMPLE_CLASS_FILE]);
             const bundle = makeTestBundleProgram(SIMPLE_CLASS_FILE.name);
             const host =
                 createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
             const outerNode = getDeclaration(
                 bundle.program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
             const innerNode = (getIifeBody(outerNode.initializer!) as ts.Block)
                                   .statements.find(isNamedFunctionDeclaration)!;
             expect(host.isClass(innerNode)).toBe(true);
           });

        it('should return false if a given node is a function declaration', () => {
          loadTestFiles([FOO_FUNCTION_FILE]);
          const bundle = makeTestBundleProgram(FOO_FUNCTION_FILE.name);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));
          const primaryFile = getSourceFileOrError(bundle.program, DECORATED_FILES[0].name);
          const secondaryFile = getSourceFileOrError(bundle.program, DECORATED_FILES[1].name);

          const classSymbolsPrimary = host.findClassSymbols(primaryFile);
          const classDecoratorsPrimary =
              classSymbolsPrimary.map(s => host.getDecoratorsOfSymbol(s));
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
             const host = createHost(
                 bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));

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
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));
          const dtsDeclaration = host.getDtsDeclaration(mooFn);
          expect(dtsDeclaration!.getSourceFile().fileName).toEqual(_('/ep/typings/func1.d.ts'));
        });

        it('should return null if there is no matching class in the matching dts file', () => {
          loadTestFiles(TYPINGS_SRC_FILES);
          loadTestFiles(TYPINGS_DTS_FILES);
          const bundle = makeTestBundleProgram(_('/ep/src/index.js'));
          const dts = makeTestDtsBundleProgram(_('/ep/typings/index.d.ts'), _('/'));
          const missingClass = getDeclaration(
              bundle.program, _('/ep/src/class1.js'), 'MissingClass1', ts.isVariableDeclaration);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));

          expect(host.getDtsDeclaration(missingClass)).toBe(null);
        });

        it('should return null if there is no matching dts file', () => {
          loadTestFiles(TYPINGS_SRC_FILES);
          loadTestFiles(TYPINGS_DTS_FILES);
          const bundle = makeTestBundleProgram(_('/ep/src/index.js'));
          const dts = makeTestDtsBundleProgram(_('/ep/typings/index.d.ts'), _('/'));
          const missingClass = getDeclaration(
              bundle.program, _('/ep/src/missing-class.js'), 'MissingClass2',
              ts.isVariableDeclaration);
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));

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
             const host = createHost(
                 bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));

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
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));

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
                 bundle.program, _('/ep/src/internal.js'), 'InternalClass',
                 ts.isVariableDeclaration);
             const host = createHost(
                 bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));

             const dtsDeclaration = host.getDtsDeclaration(internalClass);
             expect(dtsDeclaration!.getSourceFile().fileName)
                 .toEqual(_('/ep/typings/internal.d.ts'));
           });

        it('should match publicly and internal exported classes correctly, even if they have the same name',
           () => {
             loadTestFiles(TYPINGS_SRC_FILES);
             loadTestFiles(TYPINGS_DTS_FILES);
             const bundle = makeTestBundleProgram(getRootFiles(TYPINGS_SRC_FILES)[0]);
             const dts = makeTestDtsBundleProgram(getRootFiles(TYPINGS_DTS_FILES)[0], _('/ep'));
             const host = createHost(
                 bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle, dts));

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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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
          const host =
              createHost(bundle, new CommonJsReflectionHost(new MockLogger(), false, bundle));

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
    });
  });
});
