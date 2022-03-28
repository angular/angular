/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryFlags} from '@angular/core/src/render3/interfaces/query';
import {HEADER_OFFSET} from '@angular/core/src/render3/interfaces/view';

import {ChangeDetectorRef, Component as _Component, ComponentFactoryResolver, ElementRef, QueryList, TemplateRef, ViewContainerRef, ViewRef} from '../../src/core';
import {ViewEncapsulation} from '../../src/metadata';
import {injectComponentFactoryResolver, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵlistener, ɵɵloadQuery, ɵɵqueryRefresh, ɵɵviewQuery} from '../../src/render3/index';
import {ɵɵdirectiveInject, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵtemplate, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {RElement} from '../../src/render3/interfaces/renderer_dom';
import {getLView} from '../../src/render3/state';
import {getNativeByIndex} from '../../src/render3/util/view_utils';

import {ComponentFixture, createComponent, TemplateFixture} from './render_util';


const Component: typeof _Component = function(...args: any[]): any {
  // In test we use @Component for documentation only so it's safe to mock out the implementation.
  return () => undefined;
} as any;


describe('ViewContainerRef', () => {
  let directiveInstance: DirectiveWithVCRef|null;

  beforeEach(() => directiveInstance = null);

  class DirectiveWithVCRef {
    static ɵfac = () => directiveInstance = new DirectiveWithVCRef(
        ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver())

        static ɵdir = ɵɵdefineDirective({
          type: DirectiveWithVCRef,
          selectors: [['', 'vcref', '']],
          inputs: {tplRef: 'tplRef', name: 'name'}
        });

    // TODO(issue/24571): remove '!'.
    tplRef!: TemplateRef<{}>;

    name: string = '';

    // injecting a ViewContainerRef to create a dynamic container in which embedded views will be
    // created
    constructor(public vcref: ViewContainerRef, public cfr: ComponentFactoryResolver) {}
  }

  describe('API', () => {
    describe('createEmbeddedView (incl. insert)', () => {
      it('should add embedded views at the right position in the DOM tree (ng-template next to other ng-template)',
         () => {
           let directiveInstances: TestDirective[] = [];

           class TestDirective {
             static ɵfac =
                 () => {
                   const instance = new TestDirective(
                       ɵɵdirectiveInject(ViewContainerRef as any),
                       ɵɵdirectiveInject(TemplateRef as any));

                   directiveInstances.push(instance);

                   return instance;
                 }

             static ɵdir = ɵɵdefineDirective({
               type: TestDirective,
               selectors: [['', 'testdir', '']],
             });

             constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

             insertTpl(ctx: {}) {
               this._vcRef.createEmbeddedView(this._tplRef, ctx);
             }

             remove(index?: number) {
               this._vcRef.remove(index);
             }
           }

           function EmbeddedTemplateA(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               ɵɵtext(0, 'A');
             }
           }

           function EmbeddedTemplateB(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               ɵɵtext(0, 'B');
             }
           }

           /**
            * before|
            * <ng-template directive>A<ng-template>
            * <ng-template directive>B<ng-template>
            * |after
            */
           class TestComponent {
             // TODO(issue/24571): remove '!'.
             testDir!: TestDirective;
             static ɵfac = () => new TestComponent();
             static ɵcmp = ɵɵdefineComponent({
               type: TestComponent,
               encapsulation: ViewEncapsulation.None,
               selectors: [['test-cmp']],
               decls: 4,
               vars: 0,
               consts: [['testdir', '']],
               template:
                   (rf: RenderFlags, cmp: TestComponent) => {
                     if (rf & RenderFlags.Create) {
                       ɵɵtext(0, 'before|');
                       ɵɵtemplate(1, EmbeddedTemplateA, 1, 0, 'ng-template', 0);
                       ɵɵtemplate(2, EmbeddedTemplateB, 1, 0, 'ng-template', 0);
                       ɵɵtext(3, '|after');
                     }
                   },
               dependencies: [TestDirective]
             });
           }

           const fixture = new ComponentFixture(TestComponent);
           expect(fixture.html).toEqual('before||after');

           directiveInstances![1].insertTpl({});
           expect(fixture.html).toEqual('before|B|after');

           directiveInstances![0].insertTpl({});
           expect(fixture.html).toEqual('before|AB|after');
         });
    });

    describe('createComponent', () => {
      let templateExecutionCounter = 0;

      describe('ComponentRef', () => {
        let dynamicComp!: DynamicComp;

        class AppComp {
          constructor(public vcr: ViewContainerRef, public cfr: ComponentFactoryResolver) {}

          static ɵfac =
              () => {
                return new AppComp(
                    ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver());
              }

          static ɵcmp = ɵɵdefineComponent({
            type: AppComp,
            selectors: [['app-comp']],
            decls: 0,
            vars: 0,
            template: (rf: RenderFlags, cmp: AppComp) => {}
          });
        }

        class DynamicComp {
          doCheckCount = 0;

          ngDoCheck() {
            this.doCheckCount++;
          }

          static ɵfac = () => dynamicComp = new DynamicComp();

          static ɵcmp = ɵɵdefineComponent({
            type: DynamicComp,
            selectors: [['dynamic-comp']],
            decls: 0,
            vars: 0,
            template: (rf: RenderFlags, cmp: DynamicComp) => {}
          });
        }

        it('should return ComponentRef with ChangeDetectorRef attached to root view', () => {
          const fixture = new ComponentFixture(AppComp);

          const dynamicCompFactory = fixture.component.cfr.resolveComponentFactory(DynamicComp);
          const ref = fixture.component.vcr.createComponent(dynamicCompFactory);
          fixture.update();
          expect(dynamicComp.doCheckCount).toEqual(1);

          // The change detector ref should be attached to the root view that contains
          // DynamicComp, so the doCheck hook for DynamicComp should run upon ref.detectChanges().
          ref.changeDetectorRef.detectChanges();
          expect(dynamicComp.doCheckCount).toEqual(2);
          expect((ref.changeDetectorRef as any).context).toBeNull();
        });

        it('should return ComponentRef that can retrieve component ChangeDetectorRef through its injector',
           () => {
             const fixture = new ComponentFixture(AppComp);

             const dynamicCompFactory = fixture.component.cfr.resolveComponentFactory(DynamicComp);
             const ref = fixture.component.vcr.createComponent(dynamicCompFactory);
             fixture.update();
             expect(dynamicComp.doCheckCount).toEqual(1);

             // The injector should retrieve the change detector ref for DynamicComp. As such,
             // the doCheck hook for DynamicComp should NOT run upon ref.detectChanges().
             const changeDetector = ref.injector.get(ChangeDetectorRef);
             changeDetector.detectChanges();
             expect(dynamicComp.doCheckCount).toEqual(1);
             expect((changeDetector as any).context).toEqual(dynamicComp);
           });

        it('should not throw when destroying a reattached component', () => {
          const fixture = new ComponentFixture(AppComp);

          const dynamicCompFactory = fixture.component.cfr.resolveComponentFactory(DynamicComp);
          const ref = fixture.component.vcr.createComponent(dynamicCompFactory);
          fixture.update();

          fixture.component.vcr.detach(fixture.component.vcr.indexOf(ref.hostView));

          expect(() => {
            ref.destroy();
          }).not.toThrow();
        });
      });
    });

    describe('getters', () => {
      it('should work on elements', () => {
        function createTemplate() {
          ɵɵelement(0, 'header', 0);
          ɵɵelement(1, 'footer');
        }

        new TemplateFixture({
          create: createTemplate,
          decls: 2,
          directives: [DirectiveWithVCRef],
          consts: [['vcref', '']]
        });

        expect(directiveInstance!.vcref.element.nativeElement.tagName.toLowerCase())
            .toEqual('header');
        expect(
            directiveInstance!.vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase())
            .toEqual('header');
        expect(() => directiveInstance!.vcref.parentInjector.get(ElementRef)).toThrow();
      });

      it('should work on components', () => {
        const HeaderComponent =
            createComponent('header-cmp', function(rf: RenderFlags, ctx: any) {});

        function createTemplate() {
          ɵɵelement(0, 'header-cmp', 0);
          ɵɵelement(1, 'footer');
        }

        new TemplateFixture({
          create: createTemplate,
          decls: 2,
          directives: [HeaderComponent, DirectiveWithVCRef],
          consts: [['vcref', '']]
        });

        expect(directiveInstance!.vcref.element.nativeElement.tagName.toLowerCase())
            .toEqual('header-cmp');
        expect(
            directiveInstance!.vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase())
            .toEqual('header-cmp');
        expect(() => directiveInstance!.vcref.parentInjector.get(ElementRef)).toThrow();
      });
    });
  });

  describe('view engine compatibility', () => {
    @Component({selector: 'app', template: ''})
    class AppCmpt {
      static ɵfac = () =>
          new AppCmpt(ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver())

              static ɵcmp = ɵɵdefineComponent({
                type: AppCmpt,
                selectors: [['app']],
                decls: 0,
                vars: 0,
                template: (rf: RenderFlags, cmp: AppCmpt) => {}
              });

      constructor(private _vcRef: ViewContainerRef, private _cfResolver: ComponentFactoryResolver) {
      }

      insert(comp: any) {
        this._vcRef.createComponent(this._cfResolver.resolveComponentFactory(comp));
      }

      clear() {
        this._vcRef.clear();
      }

      getVCRefParentInjector() {
        return this._vcRef.parentInjector;
      }
    }

    // https://stackblitz.com/edit/angular-xxpffd?file=src%2Findex.html
    it('should allow injecting VCRef into the root (bootstrapped) component', () => {
      const DynamicComponent =
          createComponent('dynamic-cmpt', function(rf: RenderFlags, parent: any) {
            if (rf & RenderFlags.Create) {
              ɵɵtext(0, 'inserted dynamically');
            }
          }, 1, 0);


      const fixture = new ComponentFixture(AppCmpt);
      expect(fixture.outerHtml).toBe('<div host="mark"></div>');

      fixture.component.insert(DynamicComponent);
      fixture.update();
      expect(fixture.outerHtml)
          .toBe('<div host="mark"></div><dynamic-cmpt>inserted dynamically</dynamic-cmpt>');

      fixture.component.clear();
      fixture.update();
      expect(fixture.outerHtml).toBe('<div host="mark"></div>');
    });

    it('should allow getting the parentInjector of the VCRef which was injected into the root (bootstrapped) component',
       () => {
         const fixture = new ComponentFixture(AppCmpt, {
           injector: {
             get: (token: any) => {
               if (token === 'foo') return 'bar';
             }
           }
         });
         expect(fixture.outerHtml).toBe('<div host="mark"></div>');

         const parentInjector = fixture.component.getVCRefParentInjector();
         expect(parentInjector.get('foo')).toEqual('bar');
       });

    it('should support view queries for dynamically created components', () => {
      let dynamicComp!: DynamicCompWithViewQueries;
      let fooEl!: RElement;

      class DynamicCompWithViewQueries {
        // @ViewChildren('foo')
        foo!: QueryList<any>;

        static ɵfac = () => dynamicComp = new DynamicCompWithViewQueries();
        static ɵcmp = ɵɵdefineComponent({
          type: DynamicCompWithViewQueries,
          selectors: [['dynamic-cmpt-with-view-queries']],
          decls: 2,
          vars: 0,
          consts: [['foo', ''], ['bar', '']],
          template:
              (rf: RenderFlags, ctx: DynamicCompWithViewQueries) => {
                if (rf & RenderFlags.Create) {
                  ɵɵelement(0, 'div', 1, 0);
                }
                // testing only
                fooEl = getNativeByIndex(HEADER_OFFSET, getLView()) as RElement;
              },
          viewQuery:
              function(rf: RenderFlags, ctx: any) {
                if (rf & RenderFlags.Create) {
                  ɵɵviewQuery(['foo'], QueryFlags.descendants);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                      (ctx.foo = tmp as QueryList<any>);
                }
              }
        });
      }

      const fixture = new ComponentFixture(AppCmpt);

      fixture.component.insert(DynamicCompWithViewQueries);
      fixture.update();

      expect(dynamicComp.foo.first.nativeElement).toEqual(fooEl as any);
    });
  });

  describe('view destruction', () => {
    class CompWithListenerThatDestroysItself {
      constructor(private viewRef: ViewRef) {}

      onClick() {}

      ngOnDestroy() {
        this.viewRef.destroy();
      }

      // We want the ViewRef, so we rely on the knowledge that `ViewRef` is actually given
      // when injecting `ChangeDetectorRef`.
      static ɵfac = () =>
          new CompWithListenerThatDestroysItself(ɵɵdirectiveInject(ChangeDetectorRef as any))

              static ɵcmp = ɵɵdefineComponent({
                type: CompWithListenerThatDestroysItself,
                selectors: [['comp-with-listener-and-on-destroy']],
                decls: 2,
                vars: 0,
                /** <button (click)="onClick()"> Click me </button> */
                template:
                    function CompTemplate(rf: RenderFlags, ctx: any) {
                      if (rf & RenderFlags.Create) {
                        ɵɵelementStart(0, 'button');
                        {
                          ɵɵlistener('click', function() {
                            return ctx.onClick();
                          });
                          ɵɵtext(1, 'Click me');
                        }
                        ɵɵelementEnd();
                      }
                    },
              });
    }


    it('should not error when destroying a view with listeners twice', () => {
      const CompWithChildListener = createComponent('test-app', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'comp-with-listener-and-on-destroy');
        }
      }, 1, 0, [CompWithListenerThatDestroysItself]);

      const fixture = new ComponentFixture(CompWithChildListener);
      fixture.update();

      // Destroying the parent view will also destroy all of its children views and call their
      // onDestroy hooks. Here, our child view attempts to destroy itself *again* in its
      // onDestroy. This test exists to verify that no errors are thrown when doing this. We want
      // the test component to destroy its own view in onDestroy because the destroy hooks happen
      // as a *part of* view destruction. We also ensure that the test component has at least one
      // listener so that it runs the event listener cleanup code path.
      fixture.destroy();
    });
  });
});
