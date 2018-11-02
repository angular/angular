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
import {Esm5ReflectionHost} from '../../src/host/esm5_host';
import {getDeclaration, makeProgram} from '../helpers/utils';

const SOME_DIRECTIVE_FILE = {
  name: '/some_directive.js',
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

const SIMPLE_CLASS_FILE = {
  name: '/simple_class.js',
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

const INVALID_DECORATOR_ARGS_FILE = {
  name: '/invalid_decorator_args.js',
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

const INVALID_PROP_DECORATORS_FILE = {
  name: '/invalid_prop_decorators.js',
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

const INVALID_PROP_DECORATOR_ARGS_FILE = {
  name: '/invalid_prop_decorator_args.js',
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

const INVALID_CTOR_DECORATORS_FILE = {
  name: '/invalid_ctor_decorators.js',
  contents: `
    import { Inject } from '@angular/core';
    var NoParametersDecorator = {};
    var NoParameters = (function() {
      function NoParameters() {}
      return NoParameters;
    }());

    var ArrowFunction = (function() {
      function ArrowFunction(arg1) {
      }
      ArrowFunction.ctorParameters = () => [
        { type: 'ParamType', decorators: [{ type: Inject },] }
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

const INVALID_CTOR_DECORATOR_ARGS_FILE = {
  name: '/invalid_ctor_decorator_args.js',
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

      var b = a;
      var c = foo;
      var d = b;
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

const FUNCTION_BODY_FILE = {
  name: '/function_body.js',
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

const DECORATED_FILES = [
  {
    name: '/primary.js',
    contents: `
    import {Directive} from '@angular/core';
    import { D } from '/secondary';
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
    name: '/secondary.js',
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

describe('Esm5ReflectionHost', () => {

  describe('getDecoratorsOfDeclaration()', () => {
    it('should find the decorators on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
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
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(functionNode);
      expect(decorators).toBe(null);
    });

    it('should return null if there are no decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode);
      expect(decorators).toBe(null);
    });

    it('should ignore `decorators` if it is not an array literal', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotArrayLiteral', ts.isVariableDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode);
      expect(decorators).toEqual([]);
    });

    it('should ignore decorator elements that are not object literals', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotObjectLiteral', ts.isVariableDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
    });

    it('should ignore decorator elements that have no `type` property', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NoTypeProperty', ts.isVariableDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
    });

    it('should ignore decorator elements whose `type` value is not an identifier', () => {
      const program = makeProgram(INVALID_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_DECORATORS_FILE.name, 'NotIdentifier', ts.isVariableDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Directive'}));
    });

    it('should use `getImportOfIdentifier()` to retrieve import info', () => {
      const mockImportInfo = { name: 'mock', from: '@angular/core' } as Import;
      const spy = spyOn(Esm5ReflectionHost.prototype, 'getImportOfIdentifier')
                      .and.returnValue(mockImportInfo);

      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode) !;

      expect(decorators.length).toEqual(1);
      expect(decorators[0].import).toBe(mockImportInfo);

      const typeIdentifier = spy.calls.mostRecent().args[0] as ts.Identifier;
      expect(typeIdentifier.text).toBe('Directive');
    });

    describe('(returned decorators `args`)', () => {
      it('should be an empty array if decorator has no `args` property', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NoArgsProperty', ts.isVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral', ts.isVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode) !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[0].args).toEqual([]);
      });
    });
  });

  describe('getMembersOfClass()', () => {
    it('should find decorated members on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
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
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);

      const instanceProperty = members.find(member => member.name === 'instanceProperty') !;
      expect(instanceProperty.kind).toEqual(ClassMemberKind.Property);
      expect(instanceProperty.isStatic).toEqual(false);
      expect(ts.isBinaryExpression(instanceProperty.implementation !)).toEqual(true);
      expect(instanceProperty.value !.getText()).toEqual(`'instance'`);
    });

    it('should find static methods on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);

      const staticMethod = members.find(member => member.name === 'staticMethod') !;
      expect(staticMethod.kind).toEqual(ClassMemberKind.Method);
      expect(staticMethod.isStatic).toEqual(true);
      expect(ts.isFunctionExpression(staticMethod.implementation !)).toEqual(true);
    });

    it('should find static properties on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);

      const staticProperty = members.find(member => member.name === 'staticProperty') !;
      expect(staticProperty.kind).toEqual(ClassMemberKind.Property);
      expect(staticProperty.isStatic).toEqual(true);
      expect(ts.isPropertyAccessExpression(staticProperty.implementation !)).toEqual(true);
      expect(staticProperty.value !.getText()).toEqual(`'static'`);
    });

    it('should throw if the symbol is not a class', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(() => {
        host.getMembersOfClass(functionNode);
      }).toThrowError(`Attempted to get members of a non-class: "function foo() {}"`);
    });

    it('should return an empty array if there are no prop decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);

      expect(members).toEqual([]);
    });

    it('should not process decorated properties in `propDecorators` if it is not an object literal',
       () => {
         const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
         const host = new Esm5ReflectionHost(false, program.getTypeChecker());
         const classNode = getDeclaration(
             program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteral',
             ts.isVariableDeclaration);
         const members = host.getMembersOfClass(classNode);

         expect(members.map(member => member.name)).not.toContain('prop');
       });

    it('should ignore prop decorator elements that are not object literals', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NotObjectLiteralProp',
          ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
    });

    it('should ignore prop decorator elements that have no `type` property', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NoTypeProperty', ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
    });

    it('should ignore prop decorator elements whose `type` value is not an identifier', () => {
      const program = makeProgram(INVALID_PROP_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_PROP_DECORATORS_FILE.name, 'NotIdentifier', ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);
      const prop = members.find(m => m.name === 'prop') !;
      const decorators = prop.decorators !;

      expect(decorators.length).toBe(1);
      expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Input'}));
    });

    it('should use `getImportOfIdentifier()` to retrieve import info', () => {
      let callCount = 0;
      const spy = spyOn(Esm5ReflectionHost.prototype, 'getImportOfIdentifier').and.callFake(() => {
        callCount++;
        return {name: `name${callCount}`, from: `@angular/core`};
      });

      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
      const members = host.getMembersOfClass(classNode);

      expect(spy).toHaveBeenCalled();
      spy.calls.allArgs().forEach(arg => expect(arg[0].getText()).toEqual('Input'));

      const index = members.findIndex(member => member.name === 'input1');
      expect(members[index].decorators !.length).toBe(1);
      expect(members[index].decorators ![0].import).toEqual({name: 'name1', from: '@angular/core'});
    });

    describe('(returned prop decorators `args`)', () => {
      it('should be an empty array if prop decorator has no `args` property', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
            ts.isVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Input');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if prop decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Input');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_PROP_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_PROP_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
            ts.isVariableDeclaration);
        const members = host.getMembersOfClass(classNode);
        const prop = members.find(m => m.name === 'prop') !;
        const decorators = prop.decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Input');
        expect(decorators[0].args).toEqual([]);
      });
    });
  });

  describe('getConstructorParameters', () => {
    it('should find the decorated constructor parameters', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
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
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const functionNode =
          getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(() => { host.getConstructorParameters(functionNode); })
          .toThrowError(
              'Attempted to get constructor parameters of a non-class: "function foo() {}"');
    });

    // In ES5 there is no such thing as a constructor-less class
    // it('should return `null` if there is no constructor', () => { });

    it('should return an array even if there are no decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SIMPLE_CLASS_FILE.name, 'NoDecoratorConstructorClass', ts.isVariableDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters).toEqual(jasmine.any(Array));
      expect(parameters !.length).toEqual(1);
      expect(parameters ![0].name).toEqual('foo');
      expect(parameters ![0].decorators).toBe(null);
    });

    it('should return an empty array if there are no constructor parameters', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NoParameters', ts.isVariableDeclaration);
      const parameters = host.getConstructorParameters(classNode);

      expect(parameters).toEqual([]);
    });

    // In ES5 there are no arrow functions
    // it('should ignore `ctorParameters` if it is an arrow function', () => { });

    it('should ignore `ctorParameters` if it does not return an array literal', () => {
      const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, INVALID_CTOR_DECORATORS_FILE.name, 'NotArrayLiteral', ts.isVariableDeclaration);
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
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotObjectLiteral',
            ts.isVariableDeclaration);
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
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NoTypeProperty', ts.isVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
      });

      it('should ignore param decorator elements whose `type` value is not an identifier', () => {
        const program = makeProgram(INVALID_CTOR_DECORATORS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATORS_FILE.name, 'NotIdentifier', ts.isVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0]).toEqual(jasmine.objectContaining({name: 'Inject'}));
      });

      it('should use `getImportOfIdentifier()` to retrieve import info', () => {
        const mockImportInfo = { name: 'mock', from: '@angulare/core' } as Import;
        const spy = spyOn(Esm5ReflectionHost.prototype, 'getImportOfIdentifier')
                        .and.returnValue(mockImportInfo);

        const program = makeProgram(SOME_DIRECTIVE_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
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
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoArgsProperty',
            ts.isVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        expect(parameters !.length).toBe(1);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Inject');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if param decorator\'s `args` has no property assignment', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NoPropertyAssignment',
            ts.isVariableDeclaration);
        const parameters = host.getConstructorParameters(classNode);
        const decorators = parameters ![0].decorators !;

        expect(decorators.length).toBe(1);
        expect(decorators[0].name).toBe('Inject');
        expect(decorators[0].args).toEqual([]);
      });

      it('should be an empty array if `args` property value is not an array literal', () => {
        const program = makeProgram(INVALID_CTOR_DECORATOR_ARGS_FILE);
        const host = new Esm5ReflectionHost(false, program.getTypeChecker());
        const classNode = getDeclaration(
            program, INVALID_CTOR_DECORATOR_ARGS_FILE.name, 'NotArrayLiteral',
            ts.isVariableDeclaration);
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
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());

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
    });
  });

  describe('getImportOfIdentifier', () => {
    it('should find the import of an identifier', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'b', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
    });

    it('should find the name by which the identifier was exported, not imported', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'c', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toEqual({name: 'a', from: './a.js'});
    });

    it('should return null if the identifier was not imported', () => {
      const program = makeProgram(...IMPORTS_FILES);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const variableNode =
          getDeclaration(program, IMPORTS_FILES[1].name, 'd', ts.isVariableDeclaration);
      const importOfIdent = host.getImportOfIdentifier(variableNode.initializer as ts.Identifier);

      expect(importOfIdent).toBeNull();
    });
  });

  describe('getDeclarationOfIdentifier', () => {
    it('should return the declaration of a locally defined identifier', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
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
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const classNode = getDeclaration(
          program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isVariableDeclaration);
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
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
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
        // TODO: clarify what is expected here...
        //[`Directive = callableClassDecorator()`, '@angular/core'],
        [`Directive = callableClassDecorator()`, null],
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
    let superGetClassSymbolSpy: jasmine.Spy;

    beforeEach(() => {
      superGetClassSymbolSpy = spyOn(Esm2015ReflectionHost.prototype, 'getClassSymbol');
    });

    it('should return the class symbol returned by the superclass (if any)', () => {
      const mockNode = {} as ts.Node;
      const mockSymbol = {} as ts.Symbol;
      superGetClassSymbolSpy.and.returnValue(mockSymbol);

      const host = new Esm5ReflectionHost(false, {} as any);

      expect(host.getClassSymbol(mockNode)).toBe(mockSymbol);
      expect(superGetClassSymbolSpy).toHaveBeenCalledWith(mockNode);
    });

    it('should return the class symbol for an ES5 class (outer variable declaration)', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const node =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
      expect(host.getClassSymbol(node)).toBeDefined();
    });

    it('should return the class symbol for an ES5 class (inner function declaration)', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const outerNode =
          getDeclaration(program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
      const innerNode =
          (((outerNode.initializer as ts.ParenthesizedExpression).expression as ts.CallExpression)
               .expression as ts.FunctionExpression)
              .body.statements.find(ts.isFunctionDeclaration) !;

      expect(host.getClassSymbol(innerNode)).toBeDefined();
    });

    it('should return the same class symbol (of the inner declaration) for outer and inner declarations',
       () => {
         const program = makeProgram(SIMPLE_CLASS_FILE);
         const host = new Esm5ReflectionHost(false, program.getTypeChecker());
         const outerNode = getDeclaration(
             program, SIMPLE_CLASS_FILE.name, 'EmptyClass', ts.isVariableDeclaration);
         const innerNode = (((outerNode.initializer as ts.ParenthesizedExpression)
                                 .expression as ts.CallExpression)
                                .expression as ts.FunctionExpression)
                               .body.statements.find(ts.isFunctionDeclaration) !;

         expect(host.getClassSymbol(innerNode)).toBe(host.getClassSymbol(outerNode));
         expect(host.getClassSymbol(innerNode) !.valueDeclaration).toBe(innerNode);
       });

    it('should return undefined if node is not an ES5 class', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const node = getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      expect(host.getClassSymbol(node)).toBeUndefined();
    });
  });

  describe('isClass()', () => {
    let host: Esm5ReflectionHost;
    let mockNode: ts.Node;
    let superIsClassSpy: jasmine.Spy;
    let getClassSymbolSpy: jasmine.Spy;

    beforeEach(() => {
      host = new Esm5ReflectionHost(false, null as any);
      mockNode = {} as any;

      superIsClassSpy = spyOn(Esm2015ReflectionHost.prototype, 'isClass');
      getClassSymbolSpy = spyOn(Esm5ReflectionHost.prototype, 'getClassSymbol');
    });

    it('should return true if superclass returns true', () => {
      superIsClassSpy.and.returnValue(true);

      expect(host.isClass(mockNode)).toBe(true);
      expect(superIsClassSpy).toHaveBeenCalledWith(mockNode);
      expect(getClassSymbolSpy).not.toHaveBeenCalled();
    });

    it('should return true if it can find a symbol for the class', () => {
      superIsClassSpy.and.returnValue(false);
      getClassSymbolSpy.and.returnValue(true);

      expect(host.isClass(mockNode)).toBe(true);
      expect(superIsClassSpy).toHaveBeenCalledWith(mockNode);
      expect(getClassSymbolSpy).toHaveBeenCalledWith(mockNode);
    });

    it('should return false if it cannot find a symbol for the class', () => {
      superIsClassSpy.and.returnValue(false);
      getClassSymbolSpy.and.returnValue(false);

      expect(host.isClass(mockNode)).toBe(false);
      expect(superIsClassSpy).toHaveBeenCalledWith(mockNode);
      expect(getClassSymbolSpy).toHaveBeenCalledWith(mockNode);
    });
  });

  describe('findDecoratedClasses()', () => {
    it('should return an array of all decorated classes in the given source file', () => {
      const program = makeProgram(...DECORATED_FILES);
      const host = new Esm5ReflectionHost(false, program.getTypeChecker());
      const primary = program.getSourceFile(DECORATED_FILES[0].name) !;

      const primaryDecoratedClasses = host.findDecoratedClasses(primary);
      expect(primaryDecoratedClasses.length).toEqual(2);
      const classA = primaryDecoratedClasses.find(c => c.name === 'A') !;
      expect(classA.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
      // Note that `B` is not exported from `primary.js`
      const classB = primaryDecoratedClasses.find(c => c.name === 'B') !;
      expect(classB.decorators.map(decorator => decorator.name)).toEqual(['Directive']);

      const secondary = program.getSourceFile(DECORATED_FILES[1].name) !;
      const secondaryDecoratedClasses = host.findDecoratedClasses(secondary);
      expect(secondaryDecoratedClasses.length).toEqual(1);
      // Note that `D` is exported from `secondary.js` but not exported from `primary.js`
      const classD = secondaryDecoratedClasses.find(c => c.name === 'D') !;
      expect(classD.name).toEqual('D');
      expect(classD.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
    });
  });
});
