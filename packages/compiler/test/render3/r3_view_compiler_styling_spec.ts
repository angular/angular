/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '../aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: styling', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  describe('[style]', () => {
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
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵs(0,$r3$.ɵb($ctx$.myStyleExp));
            }
          }
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
              $r3$.ɵE(0, 'div');
              $r3$.ɵe();
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
