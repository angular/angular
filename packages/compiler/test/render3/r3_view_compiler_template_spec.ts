/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '../aot/test_util';
import {compile, expectEmit} from './mock_compile';

/* These tests are codified version of the tests in compiler_canonical_spec.ts. Every
  * test in compiler_canonical_spec.ts should have a corresponding test here.
  */
describe('compiler compliance: listen()', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  it('should create correctly bind to context in nested template', () => {
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
                      <div *ngFor="let inner of middle.items" (click)="onClick(outer, middle, inner)">
                        {{format(outer, middle, inner)}}
                      </div>
                    </li>
                  </ul>\`
              })
              export class MyComponent {
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
      template:function MyComponent_Template(ctx:any,cm:boolean){
        if (cm) { 
          i0.ɵC(0,MyComponent_NgForOf_Template_0,null,_c0); 
        }
        i0.ɵp(0,'ngForOf',i0.ɵb(ctx.items));
        function MyComponent_NgForOf_Template_0(ctx0:any,cm:boolean) {
          if (cm) {
            i0.ɵE(0,'ul');
            i0.ɵC(1,MyComponent_NgForOf_NgForOf_Template_1,null,_c0);
            i0.ɵe();
          }
          const $_r0$ = ctx0.$implicit;
          i0.ɵp(1,'ngForOf',i0.ɵb($_r0$.items));
          function MyComponent_NgForOf_NgForOf_Template_1(ctx1:any,cm:boolean) {
            if (cm) {
              i0.ɵE(0,'li');
              i0.ɵC(1,MyComponent_NgForOf_NgForOf_NgForOf_Template_1,null,_c0);
              i0.ɵe();
            }
            const $_r1$ = ctx1.$implicit;
            i0.ɵp(1,'ngForOf',i0.ɵb($_r1$.items));
            function MyComponent_NgForOf_NgForOf_NgForOf_Template_1(ctx2:any,cm:boolean) {
              if (cm) {
                i0.ɵE(0,'div');
                i0.ɵL('click',function MyComponent_NgForOf_NgForOf_NgForOf_Template_1_div_click_listener($event:any){
                  const pd_b:any = ((<any>ctx.onClick($_r0$,$_r1$,$_r2$)) !== false);
                  return pd_b;
                });
                i0.ɵT(1);
                i0.ɵe();
              }
              const $_r2$ = ctx2.$implicit;
              i0.ɵt(1,i0.ɵi1(' ',ctx.format($_r0$,$_r1$,$_r2$),' '));
            }
          }
        }
      }`;


    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

});