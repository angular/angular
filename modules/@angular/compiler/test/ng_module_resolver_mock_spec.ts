/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, it, inject,} from '@angular/core/testing/testing_internal';

import {stringify, isBlank} from '../src/facade/lang';
import {MockNgModuleResolver} from '../testing';
import {NgModule, NgModuleMetadata, Injector} from '@angular/core';

export function main() {
  describe('MockNgModuleResolver', () => {
    var ngModuleResolver: MockNgModuleResolver;

    beforeEach(inject([Injector], (injector: Injector) => {
      ngModuleResolver = new MockNgModuleResolver(injector);
    }));

    describe('NgModule overriding', () => {
      it('should fallback to the default NgModuleResolver when templates are not overridden',
         () => {
           var ngModule = ngModuleResolver.resolve(SomeNgModule);
           expect(ngModule.declarations).toEqual([SomeDirective]);
         });

      it('should allow overriding the @NgModule', () => {
        ngModuleResolver.setNgModule(
            SomeNgModule, new NgModuleMetadata({declarations: [SomeOtherDirective]}));
        var ngModule = ngModuleResolver.resolve(SomeNgModule);
        expect(ngModule.declarations).toEqual([SomeOtherDirective]);
      });
    });
  });
}

class SomeDirective {}

class SomeOtherDirective {}

@NgModule({declarations: [SomeDirective]})
class SomeNgModule {
}
