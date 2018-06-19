/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InitialStylingFlags} from '../../src/core';
import {MockDirectory, setup} from '../aot/test_util';

import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: styling', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  describe('[style] and [style.prop]', () => {
    it('should create style instructions on the element', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div [style]="myStyleExp"></div>\`
                })
                export class MyComponent {
                  myStyleExp = [{color:'red'}, {color:'blue', duration:1000}]
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          template: function MyComponent_Template(rf: $RenderFlags$, $ctx$: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'div');
              $r3$.ɵs(1);
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵsm(1, $ctx$.myStyleExp);
              $r3$.ɵsa(1);
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should place initial, multi, singular and application followed by attribute styling instructions in the template code in that order',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div style="opacity:1"
                                   [attr.style]="'border-width: 10px'"
                                   [style.width]="myWidth"
                                   [style]="myStyleExp"
                                   [style.height]="myHeight"></div>\`
                })
                export class MyComponent {
                  myStyleExp = [{color:'red'}, {color:'blue', duration:1000}]
                  myWidth = '100px';
                  myHeight = '100px';
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
          const _c0 = ['opacity','width','height',${InitialStylingFlags.INITIAL_STYLES},'opacity','1'];
          class MyComponent {
            static ngComponentDef = i0.ɵdefineComponent({
              type: MyComponent,
              selectors:[['my-component']],
              factory:function MyComponent_Factory(){
                return new MyComponent();
              },
              template: function MyComponent_Template(rf: $RenderFlags$, $ctx$: $MyComponent$) {
                if (rf & 1) {
                  $r3$.ɵE(0, 'div');
                  $r3$.ɵs(1, _c0);
                  $r3$.ɵe();
                }
                if (rf & 2) {
                  $r3$.ɵsm(1, $ctx$.myStyleExp);
                  $r3$.ɵsp(1, 1, $ctx$.myWidth);
                  $r3$.ɵsp(1, 2, $ctx$.myHeight);
                  $r3$.ɵsa(1);
                  $r3$.ɵa(0, 'style', $r3$.ɵb('border-width: 10px'));
                }
              }
            });
        `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });
  });

  describe('[class]', () => {
    it('should create class styling instructions on the element', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div [class]="myClassExp"></div>\`
                })
                export class MyComponent {
                  myClassExp = [{color:'orange'}, {color:'green', duration:1000}]
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          template: function MyComponent_Template(rf: $RenderFlags$, $ctx$: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵEe(0, 'div');
            }
            if (rf & 2) {
              $r3$.ɵk(0,$r3$.ɵb($ctx$.myClassExp));
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });
});
