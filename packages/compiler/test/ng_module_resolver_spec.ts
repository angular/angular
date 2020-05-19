/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleResolver} from '@angular/compiler/src/ng_module_resolver';
import {ɵstringify as stringify} from '@angular/core';
import {NgModule} from '@angular/core/src/metadata';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

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

{
  describe('NgModuleResolver', () => {
    let resolver: NgModuleResolver;

    beforeEach(() => {
      resolver = new NgModuleResolver(new JitReflector());
    });

    it('should read out the metadata from the class', () => {
      const moduleMetadata = resolver.resolve(SomeModule);
      expect(moduleMetadata).toEqual(new NgModule({
        declarations: [SomeClass1],
        imports: [SomeClass2],
        exports: [SomeClass3],
        providers: [SomeClass4],
        entryComponents: [SomeClass5]
      }));
    });

    it('should throw when simple class has no NgModule decorator', () => {
      expect(() => resolver.resolve(SimpleClass))
          .toThrowError(`No NgModule metadata found for '${stringify(SimpleClass)}'.`);
    });

    it('should support inheriting the metadata', function() {
      @NgModule({id: 'p'})
      class Parent {
      }

      class ChildNoDecorator extends Parent {}

      @NgModule({id: 'c'})
      class ChildWithDecorator extends Parent {
      }

      expect(resolver.resolve(ChildNoDecorator)).toEqual(new NgModule({id: 'p'}));

      expect(resolver.resolve(ChildWithDecorator)).toEqual(new NgModule({id: 'c'}));
    });
  });
}
