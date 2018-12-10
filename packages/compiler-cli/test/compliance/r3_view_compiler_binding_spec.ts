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
        HostBindingDir.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: HostBindingDir,
          selectors: [["", "hostBindingDir", ""]],
          factory: function HostBindingDir_Factory(t) { return new (t || HostBindingDir)(); },
          hostBindings: function HostBindingDir_HostBindings(rf, ctx, elIndex) {
            if (rf & 1) {
              $r3$.ɵallocHostVars(1);
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(elIndex, "id", $r3$.ɵbind(ctx.dirId), null, true);
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
        HostBindingComp.ngComponentDef = $r3$.ɵdefineComponent({
          type: HostBindingComp,
          selectors: [["host-binding-comp"]],
          factory: function HostBindingComp_Factory(t) { return new (t || HostBindingComp)(); },
          hostBindings: function HostBindingComp_HostBindings(rf, ctx, elIndex) {
            if (rf & 1) {
              $r3$.ɵallocHostVars(3);
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(elIndex, "id", $r3$.ɵbind($r3$.ɵpureFunction1(1, $ff$, ctx.id)), null, true);
            }
          },
          consts: 0,
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
        HostAttributeDir.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: HostAttributeDir,
          selectors: [["", "hostAttributeDir", ""]],
          factory: function HostAttributeDir_Factory(t) { return new (t || HostAttributeDir)(); },
          hostBindings: function HostAttributeDir_HostBindings(rf, ctx, elIndex) {
            if (rf & 1) {
              $r3$.ɵallocHostVars(1);
            }
            if (rf & 2) {
              $r3$.ɵelementAttribute(elIndex, "required", $r3$.ɵbind(ctx.required));
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
        HostAttributeDir.ngDirectiveDef = $r3$.ɵdefineDirective({
          type: HostAttributeDir,
          selectors: [["", "hostAttributeDir", ""]],
          factory: function HostAttributeDir_Factory(t) { return new (t || HostAttributeDir)(); },
          attributes: ["aria-label", "label"]
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostAttributeDirDeclaration, 'Invalid host attribute code');
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

    it('should keep local ref for host element', () => {
      const files: MockDirectory = getAppFiles(`
        <b ngNonBindable #myRef id="my-id">
          <i>Hello {{ name }}!</i>
        </b>
        {{ myRef.id }}
      `);

      const template = `
        const $_c0$ = ["id", "my-id"];
        const $_c1$ = ["myRef", ""];
        …
        template:function MyComponent_Template(rf, $ctx$){
          if (rf & 1) {
            $i0$.ɵelementStart(0, "b", $_c0$, $_c1$);
            $i0$.ɵdisableBindings();
            $i0$.ɵelementStart(2, "i");
            $i0$.ɵtext(3, "Hello {{ name }}!");
            $i0$.ɵelementEnd();
            $i0$.ɵenableBindings();
            $i0$.ɵelementEnd();
            $i0$.ɵtext(4);
          }
          if (rf & 2) {
            const $_r0$ = $i0$.ɵreference(1);
            $i0$.ɵtextBinding(4, $i0$.ɵinterpolation1(" ", $_r0$.id, " "));
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
        const $_c0$ = ["value", "one", "#myInput", ""];
        …
        template:function MyComponent_Template(rf, $ctx$){
          if (rf & 1) {
            $i0$.ɵelementStart(0, "div");
            $i0$.ɵdisableBindings();
            $i0$.ɵelement(1, "input", $_c0$);
            $i0$.ɵtext(2, " {{ myInput.value }} ");
            $i0$.ɵenableBindings();
            $i0$.ɵelementEnd();
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
        const $_c0$ = ["[id]", "my-id", "(click)", "onclick"];
        …
        template:function MyComponent_Template(rf, $ctx$){
          if (rf & 1) {
            $i0$.ɵelementStart(0, "div");
            $i0$.ɵdisableBindings();
            $i0$.ɵelement(1, "div", $_c0$);
            $i0$.ɵenableBindings();
            $i0$.ɵelementEnd();
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
            $i0$.ɵelement(0, "div");
          }
        }
      `;
      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect handling of elements with no children');
    });

  });

});
