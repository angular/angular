/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker} from '@angular/compiler/src/core';
import {setup} from '@angular/compiler/test/aot/test_util';
import * as ts from 'typescript';
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
          'MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
        …
        consts: [["title", "Hello", ${
          AttributeMarker.Classes}, "my-app"], ["cx", "20", "cy", "30", "r", "50"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", 0);
            $r3$.ɵɵnamespaceSVG();
            $r3$.ɵɵelementStart(1, "svg");
            $r3$.ɵɵelement(2, "circle", 1);
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
          'MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
        …
        consts: [["title", "Hello", ${AttributeMarker.Classes}, "my-app"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", 0);
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
          'MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
        …
        consts: [["title", "Hello", ${AttributeMarker.Classes}, "my-app"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", 0);
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

    it('should support namespaced attributes', () => {
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
          'MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
          …
          consts: [[${AttributeMarker.NamespaceURI}, "xmlns", "foo", "http://someuri/foo", ${
          AttributeMarker.NamespaceURI}, "foo", "bar", "baz", "title", "Hello", ${
          AttributeMarker.NamespaceURI}, "foo", "qux", "quacks", ${
          AttributeMarker.Classes}, "my-app"]],
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "div", 0);
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
          'MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); }';
      const template = `
        …
        consts: [[${AttributeMarker.Bindings}, "id"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "div", 0);
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
          'MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); }';
      const template = `
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "div", 0);
            $r3$.ɵɵpipe(1, "pipe");
          }
          if (rf & 2) {
            $r3$.ɵɵproperty("ternary", ctx.cond ? $r3$.ɵɵpureFunction1(8, $c0$, ctx.a): $r3$.ɵɵpureFunction0(10, $c1$))("pipe", $r3$.ɵɵpipeBind3(1, 4, ctx.value, 1, 2))("and", ctx.cond && $r3$.ɵɵpureFunction1(11, $c0$, ctx.b))("or", ctx.cond || $r3$.ɵɵpureFunction1(13, $c0$, ctx.c));
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
        hostVars: 14,
        hostBindings: function MyComponent_HostBindings(rf, ctx) {
          if (rf & 2) {
            $r3$.ɵɵsyntheticHostProperty("@expansionHeight",
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
          'MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); }';
      const template = `
        MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({type:MyComponent,selectors:[["my-component"]],
            decls: 1,
            vars: 4,
            template: function MyComponent_Template(rf,ctx){
              if (rf & 1) {
                $r3$.ɵɵelement(0, "div");
              }
              if (rf & 2) {
                $r3$.ɵɵstyleProp("background-color", ctx.color);
                $r3$.ɵɵclassProp("error", ctx.error);
              }
            },
            encapsulation: 2
        });
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should de-duplicate attribute arrays', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <div title="hi"></div>
                  <span title="hi"></span>
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
        consts: [["title", "hi"]],
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "div", 0);
            $r3$.ɵɵelement(1, "span", 0);
          }
          …
        }
      `;


      const result = compile(files, angularFiles);
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
        ChildComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: ChildComponent,
          selectors: [["child"]],
          decls: 1,
          vars: 0,
          template:  function ChildComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵtext(0, "child-view");
            }
          },
          encapsulation: 2
        });`;

      const ChildComponentFactory =
          `ChildComponent.ɵfac = function ChildComponent_Factory(t) { return new (t || ChildComponent)(); };`;

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        SomeDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: SomeDirective,
          selectors: [["", "some-directive", ""]]
        });
      `;

      const SomeDirectiveFactory =
          `SomeDirective.ɵfac = function SomeDirective_Factory(t) {return new (t || SomeDirective)(); };`;

      // MyComponent definition should be:
      const MyComponentDefinition = `
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          decls: 2,
          vars: 0,
          consts: [["some-directive", ""]],
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "child", 0);
              $r3$.ɵɵtext(1, "!");
            }
          },
          directives: [ChildComponent, SomeDirective],
          encapsulation: 2
        });
      `;

      const MyComponentFactory =
          `MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, ChildComponentDefinition, 'Incorrect ChildComponent.ɵcmp');
      expectEmit(source, ChildComponentFactory, 'Incorrect ChildComponent.ɵfac');
      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ɵdir');
      expectEmit(source, SomeDirectiveFactory, 'Incorrect SomeDirective.ɵfac');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponentDefinition.ɵcmp');
      expectEmit(source, MyComponentFactory, 'Incorrect MyComponentDefinition.ɵfac');
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
        SomeDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: SomeDirective,
          selectors: [["div", "some-directive", "", 8, "foo", 3, "title", "", 9, "baz"]]
        });
      `;

      const SomeDirectiveFactory =
          `SomeDirective.ɵfac = function SomeDirective_Factory(t) {return new (t || SomeDirective)(); };`;

      // OtherDirective definition should be:
      const OtherDirectiveDefinition = `
        OtherDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: OtherDirective,
          selectors: [["", 5, "span", "title", "", 9, "baz"]]
        });
      `;

      const OtherDirectiveFactory =
          `OtherDirective.ɵfac = function OtherDirective_Factory(t) {return new (t || OtherDirective)(); };`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ɵdir');
      expectEmit(source, SomeDirectiveFactory, 'Incorrect SomeDirective.ɵfac');
      expectEmit(source, OtherDirectiveDefinition, 'Incorrect OtherDirective.ɵdir');
      expectEmit(source, OtherDirectiveFactory, 'Incorrect OtherDirective.ɵfac');
    });

    it('should convert #my-app selector to ["", "id", "my-app"]', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({selector: '#my-app', template: ''})
            export class SomeComponent {}

            @NgModule({declarations: [SomeComponent]})
            export class MyModule{}
          `
        }
      };

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        SomeComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: SomeComponent,
          selectors: [["", "id", "my-app"]],
          …
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeComponent.ɵcomp');
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
        EmptyOutletComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: EmptyOutletComponent,
          selectors: [["ng-component"]],
          decls: 1,
          vars: 0,
          template: function EmptyOutletComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "router-outlet");
            }
          },
          encapsulation: 2
        });
      `;

      const EmptyOutletComponentFactory =
          `EmptyOutletComponent.ɵfac = function EmptyOutletComponent_Factory(t) { return new (t || EmptyOutletComponent)(); };`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, EmptyOutletComponentDefinition, 'Incorrect EmptyOutletComponent.ɵcmp');
      expectEmit(source, EmptyOutletComponentFactory, 'Incorrect EmptyOutletComponent.ɵfac');
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
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          decls: 0,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {},
          encapsulation: 2
        });`;

         const MyComponentFactory = `MyComponent.ɵfac = function MyComponent_Factory(t) {
            return new (t || MyComponent)(
              $r3$.ɵɵdirectiveInject($i$.ElementRef), $r3$.ɵɵdirectiveInject($i$.ViewContainerRef),
              $r3$.ɵɵdirectiveInject($i$.ChangeDetectorRef));
          };`;

         const result = compile(files, angularFiles);
         const source = result.source;

         expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ɵcmp');
         expectEmit(source, MyComponentFactory, 'Incorrect MyComponent.ɵfac');
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
        IfDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: IfDirective,
          selectors: [["", "if", ""]]
        });`;
      const IfDirectiveFactory =
          `IfDirective.ɵfac = function IfDirective_Factory(t) { return new (t || IfDirective)($r3$.ɵɵdirectiveInject($i$.TemplateRef)); };`;

      const MyComponentDefinition = `
        function MyComponent_li_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "li");
            $r3$.ɵɵtext(1);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $myComp$ = $r3$.ɵɵnextContext();
            const $foo$ = $r3$.ɵɵreference(1);
            $r3$.ɵɵadvance(1);
            $r3$.ɵɵtextInterpolate2("", $myComp$.salutation, " ", $foo$, "");
          }
        }
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          decls: 3,
          vars: 0,
          consts: [["foo", ""], [${AttributeMarker.Template}, "if"]],
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "ul", null, 0);
              $r3$.ɵɵtemplate(2, MyComponent_li_2_Template, 2, 2, "li", 1);
              $r3$.ɵɵelementEnd();
            }
          },
          directives: [IfDirective],
          encapsulation: 2
        });`;

      const MyComponentFactory =
          `MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, IfDirectiveDefinition, 'Incorrect IfDirective.ɵdir');
      expectEmit(source, IfDirectiveFactory, 'Incorrect IfDirective.ɵfac');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ɵcmp');
      expectEmit(source, MyComponentFactory, 'Incorrect MyComponent.ɵfac');
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
          const $e0_ff$ = function ($v$) { return ["Nancy", $v$]; };
          …
          MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            decls: 1,
            vars: 3,
            consts: [[${AttributeMarker.Bindings}, "names"]],
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "my-comp", 0);
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
          const $e0_ff$ = function ($v0$, $v1$, $v2$, $v3$, $v4$, $v5$, $v6$, $v7$, $v8$) {
            return ["start-", $v0$, $v1$, $v2$, $v3$, $v4$, "-middle-", $v5$, $v6$, $v7$, $v8$, "-end"];
          }
          …
          MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            decls: 1,
            vars: 11,
            consts: [[${AttributeMarker.Bindings}, "names"]],
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "my-comp", 0);
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
          const $e0_ff$ = function ($v$) { return {"duration": 500, animation: $v$}; };
          …
          MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            decls: 1,
            vars: 3,
            consts: [[${AttributeMarker.Bindings}, "config"]],
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "object-comp", 0);
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
          const $c0$ = function () { return {opacity: 0, duration: 0}; };
          const $e0_ff$ = function ($v$) { return {opacity: 1, duration: $v$}; };
          const $e0_ff_1$ = function ($v1$, $v2$) { return [$v1$, $v2$]; };
          const $e0_ff_2$ = function ($v1$, $v2$) { return {animation: $v1$, actions: $v2$}; };
          …
          MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            decls: 1,
            vars: 10,
            consts: [[${AttributeMarker.Bindings}, "config"]],
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "nested-comp", 0);
              }
              if (rf & 2) {
                $r3$.ɵɵproperty("config",
                  $r3$.ɵɵpureFunction2(7, $e0_ff_2$, ctx.name, $r3$.ɵɵpureFunction2(4, $e0_ff_1$, $r3$.ɵɵpureFunction0(1, $c0$), $r3$.ɵɵpureFunction1(2, $e0_ff$, ctx.duration))));
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
          SimpleComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: SimpleComponent,
            selectors: [["simple"]],
            ngContentSelectors: $c0$,
            decls: 2,
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
          const $c1$ = [[["span", "title", "tofirst"]], [["span", "title", "tosecond"]]];
          …
          ComplexComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: ComplexComponent,
            selectors: [["complex"]],
            ngContentSelectors: $c2$,
            decls: 4,
            vars: 0,
            consts: [["id","first"], ["id","second"]],
            template:  function ComplexComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵprojectionDef($c1$);
                $r3$.ɵɵelementStart(0, "div", 0);
                $r3$.ɵɵprojection(1);
                $r3$.ɵɵelementEnd();
                $r3$.ɵɵelementStart(2, "div", 1);
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
          Cmp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: Cmp,
            selectors: [["ng-component"]],
            ngContentSelectors: $c1$,
            decls: 3,
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
          function Cmp_div_0_Template(rf, ctx) { if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", 2);
            $r3$.ɵɵprojection(1);
            $r3$.ɵɵelementEnd();
          } }
          function Cmp_div_1_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "div", 3);
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
          consts: [["id", "second", ${AttributeMarker.Template}, "ngIf"], ["id", "third", ${
            AttributeMarker.Template}, "ngIf"], ["id", "second"], ["id", "third"]],
          template: function Cmp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵprojectionDef($_c4$);
              $r3$.ɵɵtemplate(0, Cmp_div_0_Template, 2, 0, "div", 0);
              $r3$.ɵɵtemplate(1, Cmp_div_1_Template, 2, 0, "div", 1);
              $r3$.ɵɵtemplate(2, Cmp_ng_template_2_Template, 2, 0, "ng-template");
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("ngIf", ctx.visible);
              $r3$.ɵɵadvance(1);
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
          …
          MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            decls: 2,
            vars: 0,
            consts: [["ngProjectAs", "[title]", 5, ["", "title", ""]]],
            template: function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                    $r3$.ɵɵelementStart(0, "simple");
                    $r3$.ɵɵelement(1, "h1", 0);
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
          …
          MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            decls: 2,
            vars: 0,
            consts: [["ngProjectAs", "[title],[header]", 5, ["", "title", ""]]],
            template: function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                    $r3$.ɵɵelementStart(0, "simple");
                    $r3$.ɵɵelement(1, "h1", 0);
                    $r3$.ɵɵelementEnd();
                }
            },
            encapsulation: 2
        })`;

        const result = compile(files, angularFiles);

        expectEmit(
            result.source, SimpleComponentDefinition, 'Incorrect SimpleComponent definition');
      });

      it('should include parsed ngProjectAs selectors into template attrs', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component} from '@angular/core';

              @Component({
                selector: 'my-app',
                template: '<div *ngIf="show" ngProjectAs=".someclass"></div>'
              })
              export class MyApp {
                show = true;
              }
            `
          }
        };

        const SimpleComponentDefinition = `
          MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
            type: MyApp,
            selectors: [
                ["my-app"]
            ],
            decls: 1,
            vars: 1,
            consts: [
                ["ngProjectAs", ".someclass", ${AttributeMarker.ProjectAs}, ["", 8, "someclass"], ${
            AttributeMarker.Template}, "ngIf"],
                ["ngProjectAs", ".someclass", ${AttributeMarker.ProjectAs}, ["", 8, "someclass"]]
            ],
            template: function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                    i0.ɵɵtemplate(0, MyApp_div_0_Template, 1, 0, "div", 0);
                }
                if (rf & 2) {
                    i0.ɵɵproperty("ngIf", ctx.show);
                }
            },
            encapsulation: 2
          });
        `;

        const result = compile(files, angularFiles);
        expectEmit(result.source, SimpleComponentDefinition, 'Incorrect MyApp definition');
      });

      it('should capture the node name of ng-content with a structural directive', () => {
        const files = {
          app: {
            'spec.ts': `
              import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

              @Component({selector: 'simple', template: '<ng-content *ngIf="showContent"></ng-content>'})
              export class SimpleComponent {}
            `
          }
        };

        const SimpleComponentDefinition = `
          SimpleComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: SimpleComponent,
            selectors: [["simple"]],
            ngContentSelectors: $c0$,
            decls: 1,
            vars: 1,
            consts: [[4, "ngIf"]],
            template:  function SimpleComponent_Template(rf, ctx) {
              if (rf & 1) {
                i0.ɵɵprojectionDef();
                i0.ɵɵtemplate(0, SimpleComponent_ng_content_0_Template, 1, 0, "ng-content", 0);
              }
              if (rf & 2) {
                i0.ɵɵproperty("ngIf", ctx.showContent);
              }
            },
            encapsulation: 2
          });`;

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
          …
          ViewQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: ViewQueryComponent,
            selectors: [["view-query-component"]],
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵviewQuery(SomeDirective, 5);
                $r3$.ɵɵviewQuery(SomeDirective, 5);
              }
              if (rf & 2) {
                let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirs = $tmp$);
              }
            },
            decls: 1,
            vars: 0,
            consts: [["someDir",""]],
            template:  function ViewQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "div", 0);
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
          ViewQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            …
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵviewQuery($e0_attrs$, 5);
                $r3$.ɵɵviewQuery($e1_attrs$, 5);
              }
              if (rf & 2) {
                let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRefs = $tmp$);
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
              @ViewChild('foo') foo !: ElementRef;
            }

            @NgModule({declarations: [SomeDirective, ViewQueryComponent]})
            export class MyModule {}
            `
          }
        };

        const ViewQueryComponentDefinition = `
          const $refs$ = ["foo"];
          …
          ViewQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: ViewQueryComponent,
            selectors: [["view-query-component"]],
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵviewQuery(SomeDirective, 7);
                $r3$.ɵɵviewQuery($refs$, 5);
              }
              if (rf & 2) {
                let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.foo = $tmp$.first);
              }
            },
            decls: 1,
            vars: 0,
            consts: [["someDir",""]],
            template:  function ViewQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "div", 0);
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
          ViewQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            …
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵviewQuery($e0_attrs$, 5, TemplateRef);
                $r3$.ɵɵviewQuery(SomeDirective, 5, ElementRef);
                $r3$.ɵɵviewQuery($e1_attrs$, 5, ElementRef);
                $r3$.ɵɵviewQuery(SomeDirective, 5, TemplateRef);
              }
              if (rf & 2) {
                let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRefs = $tmp$);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirs = $tmp$);
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
              @ContentChild(SomeDirective) someDir: SomeDirective;
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
          ContentQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: ContentQueryComponent,
            selectors: [["content-query-component"]],
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, 5);
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, 4);
              }
              if (rf & 2) {
              let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirList = $tmp$);
              }
            },
            ngContentSelectors: _c0,
            decls: 2,
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
              @ContentChild('myRef') myRef: any;
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
          ContentQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            …
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
              $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, 5);
              $r3$.ɵɵcontentQuery(dirIndex, $e1_attrs$, 4);
              }
              if (rf & 2) {
              let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRefs = $tmp$);
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
              @ContentChild('foo') foo !: ElementRef;
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
          ContentQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: ContentQueryComponent,
            selectors: [["content-query-component"]],
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, 7);
              $r3$.ɵɵcontentQuery(dirIndex, $ref0$, 5);
              }
              if (rf & 2) {
              let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.foo = $tmp$.first);
              }
            },
            ngContentSelectors: $_c1$,
            decls: 2,
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
              @ContentChild('myRef', {read: TemplateRef}) myRef: TemplateRef;
              @ContentChildren('myRef1, myRef2, myRef3', {read: ElementRef}) myRefs: QueryList<ElementRef>;
              @ContentChild(SomeDirective, {read: ElementRef}) someDir: ElementRef;
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
          ContentQueryComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            …
            contentQueries: function ContentQueryComponent_ContentQueries(rf, ctx, dirIndex) {
              if (rf & 1) {
                $r3$.ɵɵcontentQuery(dirIndex, $e0_attrs$, 5, TemplateRef);
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, 5, ElementRef);
              $r3$.ɵɵcontentQuery(dirIndex, $e1_attrs$, 4, ElementRef);
              $r3$.ɵɵcontentQuery(dirIndex, SomeDirective, 4, TemplateRef);
              }
              if (rf & 2) {
              let $tmp$;
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRef = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDir = $tmp$.first);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.myRefs = $tmp$);
                $r3$.ɵɵqueryRefresh($tmp$ = $r3$.ɵɵloadQuery()) && (ctx.someDirs = $tmp$);
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
            MyPipe.ɵpipe = /*@__PURE__*/ $r3$.ɵɵdefinePipe({
              name: "myPipe",
              type: MyPipe,
              pure: false
            });
        `;

        const MyPipeFactoryDef = `
          MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)(); };
        `;

        const MyPurePipeDefinition = `
            MyPurePipe.ɵpipe = /*@__PURE__*/ $r3$.ɵɵdefinePipe({
              name: "myPurePipe",
              type: MyPurePipe,
              pure: true
            });`;

        const MyPurePipeFactoryDef = `
          MyPurePipe.ɵfac = function MyPurePipe_Factory(t) { return new (t || MyPurePipe)(); };
        `;

        const MyAppDefinition = `
            const $c0$ = function ($a0$) {
              return [$a0$, 1, 2, 3, 4, 5];
            };
            // ...
            MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              type: MyApp,
              selectors: [["my-app"]],
              decls: 7,
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
                  $r3$.ɵɵadvance(4);
                  $r3$.ɵɵtextInterpolate2("", $r3$.ɵɵpipeBindV(5, 9, $r3$.ɵɵpureFunction1(18, $c0$, ctx.name)), " ", ctx.name ? 1 : $r3$.ɵɵpipeBind1(6, 16, 2), "");
                }
              },
              pipes: [MyPurePipe, MyPipe],
              encapsulation: 2
            });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyPipeDefinition, 'Invalid pipe definition');
        expectEmit(source, MyPipeFactoryDef, 'Invalid pipe factory function');
        expectEmit(source, MyPurePipeDefinition, 'Invalid pure pipe definition');
        expectEmit(source, MyPurePipeFactoryDef, 'Invalid pure pipe factory function');
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
            MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              type: MyApp,
              selectors: [["my-app"]],
              decls: 6,
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
              MyPipe.ɵpipe = /*@__PURE__*/ $r3$.ɵɵdefinePipe({
                name: "myPipe",
                type: MyPipe,
                pure: true
              });
            `;

           const MyPipeFactory = `
              MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)($i0$.ɵɵdirectiveInject($i0$.ChangeDetectorRef, 16)); };
            `;

           const MyOtherPipeDefinition = `
              MyOtherPipe.ɵpipe = /*@__PURE__*/ $r3$.ɵɵdefinePipe({
                name: "myOtherPipe",
                type: MyOtherPipe,
                pure: true
              });`;

           const MyOtherPipeFactory = `
              MyOtherPipe.ɵfac = function MyOtherPipe_Factory(t) { return new (t || MyOtherPipe)($i0$.ɵɵdirectiveInject($i0$.ChangeDetectorRef, 24)); };
            `;

           const result = compile(files, angularFiles);
           const source = result.source;

           expectEmit(source, MyPipeDefinition, 'Invalid pipe definition');
           expectEmit(source, MyPipeFactory, 'Invalid pipe factory function');
           expectEmit(source, MyOtherPipeDefinition, 'Invalid alternate pipe definition');
           expectEmit(source, MyOtherPipeFactory, 'Invalid alternate pipe factory function');
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
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          decls: 3,
          vars: 1,
          consts: [["user", ""]],
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "input", null, 0);
              $r3$.ɵɵtext(2);
            }
            if (rf & 2) {
              const $user$ = $r3$.ɵɵreference(1);
              $r3$.ɵɵadvance(2);
              $r3$.ɵɵtextInterpolate1("Hello ", $user$.value, "!");
            }
          },
          encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ɵcmp');
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
            $r3$.ɵɵadvance(1);
            $r3$.ɵɵtextInterpolate3("", $foo$, "-", $bar$, "-", $baz$, "");
          }
        }
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵtext(1);
            $r3$.ɵɵtemplate(2, MyComponent_div_3_span_2_Template, 2, 3, "span", 1);
            $r3$.ɵɵelement(3, "span", null, 3);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $bar$ = $r3$.ɵɵreference(4);
            $r3$.ɵɵnextContext();
            const $foo$ = $r3$.ɵɵreference(1);
            $r3$.ɵɵadvance(1);
            $r3$.ɵɵtextInterpolate2(" ", $foo$, "-", $bar$, " ");
          }
        }
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          decls: 6,
          vars: 1,
          consts: [["foo", ""], [${AttributeMarker.Template}, "if"], ["baz", ""], ["bar", ""]],
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div", null, 0);
              $r3$.ɵɵtext(2);
              $r3$.ɵɵtemplate(3, MyComponent_div_3_Template, 5, 2, "div", 1);
              $r3$.ɵɵelement(4, "div", null, 2);
            }
            if (rf & 2) {
              const $foo$ = $r3$.ɵɵreference(1);
              $r3$.ɵɵadvance(2);
              $r3$.ɵɵtextInterpolate1(" ", $foo$, " ");
            }
          },
          directives:[IfDirective],
          encapsulation: 2
        });`;

      const result = compile(files, angularFiles);
      const source = result.source;
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ɵcmp');
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
      function MyComponent_div_0_span_3_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵɵelementStart(0, "span");
          $i0$.ɵɵtext(1);
          $i0$.ɵɵelementEnd();
        }
        if (rf & 2) {
          const $item$ = $i0$.ɵɵnextContext().$implicit;
          const $foo$ = $i0$.ɵɵreference(2);
          $r3$.ɵɵadvance(1);
          $i0$.ɵɵtextInterpolate2(" ", $foo$, " - ", $item$, " ");
        }
      }

      function MyComponent_div_0_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵɵelementStart(0, "div");
          $i0$.ɵɵelement(1, "div", null, 1);
          $i0$.ɵɵtemplate(3, MyComponent_div_0_span_3_Template, 2, 2, "span", 2);
          $i0$.ɵɵelementEnd();
        }
        if (rf & 2) {
          const $app$ = $i0$.ɵɵnextContext();
          $r3$.ɵɵadvance(3);
          $i0$.ɵɵproperty("ngIf", $app$.showing);
        }
      }

      // ...
      consts: [[${AttributeMarker.Template}, "ngFor", "ngForOf"], ["foo", ""], [${
          AttributeMarker.Template}, "ngIf"]],
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 1, "div", 0);
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
          LifecycleComp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: LifecycleComp,
            selectors: [["lifecycle-comp"]],
            inputs: {nameMin: ["name", "nameMin"]},
            features: [$r3$.ɵɵNgOnChangesFeature],
            decls: 0,
            vars: 0,
            template:  function LifecycleComp_Template(rf, ctx) {},
            encapsulation: 2
          });`;

        const SimpleLayoutDefinition = `
          SimpleLayout.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: SimpleLayout,
            selectors: [["simple-layout"]],
            decls: 2,
            vars: 2,
            consts: [[3, "name"]],
            template:  function SimpleLayout_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "lifecycle-comp", 0);
                $r3$.ɵɵelement(1, "lifecycle-comp", 0);
              }
              if (rf & 2) {
                $r3$.ɵɵproperty("name", ctx.name1);
                $r3$.ɵɵadvance(1);
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
              ForOfDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
                type: ForOfDirective,
                selectors: [["", "forOf", ""]],
                features: [$r3$.ɵɵNgOnChangesFeature],
                inputs: {forOf: "forOf"}
              });
            `;

        const ForDirectiveFactory = `ForOfDirective.ɵfac = function ForOfDirective_Factory(t) {
            return new (t || ForOfDirective)($r3$.ɵɵdirectiveInject(ViewContainerRef), $r3$.ɵɵdirectiveInject(TemplateRef));
          };`;

        const MyComponentDefinition = `
              function MyComponent__svg_g_1_Template(rf, ctx) {
                if (rf & 1) {
                  $r3$.ɵɵnamespaceSVG();
                  $r3$.ɵɵelementStart(0,"g");
                  $r3$.ɵɵelement(1,"circle");
                  $r3$.ɵɵelementEnd();
                }
              }
              …
              MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
                type: MyComponent,
                selectors: [["my-component"]],
                decls: 2,
                vars: 1,
                consts: [[${AttributeMarker.Template}, "for", "forOf"]],
                template:  function MyComponent_Template(rf, ctx){
                  if (rf & 1) {
                    $r3$.ɵɵnamespaceSVG();
                    $r3$.ɵɵelementStart(0,"svg");
                    $r3$.ɵɵtemplate(1, MyComponent__svg_g_1_Template, 2, 0, "g", 0);
                    $r3$.ɵɵelementEnd();
                  }
                  if (rf & 2) {
                    $r3$.ɵɵadvance(1);
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
        // expectEmit(source, ForDirectiveFactory, 'Invalid directive factory');
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
          ForOfDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
            type: ForOfDirective,
            selectors: [["", "forOf", ""]],
            features: [$r3$.ɵɵNgOnChangesFeature],
            inputs: {forOf: "forOf"}
          });
        `;

        const ForDirectiveFactory = `
          ForOfDirective.ɵfac = function ForOfDirective_Factory(t) {
            return new (t || ForOfDirective)($r3$.ɵɵdirectiveInject(ViewContainerRef), $r3$.ɵɵdirectiveInject(TemplateRef));
          };
        `;

        const MyComponentDefinition = `
          function MyComponent_li_1_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "li");
              $r3$.ɵɵtext(1);
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              const $item$ = ctx.$implicit;
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵtextInterpolate($item$.name);
            }
          }
          …
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            decls: 2,
            vars: 1,
            consts: [[${AttributeMarker.Template}, "for", "forOf"]],
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelementStart(0, "ul");
                $r3$.ɵɵtemplate(1, MyComponent_li_1_Template, 2, 1, "li", 0);
                $r3$.ɵɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵɵadvance(1);
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
        // expectEmit(source, ForDirectiveFactory, 'Invalid directive factory');
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
          function MyComponent_li_1_li_4_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "li");
              $r3$.ɵɵtext(1);
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              const $info$ = ctx.$implicit;
              const $item$ = $r3$.ɵɵnextContext().$implicit;
              $r3$.ɵɵadvance(1);
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
              $r3$.ɵɵtemplate(4, MyComponent_li_1_li_4_Template, 2, 2, "li", 0);
              $r3$.ɵɵelementEnd();
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              const $item$ = ctx.$implicit;
              $r3$.ɵɵadvance(2);
              $r3$.ɵɵtextInterpolate(IDENT.name);
              $r3$.ɵɵadvance(2);
              $r3$.ɵɵproperty("forOf", IDENT.infos);
            }
          }

          …
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            decls: 2,
            vars: 1,
            consts: [[${AttributeMarker.Template}, "for", "forOf"]],
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelementStart(0, "ul");
                $r3$.ɵɵtemplate(1, MyComponent_li_1_Template, 5, 2, "li", 0);
                $r3$.ɵɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵɵadvance(1);
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
        SomeDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: SomeDirective,
          selectors: [["", "some-directive", ""]],
          exportAs: ["someDir", "otherDir"]
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ɵdir');
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

    it('should not generate a selectors array if the directive does not have a selector', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive} from '@angular/core';

            @Directive()
            export class AbstractDirective {
            }
          `
        }
      };
      const expectedOutput = `
      // ...
      AbstractDirective.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
        type: AbstractDirective
      });
      // ...
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, expectedOutput, 'Invalid directive definition');
    });

    it('should generate a pure function for constant object literals', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>'
            })
            export class MyApp {
            }
          `
        }
      };

      const MyAppDeclaration = `
        const $c0$ = function () { return {}; };
        const $c1$ = function () { return { a: 1, b: 2 }; };
        …
        MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyApp,
          selectors: [["ng-component"]],
          decls: 1,
          vars: 4,
          consts: [[${AttributeMarker.Bindings}, "prop", "otherProp"]],
          template:  function MyApp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "some-comp", 0);
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("prop", $r3$.ɵɵpureFunction0(2, $c0$))("otherProp", $r3$.ɵɵpureFunction0(3, $c1$));
            }
          },
         encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyAppDeclaration, 'Invalid component definition');
    });

    it('should generate a pure function for constant array literals', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<some-comp [prop]="[]" [otherProp]="[0, 1, 2]"></some-comp>'
            })
            export class MyApp {
            }
          `
        }
      };

      const MyAppDeclaration = `
        const $c0$ = function () { return []; };
        const $c1$ = function () { return [0, 1, 2]; };
        …
        MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyApp,
          selectors: [["ng-component"]],
          decls: 1,
          vars: 4,
          consts: [[${AttributeMarker.Bindings}, "prop", "otherProp"]],
          template:  function MyApp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "some-comp", 0);
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("prop", $r3$.ɵɵpureFunction0(2, $c0$))("otherProp", $r3$.ɵɵpureFunction0(3, $c1$));
            }
          },
         encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyAppDeclaration, 'Invalid component definition');
    });

    it('should not share pure functions between null and object literals', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                template: \`
                  <div [dir]="{foo: null}"></div>
                  <div [dir]="{foo: {}}"></div>
                \`
              })
              export class MyApp {}

              @NgModule({declarations: [MyApp]})
              export class MyModule {}
          `
        }
      };

      const MyAppDeclaration = `
        const $c0$ = function () { return { foo: null }; };
        const $c1$ = function () { return {}; };
        const $c2$ = function (a0) { return { foo: a0 }; };
        …
        MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyApp,
          selectors: [["ng-component"]],
          decls: 2,
          vars: 6,
          consts: [[${AttributeMarker.Bindings}, "dir"]],
          template:  function MyApp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div", 0);
              $r3$.ɵɵelement(1, "div", 0);
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("dir", $r3$.ɵɵpureFunction0(2, $c0$));
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("dir", $r3$.ɵɵpureFunction1(4, $c2$, $r3$.ɵɵpureFunction0(3, $c1$)));
            }
          },
         encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyAppDeclaration, 'Invalid component definition');
    });

    it('should not share pure functions between null and array literals', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                template: \`
                  <div [dir]="{foo: null}"></div>
                  <div [dir]="{foo: []}"></div>
                \`
              })
              export class MyApp {}

              @NgModule({declarations: [MyApp]})
              export class MyModule {}
          `
        }
      };

      const MyAppDeclaration = `
        const $c0$ = function () { return { foo: null }; };
        const $c1$ = function () { return []; };
        const $c2$ = function (a0) { return { foo: a0 }; };
        …
        MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyApp,
          selectors: [["ng-component"]],
          decls: 2,
          vars: 6,
          consts: [[${AttributeMarker.Bindings}, "dir"]],
          template:  function MyApp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div", 0);
              $r3$.ɵɵelement(1, "div", 0);
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("dir", $r3$.ɵɵpureFunction0(2, $c0$));
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("dir", $r3$.ɵɵpureFunction1(4, $c2$, $r3$.ɵɵpureFunction0(3, $c1$)));
            }
          },
         encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyAppDeclaration, 'Invalid component definition');
    });

    it('should not share pure functions between null and function calls', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                template: \`
                  <div [dir]="{foo: null}"></div>
                  <div [dir]="{foo: getFoo()}"></div>
                \`
              })
              export class MyApp {
                getFoo() {
                  return 'foo!';
                }
              }

              @NgModule({declarations: [MyApp]})
              export class MyModule {}
          `
        }
      };

      const MyAppDeclaration = `
        const $c0$ = function () { return { foo: null }; };
        const $c1$ = function (a0) { return { foo: a0 }; };
        …
        MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyApp,
          selectors: [["ng-component"]],
          decls: 2,
          vars: 5,
          consts: [[${AttributeMarker.Bindings}, "dir"]],
          template:  function MyApp_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div", 0);
              $r3$.ɵɵelement(1, "div", 0);
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("dir", $r3$.ɵɵpureFunction0(2, $c0$));
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("dir", $r3$.ɵɵpureFunction1(3, $c1$, ctx.getFoo()));
            }
          },
         encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyAppDeclaration, 'Invalid component definition');
    });

    it('should emit a valid setClassMetadata call in ES5 if a class with a custom decorator is referencing itself inside its own metadata',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, InjectionToken} from "@angular/core";

                const token = new InjectionToken('token');

                export function Custom() {
                  return function(target: any) {};
                }

                @Custom()
                @Component({
                  template: '',
                  providers: [{ provide: token, useExisting: Comp }],
                })
                export class Comp {}
              `
           }
         };

         // The setClassMetadata call should look like this.
         const setClassMetadata = `
           (function() { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Comp, [{
             type: Component,
             args: [{
               template: '',
               providers: [{provide: token, useExisting: Comp}],
             }]
           }], null, null); })();
         `;

         const result = compile(files, angularFiles, {target: ts.ScriptTarget.ES5});
         expectEmit(result.source, setClassMetadata, 'Incorrect setClassMetadata call');
       });
  });
});
