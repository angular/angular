/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: template', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  it('should correctly bind to context in nested template', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';
              import {CommonModule} from '@angular/common';

              @Component({
                selector: 'my-component',
                template: \`
                  <ul *ngFor="let outer of items">
                    <li *ngFor="let middle of outer.items">
                      <div *ngFor="let inner of items"
                           (click)="onClick(outer, middle, inner)"
                           [title]="format(outer, middle, inner, component)"
                           >
                        {{format(outer, middle, inner, component)}}
                      </div>
                    </li>
                  </ul>\`
              })
              export class MyComponent {
                component = this;
                format(outer: any, middle: any, inner: any) { }
                onClick(outer: any, middle: any, inner: any) { }
              }

              @NgModule({declarations: [MyComponent], imports: [CommonModule]})
              export class MyModule {}
          `
      }
    };

    // The template should look like this (where IDENT is a wild card for an identifier):
    const template = `
      const $c0$ = ["ngFor","","ngForOf",""];
      function MyComponent_ul_li_div_Template_1(rf, $ctx2$, $ctx1$, $ctx0$, $ctx$) {
        if (rf & 1) {
          $i0$.ɵE(0, "div");
          $i0$.ɵL("click", function MyComponent_ul_li_div_Template_1_div_click_listener($event){
            const $outer$ = $ctx0$.$implicit;
            const $middle$ = $ctx1$.$implicit;
            const $inner$ = $ctx2$.$implicit;
            return ctx.onClick($outer$, $middle$, $inner$);
          });
          $i0$.ɵT(1);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $outer$ = $ctx0$.$implicit;
          const $middle$ = $ctx1$.$implicit;
          const $inner$ = $ctx2$.$implicit;
          $i0$.ɵp(0, "title", $i0$.ɵb(ctx.format($outer$, $middle$, $inner$, $ctx$.component)));
          $i0$.ɵt(1, $i0$.ɵi1(" ", ctx.format($outer$, $middle$, $inner$, $ctx$.component), " "));
        }
      }
            
      function MyComponent_ul_li_Template_1(rf, $ctx1$, $ctx0$, $ctx$) {
        if (rf & 1) {
          $i0$.ɵE(0, "li");
          $i0$.ɵC(1, MyComponent_ul_li_div_Template_1, null, _c0);
          $i0$.ɵe();
        }
        if (rf & 2) {
          $i0$.ɵp(1, "ngForOf", $i0$.ɵb($ctx$.items));
        }
      }
      
      function MyComponent_ul_Template_0(rf, $ctx0$, $ctx$) {
        if (rf & 1) {
          $i0$.ɵE(0, "ul");
          $i0$.ɵC(1, MyComponent_ul_li_Template_1, null, _c0);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $outer$ = $ctx0$.$implicit;
          $i0$.ɵp(1, "ngForOf", $i0$.ɵb($outer$.items));
        }
      }
      // ...
      template:function MyComponent_Template(rf, $ctx$){
        if (rf & 1) {
          $i0$.ɵC(0, MyComponent_ul_Template_0, null, _c0);
        }
        if (rf & 2) {
          $i0$.ɵp(0, "ngForOf", $i0$.ɵb($ctx$.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

});
