/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '../aot/test_util';
import {compile, expectEmit} from './mock_compile';

/* These tests are codified version of the tests in compiler_canonical_spec.ts. Every
  * test in compiler_canonical_spec.ts should have a corresponding test here.
  */
describe('compiler compliance', () => {

  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  describe('elements', () => {
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
      const factory = 'factory: function MyComponent_Factory() { return new MyComponent(); }';

      // The template should look like this (where IDENT is a wild card for an identifier):
      const template = `
        const $c1$ = ['class', 'my-app', 'title', 'Hello'];
        …
        template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div', $c1$);
            $r3$.ɵT(1, 'Hello ');
            $r3$.ɵE(2, 'b');
            $r3$.ɵT(3, 'World');
            $r3$.ɵe();
            $r3$.ɵT(4, '!');
            $r3$.ɵe();
          }
        }
      `;


      const result = compile(files, angularFiles);

      expectEmit(result.source, factory, 'Incorrect factory');
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

      const factory = 'factory: function MyComponent_Factory() { return new MyComponent(); }';
      const template = `
        template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div');
            $r3$.ɵe();
          }
          if (rf & 2) {
            $r3$.ɵp(0, 'id', $r3$.ɵb(ctx.id));
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

      const factory = 'factory: function MyComponent_Factory() { return new MyComponent(); }';
      const template = `
        template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div');
            $r3$.ɵPp(1,'pipe');
            $r3$.ɵe();
            $r3$.ɵrS(10);
          }
          if (rf & 2) {
            $r3$.ɵp(0, 'ternary', $r3$.ɵb((ctx.cond ? $r3$.ɵf1(2, _c0, ctx.a): _c1)));
            $r3$.ɵp(0, 'pipe', $r3$.ɵb($r3$.ɵpb3(6, 1, ctx.value, 1, 2)));
            $r3$.ɵp(0, 'and', $r3$.ɵb((ctx.cond && $r3$.ɵf1(4, _c0, ctx.b))));
            $r3$.ɵp(0, 'or', $r3$.ɵb((ctx.cond || $r3$.ɵf1(6, _c0, ctx.c))));
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

      const factory = 'factory: function MyComponent_Factory() { return new MyComponent(); }';
      const template = `
        template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div');
            $r3$.ɵe();
          }
          if (rf & 2) {
            $r3$.ɵkn(0, 'error', $r3$.ɵb(ctx.error));
            $r3$.ɵsn(0, 'background-color', $r3$.ɵb(ctx.color));
          }
        }
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
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: ChildComponent,
          selectors: [['child']],
          factory: function ChildComponent_Factory() { return new ChildComponent(); },
          template: function ChildComponent_Template(rf: IDENT, ctx: IDENT) {
            if (rf & 1) {
              $r3$.ɵT(0, 'child-view');
            }
          }
        });`;

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        static ngDirectiveDef = $r3$.ɵdefineDirective({
          type: SomeDirective,
          selectors: [['', 'some-directive', '']],
          factory: function SomeDirective_Factory() {return new SomeDirective(); }
        });
      `;

      // MyComponent definition should be:
      const MyComponentDefinition = `
        const $c1$ = ['some-directive', ''];
        …
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
            if (rf & 1) {
              $r3$.ɵE(0, 'child', $c1$);
              $r3$.ɵe();
              $r3$.ɵT(1, '!');
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
        static ngDirectiveDef = $r3$.ɵdefineDirective({
          type: SomeDirective,
          selectors: [['div', 'some-directive', '', 8, 'foo', 3, 'title', '', 9, 'baz']],
          factory: function SomeDirective_Factory() {return new SomeDirective(); }
        });
      `;

      // OtherDirective definition should be:
      const OtherDirectiveDefinition = `
        static ngDirectiveDef = $r3$.ɵdefineDirective({
          type: OtherDirective,
          selectors: [['', 5, 'span', 'title', '', 9, 'baz']],
          factory: function OtherDirective_Factory() {return new OtherDirective(); }
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
        static ngDirectiveDef = $r3$.ɵdefineDirective({
          type: HostBindingDir,
          selectors: [['', 'hostBindingDir', '']],
          factory: function HostBindingDir_Factory() { return new HostBindingDir(); },
          hostBindings: function HostBindingDir_HostBindings(
              dirIndex: $number$, elIndex: $number$) {
            $r3$.ɵp(elIndex, 'id', $r3$.ɵb($r3$.ɵd(dirIndex).dirId));
          }
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, HostBindingDirDeclaration, 'Invalid host binding code');
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
        static ngDirectiveDef = $r3$.ɵdefineDirective({
          type: IfDirective,
          selectors: [['', 'if', '']],
          factory: function IfDirective_Factory() { return new IfDirective($r3$.ɵinjectTemplateRef()); }
        });`;
      const MyComponentDefinition = `
        const $c1$ = ['foo', ''];
        const $c2$ = ['if', ''];
        …
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
            if (rf & 1) {
              $r3$.ɵE(0, 'ul', null, $c1$);
              $r3$.ɵC(2, MyComponent_li_Template_2, null, $c2$);
              $r3$.ɵe();
            }
            const $foo$ = $r3$.ɵld(1);
            function MyComponent_li_Template_2(rf: IDENT, ctx0: IDENT) {
              if (rf & 1) {
                $r3$.ɵE(0, 'li');
                $r3$.ɵT(1);
                $r3$.ɵe();
              }
              if (rf & 2) {
                $r3$.ɵt(1, $r3$.ɵi2('', ctx.salutation, ' ', $foo$, ''));
              }
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
          const $e0_ff$ = ($v$: any) => { return ['Nancy', $v$]; };
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: function MyApp_Factory() { return new MyApp(); },
            template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
              if (rf & 1) {
                $r3$.ɵE(0, 'my-comp');
                $r3$.ɵe();
                $r3$.ɵrS(2);
              }
              if (rf & 2) {
                $r3$.ɵp(0, 'names', $r3$.ɵb($r3$.ɵf1(2, $e0_ff$, ctx.customName)));
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
          const $e0_ff$ = ($v0$: $any$, $v1$: $any$, $v2$: $any$, $v3$: $any$, $v4$: $any$, $v5$: $any$, $v6$: $any$, $v7$: $any$, $v8$: $any$) => {
            return ['start-', $v0$, $v1$, $v2$, $v3$, $v4$, '-middle-', $v5$, $v6$, $v7$, $v8$, '-end'];
          }
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: function MyApp_Factory() { return new MyApp(); },
            template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
              if (rf & 1) {
                $r3$.ɵE(0, 'my-comp');
                $r3$.ɵe();
                $r3$.ɵrS(10);
              }
              if (rf & 2) {
                $r3$.ɵp(
                    0, 'names',
                    $r3$.ɵb($r3$.ɵfV(10, $e0_ff$, [ctx.n0, ctx.n1, ctx.n2, ctx.n3, ctx.n4, ctx.n5, ctx.n6, ctx.n7, ctx.n8])));
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
          const $e0_ff$ = ($v$: any) => { return {'duration': 500, animation: $v$}; };
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: function MyApp_Factory() { return new MyApp(); },
            template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
              if (rf & 1) {
                $r3$.ɵE(0, 'object-comp');
                $r3$.ɵe();
                $r3$.ɵrS(2);
              }
              if (rf & 2) {
                $r3$.ɵp(0, 'config', $r3$.ɵb($r3$.ɵf1(2, $e0_ff$, ctx.name)));
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
          const $c0$ = {opacity: 0, duration: 0};
          const $e0_ff$ = ($v$: any) => { return {opacity: 1, duration: $v$}; };
          const $e0_ff_1$ = ($v$: any) => { return [$c0$, $v$]; };
          const $e0_ff_2$ = ($v1$: any, $v2$: any) => { return {animation: $v1$, actions: $v2$}; };
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: function MyApp_Factory() { return new MyApp(); },
            template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
              if (rf & 1) {
                $r3$.ɵE(0, 'nested-comp');
                $r3$.ɵe();
                $r3$.ɵrS(7);
              }
              if (rf & 2) {
                $r3$.ɵp(
                    0, 'config',
                    $r3$.ɵb($r3$.ɵf2(7, $e0_ff_2$, ctx.name, $r3$.ɵf1(4, $e0_ff_1$, $r3$.ɵf1(2, $e0_ff$, ctx.duration)))));
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
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: SimpleComponent,
          selectors: [['simple']],
          factory: function SimpleComponent_Factory() { return new SimpleComponent(); },
          template: function SimpleComponent_Template(rf: IDENT, ctx: IDENT) {
            if (rf & 1) {
              $r3$.ɵpD(0);
              $r3$.ɵE(1, 'div');
              $r3$.ɵP(2, 0);
              $r3$.ɵe();
            }
          }
        });`;

      const ComplexComponentDefinition = `
        const $c1$ = [[['span', 'title', 'tofirst']], [['span', 'title', 'tosecond']]];
        const $c2$ = ['span[title=toFirst]', 'span[title=toSecond]'];
        const $c3$ = ['id','first'];
        const $c4$ = ['id','second'];
        …
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: ComplexComponent,
          selectors: [['complex']],
          factory: function ComplexComponent_Factory() { return new ComplexComponent(); },
          template: function ComplexComponent_Template(rf: IDENT, ctx: IDENT) {
            if (rf & 1) {
              $r3$.ɵpD(0, $c1$, $c2$);
              $r3$.ɵE(1, 'div', $c3$);
              $r3$.ɵP(2, 0, 1);
              $r3$.ɵe();
              $r3$.ɵE(3, 'div', $c4$);
              $r3$.ɵP(4, 0, 2);
              $r3$.ɵe();
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
          const $e0_attrs$ = ['someDir',''];
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: ViewQueryComponent,
            selectors: [['view-query-component']],
            factory: function ViewQueryComponent_Factory() { return new ViewQueryComponent(); },
            template: function ViewQueryComponent_Template(rf: $RenderFlags$, ctx: $ViewQueryComponent$) {
              var $tmp$: $any$;
              if (rf & 1) {
                $r3$.ɵQ(0, SomeDirective, true);
                $r3$.ɵE(1, 'div', $e0_attrs$);
                $r3$.ɵe();
              }
              if (rf & 2) {
                ($r3$.ɵqR(($tmp$ = $r3$.ɵld(0))) && (ctx.someDir = $tmp$.first));
              }
            },
            directives:[SomeDirective]
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
            import {Component, ContentChild, NgModule} from '@angular/core';
            import {SomeDirective} from './some.directive';

            @Component({
              selector: 'content-query-component',
              template: \`
                <div><ng-content></ng-content></div>
              \`
            })
            export class ContentQueryComponent {
              @ContentChild(SomeDirective) someDir: SomeDirective;
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
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: ContentQueryComponent,
            selectors: [['content-query-component']],
            factory: function ContentQueryComponent_Factory() {
              return [new ContentQueryComponent(), $r3$.ɵQ(null, SomeDirective, true)];
            },
            hostBindings: function ContentQueryComponent_HostBindings(
                dirIndex: $number$, elIndex: $number$) {
              var $tmp$: $any$;
              ($r3$.ɵqR(($tmp$ = $r3$.ɵd(dirIndex)[1])) && ($r3$.ɵd(dirIndex)[0].someDir = $tmp$.first));
            },
            template: function ContentQueryComponent_Template(
                rf: $RenderFlags$, ctx: $ContentQueryComponent$) {
              if (rf & 1) {
                $r3$.ɵpD(0);
                $r3$.ɵE(1, 'div');
                $r3$.ɵP(2, 0);
                $r3$.ɵe();
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
            static ngPipeDef = $r3$.ɵdefinePipe(
                {name: 'myPipe', type: MyPipe, factory: function MyPipe_Factory() { return new MyPipe(); }});
        `;

        const MyPurePipeDefinition = `
            static ngPipeDef = $r3$.ɵdefinePipe({
              name: 'myPurePipe',
              type: MyPurePipe,
              factory: function MyPurePipe_Factory() { return new MyPurePipe(); },
              pure: true
            });`;

        const MyAppDefinition = `
            const $c0$ = ($a0$: any) => {
              return [$a0$, 1, 2, 3, 4, 5];
            };
            // ...
            static ngComponentDef = $r3$.ɵdefineComponent({
              type: MyApp,
              selectors: [['my-app']],
              factory: function MyApp_Factory() { return new MyApp(); },
              template: function MyApp_Template(rf: IDENT, ctx: IDENT) {
                if (rf & 1) {
                  $r3$.ɵT(0);
                  $r3$.ɵPp(1, 'myPurePipe');
                  $r3$.ɵPp(2, 'myPipe');
                  $r3$.ɵE(3, 'p');
                  $r3$.ɵT(4);
                  $r3$.ɵPp(5, 'myPipe');
                  $r3$.ɵe();
                  $r3$.ɵrS(15);
                }
                if (rf & 2) {
                  $r3$.ɵt(0, $r3$.ɵi1('', $r3$.ɵpb2(1, 3, $r3$.ɵpb2(2, 6, ctx.name, ctx.size), ctx.size), ''));
                  $r3$.ɵt(4, $r3$.ɵi1('', $r3$.ɵpbV(5, 13 , $r3$.ɵf1(15, $c0$, ctx.name)), ''));
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
        const $c1$ = ['user', ''];
        …
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
            if (rf & 1) {
              $r3$.ɵE(0, 'input', null, $c1$);
              $r3$.ɵe();
              $r3$.ɵT(2);
            }
            const $user$ = $r3$.ɵld(1);
            if (rf & 2) {
              $r3$.ɵt(2, $r3$.ɵi1('Hello ', $user$.value, '!'));
            }
          }
        });
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
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
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: LifecycleComp,
            selectors: [['lifecycle-comp']],
            factory: function LifecycleComp_Factory() { return new LifecycleComp(); },
            inputs: {nameMin: 'name'},
            features: [$r3$.ɵNgOnChangesFeature(LifecycleComp)],
            template: function LifecycleComp_Template(rf: IDENT, ctx: IDENT) {}
          });`;

        const SimpleLayoutDefinition = `
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: SimpleLayout,
            selectors: [['simple-layout']],
            factory: function SimpleLayout_Factory() { return new SimpleLayout(); },
            template: function SimpleLayout_Template(rf: IDENT, ctx: IDENT) {
              if (rf & 1) {
                $r3$.ɵE(0, 'lifecycle-comp');
                $r3$.ɵe();
                $r3$.ɵE(1, 'lifecycle-comp');
                $r3$.ɵe();
              }
              if (rf & 2) {
                $r3$.ɵp(0, 'name', $r3$.ɵb(ctx.name1));
                $r3$.ɵp(1, 'name', $r3$.ɵb(ctx.name2));
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
          static ngDirectiveDef = $r3$.ɵdefineDirective({
            type: ForOfDirective,
            selectors: [['', 'forOf', '']],
            factory: function ForOfDirective_Factory() {
              return new ForOfDirective($r3$.ɵinjectViewContainerRef(), $r3$.ɵinjectTemplateRef());
            },
            features: [$r3$.ɵNgOnChangesFeature(NgForOf)],
            inputs: {forOf: 'forOf'}
          });
        `;

        const MyComponentDefinition = `
          const $_c0$ = ['for','','forOf',''];
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyComponent,
            selectors: [['my-component']],
            factory: function MyComponent_Factory() { return new MyComponent(); },
            template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
              if (rf & 1) {
                $r3$.ɵE(0, 'ul');
                $r3$.ɵC(1, MyComponent_li_Template_1, null, $_c0$);
                $r3$.ɵe();
              }
              if (rf & 2) {
                $r3$.ɵp(1, 'forOf', $r3$.ɵb(ctx.items));
              }

              function MyComponent_li_Template_1(rf: IDENT, ctx0: IDENT) {
                if (rf & 1) {
                  $r3$.ɵE(0, 'li');
                  $r3$.ɵT(1);
                  $r3$.ɵe();
                }
                if (rf & 2) {
                  const $item$ = ctx0.$implicit;
                  $r3$.ɵt(1, $r3$.ɵi1('', $item$.name, ''));
                }
              }
            },
            directives: [ForOfDirective]
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
          const $c1$ = ['for', '', 'forOf', ''];
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyComponent,
            selectors: [['my-component']],
            factory: function MyComponent_Factory() { return new MyComponent(); },
            template: function MyComponent_Template(rf: IDENT, ctx: IDENT) {
              if (rf & 1) {
                $r3$.ɵE(0, 'ul');
                $r3$.ɵC(1, MyComponent_li_Template_1, null, $c1$);
                $r3$.ɵe();
              }
              if (rf & 2) {
                $r3$.ɵp(1, 'forOf', $r3$.ɵb(ctx.items));
              }

              function MyComponent_li_Template_1(rf: IDENT, ctx0: IDENT) {
                if (rf & 1) {
                  $r3$.ɵE(0, 'li');
                  $r3$.ɵE(1, 'div');
                  $r3$.ɵT(2);
                  $r3$.ɵe();
                  $r3$.ɵE(3, 'ul');
                  $r3$.ɵC(4, MyComponent_li_li_Template_4, null, $c1$);
                  $r3$.ɵe();
                  $r3$.ɵe();
                }
                if (rf & 2) {
                  const $item$ = ctx0.$implicit;
                  $r3$.ɵt(2, $r3$.ɵi1('', IDENT.name, ''));
                  $r3$.ɵp(4, 'forOf', $r3$.ɵb(IDENT.infos));
                }

                function MyComponent_li_li_Template_4(rf: IDENT, ctx1: IDENT) {
                  if (rf & 1) {
                    $r3$.ɵE(0, 'li');
                    $r3$.ɵT(1);
                    $r3$.ɵe();
                  }
                  if (rf & 2) {
                    const $item$ = ctx0.$implicit;
                    const $info$ = ctx1.$implicit;
                    $r3$.ɵt(1, $r3$.ɵi2(' ', $item$.name, ': ', $info$.description, ' '));
                  }
                }
              }
            },
            directives: [ForOfDirective]
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;
        expectEmit(source, MyComponentDefinition, 'Invalid component definition');
      });
    });
  });
});
