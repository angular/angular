/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassMemberKind, Import} from '../../../ngtsc/host';
import {Fesm2015ReflectionHost} from '../../src/host/fesm2015_host';
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
    const NotArrayLiteralDecorator = {};
    class NotArrayLiteral {
    }
    NotArrayLiteral.decorators = () => [
      { type: NotArrayLiteralDecorator, args: [{ selector: '[ignored]' },] },
    ];

    const NotObjectLiteralDecorator = {};
    class NotObjectLiteral {
    }
    NotObjectLiteral.decorators = [
      "This is not an object literal",
      { type: NotObjectLiteralDecorator },
    ];

    const NoTypePropertyDecorator1 = {};
    const NoTypePropertyDecorator2 = {};
    class NoTypeProperty {
    }
    NoTypeProperty.decorators = [
      { notType: NoTypePropertyDecorator1 },
      { type: NoTypePropertyDecorator2 },
    ];

    const NotIdentifierDecorator = {};
    class NotIdentifier {
    }
    NotIdentifier.decorators = [
      { type: 'StringsLiteralsAreNotIdentifiers' },
      { type: NotIdentifierDecorator },
    ];
  `,
};

const INVALID_DECORATOR_ARGS_FILE = {
  name: '/invalid_decorator_args.js',
  contents: `
    const NoArgsPropertyDecorator = {};
    class NoArgsProperty {
    }
    NoArgsProperty.decorators = [
      { type: NoArgsPropertyDecorator },
    ];

    const NoPropertyAssignmentDecorator = {};
    const args = [{ selector: '[ignored]' },];
    class NoPropertyAssignment {
    }
    NoPropertyAssignment.decorators = [
      { type: NoPropertyAssignmentDecorator, args },
    ];

    const NotArrayLiteralDecorator = {};
    class NotArrayLiteral {
    }
    NotArrayLiteral.decorators = [
      { type: NotArrayLiteralDecorator, args: () => [{ selector: '[ignored]' },] },
    ];
  `,
};

const INVALID_PROP_DECORATORS_FILE = {
  name: '/invalid_prop_decorators.js',
  contents: `
    const NotObjectLiteralDecorator = {};
    class NotObjectLiteral {
    }
    NotObjectLiteral.propDecorators = () => ({
      "prop": [{ type: NotObjectLiteralDecorator },]
    });

    const NotObjectLiteralPropDecorator = {};
    class NotObjectLiteralProp {
    }
    NotObjectLiteralProp.propDecorators = {
      "prop": [
        "This is not an object literal",
        { type: NotObjectLiteralPropDecorator },
      ]
    };

    const NoTypePropertyDecorator1 = {};
    const NoTypePropertyDecorator2 = {};
    class NoTypeProperty {
    }
    NoTypeProperty.propDecorators = {
      "prop": [
        { notType: NoTypePropertyDecorator1 },
        { type: NoTypePropertyDecorator2 },
      ]
    };

    const NotIdentifierDecorator = {};
    class NotIdentifier {
    }
    NotIdentifier.propDecorators = {
      "prop": [
        { type: 'StringsLiteralsAreNotIdentifiers' },
        { type: NotIdentifierDecorator },
      ]
    };
  `,
};

const INVALID_PROP_DECORATOR_ARGS_FILE = {
  name: '/invalid_prop_decorator_args.js',
  contents: `
    const NoArgsPropertyDecorator = {};
    class NoArgsProperty {
    }
    NoArgsProperty.propDecorators = {
      "prop": [{ type: NoArgsPropertyDecorator },]
    };

    const NoPropertyAssignmentDecorator = {};
    const args = [{ selector: '[ignored]' },];
    class NoPropertyAssignment {
    }
    NoPropertyAssignment.propDecorators = {
      "prop": [{ type: NoPropertyAssignmentDecorator, args },]
    };

    const NotArrayLiteralDecorator = {};
    class NotArrayLiteral {
    }
    NotArrayLiteral.propDecorators = {
      "prop": [{ type: NotArrayLiteralDecorator, args: () => [{ selector: '[ignored]' },] },],
    };
  `,
};

const INVALID_CTOR_DECORATORS_FILE = {
  name: '/invalid_ctor_decorators.js',
  contents: `
    const NoParametersDecorator = {};
    class NoParameters {
      constructor() {
      }
    }

    const NotArrowFunctionDecorator = {};
    class NotArrowFunction {
      constructor(arg1) {
      }
    }
    NotArrowFunction.ctorParameters = function() {
      return { type: 'ParamType', decorators: [{ type: NotArrowFunctionDecorator },] };
    };

    const NotArrayLiteralDecorator = {};
    class NotArrayLiteral {
      constructor(arg1) {
      }
    }
    NotArrayLiteral.ctorParameters = () => 'StringsAreNotArrayLiterals';

    const NotObjectLiteralDecorator = {};
    class NotObjectLiteral {
      constructor(arg1, arg2) {
      }
    }
    NotObjectLiteral.ctorParameters = () => [
      "This is not an object literal",
      { type: 'ParamType', decorators: [{ type: NotObjectLiteralDecorator },] },
    ];

    const NoTypePropertyDecorator1 = {};
    const NoTypePropertyDecorator2 = {};
    class NoTypeProperty {
      constructor(arg1, arg2) {
      }
    }
    NoTypeProperty.ctorParameters = () => [
      {
        type: 'ParamType',
        decorators: [
          { notType: NoTypePropertyDecorator1 },
          { type: NoTypePropertyDecorator2 },
        ]
      },
    ];

    const NotIdentifierDecorator = {};
    class NotIdentifier {
      constructor(arg1, arg2) {
      }
    }
    NotIdentifier.ctorParameters = () => [
      {
        type: 'ParamType',
        decorators: [
          { type: 'StringsLiteralsAreNotIdentifiers' },
          { type: NotIdentifierDecorator },
        ]
      },
    ];
  `,
};

const INVALID_CTOR_DECORATOR_ARGS_FILE = {
  name: '/invalid_ctor_decorator_args.js',
  contents: `
    const NoArgsPropertyDecorator = {};
    class NoArgsProperty {
      constructor(arg1) {
      }
    }
    NoArgsProperty.ctorParameters = () => [
      { type: 'ParamType', decorators: [{ type: NoArgsPropertyDecorator },] },
    ];

    const NoPropertyAssignmentDecorator = {};
    const args = [{ selector: '[ignored]' },];
    class NoPropertyAssignment {
      constructor(arg1) {
      }
    }
    NoPropertyAssignment.ctorParameters = () => [
      { type: 'ParamType', decorators: [{ type: NoPropertyAssignmentDecorator, args },] },
    ];

    const NotArrayLiteralDecorator = {};
    class NotArrayLiteral {
      constructor(arg1) {
      }
    }
    NotArrayLiteral.ctorParameters = () => [
      { type: 'ParamType', decorators: [{ type: NotArrayLiteralDecorator, args: () => [{ selector: '[ignored]' },] },] },
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

describe('Fesm2015ReflectionHost', () => {

  describe('getDecoratorsOfDeclaration()', () => {
    it('should find the decorators on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(functionNode);
      expect(decorators).toBe(null);
    });

    it('should return null if there are no decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode);
      expect(decorators).toBe(null);
    });

    it('should ignore `decorators` if it is not an array literal', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotArrayLiteral', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode);
      expect(decorators).toEqual([]);
    });

    it('should ignore decorator elements that are not object literals', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotObjectLiteral', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'NotObjectLiteralDecorator'}));
    });

    it('should ignore decorator elements that have no `type` property', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NoTypeProperty', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'NoTypePropertyDecorator2'}));
    });

    it('should ignore decorator elements whose `type` value is not an identifier', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotIdentifier', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'NotIdentifierDecorator'}));
    });

    it('should use `getImportOfIdentifier()` to retrieve import info', () => {
      const mockImportInfo = {} as Import;
      const spy = spyOn(Fesm2015ReflectionHost.prototype, 'getImportOfIdentifier')
                      .and.returnValue(mockImportInfo);

      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NoArgsProperty', ts.isClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NoArgsPropertyDecorator');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NoPropertyAssignmentDecorator');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral', ts.isClassDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NotArrayLiteralDecorator');
        expect(decorators[0].args).toEqual([]);
      });
    });
  });

  describe('getMembersOfClass()', () => {
    it('should find decorated properties on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(() => {
        host.getMembersOfClass(functionNode);
      }).toThrowError(`Attempted to get members of a non-class: "function foo() {}"`);
    });

    it('should return an empty array if there are no prop decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);

      expect(members).toEqual([]);
    });

    it('should not process decorated properties in `propDecorators` if it is not an object literal',
       () => {
         const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
         const host = new Fesm2015ReflectionHost(program.getTypeChecker());
         const classNode = getDeclaration(
             program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteral', ts.isClassDeclaration);
         const members = host.getMembersOfClass(classNode);

         expect(members.map(member => member.name)).not.toContain('prop');
       });

    it('should ignore prop decorator elements that are not object literals', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteralProp',
          ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({
        name: 'NotObjectLiteralPropDecorator'
      }));
    });

    it('should ignore prop decorator elements that have no `type` property', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NoTypeProperty', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'NoTypePropertyDecorator2'}));
    });

    it('should ignore prop decorator elements whose `type` value is not an identifier', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NotIdentifier', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'NotIdentifierDecorator'}));
    });

    it('should use `getImportOfIdentifier()` to retrieve import info', () => {
      let callCount = 0;
      const spy =
          spyOn(Fesm2015ReflectionHost.prototype, 'getImportOfIdentifier').and.callFake(() => {
            callCount++;
            return {name: `name${callCount}`, from: `from${callCount}`};
          });

      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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

      const index = members.findIndex(member => member.name === 'input1');
      expect(members[index].decorators !.length).toBe(1);
      expect(members[index].decorators ![0].import).toEqual({name: 'name1', from: 'from1'});
    });

    describe('(returned prop decorators `args`)', () => {
      it('should be an empty array if prop decorator has no `args` property', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
            ts.isClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NoArgsPropertyDecorator');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if prop decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NoPropertyAssignmentDecorator');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
            ts.isClassDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NotArrayLiteralDecorator');
        expect(decorators[0].args).toEqual([]);
      });
    });
  });

  describe('getConstructorParameters()', () => {
    it('should find the decorated constructor parameters', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode =
          getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters).toBeDefined();
      expect(parameters !.map(parameter => parameter.name)).toEqual([
        '_viewContainer', '_template', 'injected'
      ]);
      expect(parameters !.map(parameter => parameter.type !.getText())).toEqual([
        'ViewContainerRef', 'TemplateRef', 'undefined'
      ]);
    });

    it('should throw if the symbol is not a class', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(() => { host.getConstructorParameters(functionNode); })
          .toThrowError(
              'Attempted to get constructor parameters of a non-class: "function foo() {}"');
    });

    it('should return `null` if there is no constructor', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);
      expect(parameters).toBe(null);
    });

    it('should return an array even if there are no decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, SIMPLE_CLASS_FILE.name, 'NoDecoratorConstructorClass', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters).toEqual(jasmine.any(Array));
      expect(parameters !.length).toEqual(1);
      expect(parameters ![0].name).toEqual('foo');
      expect(parameters ![0].decorators).toBe(null);
    });

    it('should return an empty array if there are no constructor parameters', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NoParameters', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters).toEqual([]);
    });

    it('should ignore `ctorParameters` if it is not an arrow function', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrowFunction', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters !.length).toBe(1);
      expect(parameters ![0]).toEqual(jasmine.objectContaining({
        name: 'arg1',
        decorators: null,
      }));
    });

    it('should ignore `ctorParameters` if it does not return an array literal', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrayLiteral', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters !.length).toBe(1);
      expect(parameters ![0]).toEqual(jasmine.objectContaining({
        name: 'arg1',
        decorators: null,
      }));
    });

    describe('(returned parameters `decorators`)', () => {
      it('should ignore param decorator elements that are not object literals', () => {
        const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NoTypeProperty', ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'NoTypePropertyDecorator2'}));
      });

      it('should ignore param decorator elements whose `type` value is not an identifier', () => {
        const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotIdentifier', ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'NotIdentifierDecorator'}));
      });

      it('should use `getImportOfIdentifier()` to retrieve import info', () => {
        const mockImportInfo = {} as Import;
        const spy = spyOn(Fesm2015ReflectionHost.prototype, 'getImportOfIdentifier')
                        .and.returnValue(mockImportInfo);

        const program = makeProgram(SOME_DIRECTIVE_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![2].decorators !;

        expect(decorators.length).toEqual(1);
        expect(decorators[0].import).toBe(mockImportInfo);

        const typeIdentifier = spy.calls.mostRecent().args[0] as ts.Identifier;
        expect(typeIdentifier.text).toBe('Inject');
      });
    });

    describe('(returned parameters `decorators.args`)', () => {
      it('should be an empty array if param decorator has no `args` property', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
            ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        expect(parameters !.length).toBe(1);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NoArgsPropertyDecorator');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if param decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NoPropertyAssignmentDecorator');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Fesm2015ReflectionHost(program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
            ts.isClassDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('NotArrayLiteralDecorator');
        expect(decorators[0].args).toEqual([]);
      });
    });
  });

  describe('getDefinitionOfFunction()', () => {
    it('should return an object describing the function declaration passed as an argument', () => {
      const program = makeProgram(FUNCTION_BODY_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());

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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'b', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
    });

    it('should find the name by which the identifier was exported, not imported', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'c', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
    });

    it('should return null if the identifier was not imported', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'd', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toBeNull();
    });
  });

  describe('getDeclarationOfIdentifier()', () => {
    it('should return the declaration of a locally defined identifier', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
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
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const node =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      expect(host.isClass(node)).toBe(true);
    });

    it('should return false if a given node is a TS function declaration', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const node = getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(host.isClass(node)).toBe(false);
    });
  });

  describe('getGenericArityOfClass()', () => {
    it('should return 0 for a basic class', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Fesm2015ReflectionHost(program.getTypeChecker());
      const node =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(node)).toBe(0);
    });
  });
});
