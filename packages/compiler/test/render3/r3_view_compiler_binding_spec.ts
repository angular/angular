/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '../aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: bindings', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: false,
  });

  describe('text bindings', () => {
    it('should generate interpolation instruction', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';
          @Component({
            selector: 'my-component',
            template: \`
              <div>Hello {{ name }}</div>\`
          })
          export class MyComponent {
            name = 'World';
          }
          @NgModule({declarations: [MyComponent]})
          export class MyModule {}
          `
        }
      };

      const template = `
      template:function MyComponent_Template(rf: IDENT, $ctx$: IDENT){
        if (rf & 1) {
          $i0$.ɵE(0, 'div');
          $i0$.ɵT(1);
          $i0$.ɵe();
        }
        if (rf & 2) {
          $i0$.ɵt(1, $i0$.ɵi1('Hello ', $ctx$.name, ''));
        }
      }`;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect interpolated text binding');
    });
  });

  describe('property bindings', () => {
    it('should generate bind instruction', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<a [title]="title"></a>'
          })
          export class MyComponent {
            title = 'Hello World';
          }

          @NgModule({declarations: [MyComponent]})
          export class MyModule {}`
        }
      };

      const template = `
      template:function MyComponent_Template(rf: IDENT, $ctx$: IDENT){
        if (rf & 1) {
          $i0$.ɵE(0, 'a');
          $i0$.ɵe();
        }
        if (rf & 2) {
          $i0$.ɵp(0, 'title', $i0$.ɵb($ctx$.title));
        }
      }`;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect property binding');
    });

    it('should generate interpolation instruction for {{...}} bindings', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';
          @Component({
            selector: 'my-component',
            template: \`
              <a title="Hello {{name}}"></a>\`
          })
          export class MyComponent {
            name = 'World';
          }
          @NgModule({declarations: [MyComponent]})
          export class MyModule {}
          `
        }
      };

      const template = `
      template:function MyComponent_Template(rf: IDENT, $ctx$: IDENT){
        if (rf & 1) {
          $i0$.ɵE(0, 'a');
          $i0$.ɵe();
        }
        if (rf & 2) {
          $i0$.ɵp(0, 'title', $i0$.ɵi1('Hello ', $ctx$.name, ''));
        }
      }`;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect interpolated property binding');
    });
  });

});
