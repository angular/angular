/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {ClassMemberKind, isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {UmdReflectionHost} from '../../src/host/umd_host';
import {makeTestBundleProgram} from '../helpers/utils';

import {expectTypeValueReferencesForParameters} from './util';

runInEachFileSystem(() => {
  describe('UmdReflectionHost [import helper style]', () => {
    let _: typeof absoluteFrom;

    let SOME_DIRECTIVE_FILE: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;

      SOME_DIRECTIVE_FILE = {
        name: _('/some_directive.umd.js'),
        contents: `
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
  typeof define === 'function' && define.amd ? define('some_directive', ['exports', '@angular/core'], factory) :
  (factory(global.some_directive,global.ng.core));
}(this, (function (exports,core) { 'use strict';

  var __decorate = null;
  var __metadata = null;
  var __param = null;

  var INJECTED_TOKEN = new InjectionToken('injected');
  var ViewContainerRef = {};
  var TemplateRef = {};

  var SomeDirective = (function() {
    function SomeDirective(_viewContainer, _template, injected) {}
    __decorate([
      core.Input(),
      __metadata("design:type", String)
    ], SomeDirective.prototype, "input1", void 0);
    __decorate([
      core.Input(),
      __metadata("design:type", Number)
    ], SomeDirective.prototype, "input2", void 0);
    SomeDirective = __decorate([
      core.Directive({ selector: '[someDirective]' }),
      __param(2, core.Inject(INJECTED_TOKEN)),
      __metadata("design:paramtypes", [ViewContainerRef, TemplateRef, String])
    ], SomeDirective);
    return SomeDirective;
  }());
  exports.SomeDirective = SomeDirective;

  var AliasedDirective$1 = /** @class */ (function () {
    function AliasedDirective() {}
    AliasedDirective = __decorate([
      core.Directive({ selector: '[someDirective]' }),
    ], AliasedDirective);
    return AliasedDirective;
  }());
  exports.AliasedDirective$1 = AliasedDirective$1;
})));`,
      };
    });

    describe('getDecoratorsOfDeclaration()', () => {
      it('should find the decorators on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new UmdReflectionHost(new MockLogger(), false, bundle);
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'SomeDirective', isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators).toBeDefined();
        expect(decorators.length).toEqual(1);

        const decorator = decorators[0];
        expect(decorator.name).toEqual('Directive');
        expect(decorator.identifier!.getText()).toEqual('core.Directive');
        expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
        expect(decorator.args!.map(arg => arg.getText())).toEqual([
          '{ selector: \'[someDirective]\' }',
        ]);
      });

      it('should find the decorators on an aliased class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new UmdReflectionHost(new MockLogger(), false, bundle);
        const classNode = getDeclaration(
            bundle.program, SOME_DIRECTIVE_FILE.name, 'AliasedDirective$1',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators).toBeDefined();
        expect(decorators.length).toEqual(1);

        const decorator = decorators[0];
        expect(decorator.name).toEqual('Directive');
        expect(decorator.identifier!.getText()).toEqual('core.Directive');
        expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
        expect(decorator.args!.map(arg => arg.getText())).toEqual([
          '{ selector: \'[someDirective]\' }',
        ]);
      });
    });

    describe('getMembersOfClass()', () => {
      it('should find decorated members on a class', () => {
        loadTestFiles([SOME_DIRECTIVE_FILE]);
        const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
        const host = new UmdReflectionHost(new MockLogger(), false, bundle);
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
        expect(input1.decorators!.map(d => d.name)).toEqual(['Input']);
      });

      describe('getConstructorParameters', () => {
        it('should find the decorated constructor parameters', () => {
          loadTestFiles([SOME_DIRECTIVE_FILE]);
          const bundle = makeTestBundleProgram(SOME_DIRECTIVE_FILE.name);
          const host = new UmdReflectionHost(new MockLogger(), false, bundle);
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
      });
    });
  });
});
