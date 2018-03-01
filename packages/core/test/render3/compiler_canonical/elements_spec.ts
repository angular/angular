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
describe('elements', () => {
  // Saving type as $boolean$, etc to simplify testing for compiler, as types aren't saved
  type $boolean$ = boolean;
  type $any$ = any;
  type $number$ = number;

  it('should translate DOM structure', () => {
    type $MyComponent$ = MyComponent;

    // Important: keep arrays outside of function to not create new instances.
    const $e0_attrs$ = ['class', 'my-app', 'title', 'Hello'];

    @Component({
      selector: 'my-component',
      template: `<div class="my-app" title="Hello">Hello <b>World</b>!</div>`
    })
    class MyComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        tag: 'my-component',
        factory: () => new MyComponent(),
        template: function(ctx: $MyComponent$, cm: $boolean$) {
          if (cm) {
            $r3$.ɵE(0, 'div', $e0_attrs$);
            $r3$.ɵT(1, 'Hello ');
            $r3$.ɵE(2, 'b');
            $r3$.ɵT(3, 'World');
            $r3$.ɵe();
            $r3$.ɵT(4, '!');
            $r3$.ɵe();
          }
        }
      });
      // /NORMATIVE
    }

    expect(toHtml(renderComponent(MyComponent)))
        .toEqual('<div class="my-app" title="Hello">Hello <b>World</b>!</div>');
  });
});
