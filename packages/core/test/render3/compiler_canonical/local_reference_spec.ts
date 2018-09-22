/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, TemplateRef} from '@angular/core';

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
        consts: 3,
        vars: 1,
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          let l1_user: any;
          if (rf & 1) {
            $r3$.ɵelement(0, 'input', ['value', 'World'], ['user', '']);
            $r3$.ɵtext(2);
          }
          if (rf & 2) {
            l1_user = $r3$.ɵreference<any>(1);
            $r3$.ɵtextBinding(2, $r3$.ɵinterpolation1('Hello, ', l1_user.value, '!'));
          }
        }
      });
      // NORMATIVE
    }

    const fixture = new ComponentFixture(MyComponent);
    expect(fixture.html).toEqual(`<input value="World">Hello, World!`);
  });

  it('should expose TemplateRef when a local ref is placed on ng-template', () => {
    type $MyComponent$ = MyComponent;
    type $any$ = any;

    @Component({
      selector: 'my-component',
      template: `<ng-template #tpl></ng-template>{{isTemplateRef(tpl)}}`
    })
    class MyComponent {
      isTemplateRef(tplRef: any): boolean { return tplRef.createEmbeddedView != null; }

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: () => new MyComponent,
        consts: 3,
        vars: 1,
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          let l1_tpl: any;
          if (rf & 1) {
            $r3$.ɵtemplate(
                0, MyComponent_Template_0, 0, 0, null, null, ['tpl', ''],
                $r3$.ɵtemplateRefExtractor(TemplateRef, ElementRef));
            $r3$.ɵtext(2);
          }
          if (rf & 2) {
            l1_tpl = $r3$.ɵreference<any>(1);
            $r3$.ɵtextBinding(2, $r3$.ɵinterpolation1('', ctx.isTemplateRef(l1_tpl), ''));
          }

          function MyComponent_Template_0(rf1: $RenderFlags$, ctx1: $any$) {}
        }
      });
      // NORMATIVE
    }

    const fixture = new ComponentFixture(MyComponent);
    expect(fixture.html).toEqual(`true`);
  });
});
