/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList, TemplateRef, ViewContainerRef} from '@angular/core';

import {EventEmitter} from '../..';
import {AttributeMarker, detectChanges, ɵɵProvidersFeature, ɵɵdefineComponent, ɵɵdefineDirective} from '../../src/render3/index';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵdirectiveInject, ɵɵelement, ɵɵelementContainerEnd, ɵɵelementContainerStart, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵload, ɵɵtemplate, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ɵɵcontentQuery, ɵɵloadContentQuery, ɵɵloadViewQuery, ɵɵqueryRefresh, ɵɵviewQuery} from '../../src/render3/query';
import {getLView} from '../../src/render3/state';
import {getNativeByIndex} from '../../src/render3/util/view_utils';
import {ɵɵtemplateRefExtractor} from '../../src/render3/view_engine_compatibility_prebound';

import {ComponentFixture, TemplateFixture, createComponent, createDirective, getDirectiveOnNode, renderComponent} from './render_util';



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
            child1 = getDirectiveOnNode(0);
            child2 = getDirectiveOnNode(1);
          }
        },
        2, 0, [Child], [],
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵviewQuery(Child, false);
            ɵɵviewQuery(Child, true);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                (ctx.query0 = tmp as QueryList<any>);
            ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
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
                ɵɵelement(0, 'div', ['child', '']);
                elToQuery = getNativeByIndex(0, getLView());
              }
            },
            1, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, false, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelementStart(0, 'div', ['child', '', 'otherChild', '']);
                { otherChildInstance = getDirectiveOnNode(0, 1); }
                ɵɵelementEnd();
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, false, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['child', '']);
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, false, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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

        static ngDirectiveDef = ɵɵdefineDirective({
          type: MyDirective,
          selectors: [['', 'myDir', '']],
          factory: function MyDirective_Factory() {
            return directive = new MyDirective(ɵɵdirectiveInject(Service));
          },
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

          static ngComponentDef = ɵɵdefineComponent({
            type: App,
            selectors: [['app']],
            consts: 1,
            vars: 0,
            factory: function App_Factory() { return new App(); },
            template: function App_Template(rf: RenderFlags, ctx: App) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', ['myDir']);
              }
            },
            viewQuery: function(rf: RenderFlags, ctx: App) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(MyDirective, false);
                ɵɵviewQuery(Service, false);
                ɵɵviewQuery(Alias, false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.directive = tmp.first);
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.service = tmp.first);
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) && (ctx.alias = tmp.first);
              }
            },
            directives: [MyDirective]
          });
        }

        const componentFixture = new ComponentFixture(App);
        expect(componentFixture.component.directive).toBe(directive !);
        expect(componentFixture.component.service).toBe(directive !.service);
        expect(componentFixture.component.alias).toBe(directive !.service);
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

          static ngComponentDef = ɵɵdefineComponent({
            type: App,
            selectors: [['app']],
            consts: 1,
            vars: 0,
            factory: function App_Factory() { return new App(); },
            template: function App_Template(rf: RenderFlags, ctx: App) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', ['myDir']);
              }
            },
            viewQuery: function(rf: RenderFlags, ctx: App) {
              let tmp: any;
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(MyDirective, false, Alias);
              }
              if (rf & RenderFlags.Update) {
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.service = tmp.first);
              }
            },
            directives: [MyDirective]
          });
        }

        const componentFixture = new ComponentFixture(App);
        expect(componentFixture.component.service).toBe(directive !.service);
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
                ɵɵelement(0, 'div', null, ['foo', '']);
                elToQuery = getNativeByIndex(0, getLView());
                ɵɵelement(2, 'div');
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', null, ['foo', '', 'bar', '']);
                elToQuery = getNativeByIndex(0, getLView());
                ɵɵelement(3, 'div');
              }
            },
            4, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false);
                ɵɵviewQuery(['bar'], false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.fooQuery = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.barQuery = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', null, ['foo', '']);
                el1ToQuery = getNativeByIndex(0, getLView());
                ɵɵelement(2, 'div');
                ɵɵelement(3, 'div', null, ['bar', '']);
                el2ToQuery = getNativeByIndex(3, getLView());
              }
            },
            5, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo', 'bar'], false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', null, ['foo', '']);
                elToQuery = getNativeByIndex(0, getLView());
                ɵɵelement(2, 'div');
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                   ɵɵelementContainerStart(0, null, ['foo', '']);
                   elToQuery = getNativeByIndex(0, getLView());
                   ɵɵelementContainerEnd();
                 }
               },
               2, 0, [], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵviewQuery(['foo'], false, ElementRef);
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               });

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
                ɵɵelementContainerStart(0, null, ['foo', '']);
                elToQuery = getNativeByIndex(0, getLView());
                ɵɵelementContainerEnd();
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], true);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isElementRef(qList.first)).toBeTruthy();
        expect(qList.first.nativeElement).toEqual(elToQuery);
      });

      /**
       * BREAKING CHANGE: this tests asserts different behavior as compared to Renderer2 when it
       * comes to descendants: false option and <ng-container>.
       *
       * Previous behavior: queries with descendants: false would descend into <ng-container>.
       * New behavior: queries with descendants: false would NOT descend into <ng-container>.
       *
       * Reasoning: the Renderer2 behavior is inconsistent and hard to explain to users when it
       * comes to descendants: false interpretation (see
       * https://github.com/angular/angular/issues/14769#issuecomment-356609267) so we are changing
       * it in ngIvy.
       *
       * In ngIvy implementation queries with the descendants: false option are interpreted as
       * "don't descend" into children of a given element when looking for matches. In other words
       * only direct children of a given component / directive are checked for matches. This applies
       * to both regular elements (ex. <div>) and grouping elements (<ng-container>,
       * <ng-template>)).
       *
       * Grouping elements (<ng-container>, <ng-template>) are treated as regular elements since we
       * can query for <ng-container> and <ng-template>, so they behave like regular elements from
       * this point of view.
       */
      it('should not descend into <ng-container> when descendants: false', () => {
        let elToQuery;

        /**
          * <ng-container>
          *    <div #foo></div>
          * </ng-container>
          * class Cmpt {
          *  @ViewChildren('foo') deep;
          *  @ViewChildren('foo', {descendants: false}) shallow;
          * }
          */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelementContainerStart(0);
                {
                  ɵɵelement(1, 'div', null, ['foo', '']);
                  elToQuery = getNativeByIndex(3, getLView());
                }
                ɵɵelementContainerEnd();
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], true, ElementRef);
                ɵɵviewQuery(['foo'], false, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.deep = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.shallow = tmp as QueryList<any>);
              }
            });

        const fixture = new ComponentFixture(Cmpt);
        const deepQList = fixture.component.deep;
        const shallowQList = fixture.component.shallow;
        expect(deepQList.length).toBe(1);
        expect(shallowQList.length).toBe(0);
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
                ɵɵelement(0, 'div', null, ['foo', '']);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false, ViewContainerRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵtemplate(0, null, 0, 0, 'ng-template', null, ['foo', '']);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false, ViewContainerRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                   ɵɵtemplate(0, null, 0, 0, 'ng-template', null, ['foo', '']);
                 }
               },
               2, 0, [], [],
               function(rf: RenderFlags, ctx: any) {

                 if (rf & RenderFlags.Create) {
                   ɵɵviewQuery(['foo'], false, ElementRef);
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               });

           const cmptInstance = renderComponent(Cmpt);
           const qList = (cmptInstance.query as QueryList<any>);
           expect(qList.length).toBe(1);
           expect(isElementRef(qList.first)).toBeTruthy();
           expect(qList.first.nativeElement.nodeType).toBe(8);  // Node.COMMENT_NODE = 8
         });

      it('should read TemplateRef from container nodes by default', () => {
        // http://plnkr.co/edit/BVpORly8wped9I3xUYsX?p=preview
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
                ɵɵtemplate(0, null, 0, 0, 'ng-template', null, ['foo', '']);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵtemplate(0, null, 0, 0, 'ng-template', null, ['foo', '']);
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false, TemplateRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'child', null, ['foo', '']);
              }
              if (rf & RenderFlags.Update) {
                childInstance = getDirectiveOnNode(0);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], true);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first).toBe(childInstance);
      });

      it('should read component instance with explicit exportAs', () => {
        let childInstance: Child;

        class Child {
          static ngComponentDef = ɵɵdefineComponent({
            type: Child,
            selectors: [['child']],
            factory: () => childInstance = new Child(),
            consts: 0,
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
                ɵɵelement(0, 'child', null, ['foo', 'child']);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], true);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first).toBe(childInstance !);
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
                   ɵɵelement(0, 'div', ['child', ''], ['foo', 'child']);
                 }
                 if (rf & RenderFlags.Update) {
                   childInstance = getDirectiveOnNode(0);
                 }
               },
               2, 0, [Child], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵviewQuery(['foo'], true);
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               });

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
                ɵɵelement(
                    0, 'div', ['child1', '', 'child2', ''], ['foo', 'child1', 'bar', 'child2']);
              }
              if (rf & RenderFlags.Update) {
                child1Instance = getDirectiveOnNode(0, 0);
                child2Instance = getDirectiveOnNode(0, 1);
              }
            },
            3, 0, [Child1, Child2], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo', 'bar'], true);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['child', ''], ['foo', 'child', 'bar', 'child']);
              }
              if (rf & RenderFlags.Update) {
                childInstance = getDirectiveOnNode(0);
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], true);
                ɵɵviewQuery(['bar'], true);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.fooQuery = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.barQuery = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['child', ''], ['foo', 'child']);
                div = getNativeByIndex(0, getLView());
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['child', ''], ['foo', '', 'bar', 'child']);
                div = getNativeByIndex(0, getLView());
              }
              if (rf & RenderFlags.Update) {
                childInstance = getDirectiveOnNode(0);
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo', 'bar'], false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['foo', '']);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false, Child);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['child', '']);
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(Child, false, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['child', '']);
              }
            },
            1, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(OtherChild, false, Child);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵviewQuery(TemplateRef as any, false, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
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
                ɵɵelement(0, 'div', ['child', ''], ['foo', '']);
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], false, Child);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                ɵɵelement(0, 'div', ['child', '']);
              }
            },
            1, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(TemplateRef as any, false);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.query = tmp as QueryList<any>);
              }
            });

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
                    0, Cmpt_Template_1, 2, 0, 'ng-template', null, ['foo', ''],
                    ɵɵtemplateRefExtractor);
                ɵɵtemplate(
                    2, Cmpt_Template_1, 2, 0, 'ng-template', null, ['bar', ''],
                    ɵɵtemplateRefExtractor);
                ɵɵtemplate(
                    4, Cmpt_Template_1, 2, 0, 'ng-template', null, ['baz', ''],
                    ɵɵtemplateRefExtractor);
              }
            },
            6, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(TemplateRef as any, false);
                ɵɵviewQuery(TemplateRef as any, false, ElementRef);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.tmplQuery = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                    (ctx.elemQuery = tmp as QueryList<any>);
              }
            });

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

  describe('queryList', () => {
    it('should be destroyed when the containing view is destroyed', () => {
      let queryInstance: QueryList<any>;

      const SimpleComponentWithQuery = createComponent(
          'some-component-with-query',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', null, ['foo', '']);
            }
          },
          2, 0, [], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['foo'], false);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                  (ctx.query = queryInstance = tmp as QueryList<any>);
            }
          });

      function createTemplate() { ɵɵcontainer(0); }

      function updateTemplate() {
        ɵɵcontainerRefreshStart(0);
        {
          if (condition) {
            let rf1 = ɵɵembeddedViewStart(1, 1, 0);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelement(0, 'some-component-with-query');
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }

      /**
       * % if (condition) {
       *   <some-component-with-query></some-component-with-query>
       * %}
       */
      let condition = true;
      const t =
          new TemplateFixture(createTemplate, updateTemplate, 1, 0, [SimpleComponentWithQuery]);
      expect(t.html).toEqual('<some-component-with-query><div></div></some-component-with-query>');
      expect((queryInstance !.changes as EventEmitter<any>).closed).toBeFalsy();

      condition = false;
      t.update();
      expect(t.html).toEqual('');
      expect((queryInstance !.changes as EventEmitter<any>).closed).toBeTruthy();
    });
  });

  it('should restore queries if view changes', () => {
    class SomeDir {
      constructor(public vcr: ViewContainerRef, public temp: TemplateRef<any>) {
        this.vcr.createEmbeddedView(this.temp);
      }

      static ngDirectiveDef = ɵɵdefineDirective({
        type: SomeDir,
        selectors: [['', 'someDir', '']],
        factory:
            () => new SomeDir(
                ɵɵdirectiveInject(ViewContainerRef as any), ɵɵdirectiveInject(TemplateRef as any))
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
            ɵɵtemplate(
                0, AppComponent_Template_1, 1, 0, 'div', [AttributeMarker.Template, 'someDir']);
            ɵɵelement(1, 'div', null, ['foo', '']);
          }
        },
        3, 0, [SomeDir], [],
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵviewQuery(['foo'], true);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                (ctx.query = tmp as QueryList<any>);
          }
        });

    const fixture = new ComponentFixture(AppComponent);
    expect(fixture.component.query.length).toBe(1);
  });

  describe('content', () => {
    let withContentInstance: WithContentDirective|null;

    beforeEach(() => { withContentInstance = null; });

    class WithContentDirective {
      // @ContentChildren('foo')
      foos !: QueryList<ElementRef>;
      contentInitQuerySnapshot = 0;
      contentCheckedQuerySnapshot = 0;

      ngAfterContentInit() { this.contentInitQuerySnapshot = this.foos ? this.foos.length : 0; }

      ngAfterContentChecked() {
        this.contentCheckedQuerySnapshot = this.foos ? this.foos.length : 0;
      }

      static ngDirectiveDef = ɵɵdefineDirective({
        type: WithContentDirective,
        selectors: [['', 'with-content', '']],
        factory: () => withContentInstance = new WithContentDirective(),
        contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵcontentQuery(dirIndex, ['foo'], true);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<ElementRef>()) && (ctx.foos = tmp);
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
      const AppComponent = createComponent('app-component', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'div', [AttributeMarker.Bindings, 'with-content']);
          { ɵɵelement(1, 'span', null, ['foo', '']); }
          ɵɵelementEnd();
        }
      }, 3, 0, [WithContentDirective]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance !.foos.length)
          .toBe(1, `Expected content query to match <span #foo>.`);

      expect(withContentInstance !.contentInitQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentInit was called.`);

      expect(withContentInstance !.contentCheckedQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentChecked was called.`);
    });

    it('should support content queries for directives within repeated embedded views', () => {
      /**
       * % for (let i = 0; i < 3; i++) {
       *   <div with-content>
       *     <span #foo></span>
       *   </div>
       * % }
       */
      const AppComponent = createComponent('app-component', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵcontainer(0);
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(0);
          {
            for (let i = 0; i < 3; i++) {
              let rf = ɵɵembeddedViewStart(1, 3, 0);
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'div', [AttributeMarker.Bindings, 'with-content']);
                { ɵɵelement(1, 'span', null, ['foo', '']); }
                ɵɵelementEnd();
              }
              ɵɵembeddedViewEnd();
            }
          }

          ɵɵcontainerRefreshEnd();
        }
      }, 1, 0, [WithContentDirective]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance !.foos.length)
          .toBe(1, `Expected content query to match <span #foo>.`);

      expect(withContentInstance !.contentInitQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentInit was called.`);

      expect(withContentInstance !.contentCheckedQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentChecked was called.`);
    });

    it('should not match directive host with content queries', () => {
      /**
       * <div with-content #foo>
       * </div>
       */
      const AppComponent = createComponent('app-component', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'div', ['with-content', ''], ['foo', '']);
        }
      }, 2, 0, [WithContentDirective]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance !.foos.length)
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
              ɵɵelementStart(0, 'div', ['with-content', '']);
              { ɵɵelement(1, 'div', null, ['foo', '']); }
              ɵɵelementEnd();
              ɵɵelement(3, 'div', ['id', 'after'], ['bar', '']);
            }
          },
          5, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['foo', 'bar'], true);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                  (ctx.foos = tmp as QueryList<any>);
            }
          });

      const fixture = new ComponentFixture(AppComponent);
      const viewQList = fixture.component.foos;

      expect(viewQList.length).toBe(2);
      expect(withContentInstance !.foos.length).toBe(1);
      expect(viewQList.first.nativeElement).toBe(withContentInstance !.foos.first.nativeElement);
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
              ɵɵelementStart(0, 'div', ['with-content', '']);
              { ɵɵelement(1, 'div', ['id', 'yes'], ['foo', '']); }
              ɵɵelementEnd();
              ɵɵelement(3, 'div', null, ['foo', '']);
            }
          },
          5, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['bar'], true);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                  (ctx.bars = tmp as QueryList<any>);
            }
          });

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance !.foos.length).toBe(1);
      expect(withContentInstance !.foos.first.nativeElement.id).toEqual('yes');
    });

    it('should report results to appropriate queries where deep content queries are nested', () => {
      class QueryDirective {
        fooBars: any;
        static ngDirectiveDef = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          factory: () => new QueryDirective(),
          contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
            // @ContentChildren('foo, bar, baz', {descendants: true})
            // fooBars: QueryList<ElementRef>;
            if (rf & RenderFlags.Create) {
              ɵɵcontentQuery(dirIndex, ['foo', 'bar', 'baz'], true);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<ElementRef>()) && (ctx.fooBars = tmp);
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
              ɵɵelementStart(0, 'div', [AttributeMarker.Bindings, 'query'], ['out', 'query']);
              {
                ɵɵelement(2, 'span', ['id', 'foo'], ['foo', '']);
                ɵɵelementStart(4, 'div', [AttributeMarker.Bindings, 'query'], ['in', 'query']);
                { ɵɵelement(6, 'span', ['id', 'bar'], ['bar', '']); }
                ɵɵelementEnd();
                ɵɵelement(8, 'span', ['id', 'baz'], ['baz', '']);
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              outInstance = ɵɵload<QueryDirective>(1);
              inInstance = ɵɵload<QueryDirective>(5);
            }
          },
          10, 0, [QueryDirective]);

      const fixture = new ComponentFixture(AppComponent);
      expect(outInstance !.fooBars.length).toBe(3);
      expect(inInstance !.fooBars.length).toBe(1);
    });


    it('should support nested shallow content queries ', () => {
      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      class QueryDirective {
        fooBars: any;
        static ngDirectiveDef = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          factory: () => new QueryDirective(),
          contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
            // @ContentChildren('foo', {descendants: true})
            // fooBars: QueryList<ElementRef>;
            if (rf & RenderFlags.Create) {
              ɵɵcontentQuery(dirIndex, ['foo'], false);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<ElementRef>()) && (ctx.fooBars = tmp);
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
              ɵɵelementStart(0, 'div', ['query', ''], ['out', 'query']);
              {
                ɵɵelementStart(2, 'div', ['query', ''], ['in', 'query', 'foo', '']);
                { ɵɵelement(5, 'span', ['id', 'bar'], ['foo', '']); }
                ɵɵelementEnd();
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              outInstance = ɵɵload<QueryDirective>(1);
              inInstance = ɵɵload<QueryDirective>(3);
            }
          },
          7, 0, [QueryDirective]);

      const fixture = new ComponentFixture(AppComponent);
      expect(outInstance !.fooBars.length).toBe(1);
      expect(inInstance !.fooBars.length).toBe(1);
    });

    it('should support nested shallow content queries across multiple component instances', () => {
      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      class QueryDirective {
        fooBars: any;
        static ngDirectiveDef = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          factory: () => new QueryDirective(),
          contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
            // @ContentChildren('foo', {descendants: true})
            // fooBars: QueryList<ElementRef>;
            if (rf & RenderFlags.Create) {
              ɵɵcontentQuery(dirIndex, ['foo'], false);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<ElementRef>()) && (ctx.fooBars = tmp);
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
              ɵɵelementStart(0, 'div', ['query', ''], ['out', 'query']);
              {
                ɵɵelementStart(2, 'div', ['query', ''], ['in', 'query', 'foo', '']);
                { ɵɵelement(5, 'span', ['id', 'bar'], ['foo', '']); }
                ɵɵelementEnd();
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              outInstance = ɵɵload<QueryDirective>(1);
              inInstance = ɵɵload<QueryDirective>(3);
            }
          },
          7, 0, [QueryDirective]);

      const fixture1 = new ComponentFixture(AppComponent);
      expect(outInstance !.fooBars.length).toBe(1);
      expect(inInstance !.fooBars.length).toBe(1);

      outInstance = inInstance = null !;

      const fixture2 = new ComponentFixture(AppComponent);
      expect(outInstance !.fooBars.length).toBe(1);
      expect(inInstance !.fooBars.length).toBe(1);
    });

    it('should respect shallow flag on content queries when mixing deep and shallow queries',
       () => {
         class ShallowQueryDirective {
           foos: any;
           static ngDirectiveDef = ɵɵdefineDirective({
             type: ShallowQueryDirective,
             selectors: [['', 'shallow-query', '']],
             exportAs: ['shallow-query'],
             factory: () => new ShallowQueryDirective(),
             contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
               // @ContentChildren('foo', {descendants: false})
               // foos: QueryList<ElementRef>;
               if (rf & RenderFlags.Create) {
                 ɵɵcontentQuery(dirIndex, ['foo'], false);
               }
               if (rf & RenderFlags.Update) {
                 let tmp: any;
                 ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<ElementRef>()) && (ctx.foos = tmp);
               }
             }
           });
         }

         class DeepQueryDirective {
           foos: any;
           static ngDirectiveDef = ɵɵdefineDirective({
             type: DeepQueryDirective,
             selectors: [['', 'deep-query', '']],
             exportAs: ['deep-query'],
             factory: () => new DeepQueryDirective(),
             contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
               // @ContentChildren('foo', {descendants: true})
               // foos: QueryList<ElementRef>;
               if (rf & RenderFlags.Create) {
                 ɵɵcontentQuery(dirIndex, ['foo'], true);
               }
               if (rf & RenderFlags.Update) {
                 let tmp: any;
                 ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<ElementRef>()) && (ctx.foos = tmp);
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
                 ɵɵelementStart(
                     0, 'div', [AttributeMarker.Bindings, 'shallow-query', 'deep-query'],
                     ['shallow', 'shallow-query', 'deep', 'deep-query']);
                 {
                   ɵɵelement(3, 'span', null, ['foo', '']);
                   ɵɵelementStart(5, 'div');
                   { ɵɵelement(6, 'span', null, ['foo', '']); }
                   ɵɵelementEnd();
                 }
                 ɵɵelementEnd();
               }
               if (rf & RenderFlags.Update) {
                 shallowInstance = ɵɵload<ShallowQueryDirective>(1);
                 deepInstance = ɵɵload<DeepQueryDirective>(2);
               }
             },
             8, 0, [ShallowQueryDirective, DeepQueryDirective]);

         const fixture = new ComponentFixture(AppComponent);
         expect(shallowInstance !.foos.length).toBe(1);
         expect(deepInstance !.foos.length).toBe(2);
       });
  });

  describe('order', () => {
    class TextDirective {
      value !: string;

      static ngDirectiveDef = ɵɵdefineDirective({
        type: TextDirective,
        selectors: [['', 'text', '']],
        factory: () => new TextDirective(),
        inputs: {value: 'text'}
      });
    }

    it('should register content matches from top to bottom', () => {
      let contentQueryDirective: ContentQueryDirective;

      class ContentQueryDirective {
        // @ContentChildren(TextDirective)
        texts !: QueryList<TextDirective>;

        static ngComponentDef = ɵɵdefineDirective({
          type: ContentQueryDirective,
          selectors: [['', 'content-query', '']],
          factory: () => contentQueryDirective = new ContentQueryDirective(),
          contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
            // @ContentChildren(TextDirective, {descendants: true})
            // texts: QueryList<TextDirective>;
            if (rf & RenderFlags.Create) {
              ɵɵcontentQuery(dirIndex, TextDirective, true);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<TextDirective>()) && (ctx.texts = tmp);
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
              ɵɵelementStart(0, 'div', ['content-query']);
              {
                ɵɵelement(1, 'span', ['text', 'A']);
                ɵɵelementStart(2, 'div', ['text', 'B']);
                ɵɵelementStart(3, 'span', ['text', 'C']);
                { ɵɵelement(4, 'span', ['text', 'D']); }
                ɵɵelementEnd();
                ɵɵelementEnd();
                ɵɵelement(5, 'span', ['text', 'E']);
              }
              ɵɵelementEnd();
            }
          },
          6, 0, [TextDirective, ContentQueryDirective]);

      new ComponentFixture(AppComponent);
      expect(contentQueryDirective !.texts.map(item => item.value)).toEqual([
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
        texts !: QueryList<TextDirective>;

        static ngComponentDef = ɵɵdefineComponent({
          type: ViewQueryComponent,
          selectors: [['view-query']],
          factory: () => new ViewQueryComponent(),
          template: function(rf: RenderFlags, ctx: ViewQueryComponent) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'span', ['text', 'A']);
              ɵɵelementStart(1, 'div', ['text', 'B']);
              ɵɵelementStart(2, 'span', ['text', 'C']);
              { ɵɵelement(3, 'span', ['text', 'D']); }
              ɵɵelementEnd();
              ɵɵelementEnd();
              ɵɵelement(4, 'span', ['text', 'E']);
            }
          },
          consts: 5,
          vars: 0,
          viewQuery: function(rf: RenderFlags, ctx: ViewQueryComponent) {
            let tmp: any;
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(TextDirective, true);
            }
            if (rf & RenderFlags.Update) {
              ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<TextDirective>>()) &&
                  (ctx.texts = tmp as QueryList<TextDirective>);
            }
          },
          directives: [TextDirective]
        });
      }

      const fixture = new ComponentFixture(ViewQueryComponent);
      expect(fixture.component.texts.map(item => item.value)).toEqual(['A', 'B', 'C', 'D', 'E']);
    });
  });
});
