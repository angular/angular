/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, InjectionToken, Input, OnDestroy, Pipe, PipeTransform, TemplateRef, ViewContainerRef, createInjector, defineInjectable, defineInjector, ɵNgModuleDef as NgModuleDef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {PublicFeature} from '../../../src/render3';
import {ComponentDef} from '../../../src/render3/interfaces/definition';
import {ComponentFixture, containerEl, renderComponent, toHtml} from '../render_util';



/// See: `normative.md`
describe('pipes', () => {
  type $any$ = any;
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  let myPipeTransformCalls = 0;
  let myPurePipeTransformCalls = 0;

  @Pipe({
    name: 'myPipe',
    pure: false,
  })
  class MyPipe implements PipeTransform,
      OnDestroy {
    private numberOfBang = 1;

    transform(value: string, size: number): string {
      let result = value.substring(size);
      for (let i = 0; i < this.numberOfBang; i++) result += '!';
      this.numberOfBang++;
      myPipeTransformCalls++;
      return result;
    }

    ngOnDestroy() { this.numberOfBang = 1; }

    // NORMATIVE
    static ngPipeDef = $r3$.ɵdefinePipe({
      name: 'myPipe',
      type: MyPipe,
      factory: function MyPipe_Factory() { return new MyPipe(); },
      pure: false,
    });
    // /NORMATIVE
  }

  @Pipe({
    name: 'myPurePipe',
    pure: true,
  })
  class MyPurePipe implements PipeTransform {
    transform(value: string, size: number): string {
      myPurePipeTransformCalls++;
      return value.substring(size);
    }

    // NORMATIVE
    static ngPipeDef = $r3$.ɵdefinePipe({
      name: 'myPurePipe',
      type: MyPurePipe,
      factory: function MyPurePipe_Factory() { return new MyPurePipe(); },
      pure: true,
    });
    // /NORMATIVE
  }

  it('should render pipes', () => {
    type $MyApp$ = MyApp;
    myPipeTransformCalls = 0;
    myPurePipeTransformCalls = 0;

    @Component({template: `{{name | myPipe:size | myPurePipe:size }}`})
    class MyApp {
      name = '12World';
      size = 1;

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 3,
        vars: 7,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵtext(0);
            $r3$.ɵpipe(1, 'myPipe');
            $r3$.ɵpipe(2, 'myPurePipe');
          }
          if (rf & 2) {
            $r3$.ɵtextBinding(
                0,
                $r3$.ɵinterpolation1(
                    '', $r3$.ɵpipeBind2(1, 4, $r3$.ɵpipeBind2(2, 1, ctx.name, ctx.size), ctx.size),
                    ''));
          }
        }
      });
      // /NORMATIVE
    }

    // NON-NORMATIVE
    (MyApp.ngComponentDef as ComponentDef<any>).pipeDefs =
        () => [MyPurePipe.ngPipeDef, MyPipe.ngPipeDef];
    // /NON-NORMATIVE

    let myApp: MyApp = renderComponent(MyApp);
    expect(toHtml(containerEl)).toEqual('World!');
    expect(myPurePipeTransformCalls).toEqual(1);
    expect(myPipeTransformCalls).toEqual(1);

    $r3$.ɵdetectChanges(myApp);
    expect(toHtml(containerEl)).toEqual('World!!');
    expect(myPurePipeTransformCalls).toEqual(1);
    expect(myPipeTransformCalls).toEqual(2);

    myApp.name = '34WORLD';
    $r3$.ɵdetectChanges(myApp);
    expect(toHtml(containerEl)).toEqual('WORLD!!!');
    expect(myPurePipeTransformCalls).toEqual(2);
    expect(myPipeTransformCalls).toEqual(3);
  });

  it('should render many pipes and forward the first instance (pure or impure pipe)', () => {
    type $MyApp$ = MyApp;
    myPipeTransformCalls = 0;
    myPurePipeTransformCalls = 0;

    @Directive({
      selector: '[oneTimeIf]',
    })
    class OneTimeIf {
      @Input() oneTimeIf: any;
      constructor(private view: ViewContainerRef, private template: TemplateRef<any>) {}
      ngDoCheck(): void {
        if (this.oneTimeIf) {
          this.view.createEmbeddedView(this.template);
        }
      }
      // NORMATIVE
      static ngDirectiveDef = $r3$.ɵdefineDirective({
        type: OneTimeIf,
        selectors: [['', 'oneTimeIf', '']],
        factory: () => new OneTimeIf(
                     $r3$.ɵdirectiveInject(ViewContainerRef as any),
                     $r3$.ɵdirectiveInject(TemplateRef as any)),
        inputs: {oneTimeIf: 'oneTimeIf'}
      });
      // /NORMATIVE
    }

    function MyApp_div_Template_4(rf: $RenderFlags$, ctx: any) {
      if (rf & 1) {
        $r3$.ɵelementStart(0, 'div');
        $r3$.ɵtext(1);
        $r3$.ɵpipe(2, 'myPurePipe');
        $r3$.ɵelementEnd();
      }
      if (rf & 2) {
        const $comp$ = $r3$.ɵnextContext();
        $r3$.ɵtextBinding(
            1, $r3$.ɵinterpolation1('', $r3$.ɵpipeBind2(2, 1, $comp$.name, $comp$.size), ''));
      }
    }

    @Component({
      template: `{{name | myPurePipe:size}}{{name | myPurePipe:size}}
       <div *oneTimeIf="more">{{name | myPurePipe:size}}</div>`
    })
    class MyApp {
      name = '1World';
      size = 1;
      more = true;

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 5,
        vars: 9,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵtext(0);
            $r3$.ɵpipe(1, 'myPurePipe');
            $r3$.ɵtext(2);
            $r3$.ɵpipe(3, 'myPurePipe');
            $r3$.ɵtemplate(4, MyApp_div_Template_4, 3, 4, '', ['oneTimeIf', '']);
          }
          if (rf & 2) {
            $r3$.ɵtextBinding(
                0, $r3$.ɵinterpolation1('', $r3$.ɵpipeBind2(1, 3, ctx.name, ctx.size), ''));
            $r3$.ɵtextBinding(
                2, $r3$.ɵinterpolation1('', $r3$.ɵpipeBind2(3, 6, ctx.name, ctx.size), ''));
            $r3$.ɵelementProperty(4, 'oneTimeIf', $r3$.ɵbind(ctx.more));
          }
        }
      });
      // /NORMATIVE
    }

    // NON-NORMATIVE
    (MyApp.ngComponentDef as ComponentDef<any>).directiveDefs = [OneTimeIf.ngDirectiveDef];
    (MyApp.ngComponentDef as ComponentDef<any>).pipeDefs = [MyPurePipe.ngPipeDef];
    // /NON-NORMATIVE

    let myApp: MyApp = renderComponent(MyApp);
    expect(toHtml(containerEl)).toEqual('WorldWorld<div>World</div>');
    expect(myPurePipeTransformCalls).toEqual(3);
    expect(myPipeTransformCalls).toEqual(0);
  });

  describe('injection mechanism', () => {
    class ServiceA {
      title = 'ServiceA Title';
    }

    class ServiceB {
      title = 'ServiceB Title';

      static ngInjectableDef =
          defineInjectable({providedIn: 'root', factory: () => new ServiceB()});
    }

    class ModuleA {
      static ngInjectorDef = defineInjector({factory: () => new ModuleA(), providers: [ServiceA]});
      static ngModuleDef: NgModuleDef<any> = { bootstrap: [] } as any;
    }

    const generatePipe = (InjectionType: any) => {
      return class MyConcatPipe implements PipeTransform {
        constructor(public obj: any) {}

        transform(value: string): string { return `${value} - ${this.obj.title}`; }

        static ngPipeDef = $r3$.ɵdefinePipe({
          name: 'myConcatPipe',
          type: MyConcatPipe,
          factory: () => new MyConcatPipe($r3$.ɵdirectiveInject(InjectionType)),
          pure: false
        });
      };
    };

    const generateComponent = (overrides: any) => {
      return class MyComponent {
        title = 'MyComponent Title';

        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-app']],
          features: [PublicFeature],
          factory: function MyApp_Factory() { return new MyComponent(); },
          consts: 2,
          vars: 1,
          // '{{ title | myPipe }}'
          template: (rf: $RenderFlags$, ctx: MyComponent) => {
            if (rf & 1) {
              $r3$.ɵtext(0);
              $r3$.ɵpipe(1, 'myConcatPipe');
            }
            if (rf & 2) {
              $r3$.ɵtextBinding(0, $r3$.ɵinterpolation1('', $r3$.ɵpipeBind1(1, 3, ctx.title), ''));
            }
          },
          ...overrides
        });
      };
    };

    it('should be able to handle Service injection', () => {
      const Comp = generateComponent({providers: [ServiceB], pipes: [generatePipe(ServiceB)]});
      const fixture = new ComponentFixture(Comp);
      expect(fixture.html).toEqual('MyComponent Title - ServiceB Title');
    });

    it('should be able to handle Token injections', () => {
      const provider = new InjectionToken<ServiceA>(
          'token', {providedIn: 'root', factory: () => new ServiceB()});
      const Comp = generateComponent({providers: [provider], pipes: [generatePipe(provider)]});
      const fixture = new ComponentFixture(Comp);
      expect(fixture.html).toEqual('MyComponent Title - ServiceB Title');
    });

    it('should be able to handle Module injection', () => {
      const injector = createInjector(ModuleA);
      const Comp = generateComponent({providers: [], pipes: [generatePipe(ServiceA)]});
      const fixture = new ComponentFixture(Comp, {injector});
      expect(fixture.html).toEqual('MyComponent Title - ServiceA Title');
    });

  });

});
