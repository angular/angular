/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '@angular/compiler/test/aot/test_util';
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

  it('should create listener instruction on element', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<div (click)="onClick($event); 1 == 2"></div>\`
              })
              export class MyComponent {
                onClick(event: any) {}
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    // The template should look like this (where IDENT is a wild card for an identifier):
    const template = `
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵE(0, "div");
            $r3$.ɵL("click", function MyComponent_Template_div_click_listener($event) {
              ctx.onClick($event);
              return (1 == 2);
            });
            $r3$.ɵe();
          }
        }
        `;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

});
