/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('r3_view_compiler', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  describe('hello world', () => {
    it('should be able to generate the hello world component', () => {
      const files: MockDirectory = {
        app: {
          'hello.ts': `
           import {Component, NgModule} from '@angular/core';

           @Component({
             selector: 'hello-world',
             template: 'Hello, world!'
           })
           export class HelloWorldComponent {

           }

           @NgModule({
             declarations: [HelloWorldComponent]
           })
           export class HelloWorldModule {}
        `
        }
      };
      compile(files, angularFiles);
    });
  });

  it('should be able to generate the example', () => {
    const files: MockDirectory = {
      app: {
        'example.ts': `
        import {Component, OnInit, OnDestroy, ElementRef, Input, NgModule} from '@angular/core';

        @Component({
          selector: 'my-app',
          template: '<todo [data]="list"></todo>'
        })
        export class MyApp implements OnInit {

          list: any[] = [];

          constructor(public elementRef: ElementRef) {}

          ngOnInit(): void {
          }
        }

        @Component({
          selector: 'todo',
          template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>'
        })
        export class TodoComponent implements OnInit, OnDestroy {

          @Input()
          data: any[] = [];

          myTitle: string;

          constructor(public elementRef: ElementRef) {}

          ngOnInit(): void {}

          ngOnDestroy(): void {}
        }

        @NgModule({
          declarations: [TodoComponent, MyApp],
        })
        export class TodoModule{}
        `
      }
    };
    const result = compile(files, angularFiles);
    expect(result.source).toContain('@angular/core');
  });

  describe('interpolations', () => {
    // Regression #21927
    it('should generate a correct call to textInterpolateV with more than 8 interpolations', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: ' {{list[0]}} {{list[1]}} {{list[2]}} {{list[3]}} {{list[4]}} {{list[5]}} {{list[6]}} {{list[7]}} {{list[8]}} '
          })
          export class MyApp {
            list: any[] = [];
          }

          @NgModule({declarations: [MyApp]})
          export class MyModule {}`
        }
      };

      const bV_call = `
      …
      function MyApp_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵɵtext(0);
        }
        if (rf & 2) {
          $i0$.ɵɵtextInterpolateV([" ", ctx.list[0], " ", ctx.list[1], " ", ctx.list[2], " ", ctx.list[3], " ", ctx.list[4], " ", ctx.list[5], " ", ctx.list[6], " ", ctx.list[7], " ", ctx.list[8], " "]);
        }
      }
      …
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, bV_call, 'Incorrect bV call');
    });
  });

  describe('animations', () => {
    it('should not register any @attr attributes as static attributes', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div @attr [@binding]="exp"></div>'
          })
          export class MyApp {
          }

          @NgModule({declarations: [MyApp]})
          export class MyModule {}`
        }
      };

      const template = `
      template: function MyApp_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵɵelement(0, "div");
        }
        if (rf & 2) {
          $i0$.ɵɵproperty("@attr", …)("@binding", …);
        }
      }`;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect initialization attributes');
    });

    it('should dedup multiple [@event] listeners', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div (@mySelector.start)="false" (@mySelector.done)="false" [@mySelector]="0"></div>'
          })
          export class MyApp {
          }

          @NgModule({declarations: [MyApp]})
          export class MyModule {}`
        }
      };

      const template = `
      template: function MyApp_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵɵelementStart(0, "div");
          …
          $i0$.ɵɵproperty("@mySelector", …);
        }
      }`;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect initialization attributes');
    });
  });

  describe('$any', () => {
    it('should strip out $any wrappers', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [tabIndex]="$any(10)"></div>'
            })
            class Comp {
            }
          `
        }
      };

      const template = `
        …
        i0.ɵɵproperty("tabIndex", 10);
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should preserve $any if it is accessed through `this`', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [tabIndex]="this.$any(null)"></div>'
            })
            class Comp {
              $any(value: null): any {
                return value as any;
              }
            }
          `
        }
      };

      const template = `
        …
        i0.ɵɵproperty("tabIndex", ctx.$any(null));
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });
});
