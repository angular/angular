/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, InitialStylingFlags} from '@angular/compiler/src/core';
import {setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';


/* These tests are codified version of the tests in compiler_canonical_spec.ts. Every
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
        const $c1$ = ["title", "Hello"];
        const $c2$ = ["my-app", ${InitialStylingFlags.VALUES_MODE}, "my-app", true];
        const $c3$ = ["cx", "20", "cy", "30", "r", "50"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $c1$);
            $r3$.ɵelementStyling($c2$);
            $r3$.ɵnamespaceSVG();
            $r3$.ɵelementStart(1, "svg");
            $r3$.ɵelement(2, "circle", $c3$);
            $r3$.ɵelementEnd();
            $r3$.ɵnamespaceHTML();
            $r3$.ɵelementStart(3, "p");
            $r3$.ɵtext(4, "test");
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
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
        const $c1$ = ["title", "Hello"];
        const $c2$ = ["my-app", ${InitialStylingFlags.VALUES_MODE}, "my-app", true];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $c1$);
            $r3$.ɵelementStyling($c2$);
            $r3$.ɵnamespaceMathML();
            $r3$.ɵelementStart(1, "math");
            $r3$.ɵelement(2, "infinity");
            $r3$.ɵelementEnd();
            $r3$.ɵnamespaceHTML();
            $r3$.ɵelementStart(3, "p");
            $r3$.ɵtext(4, "test");
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
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
        const $c1$ = ["title", "Hello"];
        const $c2$ = ["my-app", ${InitialStylingFlags.VALUES_MODE}, "my-app", true];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $c1$);
            $r3$.ɵelementStyling($c2$);
            $r3$.ɵtext(1, "Hello ");
            $r3$.ɵelementStart(2, "b");
            $r3$.ɵtext(3, "World");
            $r3$.ɵelementEnd();
            $r3$.ɵtext(4, "!");
            $r3$.ɵelementEnd();
          }
        }
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
    });

    // TODO(https://github.com/angular/angular/issues/24426): We need to support the parser actually
    // building the proper attributes based off of xmlns atttribuates.
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
              $r3$.ɵelementStart(0, "div", $e0_attrs$);
              $r3$.ɵtext(1, "Hello ");
              $r3$.ɵelementStart(2, "b");
              $r3$.ɵtext(3, "World");
              $r3$.ɵelementEnd();
              $r3$.ɵtext(4, "!");
              $r3$.ɵelementEnd();
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
              i0.ɵEC(0);
              i0.ɵelementStart(1, "span");
              i0.ɵtext(2, "in a ");
              i0.ɵelementEnd();
              i0.ɵtext(3, "container");
              i0.ɵeC();
            }
          }
        `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate elementContainerStart/End instructions for empty <ng-container>', () => {
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
              i0.ɵEC(0);
              i0.ɵeC();
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
        const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "id"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelement(0, "div", $e0_attrs$);
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, "id", $r3$.ɵbind(ctx.id));
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

      const $e0_attrs$ = [];
      const factory =
          'factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }';
      const template = `
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelement(0, "div", $e0_attrs$);
            $r3$.ɵpipe(1,"pipe");
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, "ternary", $r3$.ɵbind((ctx.cond ? $r3$.ɵpureFunction1(8, $c0$, ctx.a): $c1$)));
            $r3$.ɵelementProperty(0, "pipe", $r3$.ɵbind($r3$.ɵpipeBind3(1, 4, ctx.value, 1, 2)));
            $r3$.ɵelementProperty(0, "and", $r3$.ɵbind((ctx.cond && $r3$.ɵpureFunction1(10, $c0$, ctx.b))));
            $r3$.ɵelementProperty(0, "or", $r3$.ɵbind((ctx.cond || $r3$.ɵpureFunction1(12, $c0$, ctx.c))));
          }
        }
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
      expectEmit(result.source, template, 'Incorrect template');
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
        const _c0 = ["error"];
        const _c1 = ["background-color"];
        …
        MyComponent.ngComponentDef = i0.ɵdefineComponent({type:MyComponent,selectors:[["my-component"]],
            factory: function MyComponent_Factory(t){
              return new (t || MyComponent)();
            },
            features: [$r3$.ɵPublicFeature],
            consts: 1,
            vars: 0,
            template: function MyComponent_Template(rf,ctx){
              if (rf & 1) {
                $r3$.ɵelementStart(0, "div");
                $r3$.ɵelementStyling(_c0, _c1);
                $r3$.ɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵelementStylingProp(0, 0, ctx.color);
                $r3$.ɵelementClassProp(0, 0, ctx.error);
                $r3$.ɵelementStylingApply(0);
              }
            }
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
        ChildComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: ChildComponent,
          selectors: [["child"]],
          factory: function ChildComponent_Factory(t) { return new (t || ChildComponent)(); },
          features: [$r3$.ɵPublicFeature],
          consts: 1,
          vars: 0,
          template:  function ChildComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵtext(0, "child-view");
            }
          }
        });`;

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        SomeDirective.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: SomeDirective,
          selectors: [["", "some-directive", ""]],
          factory: function SomeDirective_Factory(t) {return new (t || SomeDirective)(); },
          features: [$r3$.ɵPublicFeature]
        });
      `;

      // MyComponent definition should be:
      const MyComponentDefinition = `
        const $c1$ = ["some-directive", ""];
        …
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          features: [$r3$.ɵPublicFeature],
          consts: 2,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelement(0, "child", $c1$);
              $r3$.ɵtext(1, "!");
            }
          },
          directives: [ChildComponent, SomeDirective]
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
        SomeDirective.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: SomeDirective,
          selectors: [["div", "some-directive", "", 8, "foo", 3, "title", "", 9, "baz"]],
          factory: function SomeDirective_Factory(t) {return new (t || SomeDirective)(); },
          features: [$r3$.ɵPublicFeature]
        });
      `;

      // OtherDirective definition should be:
      const OtherDirectiveDefinition = `
        OtherDirective.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: OtherDirective,
          selectors: [["", 5, "span", "title", "", 9, "baz"]],
          factory: function OtherDirective_Factory(t) {return new (t || OtherDirective)(); },
          features: [$r3$.ɵPublicFeature]
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ngDirectiveDef');
      expectEmit(source, OtherDirectiveDefinition, 'Incorrect OtherDirective.ngDirectiveDef');
    });

    it('should support host bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive, HostBinding, NgModule} from '@angular/core';

            @Directive({selector: '[hostBindingDir]'})
            export class HostBindingDir {
              @HostBinding('id') dirId = 'some id';
            }

            @NgModule({declarations: [HostBindingDir]})
            export class MyModule {}
          `
        }
      };

      const HostBindingDirDeclaration = `
        HostBindingDir.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: HostBindingDir,
          selectors: [["", "hostBindingDir", ""]],
          factory: function HostBindingDir_Factory(t) { return new (t || HostBindingDir)(); },
          hostBindings: function HostBindingDir_HostBindings(dirIndex, elIndex) {
            $r3$.ɵelementProperty(elIndex, "id", $r3$.ɵbind($r3$.ɵloadDirective(dirIndex).dirId));
          },
          hostVars: 1,
          features: [$r3$.ɵPublicFeature]
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostBindingDirDeclaration, 'Invalid host binding code');
    });

    it('should support host bindings with pure functions', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'host-binding-comp',
              host: {
                '[id]': '["red", id]'
              },
              template: ''
            })
            export class HostBindingComp {
              id = 'some id';
            }

            @NgModule({declarations: [HostBindingComp]})
            export class MyModule {}
          `
        }
      };

      const HostBindingCompDeclaration = `
        const $ff$ = function ($v$) { return ["red", $v$]; };
        …
        HostBindingComp.ngComponentDef = $r3$.ɵdefineComponent({
          type: HostBindingComp,
          selectors: [["host-binding-comp"]],
          factory: function HostBindingComp_Factory(t) { return new (t || HostBindingComp)(); },
          hostBindings: function HostBindingComp_HostBindings(dirIndex, elIndex) {
            $r3$.ɵelementProperty(elIndex, "id", $r3$.ɵbind($r3$.ɵpureFunction1(1, $ff$, $r3$.ɵloadDirective(dirIndex).id)));
          },
          hostVars: 3,
          features: [$r3$.ɵPublicFeature],
          consts: 0,
          vars: 0,
          template: function HostBindingComp_Template(rf, ctx) {}
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostBindingCompDeclaration, 'Invalid host binding code');
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
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { 
             return new (t || MyComponent)(
                $r3$.ɵdirectiveInject(ElementRef), $r3$.ɵdirectiveInject(ViewContainerRef), 
                $r3$.ɵdirectiveInject(ChangeDetectorRef)); 
          },
          features: [$r3$.ɵPublicFeature],
          consts: 0,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {}
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
        IfDirective.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: IfDirective,
          selectors: [["", "if", ""]],
          factory: function IfDirective_Factory(t) { return new (t || IfDirective)($r3$.ɵdirectiveInject(TemplateRef)); },
          features: [$r3$.ɵPublicFeature]
        });`;
      const MyComponentDefinition = `
        const $c1$ = ["foo", ""];
        const $c2$ = ["if", ""];
        function MyComponent_li_Template_2(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "li");
            $r3$.ɵtext(1);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $myComp$ = $r3$.ɵnextContext();
            const $foo$ = $r3$.ɵreference(1);
            $r3$.ɵtextBinding(1, $r3$.ɵinterpolation2("", $myComp$.salutation, " ", $foo$, ""));
          }
        }
        …
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          features: [$r3$.ɵPublicFeature],
          consts: 3,
          vars: 0,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "ul", null, $c1$);
              $r3$.ɵtemplate(2, MyComponent_li_Template_2, 2, 2, null, $c2$);
              $r3$.ɵelementEnd();
            }
          },
          directives:[IfDirective]
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
          const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "names"];
          const $e0_ff$ = function ($v$) { return ["Nancy", $v$]; };
          …
          MyApp.ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            features: [$r3$.ɵPublicFeature],
            consts: 1,
            vars: 3,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelement(0, "my-comp", $e0_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵelementProperty(0, "names", $r3$.ɵbind($r3$.ɵpureFunction1(1, $e0_ff$, ctx.customName)));
              }
            },
           directives: [MyComp]
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
          const $e0_attr$ = [${AttributeMarker.SelectOnly}, "names"];
          const $e0_ff$ = function ($v0$, $v1$, $v2$, $v3$, $v4$, $v5$, $v6$, $v7$, $v8$) {
            return ["start-", $v0$, $v1$, $v2$, $v3$, $v4$, "-middle-", $v5$, $v6$, $v7$, $v8$, "-end"];
          }
          …
          MyApp.ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            features: [$r3$.ɵPublicFeature],
            consts: 1,
            vars: 11,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelement(0, "my-comp", $e0_attr$);
              }
              if (rf & 2) {
                $r3$.ɵelementProperty(
                    0, "names",
                    $r3$.ɵbind($r3$.ɵpureFunctionV(1, $e0_ff$, [ctx.n0, ctx.n1, ctx.n2, ctx.n3, ctx.n4, ctx.n5, ctx.n6, ctx.n7, ctx.n8])));
              }
            },
            directives: [MyComp]
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
          const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "config"];
          const $e0_ff$ = function ($v$) { return {"duration": 500, animation: $v$}; };
          …
          MyApp.ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            features: [$r3$.ɵPublicFeature],
            consts: 1,
            vars: 3,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelement(0, "object-comp", $e0_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵelementProperty(0, "config", $r3$.ɵbind($r3$.ɵpureFunction1(1, $e0_ff$, ctx.name)));
              }
            },
            directives: [ObjectComp]
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
          const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "config"];
          const $c0$ = {opacity: 0, duration: 0};
          const $e0_ff$ = function ($v$) { return {opacity: 1, duration: $v$}; };
          const $e0_ff_1$ = function ($v$) { return [$c0$, $v$]; };
          const $e0_ff_2$ = function ($v1$, $v2$) { return {animation: $v1$, actions: $v2$}; };
          …
          MyApp.ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [["my-app"]],
            factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
            features: [$r3$.ɵPublicFeature],
            consts: 1,
            vars: 8,
            template:  function MyApp_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelement(0, "nested-comp", $e0_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵelementProperty(
                    0, "config",
                    $r3$.ɵbind($r3$.ɵpureFunction2(5, $e0_ff_2$, ctx.name, $r3$.ɵpureFunction1(3, $e0_ff_1$, $r3$.ɵpureFunction1(1, $e0_ff$, ctx.duration)))));
              }
            },
            directives: [NestedComp]
          });
        `;


        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyAppDefinition, 'Invalid array/object literal binding');
      });
    });

    it('should support content projection', () => {
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
                <div id="second"><ng-content select="span[title=toSecond]"></ng-content></div>\`
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
        SimpleComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: SimpleComponent,
          selectors: [["simple"]],
          factory: function SimpleComponent_Factory(t) { return new (t || SimpleComponent)(); },
          features: [$r3$.ɵPublicFeature],
          consts: 2,
          vars: 0,
          template:  function SimpleComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵprojectionDef();
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵprojection(1);
              $r3$.ɵelementEnd();
            }
          }
        });`;

      const ComplexComponentDefinition = `
        const $c1$ = [[["span", "title", "tofirst"]], [["span", "title", "tosecond"]]];
        const $c2$ = ["span[title=toFirst]", "span[title=toSecond]"];
        const $c3$ = ["id","first"];
        const $c4$ = ["id","second"];
        …
        ComplexComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: ComplexComponent,
          selectors: [["complex"]],
          factory: function ComplexComponent_Factory(t) { return new (t || ComplexComponent)(); },
          features: [$r3$.ɵPublicFeature],
          consts: 4,
          vars: 0,
          template:  function ComplexComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵprojectionDef($c1$, $c2$);
              $r3$.ɵelementStart(0, "div", $c3$);
              $r3$.ɵprojection(1, 1);
              $r3$.ɵelementEnd();
              $r3$.ɵelementStart(2, "div", $c4$);
              $r3$.ɵprojection(3, 2);
              $r3$.ɵelementEnd();
            }
          }
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(result.source, SimpleComponentDefinition, 'Incorrect SimpleComponent definition');
      expectEmit(
          result.source, ComplexComponentDefinition, 'Incorrect ComplexComponent definition');
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

      it('should support view queries', () => {
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
              @ViewChild(SomeDirective) someDir: SomeDirective;
            }

            @NgModule({declarations: [SomeDirective, ViewQueryComponent]})
            export class MyModule {}
          `
          }
        };

        const ViewQueryComponentDefinition = `
          const $e0_attrs$ = ["someDir",""];
          …
          ViewQueryComponent.ngComponentDef = $r3$.ɵdefineComponent({
            type: ViewQueryComponent,
            selectors: [["view-query-component"]],
            factory: function ViewQueryComponent_Factory(t) { return new (t || ViewQueryComponent)(); },
            features: [$r3$.ɵPublicFeature],
            viewQuery: function ViewQueryComponent_Query(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵquery(0, SomeDirective, true);
              }
              if (rf & 2) {
                var $tmp$;
                ($r3$.ɵqueryRefresh(($tmp$ = $r3$.ɵload(0))) && (ctx.someDir = $tmp$.first));
              }
            },
            consts: 2,
            vars: 0,
            template:  function ViewQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelement(1, "div", $e0_attrs$);
              }
            },
            directives: function () { return [SomeDirective]; }
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, ViewQueryComponentDefinition, 'Invalid ViewQuery declaration');
      });

      it('should support content queries', () => {
        const files = {
          app: {
            ...directive,
            'spec.ts': `
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
          ContentQueryComponent.ngComponentDef = $r3$.ɵdefineComponent({
            type: ContentQueryComponent,
            selectors: [["content-query-component"]],
            factory: function ContentQueryComponent_Factory(t) {
              return new (t || ContentQueryComponent)();
            },
            contentQueries: function ContentQueryComponent_ContentQueries() {
              $r3$.ɵregisterContentQuery($r3$.ɵquery(null, SomeDirective, true));
              $r3$.ɵregisterContentQuery($r3$.ɵquery(null, SomeDirective, false));
            },
            contentQueriesRefresh: function ContentQueryComponent_ContentQueriesRefresh(dirIndex, queryStartIndex) {
              const instance = $r3$.ɵloadDirective(dirIndex);
              var $tmp$;
              ($r3$.ɵqueryRefresh(($tmp$ = $r3$.ɵloadQueryList(queryStartIndex))) && ($instance$.someDir = $tmp$.first));
              ($r3$.ɵqueryRefresh(($tmp$ = $r3$.ɵloadQueryList((queryStartIndex + 1)))) && ($instance$.someDirList = $tmp$));
            },
            features: [$r3$.ɵPublicFeature],
            consts: 2,
            vars: 0,
            template:  function ContentQueryComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵprojectionDef();
                $r3$.ɵelementStart(0, "div");
                $r3$.ɵprojection(1);
                $r3$.ɵelementEnd();
              }
            }
          });`;

        const result = compile(files, angularFiles);

        const source = result.source;
        expectEmit(source, ContentQueryComponentDefinition, 'Invalid ContentQuery declaration');
      });
    });

    describe('pipes', () => {

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
                template: '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }}</p>'
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

      it('should render pipes', () => {
        const MyPipeDefinition = `
            MyPipe.ngPipeDef = $r3$.ɵdefinePipe({
              name: "myPipe",
              type: MyPipe,
              factory: function MyPipe_Factory(t) { return new (t || MyPipe)(); },
              pure: false
            });
        `;

        const MyPurePipeDefinition = `
            MyPurePipe.ngPipeDef = $r3$.ɵdefinePipe({
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
            MyApp.ngComponentDef = $r3$.ɵdefineComponent({
              type: MyApp,
              selectors: [["my-app"]],
              factory: function MyApp_Factory(t) { return new (t || MyApp)(); },
              features: [$r3$.ɵPublicFeature],
              consts: 6,
              vars: 17,
              template:  function MyApp_Template(rf, ctx) {
                if (rf & 1) {
                  $r3$.ɵtext(0);
                  $r3$.ɵpipe(1, "myPurePipe");
                  $r3$.ɵpipe(2, "myPipe");
                  $r3$.ɵelementStart(3, "p");
                  $r3$.ɵtext(4);
                  $r3$.ɵpipe(5, "myPipe");
                  $r3$.ɵelementEnd();
                }
                if (rf & 2) {
                  $r3$.ɵtextBinding(0, $r3$.ɵinterpolation1("", $r3$.ɵpipeBind2(1, 2, $r3$.ɵpipeBind2(2, 5, ctx.name, ctx.size), ctx.size), ""));
                  $r3$.ɵtextBinding(4, $r3$.ɵinterpolation1("", $r3$.ɵpipeBindV(5, 8, $r3$.ɵpureFunction1(15, $c0$, ctx.name)), ""));
                }
              },
              pipes: [MyPurePipe, MyPipe]
            });`;

        const result = compile(files, angularFiles);
        const source = result.source;

        expectEmit(source, MyPipeDefinition, 'Invalid pipe definition');
        expectEmit(source, MyPurePipeDefinition, 'Invalid pure pipe definition');
        expectEmit(source, MyAppDefinition, 'Invalid MyApp definition');
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
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          features: [$r3$.ɵPublicFeature],
          consts: 3,
          vars: 1,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelement(0, "input", null, $c1$);
              $r3$.ɵtext(2);
            }
            if (rf & 2) {
              const $user$ = $r3$.ɵreference(1);
              $r3$.ɵtextBinding(2, $r3$.ɵinterpolation1("Hello ", $user$.value, "!"));
            }
          }
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
        const $c2$ = ["if", ""];
        const $c3$ = ["baz", ""];
        const $c4$ = ["bar", ""];
        function MyComponent_div_span_Template_2(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "span");
            $r3$.ɵtext(1);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵnextContext();
            const $bar$ = $r3$.ɵreference(4);
            $r3$.ɵnextContext();
            const $foo$ = $r3$.ɵreference(1);
            const $baz$ = $r3$.ɵreference(5);
            $r3$.ɵtextBinding(1, $r3$.ɵinterpolation3("", $foo$, "-", $bar$, "-", $baz$, ""));
          }
        }
        function MyComponent_div_Template_3(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵtext(1);
            $r3$.ɵtemplate(2, MyComponent_div_span_Template_2, 2, 3, null, $c2$);
            $r3$.ɵelement(3, "span", null, $c4$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $bar$ = $r3$.ɵreference(4);
            $r3$.ɵnextContext();
            const $foo$ = $r3$.ɵreference(1);
            $r3$.ɵtextBinding(1, $r3$.ɵinterpolation2(" ", $foo$, "-", $bar$, " "));
          }
        }
        …
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [["my-component"]],
          factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
          features: [$r3$.ɵPublicFeature],
          consts: 6,
          vars: 1,
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelement(0, "div", null, $c1$);
              $r3$.ɵtext(2);
              $r3$.ɵtemplate(3, MyComponent_div_Template_3, 5, 2, null, $c2$);
              $r3$.ɵelement(4, "div", null, $c3$);
            }
            if (rf & 2) {
              const $foo$ = $r3$.ɵreference(1);
              $r3$.ɵtextBinding(2, $r3$.ɵinterpolation1(" ", $foo$, " "));
            }
          },
          directives:[IfDirective]
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
      const $c0$ = ["ngFor", "" , ${AttributeMarker.SelectOnly}, "ngForOf"];
      const $c1$ = ["foo", ""];
      const $c2$ = [${AttributeMarker.SelectOnly}, "ngIf"];

      function MyComponent_div_span_Template_3(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "span");
          $i0$.ɵtext(1);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $item$ = $i0$.ɵnextContext().$implicit;
          const $foo$ = $i0$.ɵreference(2);
          $i0$.ɵtextBinding(1, $i0$.ɵinterpolation2(" ", $foo$, " - ", $item$, " "));
        }
      }

      function MyComponent_div_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "div");
          $i0$.ɵelement(1, "div", null, $c1$);
          $i0$.ɵtemplate(3, MyComponent_div_span_Template_3, 2, 2, null, $c2$);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $app$ = $i0$.ɵnextContext();
          $i0$.ɵelementProperty(3, "ngIf", $i0$.ɵbind($app$.showing));
        }
      }

      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_div_Template_0, 4, 1, null, $c0$);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "ngForOf", $i0$.ɵbind(ctx.items));
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
          LifecycleComp.ngComponentDef = $r3$.ɵdefineComponent({
            type: LifecycleComp,
            selectors: [["lifecycle-comp"]],
            factory: function LifecycleComp_Factory(t) { return new (t || LifecycleComp)(); },
            inputs: {nameMin: "name"},
            features: [$r3$.ɵPublicFeature, $r3$.ɵNgOnChangesFeature],
            consts: 0,
            vars: 0,
            template:  function LifecycleComp_Template(rf, ctx) {}
          });`;

        const SimpleLayoutDefinition = `
          SimpleLayout.ngComponentDef = $r3$.ɵdefineComponent({
            type: SimpleLayout,
            selectors: [["simple-layout"]],
            factory: function SimpleLayout_Factory(t) { return new (t || SimpleLayout)(); },
            features: [$r3$.ɵPublicFeature],
            consts: 2,
            vars: 2,
            template:  function SimpleLayout_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelement(0, "lifecycle-comp", $e0_attrs$);
                $r3$.ɵelement(1, "lifecycle-comp", $e1_attrs$);
              }
              if (rf & 2) {
                $r3$.ɵelementProperty(0, "name", $r3$.ɵbind(ctx.name1));
                $r3$.ɵelementProperty(1, "name", $r3$.ɵbind(ctx.name2));
              }
            },
            directives: [LifecycleComp]
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
              ForOfDirective.ngDirectiveDef = $r3$.ɵdefineDirective({
                type: ForOfDirective,
                selectors: [["", "forOf", ""]],
                factory: function ForOfDirective_Factory(t) {
                  return new (t || ForOfDirective)($r3$.ɵdirectiveInject(ViewContainerRef), $r3$.ɵdirectiveInject(TemplateRef));
                },
                features: [$r3$.ɵPublicFeature, $r3$.ɵNgOnChangesFeature],
                inputs: {forOf: "forOf"}
              });
            `;

        const MyComponentDefinition = `
              const $t1_attrs$ = ["for", "", ${AttributeMarker.SelectOnly}, "forOf"];
              function MyComponent__svg_g_Template_1(rf, ctx) {
                if (rf & 1) {
                  $r3$.ɵnamespaceSVG();
                  $r3$.ɵelementStart(0,"g");
                  $r3$.ɵelement(1,"circle");
                  $r3$.ɵelementEnd();
                }
              }
              …
              MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
                type: MyComponent,
                selectors: [["my-component"]],
                factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
                features: [$r3$.ɵPublicFeature],
                consts: 2,
                vars: 1,
                template:  function MyComponent_Template(rf, ctx){
                  if (rf & 1) {
                    $r3$.ɵnamespaceSVG();
                    $r3$.ɵelementStart(0,"svg");
                    $r3$.ɵtemplate(1, MyComponent__svg_g_Template_1, 2, 0, null, $t1_attrs$);
                    $r3$.ɵelementEnd();
                  }
                  if (rf & 2) { $r3$.ɵelementProperty(1,"forOf",$r3$.ɵbind(ctx.items)); }
                },
                directives: function() { return [ForOfDirective]; }
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
          ForOfDirective.ngDirectiveDef = $r3$.ɵdefineDirective({
            type: ForOfDirective,
            selectors: [["", "forOf", ""]],
            factory: function ForOfDirective_Factory(t) {
              return new (t || ForOfDirective)($r3$.ɵdirectiveInject(ViewContainerRef), $r3$.ɵdirectiveInject(TemplateRef));
            },
            features: [$r3$.ɵPublicFeature, $r3$.ɵNgOnChangesFeature],
            inputs: {forOf: "forOf"}
          });
        `;

        const MyComponentDefinition = `
          const $t1_attrs$ = ["for", "", ${AttributeMarker.SelectOnly}, "forOf"];
          function MyComponent_li_Template_1(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "li");
              $r3$.ɵtext(1);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              const $item$ = ctx.$implicit;
              $r3$.ɵtextBinding(1, $r3$.ɵinterpolation1("", $item$.name, ""));
            }
          }
          …
          MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
            features: [$r3$.ɵPublicFeature],
            consts: 2,
            vars: 1,
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelementStart(0, "ul");
                $r3$.ɵtemplate(1, MyComponent_li_Template_1, 2, 1, null, $t1_attrs$);
                $r3$.ɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵelementProperty(1, "forOf", $r3$.ɵbind(ctx.items));
              }
            },
            directives: function() { return [ForOfDirective]; }
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
          const $t4_attrs$ = ["for", "", ${AttributeMarker.SelectOnly}, "forOf"];
          function MyComponent_li_li_Template_4(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "li");
              $r3$.ɵtext(1);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              const $info$ = ctx.$implicit;
              const $item$ = $r3$.ɵnextContext().$implicit;
              $r3$.ɵtextBinding(1, $r3$.ɵinterpolation2(" ", $item$.name, ": ", $info$.description, " "));
            }
          }

          function MyComponent_li_Template_1(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "li");
              $r3$.ɵelementStart(1, "div");
              $r3$.ɵtext(2);
              $r3$.ɵelementEnd();
              $r3$.ɵelementStart(3, "ul");
              $r3$.ɵtemplate(4, MyComponent_li_li_Template_4, 2, 2, null, $t4_attrs$);
              $r3$.ɵelementEnd();
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              const $item$ = ctx.$implicit;
              $r3$.ɵtextBinding(2, $r3$.ɵinterpolation1("", IDENT.name, ""));
              $r3$.ɵelementProperty(4, "forOf", $r3$.ɵbind(IDENT.infos));
            }
          }

          …
          MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); },
            features: [$r3$.ɵPublicFeature],
            consts: 2,
            vars: 1,
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelementStart(0, "ul");
                $r3$.ɵtemplate(1, MyComponent_li_Template_1, 5, 2, null, $c1$);
                $r3$.ɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵelementProperty(1, "forOf", $r3$.ɵbind(ctx.items));
              }
            },
            directives: function () { return [ForOfDirective]; }
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;
        expectEmit(source, MyComponentDefinition, 'Invalid component definition');
      });
    });
  });

  describe('inherited bare classes', () => {
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
      BaseClass.ngBaseDef = i0.ɵdefineBase({
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
      BaseClass.ngBaseDef = i0.ɵdefineBase({
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
      BaseClass.ngBaseDef = i0.ɵdefineBase({
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
