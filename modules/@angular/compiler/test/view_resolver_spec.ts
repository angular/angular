/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewResolver} from '@angular/compiler/src/view_resolver';
import {Component, ViewMetadata} from '@angular/core/src/metadata';
import {beforeEach, ddescribe, describe, expect, iit, it} from '@angular/core/testing';

class SomeDir {}
class SomePipe {}

@Component({
  selector: 'sample',
  template: 'some template',
  directives: [SomeDir],
  pipes: [SomePipe],
  styles: ['some styles']
})
class ComponentWithTemplate {
}

@Component({selector: 'sample'})
class ComponentWithoutView {
}


class SimpleClass {}

export function main() {
  describe('ViewResolver', () => {
    var resolver: ViewResolver;

    beforeEach(() => { resolver = new ViewResolver(); });

    it('should read out the View metadata from the Component metadata', () => {
      var viewMetadata = resolver.resolve(ComponentWithTemplate);
      expect(viewMetadata).toEqual(new ViewMetadata({
        template: 'some template',
        directives: [SomeDir],
        pipes: [SomePipe],
        styles: ['some styles']
      }));
    });

    it('should throw when Component has neither template nor templateUrl set', () => {
      expect(() => resolver.resolve(ComponentWithoutView))
          .toThrowError(
              /Component 'ComponentWithoutView' must have either 'template' or 'templateUrl' set/);
    });

    it('should throw when simple class has no component decorator', () => {
      expect(() => resolver.resolve(SimpleClass))
          .toThrowError('Could not compile \'SimpleClass\' because it is not a component.');
    });
  });
}
