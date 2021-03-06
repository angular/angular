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

describe('compiler compliance: directives', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileAnimations: false,
    compileFakeCore: true,
  });

  describe('matching', () => {
    it('should not match directives on i18n attribute', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, Directive, NgModule} from '@angular/core';

                @Directive({selector: '[i18n]'})
                export class I18nDirective {}

                @Component({selector: 'my-component', template: '<div i18n></div>'})
                export class MyComponent {}

                @NgModule({declarations: [I18nDirective, MyComponent]})
                export class MyModule{}`
        }
      };

      // MyComponent definition should be:
      const MyComponentDefinition = `
            MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
                type: MyComponent,
                selectors: [["my-component"]],
                decls: 1,
                vars: 0,
                template: function MyComponent_Template(rf, ctx) {
                    if (rf & 1) {
                        $r3$.ɵɵelement(0, "div");
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

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
      expectEmit(source, MyComponentFactory, 'Incorrect ChildComponent.ɵfac');
    });

    it('should not match directives on i18n-prefixed attributes', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, Directive, NgModule} from '@angular/core';

                @Directive({selector: '[i18n]'})
                export class I18nDirective {}

                @Directive({selector: '[i18n-foo]'})
                export class I18nFooDirective {}

                @Directive({selector: '[foo]'})
                export class FooDirective {}

                @Component({selector: 'my-component', template: '<div i18n-foo></div>'})
                export class MyComponent {}

                @NgModule({declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent]})
                export class MyModule{}`
        }
      };

      // MyComponent definition should be:
      const MyComponentDefinition = `
            MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
                type: MyComponent,
                selectors: [["my-component"]],
                decls: 1,
                vars: 0,
                template: function MyComponent_Template(rf, ctx) {
                    if (rf & 1) {
                        $r3$.ɵɵelement(0, "div");
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

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
      expectEmit(source, MyComponentFactory, 'Incorrect ChildComponent.ɵfac');
    });

    it('should match directives on property bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, Input, NgModule} from '@angular/core';

            @Directive({selector: '[someDirective]'})
            export class SomeDirective {
                @Input() someDirective;
            }

            @Component({selector: 'my-component', template: '<div [someDirective]="true"></div>'})
            export class MyComponent {}

            @NgModule({declarations: [SomeDirective, MyComponent]})
            export class MyModule{}
          `
        }
      };


      // MyComponent definition should be:
      const MyComponentDefinition = `
          …
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              …
              consts: [[${AttributeMarker.Bindings}, "someDirective"]],
              template: function MyComponent_Template(rf, ctx) {
                  if (rf & 1) {
                      $r3$.ɵɵelement(0, "div", 0);
                  }
                  if (rf & 2) {
                      $r3$.ɵɵproperty("someDirective", true);
                  }
              },
              …
              directives: [SomeDirective],
              encapsulation: 2
          });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
    });

    it('should match directives on ng-templates', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

            @Directive({
                selector: 'ng-template[directiveA]'
            })
            export class DirectiveA {
                constructor(public templateRef: TemplateRef<any>) {}
            }

            @Component({
              selector: 'my-component',
              template: \`
                <ng-template directiveA>Some content</ng-template>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [DirectiveA, MyComponent]})
            export class MyModule{}
          `
        }
      };

      const MyComponentDefinition = `
        …
        function MyComponent_ng_template_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtext(0, "Some content");
          }
        }
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          …
          consts: [["directiveA", ""]],
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, "ng-template", 0);
            }
          },
          …
          directives: [DirectiveA],
          …
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
    });

    it('should match directives on ng-container', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

              @Directive({
                  selector: 'ng-container[directiveA]'
              })
              export class DirectiveA {
                  constructor(public templateRef: TemplateRef<any>) {}
              }

              @Component({
                selector: 'my-component',
                template: \`
                  <ng-container *ngIf="showing" directiveA>Some content</ng-container>
                \`
              })
              export class MyComponent {}

              @NgModule({declarations: [DirectiveA, MyComponent]})
              export class MyModule{}
            `
        }
      };

      const MyComponentDefinition = `
        …
        function MyComponent_ng_container_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementContainerStart(0, 1);
            $r3$.ɵɵtext(1, "Some content");
            $r3$.ɵɵelementContainerEnd();
          }
        }
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          …
          consts: [["directiveA", "", ${AttributeMarker.Template}, "ngIf"], ["directiveA", ""]],
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵtemplate(0, MyComponent_ng_container_0_Template, 2, 0, "ng-container", 0);
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("ngIf", ctx.showing);
            }
          },
          …
          directives: [DirectiveA],
          …
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
    });

    it('should match directives on ng-template bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, Input, NgModule} from '@angular/core';

            @Directive({selector: '[someDirective]'})
            export class SomeDirective {
                @Input() someDirective;
            }

            @Component({selector: 'my-component', template: '<ng-template [someDirective]="true"></ng-template>'})
            export class MyComponent {}

            @NgModule({declarations: [SomeDirective, MyComponent]})
            export class MyModule{}
          `
        }
      };


      // MyComponent definition should be:
      const MyComponentDefinition = `
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            …
            consts: [[${AttributeMarker.Bindings}, "someDirective"]],
            template: function MyComponent_Template(rf, ctx) {
                if (rf & 1) {
                    $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
                }
                if (rf & 2) {
                    $r3$.ɵɵproperty("someDirective", true);
                }
            },
            …
            directives: [SomeDirective],
            encapsulation: 2
        });
    `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
    });

    it('should match structural directives', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, Input, NgModule} from '@angular/core';

            @Directive({selector: '[someDirective]'})
            export class SomeDirective {
                @Input() someDirective;
            }

            @Component({selector: 'my-component', template: '<div *someDirective></div>'})
            export class MyComponent {}

            @NgModule({declarations: [SomeDirective, MyComponent]})
            export class MyModule{}
          `
        }
      };

      // MyComponent definition should be:
      const MyComponentDefinition = `
          …
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              …
              consts: [[${AttributeMarker.Template}, "someDirective"]],
              template: function MyComponent_Template(rf, ctx) {
                  if (rf & 1) {
                      $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, "div", 0);
                  }
              },
              …
              directives: [SomeDirective],
              encapsulation: 2
          });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
    });

    it('should match directives on element outputs', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, Output, EventEmitter, NgModule} from '@angular/core';

            @Directive({selector: '[someDirective]'})
            export class SomeDirective {
                @Output() someDirective = new EventEmitter();
            }

            @Component({selector: 'my-component', template: '<div (someDirective)="noop()"></div>'})
            export class MyComponent {
                noop() {}
            }

            @NgModule({declarations: [SomeDirective, MyComponent]})
            export class MyModule{}
          `
        }
      };


      // MyComponent definition should be:
      const MyComponentDefinition = `
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            …
            consts: [[${AttributeMarker.Bindings}, "someDirective"]],
            template: function MyComponent_Template(rf, ctx) {
                if (rf & 1) {
                    $r3$.ɵɵelementStart(0, "div", 0);
                    $r3$.ɵɵlistener("someDirective", function MyComponent_Template_div_someDirective_0_listener() { return ctx.noop(); });
                    $r3$.ɵɵelementEnd();
                }
            },
            …
            directives: [SomeDirective],
            encapsulation: 2
        });
    `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
    });
  });
});
