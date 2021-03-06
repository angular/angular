/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
          $i0$.ɵɵelementStart(0, "div");
          $i0$.ɵɵtext(1);
          $i0$.ɵɵelementEnd();
        }
        if (rf & 2) {
          $r3$.ɵɵadvance(1);
          $i0$.ɵɵtextInterpolate1("Hello ", $ctx$.name, "");
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
      …
      consts: [[${AttributeMarker.Bindings}, "title"]],
      template:function MyComponent_Template(rf, $ctx$){
        if (rf & 1) {
          $i0$.ɵɵelement(0, "a", 0);
        }
        if (rf & 2) {
          $i0$.ɵɵproperty("title", $ctx$.title);
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
      …
      consts: [[${AttributeMarker.Bindings}, "title"]],
      template:function MyComponent_Template(rf, $ctx$){
        if (rf & 1) {
          $i0$.ɵɵelement(0, "a", 0);
        }
        if (rf & 2) {
          $i0$.ɵɵpropertyInterpolate1("title", "Hello ", $ctx$.name, "");
        }
      }`;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect interpolated property binding');
    });

    it('should ignore empty bindings', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';
            @Component({
              selector: 'test',
              template: '<div [someProp]></div>'
            })
            class FooCmp {}
          `
        }
      };
      const result = compile(files, angularFiles);
      expect(result.source).not.toContain('i0.ɵɵproperty');
    });

    it('should not remap property names whose names do not correspond to their attribute names',
       () => {
         const files = {
           app: {
             'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <label [for]="forValue"></label>\`
              })
              export class MyComponent {
                forValue = 'some-input';
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
           }
         };

         const template = `
      consts: [[${AttributeMarker.Bindings}, "for"]]

      // ...

      function MyComponent_Template(rf, ctx) {
        if (rf & 1) {
            $i0$.ɵɵelement(0, "label", 0);
        }
        if (rf & 2) {
            $i0$.ɵɵproperty("for", ctx.forValue);
        }
      }`;

         const result = compile(files, angularFiles);

         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should emit temporary evaluation within the binding expression for in-order execution',
       () => {
         // https://github.com/angular/angular/issues/37194
         // Verifies that temporary expressions used for expressions with potential side-effects in
         // the LHS of a safe navigation access are emitted within the binding expression itself, to
         // ensure that these temporaries are evaluated during the evaluation of the binding. This
         // is important for when the LHS contains a pipe, as pipe evaluation depends on the current
         // binding index.
         const files = {
           app: {
             'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<button [title]="myTitle" [id]="(auth()?.identity() | async)?.id" [tabindex]="1"></button>'
            })
            export class MyComponent {
              myTitle = 'hello';
              auth?: () => { identity(): any; };
            }`
           }
         };

         const result = compile(files, angularFiles);
         const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              let $tmp0$ = null;
              $r3$.ɵɵproperty("title", ctx.myTitle)("id", ($tmp0$ = $r3$.ɵɵpipeBind1(1, 3, ($tmp0$ = ctx.auth()) == null ? null : $tmp0$.identity())) == null ? null : $tmp0$.id)("tabindex", 1);
            }
          }
        `;

         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should chain multiple property bindings into a single instruction', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>'
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'special-button';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵproperty("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain property bindings in the presence of other bindings', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<button [title]="1" [attr.id]="2" [tabindex]="3" aria-label="{{1 + 3}}"></button>'
            })
            export class MyComponent {}`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵpropertyInterpolate("aria-label", 1 + 3);
              $r3$.ɵɵproperty("title", 1)("tabindex", 3);
              $r3$.ɵɵattribute("id", 2);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should not add interpolated properties to the property instruction chain', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>'
            })
            export class MyComponent {}`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵpropertyInterpolate("tabindex", 0 + 3);
              $r3$.ɵɵpropertyInterpolate2("aria-label", "hello-", 1 + 3, "-", 2 + 3, "");
              $r3$.ɵɵproperty("title", 1)("id", 2);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain synthetic property bindings together with regular property bindings', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button
                  [title]="myTitle"
                  [@expand]="expansionState"
                  [tabindex]="1"
                  [@fade]="'out'"></button>
                \`
            })
            export class MyComponent {
              expansionState = 'expanded';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵproperty("title", ctx.myTitle)("@expand", ctx.expansionState)("tabindex", 1)("@fade", "out");
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple property bindings on an ng-template', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<ng-template [title]="myTitle" [id]="buttonId" [tabindex]="1"></ng-template>'
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'custom-id';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵproperty("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple property bindings when there are multiple elements', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>
                <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
                <custom-element [prop]="'one'" [otherProp]="2"></custom-element>
              \`
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'special-button';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵproperty("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("id", 1)("title", "hello")("someProp", 1 + 2);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("prop", "one")("otherProp", 2);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple property bindings when there are child elements', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button [title]="myTitle" [id]="buttonId" [tabindex]="1">
                  <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
                </button>\`
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'special-button';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵproperty("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("id", 1)("title", "hello")("someProp", 1 + 2);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('attribute bindings', () => {
    it('should chain multiple attribute bindings into a single instruction', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button [attr.title]="myTitle" attr.id="{{buttonId}}" [attr.tabindex]="1"></button>
              \`
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'special-button';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple single-interpolation attribute bindings into one instruction', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button attr.title="{{myTitle}}" attr.id="{{buttonId}}" attr.tabindex="{{1}}"></button>
              \`
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'special-button';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain attribute bindings in the presence of other bindings', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button [attr.title]="1" [id]="2" [attr.tabindex]="3" attr.aria-label="prefix-{{1 + 3}}">
                </button>
              \`
            })
            export class MyComponent {}`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattributeInterpolate1("aria-label", "prefix-", 1 + 3, "");
              $r3$.ɵɵproperty("id", 2);
              $r3$.ɵɵattribute("title", 1)("tabindex", 3);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should not add interpolated attributes to the attribute instruction chain', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button
                  [attr.title]="1"
                  [attr.id]="2"
                  attr.tabindex="prefix-{{0 + 3}}"
                  attr.aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>\`
            })
            export class MyComponent {}`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattributeInterpolate1("tabindex", "prefix-", 0 + 3, "");
              $r3$.ɵɵattributeInterpolate2("aria-label", "hello-", 1 + 3, "-", 2 + 3, "");
              $r3$.ɵɵattribute("title", 1)("id", 2);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple attribute bindings when there are multiple elements', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1"></button>
                <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
                <custom-element [attr.some-attr]="'one'" [attr.some-other-attr]="2"></custom-element>
              \`
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'special-button';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵattribute("id", 1)("title", "hello")("some-attr", 1 + 2);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵattribute("some-attr", "one")("some-other-attr", 2);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple attribute bindings when there are child elements', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1">
                  <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
                </button>\`
            })
            export class MyComponent {
              myTitle = 'hello';
              buttonId = 'special-button';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          template: function MyComponent_Template(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵattribute("id", 1)("title", "hello")("some-attr", 1 + 2);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should exclude attribute bindings from the attributes array', () => {
      const files: MockDirectory = {
        app: {
          'example.ts': `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`<a
              target="_blank"
              [title]="1"
              [attr.foo]="'one'"
              (customEvent)="doThings()"
              [attr.bar]="'two'"
              [id]="2"
              aria-label="link"
              [attr.baz]="three"></a>\`
          })
          export class MyComponent {
            doThings() {}
          }

          @NgModule({declarations: [MyComponent]})
          export class MyModule {}`
        }
      };

      const template = `
        consts: [["target", "_blank", "aria-label", "link", ${
          AttributeMarker.Bindings}, "title", "id", "customEvent"]],
        …
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect attribute array');
    });
  });

  describe('host bindings', () => {
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
      HostBindingDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
        type: HostBindingDir,
        selectors: [["", "hostBindingDir", ""]],
          hostVars: 1,
          hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵhostProperty("id", ctx.dirId);
            }
          }
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostBindingDirDeclaration, 'Invalid host binding code');
    });

    it('should support host bindings with temporary expressions', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive, NgModule} from '@angular/core';

            @Directive({
              selector: '[hostBindingDir]',
              host: {'[id]': 'getData()?.id'}
            })
            export class HostBindingDir {
              getData?: () => { id: number };
            }

            @NgModule({declarations: [HostBindingDir]})
            export class MyModule {}
          `
        }
      };

      const HostBindingDirDeclaration = `
      HostBindingDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
        type: HostBindingDir,
        selectors: [["", "hostBindingDir", ""]],
          hostVars: 1,
          hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
            if (rf & 2) {
              let $tmp0$ = null;
              $r3$.ɵɵhostProperty("id", ($tmp0$ = ctx.getData()) == null ? null : $tmp0$.id);
            }
          }
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
        HostBindingComp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: HostBindingComp,
          selectors: [["host-binding-comp"]],
          hostVars: 3,
          hostBindings: function HostBindingComp_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵhostProperty("id", $r3$.ɵɵpureFunction1(1, $ff$, ctx.id));
            }
          },
          decls: 0,
          vars: 0,
          template: function HostBindingComp_Template(rf, ctx) {},
          encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostBindingCompDeclaration, 'Invalid host binding code');
    });

    it('should support host attribute bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive, NgModule} from '@angular/core';

            @Directive({
              selector: '[hostAttributeDir]',
              host: {
                '[attr.required]': 'required'
              }
            })
            export class HostAttributeDir {
              required = true;
            }

            @NgModule({declarations: [HostAttributeDir]})
            export class MyModule {}
          `
        }
      };

      const HostAttributeDirDeclaration = `
        HostAttributeDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: HostAttributeDir,
          selectors: [["", "hostAttributeDir", ""]],
          hostVars: 1,
          hostBindings: function HostAttributeDir_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵattribute("required", ctx.required);
            }
          }
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostAttributeDirDeclaration, 'Invalid host attribute code');
    });

    it('should support host attributes', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive, NgModule} from '@angular/core';

            @Directive({
              selector: '[hostAttributeDir]',
              host: {
                'aria-label': 'label'
              }
            })
            export class HostAttributeDir {
            }

            @NgModule({declarations: [HostAttributeDir]})
            export class MyModule {}
          `
        }
      };

      const HostAttributeDirDeclaration = `
        HostAttributeDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: HostAttributeDir,
          selectors: [["", "hostAttributeDir", ""]],
          hostAttrs: ["aria-label", "label"]
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostAttributeDirDeclaration, 'Invalid host attribute code');
    });

    it('should support host attributes together with host classes and styles', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule} from '@angular/core';

            @Component({
              selector: 'my-host-attribute-component',
              template: "...",
              host: {
                'title': 'hello there from component',
                'style': 'opacity:1'
              }
            })
            export class HostAttributeComp {
            }

            @Directive({
              selector: '[hostAttributeDir]',
              host: {
                'style': 'width: 200px; height: 500px',
                '[style.opacity]': "true",
                'class': 'one two',
                '[class.three]': "true",
                'title': 'hello there from directive',
              }
            })
            export class HostAttributeDir {
            }

            @NgModule({declarations: [HostAttributeComp, HostAttributeDir]})
            export class MyModule {}
          `
        }
      };

      const CompAndDirDeclaration = `
        HostAttributeComp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: HostAttributeComp,
          selectors: [["my-host-attribute-component"]],
          hostAttrs: ["title", "hello there from component", ${
          AttributeMarker.Styles}, "opacity", "1"],
        …
        HostAttributeDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          type: HostAttributeDir,
          selectors: [["", "hostAttributeDir", ""]],
          hostAttrs: ["title", "hello there from directive", ${
          AttributeMarker.Classes}, "one", "two", ${
          AttributeMarker.Styles}, "width", "200px", "height", "500px"],
          hostVars: 4,
          hostBindings: function HostAttributeDir_HostBindings(rf, ctx) {
            …
          }
    `;

      const result = compile(files, angularFiles);
      const source = result.source;
      expectEmit(source, CompAndDirDeclaration, 'Invalid host attribute code');
    });

    it('should chain multiple host property bindings into a single instruction', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[title]': 'myTitle',
                '[tabindex]': '1',
                '[id]': 'myId'
              }
            })
            export class MyDirective {
              myTitle = 'hello';
              myId = 'special-directive';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          hostBindings: function MyDirective_HostBindings(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵhostProperty("title", ctx.myTitle)("tabindex", 1)("id", ctx.myId);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain both host properties in the decorator and on the class', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[tabindex]': '1'
              }
            })
            export class MyDirective {
              @HostBinding('title')
              myTitle = 'hello';

              @HostBinding('id')
              myId = 'special-directive';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          hostBindings: function MyDirective_HostBindings(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵhostProperty("tabindex", 1)("title", ctx.myTitle)("id", ctx.myId);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple host property bindings in the presence of other bindings', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[title]': '"my title"',
                '[attr.tabindex]': '1',
                '[id]': '"my-id"'
              }
            })
            export class MyDirective {}`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          hostBindings: function MyDirective_HostBindings(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵhostProperty("title", "my title")("id", "my-id");
              $r3$.ɵɵattribute("tabindex", 1);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple synthetic properties into a single instruction call', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[@expand]': 'expandedState',
                '[@fadeOut]': 'true',
                '[@shrink]': 'isSmall'
              }
            })
            export class MyDirective {
              expandedState = 'collapsed';
              isSmall = true;
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
        …
        hostBindings: function MyDirective_HostBindings(rf, ctx) {
          …
          if (rf & 2) {
            $r3$.ɵɵsyntheticHostProperty("@expand", ctx.expandedState)("@fadeOut", true)("@shrink", ctx.isSmall);
          }
        }
      `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple host attribute bindings into a single instruction', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[attr.title]': 'myTitle',
                '[attr.tabindex]': '1',
                '[attr.id]': 'myId'
              }
            })
            export class MyDirective {
              myTitle = 'hello';
              myId = 'special-directive';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          hostBindings: function MyDirective_HostBindings(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattribute("title", ctx.myTitle)("tabindex", 1)("id", ctx.myId);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain both host attributes in the decorator and on the class', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[attr.tabindex]': '1'
              }
            })
            export class MyDirective {
              @HostBinding('attr.title')
              myTitle = 'hello';

              @HostBinding('attr.id')
              myId = 'special-directive';
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          hostBindings: function MyDirective_HostBindings(rf, ctx) {
            …
            if (rf & 2) {
              $r3$.ɵɵattribute("tabindex", 1)("title", ctx.myTitle)("id", ctx.myId);
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple host attribute bindings in the presence of other bindings', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[attr.title]': '"my title"',
                '[tabindex]': '1',
                '[attr.id]': '"my-id"'
              }
            })
            export class MyDirective {}`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
            …
            hostBindings: function MyDirective_HostBindings(rf, ctx) {
              …
              if (rf & 2) {
                $r3$.ɵɵhostProperty("tabindex", 1);
                $r3$.ɵɵattribute("title", "my title")("id", "my-id");
              }
            }
          `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple host listeners into a single instruction', () => {
      const files = {
        app: {
          'example.ts': `
            import {Directive, HostListener} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '(mousedown)': 'mousedown()',
                '(mouseup)': 'mouseup()',
              }
            })
            export class MyDirective {
              mousedown() {}
              mouseup() {}

              @HostListener('click')
              click() {}
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          hostBindings: function MyDirective_HostBindings(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵlistener("mousedown", function MyDirective_mousedown_HostBindingHandler() { return ctx.mousedown(); })("mouseup", function MyDirective_mouseup_HostBindingHandler() { return ctx.mouseup(); })("click", function MyDirective_click_HostBindingHandler() { return ctx.click(); });
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple synthetic host listeners into a single instruction', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component, HostListener} from '@angular/core';

            @Component({
              selector: 'my-comp',
              template: '',
              host: {
                '(@animation.done)': 'done()',
              }
            })
            export class MyComponent {
              @HostListener('@animation.start')
              start() {}
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
          …
          hostBindings: function MyComponent_HostBindings(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵsyntheticHostListener("@animation.done", function MyComponent_animation_animation_done_HostBindingHandler() { return ctx.done(); })("@animation.start", function MyComponent_animation_animation_start_HostBindingHandler() { return ctx.start(); });
            }
          }
        `;

      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain multiple regular and synthetic host listeners into two instructions', () => {
      const files = {
        app: {
          'example.ts': `
            import {Component, HostListener} from '@angular/core';

            @Component({
              selector: 'my-comp',
              template: '',
              host: {
                '(mousedown)': 'mousedown()',
                '(@animation.done)': 'done()',
                '(mouseup)': 'mouseup()',
              }
            })
            export class MyComponent {
              @HostListener('@animation.start')
              start() {}

              @HostListener('click')
              click() {}
            }`
        }
      };

      const result = compile(files, angularFiles);
      const template = `
        …
        hostBindings: function MyComponent_HostBindings(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵsyntheticHostListener("@animation.done", function MyComponent_animation_animation_done_HostBindingHandler() { return ctx.done(); })("@animation.start", function MyComponent_animation_animation_start_HostBindingHandler() { return ctx.start(); });
            $r3$.ɵɵlistener("mousedown", function MyComponent_mousedown_HostBindingHandler() { return ctx.mousedown(); })("mouseup", function MyComponent_mouseup_HostBindingHandler() { return ctx.mouseup(); })("click", function MyComponent_click_HostBindingHandler() { return ctx.click(); });
          }
        }
      `;
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('non bindable behavior', () => {
    const getAppFiles = (template: string = ''): MockDirectory => ({
      app: {
        'example.ts': `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`${template}\`
          })
          export class MyComponent {
            name = 'John Doe';
          }

          @NgModule({declarations: [MyComponent]})
          export class MyModule {}`
      }
    });

    it('should generate the proper update instructions for interpolated properties', () => {
      const files: MockDirectory = getAppFiles(`
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
        <div title="a{{one}}b{{two}}c{{three}}d"></div>
        <div title="a{{one}}b{{two}}c"></div>
        <div title="a{{one}}b"></div>
        <div title="{{one}}"></div>
      `);

      const template = `
      …
        if (rf & 2) {
          i0.ɵɵpropertyInterpolateV("title", ["a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i", ctx.nine, "j"]);
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate8("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate7("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate6("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate5("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate4("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate3("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate2("title", "a", ctx.one, "b", ctx.two, "c");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate1("title", "a", ctx.one, "b");
          i0.ɵɵadvance(1);
          i0.ɵɵpropertyInterpolate("title", ctx.one);
      }
      …
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect handling of interpolated properties');
    });


    it('should generate the proper update instructions for interpolated attributes', () => {
      const files: MockDirectory = getAppFiles(`
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d"></div>
        <div attr.title="a{{one}}b{{two}}c"></div>
        <div attr.title="a{{one}}b"></div>
        <div attr.title="{{one}}"></div>
      `);

      const template = `
      …
        if (rf & 2) {
          i0.ɵɵattributeInterpolateV("title", ["a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i", ctx.nine, "j"]);
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate8("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i");
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate7("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h");
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate6("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g");
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate5("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f");
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate4("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e");
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate3("title", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d");
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate2("title", "a", ctx.one, "b", ctx.two, "c");
          i0.ɵɵadvance(1);
          i0.ɵɵattributeInterpolate1("title", "a", ctx.one, "b");
          i0.ɵɵadvance(1);
          i0.ɵɵattribute("title", ctx.one);
      }
      …
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect handling of interpolated properties');
    });

    it('should keep local ref for host element', () => {
      const files: MockDirectory = getAppFiles(`
        <b ngNonBindable #myRef id="my-id">
          <i>Hello {{ name }}!</i>
        </b>
        {{ myRef.id }}
      `);

      const template = `
        …
        consts: [["id", "my-id"], ["myRef", ""]],
        template:function MyComponent_Template(rf, $ctx$){
          if (rf & 1) {
            $i0$.ɵɵelementStart(0, "b", 0, 1);
            $i0$.ɵɵdisableBindings();
            $i0$.ɵɵelementStart(2, "i");
            $i0$.ɵɵtext(3, "Hello {{ name }}!");
            $i0$.ɵɵelementEnd();
            $i0$.ɵɵenableBindings();
            $i0$.ɵɵelementEnd();
            $i0$.ɵɵtext(4);
          }
          if (rf & 2) {
            const $_r0$ = $i0$.ɵɵreference(1);
            $r3$.ɵɵadvance(4);
            $i0$.ɵɵtextInterpolate1(" ", $_r0$.id, " ");
          }
        }
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect handling of local refs for host element');
    });

    it('should not have local refs for nested elements', () => {
      const files: MockDirectory = getAppFiles(`
       <div ngNonBindable>
         <input value="one" #myInput> {{ myInput.value }}
       </div>
      `);

      const template = `
        …
        consts: [["value", "one", "#myInput", ""]],
        template:function MyComponent_Template(rf, $ctx$){
          if (rf & 1) {
            $i0$.ɵɵelementStart(0, "div");
            $i0$.ɵɵdisableBindings();
            $i0$.ɵɵelement(1, "input", 0);
            $i0$.ɵɵtext(2, " {{ myInput.value }} ");
            $i0$.ɵɵenableBindings();
            $i0$.ɵɵelementEnd();
        }
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect handling of local refs for nested elements');
    });

    it('should not process property bindings and listeners', () => {
      const files: MockDirectory = getAppFiles(`
        <div ngNonBindable>
          <div [id]="my-id" (click)="onclick"></div>
        </div>
      `);

      const template = `
        …
        consts: [["[id]", "my-id", "(click)", "onclick"]],
        template:function MyComponent_Template(rf, $ctx$){
          if (rf & 1) {
            $i0$.ɵɵelementStart(0, "div");
            $i0$.ɵɵdisableBindings();
            $i0$.ɵɵelement(1, "div", 0);
            $i0$.ɵɵenableBindings();
            $i0$.ɵɵelementEnd();
        }
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect handling of property bindings and listeners');
    });

    it('should not generate extra instructions for elements with no children', () => {
      const files: MockDirectory = getAppFiles(`
        <div ngNonBindable></div>
      `);

      const template = `
        template:function MyComponent_Template(rf, $ctx$){
          if (rf & 1) {
            $i0$.ɵɵelement(0, "div");
          }
        }
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect handling of elements with no children');
    });
  });
});
