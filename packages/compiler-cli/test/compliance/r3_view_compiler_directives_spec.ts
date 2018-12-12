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
                import {Component, Directive, Input, NgModule} from '@angular/core';
    
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
            MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
                type: MyComponent, 
                selectors: [["my-component"]], 
                factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }, 
                consts: 1, 
                vars: 0, 
                template: function MyComponent_Template(rf, ctx) {
                    if (rf & 1) {
                        $r3$.ɵelement(0, "div");
                    }
                },
                encapsulation: 2
            });
        `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
    });

    it('should not match directives on i18n-prefixed attributes', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, Directive, Input, NgModule} from '@angular/core';
    
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
            MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
                type: MyComponent, 
                selectors: [["my-component"]], 
                factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }, 
                consts: 1, 
                vars: 0, 
                template: function MyComponent_Template(rf, ctx) {
                    if (rf & 1) {
                        $r3$.ɵelement(0, "div");
                    }
                },
                encapsulation: 2
            });
        `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
    });

    it('should match directives on element bindings', () => {

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
                const _c0 = [${AttributeMarker.SelectOnly}, "someDirective"];
                …
                MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
                    …
                    template: function MyComponent_Template(rf, ctx) {
                        if (rf & 1) {
                            $r3$.ɵelement(0, "div", _c0);
                        }
                        if (rf & 2) {
                            $r3$.ɵelementProperty(0, "someDirective", $r3$.ɵbind(true));
                        }
                    },
                    …
                    directives: [SomeDirective],
                    encapsulation: 2
                });
            `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
    });

    it('should match directives on ng-templates', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, Input, NgModule, TemplateRef} from '@angular/core';

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
        const $_c0$ = ["directiveA", ""];
        function MyComponent_ng_template_Template_0(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtext(0, "Some content");
          }
        }
        …
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          …
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵtemplate(0, MyComponent_ng_template_Template_0, 1, 0, "ng-template", $_c0$);
            }
          },
          …
          directives: [DirectiveA],
          …
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
    });

    it('should match directives on ng-container', () => {
      const files = {
        app: {
          'spec.ts': `
              import {Component, Directive, Input, NgModule, TemplateRef} from '@angular/core';

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
        const $_c0$ = [1, "ngIf"];
        const $_c1$ = ["directiveA", ""];
        function MyComponent_ng_container_Template_0(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementContainerStart(0, $_c1$);
            $r3$.ɵtext(1, "Some content");
            $r3$.ɵelementContainerEnd();
          }
        }
        …
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          …
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵtemplate(0, MyComponent_ng_container_Template_0, 2, 0, "ng-container", $_c0$);
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(0, "ngIf", $r3$.ɵbind(ctx.showing));
            }
          },
          …
          directives: [DirectiveA],
          …
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
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
                const $c0_a0$ = [${AttributeMarker.SelectOnly}, "someDirective"];
                …
                MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
                    …
                    template: function MyComponent_Template(rf, ctx) {
                        if (rf & 1) {
                            $r3$.ɵtemplate(0, MyComponent_ng_template_Template_0, 0, 0, "ng-template", $c0_a0$);
                        }
                        if (rf & 2) {
                            $r3$.ɵelementProperty(0, "someDirective", $r3$.ɵbind(true));
                        }
                    },
                    …
                    directives: [SomeDirective],
                    encapsulation: 2
                });
            `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
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
                const $c0_a0$ = ["someDirective", ""];
                …
                MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
                    …
                    template: function MyComponent_Template(rf, ctx) {
                        if (rf & 1) {
                            $r3$.ɵtemplate(0, MyComponent_div_Template_0, 1, 0, "div", $c0_a0$);
                        }
                    },
                    …
                    directives: [SomeDirective],
                    encapsulation: 2
                });
            `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');

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
                const $c0_a0$ = [${AttributeMarker.SelectOnly}, "someDirective"];
                …
                MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
                    …
                    template: function MyComponent_Template(rf, ctx) {
                        if (rf & 1) {
                            $r3$.ɵelementStart(0, "div", $c0_a0$);
                            $r3$.ɵlistener("someDirective", function MyComponent_Template_div_someDirective_listener($event) { return ctx.noop(); });
                            $r3$.ɵelementEnd();
                        }
                    },
                    …
                    directives: [SomeDirective],
                    encapsulation: 2
                });
            `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
    });

  });
});
