/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList, TemplateRef, ViewContainerRef} from '@angular/core';
import {QueryFlags} from '@angular/core/src/render3/interfaces/query';
import {HEADER_OFFSET} from '@angular/core/src/render3/interfaces/view';

import {AttributeMarker, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵProvidersFeature} from '../../src/render3/index';
import {ɵɵdirectiveInject, ɵɵelement, ɵɵelementContainerEnd, ɵɵelementContainerStart, ɵɵelementEnd, ɵɵelementStart, ɵɵtemplate, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ɵɵcontentQuery, ɵɵloadQuery, ɵɵqueryRefresh, ɵɵviewQuery} from '../../src/render3/query';
import {getLView} from '../../src/render3/state';
import {getNativeByIndex, load} from '../../src/render3/util/view_utils';
import {ɵɵtemplateRefExtractor} from '../../src/render3/view_engine_compatibility_prebound';

import {ComponentFixture, createComponent, createDirective, getDirectiveOnNode, renderComponent, TemplateFixture} from './render_util';



/**
 * Helper function to check if a given candidate object resembles ElementRef
 * @param candidate
 * @returns true if `ElementRef`.
 */
function isElementRef(candidate: any): boolean {
  return candidate.nativeElement != null;
}

/**
 * Helper function to check if a given candidate object resembles TemplateRef
 * @param candidate
 * @returns true if `TemplateRef`.
 */
function isTemplateRef(candidate: any): boolean {
  return candidate.createEmbeddedView != null && candidate.createComponent == null;
}

/**
 * Helper function to check if a given candidate object resembles ViewContainerRef
 * @param candidate
 * @returns true if `ViewContainerRef`.
 */
function isViewContainerRef(candidate: any): boolean {
  return candidate.createEmbeddedView != null && candidate.createComponent != null;
}

