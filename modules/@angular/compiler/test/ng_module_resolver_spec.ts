/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleResolver} from '@angular/compiler/src/ng_module_resolver';
import {NgModule} from '@angular/core/src/metadata';
import {stringify} from '../src/facade/lang';

class SomeClass1 {}
class SomeClass2 {}
class SomeClass3 {}
class SomeClass4 {}
class SomeClass5 {}

@NgModule({
  declarations: [SomeClass1],
  imports: [SomeClass2],
  exports: [SomeClass3],
  providers: [SomeClass4],
  entryComponents: [SomeClass5]
})
class SomeModule {
}

class SimpleClass {}

export function main() {
  describe('NgModuleResolver', () => {
    var resolver: NgModuleResolver;

    beforeEach(() => { resolver = new NgModuleResolver(); });

    it('should read out the metadata from the class', () => {
      var moduleMetadata = resolver.resolve(SomeModule);
      expect(moduleMetadata).toEqual(new NgModule({
        declarations: [SomeClass1],
        imports: [SomeClass2],
        exports: [SomeClass3],
        providers: [SomeClass4],
        entryComponents: [SomeClass5]
      }));
    });

    it('should throw when simple class has no component decorator', () => {
      expect(() => resolver.resolve(SimpleClass))
          .toThrowError(`No NgModule metadata found for '${stringify(SimpleClass)}'.`);
    });
  });
}
