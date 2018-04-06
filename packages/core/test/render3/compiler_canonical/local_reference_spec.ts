/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {renderComponent, toHtml} from '../render_util';

/// See: `normative.md`
describe('local references', () => {
  type $boolean$ = boolean;

  // TODO(misko): currently disabled until local refs are working
  xit('should translate DOM structure', () => {
    type $MyComponent$ = MyComponent;

    @Component({selector: 'my-component', template: `<input #user>Hello {{user.value}}!`})
    class MyComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: () => new MyComponent,
        template: function(ctx: $MyComponent$, cm: $boolean$) {
          if (cm) {
            $r3$.ɵE(0, 'input', null, ['user', '']);
            $r3$.ɵe();
            $r3$.ɵT(2);
          }
          const l1_user = $r3$.ɵld<any>(1);
          $r3$.ɵt(2, $r3$.ɵi1('Hello ', l1_user.value, '!'));
        }
      });
      // NORMATIVE
    }

    expect(toHtml(renderComponent(MyComponent)))
        .toEqual('<div class="my-app" title="Hello">Hello <b>World</b>!</div>');
  });
});
