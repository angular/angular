/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import { Esm2015ReflectionHost } from '../../src/host/esm2015_host';
import { getDeclaration, makeProgram } from '../helpers/utils';

const SOME_DIRECTIVE_FILE = {
  name: '/some_directive.js',
  contents: `
    import { Directive, InjectionToken, Input, Inject } from '@angular/core';

    const INJECTED_TOKEN = new InjectionToken('injected');
    const ViewContainerRef = {};
    const TemplateRef = {};

    class SomeDirective {
      constructor(_viewContainer, _template, injected) {}
    }
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
    };
  `
};

const SIMPLE_CLASS_FILE = {
  name: '/simple_class.js',
  contents: `
    class SimpleClass {}
  `
};

const FOO_FUNCTION_FILE = {
  name: '/foo_file.js',
  contents: `
    function foo() {}
  `
};

describe('Esm2015ReflectionHost', () => {

  describe('getDecoratorsOfDeclaration()', () => {
    it('should find the decorators on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode)!;
      expect(decorators).toBeDefined();
      expect(decorators.length).toEqual(1);

      const decorator = decorators[0];
      expect(decorator.name).toEqual('Directive');
      expect(decorator.import).toEqual({ name: 'Directive', from: '@angular/core' });
      expect(decorator.args!.map(arg => arg.getText())).toEqual([
        `{ selector: '[someDirective]' }`
      ]);
    });

    it('should return null if there are no decorators', () => {
      const program = makeProgram(SIMPLE_CLASS_FILE);
      const host = new Esm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(program, SIMPLE_CLASS_FILE.name, 'SimpleClass', ts.isClassDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(classNode);
      expect(decorators).toBe(null);
    });

    it('should return null if the symbol is not a class', () => {
      const program = makeProgram(FOO_FUNCTION_FILE);
      const host = new Esm2015ReflectionHost(program.getTypeChecker());
      const functionNode = getDeclaration(program, FOO_FUNCTION_FILE.name, 'foo', ts.isFunctionDeclaration);
      const decorators = host.getDecoratorsOfDeclaration(functionNode);
      expect(decorators).toBe(null);
    });
  });

  describe('getMembersOfClass()', () => {
    it('should find decorated members on a class', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const members = host.getMembersOfClass(classNode)!;
      expect(members).toBeDefined();
      expect(members.length).toEqual(2);
      expect(members.map(member => member.name)).toEqual(['input1', 'input2']);
    });
  });

  describe('getConstructorParamDecorators', () => {
    it('should ...', () => {
      const program = makeProgram(SOME_DIRECTIVE_FILE);
      const host = new Esm2015ReflectionHost(program.getTypeChecker());
      const classNode = getDeclaration(program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', ts.isClassDeclaration);
      const parameters = host.getConstructorParameters(classNode);
      expect(parameters).toBeDefined();
      expect(parameters!.map(parameter => parameter.name)).toEqual(['_viewContainer', '_template', 'injected']);
    });
  });
});
