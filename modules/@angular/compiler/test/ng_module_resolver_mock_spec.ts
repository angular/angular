/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModule} from '@angular/core';
import {beforeEach, describe, expect, inject, it} from '@angular/core/testing/testing_internal';
import {MockNgModuleResolver} from '../testing/index';

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
            SomeNgModule, new NgModule({declarations: [SomeOtherDirective]}));
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
