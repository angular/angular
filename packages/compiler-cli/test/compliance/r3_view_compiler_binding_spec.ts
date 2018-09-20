/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker} from '@angular/compiler/src/core';
import {MockDirectory, setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: bindings', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
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
      template:function MyComponent_Template(rf, $ctx$){
        if (rf & 1) {
          $i0$.ɵelementStart(0, "div");
          $i0$.ɵtext(1);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          $i0$.ɵtextBinding(1, $i0$.ɵinterpolation1("Hello ", $ctx$.name, ""));
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
      const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "title"];
      …
      template:function MyComponent_Template(rf, $ctx$){
        if (rf & 1) {
          $i0$.ɵelement(0, "a", $e0_attrs$);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "title", $i0$.ɵbind($ctx$.title));
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
      const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "title"];
      …
      template:function MyComponent_Template(rf, $ctx$){
        if (rf & 1) {
          $i0$.ɵelement(0, "a", $e0_attrs$);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "title", $i0$.ɵinterpolation1("Hello ", $ctx$.name, ""));
        }
      }`;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect interpolated property binding');
    });
  });

});
