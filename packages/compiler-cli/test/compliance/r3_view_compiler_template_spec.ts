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
      function MyComponent_ul_li_div_Template_1(rf, ctx) {
        
        if (rf & 1) {
          const $inner$ = ctx.$implicit;
          const $middle$ = $i0$.ɵx().$implicit;
          const $outer$ = $i0$.ɵx().$implicit;
          const $myComp$ = $i0$.ɵx();
          $i0$.ɵE(0, "div");
          $i0$.ɵL("click", function MyComponent_ul_li_div_Template_1_div_click_listener($event){
            return $myComp$.onClick($outer$, $middle$, $inner$);
          });
          $i0$.ɵT(1);
          $i0$.ɵe();
        }
        
        if (rf & 2) {
          const $inner1$ = ctx.$implicit;
          const $middle1$ = $i0$.ɵx().$implicit;
          const $outer1$ = $i0$.ɵx().$implicit;
          const $myComp1$ = $i0$.ɵx();
          $i0$.ɵp(0, "title", $i0$.ɵb($myComp1$.format($outer1$, $middle1$, $inner1$, $myComp1$.component)));
          $i0$.ɵt(1, $i0$.ɵi1(" ", $myComp1$.format($outer1$, $middle1$, $inner1$, $myComp1$.component), " "));
        }
      }
            
      function MyComponent_ul_li_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "li");
          $i0$.ɵC(1, MyComponent_ul_li_div_Template_1, null, _c0);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $myComp2$ = $i0$.ɵx(2);
          $i0$.ɵp(1, "ngForOf", $i0$.ɵb($myComp2$.items));
        }
      }
      
      function MyComponent_ul_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "ul");
          $i0$.ɵC(1, MyComponent_ul_li_Template_1, null, _c0);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $outer2$ = ctx.$implicit;
          $i0$.ɵp(1, "ngForOf", $i0$.ɵb($outer2$.items));
        }
      }
      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵC(0, MyComponent_ul_Template_0, null, _c0);
        }
        if (rf & 2) {
          $i0$.ɵp(0, "ngForOf", $i0$.ɵb(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should support ngFor context variables', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';
              import {CommonModule} from '@angular/common';

              @Component({
                selector: 'my-component',
                template: \`
                    <span *ngFor="let item of items; index as i">
                      {{ i }} - {{ item }}
                    </span>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent], imports: [CommonModule]})
              export class MyModule {}
          `
      }
    };

    const template = `
      const $c0$ = ["ngFor","","ngForOf",""];
      
      function MyComponent_span_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "span");
          $i0$.ɵT(1);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $item$ = ctx.$implicit;
          const $i$ = ctx.index;
          $i0$.ɵt(1, $i0$.ɵi2(" ", $i$, " - ", $item$, " "));
        }
      }
      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵC(0, MyComponent_span_Template_0, null, _c0);
        }
        if (rf & 2) {
          $i0$.ɵp(0, "ngForOf", $i0$.ɵb(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should support ngFor context variables in parent views', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';
              import {CommonModule} from '@angular/common';

              @Component({
                selector: 'my-component',
                template: \`
                  <div *ngFor="let item of items; index as i">
                      <span *ngIf="showing">
                        {{ i }} - {{ item }}
                      </span>
                  </div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent], imports: [CommonModule]})
              export class MyModule {}
          `
      }
    };

    const template = `
      const $c0$ = ["ngFor","","ngForOf",""];
      const $c1$ = ["ngIf",""];
      
      function MyComponent_div_span_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "span");
          $i0$.ɵT(1);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $div$ = $i0$.ɵx();
          const $i$ = $div$.index;
          const $item$ = $div$.$implicit;
          $i0$.ɵt(1, $i0$.ɵi2(" ", $i$, " - ", $item$, " "));
        }
      }
      
      function MyComponent_div_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "div");
          $i0$.ɵC(1, MyComponent_div_span_Template_1, null, $c1$);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $app$ = $i0$.ɵx();
          $i0$.ɵp(1, "ngIf", $i0$.ɵb($app$.showing));
        }
      }
      
      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵC(0, MyComponent_div_Template_0, null, $c0$);
        }
        if (rf & 2) {
          $i0$.ɵp(0, "ngForOf", $i0$.ɵb(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should correctly skip contexts as needed', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';
              import {CommonModule} from '@angular/common';

              @Component({
                selector: 'my-component',
                template: \`
                  <div *ngFor="let outer of items">
                    <div *ngFor="let middle of outer.items">
                      <div *ngFor="let inner of middle.items">
                        {{ middle.value }} - {{ name }}
                      </div>
                    </div>
                  </div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent], imports: [CommonModule]})
              export class MyModule {}
          `
      }
    };

    // The template should look like this (where IDENT is a wild card for an identifier):
    const template = `
      const $c0$ = ["ngFor","","ngForOf",""];
      function MyComponent_div_div_div_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "div");
          $i0$.ɵT(1);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $middle$ = $i0$.ɵx().$implicit;
          const $myComp$ = $i0$.ɵx(2);
          $i0$.ɵt(1, $i0$.ɵi2(" ", $middle$.value, " - ", $myComp$.name, " "));
        }
      }
            
      function MyComponent_div_div_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "div");
          $i0$.ɵC(1, MyComponent_div_div_div_Template_1, null, _c0);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $middle$ = ctx.$implicit;
          $i0$.ɵp(1, "ngForOf", $i0$.ɵb($middle$.items));
        }
      }
      
      function MyComponent_div_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵE(0, "div");
          $i0$.ɵC(1, MyComponent_div_div_Template_1, null, _c0);
          $i0$.ɵe();
        }
        if (rf & 2) {
          const $outer$ = ctx.$implicit;
          $i0$.ɵp(1, "ngForOf", $i0$.ɵb($outer$.items));
        }
      }
      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵC(0, MyComponent_div_Template_0, null, _c0);
        }
        if (rf & 2) {
          $i0$.ɵp(0, "ngForOf", $i0$.ɵb(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

});
