/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker} from '@angular/compiler/src/core';
import {setup} from '@angular/compiler/test/aot/test_util';
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
        const $e0_attrs$ = [${AttributeMarker.Bindings}, "click"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $e0_attrs$);
            $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener($event) {
              ctx.onClick($event);
              return 1 == 2;
            });
            $r3$.ɵɵelementEnd();
          }
        }
        `;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should create listener instruction on other components', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-app',
                template: \`<div>My App</div>\`
              })
              export class MyApp {}

              @Component({
                selector: 'my-component',
                template: \`<my-app (click)="onClick($event);"></my-app>\`
              })
              export class MyComponent {
                onClick(event: any) {}
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const template = `
        const $e0_attrs$ = [${AttributeMarker.Bindings}, "click"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "my-app", $e0_attrs$);
            $r3$.ɵɵlistener("click", function MyComponent_Template_my_app_click_0_listener($event) {
              return ctx.onClick($event);
            });
            $r3$.ɵɵelementEnd();
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
        const $t0_attrs$ = [${AttributeMarker.Template}, "ngIf"];
        const $e_attrs$ = [${AttributeMarker.Bindings}, "click"];

        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
            const $s$ = $r3$.ɵɵgetCurrentView();
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵelementStart(1, "div", $e_attrs$);
            $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_1_listener($event) {
              $r3$.ɵɵrestoreView($s$);
              const $comp$ = $r3$.ɵɵnextContext();
              return $comp$.onClick($comp$.foo);
            });
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(2, "button", $e_attrs$);
            $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_button_click_2_listener($event) {
              $r3$.ɵɵrestoreView($s$);
              const $comp2$ = $r3$.ɵɵnextContext();
              return $comp2$.onClick2($comp2$.bar);
            });
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
          }
        }
        // ...
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 0, "div", $c0$);
          }
          if (rf & 2) {
            $i0$.ɵɵproperty("ngIf", ctx.showing);
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
        const $e0_attrs$ = [${AttributeMarker.Bindings}, "click"];
        const $e2_refs$ = ["user", ""];
        …
        MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          consts: 4,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              const $s$ = $r3$.ɵɵgetCurrentView();
              $r3$.ɵɵelementStart(0, "button", $e0_attrs$);
                $r3$.ɵɵlistener("click", function MyComponent_Template_button_click_0_listener($event) {
                   $r3$.ɵɵrestoreView($s$);
                   const $user$ = $r3$.ɵɵreference(3);
                   return ctx.onClick($user$.value);
                });
                $r3$.ɵɵtext(1, "Save");
              $r3$.ɵɵelementEnd();
              $r3$.ɵɵelement(2, "input", null, $e2_refs$);
            }
          },
          encapsulation: 2
        });
      `;

    const result = compile(files, angularFiles);
    const source = result.source;

    expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
  });

});
