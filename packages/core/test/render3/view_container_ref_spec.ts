/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Component as _Component, ComponentFactoryResolver, ComponentRef, ElementRef, QueryList, TemplateRef, ViewContainerRef, ViewRef,} from '../../src/core';
import {ViewEncapsulation} from '../../src/metadata';
import {injectComponentFactoryResolver, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵlistener, ɵɵloadViewQuery, ɵɵqueryRefresh, ɵɵviewQuery,} from '../../src/render3/index';

import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵdirectiveInject, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵtemplate, ɵɵtext,} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {RElement} from '../../src/render3/interfaces/renderer';
import {getLView} from '../../src/render3/state';
import {getNativeByIndex} from '../../src/render3/util/view_utils';
import {ComponentFixture, createComponent, TemplateFixture,} from './render_util';

const Component: typeof _Component = function(...args: any[]): any {
  // In test we use @Component for documentation only so it's safe to mock out the implementation.
  return () => undefined;
} as any;


describe('ViewContainerRef', () => {
  let directiveInstance: DirectiveWithVCRef|null;

  beforeEach(() => directiveInstance = null);

  class DirectiveWithVCRef {
    static ngDirectiveDef = ɵɵdefineDirective({
      type: DirectiveWithVCRef,
      selectors: [['', 'vcref', '']],
      factory: () => directiveInstance = new DirectiveWithVCRef(

                   ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
      inputs: {tplRef: 'tplRef', name: 'name'}
    });

    // TODO(issue/24571): remove '!'.
    tplRef !: TemplateRef<{}>;

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
             static ngDirectiveDef = ɵɵdefineDirective({
               type: TestDirective,
               selectors: [['', 'testdir', '']],
               factory: () => {
                 const instance = new TestDirective(
                     ɵɵdirectiveInject(ViewContainerRef as any),
                     ɵɵdirectiveInject(TemplateRef as any));

                 directiveInstances.push(instance);

                 return instance;
               }
             });

             constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

             insertTpl(ctx: {}) { this._vcRef.createEmbeddedView(this._tplRef, ctx); }

             remove(index?: number) { this._vcRef.remove(index); }
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
             testDir !: TestDirective;
             static ngComponentDef = ɵɵdefineComponent({
               type: TestComponent,
               encapsulation: ViewEncapsulation.None,
               selectors: [['test-cmp']],
               factory: () => new TestComponent(),
               consts: 4,
               vars: 0,
               template: (rf: RenderFlags, cmp: TestComponent) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵtext(0, 'before|');
                   ɵɵtemplate(1, EmbeddedTemplateA, 1, 0, 'ng-template', ['testdir', '']);
                   ɵɵtemplate(2, EmbeddedTemplateB, 1, 0, 'ng-template', ['testdir', '']);
                   ɵɵtext(3, '|after');
                 }
               },
               directives: [TestDirective]
             });
           }

           const fixture = new ComponentFixture(TestComponent);
           expect(fixture.html).toEqual('before||after');

           directiveInstances ![1].insertTpl({});
           expect(fixture.html).toEqual('before|B|after');

           directiveInstances ![0].insertTpl({});
           expect(fixture.html).toEqual('before|AB|after');
         });


      it('should add embedded views at the right position in the DOM tree (ng-template next to a JS block)',
         () => {
           let directiveInstance: TestDirective;

           class TestDirective {
             static ngDirectiveDef = ɵɵdefineDirective({
               type: TestDirective,
               selectors: [['', 'testdir', '']],
               factory: () => directiveInstance = new TestDirective(
                            ɵɵdirectiveInject(ViewContainerRef as any),
                            ɵɵdirectiveInject(TemplateRef as any))
             });

             constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

             insertTpl(ctx: {}) { this._vcRef.createEmbeddedView(this._tplRef, ctx); }

             insertTpl2(ctx: {}) {
               const viewRef = this._tplRef.createEmbeddedView(ctx);
               this._vcRef.insert(viewRef);
             }

             remove(index?: number) { this._vcRef.remove(index); }
           }

           function EmbeddedTemplateA(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               ɵɵtext(0, 'A');
             }
           }

           /**
            * before|
            * <ng-template testDir>A<ng-template>
            * % if (condition) {
            *  B
            * % }
            * |after
            */
           class TestComponent {
             condition = false;
             // TODO(issue/24571): remove '!'.
             testDir !: TestDirective;
             static ngComponentDef = ɵɵdefineComponent({
               type: TestComponent,
               encapsulation: ViewEncapsulation.None,
               selectors: [['test-cmp']],
               consts: 4,
               vars: 0,
               factory: () => new TestComponent(),
               template: (rf: RenderFlags, cmp: TestComponent) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵtext(0, 'before|');
                   ɵɵtemplate(1, EmbeddedTemplateA, 1, 0, 'ng-template', ['testdir', '']);
                   ɵɵcontainer(2);
                   ɵɵtext(3, '|after');
                 }
                 if (rf & RenderFlags.Update) {
                   ɵɵcontainerRefreshStart(2);
                   {
                     if (cmp.condition) {
                       let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                       {
                         if (rf1 & RenderFlags.Create) {
                           ɵɵtext(0, 'B');
                         }
                       }
                       ɵɵembeddedViewEnd();
                     }
                   }
                   ɵɵcontainerRefreshEnd();
                 }
               },
               directives: [TestDirective]
             });
           }

           const fixture = new ComponentFixture(TestComponent);
           expect(fixture.html).toEqual('before||after');

           fixture.component.condition = true;
           fixture.update();
           expect(fixture.html).toEqual('before|B|after');

           directiveInstance !.insertTpl({});
           expect(fixture.html).toEqual('before|AB|after');

           fixture.component.condition = false;
           fixture.update();
           expect(fixture.html).toEqual('before|A|after');

           directiveInstance !.insertTpl2({});
           expect(fixture.html).toEqual('before|AA|after');

           fixture.component.condition = true;
           fixture.update();
           expect(fixture.html).toEqual('before|AAB|after');
         });

    });

    describe('createComponent', () => {
      let templateExecutionCounter = 0;

      describe('ComponentRef', () => {
        let dynamicComp !: DynamicComp;

        class AppComp {
          constructor(public vcr: ViewContainerRef, public cfr: ComponentFactoryResolver) {}

          static ngComponentDef = ɵɵdefineComponent({
            type: AppComp,
            selectors: [['app-comp']],
            factory:
                () => new AppComp(
                    ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
            consts: 0,
            vars: 0,
            template: (rf: RenderFlags, cmp: AppComp) => {}
          });
        }

        class DynamicComp {
          doCheckCount = 0;

          ngDoCheck() { this.doCheckCount++; }

          static ngComponentDef = ɵɵdefineComponent({
            type: DynamicComp,
            selectors: [['dynamic-comp']],
            factory: () => dynamicComp = new DynamicComp(),
            consts: 0,
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
             expect(changeDetector.context).toEqual(dynamicComp);
           });

        it('should not throw when destroying a reattached component', () => {
          const fixture = new ComponentFixture(AppComp);

          const dynamicCompFactory = fixture.component.cfr.resolveComponentFactory(DynamicComp);
          const ref = fixture.component.vcr.createComponent(dynamicCompFactory);
          fixture.update();

          fixture.component.vcr.detach(fixture.component.vcr.indexOf(ref.hostView));

          expect(() => { ref.destroy(); }).not.toThrow();

        });
      });
    });

    describe('getters', () => {
      it('should work on elements', () => {
        function createTemplate() {
          ɵɵelement(0, 'header', ['vcref', '']);
          ɵɵelement(1, 'footer');
        }

        new TemplateFixture(createTemplate, undefined, 2, 0, [DirectiveWithVCRef]);

        expect(directiveInstance !.vcref.element.nativeElement.tagName.toLowerCase())
            .toEqual('header');
        expect(
            directiveInstance !.vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase())
            .toEqual('header');
        expect(() => directiveInstance !.vcref.parentInjector.get(ElementRef)).toThrow();
      });

      it('should work on components', () => {
        const HeaderComponent =
            createComponent('header-cmp', function(rf: RenderFlags, ctx: any) {});

        function createTemplate() {
          ɵɵelement(0, 'header-cmp', ['vcref', '']);
          ɵɵelement(1, 'footer');
        }

        new TemplateFixture(createTemplate, undefined, 2, 0, [HeaderComponent, DirectiveWithVCRef]);

        expect(directiveInstance !.vcref.element.nativeElement.tagName.toLowerCase())
            .toEqual('header-cmp');
        expect(
            directiveInstance !.vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase())
            .toEqual('header-cmp');
        expect(() => directiveInstance !.vcref.parentInjector.get(ElementRef)).toThrow();
      });
    });
  });

  describe('view engine compatibility', () => {

    @Component({selector: 'app', template: ''})
    class AppCmpt {
      static ngComponentDef = ɵɵdefineComponent({
        type: AppCmpt,
        selectors: [['app']],
        factory: () => new AppCmpt(
                     ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
        consts: 0,
        vars: 0,
        template: (rf: RenderFlags, cmp: AppCmpt) => {}
      });

      constructor(private _vcRef: ViewContainerRef, private _cfResolver: ComponentFactoryResolver) {
      }

      insert(comp: any) {
        this._vcRef.createComponent(this._cfResolver.resolveComponentFactory(comp));
      }

      clear() { this._vcRef.clear(); }

      getVCRefParentInjector() { return this._vcRef.parentInjector; }
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
      let dynamicComp !: DynamicCompWithViewQueries;
      let fooEl !: RElement;

      class DynamicCompWithViewQueries {
        // @ViewChildren('foo')
        foo !: QueryList<any>;

        static ngComponentDef = ɵɵdefineComponent({
          type: DynamicCompWithViewQueries,
          selectors: [['dynamic-cmpt-with-view-queries']],
          factory: () => dynamicComp = new DynamicCompWithViewQueries(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, ctx: DynamicCompWithViewQueries) => {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['bar', ''], ['foo', '']);
            }
            // testing only
            fooEl = getNativeByIndex(0, getLView()) as RElement;
          },
          viewQuery: function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['foo'], true);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
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

      ngOnDestroy() { this.viewRef.destroy(); }

      static ngComponentDef = ɵɵdefineComponent({
        type: CompWithListenerThatDestroysItself,
        selectors: [['comp-with-listener-and-on-destroy']],
        consts: 2,
        vars: 0,
        /** <button (click)="onClick()"> Click me </button> */
        template: function CompTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'button');
            {
              ɵɵlistener('click', function() { return ctx.onClick(); });
              ɵɵtext(1, 'Click me');
            }
            ɵɵelementEnd();
          }
        },
        // We want the ViewRef, so we rely on the knowledge that `ViewRef` is actually given
        // when injecting `ChangeDetectorRef`.
        factory: () => new CompWithListenerThatDestroysItself(
                     ɵɵdirectiveInject(ChangeDetectorRef as any)),
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
      // onDestroy hooks. Here, our child view attempts to destroy itself *again* in its onDestroy.
      // This test exists to verify that no errors are thrown when doing this. We want the test
      // component to destroy its own view in onDestroy because the destroy hooks happen as a
      // *part of* view destruction. We also ensure that the test component has at least one
      // listener so that it runs the event listener cleanup code path.
      fixture.destroy();
    });
  });
});
