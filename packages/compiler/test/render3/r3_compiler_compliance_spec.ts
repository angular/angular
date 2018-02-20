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
        template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
          if (cm) {
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
          tag: 'child',
          factory: function ChildComponent_Factory() { return new ChildComponent(); },
          template: function ChildComponent_Template(ctx: IDENT, cm: IDENT) {
            if (cm) {
              $r3$.ɵT(0, 'child-view');
            }
          }
        });`;

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        static ngDirectiveDef = $r3$.ɵdefineDirective({
          type: SomeDirective,
          factory: function SomeDirective_Factory() {return new SomeDirective(); }
        });
      `;

      // MyComponent definition should be:
      const MyComponentDefinition = `
        const $c1$ = ['some-directive', ''];
        const $c2$ = [SomeDirective];
        …
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          tag: 'my-component',
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
            if (cm) {
              $r3$.ɵE(0, ChildComponent, IDENT, IDENT);
              $r3$.ɵe();
              $r3$.ɵT(3, '!');
            }
            ChildComponent.ngComponentDef.h(1, 0);
            SomeDirective.ngDirectiveDef.h(2, 0);
            $r3$.ɵr(1, 0);
            $r3$.ɵr(2, 0);
          }
        });
      `;


      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, ChildComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ngDirectiveDef');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponentDefinition.ngComponentDef');
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
          factory: function IfDirective_Factory() { return new IfDirective($r3$.ɵinjectTemplateRef()); }
        });`;
      const MyComponentDefinition = `
        const $c1$ = ['foo', ''];
        const $c2$ = [IfDirective];
        …
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          tag: 'my-component',
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
            if (cm) {
              $r3$.ɵE(0, 'ul', null, null, $c1$);
              $r3$.ɵC(2, $c2$, MyComponent_IfDirective_Template_2);
              $r3$.ɵe();
            }
            const $foo$ = $r3$.ɵld(1);
            IfDirective.ngDirectiveDef.h(3,2);
            $r3$.ɵcR(2);
            $r3$.ɵr(3,2);
            $r3$.ɵcr();

            function MyComponent_IfDirective_Template_2(ctx0: IDENT, cm: IDENT) {
              if (cm) {
                $r3$.ɵE(0, 'li');
                $r3$.ɵT(1);
                $r3$.ɵe();
              }
              $r3$.ɵt(1, $r3$.ɵi2('', ctx.salutation, ' ', $foo$, ''));
            }
          }
        });`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, IfDirectiveDefinition, 'Incorrect IfDirective.ngDirectiveDef');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
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
          tag: 'simple',
          factory: function SimpleComponent_Factory() { return new SimpleComponent(); },
          template: function SimpleComponent_Template(ctx: IDENT, cm: IDENT) {
            if (cm) {
              $r3$.ɵpD(0);
              $r3$.ɵE(1, 'div');
              $r3$.ɵP(2, 0);
              $r3$.ɵe();
            }
          }
        });`;

      const ComplexComponentDefinition = `
        const $c1$ = [[[['span', 'title', 'tofirst'], null]], [[['span', 'title', 'tosecond'], null]]];
        const $c2$ = ['id','first'];
        const $c3$ = ['id','second'];
        …
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: ComplexComponent,
          tag: 'complex',
          factory: function ComplexComponent_Factory() { return new ComplexComponent(); },
          template: function ComplexComponent_Template(ctx: IDENT, cm: IDENT) {
            if (cm) {
              $r3$.ɵpD(0, $c1$);
              $r3$.ɵE(1, 'div', $c2$);
              $r3$.ɵP(2, 0, 1);
              $r3$.ɵe();
              $r3$.ɵE(3, 'div', $c3$);
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

              @Component({selector: 'my-app', template: '{{name | myPipe:size | myPurePipe:size }}'})
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
                {type: MyPipe, factory: function MyPipe_Factory() { return new MyPipe(); }});
        `;

        const MyPurePipeDefinition = `
            static ngPipeDef = $r3$.ɵdefinePipe({
              type: MyPurePipe,
              factory: function MyPurePipe_Factory() { return new MyPurePipe(); },
              pure: true
            });`;

        const MyAppDefinition = `
            const $MyPurePipe_ngPipeDef$ = MyPurePipe.ngPipeDef;
            const $MyPipe_ngPipeDef$ = MyPipe.ngPipeDef;
            …
            static ngComponentDef = $r3$.ɵdefineComponent({
              type: MyApp,
              tag: 'my-app',
              factory: function MyApp_Factory() { return new MyApp(); },
              template: function MyApp_Template(ctx: IDENT, cm: IDENT) {
                if (cm) {
                  $r3$.ɵT(0);
                  $r3$.ɵPp(1, $MyPurePipe_ngPipeDef$, $MyPurePipe_ngPipeDef$.n());
                  $r3$.ɵPp(2, $MyPipe_ngPipeDef$, $MyPipe_ngPipeDef$.n());
                }
                $r3$.ɵt(0, $r3$.ɵi1('', $r3$.ɵpb2(1, $r3$.ɵpb2(2,ctx.name, ctx.size), ctx.size), ''));
              }
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
          tag: 'my-component',
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
            if (cm) {
              $r3$.ɵE(0, 'input', null, null, $c1$);
              $r3$.ɵe();
              $r3$.ɵT(2);
            }
            const $user$ = $r3$.ɵld(1);
            $r3$.ɵt(2, $r3$.ɵi1('Hello ', $user$.value, '!'));
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
            tag: 'lifecycle-comp',
            factory: function LifecycleComp_Factory() { return new LifecycleComp(); },
            template: function LifecycleComp_Template(ctx: IDENT, cm: IDENT) {},
            inputs: {nameMin: 'name'},
            features: [$r3$.ɵNgOnChangesFeature(LifecycleComp)]
          });`;

        const SimpleLayoutDefinition = `
          const $c1$ = LifecycleComp.ngComponentDef;
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: SimpleLayout,
            tag: 'simple-layout',
            factory: function SimpleLayout_Factory() { return new SimpleLayout(); },
            template: function SimpleLayout_Template(ctx: IDENT, cm: IDENT) {
              if (cm) {
                $r3$.ɵE(0, LifecycleComp);
                $r3$.ɵe();
                $r3$.ɵE(2, LifecycleComp);
                $r3$.ɵe();
              }
              $r3$.ɵp(0, 'name', $r3$.ɵb(ctx.name1));
              $r3$.ɵp(2, 'name', $r3$.ɵb(ctx.name2));
              $c1$.h(1, 0);
              $c1$.h(3, 2);
              $r3$.ɵr(1, 0);
              $r3$.ɵr(3, 2);
            }
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
            factory: function ForOfDirective_Factory() {
              return new ForOfDirective($r3$.ɵinjectViewContainerRef(), $r3$.ɵinjectTemplateRef());
            },
            features: [$r3$.ɵNgOnChangesFeature(NgForOf)],
            inputs: {forOf: 'forOf'}
          });
        `;

        const MyComponentDefinition = `
          const $c1$ = [ForOfDirective];
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyComponent,
            tag: 'my-component',
            factory: function MyComponent_Factory() { return new MyComponent(); },
            template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
              if (cm) {
                $r3$.ɵE(0, 'ul');
                $r3$.ɵC(1, $c1$, MyComponent_ForOfDirective_Template_1);
                $r3$.ɵe();
              }
              $r3$.ɵp(1, 'forOf', $r3$.ɵb(ctx.items));
              ForOfDirective.ngDirectiveDef.h(2, 1);
              $r3$.ɵcR(1);
              $r3$.ɵr(2, 1);
              $r3$.ɵcr();

              function MyComponent_ForOfDirective_Template_1(ctx0: IDENT, cm: IDENT) {
                if (cm) {
                  $r3$.ɵE(0, 'li');
                  $r3$.ɵT(1);
                  $r3$.ɵe();
                }
                const $item$ = ctx0.$implicit;
                $r3$.ɵt(1, $r3$.ɵi1('', $item$.name, ''));
              }
            }
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
          const $c1$ = [ForOfDirective];
          const $c2$ = ForOfDirective.ngDirectiveDef;
          …
          static ngComponentDef = $r3$.ɵdefineComponent({
            type: MyComponent,
            tag: 'my-component',
            factory: function MyComponent_Factory() { return new MyComponent(); },
            template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
              if (cm) {
                $r3$.ɵE(0, 'ul');
                $r3$.ɵC(1, $c1$, MyComponent_ForOfDirective_Template_1);
                $r3$.ɵe();
              }
              $r3$.ɵp(1, 'forOf', $r3$.ɵb(ctx.items));
              $c2$.h(2,1);
              $r3$.ɵcR(1);
              $r3$.ɵr(2, 1);
              $r3$.ɵcr();

              function MyComponent_ForOfDirective_Template_1(ctx0: IDENT, cm: IDENT) {
                if (cm) {
                  $r3$.ɵE(0, 'li');
                  $r3$.ɵE(1, 'div');
                  $r3$.ɵT(2);
                  $r3$.ɵe();
                  $r3$.ɵE(3, 'ul');
                  $r3$.ɵC(4, $c1$, MyComponent_ForOfDirective_ForOfDirective_Template_4);
                  $r3$.ɵe();
                  $r3$.ɵe();
                }
                const $item$ = ctx0.$implicit;
                $r3$.ɵp(4, 'forOf', $r3$.ɵb(IDENT.infos));
                $c2$.h(5,4);
                $r3$.ɵt(2, $r3$.ɵi1('', IDENT.name, ''));
                $r3$.ɵcR(4);
                $r3$.ɵr(5, 4);
                $r3$.ɵcr();

                function MyComponent_ForOfDirective_ForOfDirective_Template_4(
                    ctx1: IDENT, cm: IDENT) {
                  if (cm) {
                    $r3$.ɵE(0, 'li');
                    $r3$.ɵT(1);
                    $r3$.ɵe();
                  }
                  const $info$ = ctx1.$implicit;
                  $r3$.ɵt(1, $r3$.ɵi2(' ', $item$.name, ': ', $info$.description, ' '));
                }
              }
            }
          });`;

        const result = compile(files, angularFiles);
        const source = result.source;
        expectEmit(source, MyComponentDefinition, 'Invalid component definition');
      });
    });
  });
});