describe('query', () => {
  it('should match projected query children', () => {
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {});

    let child1 = null;
    let child2 = null;
    const Cmp = createComponent(
        'cmp',
        function(rf: RenderFlags, ctx: any) {
          /**
           * <child>
           *   <child>
           *   </child>
           * </child>
           * class Cmp {
           *   @ViewChildren(Child) query0;
           *   @ViewChildren(Child, {descend: true}) query1;
           * }
           */
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'child');
            { ɵɵelement(1, 'child'); }
            ɵɵelementEnd();
          }
          if (rf & RenderFlags.Update) {
            child1 = getDirectiveOnNode(HEADER_OFFSET);
            child2 = getDirectiveOnNode(HEADER_OFFSET + 1);
          }
        },
        2, 0, [Child], [],
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵviewQuery(Child, QueryFlags.none);
            ɵɵviewQuery(Child, QueryFlags.descendants);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                (ctx.query0 = tmp as QueryList<any>);
            ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                (ctx.query1 = tmp as QueryList<any>);
          }
        });

    const parent = renderComponent(Cmp);
    expect((parent.query0 as QueryList<any>).toArray()).toEqual([child1]);
    expect((parent.query1 as QueryList<any>).toArray()).toEqual([child1, child2]);
  });

  describe('predicate', () => {
    describe('types', () => {
      it('should query using type predicate and read a specified token', () => {
        const Child = createDirective('child');
        let elToQuery;
        /**
         * <div child></div>
         * class Cmpt {
         *  @ViewChildren(Child, {read: ElementRef}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0);
                elToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
              }
            },
            1, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, QueryFlags.none, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isElementRef(qList.first)).toBeTruthy();
        expect(qList.first.nativeElement).toBe(elToQuery);
      });

      it('should query using type predicate and read another directive type', () => {
        const Child = createDirective('child');
        const OtherChild = createDirective('otherChild');
        let otherChildInstance;
        /**
         * <div child otherChild></div>
         * class Cmpt {
         *  @ViewChildren(Child, {read: OtherChild}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'div', 0);
                { otherChildInstance = getDirectiveOnNode(HEADER_OFFSET, 1); }
                ɵɵelementEnd();
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, QueryFlags.none, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', '', 'otherChild', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first).toBe(otherChildInstance);
      });

      it('should not add results to query if a requested token cant be read', () => {
        const Child = createDirective('child');
        const OtherChild = createDirective('otherChild');
        /**
         * <div child></div>
         * class Cmpt {
         *  @ViewChildren(Child, {read: OtherChild}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0);
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, QueryFlags.none, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(0);
      });
    });

    describe('providers', () => {
      class Service {}
      class Alias {}

      let directive: MyDirective|null = null;

      class MyDirective {
        constructor(public service: Service) {}

        static ɵfac = function MyDirective_Factory() {
          return directive = new MyDirective(ɵɵdirectiveInject(Service));
        };
        static ɵdir = ɵɵdefineDirective({
          type: MyDirective,
          selectors: [['', 'myDir', '']],
          features: [ɵɵProvidersFeature([Service, {provide: Alias, useExisting: Service}])],
        });
      }

      beforeEach(() => directive = null);

      // https://stackblitz.com/edit/ng-viewengine-viewchild-providers?file=src%2Fapp%2Fapp.component.ts
      it('should query for providers that are present on a directive', () => {
        /**
         * <div myDir></div>
         * class App {
         *  @ViewChild(MyDirective) directive: MyDirective;
         *  @ViewChild(Service) service: Service;
         *  @ViewChild(Alias) alias: Alias;
         * }
         */
        class App {
          directive?: MyDirective;
          service?: Service;
          alias?: Alias;

          static ɵfac = function App_Factory() {
            return new App();
          };
          static ɵcmp = ɵɵdefineComponent({
            type: App,
            selectors: [['app']],
            decls: 1,
            vars: 0,
            consts: [['myDir']],
            template:
                function App_Template(rf: RenderFlags, ctx: App) {
                  if (rf & RenderFlags.Create) {
                    ɵɵelement(0, 'div', 0);
                  }
                },
            viewQuery:
                function(rf: RenderFlags, ctx: App) {
                  if (rf & RenderFlags.Create) {
                    ɵɵviewQuery(MyDirective, QueryFlags.none);
                    ɵɵviewQuery(Service, QueryFlags.none);
                    ɵɵviewQuery(Alias, QueryFlags.none);
                  }
                  if (rf & RenderFlags.Update) {
                    let tmp: any;
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                        (ctx.directive = tmp.first);
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                        (ctx.service = tmp.first);
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) && (ctx.alias = tmp.first);
                  }
                },
            dependencies: [MyDirective]
          });
        }

        const componentFixture = new ComponentFixture(App);
        expect(componentFixture.component.directive).toBe(directive!);
        expect(componentFixture.component.service).toBe(directive!.service);
        expect(componentFixture.component.alias).toBe(directive!.service);
      });

      it('should resolve a provider if given as read token', () => {
        /**
         * <div myDir></div>
         * class App {
         *  @ViewChild(MyDirective, {read: Alias}}) service: Service;
         * }
         */
        class App {
          service?: Service;

          static ɵfac = function App_Factory() {
            return new App();
          };
          static ɵcmp = ɵɵdefineComponent({
            type: App,
            selectors: [['app']],
            decls: 1,
            vars: 0,
            consts: [['myDir']],
            template:
                function App_Template(rf: RenderFlags, ctx: App) {
                  if (rf & RenderFlags.Create) {
                    ɵɵelement(0, 'div', 0);
                  }
                },
            viewQuery:
                function(rf: RenderFlags, ctx: App) {
                  let tmp: any;
                  if (rf & RenderFlags.Create) {
                    ɵɵviewQuery(MyDirective, QueryFlags.none, Alias);
                  }
                  if (rf & RenderFlags.Update) {
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                        (ctx.service = tmp.first);
                  }
                },
            dependencies: [MyDirective]
          });
        }

        const componentFixture = new ComponentFixture(App);
        expect(componentFixture.component.service).toBe(directive!.service);
      });
    });

    describe('local names', () => {
      it('should query for a single element and read ElementRef by default', () => {
        let elToQuery;
        /**
         * <div #foo></div>
         * <div></div>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', null, 0);
                elToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
                ɵɵelement(2, 'div');
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement).toEqual(elToQuery);
      });

      it('should query multiple locals on the same element', () => {
        let elToQuery;

        /**
         * <div #foo #bar></div>
         * <div></div>
         * class Cmpt {
         *  @ViewChildren('foo') fooQuery;
         *  @ViewChildren('bar') barQuery;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', null, 0);
                elToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
                ɵɵelement(3, 'div');
              }
            },
            4, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none);
                ɵɵviewQuery(['bar'], QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.fooQuery = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.barQuery = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '', 'bar', '']]);

        const cmptInstance = renderComponent(Cmpt);

        const fooList = (cmptInstance.fooQuery as QueryList<any>);
        expect(fooList.length).toBe(1);
        expect(fooList.first.nativeElement).toEqual(elToQuery);

        const barList = (cmptInstance.barQuery as QueryList<any>);
        expect(barList.length).toBe(1);
        expect(barList.first.nativeElement).toEqual(elToQuery);
      });

      it('should query for multiple elements and read ElementRef by default', () => {
        let el1ToQuery;
        let el2ToQuery;
        /**
         * <div #foo></div>
         * <div></div>
         * <div #bar></div>
         * class Cmpt {
         *  @ViewChildren('foo,bar') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', null, 0);
                el1ToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
                ɵɵelement(2, 'div');
                ɵɵelement(3, 'div', null, 1);
                el2ToQuery = getNativeByIndex(HEADER_OFFSET + 3, getLView());
              }
            },
            5, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo', 'bar'], QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', ''], ['bar', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(2);
        expect(qList.first.nativeElement).toEqual(el1ToQuery);
        expect(qList.last.nativeElement).toEqual(el2ToQuery);
      });

      it('should read ElementRef from an element when explicitly asked for', () => {
        let elToQuery;
        /**
         * <div #foo></div>
         * <div></div>
         * class Cmpt {
         *  @ViewChildren('foo', {read: ElementRef}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', null, 0);
                elToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
                ɵɵelement(2, 'div');
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isElementRef(qList.first)).toBeTruthy();
        expect(qList.first.nativeElement).toEqual(elToQuery);
      });

      it('should query for <ng-container> and read ElementRef with a native element pointing to comment node',
         () => {
           let elToQuery;
           /**
            * <ng-container #foo></ng-container>
            * class Cmpt {
            *  @ViewChildren('foo', {read: ElementRef}) query;
            * }
            */
           const Cmpt = createComponent(
               'cmpt',
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵelementContainerStart(0, null, 0);
                   elToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
                   ɵɵelementContainerEnd();
                 }
               },
               2, 0, [], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵviewQuery(['foo'], QueryFlags.none, ElementRef);
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               },
               [], [], undefined, [['foo', '']]);

           const cmptInstance = renderComponent(Cmpt);
           const qList = (cmptInstance.query as QueryList<any>);
           expect(qList.length).toBe(1);
           expect(isElementRef(qList.first)).toBeTruthy();
           expect(qList.first.nativeElement).toEqual(elToQuery);
         });

      it('should query for <ng-container> and read ElementRef without explicit read option', () => {
        let elToQuery;
        /**
         * <ng-container #foo></ng-container>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelementContainerStart(0, null, 0);
                elToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
                ɵɵelementContainerEnd();
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.descendants);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isElementRef(qList.first)).toBeTruthy();
        expect(qList.first.nativeElement).toEqual(elToQuery);
      });

      it('should read ViewContainerRef from element nodes when explicitly asked for', () => {
        /**
         * <div #foo></div>
         * class Cmpt {
         *  @ViewChildren('foo', {read: ViewContainerRef}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', null, 0);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none, ViewContainerRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isViewContainerRef(qList.first)).toBeTruthy();
      });

      it('should read ViewContainerRef from container nodes when explicitly asked for', () => {
        /**
         * <ng-template #foo></ng-template>
         * class Cmpt {
         *  @ViewChildren('foo', {read: ViewContainerRef}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵtemplate(0, null, 0, 0, 'ng-template', null, 0);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none, ViewContainerRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isViewContainerRef(qList.first)).toBeTruthy();
      });

      it('should read ElementRef with a native element pointing to comment DOM node from containers',
         () => {
           /**
            * <ng-template #foo></ng-template>
            * class Cmpt {
            *  @ViewChildren('foo', {read: ElementRef}) query;
            * }
            */
           const Cmpt = createComponent(
               'cmpt',
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵtemplate(0, null, 0, 0, 'ng-template', null, 0);
                 }
               },
               2, 0, [], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵviewQuery(['foo'], QueryFlags.none, ElementRef);
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               },
               [], [], undefined, [['foo', '']]);

           const cmptInstance = renderComponent(Cmpt);
           const qList = (cmptInstance.query as QueryList<any>);
           expect(qList.length).toBe(1);
           expect(isElementRef(qList.first)).toBeTruthy();
           expect(qList.first.nativeElement.nodeType).toBe(8);  // Node.COMMENT_NODE = 8
         });

      it('should read TemplateRef from container nodes by default', () => {
        // https://plnkr.co/edit/BVpORly8wped9I3xUYsX?p=preview
        /**
         * <ng-template #foo></ng-template>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵtemplate(0, null, 0, 0, 'ng-template', null, 0);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isTemplateRef(qList.first)).toBeTruthy();
      });


      it('should read TemplateRef from container nodes when explicitly asked for', () => {
        /**
         * <ng-template #foo></ng-template>
         * class Cmpt {
         *  @ViewChildren('foo', {read: TemplateRef}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵtemplate(0, null, 0, 0, 'ng-template', null, 0);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none, TemplateRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isTemplateRef(qList.first)).toBeTruthy();
      });

      it('should read component instance if element queried for is a component host', () => {
        const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {});

        let childInstance;
        /**
         * <child #foo></child>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'child', null, 0);
              }
              if (rf & RenderFlags.Update) {
                childInstance = getDirectiveOnNode(HEADER_OFFSET);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.descendants);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first).toBe(childInstance);
      });

      it('should read component instance with explicit exportAs', () => {
        let childInstance: Child;

        class Child {
          static ɵfac = () => childInstance = new Child();
          static ɵcmp = ɵɵdefineComponent({
            type: Child,
            selectors: [['child']],
            decls: 0,
            vars: 0,
            template: (rf: RenderFlags, ctx: Child) => {},
            exportAs: ['child']
          });
        }

        /**
         * <child #foo="child"></child>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'child', null, 0);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.descendants);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', 'child']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first).toBe(childInstance!);
      });

      it('should read directive instance if element queried for has an exported directive with a matching name',
         () => {
           const Child = createDirective('child', {exportAs: ['child']});

           let childInstance;
           /**
            * <div #foo="child" child></div>
            * class Cmpt {
            *  @ViewChildren('foo') query;
            * }
            */
           const Cmpt = createComponent(
               'cmpt',
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'div', 0, 1);
                 }
                 if (rf & RenderFlags.Update) {
                   childInstance = getDirectiveOnNode(HEADER_OFFSET);
                 }
               },
               2, 0, [Child], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵviewQuery(['foo'], QueryFlags.descendants);
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               },
               [], [], undefined, [['child', ''], ['foo', 'child']]);

           const cmptInstance = renderComponent(Cmpt);
           const qList = (cmptInstance.query as QueryList<any>);
           expect(qList.length).toBe(1);
           expect(qList.first).toBe(childInstance);
         });

      it('should read all matching directive instances from a given element', () => {
        const Child1 = createDirective('child1', {exportAs: ['child1']});
        const Child2 = createDirective('child2', {exportAs: ['child2']});

        let child1Instance, child2Instance;
        /**
         * <div #foo="child1" child1 #bar="child2" child2></div>
         * class Cmpt {
         *  @ViewChildren('foo, bar') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0, 1);
              }
              if (rf & RenderFlags.Update) {
                child1Instance = getDirectiveOnNode(HEADER_OFFSET, 0);
                child2Instance = getDirectiveOnNode(HEADER_OFFSET, 1);
              }
            },
            3, 0, [Child1, Child2], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo', 'bar'], QueryFlags.descendants);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child1', '', 'child2', ''], ['foo', 'child1', 'bar', 'child2']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(2);
        expect(qList.first).toBe(child1Instance);
        expect(qList.last).toBe(child2Instance);
      });

      it('should read multiple locals exporting the same directive from a given element', () => {
        const Child = createDirective('child', {exportAs: ['child']});
        let childInstance;

        /**
         * <div child #foo="child" #bar="child"></div>
         * class Cmpt {
         *  @ViewChildren('foo') fooQuery;
         *  @ViewChildren('bar') barQuery;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0, 1);
              }
              if (rf & RenderFlags.Update) {
                childInstance = getDirectiveOnNode(HEADER_OFFSET);
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.descendants);
                ɵɵviewQuery(['bar'], QueryFlags.descendants);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.fooQuery = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.barQuery = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', ''], ['foo', 'child', 'bar', 'child']]);

        const cmptInstance = renderComponent(Cmpt);

        const fooList = cmptInstance.fooQuery as QueryList<any>;
        expect(fooList.length).toBe(1);
        expect(fooList.first).toBe(childInstance);

        const barList = cmptInstance.barQuery as QueryList<any>;
        expect(barList.length).toBe(1);
        expect(barList.first).toBe(childInstance);
      });

      it('should match on exported directive name and read a requested token', () => {
        const Child = createDirective('child', {exportAs: ['child']});

        let div;
        /**
         * <div #foo="child" child></div>
         * class Cmpt {
         *  @ViewChildren('foo', {read: ElementRef}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0, 1);
                div = getNativeByIndex(HEADER_OFFSET, getLView());
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', ''], ['foo', 'child']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement).toBe(div);
      });

      it('should support reading a mix of ElementRef and directive instances', () => {
        const Child = createDirective('child', {exportAs: ['child']});

        let childInstance, div;
        /**
         * <div #foo #bar="child" child></div>
         * class Cmpt {
         *  @ViewChildren('foo, bar') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0, 1);
                div = getNativeByIndex(HEADER_OFFSET, getLView());
              }
              if (rf & RenderFlags.Update) {
                childInstance = getDirectiveOnNode(HEADER_OFFSET);
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo', 'bar'], QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', ''], ['foo', '', 'bar', 'child']]);

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(2);
        expect(qList.first.nativeElement).toBe(div);
        expect(qList.last).toBe(childInstance);
      });

      it('should not add results to selector-based query if a requested token cant be read', () => {
        const Child = createDirective('child');

        /**
         * <div #foo></div>
         * class Cmpt {
         *  @ViewChildren('foo', {read: Child}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none, Child);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '']]);

        const {component} = new ComponentFixture(Cmpt);
        const qList = component.query;
        expect(qList.length).toBe(0);
      });

      it('should not add results to directive-based query if requested token cant be read', () => {
        const Child = createDirective('child');
        const OtherChild = createDirective('otherchild');

        /**
         * <div child></div>
         * class Cmpt {
         *  @ViewChildren(Child, {read: OtherChild}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0);
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, QueryFlags.none, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', '']]);

        const {component} = new ComponentFixture(Cmpt);
        const qList = component.query;
        expect(qList.length).toBe(0);
      });

      it('should not add results to directive-based query if only read token matches', () => {
        const Child = createDirective('child');
        const OtherChild = createDirective('otherchild');

        /**
         * <div child></div>
         * class Cmpt {
         *  @ViewChildren(OtherChild, {read: Child}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0);
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(OtherChild, QueryFlags.none, Child);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', '']]);

        const {component} = new ComponentFixture(Cmpt);
        const qList = component.query;
        expect(qList.length).toBe(0);
      });

      it('should not add results to TemplateRef-based query if only read token matches', () => {
        /**
         * <div></div>
         * class Cmpt {
         *  @ViewChildren(TemplateRef, {read: ElementRef}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div');
              }
            },
            1, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(TemplateRef as any, QueryFlags.none, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

        const {component} = new ComponentFixture(Cmpt);
        const qList = component.query;
        expect(qList.length).toBe(0);
      });

      it('should match using string selector and directive as a read argument', () => {
        const Child = createDirective('child');

        /**
         * <div child #foo></div>
         * class Cmpt {
         *  @ViewChildren('foo', {read: Child}) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0, 1);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none, Child);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', ''], ['foo', '']]);

        const {component} = new ComponentFixture(Cmpt);
        const qList = component.query;
        expect(qList.length).toBe(1);
        expect(qList.first instanceof Child).toBeTruthy();
      });

      it('should not add results to the query in case no match found (via TemplateRef)', () => {
        const Child = createDirective('child');

        /**
         * <div child></div>
         * class Cmpt {
         *  @ViewChildren(TemplateRef) query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0);
              }
            },
            1, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(TemplateRef as any, QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['child', '']]);

        const {component} = new ComponentFixture(Cmpt);
        const qList = component.query;
        expect(qList.length).toBe(0);
      });

      it('should query templates if the type is TemplateRef (and respect "read" option)', () => {
        function Cmpt_Template_1(rf: RenderFlags, ctx1: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'div');
            ɵɵtext(1, 'Test');
            ɵɵelementEnd();
          }
        }
        /**
         * <ng-template #foo><div>Test</div></ng-template>
         * <ng-template #bar><div>Test</div></ng-template>
         * <ng-template #baz><div>Test</div></ng-template>
         * class Cmpt {
         *   @ViewChildren(TemplateRef) tmplQuery;
         *   @ViewChildren(TemplateRef, {read: ElementRef}) elemQuery;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵtemplate(
                    0, Cmpt_Template_1, 2, 0, 'ng-template', null, 0, ɵɵtemplateRefExtractor);
                ɵɵtemplate(
                    2, Cmpt_Template_1, 2, 0, 'ng-template', null, 1, ɵɵtemplateRefExtractor);
                ɵɵtemplate(
                    4, Cmpt_Template_1, 2, 0, 'ng-template', null, 2, ɵɵtemplateRefExtractor);
              }
            },
            6, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(TemplateRef as any, QueryFlags.none);
                ɵɵviewQuery(TemplateRef as any, QueryFlags.none, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.tmplQuery = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.elemQuery = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', ''], ['bar', ''], ['baz', '']]);

        const {component} = new ComponentFixture(Cmpt);

        // check template-based query set
        const tmplQList = component.tmplQuery;
        expect(tmplQList.length).toBe(3);
        expect(isTemplateRef(tmplQList.first)).toBeTruthy();

        // check element-based query set
        const elemQList = component.elemQuery;
        expect(elemQList.length).toBe(3);
        expect(isElementRef(elemQList.first)).toBeTruthy();
      });
    });
  });

  it('should restore queries if view changes', () => {
    class SomeDir {
      constructor(public vcr: ViewContainerRef, public temp: TemplateRef<any>) {
        this.vcr.createEmbeddedView(this.temp);
      }

      static ɵfac = () => new SomeDir(
          ɵɵdirectiveInject(ViewContainerRef as any), ɵɵdirectiveInject(TemplateRef as any))

          static ɵdir = ɵɵdefineDirective({
            type: SomeDir,
            selectors: [['', 'someDir', '']],
          });
    }

    function AppComponent_Template_1(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'div');
      }
    }

    /**
     * <div *someDir></div>
     * <div #foo></div>
     */
    const AppComponent = createComponent(
        'app',
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵtemplate(0, AppComponent_Template_1, 1, 0, 'div', 0);
            ɵɵelement(1, 'div', null, 1);
          }
        },
        3, 0, [SomeDir], [],
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵviewQuery(['foo'], QueryFlags.descendants);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                (ctx.query = tmp as QueryList<any>);
          }
        },
        [], [], undefined, [[AttributeMarker.Template, 'someDir'], ['foo', '']]);

    const fixture = new ComponentFixture(AppComponent);
    expect(fixture.component.query.length).toBe(1);
  });

  describe('content', () => {
    let withContentInstance: WithContentDirective|null;

    beforeEach(() => {
      withContentInstance = null;
    });

    class WithContentDirective {
      // @ContentChildren('foo')
      foos!: QueryList<ElementRef>;
      contentInitQuerySnapshot = 0;
      contentCheckedQuerySnapshot = 0;

      ngAfterContentInit() {
        this.contentInitQuerySnapshot = this.foos ? this.foos.length : 0;
      }

      ngAfterContentChecked() {
        this.contentCheckedQuerySnapshot = this.foos ? this.foos.length : 0;
      }

      static ɵfac = () => withContentInstance = new WithContentDirective();
      static ɵdir = ɵɵdefineDirective({
        type: WithContentDirective,
        selectors: [['', 'with-content', '']],
        contentQueries:
            (rf: RenderFlags, ctx: any, dirIndex: number) => {
              if (rf & RenderFlags.Create) {
                ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.descendants);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.foos = tmp);
              }
            }
      });
    }

    it('should support content queries for directives', () => {
      /**
       * <div with-content>
       *   <span #foo></span>
       * </div>
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              { ɵɵelement(1, 'span', null, 1); }
              ɵɵelementEnd();
            }
          },
          3, 0, [WithContentDirective], [], null, [], [], undefined,
          [[AttributeMarker.Bindings, 'with-content'], ['foo', '']]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance!.foos.length)
          .toBe(1, `Expected content query to match <span #foo>.`);

      expect(withContentInstance!.contentInitQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentInit was called.`);

      expect(withContentInstance!.contentCheckedQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentChecked was called.`);
    });

    it('should not match directive host with content queries', () => {
      /**
       * <div with-content #foo>
       * </div>
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', 0, 1);
            }
          },
          2, 0, [WithContentDirective], [], null, [], [], undefined,
          [['with-content', ''], ['foo', '']]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance!.foos.length)
          .toBe(0, `Expected content query not to match <div with-content #foo>.`);
    });

    // https://stackblitz.com/edit/angular-wlenwd?file=src%2Fapp%2Fapp.component.ts
    it('should support view and content queries matching the same element', () => {
      /**
       * <div with-content>
       *   <div #foo></div>
       * </div>
       * <div id="after" #bar></div>
       * class Cmpt {
       *  @ViewChildren('foo, bar') foos;
       * }
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              { ɵɵelement(1, 'div', null, 2); }
              ɵɵelementEnd();
              ɵɵelement(3, 'div', 1, 3);
            }
          },
          5, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['foo', 'bar'], QueryFlags.descendants);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                  (ctx.foos = tmp as QueryList<any>);
            }
          },
          [], [], undefined, [['with-content', ''], ['id', 'after'], ['foo', ''], ['bar', '']]);

      const fixture = new ComponentFixture(AppComponent);
      const viewQList = fixture.component.foos;

      expect(viewQList.length).toBe(2);
      expect(withContentInstance!.foos.length).toBe(1);
      expect(viewQList.first.nativeElement).toBe(withContentInstance!.foos.first.nativeElement);
      expect(viewQList.last.nativeElement.id).toBe('after');
    });

    it('should not report deep content query matches found above content children', () => {
      /**
       * <div with-content>
       *   <div #foo id="yes"></div>    <-- should match content query
       * </div>
       * <div #foo></div>              <-- should not match content query
       * class AppComponent {
       *  @ViewChildren('bar') bars: QueryList<ElementRef>;
       * }
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              { ɵɵelement(1, 'div', 1, 2); }
              ɵɵelementEnd();
              ɵɵelement(3, 'div', null, 2);
            }
          },
          5, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['bar'], QueryFlags.descendants);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                  (ctx.bars = tmp as QueryList<any>);
            }
          },
          [], [], undefined, [['with-content', ''], ['id', 'yes'], ['foo', '']]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance!.foos.length).toBe(1);
      expect(withContentInstance!.foos.first.nativeElement.id).toEqual('yes');
    });

    it('should report results to appropriate queries where deep content queries are nested', () => {
      class QueryDirective {
        fooBars: any;
        static ɵfac = () => new QueryDirective();
        static ɵdir = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren('foo, bar, baz', {descendants: true})
                // fooBars: QueryList<ElementRef>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, ['foo', 'bar', 'baz'], QueryFlags.descendants);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.fooBars = tmp);
                }
              }
        });
      }

      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div query #out="query">
           *   <span #foo></span>
           *   <div query #in="query">
           *     <span #bar></span>
           *   </div>
           *   <span #baz></span>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0, 4);
              {
                ɵɵelement(2, 'span', 1, 5);
                ɵɵelementStart(4, 'div', 0, 6);
                { ɵɵelement(6, 'span', 2, 7); }
                ɵɵelementEnd();
                ɵɵelement(8, 'span', 3, 8);
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const lView = getLView();
              outInstance = load<QueryDirective>(lView, HEADER_OFFSET + 1);
              inInstance = load<QueryDirective>(lView, HEADER_OFFSET + 5);
            }
          },
          10, 0, [QueryDirective], [], null, [], [], undefined, [
            [AttributeMarker.Bindings, 'query'], ['id', 'foo'], ['id', 'bar'], ['id', 'baz'],
            ['out', 'query'], ['foo', ''], ['in', 'query'], ['bar', ''], ['baz', '']
          ]);

      const fixture = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(3);
      expect(inInstance!.fooBars.length).toBe(1);
    });


    it('should support nested shallow content queries ', () => {
      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      class QueryDirective {
        fooBars: any;
        static ɵfac = () => new QueryDirective();
        static ɵdir = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren('foo', {descendants: true})
                // fooBars: QueryList<ElementRef>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.none);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.fooBars = tmp);
                }
              }
        });
      }

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div query #out="query">
           *   <div query #in="query" #foo>
           *     <span #foo></span>
           *   </div>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0, 2);
              {
                ɵɵelementStart(2, 'div', 0, 3);
                { ɵɵelement(5, 'span', 1, 4); }
                ɵɵelementEnd();
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const lView = getLView();
              outInstance = load<QueryDirective>(lView, HEADER_OFFSET + 1);
              inInstance = load<QueryDirective>(lView, HEADER_OFFSET + 3);
            }
          },
          7, 0, [QueryDirective], [], null, [], [], undefined, [
            ['query', ''], ['id', 'bar'], ['out', 'query'], ['in', 'query', 'foo', ''], ['foo', '']
          ]);

      const fixture = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(1);
      expect(inInstance!.fooBars.length).toBe(1);
    });

    it('should support nested shallow content queries across multiple component instances', () => {
      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      class QueryDirective {
        fooBars: any;
        static ɵfac = () => new QueryDirective();
        static ɵdir = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren('foo', {descendants: true})
                // fooBars: QueryList<ElementRef>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.none);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.fooBars = tmp);
                }
              }
        });
      }

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div query #out="query">
           *   <div query #in="query" #foo>
           *     <span #foo></span>
           *   </div>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0, 2);
              {
                ɵɵelementStart(2, 'div', 0, 3);
                { ɵɵelement(5, 'span', 1, 4); }
                ɵɵelementEnd();
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const lView = getLView();
              outInstance = load<QueryDirective>(lView, HEADER_OFFSET + 1);
              inInstance = load<QueryDirective>(lView, HEADER_OFFSET + 3);
            }
          },
          7, 0, [QueryDirective], [], null, [], [], undefined, [
            ['query', ''], ['id', 'bar'], ['out', 'query'], ['in', 'query', 'foo', ''], ['foo', '']
          ]);

      const fixture1 = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(1);
      expect(inInstance!.fooBars.length).toBe(1);

      outInstance = inInstance = null!;

      const fixture2 = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(1);
      expect(inInstance!.fooBars.length).toBe(1);
    });

    it('should respect shallow flag on content queries when mixing deep and shallow queries',
       () => {
         class ShallowQueryDirective {
           foos: any;
           static ɵfac = () => new ShallowQueryDirective();
           static ɵdir = ɵɵdefineDirective({
             type: ShallowQueryDirective,
             selectors: [['', 'shallow-query', '']],
             exportAs: ['shallow-query'],
             contentQueries:
                 (rf: RenderFlags, ctx: any, dirIndex: number) => {
                   // @ContentChildren('foo', {descendants: false})
                   // foos: QueryList<ElementRef>;
                   if (rf & RenderFlags.Create) {
                     ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.none);
                   }
                   if (rf & RenderFlags.Update) {
                     let tmp: any;
                     ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.foos = tmp);
                   }
                 }
           });
         }

         class DeepQueryDirective {
           foos: any;
           static ɵfac = () => new DeepQueryDirective();
           static ɵdir = ɵɵdefineDirective({
             type: DeepQueryDirective,
             selectors: [['', 'deep-query', '']],
             exportAs: ['deep-query'],
             contentQueries:
                 (rf: RenderFlags, ctx: any, dirIndex: number) => {
                   // @ContentChildren('foo', {descendants: true})
                   // foos: QueryList<ElementRef>;
                   if (rf & RenderFlags.Create) {
                     ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.descendants);
                   }
                   if (rf & RenderFlags.Update) {
                     let tmp: any;
                     ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.foos = tmp);
                   }
                 }
           });
         }

         let shallowInstance: ShallowQueryDirective;
         let deepInstance: DeepQueryDirective;

         const AppComponent = createComponent(
             'app-component',
             /**
              * <div shallow-query #shallow="shallow-query" deep-query #deep="deep-query">
              *   <span #foo></span>
              *    <div>
              *        <span #foo></span>
              *    </div>
              * </div>
              */
             function(rf: RenderFlags, ctx: any) {
               if (rf & RenderFlags.Create) {
                 ɵɵelementStart(0, 'div', 0, 1);
                 {
                   ɵɵelement(3, 'span', null, 2);
                   ɵɵelementStart(5, 'div');
                   { ɵɵelement(6, 'span', null, 2); }
                   ɵɵelementEnd();
                 }
                 ɵɵelementEnd();
               }
               if (rf & RenderFlags.Update) {
                 const lView = getLView();
                 shallowInstance = load<ShallowQueryDirective>(lView, HEADER_OFFSET + 1);
                 deepInstance = load<DeepQueryDirective>(lView, HEADER_OFFSET + 2);
               }
             },
             8, 0, [ShallowQueryDirective, DeepQueryDirective], [], null, [], [], undefined, [
               [AttributeMarker.Bindings, 'shallow-query', 'deep-query'],
               ['shallow', 'shallow-query', 'deep', 'deep-query'], ['foo', '']
             ]);

         const fixture = new ComponentFixture(AppComponent);
         expect(shallowInstance!.foos.length).toBe(1);
         expect(deepInstance!.foos.length).toBe(2);
       });
  });

  describe('order', () => {
    class TextDirective {
      value!: string;

      static ɵfac = () => new TextDirective();
      static ɵdir = ɵɵdefineDirective(
          {type: TextDirective, selectors: [['', 'text', '']], inputs: {value: 'text'}});
    }

    it('should register content matches from top to bottom', () => {
      let contentQueryDirective: ContentQueryDirective;

      class ContentQueryDirective {
        // @ContentChildren(TextDirective)
        texts!: QueryList<TextDirective>;

        static ɵfac = () => contentQueryDirective = new ContentQueryDirective();
        static ɵcmp = ɵɵdefineDirective({
          type: ContentQueryDirective,
          selectors: [['', 'content-query', '']],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren(TextDirective, {descendants: true})
                // texts: QueryList<TextDirective>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, TextDirective, QueryFlags.descendants);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<TextDirective>()) && (ctx.texts = tmp);
                }
              }
        });
      }

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div content-query>
           *    <span text="A"></span>
           *    <div text="B">
           *       <span text="C">
           *         <span text="D"></span>
           *       </span>
           *    </div>
           *    <span text="E"></span>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              {
                ɵɵelement(1, 'span', 1);
                ɵɵelementStart(2, 'div', 2);
                ɵɵelementStart(3, 'span', 3);
                { ɵɵelement(4, 'span', 4); }
                ɵɵelementEnd();
                ɵɵelementEnd();
                ɵɵelement(5, 'span', 5);
              }
              ɵɵelementEnd();
            }
          },
          6, 0, [TextDirective, ContentQueryDirective], [], null, [], [], undefined, [
            ['content-query'], ['text', 'A'], ['text', 'B'], ['text', 'C'], ['text', 'D'],
            ['text', 'E']
          ]);

      new ComponentFixture(AppComponent);
      expect(contentQueryDirective!.texts.map(item => item.value)).toEqual([
        'A', 'B', 'C', 'D', 'E'
      ]);
    });

    it('should register view matches from top to bottom', () => {
      /**
       *    <span text="A"></span>
       *    <div text="B">
       *       <span text="C">
       *         <span text="D"></span>
       *       </span>
       *    </div>
       *    <span text="E"></span>
       */
      class ViewQueryComponent {
        // @ViewChildren(TextDirective)
        texts!: QueryList<TextDirective>;

        static ɵfac = () => new ViewQueryComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: ViewQueryComponent,
          selectors: [['view-query']],
          consts: [['text', 'A'], ['text', 'B'], ['text', 'C'], ['text', 'D'], ['text', 'E']],
          template:
              function(rf: RenderFlags, ctx: ViewQueryComponent) {
                if (rf & RenderFlags.Create) {
                  ɵɵelement(0, 'span', 0);
                  ɵɵelementStart(1, 'div', 1);
                  ɵɵelementStart(2, 'span', 2);
                  { ɵɵelement(3, 'span', 3); }
                  ɵɵelementEnd();
                  ɵɵelementEnd();
                  ɵɵelement(4, 'span', 4);
                }
              },
          decls: 5,
          vars: 0,
          viewQuery:
              function(rf: RenderFlags, ctx: ViewQueryComponent) {
                let tmp: any;
                if (rf & RenderFlags.Create) {
                  ɵɵviewQuery(TextDirective, QueryFlags.descendants);
                }
                if (rf & RenderFlags.Update) {
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<TextDirective>>()) &&
                      (ctx.texts = tmp as QueryList<TextDirective>);
                }
              },
          dependencies: [TextDirective]
        });
      }

      const fixture = new ComponentFixture(ViewQueryComponent);
      expect(fixture.component.texts.map(item => item.value)).toEqual(['A', 'B', 'C', 'D', 'E']);
    });
  });
});
