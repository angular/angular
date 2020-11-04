/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadFakeCore, loadTestFiles} from '../../../src/ngtsc/testing';
import {CommonJsReflectionHost} from '../../src/host/commonjs_host';
import {makeTestBundleProgram} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('CommonJsReflectionHost [import helper style]', () => {
    let _: typeof absoluteFrom;
    let TOPLEVEL_DECORATORS_FILE: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;

      TOPLEVEL_DECORATORS_FILE = {
        name: _('/toplevel_decorators.cjs.js'),
        contents: `
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core = require('@angular/core');

var INJECTED_TOKEN = new InjectionToken('injected');
var ViewContainerRef = {};
var TemplateRef = {};

var SomeDirective = (function() {
  function SomeDirective(_viewContainer, _template, injected) {}
  return SomeDirective;
}());
SomeDirective = __decorate([
  core.Directive({ selector: '[someDirective]' }),
  __metadata("design:paramtypes", [core.ViewContainerRef, core.TemplateRef])
], SomeDirective);
__decorate([
  core.Input(),
], SomeDirective.prototype, "input1", void 0);
__decorate([
  core.Input(),
], SomeDirective.prototype, "input2", void 0);
exports.SomeDirective = SomeDirective;

var OtherDirective = (function() {
  function OtherDirective(_viewContainer, _template, injected) {}
  return OtherDirective;
}());
OtherDirective = __decorate([
  core.Directive({ selector: '[OtherDirective]' }),
  __metadata("design:paramtypes", [core.ViewContainerRef, core.TemplateRef])
], OtherDirective);
__decorate([
  core.Input(),
], OtherDirective.prototype, "input1", void 0);
__decorate([
  core.Input(),
], OtherDirective.prototype, "input2", void 0);
exports.OtherDirective = OtherDirective;

var AliasedDirective$1 = (function () {
  function AliasedDirective() {}
  return AliasedDirective;
}());
AliasedDirective$1 = __decorate([
  core.Directive({ selector: '[someDirective]' }),
], AliasedDirective$1);
exports.AliasedDirective$1 = AliasedDirective$1;
`
      };
    });

    describe('getDecoratorsOfDeclaration()', () => {
      it('should find the decorators on a class at the top level', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = new CommonJsReflectionHost(new MockLogger(), false, bundle);
        const classNode = getDeclaration(
            bundle.program, TOPLEVEL_DECORATORS_FILE.name, 'SomeDirective',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

        expect(decorators.length).toEqual(1);

        const decorator = decorators[0];
        expect(decorator.name).toEqual('Directive');
        expect(decorator.identifier!.getText()).toEqual('core.Directive');
        expect(decorator.import).toEqual({name: 'Directive', from: '@angular/core'});
        expect(decorator.args!.map(arg => arg.getText())).toEqual([
          '{ selector: \'[someDirective]\' }',
        ]);
      });

      it('should find the decorators on an aliased class at the top level', () => {
        loadFakeCore(getFileSystem());
        loadTestFiles([TOPLEVEL_DECORATORS_FILE]);
        const bundle = makeTestBundleProgram(TOPLEVEL_DECORATORS_FILE.name);
        const host = new CommonJsReflectionHost(new MockLogger(), false, bundle);
        const classNode = getDeclaration(
            bundle.program, TOPLEVEL_DECORATORS_FILE.name, 'AliasedDirective$1',
            isNamedVariableDeclaration);
        const decorators = host.getDecoratorsOfDeclaration(classNode)!;

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
  });
});
