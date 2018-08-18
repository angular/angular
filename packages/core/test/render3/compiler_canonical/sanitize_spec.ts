/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {getHostElement} from '../../../src/render3/index';
import {renderComponent, toHtml} from '../render_util';

/**
 * NORMATIVE => /NORMATIVE: Designates what the compiler is expected to generate.
 *
 * All local variable names are considered non-normative (informative). They should be
 * wrapped in $ on each end to simplify testing on the compiler side.
 */

describe('compiler sanitization', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  it('should translate DOM structure', () => {
    type $MyComponent$ = MyComponent;

    @Component({
      selector: 'my-component',
      template: `<div [innerHTML]="innerHTML" [hidden]="hidden"></div>` +
          `<img [style.background-image]="style" [src]="src">` +
          `<script [attr.src]=src></script>`
    })
    class MyComponent {
      innerHTML: string = '<frame></frame>';
      hidden: boolean = true;
      style: string = `url("http://evil")`;
      url: string = 'javascript:evil()';

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: function MyComponent_Factory() { return new MyComponent(); },
        consts: 2,
        vars: 4,
        template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'div');
            $r3$.ɵelementStyling(['background-image']);
            $r3$.ɵelementEnd();
            $r3$.ɵelement(1, 'img');
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, 'innerHTML', $r3$.ɵbind(ctx.innerHTML), $r3$.ɵsanitizeHtml);
            $r3$.ɵelementProperty(0, 'hidden', $r3$.ɵbind(ctx.hidden));
            $r3$.ɵelementStylingProp(0, 0, ctx.style);
            $r3$.ɵelementStylingApply(0);
            $r3$.ɵelementProperty(1, 'src', $r3$.ɵbind(ctx.url), $r3$.ɵsanitizeUrl);
            $r3$.ɵelementAttribute(1, 'srcset', $r3$.ɵbind(ctx.url), $r3$.ɵsanitizeUrl);
          }
        }
      });
      // /NORMATIVE
    }

    const myComponent = renderComponent(MyComponent);
    const div = getHostElement(myComponent).querySelector('div') !;
    // because sanitizer removed it is working.
    expect(div.innerHTML).toEqual('');
    expect(div.hidden).toEqual(true);

    const img = getHostElement(myComponent).querySelector('img') !;
    // because sanitizer removed it is working.
    expect(img.getAttribute('src')).toEqual('unsafe:javascript:evil()');
    // because sanitizer removed it is working.
    expect(img.style.getPropertyValue('background-image')).toEqual('');
    // because sanitizer removed it is working.
    expect(img.getAttribute('srcset')).toEqual('unsafe:javascript:evil()');
  });

});
