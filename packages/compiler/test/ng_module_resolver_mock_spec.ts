/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModule} from '@angular/core';
import {beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

import {MockNgModuleResolver} from '../testing';

{
  describe('MockNgModuleResolver', () => {
    let ngModuleResolver: MockNgModuleResolver;

    beforeEach(inject([Injector], (injector: Injector) => {
      ngModuleResolver = new MockNgModuleResolver(new JitReflector());
    }));

    describe('NgModule overriding', () => {
      it('should fallback to the default NgModuleResolver when templates are not overridden',
         () => {
           const ngModule = ngModuleResolver.resolve(SomeNgModule);
           expect(ngModule.declarations).toEqual([SomeDirective]);
         });

      it('should allow overriding the @NgModule', () => {
        ngModuleResolver.setNgModule(
            SomeNgModule, new NgModule({declarations: [SomeOtherDirective]}));
        const ngModule = ngModuleResolver.resolve(SomeNgModule);
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
