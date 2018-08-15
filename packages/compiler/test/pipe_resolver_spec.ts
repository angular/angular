/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeResolver} from '@angular/compiler/src/pipe_resolver';
import {ɵstringify as stringify} from '@angular/core';
import {Pipe} from '@angular/core/src/metadata';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

@Pipe({name: 'somePipe', pure: true})
class SomePipe {
}

class SimpleClass {}

{
  describe('PipeResolver', () => {
    let resolver: PipeResolver;

    beforeEach(() => {
      resolver = new PipeResolver(new JitReflector());
    });

    it('should read out the metadata from the class', () => {
      const moduleMetadata = resolver.resolve(SomePipe);
      expect(moduleMetadata).toEqual(new Pipe({name: 'somePipe', pure: true}));
    });

    it('should throw when simple class has no pipe decorator', () => {
      expect(() => resolver.resolve(SimpleClass))
          .toThrowError(`No Pipe decorator found on ${stringify(SimpleClass)}`);
    });

    it('should support inheriting the metadata', function() {
      @Pipe({name: 'p'})
      class Parent {
      }

      class ChildNoDecorator extends Parent {}

      @Pipe({name: 'c'})
      class ChildWithDecorator extends Parent {
      }

      expect(resolver.resolve(ChildNoDecorator)).toEqual(new Pipe({name: 'p'}));

      expect(resolver.resolve(ChildWithDecorator)).toEqual(new Pipe({name: 'c'}));
    });
  });
}
