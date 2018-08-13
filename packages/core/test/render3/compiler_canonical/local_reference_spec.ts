/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {ComponentFixture} from '../render_util';

/// See: `normative.md`
describe('local references', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  it('should translate DOM structure', () => {
    type $MyComponent$ = MyComponent;

    @Component(
        {selector: 'my-component', template: `<input #user value="World">Hello, {{user.value}}!`})
    class MyComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: () => new MyComponent,
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          let l1_user: any;
          if (rf & 1) {
            $r3$.ɵEe(0, 'input', ['value', 'World'], ['user', '']);
            $r3$.ɵT(2);
          }
          if (rf & 2) {
            l1_user = $r3$.ɵr<any>(1);
            $r3$.ɵt(2, $r3$.ɵi1('Hello, ', l1_user.value, '!'));
          }
        }
      });
      // NORMATIVE
    }

    const fixture = new ComponentFixture(MyComponent);
    expect(fixture.html).toEqual(`<input value="World">Hello, World!`);
  });
});
