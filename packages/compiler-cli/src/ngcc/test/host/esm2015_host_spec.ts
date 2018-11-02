/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassMemberKind, Import} from '../../../ngtsc/host';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {getDeclaration, makeProgram} from '../helpers/utils';

const SOME_DIRECTIVE_FILE = {
  name: '/some_directive.js',
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

const SIMPLE_CLASS_FILE = {
  name: '/simple_class.js',
  contents: `
    class EmptyClass {}
    class NoDecoratorConstructorClass {
      constructor(foo) {}
    }
  `,
};

const FOO_FUNCTION_FILE = {
  name: '/foo_function.js',
  contents: `
    import { Directive } from '@angular/core';

    function foo() {}
    foo.decorators = [
      { type: Directive, args: [{ selector: '[ignored]' },] }
    ];
  `,
};

const INVALID_DECORATORS_FILE = {
  name: '/invalid_decorators.js',
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

const INVALID_DECORATOR_ARGS_FILE = {
  name: '/invalid_decorator_args.js',
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

const INVALID_PROP_DECORATORS_FILE = {
  name: '/invalid_prop_decorators.js',
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

const INVALID_PROP_DECORATOR_ARGS_FILE = {
  name: '/invalid_prop_decorator_args.js',
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

const INVALID_CTOR_DECORATORS_FILE = {
  name: '/invalid_ctor_decorators.js',
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

const INVALID_CTOR_DECORATOR_ARGS_FILE = {
  name: '/invalid_ctor_decorator_args.js',
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

const IMPORTS_FILES = [
  {
    name: '/a.js',
    contents: `
      export const a = 'a';
    `,
  },
  {
    name: '/b.js',
    contents: `
      import {a} from './a.js';
      import {a as foo} from './a.js';

      const b = a;
      const c = foo;
      const d = b;
    `,
  },
];

const EXPORTS_FILES = [
  {
    name: '/a.js',
    contents: `
      export const a = 'a';
    `,
  },
  {
    name: '/b.js',
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

const FUNCTION_BODY_FILE = {
  name: '/function_body.js',
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

const MARKER_FILE = {
  name: '/marker.js',
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

const DECORATED_FILES = [
  {
    name: '/primary.js',
    contents: `
    import {Directive} from '@angular/core';
    import {D} from '/secondary';
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
    name: '/secondary.js',
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

const ARITY_CLASSES = [
  {
    name: '/src/class.js',
    contents: `
      export class NoTypeParam {}
      export class OneTypeParam {}
      export class TwoTypeParams {}
    `,
  },
  {
    name: '/typings/class.d.ts',
    contents: `
      export declare class NoTypeParam {}
      export declare class OneTypeParam<T> {}
      export declare class TwoTypeParams<T, K> {}
    `,
  },
];

const TYPINGS_SRC_FILES = [
  {name: '/src/index.js', contents: `export * from './class1'; export * from './class2';`},
  {name: '/src/class1.js', contents: 'export class Class1 {}\nexport class MissingClass1 {}'},
  {name: '/src/class2.js', contents: 'export class Class2 {}'},
  {name: '/src/missing-class.js', contents: 'export class MissingClass2 {}'}, {
    name: '/src/flat-file.js',
    contents:
        'export class Class1 {}\nexport class MissingClass1 {}\nexport class MissingClass2 {}\class Class3 {}\nexport {Class3 as xClass3};',
  }
];

const TYPINGS_DTS_FILES = [
  {name: '/typings/index.d.ts', contents: `export * from './class1'; export * from './class2';`},
  {
    name: '/typings/class1.d.ts',
    contents: `export declare class Class1 {}\nexport declare class OtherClass {}`
  },
  {
    name: '/typings/class2.d.ts',
    contents:
        `export declare class Class2 {}\nexport declare interface SomeInterface {}\nexport {Class3 as xClass3} from './class3';`
  },
  {name: '/typings/class3.d.ts', contents: `export declare class Class3 {}`},
];

describe('Fesm2015ReflectionHost', () => {

  describe('getDecoratorsOfDeclaration()', () => {
    it('should find the decorators on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
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
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(functionNode);
      expect(decorators).toBe(null);
    });

    it('should return null if there are no decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode);
      expect(decorators).toBe(null);
    });

    it('should ignore `decorators` if it is not an array literal', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotArrayLiteral', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode);
      expect(decorators).toEqual([]);
    });

    it('should ignore decorator elements that are not object literals', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotObjectLiteral', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
    });

    it('should ignore decorator elements that have no `type` property', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NoTypeProperty', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
    });

    it('should ignore decorator elements whose `type` value is not an identifier', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotIdentifier', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
    });

    it('should use `getImportOfIdentifier()` to retrieve import info', () => {
      const mockImportInfo = { from: '@angular/core' } as Import;
      const spy = spyOn(Esm2015ReflectionHost.prototype, 'getImportOfIdentifier')
                      .and.returnValue(mockImportInfo);

      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toEqual(1);
      expect(decorators[0].import).toBe(mockImportInfo);

      const typeIdentifier = spy.calls.mostRecent().args[0] as ts.Identifier;
      expect(typeIdentifier.text).toBe('Directive');
    });

    describe('(returned decorators `args`)', () => {
      it('should be an empty array if decorator has no `args` property', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NoArgsProperty', ts.isClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral', ts.isClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[0].args).toEqual([]);
      });
    });
  });

  describe('getMembersOfClass()', () => {
    it('should find decorated properties on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);

      const input1 = members.find(member => member.name === 'input1') !;
      expect(input1.kind).toEqual(ClassMemberKind.Property);
      expect(input1.isStatic).toEqual(false);
      expect(input1.decorators !.map(d => d.name)).toEqual(['Input']);

      const input2 = members.find(member => member.name === 'input2') !;
      expect(input2.kind).toEqual(ClassMemberKind.Property);
      expect(input2.isStatic).toEqual(false);
      expect(input1.decorators !.map(d => d.name)).toEqual(['Input']);
    });

    it('should find non decorated properties on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);

      const instanceProperty = members.find(member => member.name === 'instanceProperty') !;
      expect(instanceProperty.kind).toEqual(ClassMemberKind.Property);
      expect(instanceProperty.isStatic).toEqual(false);
      expect(ts.isBinaryExpression(instanceProperty.implementation !)).toEqual(true);
      expect(instanceProperty.value !.getText()).toEqual(`'instance'`);
    });

    it('should find static methods on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);

      const staticMethod = members.find(member => member.name === 'staticMethod') !;
      expect(staticMethod.kind).toEqual(ClassMemberKind.Method);
      expect(staticMethod.isStatic).toEqual(true);
      expect(ts.isMethodDeclaration(staticMethod.implementation !)).toEqual(true);
    });

    it('should find static properties on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);

      const staticProperty = members.find(member => member.name === 'staticProperty') !;
      expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
      expect(staticProperty.isStatic).toEqual(true);
      expect(ts.isPropertyAccessExpression(staticProperty.implementation !)).toEqual(true);
      expect(staticProperty.value !.getText()).toEqual(`'static'`);
    });

    it('should throw if the symbol is not a class', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(() => {
        host.getMembersOfClass(functionNode);
      }).toThrowError(`Attempted to get members of a non-class: "function foo() {}"`);
    });

    it('should return an empty array if there are no prop decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);

      expect(members).toEqual([]);
    });

    it('should not process decorated properties in `propDecorators` if it is not an object literal',
       () => {
         const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
         const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
         const classNode = getDeclaration(
             program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteral', ts.isClassDeclaration);
         const members = host.getMembersOfClass(classNode);

         expect(members.map(member => member.name)).not.toContain('prop');
       });

    it('should ignore prop decorator elements that are not object literals', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteralProp',
          ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
    });

    it('should ignore prop decorator elements that have no `type` property', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NoTypeProperty', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
    });

    it('should ignore prop decorator elements whose `type` value is not an identifier', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NotIdentifier', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
    });

    it('should use `getImportOfIdentifier()` to retrieve import info', () => {
      let callCount = 0;
      const spy =
          spyOn(Esm2015ReflectionHost.prototype, 'getImportOfIdentifier').and.callFake(() => {
            callCount++;
            return {name: `name${callCount}`, from: '@angular/core'};
          });

      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.allArgs().map(arg => arg[0].getText())).toEqual([
        'Input',
        'Input',
        'HostBinding',
        'Input',
        'HostListener',
      ]);

      const member = members.find(member => member.name === 'input1') !;
      expect(member.decorators !.length).toBe(1);
      expect(member.decorators ![0].import).toEqual({name: 'name1', from: '@angular/core'});
    });

    describe('(returned prop decorators `args`)', () => {
      it('should be an empty array if prop decorator has no `args` property', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
            ts.isClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Input');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if prop decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Input');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
            ts.isClassDeclaration);
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
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode) !;

      expect(parameters).toBeDefined();
      expect(parameters.map(parameter => parameter.name)).toEqual([
        '_viewContainer', '_template', 'injected'
      ]);
      expect(parameters.map(parameter => parameter.type !.getText())).toEqual([
        'ViewContainerRef', 'TemplateRef', 'undefined'
      ]);
    });

    it('should throw if the symbol is not a class', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(() => { host.getConstructorParameters(functionNode); })
          .toThrowError(
              'Attempted to get constructor parameters of a non-class: "function foo() {}"');
    });

    it('should return `null` if there is no constructor', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);
      expect(parameters).toBe(null);
    });

    it('should return an array even if there are no decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SIMPLE_CLASS_FILE.name, 'NoDecoratorConstructorClass', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode) !;

      expect(parameters).toEqual(jasmine.any(Array));
      expect(parameters.length).toEqual(1);
      expect(parameters[0].name).toEqual('foo');
      expect(parameters[0].decorators).toBe(null);
    });

    it('should return an empty array if there are no constructor parameters', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NoParameters', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters).toEqual([]);
    });

    it('should ignore decorators that are not imported from core', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NotFromCore', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode) !;

      expect(parameters.length).toBe(1);
      expect(parameters[0]).toEqual(jasmine.objectContaining({
        name: 'arg1',
        decorators: [],
      }));
    });

    it('should ignore `ctorParameters` if it is not an arrow function', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrowFunction', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode) !;

      expect(parameters.length).toBe(1);
      expect(parameters[0]).toEqual(jasmine.objectContaining({
        name: 'arg1',
        decorators: null,
      }));
    });

    it('should ignore `ctorParameters` if it does not return an array literal', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrayLiteral', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode) !;

      expect(parameters.length).toBe(1);
      expect(parameters[0]).toEqual(jasmine.objectContaining({
        name: 'arg1',
        decorators: null,
      }));
    });

    describe('(returned parameters `decorators`)', () => {
      it('should ignore param decorator elements that are not object literals', () => {
        const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotObjectLiteral', ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);

        expect(parameters !.length).toBe(2);
        expect(parameters ![0]).toEqual(jasmine.objectContaining({
          name: 'arg1',
          decorators: null,
        }));
        expect(parameters ![1]).toEqual(jasmine.objectContaining({
          name: 'arg2',
          decorators: jasmine.any(Array) as any
        }));
      });

      it('should ignore param decorator elements that have no `type` property', () => {
        const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NoTypeProperty', ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
      });

      it('should ignore param decorator elements whose `type` value is not an identifier', () => {
        const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotIdentifier', ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
      });

      it('should use `getImportOfIdentifier()` to retrieve import info', () => {
        const mockImportInfo: Import = {name: 'mock', from: '@angular/core'};
        const spy = spyOn(Esm2015ReflectionHost.prototype, 'getImportOfIdentifier')
                        .and.returnValue(mockImportInfo);

        const program = makeProgram(SOME_DIRECTIVE_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode) !;
        const decorators = parameters[2].decorators !;

        expect(decorators.length).toEqual(1);
        expect(decorators[0].import).toBe(mockImportInfo);

        const typeIdentifier = spy.calls.mostRecent().args[0] as ts.Identifier;
        expect(typeIdentifier.text).toBe('Inject');
      });
    });

    describe('(returned parameters `decorators.args`)', () => {
      it('should be an empty array if param decorator has no `args` property', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
            ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        expect(parameters !.length).toBe(1);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Inject');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if param decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Inject');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
            ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Inject');
        expect(decorators[0].args).toEqual([]);
      });
    });
  });

  describe('getDefinitionOfFunction()', () => {
    it('should return an object describing the function declaration passed as an argument', () => {
      const program = makeProgram(FUNCTION_BODY_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());

      const fooNode =
          getDeclaration(program, FUNCTION_BODY_FILE.name, 'foo', ts.isFunctionDeclaration) !;
      const fooDef = host.getDefinitionOfFunction(fooNode);
      expect(fooDef.node).toBe(fooNode);
      expect(fooDef.body !.length).toEqual(1);
      expect(fooDef.body ![0].getText()).toEqual(`return x;`);
      expect(fooDef.parameters.length).toEqual(1);
      expect(fooDef.parameters[0].name).toEqual('x');
      expect(fooDef.parameters[0].initializer).toBe(null);

      const barNode =
          getDeclaration(program, FUNCTION_BODY_FILE.name, 'bar', ts.isFunctionDeclaration) !;
      const barDef = host.getDefinitionOfFunction(barNode);
      expect(barDef.node).toBe(barNode);
      expect(barDef.body !.length).toEqual(1);
      expect(ts.isReturnStatement(barDef.body ![0])).toBeTruthy();
      expect(barDef.body ![0].getText()).toEqual(`return x + y;`);
      expect(barDef.parameters.length).toEqual(2);
      expect(barDef.parameters[0].name).toEqual('x');
      expect(fooDef.parameters[0].initializer).toBe(null);
      expect(barDef.parameters[1].name).toEqual('y');
      expect(barDef.parameters[1].initializer !.getText()).toEqual('42');

      const bazNode =
          getDeclaration(program, FUNCTION_BODY_FILE.name, 'baz', ts.isFunctionDeclaration) !;
      const bazDef = host.getDefinitionOfFunction(bazNode);
      expect(bazDef.node).toBe(bazNode);
      expect(bazDef.body !.length).toEqual(3);
      expect(bazDef.parameters.length).toEqual(1);
      expect(bazDef.parameters[0].name).toEqual('x');
      expect(bazDef.parameters[0].initializer).toBe(null);

      const quxNode =
          getDeclaration(program, FUNCTION_BODY_FILE.name, 'qux', ts.isFunctionDeclaration) !;
      const quxDef = host.getDefinitionOfFunction(quxNode);
      expect(quxDef.node).toBe(quxNode);
      expect(quxDef.body !.length).toEqual(2);
      expect(quxDef.parameters.length).toEqual(1);
      expect(quxDef.parameters[0].name).toEqual('x');
      expect(quxDef.parameters[0].initializer).toBe(null);

      const mooNode =
          getDeclaration(program, FUNCTION_BODY_FILE.name, 'moo', ts.isFunctionDeclaration) !;
      const mooDef = host.getDefinitionOfFunction(mooNode);
      expect(mooDef.node).toBe(mooNode);
      expect(mooDef.body !.length).toEqual(3);
      expect(mooDef.parameters).toEqual([]);

      const juuNode =
          getDeclaration(program, FUNCTION_BODY_FILE.name, 'juu', ts.isFunctionDeclaration) !;
      const juuDef = host.getDefinitionOfFunction(juuNode);
      expect(juuDef.node).toBe(juuNode);
      expect(juuDef.body !.length).toEqual(2);
      expect(juuDef.parameters).toEqual([]);
    });
  });

  describe('getImportOfIdentifier()', () => {
    it('should find the import of an identifier', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'b', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
    });

    it('should find the name by which the identifier was exported, not imported', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'c', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
    });

    it('should return null if the identifier was not imported', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'd', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toBeNull();
    });
  });

  describe('getDeclarationOfIdentifier()', () => {
    it('should return the declaration of a locally defined identifier', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const ctrDecorators = host.getConstructorParameters(classNode) !;
      const identifierOfViewContainerRef = ctrDecorators[0].type !as ts.Identifier;

      const expectedDeclarationNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'ViewContainerRef', ts.isVariableDeclaration);
      const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfViewContainerRef);
      expect(actualDeclaration).not.toBe(null);
      expect(actualDeclaration !.node).toBe(expectedDeclarationNode);
      expect(actualDeclaration !.viaModule).toBe(null);
    });

    it('should return the declaration of an externally defined identifier', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const classDecorators = host.getDecoratorsOfDeclaration(classNode) !;
      const identifierOfDirective = ((classDecorators[0].node as ts.ObjectLiteralExpression)
                                         .properties[0] as ts.PropertyAssignment)
                                        .initializer as ts.Identifier;

      const expectedDeclarationNode = getDeclaration(
          program, 'node_modules/@angular/core/index.ts', 'Directive', ts.isVariableDeclaration);
      const actualDeclaration = host.getDeclarationOfIdentifier(identifierOfDirective);
      expect(actualDeclaration).not.toBe(null);
      expect(actualDeclaration !.node).toBe(expectedDeclarationNode);
      expect(actualDeclaration !.viaModule).toBe('@angular/core');
    });
  });

  describe('getExportsOfModule()', () => {
    it('should return a map of all the exports from a given module', () => {
      const program = makeProgram(...EXPORTS_FILES);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const file = program.getSourceFile(EXPORTS_FILES[1].name) !;
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
        // TODO clarify what is expected here...
        // [`Directive = callableClassDecorator()`, '@angular/core'],
        [`Directive = callableClassDecorator()`, null],
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
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const node =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      expect(host.isClass(node)).toBe(true);
    });

    it('should return false if a given node is a TS function declaration', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const node = getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(host.isClass(node)).toBe(false);
    });
  });

  describe('getGenericArityOfClass()', () => {
    it('should properly count type parameters', () => {
      const dtsProgram = makeProgram(ARITY_CLASSES[1]);
      const program = makeProgram(ARITY_CLASSES[0]);
      const host = new Esm2015ReflectionHost(
          false, program.getTypeChecker(), ARITY_CLASSES[1].name, dtsProgram);
      const noTypeParamClass =
          getDeclaration(program, '/src/class.js', 'NoTypeParam', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(noTypeParamClass)).toBe(0);
      const oneTypeParamClass =
          getDeclaration(program, '/src/class.js', 'OneTypeParam', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(oneTypeParamClass)).toBe(1);
      const twoTypeParamsClass =
          getDeclaration(program, '/src/class.js', 'TwoTypeParams', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(twoTypeParamsClass)).toBe(2);
    });
  });

  describe('getSwitchableDeclarations()', () => {
    it('should return a collection of all the switchable variable declarations in the given module',
       () => {
         const program = makeProgram(MARKER_FILE);
         const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
         const file = program.getSourceFile(MARKER_FILE.name) !;
         const declarations = host.getSwitchableDeclarations(file);
         expect(declarations.map(d => [d.name.getText(), d.initializer !.getText()])).toEqual([
           ['compileNgModuleFactory', 'compileNgModuleFactory__PRE_R3__']
         ]);
       });
  });

  describe('findDecoratedClasses()', () => {
    it('should return an array of all decorated classes in the given source file', () => {
      const program = makeProgram(...DECORATED_FILES);
      const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const primaryFile = program.getSourceFile(DECORATED_FILES[0].name) !;
      const secondaryFile = program.getSourceFile(DECORATED_FILES[1].name) !;

      const primaryDecoratedClasses = host.findDecoratedClasses(primaryFile);
      expect(primaryDecoratedClasses.length).toEqual(2);
      const classA = primaryDecoratedClasses.find(c => c.name === 'A') !;
      expect(ts.isClassDeclaration(classA.declaration)).toBeTruthy();
      expect(classA.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
      // Note that `B` is not exported from `primary.js`
      const classB = primaryDecoratedClasses.find(c => c.name === 'B') !;
      expect(ts.isClassDeclaration(classB.declaration)).toBeTruthy();
      expect(classA.decorators.map(decorator => decorator.name)).toEqual(['Directive']);

      const secondaryDecoratedClasses = host.findDecoratedClasses(secondaryFile) !;
      expect(secondaryDecoratedClasses.length).toEqual(1);
      // Note that `D` is exported from `secondary.js` but not exported from `primary.js`
      const classD = secondaryDecoratedClasses.find(c => c.name === 'D') !;
      expect(classD.name).toEqual('D');
      expect(ts.isClassDeclaration(classD.declaration)).toBeTruthy();
      expect(classD.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
    });
  });

  describe('getDtsDeclarationsOfClass()', () => {
    it('should find the dts declaration that has the same relative path to the source file', () => {
      const srcProgram = makeProgram(...TYPINGS_SRC_FILES);
      const dtsProgram = makeProgram(...TYPINGS_DTS_FILES);
      const class1 = getDeclaration(srcProgram, '/src/class1.js', 'Class1', ts.isClassDeclaration);
      const host = new Esm2015ReflectionHost(
          false, srcProgram.getTypeChecker(), TYPINGS_DTS_FILES[0].name, dtsProgram);

      const dtsDeclaration = host.getDtsDeclarationOfClass(class1);
      expect(dtsDeclaration !.getSourceFile().fileName).toEqual('/typings/class1.d.ts');
    });

    it('should throw an error if there is no matching class in the matching dts file', () => {
      const srcProgram = makeProgram(...TYPINGS_SRC_FILES);
      const dtsProgram = makeProgram(...TYPINGS_DTS_FILES);
      const missingClass =
          getDeclaration(srcProgram, '/src/class1.js', 'MissingClass1', ts.isClassDeclaration);
      const host = new Esm2015ReflectionHost(
          false, srcProgram.getTypeChecker(), TYPINGS_DTS_FILES[0].name, dtsProgram);

      expect(() => host.getDtsDeclarationOfClass(missingClass))
          .toThrowError(
              'Unable to find matching typings (.d.ts) declaration for MissingClass1 in /src/class1.js');
    });

    it('should throw an error if there is no matching dts file', () => {
      const srcProgram = makeProgram(...TYPINGS_SRC_FILES);
      const dtsProgram = makeProgram(...TYPINGS_DTS_FILES);
      const missingClass = getDeclaration(
          srcProgram, '/src/missing-class.js', 'MissingClass2', ts.isClassDeclaration);
      const host = new Esm2015ReflectionHost(
          false, srcProgram.getTypeChecker(), TYPINGS_DTS_FILES[0].name, dtsProgram);

      expect(() => host.getDtsDeclarationOfClass(missingClass))
          .toThrowError(
              'Unable to find matching typings (.d.ts) declaration for MissingClass2 in /src/missing-class.js');
    });

    it('should find the dts file that contains a matching class declaration, even if the source files do not match',
       () => {
         const srcProgram = makeProgram(...TYPINGS_SRC_FILES);
         const dtsProgram = makeProgram(...TYPINGS_DTS_FILES);
         const class1 =
             getDeclaration(srcProgram, '/src/flat-file.js', 'Class1', ts.isClassDeclaration);
         const host = new Esm2015ReflectionHost(
             false, srcProgram.getTypeChecker(), TYPINGS_DTS_FILES[0].name, dtsProgram);

         const dtsDeclaration = host.getDtsDeclarationOfClass(class1);
         expect(dtsDeclaration !.getSourceFile().fileName).toEqual('/typings/class1.d.ts');
       });

    it('should find aliased exports', () => {
      const srcProgram = makeProgram(...TYPINGS_SRC_FILES);
      const dtsProgram = makeProgram(...TYPINGS_DTS_FILES);
      const class3 =
          getDeclaration(srcProgram, '/src/flat-file.js', 'Class3', ts.isClassDeclaration);
      const host = new Esm2015ReflectionHost(
          false, srcProgram.getTypeChecker(), TYPINGS_DTS_FILES[0].name, dtsProgram);

      const dtsDeclaration = host.getDtsDeclarationOfClass(class3);
      expect(dtsDeclaration !.getSourceFile().fileName).toEqual('/typings/class3.d.ts');
    });
  });

});
