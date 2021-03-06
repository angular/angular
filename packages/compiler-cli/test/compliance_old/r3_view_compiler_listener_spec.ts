/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
        …
        consts: [[${AttributeMarker.Bindings}, "click"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", 0);
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
        …
        consts: [[${AttributeMarker.Bindings}, "click"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "my-app", 0);
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
        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
            const $s$ = $r3$.ɵɵgetCurrentView();
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵelementStart(1, "div", 1);
            $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_1_listener() {
              $r3$.ɵɵrestoreView($s$);
              const $comp$ = $r3$.ɵɵnextContext();
              return $comp$.onClick($comp$.foo);
            });
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(2, "button", 1);
            $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_button_click_2_listener() {
              $r3$.ɵɵrestoreView($s$);
              const $comp2$ = $r3$.ɵɵnextContext();
              return $comp2$.onClick2($comp2$.bar);
            });
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
          }
        }
        // ...
        consts: [[${AttributeMarker.Template}, "ngIf"], [${AttributeMarker.Bindings}, "click"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 0, "div", 0);
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
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          decls: 4,
          vars: 0,
          consts: [[${AttributeMarker.Bindings}, "click"], ["user", ""]],
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              const $s$ = $r3$.ɵɵgetCurrentView();
              $r3$.ɵɵelementStart(0, "button", 0);
                $r3$.ɵɵlistener("click", function MyComponent_Template_button_click_0_listener() {
                   $r3$.ɵɵrestoreView($s$);
                   const $user$ = $r3$.ɵɵreference(3);
                   return ctx.onClick($user$.value);
                });
                $r3$.ɵɵtext(1, "Save");
              $r3$.ɵɵelementEnd();
              $r3$.ɵɵelement(2, "input", null, 1);
            }
          },
          encapsulation: 2
        });
      `;

    const MyComponentFactory = `
      MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
    `;

    const result = compile(files, angularFiles);
    const source = result.source;

    expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ɵcmp');
    expectEmit(source, MyComponentFactory, 'Incorrect MyComponent.ɵfac');
  });

  it('should chain multiple listeners on the same element', () => {
    const files = {
      app: {
        'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`<div (click)="click()" (change)="change()"></div>\`
            })
            export class MyComponent {
            }

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
      }
    };

    const template = `
        …
        consts: [[${AttributeMarker.Bindings}, "click", "change"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", 0);
            $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() {
              return ctx.click();
            })("change", function MyComponent_Template_div_change_0_listener() {
              return ctx.change();
            });
            $r3$.ɵɵelementEnd();
          }
        }
        `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should chain multiple listeners across elements', () => {
    const files = {
      app: {
        'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div (click)="click()" (change)="change()"></div>
                <some-comp (update)="update()" (delete)="delete()"></some-comp>
              \`
            })
            export class MyComponent {
            }

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
      }
    };

    const template = `
        …
        consts: [[${AttributeMarker.Bindings}, "click", "change"], [${
        AttributeMarker.Bindings}, "update", "delete"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", 0);
            $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() { return ctx.click(); })("change", function MyComponent_Template_div_change_0_listener() { return ctx.change(); });
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(1, "some-comp", 1);
            $r3$.ɵɵlistener("update", function MyComponent_Template_some_comp_update_1_listener() { return ctx.update(); })("delete", function MyComponent_Template_some_comp_delete_1_listener() { return ctx.delete(); });
            $r3$.ɵɵelementEnd();
          }
        }
        `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should chain multiple listeners on the same template', () => {
    const files = {
      app: {
        'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`<ng-template (click)="click()" (change)="change()"></ng-template>\`
            })
            export class MyComponent {
            }

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
      }
    };

    const template = `
        …
        consts: [[${AttributeMarker.Bindings}, "click", "change"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
            $r3$.ɵɵlistener("click", function MyComponent_Template_ng_template_click_0_listener() { return ctx.click(); })("change", function MyComponent_Template_ng_template_change_0_listener() { return ctx.change(); });
          }
        }
        `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should not generate the $event argument if it is not being used in a template', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`<div (click)="onClick();"></div>\`
          })
          export class MyComponent {
            onClick() {}
          }
        `
      }
    };

    const template = `
      …
      consts: [[${AttributeMarker.Bindings}, "click"]],
      template: function MyComponent_Template(rf, ctx) {
        if (rf & 1) {
          $r3$.ɵɵelementStart(0, "div", 0);
          $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() {
            return ctx.onClick();
          });
          $r3$.ɵɵelementEnd();
        }
      }
    `;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should not generate the $event argument if it is not being used in a host listener', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Component, HostListener} from '@angular/core';

          @Component({
            template: '',
            host: {
              '(mousedown)': 'mousedown()'
            }
          })
          export class MyComponent {
            mousedown() {}

            @HostListener('click')
            click() {}
          }
        `
      }
    };

    const template = `
      …
      hostBindings: function MyComponent_HostBindings(rf, ctx) {
        if (rf & 1) {
          i0.ɵɵlistener("mousedown", function MyComponent_mousedown_HostBindingHandler() {
            return ctx.mousedown();
          })("click", function MyComponent_click_HostBindingHandler() {
            return ctx.click();
          });
        }
      }
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect host bindings');
  });

  it('should generate the $event argument if it is being used in a host listener', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Directive, HostListener} from '@angular/core';

          @Directive()
          export class MyComponent {
            @HostListener('click', ['$event.target'])
            click(t: EventTarget) {}
          }
        `
      }
    };

    const template = `
      …
      hostBindings: function MyComponent_HostBindings(rf, ctx) {
        if (rf & 1) {
          i0.ɵɵlistener("click", function MyComponent_click_HostBindingHandler($event) {
              return ctx.click($event.target);
          });
        }
      }
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect host bindings');
  });

  it('should assume $event is referring to the event variable in a listener by default', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div (click)="c($event)"></div>'
          })
          class Comp {
            c(event: MouseEvent) {}
          }
        `
      }
    };

    const template = `
      …
      i0.ɵɵlistener("click", function Comp_Template_div_click_0_listener($event) { return ctx.c($event); });
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect event listener');
  });

  it('should preserve accesses to $event if it is done through `this` in a listener', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div (click)="c(this.$event)"></div>'
          })
          class Comp {
            $event = {};
            c(value: {}) {}
          }
        `
      }
    };

    const template = `
      …
      i0.ɵɵlistener("click", function Comp_Template_div_click_0_listener() { return ctx.c(ctx.$event); });
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect event listener');
  });

  it('should not assume that $event is referring to an event object inside a property', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [event]="$event"></div>'
          })
          class Comp {
            $event = 1;
          }
        `
      }
    };

    const template = `
      …
      i0.ɵɵproperty("event", ctx.$event);
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect property binding');
  });

  it('should assume $event is referring to the event variable in a listener by default inside a host binding',
     () => {
       const files = {
         app: {
           'spec.ts': `
              import {Directive} from '@angular/core';

              @Directive({
                host: {
                  '(click)': 'c($event)'
                }
              })
              class Dir {
                c(event: MouseEvent) {}
              }
            `
         }
       };

       const template = `
      …
      i0.ɵɵlistener("click", function Dir_click_HostBindingHandler($event) { return ctx.c($event); });
    `;

       const result = compile(files, angularFiles);
       expectEmit(result.source, template, 'Incorrect event listener');
     });

  it('should preserve accesses to $event if it is done through `this` in a listener inside a host binding',
     () => {
       const files = {
         app: {
           'spec.ts': `
              import {Directive} from '@angular/core';

              @Directive({
                host: {
                  '(click)': 'c(this.$event)'
                }
              })
              class Dir {
                $event = {};
                c(value: {}) {}
              }
            `
         }
       };

       const template = `
      …
      i0.ɵɵlistener("click", function Dir_click_HostBindingHandler() { return ctx.c(ctx.$event); });
    `;

       const result = compile(files, angularFiles);
       expectEmit(result.source, template, 'Incorrect event listener');
     });
});
