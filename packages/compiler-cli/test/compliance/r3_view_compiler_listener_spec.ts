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
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
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
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵlistener("click", function MyComponent_Template_div_click_listener($event) {
              ctx.onClick($event);
              return (1 == 2);
            });
            $r3$.ɵelementEnd();
          }
        }
        `;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should create multiple listener instructions that share a view snapshot', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <div *ngIf="showing">
                    <div (click)="onClick(foo)"></div>
                    <button (click)="onClick2(bar)"></button>
                  </div>

                \`
              })
              export class MyComponent {
                onClick(name: any) {}
                onClick2(name: any) {}
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const template = `
        const $c0$ = ["ngIf",""];

        function MyComponent_div_Template_0(rf, ctx) {
          if (rf & 1) {
            const $s$ = $r3$.ɵgetCurrentView();
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵlistener("click", function MyComponent_div_Template_0_div_click_listener($event) {
              $r3$.ɵrestoreView($s$);
              const $comp$ = $r3$.ɵnextContext();
              return $comp$.onClick($comp$.foo);
            });
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "button");
            $r3$.ɵlistener("click", function MyComponent_div_Template_0_button_click_listener($event) {
              $r3$.ɵrestoreView($s$);
              const $comp2$ = $r3$.ɵnextContext();
              return $comp2$.onClick2($comp2$.bar);
            });
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
          }
        }
        // ...
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵcontainer(0, MyComponent_div_Template_0, null, $c0$);
          }
          if (rf & 2) {
            $i0$.ɵelementProperty(0, "ngIf", $i0$.ɵbind(ctx.showing));
          }
        }
        `;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('local refs in listeners defined before the local refs', () => {
    const files = {
      app: {
        'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <button (click)="onClick(user.value)">Save</button>
                <input #user>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
      }
    };

    const MyComponentDefinition = `
        const $c0$ = ["user", ""];
        …
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          features: [$r3$.ɵPublicFeature],
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "button");
                $r3$.ɵlistener("click", function MyComponent_Template_button_click_listener($event) {
                   const $user$ = $r3$.ɵreference(3);
                   return ctx.onClick($user$.value);
                });
                $r3$.ɵtext(1, "Save");
              $r3$.ɵelementEnd();
              $r3$.ɵelement(2, "input", null, $c0$);
            }
          }
        });
      `;

    const result = compile(files, angularFiles);
    const source = result.source;

    expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
  });

});
