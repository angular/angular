/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive as _Directive, Pipe as _Pipe, PipeTransform, WrappedValue, ɵɵdefinePipe} from '@angular/core';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {ɵɵselect, ɵɵtext, ɵɵtextInterpolate1} from '../../src/render3/instructions/all';
import {ɵɵpipe, ɵɵpipeBind1} from '../../src/render3/pipe';

import {TemplateFixture} from './render_util';

const Pipe: typeof _Pipe = function(...args: any[]): any {
  // In test we use @Pipe for documentation only so it's safe to mock out the implementation.
  return () => undefined;
} as any;


// TODO: hasn't been moved over into acceptance, because the `WrappedValue` tests need to
// use an impure pipe which always throws "changed after checked errors" with `TestBed`
// both in Ivy and ViewEngine.
describe('pipe', () => {
  describe('WrappedValue', () => {
    @Pipe({name: 'wrappingPipe'})
    class WrappingPipe implements PipeTransform {
      transform(value: any) { return new WrappedValue('Bar'); }

      static ngPipeDef = ɵɵdefinePipe({
        name: 'wrappingPipe',
        type: WrappingPipe,
        factory: function WrappingPipe_Factory() { return new WrappingPipe(); },
        pure: false
      });
    }

    function createTemplate() {
      ɵɵtext(0);
      ɵɵpipe(1, 'wrappingPipe');
    }

    function updateTemplate() {
      ɵɵselect(0);
      ɵɵtextInterpolate1('', ɵɵpipeBind1(1, 1, null), '');
    }

    it('should unwrap', () => {
      const fixture =
          new TemplateFixture(createTemplate, updateTemplate, 2, 3, undefined, [WrappingPipe]);
      expect(fixture.html).toEqual('Bar');
    });

    it('should force change detection', () => {
      const fixture =
          new TemplateFixture(createTemplate, updateTemplate, 2, 3, undefined, [WrappingPipe]);
      expect(fixture.html).toEqual('Bar');

      fixture.hostElement.childNodes[0] !.textContent = 'Foo';
      expect(fixture.html).toEqual('Foo');

      fixture.update();
      expect(fixture.html).toEqual('Bar');
    });
  });

});
