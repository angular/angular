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


/**
 * These tests are codified version of the tests in compiler_canonical_spec.ts. Every
 * test in compiler_canonical_spec.ts should have a corresponding test here.
 */
describe('compiler compliance', () => {

  const angularFiles = setup({
    compileAngular: false,
    compileAnimations: false,
    compileFakeCore: true,
  });

  describe('elements', () => {
    it('should handle SVG', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<div class="my-app" title="Hello"><svg><circle cx="20" cy="30" r="50"/></svg><p>test</p></div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      // The factory should look like this:
      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
        const $c1$ = ["title", "Hello", ${AttributeMarker.Classes}, "my-app"];
        const $c2$ = ["cx", "20", "cy", "30", "r", "50"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $c1$);
            $r3$.ɵɵnamespaceSVG();
            $r3$.ɵɵelementStart(1, "svg");
            $r3$.ɵɵelement(2, "circle", $c2$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵnamespaceHTML();
            $r3$.ɵɵelementStart(3, "p");
            $r3$.ɵɵtext(4, "test");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
          }
        }
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should handle MathML', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<div class="my-app" title="Hello"><math><infinity/></math><p>test</p></div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      // The factory should look like this:
      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
        const $c1$ = ["title", "Hello", ${AttributeMarker.Classes}, "my-app"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $c1$);
            $r3$.ɵɵnamespaceMathML();
            $r3$.ɵɵelementStart(1, "math");
            $r3$.ɵɵelement(2, "infinity");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵnamespaceHTML();
            $r3$.ɵɵelementStart(3, "p");
            $r3$.ɵɵtext(4, "test");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
          }
        }
      `;


      const result = compile(files, angularFiles);
      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should translate DOM structure', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<div class="my-app" title="Hello">Hello <b>World</b>!</div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      // The factory should look like this:
      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
        const $c1$ = ["title", "Hello", ${AttributeMarker.Classes}, "my-app"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $c1$);
            $r3$.ɵɵtext(1, "Hello ");
            $r3$.ɵɵelementStart(2, "b");
            $r3$.ɵɵtext(3, "World");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵtext(4, "!");
            $r3$.ɵɵelementEnd();
          }
        }
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    // TODO(https://github.com/angular/angular/issues/24426): We need to support the parser actually
    // building the proper attributes based off of xmlns attributes.
    xit('should support namspaced attributes', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div xmlns:foo="http://someuri/foo" class="my-app" foo:bar="baz" title="Hello" foo:qux="quacks">Hello <b>World</b>!</div>\`
                })
                export class MyComponent {}

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      // The factory should look like this:
      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
          const $e0_attrs$ = ["class", "my-app", 0, "http://someuri/foo", "foo:bar", "baz", "title", "Hello", 0, "http://someuri/foo", "foo:qux", "quacks"];
          …
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "div", $e0_attrs$);
              $r3$.ɵɵtext(1, "Hello ");
              $r3$.ɵɵelementStart(2, "b");
              $r3$.ɵɵtext(3, "World");
              $r3$.ɵɵelementEnd();
              $r3$.ɵɵtext(4, "!");
              $r3$.ɵɵelementEnd();
            }
          }
        `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should support <ng-container>', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<ng-container><span>in a </span>container</ng-container>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              i0.ɵɵelementContainerStart(0);
              i0.ɵɵelementStart(1, "span");
              i0.ɵɵtext(2, "in a ");
              i0.ɵɵelementEnd();
              i0.ɵɵtext(3, "container");
              i0.ɵɵelementContainerEnd();
            }
          }
        `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate self-closing elementContainer instruction for empty <ng-container>', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<ng-container></ng-container>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              i0.ɵɵelementContainer(0);
            }
          }
        `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should bind to element properties', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<div [id]="id"></div>\`
              })
              export class MyComponent {
                id = 'one';
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';
      const template = `
        const $e0_attrs$ = [${AttributeMarker.Bindings}, "id"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "div", $e0_attrs$);
          }
          if (rf & 2) {
            $r3$.ɵɵproperty("id", ctx.id);
          }
        }
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should reserve slots for pure functions', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<div
                  [ternary]="cond ? [a] : [0]"
                  [pipe]="value | pipe:1:2"
                  [and]="cond && [b]"
                  [or]="cond || [c]"
                ></div>\`
              })
              export class MyComponent {
                id = 'one';
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      ///////////////
      // TODO(FW-1273): The code generated below is adding extra parens, and we need to stop
      // generating those.
      //
      // For example:
      // `$r3$.ɵɵproperty("ternary", (ctx.cond ? $r3$.ɵɵpureFunction1(8, $c0$, ctx.a): $c1$));`
      ///////////////

      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';
      const template = `
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "div", $e0_attrs$);
            $r3$.ɵɵpipe(1,"pipe");
          }
          if (rf & 2) {
            $r3$.ɵɵproperty("ternary", ctx.cond ? $r3$.ɵɵpureFunction1(8, $c0$, ctx.a): $c1$)("pipe", $r3$.ɵɵpipeBind3(1, 4, ctx.value, 1, 2))("and", ctx.cond && $r3$.ɵɵpureFunction1(10, $c0$, ctx.b))("or", ctx.cond || $r3$.ɵɵpureFunction1(12, $c0$, ctx.c));
          }
        }
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should reserve slots for pure functions in host binding function', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, Input} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: '...',
              host: {
                '[@expansionHeight]': \`{
                    value: getExpandedState(),
                    params: {
                      collapsedHeight: collapsedHeight,
                      expandedHeight: expandedHeight
                    }
                }\`,
                '[@expansionWidth]': \`{
                  value: getExpandedState(),
                  params: {
                    collapsedWidth: collapsedWidth,
                    expandedWidth: expandedWidth
                  }
                }\`
              }
            })
            export class MyComponent {
              @Input() expandedHeight: string;
              @Input() collapsedHeight: string;

              @Input() expandedWidth: string;
              @Input() collapsedWidth: string;

              getExpandedState() {
                return 'expanded';
              }
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };

      const hostBindingsDef = `
        const $_c0$ = function (a0, a1) { return { collapsedHeight: a0, expandedHeight: a1 }; };
        const $_c1$ = function (a0, a1) { return { value: a0, params: a1 }; };
        const $_c2$ = function (a0, a1) { return { collapsedWidth: a0, expandedWidth: a1 }; };
        …
        hostBindings: function MyComponent_HostBindings(rf, ctx, elIndex) {
          if (rf & 1) {
            $r3$.ɵɵallocHostVars(14);
          }
          if (rf & 2) {
            $r3$.ɵɵupdateSyntheticHostBinding("@expansionHeight",
                $r3$.ɵɵpureFunction2(5, $_c1$, ctx.getExpandedState(),
                  $r3$.ɵɵpureFunction2(2, $_c0$, ctx.collapsedHeight, ctx.expandedHeight)
                )
            )("@expansionWidth",
                $r3$.ɵɵpureFunction2(11, $_c1$, ctx.getExpandedState(),
                  $r3$.ɵɵpureFunction2(8, $_c2$, ctx.collapsedWidth, ctx.expandedWidth)
                )
            );
          }
        },
        …
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, hostBindingsDef, 'Incorrect "hostBindings" function');
    });

    it('should bind to class and style names', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`<div [class.error]="error" [style.background-color]="color"></div>\`
              })
              export class MyComponent {
                error = true;
                color = 'red';
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';
      const template = `
        MyComponent.ngComponentDef = i0.ɵɵdefineComponent({type:MyComponent,selectors:[["my-component"]],
            factory: function MyComponent_Factory(t){
              return new (t || MyComponent)();
            },
            consts: 1,
            vars: 2,
            template: function MyComponent_Template(rf,ctx){
              if (rf & 1) {
                $r3$.ɵɵelementStart(0, "div");
                $r3$.ɵɵstyling();
                $r3$.ɵɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵɵstyleProp("background-color", ctx.color);
                $r3$.ɵɵclassProp("error", ctx.error);
                $r3$.ɵɵstylingApply();
              }
            },
            encapsulation: 2
        });
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

  });

  describe('components & directives', () => {
    it('should instantiate directives', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule} from '@angular/core';

            @Component({selector: 'child', template: 'child-view'})
            export class ChildComponent {}

            @Directive({selector: '[some-directive]'})
            export class SomeDirective {}

            @Component({selector: 'my-component', template: '<child some-directive></child>!'})
            export class MyComponent {}

            @NgModule({declarations: [ChildComponent, SomeDirective, MyComponent]})
            export class MyModule{}
          `
        }
      };

      // ChildComponent definition should be:
      const ChildComponentDefinition = `
        ChildComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: ChildComponent,
          selectors: [["child"]],
          factory: function ChildComponent_Factory(t) { return new (t || ChildComponent)(); },
          consts: 1,
          vars: 0,
          template:  function ChildComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵtext(0, "child-view");
            }
          },
          encapsulation: 2
        });`;

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        SomeDirective.ngDirectiveDef = $r3$.ɵɵdefineDirective({
          type: SomeDirective,
          selectors: [["", "some-directive", ""]],
          factory: function SomeDirective_Factory(t) {return new (t || SomeDirective)(); }
        });
      `;

      // MyComponent definition should be:
      const MyComponentDefinition = `
        const $c1$ = ["some-directive", ""];
        …
        MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          consts: 2,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "child", $c1$);
              $r3$.ɵɵtext(1, "!");
            }
          },
          directives: [ChildComponent, SomeDirective],
          encapsulation: 2
        });
      `;


      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, ChildComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ngDirectiveDef');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponentDefinition.ngComponentDef');
    });

    it('should support complex selectors', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive, NgModule} from '@angular/core';

            @Directive({selector: 'div.foo[some-directive]:not([title]):not(.baz)'})
            export class SomeDirective {}

            @Directive({selector: ':not(span[title]):not(.baz)'})
            export class OtherDirective {}

            @NgModule({declarations: [SomeDirective, OtherDirective]})
            export class MyModule{}
          `
        }
      };

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        SomeDirective.ngDirectiveDef = $r3$.ɵɵdefineDirective({
          type: SomeDirective,
          selectors: [["div", "some-directive", "", 8, "foo", 3, "title", "", 9, "baz"]],
          factory: function SomeDirective_Factory(t) {return new (t || SomeDirective)(); }
        });
      `;

      // OtherDirective definition should be:
      const OtherDirectiveDefinition = `
        OtherDirective.ngDirectiveDef = $r3$.ɵɵdefineDirective({
          type: OtherDirective,
          selectors: [["", 5, "span", "title", "", 9, "baz"]],
          factory: function OtherDirective_Factory(t) {return new (t || OtherDirective)(); }
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ngDirectiveDef');
      expectEmit(source, OtherDirectiveDefinition, 'Incorrect OtherDirective.ngDirectiveDef');
    });

    it('should support components without selector', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule} from '@angular/core';

            @Component({template: '<router-outlet></router-outlet>'})
            export class EmptyOutletComponent {}

            @NgModule({declarations: [EmptyOutletComponent]})
            export class MyModule{}
          `
        }
      };

      // EmptyOutletComponent definition should be:
      const EmptyOutletComponentDefinition = `
        …
        EmptyOutletComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: EmptyOutletComponent,
          selectors: [["ng-component"]],
          factory: function EmptyOutletComponent_Factory(t) { return new (t || EmptyOutletComponent)(); },
          consts: 1,
          vars: 0,
          template: function EmptyOutletComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "router-outlet");
            }
          },
          encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(
          source, EmptyOutletComponentDefinition, 'Incorrect EmptyOutletComponent.ngComponentDef');
    });

    it('should not support directives without selector', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule} from '@angular/core';

            @Directive({})
            export class EmptyOutletDirective {}

            @NgModule({declarations: [EmptyOutletDirective]})
            export class MyModule{}
          `
        }
      };

      expect(() => compile(files, angularFiles))
          .toThrowError('Directive EmptyOutletDirective has no selector, please add it!');
    });

    it('should not support directives with empty selector', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule} from '@angular/core';

            @Directive({selector: ''})
            export class EmptyOutletDirective {}

            @NgModule({declarations: [EmptyOutletDirective]})
            export class MyModule{}
          `
        }
      };

      expect(() => compile(files, angularFiles))
          .toThrowError('Directive EmptyOutletDirective has no selector, please add it!');
    });

    it('should not treat ElementRef, ViewContainerRef, or ChangeDetectorRef specially when injecting',
       () => {
         const files = {
           app: {
             'spec.ts': `
            import {Component, NgModule, ElementRef, ChangeDetectorRef, ViewContainerRef} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: ''
            })
            export class MyComponent {
              constructor(public el: ElementRef, public vcr: ViewContainerRef, public cdr: ChangeDetectorRef) {}
            }

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
            `
           }
         };

         const MyComponentDefinition = `
        …
        MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) {
             return new (t || MyComponent)(
                $r3$.ɵɵdirectiveInject($i$.ElementRef), $r3$.ɵɵdirectiveInject($i$.ViewContainerRef),
                $r3$.ɵɵdirectiveInject($i$.ChangeDetectorRef));
          },
          consts: 0,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {},
          encapsulation: 2
        });`;

         const result = compile(files, angularFiles);
         const source = result.source;

         expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
       });

    it('should support structural directives', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

            @Directive({selector: '[if]'})
            export class IfDirective {
              constructor(template: TemplateRef<any>) { }
            }

            @Component({
              selector: 'my-component',
              template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>'
            })
            export class MyComponent {
              salutation = 'Hello';
            }

            @NgModule({declarations: [IfDirective, MyComponent]})
            export class MyModule {}
            `
        }
      };

      const IfDirectiveDefinition = `
        IfDirective.ngDirectiveDef = $r3$.ɵɵdefineDirective({
          type: IfDirective,
          selectors: [["", "if", ""]],
          factory: function IfDirective_Factory(t) { return new (t || IfDirective)($r3$.ɵɵdirectiveInject($i$.TemplateRef)); }
        });`;
      const MyComponentDefinition = `
        const $c1$ = ["foo", ""];
        const $c2$ = [${AttributeMarker.Template}, "if"];
        function MyComponent_li_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "li");
            $r3$.ɵɵtext(1);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $myComp$ = $r3$.ɵɵnextContext();
            const $foo$ = $r3$.ɵɵreference(1);
            $r3$.ɵɵselect(1);
            $r3$.ɵɵtextInterpolate2("", $myComp$.salutation, " ", $foo$, "");
          }
        }
        …
        MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          consts: 3,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "ul", null, $c1$);
              $r3$.ɵɵtemplate(2, MyComponent_li_2_Template, 2, 2, "li", $c2$);
              $r3$.ɵɵelementEnd();
            }
          },
          directives:[IfDirective],
           encapsulation: 2
        });`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, IfDirectiveDefinition, 'Incorrect IfDirective.ngDirectiveDef');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
    });

    describe('value composition', () => {

      it('should support array literals', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, Input, NgModule} from '@angular/core';

              @Component({
                selector: 'my-comp',
                template: \`
                  <p>{{ names[0] }}</p>
                  <p>{{ names[1] }}</p>
                \`
              })
              export class MyComp {
                @Input() names: string[];
              }

              @Component({
                selector: 'my-app',
                template: \`
                <my-comp [names]="['Nancy', customName]"></my-comp>
              \`
              })
              export class MyApp {
                customName = 'Bess';
              }

              @NgModule({declarations: [MyComp, MyApp]})
              export class MyModule { }
            `
          }
        };

        const MyAppDeclaration = `
          const $e0_attrs$ = [${AttributeMarker.Bindings}, "names"];
          const $e0_ff$ = function ($v$) { return ["Nancy", $v$]; };
          …
          MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            consts: 1,
            vars: 3,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "my-comp", $e0_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵɵproperty("names", $r3$.ɵɵpureFunction1(1, $e0_ff$, ctx.customName));
              }
            },
           directives: [MyComp],
           encapsulation: 2
          });
        `;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyAppDeclaration, 'Invalid array emit');
      });

      it('should support 9+ bindings in array literals', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, Input, NgModule} from '@angular/core';

              @Component({
                selector: 'my-comp',
                template: \`
                  {{ names[0] }}
                  {{ names[1] }}
                  {{ names[3] }}
                  {{ names[4] }}
                  {{ names[5] }}
                  {{ names[6] }}
                  {{ names[7] }}
                  {{ names[8] }}
                  {{ names[9] }}
                  {{ names[10] }}
                  {{ names[11] }}
                \`
              })
              export class MyComp {
                @Input() names: string[];
              }

              @Component({
                selector: 'my-app',
                template: \`
                <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
                </my-comp>
              \`
              })
              export class MyApp {
                n0 = 'a';
                n1 = 'b';
                n2 = 'c';
                n3 = 'd';
                n4 = 'e';
                n5 = 'f';
                n6 = 'g';
                n7 = 'h';
                n8 = 'i';
              }

              @NgModule({declarations: [MyComp, MyApp]})
              export class MyModule {}
              `
          }
        };

        const MyAppDefinition = `
          const $e0_attr$ = [${AttributeMarker.Bindings}, "names"];
          const $e0_ff$ = function ($v0$, $v1$, $v2$, $v3$, $v4$, $v5$, $v6$, $v7$, $v8$) {
            return ["start-", $v0$, $v1$, $v2$, $v3$, $v4$, "-middle-", $v5$, $v6$, $v7$, $v8$, "-end"];
          }
          …
          MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            consts: 1,
            vars: 11,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "my-comp", $e0_attr$);
              }
              if (rf & 2) {
                $r3$.ɵɵproperty("names",
                    $r3$.ɵɵpureFunctionV(1, $e0_ff$, [ctx.n0, ctx.n1, ctx.n2, ctx.n3, ctx.n4, ctx.n5, ctx.n6, ctx.n7, ctx.n8]));
              }
            },
            directives: [MyComp],
            encapsulation: 2
          });
        `;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyAppDefinition, 'Invalid array binding');
      });

      it('should support object literals', () => {
        const files = {
          app: {
            'spec.ts': `
                import {Component, Input, NgModule} from '@angular/core';

                @Component({
                  selector: 'object-comp',
                  template: \`
                    <p> {{ config['duration'] }} </p>
                    <p> {{ config.animation }} </p>
                  \`
                })
                export class ObjectComp {
                  @Input() config: {[key: string]: any};
                }

                @Component({
                  selector: 'my-app',
                  template: \`
                  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
                \`
                })
                export class MyApp {
                  name = 'slide';
                }

                @NgModule({declarations: [ObjectComp, MyApp]})
                export class MyModule {}
              `
          }
        };

        const MyAppDefinition = `
          const $e0_attrs$ = [${AttributeMarker.Bindings}, "config"];
          const $e0_ff$ = function ($v$) { return {"duration": 500, animation: $v$}; };
          …
          MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            consts: 1,
            vars: 3,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "object-comp", $e0_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵɵproperty("config", $r3$.ɵɵpureFunction1(1, $e0_ff$, ctx.name));
              }
            },
            directives: [ObjectComp],
            encapsulation: 2
          });
        `;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyAppDefinition, 'Invalid object literal binding');
      });

      it('should support expressions nested deeply in object/array literals', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, Input, NgModule} from '@angular/core';

              @Component({
                selector: 'nested-comp',
                template: \`
                  <p> {{ config.animation }} </p>
                  <p> {{config.actions[0].opacity }} </p>
                  <p> {{config.actions[1].duration }} </p>
                \`
              })
              export class NestedComp {
                @Input() config: {[key: string]: any};
              }

              @Component({
                selector: 'my-app',
                template: \`
                <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
                </nested-comp>
              \`
              })
              export class MyApp {
                name = 'slide';
                duration = 100;
              }

              @NgModule({declarations: [NestedComp, MyApp]})
              export class MyModule {}
              `
          }
        };

        const MyAppDefinition = `
          const $e0_attrs$ = [${AttributeMarker.Bindings}, "config"];
          const $c0$ = {opacity: 0, duration: 0};
          const $e0_ff$ = function ($v$) { return {opacity: 1, duration: $v$}; };
          const $e0_ff_1$ = function ($v$) { return [$c0$, $v$]; };
          const $e0_ff_2$ = function ($v1$, $v2$) { return {animation: $v1$, actions: $v2$}; };
          …
          MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            consts: 1,
            vars: 8,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "nested-comp", $e0_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵɵproperty(
                    "config",
                    $r3$.ɵɵpureFunction2(5, $e0_ff_2$, ctx.name, $r3$.ɵɵpureFunction1(3, $e0_ff_1$, $r3$.ɵɵpureFunction1(1, $e0_ff$, ctx.duration))));
              }
            },
            directives: [NestedComp],
            encapsulation: 2
          });
        `;


        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyAppDefinition, 'Invalid array/object literal binding');
      });
    });

    describe('content projection', () => {

      it('should support content projection in root template', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

              @Component({selector: 'simple', template: '<div><ng-content></ng-content></div>'})
              export class SimpleComponent {}

              @Component({
                selector: 'complex',
                template: \`
                  <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
                  <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>\`
                })
              export class ComplexComponent { }

              @NgModule({declarations: [SimpleComponent, ComplexComponent]})
              export class MyModule {}

              @Component({
                selector: 'my-app',
                template: '<simple>content</simple> <complex></complex>'
              })
              export class MyApp {}
            `
          }
        };

        const SimpleComponentDefinition = `
          SimpleComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: SimpleComponent,
            selectors: [["simple"]],
            factory: function SimpleComponent_Factory(t) { return new (t || SimpleComponent)(); },
            ngContentSelectors: $c0$,
            consts: 2,
            vars: 0,
            template:  function SimpleComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵprojectionDef();
                $r3$.ɵɵelementStart(0, "div");
                $r3$.ɵɵprojection(1);
                $r3$.ɵɵelementEnd();
              }
            },
            encapsulation: 2
          });`;

        const ComplexComponentDefinition = `
          const $c3$ = ["id","first"];
          const $c4$ = ["id","second"];
          const $c1$ = [[["span", "title", "tofirst"]], [["span", "title", "tosecond"]]];
          …
          ComplexComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: ComplexComponent,
            selectors: [["complex"]],
            factory: function ComplexComponent_Factory(t) { return new (t || ComplexComponent)(); },
            ngContentSelectors: _c4,
            consts: 4,
            vars: 0,
            template:  function ComplexComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵprojectionDef($c1$);
                $r3$.ɵɵelementStart(0, "div", $c3$);
                $r3$.ɵɵprojection(1);
                $r3$.ɵɵelementEnd();
                $r3$.ɵɵelementStart(2, "div", $c4$);
                $r3$.ɵɵprojection(3, 1);
                $r3$.ɵɵelementEnd();
              }
            },
            encapsulation: 2
          });
        `;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(
            result.source, SimpleComponentDefinition, 'Incorrect SimpleComponent definition');
        expectEmit(
            result.source, ComplexComponentDefinition, 'Incorrect ComplexComponent definition');
      });

      it('should support multi-slot content projection with multiple wildcard slots', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                template: \`
                  <ng-content></ng-content>
                  <ng-content select="[spacer]"></ng-content>
                  <ng-content></ng-content>
                \`,
              })
              class Cmp {}

              @NgModule({ declarations: [Cmp] })
              class Module {}
            `,
          }
        };

        const output = `
          const $c0$ = ["*", [["", "spacer", ""]], "*"];
          const $c1$ = ["*", "[spacer]", "*"];
          …
          Cmp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: Cmp,
            selectors: [["ng-component"]],
            factory: function Cmp_Factory(t) { return new (t || Cmp)(); },
            ngContentSelectors: $c1$,
            consts: 3,
            vars: 0,
            template: function Cmp_Template(rf, ctx) {
              if (rf & 1) {
                i0.ɵɵprojectionDef($c0$);
                i0.ɵɵprojection(0);
                i0.ɵɵprojection(1, 1);
                i0.ɵɵprojection(2, 2);
              }
            },
            encapsulation: 2
          });
        `;

        const {source} = compile(files, angularFiles);
        expectEmit(source, output, 'Invalid content projection instructions generated');
      });

      it('should support content projection in nested templates', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                template: \`
                  <div id="second" *ngIf="visible">
                    <ng-content SELECT="span[title=toFirst]"></ng-content>
                  </div>
                  <div id="third" *ngIf="visible">
                    No ng-content, no instructions generated.
                  </div>
                  <ng-template>
                    '*' selector: <ng-content></ng-content>
                  </ng-template>
                \`,
              })
              class Cmp {}

              @NgModule({ declarations: [Cmp] })
              class Module {}
            `
          }
        };
        const output = `
          const $_c0$ = ["id", "second", ${AttributeMarker.Template}, "ngIf"];
          const $_c1$ = ["id", "third", ${AttributeMarker.Template}, "ngIf"];
          const $_c2$ = ["id", "second"];
          function Cmp_div_0_Template(rf, ctx) { if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c2$);
            $r3$.ɵɵprojection(1);
            $r3$.ɵɵelementEnd();
          } }
          const $_c3$ = ["id", "third"];
          function Cmp_div_1_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "div", $_c3$);
              $r3$.ɵɵtext(1, " No ng-content, no instructions generated. ");
              $r3$.ɵɵelementEnd();
            }
          }
          function Cmp_ng_template_2_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵtext(0, " '*' selector: ");
              $r3$.ɵɵprojection(1, 1);
            }
          }
          const $_c4$ = [[["span", "title", "tofirst"]], "*"];
          …
          template: function Cmp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵprojectionDef($_c4$);
              $r3$.ɵɵtemplate(0, Cmp_div_0_Template, 2, 0, "div", $_c0$);
              $r3$.ɵɵtemplate(1, Cmp_div_1_Template, 2, 0, "div", $_c1$);
              $r3$.ɵɵtemplate(2, Cmp_ng_template_2_Template, 2, 0, "ng-template");
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("ngIf", ctx.visible);
              $r3$.ɵɵselect(1);
              $r3$.ɵɵproperty("ngIf", ctx.visible);
            }
          }
        `;

        const {source} = compile(files, angularFiles);
        expectEmit(source, output, 'Invalid content projection instructions generated');
      });

      it('should support content projection in both the root and nested templates', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                template: \`
                  <ng-content select="[id=toMainBefore]"></ng-content>
                  <ng-template>
                    <ng-content select="[id=toTemplate]"></ng-content>
                    <ng-template>
                      <ng-content select="[id=toNestedTemplate]"></ng-content>
                    </ng-template>
                  </ng-template>
                  <ng-template>
                    '*' selector in a template: <ng-content></ng-content>
                  </ng-template>
                  <ng-content select="[id=toMainAfter]"></ng-content>
                \`,
              })
              class Cmp {}

              @NgModule({ declarations: [Cmp] })
              class Module {}
            `
          }
        };

        const output = `
          function Cmp_ng_template_1_ng_template_1_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵprojection(0, 3);
            }
          }
          function Cmp_ng_template_1_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵprojection(0, 2);
              $r3$.ɵɵtemplate(1, Cmp_ng_template_1_ng_template_1_Template, 1, 0, "ng-template");
            }
          }
          function Cmp_ng_template_2_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵtext(0, " '*' selector in a template: ");
              $r3$.ɵɵprojection(1, 4);
            }
          }
          const $_c0$ = [[["", "id", "tomainbefore"]], [["", "id", "tomainafter"]], [["", "id", "totemplate"]], [["", "id", "tonestedtemplate"]], "*"];
          const $_c1$ = ["[id=toMainBefore]", "[id=toMainAfter]", "[id=toTemplate]", "[id=toNestedTemplate]", "*"];
          …
          template: function Cmp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵprojectionDef($_c0$);
              $r3$.ɵɵprojection(0);
              $r3$.ɵɵtemplate(1, Cmp_ng_template_1_Template, 2, 0, "ng-template");
              $r3$.ɵɵtemplate(2, Cmp_ng_template_2_Template, 2, 0, "ng-template");
              $r3$.ɵɵprojection(3, 1);
            }
          }
        `;

        const {source} = compile(files, angularFiles);
        expectEmit(source, output, 'Invalid content projection instructions generated');
      });

      it('should parse the selector that is passed into ngProjectAs', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'simple',
                template: '<div><ng-content select="[title]"></ng-content></div>'
              })
              export class SimpleComponent {}

              @NgModule({declarations: [SimpleComponent]})
              export class MyModule {}

              @Component({
                selector: 'my-app',
                template: '<simple><h1 ngProjectAs="[title]"></h1></simple>'
              })
              export class MyApp {}
            `
          }
        };

        // Note that the c0 and c1 constants aren't being used in this particular test,
        // but they are used in some of the logic that is folded under the ellipsis.
        const SimpleComponentDefinition = `
          const $_c0$ = [[["", "title", ""]]];
          const $_c1$ = ["[title]"];
          const $_c2$ = [5, ["", "title", ""]];
          …
          MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) {
                return new(t || MyApp)();
            },
            consts: 2,
            vars: 0,
            template: function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                    $r3$.ɵɵelementStart(0, "simple");
                    $r3$.ɵɵelement(1, "h1", $_c2$);
                    $r3$.ɵɵelementEnd();
                }
            },
            encapsulation: 2
        })`;

        const result = compile(files, angularFiles);

        expectEmit(
            result.source, SimpleComponentDefinition, 'Incorrect SimpleComponent definition');
      });

      it('should take the first selector if multiple values are passed into ngProjectAs', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'simple',
                template: '<div><ng-content select="[title]"></ng-content></div>'
              })
              export class SimpleComponent {}

              @NgModule({declarations: [SimpleComponent]})
              export class MyModule {}

              @Component({
                selector: 'my-app',
                template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>'
              })
              export class MyApp {}
            `
          }
        };

        // Note that the c0 and c1 constants aren't being used in this particular test,
        // but they are used in some of the logic that is folded under the ellipsis.
        const SimpleComponentDefinition = `
          const $_c0$ = [[["", "title", ""]]];
          const $_c1$ = ["[title]"];
          const $_c2$ = [5, ["", "title", ""]];
          …
          MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) {
                return new(t || MyApp)();
            },
            consts: 2,
            vars: 0,
            template: function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                    $r3$.ɵɵelementStart(0, "simple");
                    $r3$.ɵɵelement(1, "h1", $_c2$);
                    $r3$.ɵɵelementEnd();
                }
            },
            encapsulation: 2
        })`;

        const result = compile(files, angularFiles);

        expectEmit(
            result.source, SimpleComponentDefinition, 'Incorrect SimpleComponent definition');
      });

    });

    describe('queries', () => {
      const directive = {
        'some.directive.ts': `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[someDir]',
          })
          export class SomeDirective { }
        `
      };

      it('should support view queries with directives', () => {
        const files = {
          app: {
            ...directive,
            'view_query.component.ts': `
            import {Component, NgModule, ViewChild, ViewChildren} from '@angular/core';
            import {SomeDirective} from './some.directive';

            @Component({
              selector: 'view-query-component',
              template: \`
                <div someDir></div>
              \`
            })
            export class ViewQueryComponent {
              @ViewChild(SomeDirective) someDir: SomeDirective;
              @ViewChildren(SomeDirective) someDirs: QueryList<SomeDirective>;
            }

            @NgModule({declarations: [SomeDirective, ViewQueryComponent]})
            export class MyModule {}
            `
          }
        };

        const ViewQueryComponentDefinition = `
          const $e0_attrs$ = ["someDir",""];
          …
          ViewQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: ViewQueryComponent,
            selectors: [["view-query-component"]],
            factory: function ViewQueryComponent_Factory(t) { return new (t || ViewQueryComponent)(); },
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵviewQuery(SomeDirective, true);
                $r3$.ɵɵviewQuery(SomeDirective, true);
              }
              if (rf & 2) {
                var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.someDirs = $tmp$);
              }
            },
            consts: 1,
            vars: 0,
            template:  function ViewQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "div", $e0_attrs$);
              }
            },
            directives: function () { return [SomeDirective]; },
            encapsulation: 2
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ViewQueryComponentDefinition, 'Invalid ViewQuery declaration');
      });

      it('should support view queries with local refs', () => {
        const files = {
          app: {
            'view_query.component.ts': `
            import {Component, NgModule, ViewChild, ViewChildren, QueryList} from '@angular/core';

            @Component({
              selector: 'view-query-component',
              template: \`
                <div #myRef></div>
                <div #myRef1></div>
              \`
            })
            export class ViewQueryComponent {
              @ViewChild('myRef') myRef: any;
              @ViewChildren('myRef1, myRef2, myRef3') myRefs: QueryList<any>;
            }

            @NgModule({declarations: [ViewQueryComponent]})
            export class MyModule {}
            `
          }
        };

        const ViewQueryComponentDefinition = `
          const $e0_attrs$ = ["myRef"];
          const $e1_attrs$ = ["myRef1", "myRef2", "myRef3"];
          …
          ViewQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            …
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵviewQuery($e0_attrs$, true);
                $r3$.ɵɵviewQuery($e1_attrs$, true);
              }
              if (rf & 2) {
                var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.myRefs = $tmp$);
              }
            },
            …
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ViewQueryComponentDefinition, 'Invalid ViewQuery declaration');
      });

      it('should support static view queries', () => {
        const files = {
          app: {
            ...directive,
            'view_query.component.ts': `
            import {Component, NgModule, ViewChild} from '@angular/core';
            import {SomeDirective} from './some.directive';

            @Component({
              selector: 'view-query-component',
              template: \`
                <div someDir></div>
              \`
            })
            export class ViewQueryComponent {
              @ViewChild(SomeDirective, {static: true}) someDir !: SomeDirective;
              @ViewChild('foo', {static: false}) foo !: ElementRef;
            }

            @NgModule({declarations: [SomeDirective, ViewQueryComponent]})
            export class MyModule {}
            `
          }
        };

        const ViewQueryComponentDefinition = `
          const $refs$ = ["foo"];
          const $e0_attrs$ = ["someDir",""];
          …
          ViewQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: ViewQueryComponent,
            selectors: [["view-query-component"]],
            factory: function ViewQueryComponent_Factory(t) { return new (t || ViewQueryComponent)(); },
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵstaticViewQuery(SomeDirective, true);
                $r3$.ɵɵviewQuery($refs$, true);
              }
              if (rf & 2) {
                var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.foo = $tmp$.first);
              }
            },
            consts: 1,
            vars: 0,
            template:  function ViewQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "div", $e0_attrs$);
              }
            },
            directives: function () { return [SomeDirective]; },
            encapsulation: 2
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ViewQueryComponentDefinition, 'Invalid ViewQuery declaration');
      });

      it('should support view queries with read tokens specified', () => {
        const files = {
          app: {
            ...directive,
            'view_query.component.ts': `
            import {Component, NgModule, ViewChild, ViewChildren, QueryList, ElementRef, TemplateRef} from '@angular/core';
            import {SomeDirective} from './some.directive';

            @Component({
              selector: 'view-query-component',
              template: \`
                <div someDir></div>
                <div #myRef></div>
                <div #myRef1></div>
              \`
            })
            export class ViewQueryComponent {
              @ViewChild('myRef', {read: TemplateRef}) myRef: TemplateRef;
              @ViewChildren('myRef1, myRef2, myRef3', {read: ElementRef}) myRefs: QueryList<ElementRef>;
              @ViewChild(SomeDirective, {read: ElementRef}) someDir: ElementRef;
              @ViewChildren(SomeDirective, {read: TemplateRef}) someDirs: QueryList<TemplateRef>;
            }

            @NgModule({declarations: [ViewQueryComponent]})
            export class MyModule {}
            `
          }
        };

        const ViewQueryComponentDefinition = `
          const $e0_attrs$ = ["myRef"];
          const $e1_attrs$ = ["myRef1", "myRef2", "myRef3"];
          …
          ViewQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            …
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵviewQuery($e0_attrs$, true, TemplateRef);
                $r3$.ɵɵviewQuery(SomeDirective, true, ElementRef);
                $r3$.ɵɵviewQuery($e1_attrs$, true, ElementRef);
                $r3$.ɵɵviewQuery(SomeDirective, true, TemplateRef);
              }
              if (rf & 2) {
                var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.myRefs = $tmp$);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.someDirs = $tmp$);
              }
            },
            …
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ViewQueryComponentDefinition, 'Invalid ViewQuery declaration');
      });

      it('should support content queries with directives', () => {
        const files = {
          app: {
            ...directive,
            'content_query.ts': `
            import {Component, ContentChild, ContentChildren, NgModule, QueryList} from '@angular/core';
            import {SomeDirective} from './some.directive';

            @Component({
              selector: 'content-query-component',
              template: \`
                <div><ng-content></ng-content></div>
              \`
            })
            export class ContentQueryComponent {
              @ContentChild(SomeDirective, {static: false}) someDir: SomeDirective;
              @ContentChildren(SomeDirective) someDirList !: QueryList<SomeDirective>;
            }

            @Component({
              selector: 'my-app',
              template: \`
                <content-query-component>
                  <div someDir></div>
                </content-query-component>
              \`
            })
            export class MyApp { }

            @NgModule({declarations: [SomeDirective, ContentQueryComponent, MyApp]})
            export class MyModule { }
            `
          }
        };

        const ContentQueryComponentDefinition = `
          ContentQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: ContentQueryComponent,
            selectors: [["content-query-component"]],
            factory: function ContentQueryComponent_Factory(t) {
              return new (t || ContentQueryComponent)();
            },
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, true);
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, false);
              }
              if (rf & 2) {
              var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.someDirList = $tmp$);
              }
            },
            ngContentSelectors: _c0,
            consts: 2,
            vars: 0,
            template:  function ContentQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵprojectionDef();
                $r3$.ɵɵelementStart(0, "div");
                $r3$.ɵɵprojection(1);
                $r3$.ɵɵelementEnd();
              }
            },
            encapsulation: 2
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ContentQueryComponentDefinition, 'Invalid ContentQuery declaration');
      });

      it('should support content queries with local refs', () => {
        const files = {
          app: {
            'content_query.component.ts': `
            import {Component, ContentChild, ContentChildren, NgModule, QueryList} from '@angular/core';

            @Component({
              selector: 'content-query-component',
              template: \`
                <div #myRef></div>
                <div #myRef1></div>
              \`
            })
            export class ContentQueryComponent {
              @ContentChild('myRef', {static: false}) myRef: any;
              @ContentChildren('myRef1, myRef2, myRef3') myRefs: QueryList<any>;
            }
            @NgModule({declarations: [ContentQueryComponent]})
            export class MyModule {}
          `
          }
        };

        const ContentQueryComponentDefinition = `
          const $e0_attrs$ = ["myRef"];
          const $e1_attrs$ = ["myRef1", "myRef2", "myRef3"];
          …
          ContentQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            …
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
              $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, true);
              $r3$.ɵɵcontentQuery(dirIndex, $e1_attrs$, false);
              }
              if (rf & 2) {
              var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.myRefs = $tmp$);
              }
            },
            …
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ContentQueryComponentDefinition, 'Invalid ContentQuery declaration');
      });

      it('should support static content queries', () => {
        const files = {
          app: {
            ...directive,
            'content_query.ts': `
            import {Component, ContentChild, NgModule} from '@angular/core';
            import {SomeDirective} from './some.directive';

            @Component({
              selector: 'content-query-component',
              template: \`
                <div><ng-content></ng-content></div>
              \`
            })
            export class ContentQueryComponent {
              @ContentChild(SomeDirective, {static: true}) someDir !: SomeDirective;
              @ContentChild('foo', {static: false}) foo !: ElementRef;
            }

            @Component({
              selector: 'my-app',
              template: \`
                <content-query-component>
                  <div someDir></div>
                </content-query-component>
              \`
            })
            export class MyApp { }

            @NgModule({declarations: [SomeDirective, ContentQueryComponent, MyApp]})
            export class MyModule { }
            `
          }
        };

        const ContentQueryComponentDefinition = `
          ContentQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: ContentQueryComponent,
            selectors: [["content-query-component"]],
            factory: function ContentQueryComponent_Factory(t) {
              return new (t || ContentQueryComponent)();
            },
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
              $r3$.ɵɵstaticContentQuery(dirIndex, SomeDirective, true);
              $r3$.ɵɵcontentQuery(dirIndex, $ref0$, true);
              }
              if (rf & 2) {
              var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.foo = $tmp$.first);
              }
            },
            ngContentSelectors: $_c1$,
            consts: 2,
            vars: 0,
            template:  function ContentQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵprojectionDef();
                $r3$.ɵɵelementStart(0, "div");
                $r3$.ɵɵprojection(1);
                $r3$.ɵɵelementEnd();
              }
            },
            encapsulation: 2
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ContentQueryComponentDefinition, 'Invalid ContentQuery declaration');
      });

      it('should support content queries with read tokens specified', () => {
        const files = {
          app: {
            ...directive,
            'content_query.component.ts': `
            import {Component, ContentChild, ContentChildren, NgModule, QueryList, ElementRef, TemplateRef} from '@angular/core';
            import {SomeDirective} from './some.directive';

            @Component({
              selector: 'content-query-component',
              template: \`
                <div someDir></div>
                <div #myRef></div>
                <div #myRef1></div>
              \`
            })
            export class ContentQueryComponent {
              @ContentChild('myRef', {read: TemplateRef, static: false}) myRef: TemplateRef;
              @ContentChildren('myRef1, myRef2, myRef3', {read: ElementRef}) myRefs: QueryList<ElementRef>;
              @ContentChild(SomeDirective, {read: ElementRef, static: false}) someDir: ElementRef;
              @ContentChildren(SomeDirective, {read: TemplateRef}) someDirs: QueryList<TemplateRef>;
            }
            @NgModule({declarations: [ContentQueryComponent]})
            export class MyModule {}
          `
          }
        };

        const ContentQueryComponentDefinition = `
          const $e0_attrs$ = ["myRef"];
          const $e1_attrs$ = ["myRef1", "myRef2", "myRef3"];
          …
          ContentQueryComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            …
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
                $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, true, TemplateRef);
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, true, ElementRef);
              $r3$.ɵɵcontentQuery(dirIndex, $e1_attrs$, false, ElementRef);
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, false, TemplateRef);
              }
              if (rf & 2) {
              var $tmp$;
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.myRefs = $tmp$);
                $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.someDirs = $tmp$);
              }
            },
            …
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ContentQueryComponentDefinition, 'Invalid ContentQuery declaration');
      });
    });

    describe('pipes', () => {

      it('should render pipes', () => {

        const files = {
          app: {
            'spec.ts': `
                import {Component, NgModule, Pipe, PipeTransform, OnDestroy} from '@angular/core';

                @Pipe({
                  name: 'myPipe',
                  pure: false
                })
                export class MyPipe implements PipeTransform,
                    OnDestroy {
                  transform(value: any, ...args: any[]) { return value; }
                  ngOnDestroy(): void {  }
                }

                @Pipe({
                  name: 'myPurePipe',
                  pure: true,
                })
                export class MyPurePipe implements PipeTransform {
                  transform(value: any, ...args: any[]) { return value; }
                }

                @Component({
                  selector: 'my-app',
                  template: '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>'
                })
                export class MyApp {
                  name = 'World';
                  size = 0;
                }

                @NgModule({declarations:[MyPipe, MyPurePipe, MyApp]})
                export class MyModule {}
            `
          }
        };

        const MyPipeDefinition = `
            MyPipe.ngPipeDef = $r3$.ɵɵdefinePipe({
              name: "myPipe",
              type: MyPipe,
              factory: function MyPipe_Factory(t) { return new (t || MyPipe)(); },
              pure: false
            });
        `;

        const MyPurePipeDefinition = `
            MyPurePipe.ngPipeDef = $r3$.ɵɵdefinePipe({
              name: "myPurePipe",
              type: MyPurePipe,
              factory: function MyPurePipe_Factory(t) { return new (t || MyPurePipe)(); },
              pure: true
            });`;

        const MyAppDefinition = `
            const $c0$ = function ($a0$) {
              return [$a0$, 1, 2, 3, 4, 5];
            };
            // ...
            MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
              type: MyApp,
              selectors: [["my-app"]],
              factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
              consts: 7,
              vars: 20,
              template:  function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                  $r3$.ɵɵtext(0);
                  $r3$.ɵɵpipe(1, "myPurePipe");
                  $r3$.ɵɵpipe(2, "myPipe");
                  $r3$.ɵɵelementStart(3, "p");
                  $r3$.ɵɵtext(4);
                  $r3$.ɵɵpipe(5, "myPipe");
                  $r3$.ɵɵpipe(6, "myPipe");
                  $r3$.ɵɵelementEnd();
                }
                if (rf & 2) {
                  $r3$.ɵɵtextInterpolate($r3$.ɵɵpipeBind2(1, 3, $r3$.ɵɵpipeBind2(2, 6, ctx.name, ctx.size), ctx.size));
                  $r3$.ɵɵselect(4);
                  $r3$.ɵɵtextInterpolate2("", $r3$.ɵɵpipeBindV(5, 9, $r3$.ɵɵpureFunction1(18, $c0$, ctx.name)), " ", ctx.name ? 1 : $r3$.ɵɵpipeBind1(6, 16, 2), "");
                }
              },
              pipes: [MyPurePipe, MyPipe],
              encapsulation: 2
            });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyPipeDefinition, 'Invalid pipe definition');
        expectEmit(source, MyPurePipeDefinition, 'Invalid pure pipe definition');
        expectEmit(source, MyAppDefinition, 'Invalid MyApp definition');
      });

      it('should use appropriate function for a given no of pipe arguments', () => {
        const files = {
          app: {
            'spec.ts': `
                import {Component, NgModule, Pipe, PipeTransform, OnDestroy} from '@angular/core';

                @Pipe({
                  name: 'myPipe',
                  pure: false
                })
                export class MyPipe implements PipeTransform,
                    OnDestroy {
                  transform(value: any, ...args: any[]) { return value; }
                  ngOnDestroy(): void {  }
                }

                @Component({
                  selector: 'my-app',
                  template: '0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}'
                })
                export class MyApp {
                }

                @NgModule({declarations:[MyPipe, MyApp]})
                export class MyModule {}
            `
          }
        };

        const MyAppDefinition = `
            // ...
            MyApp.ngComponentDef = $r3$.ɵɵdefineComponent({
              type: MyApp,
              selectors: [["my-app"]],
              factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
              consts: 6,
              vars: 27,
              template:  function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                  $r3$.ɵɵtext(0);
                  $r3$.ɵɵpipe(1, "myPipe");
                  $r3$.ɵɵpipe(2, "myPipe");
                  $r3$.ɵɵpipe(3, "myPipe");
                  $r3$.ɵɵpipe(4, "myPipe");
                  $r3$.ɵɵpipe(5, "myPipe");
                }
                if (rf & 2) {
                  $r3$.ɵɵtextInterpolate5(
                    "0:", i0.ɵɵpipeBind1(1, 5, ctx.name),
                    "1:", i0.ɵɵpipeBind2(2, 7, ctx.name, 1),
                    "2:", i0.ɵɵpipeBind3(3, 10, ctx.name, 1, 2),
                    "3:", i0.ɵɵpipeBind4(4, 14, ctx.name, 1, 2, 3),
                    "4:", i0.ɵɵpipeBindV(5, 19, $r3$.ɵɵpureFunction1(25, $c0$, ctx.name)),
                    ""
                  );
                }
              },
              pipes: [MyPipe],
              encapsulation: 2
            });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyAppDefinition, 'Invalid MyApp definition');
      });

      it('should generate the proper instruction when injecting ChangeDetectorRef into a pipe',
         () => {

           const files = {
             app: {
               'spec.ts': `
                  import {Component, NgModule, Pipe, PipeTransform, ChangeDetectorRef, Optional} from '@angular/core';

                  @Pipe({name: 'myPipe'})
                  export class MyPipe implements PipeTransform {
                    constructor(changeDetectorRef: ChangeDetectorRef) {}

                    transform(value: any, ...args: any[]) { return value; }
                  }

                  @Pipe({name: 'myOtherPipe'})
                  export class MyOtherPipe implements PipeTransform {
                    constructor(@Optional() changeDetectorRef: ChangeDetectorRef) {}

                    transform(value: any, ...args: any[]) { return value; }
                  }

                  @Component({
                    selector: 'my-app',
                    template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>'
                  })
                  export class MyApp {
                    name = 'World';
                  }

                  @NgModule({declarations:[MyPipe, MyOtherPipe, MyApp]})
                  export class MyModule {}
                `
             }
           };

           const MyPipeDefinition = `
              MyPipe.ngPipeDef = $r3$.ɵɵdefinePipe({
                name: "myPipe",
                type: MyPipe,
                factory: function MyPipe_Factory(t) { return new (t || MyPipe)($r3$.ɵɵinjectPipeChangeDetectorRef()); },
                pure: true
              });
            `;

           const MyOtherPipeDefinition = `
              MyOtherPipe.ngPipeDef = $r3$.ɵɵdefinePipe({
                name: "myOtherPipe",
                type: MyOtherPipe,
                factory: function MyOtherPipe_Factory(t) { return new (t || MyOtherPipe)($r3$.ɵɵinjectPipeChangeDetectorRef(8)); },
                pure: true
              });`;

           const result = compile(files, angularFiles);
           const source = result.source;

           expectEmit(source, MyPipeDefinition, 'Invalid pipe definition');
           expectEmit(source, MyOtherPipeDefinition, 'Invalid alternate pipe definition');
         });

    });

    it('local reference', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({selector: 'my-component', template: '<input #user>Hello {{user.value}}!'})
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const MyComponentDefinition = `
        const $c1$ = ["user", ""];
        …
        MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          consts: 3,
          vars: 1,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "input", null, $c1$);
              $r3$.ɵɵtext(2);
            }
            if (rf & 2) {
              const $user$ = $r3$.ɵɵreference(1);
              $r3$.ɵɵselect(2);
              $r3$.ɵɵtextInterpolate1("Hello ", $user$.value, "!");
            }
          },
          encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
    });

    it('local references in nested views', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

            @Directive({selector: '[if]'})
            export class IfDirective {
              constructor(template: TemplateRef<any>) { }
            }

            @Component({
              selector: 'my-component',
              template: \`
                <div #foo></div>
                {{foo}}
                <div *if>
                  {{foo}}-{{bar}}
                  <span *if>{{foo}}-{{bar}}-{{baz}}</span>
                  <span #bar></span>
                </div>
                <div #baz></div>
                \`
            })
            export class MyComponent {}

            @NgModule({declarations: [IfDirective, MyComponent]})
            export class MyModule {}
            `
        }
      };

      const MyComponentDefinition = `
        const $c1$ = ["foo", ""];
        const $c2$ = [${AttributeMarker.Template}, "if"];
        const $c3$ = ["baz", ""];
        const $c4$ = ["bar", ""];
        function MyComponent_div_3_span_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "span");
            $r3$.ɵɵtext(1);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵnextContext();
            const $bar$ = $r3$.ɵɵreference(4);
            $r3$.ɵɵnextContext();
            const $foo$ = $r3$.ɵɵreference(1);
            const $baz$ = $r3$.ɵɵreference(5);
            $r3$.ɵɵselect(1);
            $r3$.ɵɵtextInterpolate3("", $foo$, "-", $bar$, "-", $baz$, "");
          }
        }
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵtext(1);
            $r3$.ɵɵtemplate(2, MyComponent_div_3_span_2_Template, 2, 3, "span", $c2$);
            $r3$.ɵɵelement(3, "span", null, $c4$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $bar$ = $r3$.ɵɵreference(4);
            $r3$.ɵɵnextContext();
            const $foo$ = $r3$.ɵɵreference(1);
            $r3$.ɵɵselect(1);
            $r3$.ɵɵtextInterpolate2(" ", $foo$, "-", $bar$, " ");
          }
        }
        …
        MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          consts: 6,
          vars: 1,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div", null, $c1$);
              $r3$.ɵɵtext(2);
              $r3$.ɵɵtemplate(3, MyComponent_div_3_Template, 5, 2, "div", $c2$);
              $r3$.ɵɵelement(4, "div", null, $c3$);
            }
            if (rf & 2) {
              const $foo$ = $r3$.ɵɵreference(1);
              $r3$.ɵɵselect(2);
              $r3$.ɵɵtextInterpolate1(" ", $foo$, " ");
            }
          },
          directives:[IfDirective],
          encapsulation: 2
        });`;

      const result = compile(files, angularFiles);
      const source = result.source;
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
    });

    it('should support local refs mixed with context assignments', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <div *ngFor="let item of items">
                     <div #foo></div>
                      <span *ngIf="showing">
                        {{ foo }} - {{ item }}
                      </span>
                  </div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
        }
      };

      const template = `
      const $c0$ = [${AttributeMarker.Template}, "ngFor", "ngForOf"];
      const $c1$ = ["foo", ""];
      const $c2$ = [${AttributeMarker.Template}, "ngIf"];

      function MyComponent_div_0_span_3_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵɵelementStart(0, "span");
          $i0$.ɵɵtext(1);
          $i0$.ɵɵelementEnd();
        }
        if (rf & 2) {
          const $item$ = $i0$.ɵɵnextContext().$implicit;
          const $foo$ = $i0$.ɵɵreference(2);
          $r3$.ɵɵselect(1);
          $i0$.ɵɵtextInterpolate2(" ", $foo$, " - ", $item$, " ");
        }
      }

      function MyComponent_div_0_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵɵelementStart(0, "div");
          $i0$.ɵɵelement(1, "div", null, $c1$);
          $i0$.ɵɵtemplate(3, MyComponent_div_0_span_3_Template, 2, 2, "span", $c2$);
          $i0$.ɵɵelementEnd();
        }
        if (rf & 2) {
          const $app$ = $i0$.ɵɵnextContext();
          $r3$.ɵɵselect(3);
          $i0$.ɵɵproperty("ngIf", $app$.showing);
        }
      }

      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 1, "div", $c0$);
        }
        if (rf & 2) {
          $i0$.ɵɵproperty("ngForOf", ctx.items);
        }
      }`;

      const result = compile(files, angularFiles);

      expectEmit(result.source, template, 'Incorrect template');
    });

    describe('lifecycle hooks', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Input, NgModule} from '@angular/core';

            let events: string[] = [];

            @Component({selector: 'lifecycle-comp', template: ''})
            export class LifecycleComp {
              @Input('name') nameMin: string;

              ngOnChanges() { events.push('changes' + this.nameMin); }

              ngOnInit() { events.push('init' + this.nameMin); }
              ngDoCheck() { events.push('check' + this.nameMin); }

              ngAfterContentInit() { events.push('content init' + this.nameMin); }
              ngAfterContentChecked() { events.push('content check' + this.nameMin); }

              ngAfterViewInit() { events.push('view init' + this.nameMin); }
              ngAfterViewChecked() { events.push('view check' + this.nameMin); }

              ngOnDestroy() { events.push(this.nameMin); }
            }

            @Component({
              selector: 'simple-layout',
              template: \`
                <lifecycle-comp [name]="name1"></lifecycle-comp>
                <lifecycle-comp [name]="name2"></lifecycle-comp>
              \`
            })
            export class SimpleLayout {
              name1 = '1';
              name2 = '2';
            }

            @NgModule({declarations: [LifecycleComp, SimpleLayout]})
            export class LifecycleModule {}
          `
        }
      };

      it('should gen hooks with a few simple components', () => {
        const LifecycleCompDefinition = `
          LifecycleComp.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: LifecycleComp,
            selectors: [["lifecycle-comp"]],
            factory: function LifecycleComp_Factory(t) { return new (t || LifecycleComp)(); },
            inputs: {nameMin: ["name", "nameMin"]},
            features: [$r3$.ɵɵNgOnChangesFeature()],
            consts: 0,
            vars: 0,
            template:  function LifecycleComp_Template(rf, ctx) {},
            encapsulation: 2
          });`;

        const SimpleLayoutDefinition = `
          SimpleLayout.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: SimpleLayout,
            selectors: [["simple-layout"]],
            factory: function SimpleLayout_Factory(t) { return new (t || SimpleLayout)(); },
            consts: 2,
            vars: 2,
            template:  function SimpleLayout_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "lifecycle-comp", $e0_attrs$);
                $r3$.ɵɵelement(1, "lifecycle-comp", $e1_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵɵproperty("name", ctx.name1);
                $r3$.ɵɵselect(1);
                $r3$.ɵɵproperty("name", ctx.name2);
              }
            },
            directives: [LifecycleComp],
           encapsulation: 2
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, LifecycleCompDefinition, 'Invalid LifecycleComp definition');
        expectEmit(source, SimpleLayoutDefinition, 'Invalid SimpleLayout definition');
      });
    });

    describe('template variables', () => {
      const shared = {
        shared: {
          'for_of.ts': `
            import {Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

            export interface ForOfContext {
              $implicit: any;
              index: number;
              even: boolean;
              odd: boolean;
            }

            @Directive({selector: '[forOf]'})
            export class ForOfDirective {
              private previous: any[];

              constructor(private view: ViewContainerRef, private template: TemplateRef<any>) {}

              @Input() forOf: any[];

              ngOnChanges(simpleChanges: SimpleChanges) {
                if ('forOf' in simpleChanges) {
                  this.update();
                }
              }

              ngDoCheck(): void {
                const previous = this.previous;
                const current = this.forOf;
                if (!previous || previous.length != current.length ||
                    previous.some((value: any, index: number) => current[index] !== previous[index])) {
                  this.update();
                }
              }

              private update() {
                // TODO(chuckj): Not implemented yet
                // this.view.clear();
                if (this.forOf) {
                  const current = this.forOf;
                  for (let i = 0; i < current.length; i++) {
                    const context = {$implicit: current[i], index: i, even: i % 2 == 0, odd: i % 2 == 1};
                    // TODO(chuckj): Not implemented yet
                    // this.view.createEmbeddedView(this.template, context);
                  }
                  this.previous = [...this.forOf];
                }
              }
            }
          `
        }
      };

      it('should support embedded views in the SVG namespace', () => {
        const files = {
          app: {
            ...shared,
            'spec.ts': `
                  import {Component, NgModule} from '@angular/core';
                  import {ForOfDirective} from './shared/for_of';

                  @Component({
                    selector: 'my-component',
                    template: \`<svg><g *for="let item of items"><circle></circle></g></svg>\`
                  })
                  export class MyComponent {
                    items = [{ data: 42 }, { data: 42 }];
                  }

                  @NgModule({
                    declarations: [MyComponent, ForOfDirective]
                  })
                  export class MyModule {}
                `
          }
        };

        // TODO(benlesh): Enforce this when the directives are specified
        const ForDirectiveDefinition = `
              ForOfDirective.ngDirectiveDef = $r3$.ɵɵdefineDirective({
                type: ForOfDirective,
                selectors: [["", "forOf", ""]],
                factory: function ForOfDirective_Factory(t) {
                  return new (t || ForOfDirective)($r3$.ɵɵdirectiveInject(ViewContainerRef), $r3$.ɵɵdirectiveInject(TemplateRef));
                },
                features: [$r3$.ɵɵNgOnChangesFeature()],
                inputs: {forOf: "forOf"}
              });
            `;

        const MyComponentDefinition = `
              const $t1_attrs$ = [${AttributeMarker.Template}, "for", "forOf"];
              function MyComponent__svg_g_1_Template(rf, ctx) {
                if (rf & 1) {
                  $r3$.ɵɵnamespaceSVG();
                  $r3$.ɵɵelementStart(0,"g");
                  $r3$.ɵɵelement(1,"circle");
                  $r3$.ɵɵelementEnd();
                }
              }
              …
              MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
                type: MyComponent,
                selectors: [["my-component"]],
                factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
                consts: 2,
                vars: 1,
                template:  function MyComponent_Template(rf, ctx){
                  if (rf & 1) {
                    $r3$.ɵɵnamespaceSVG();
                    $r3$.ɵɵelementStart(0,"svg");
                    $r3$.ɵɵtemplate(1, MyComponent__svg_g_1_Template, 2, 0, "g", $t1_attrs$);
                    $r3$.ɵɵelementEnd();
                  }
                  if (rf & 2) {
                    $r3$.ɵɵselect(1);
                    $r3$.ɵɵproperty("forOf", ctx.items);
                  }
                },
                directives: function() { return [ForOfDirective]; },
                encapsulation: 2
              });
            `;

        const result = compile(files, angularFiles);
        const source = result.source;

        // TODO(benlesh): Enforce this when the directives are specified
        // expectEmit(source, ForDirectiveDefinition, 'Invalid directive definition');
        expectEmit(source, MyComponentDefinition, 'Invalid component definition');
      });

      it('should support a let variable and reference', () => {
        const files = {
          app: {
            ...shared,
            'spec.ts': `
              import {Component, NgModule} from '@angular/core';
              import {ForOfDirective} from './shared/for_of';

              @Component({
                selector: 'my-component',
                template: \`<ul><li *for="let item of items">{{item.name}}</li></ul>\`
              })
              export class MyComponent {
                items = [{name: 'one'}, {name: 'two'}];
              }

              @NgModule({
                declarations: [MyComponent, ForOfDirective]
              })
              export class MyModule {}
            `
          }
        };

        // TODO(chuckj): Enforce this when the directives are specified
        const ForDirectiveDefinition = `
          ForOfDirective.ngDirectiveDef = $r3$.ɵɵdefineDirective({
            type: ForOfDirective,
            selectors: [["", "forOf", ""]],
            factory: function ForOfDirective_Factory(t) {
              return new (t || ForOfDirective)($r3$.ɵɵdirectiveInject(ViewContainerRef), $r3$.ɵɵdirectiveInject(TemplateRef));
            },
            features: [$r3$.ɵɵNgOnChangesFeature()],
            inputs: {forOf: "forOf"}
          });
        `;

        const MyComponentDefinition = `
          const $t1_attrs$ = [${AttributeMarker.Template}, "for", "forOf"];
          function MyComponent_li_1_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "li");
              $r3$.ɵɵtext(1);
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              const $item$ = ctx.$implicit;
              $r3$.ɵɵselect(1);
              $r3$.ɵɵtextInterpolate($item$.name);
            }
          }
          …
          MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
            consts: 2,
            vars: 1,
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelementStart(0, "ul");
                $r3$.ɵɵtemplate(1, MyComponent_li_1_Template, 2, 1, "li", $t1_attrs$);
                $r3$.ɵɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵɵselect(1);
                $r3$.ɵɵproperty("forOf", ctx.items);
              }
            },
            directives: function() { return [ForOfDirective]; },
            encapsulation: 2
          });
        `;

        const result = compile(files, angularFiles);
        const source = result.source;

        // TODO(chuckj): Enforce this when the directives are specified
        // expectEmit(source, ForDirectiveDefinition, 'Invalid directive definition');
        expectEmit(source, MyComponentDefinition, 'Invalid component definition');
      });

      it('should support accessing parent template variables', () => {
        const files = {
          app: {
            ...shared,
            'spec.ts': `
              import {Component, NgModule} from '@angular/core';
              import {ForOfDirective} from './shared/for_of';

              @Component({
                selector: 'my-component',
                template: \`
                <ul>
                  <li *for="let item of items">
                    <div>{{item.name}}</div>
                    <ul>
                      <li *for="let info of item.infos">
                        {{item.name}}: {{info.description}}
                      </li>
                    </ul>
                  </li>
                </ul>\`
              })
              export class MyComponent {
                items = [
                  {name: 'one', infos: [{description: '11'}, {description: '12'}]},
                  {name: 'two', infos: [{description: '21'}, {description: '22'}]}
                ];
              }

              @NgModule({
                declarations: [MyComponent, ForOfDirective]
              })
              export class MyModule {}
            `
          }
        };

        const MyComponentDefinition = `
          const $t4_attrs$ = [${AttributeMarker.Template}, "for", "forOf"];
          function MyComponent_li_1_li_4_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "li");
              $r3$.ɵɵtext(1);
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              const $info$ = ctx.$implicit;
              const $item$ = $r3$.ɵɵnextContext().$implicit;
              $r3$.ɵɵselect(1);
              $r3$.ɵɵtextInterpolate2(" ", $item$.name, ": ", $info$.description, " ");
            }
          }

          function MyComponent_li_1_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "li");
              $r3$.ɵɵelementStart(1, "div");
              $r3$.ɵɵtext(2);
              $r3$.ɵɵelementEnd();
              $r3$.ɵɵelementStart(3, "ul");
              $r3$.ɵɵtemplate(4, MyComponent_li_1_li_4_Template, 2, 2, "li", $t4_attrs$);
              $r3$.ɵɵelementEnd();
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              const $item$ = ctx.$implicit;
              $r3$.ɵɵselect(2);
              $r3$.ɵɵtextInterpolate(IDENT.name);
              $r3$.ɵɵselect(4);
              $r3$.ɵɵproperty("forOf", IDENT.infos);
            }
          }

          …
          MyComponent.ngComponentDef = $r3$.ɵɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
            consts: 2,
            vars: 1,
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelementStart(0, "ul");
                $r3$.ɵɵtemplate(1, MyComponent_li_1_Template, 5, 2, "li", $c1$);
                $r3$.ɵɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵɵselect(1);
                $r3$.ɵɵproperty("forOf", ctx.items);
              }
            },
            directives: function () { return [ForOfDirective]; },
            encapsulation: 2
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;
        expectEmit(source, MyComponentDefinition, 'Invalid component definition');
      });
    });

    it('should instantiate directives in a closure when they are forward referenced', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, Directive} from '@angular/core';

            @Component({
              selector: 'host-binding-comp',
              template: \`
                <my-forward-directive></my-forward-directive>
              \`
            })
            export class HostBindingComp {
            }

            @Directive({
              selector: 'my-forward-directive'
            })
            class MyForwardDirective {}

            @NgModule({declarations: [HostBindingComp, MyForwardDirective]})
            export class MyModule {}
          `
        }
      };

      const MyAppDefinition = `
        …
        directives: function () { return [MyForwardDirective]; }
        …
      `;

      const result = compile(files, angularFiles);
      const source = result.source;
      expectEmit(source, MyAppDefinition, 'Invalid component definition');
    });

    it('should instantiate pipes in a closure when they are forward referenced', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, Pipe} from '@angular/core';

            @Component({
              selector: 'host-binding-comp',
              template: \`
                <div [attr.style]="{} | my_forward_pipe">...</div>
              \`
            })
            export class HostBindingComp {
            }

            @Pipe({
              name: 'my_forward_pipe'
            })
            class MyForwardPipe {}

            @NgModule({declarations: [HostBindingComp, MyForwardPipe]})
            export class MyModule {}
          `
        }
      };

      const MyAppDefinition = `
        …
        pipes: function () { return [MyForwardPipe]; }
        …
      `;

      const result = compile(files, angularFiles);
      const source = result.source;
      expectEmit(source, MyAppDefinition, 'Invalid component definition');
    });

    it('should split multiple `exportAs` values into an array', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive, NgModule} from '@angular/core';

            @Directive({selector: '[some-directive]', exportAs: 'someDir, otherDir'})
            export class SomeDirective {}

            @NgModule({declarations: [SomeDirective]})
            export class MyModule{}
          `
        }
      };

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        SomeDirective.ngDirectiveDef = $r3$.ɵɵdefineDirective({
          type: SomeDirective,
          selectors: [["", "some-directive", ""]],
          factory: function SomeDirective_Factory(t) {return new (t || SomeDirective)(); },
          exportAs: ["someDir", "otherDir"]
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ngDirectiveDef');
    });

    it('should not throw for empty property bindings on ng-template', () => {
      const files = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<ng-template [id]=""></ng-template>'
          })
          export class MyComponent {
          }

          @NgModule({declarations: [MyComponent]})
          export class MyModule {}`
        }
      };

      expect(() => compile(files, angularFiles)).not.toThrow();
    });


  });

  describe('inherited base classes', () => {
    const directive = {
      'some.directive.ts': `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[someDir]',
        })
        export class SomeDirective { }
      `
    };

    it('should add ngBaseDef if one or more @Input is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, Input} from '@angular/core';
            export class BaseClass {
              @Input()
              input1 = 'test';

              @Input('alias2')
              input2 = 'whatever';
            }

            @Component({
              selector: 'my-component',
              template: \`<div>{{input1}} {{input2}}</div>\`
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      // ...
      BaseClass.ngBaseDef = i0.ɵɵdefineBase({
        inputs: {
          input1: "input1",
          input2: ["alias2", "input2"]
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if one or more @Output is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, Output, EventEmitter} from '@angular/core';
            export class BaseClass {
              @Output()
              output1 = new EventEmitter<string>();

              @Output()
              output2 = new EventEmitter<string>();

              clicked() {
                this.output1.emit('test');
                this.output2.emit('test');
              }
            }

            @Component({
              selector: 'my-component',
              template: \`<button (click)="clicked()">Click Me</button>\`
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      // ...
      BaseClass.ngBaseDef = i0.ɵɵdefineBase({
        outputs: {
          output1: "output1",
          output2: "output2"
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if a mixture of @Input and @Output props are present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, Input, Output, EventEmitter} from '@angular/core';
            export class BaseClass {
              @Output()
              output1 = new EventEmitter<string>();

              @Output()
              output2 = new EventEmitter<string>();

              @Input()
              input1 = 'test';

              @Input('whatever')
              input2 = 'blah';

              clicked() {
                this.output1.emit('test');
                this.output2.emit('test');
              }
            }

            @Component({
              selector: 'my-component',
              template: \`<button (click)="clicked()">Click Me</button>\`
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      // ...
      BaseClass.ngBaseDef = i0.ɵɵdefineBase({
        inputs: {
          input1: "input1",
          input2: ["whatever", "input2"]
        },
        outputs: {
          output1: "output1",
          output2: "output2"
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if a ViewChild query is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, ViewChild} from '@angular/core';
            export class BaseClass {
              @ViewChild('something') something: any;
            }

            @Component({
              selector: 'my-component',
              template: ''
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      const $e0_attrs$ = ["something"];
      // ...
      BaseClass.ngBaseDef = i0.ɵɵdefineBase({
        viewQuery: function (rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵviewQuery($e0_attrs$, true);
          }
          if (rf & 2) {
            var $tmp$;
            $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.something = $tmp$.first);
          }
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if a ViewChildren query is present', () => {
      const files = {
        app: {
          ...directive,
          'spec.ts': `
            import {Component, NgModule, ViewChildren} from '@angular/core';
            import {SomeDirective} from './some.directive';

            export class BaseClass {
              @ViewChildren(SomeDirective) something: QueryList<SomeDirective>;
            }

            @Component({
              selector: 'my-component',
              template: ''
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent, SomeDirective]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      // ...
      BaseClass.ngBaseDef = i0.ɵɵdefineBase({
        viewQuery: function (rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵviewQuery(SomeDirective, true);
          }
          if (rf & 2) {
            var $tmp$;
            $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadViewQuery())) && (ctx.something = $tmp$);
          }
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if a ContentChild query is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, ContentChild} from '@angular/core';
            export class BaseClass {
              @ContentChild('something', {static: false}) something: any;
            }

            @Component({
              selector: 'my-component',
              template: ''
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      const $e0_attrs$ = ["something"];
      // ...
      BaseClass.ngBaseDef = i0.ɵɵdefineBase({
        contentQueries: function (rf, ctx, dirIndex) {
          if (rf & 1) {
            $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, true);
          }
          if (rf & 2) {
            var $tmp$;
            $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.something = $tmp$.first);
          }
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if a ContentChildren query is present', () => {
      const files = {
        app: {
          ...directive,
          'spec.ts': `
            import {Component, NgModule, ContentChildren} from '@angular/core';
            import {SomeDirective} from './some.directive';

            export class BaseClass {
              @ContentChildren(SomeDirective) something: QueryList<SomeDirective>;
            }

            @Component({
              selector: 'my-component',
              template: ''
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent, SomeDirective]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      // ...
      BaseClass.ngBaseDef = i0.ɵɵdefineBase({
        contentQueries: function (rf, ctx, dirIndex) {
          if (rf & 1) {
            $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, false);
          }
          if (rf & 2) {
            var $tmp$;
            $r3$.ɵɵqueryRefresh(($tmp$ = $r3$.ɵɵloadContentQuery())) && (ctx.something = $tmp$);
          }
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if a host binding is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, HostBinding} from '@angular/core';
            export class BaseClass {
              @HostBinding('attr.tabindex')
              tabindex = -1;
            }

            @Component({
              selector: 'my-component',
              template: ''
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      // ...
      BaseClass.ngBaseDef = $r3$.ɵɵdefineBase({
        hostBindings: function (rf, ctx, elIndex) {
          if (rf & 1) {
            $r3$.ɵɵallocHostVars(1);
          }
          if (rf & 2) {
            $r3$.ɵɵattribute("tabindex", ctx.tabindex);
          }
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should add ngBaseDef if a host listener is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, HostListener} from '@angular/core';
            export class BaseClass {
              @HostListener('mousedown', ['$event'])
              handleMousedown(event: any) {}
            }

            @Component({
              selector: 'my-component',
              template: ''
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const expectedOutput = `
      // ...
      BaseClass.ngBaseDef = $r3$.ɵɵdefineBase({
        hostBindings: function (rf, ctx, elIndex) {
          if (rf & 1) {
            $r3$.ɵɵlistener("mousedown", function ($event) {
              return ctx.handleMousedown($event);
            });
          }
        }
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid base definition');
    });

    it('should NOT add ngBaseDef if @Component is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule, Output, EventEmitter} from '@angular/core';
            @Component({
              selector: 'whatever',
              template: '<button (click)="clicked()">Click {{input1}}</button>'
            })
            export class BaseClass {
              @Output()
              output1 = new EventEmitter<string>();

              @Input()
              input1 = 'whatever';

              clicked() {
                this.output1.emit('test');
              }
            }

            @Component({
              selector: 'my-component',
              template: \`<div>What is this developer doing?</div>\`
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const result = compile(files, angularFiles);
      expect(result.source).not.toContain('ngBaseDef');
    });

    it('should NOT add ngBaseDef if @Directive is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule, Output, EventEmitter} from '@angular/core';
            @Directive({
              selector: 'whatever',
            })
            export class BaseClass {
              @Output()
              output1 = new EventEmitter<string>();

              @Input()
              input1 = 'whatever';

              clicked() {
                this.output1.emit('test');
              }
            }

            @Component({
              selector: 'my-component',
              template: '<button (click)="clicked()">Click {{input1}}</button>'
            })
            export class MyComponent extends BaseClass {
            }

            @NgModule({
              declarations: [MyComponent]
            })
            export class MyModule {}
          `
        }
      };
      const result = compile(files, angularFiles);
      expect(result.source).not.toContain('ngBaseDef');
    });
  });
});
