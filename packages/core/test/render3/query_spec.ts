/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';
import {ElementRef, TemplateRef, ViewContainerRef} from '@angular/core';

import {EventEmitter} from '../..';
import {directiveInject} from '../../src/render3/di';

import {AttributeMarker, QueryList, defineComponent, defineDirective, detectChanges} from '../../src/render3/index';

import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementContainerEnd, elementContainerStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, load, loadDirective, loadElement, loadQueryList, reference, registerContentQuery, template} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {query, queryRefresh, QUERY_READ_CONTAINER_REF, QUERY_READ_ELEMENT_REF, QUERY_READ_FROM_NODE, QUERY_READ_TEMPLATE_REF} from '../../src/render3/query';
import {templateRefExtractor} from '../../src/render3/view_engine_compatibility';

import {NgForOf, NgIf, NgTemplateOutlet} from './common_with_def';
import {ComponentFixture, TemplateFixture, createComponent, createDirective, renderComponent} from './render_util';



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
            elementStart(2, 'child');
            { element(3, 'child'); }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            child1 = loadDirective(0);
            child2 = loadDirective(1);
          }
        },
        4, 0, [Child], [],
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            query(0, Child, false);
            query(1, Child, true);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query0 = tmp as QueryList<any>);
            queryRefresh(tmp = load<QueryList<any>>(1)) && (ctx.query1 = tmp as QueryList<any>);
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
                element(1, 'div', ['child', '']);
                elToQuery = loadElement(1).native;
              }
            },
            2, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, Child, false, QUERY_READ_ELEMENT_REF(ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                elementStart(1, 'div', ['child', '', 'otherChild', '']);
                { otherChildInstance = loadDirective(1); }
                elementEnd();
              }
            },
            2, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, Child, false, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                element(1, 'div', ['child', '']);
              }
            },
            2, 0, [Child, OtherChild], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, Child, false, OtherChild);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(0);
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
                element(1, 'div', null, ['foo', '']);
                elToQuery = loadElement(1).native;
                element(3, 'div');
              }
            },
            4, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                element(2, 'div', null, ['foo', '', 'bar', '']);
                elToQuery = loadElement(2).native;
                element(5, 'div');
              }
            },
            6, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
                query(1, ['bar'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) &&
                    (ctx.fooQuery = tmp as QueryList<any>);
                queryRefresh(tmp = load<QueryList<any>>(1)) &&
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
                element(1, 'div', null, ['foo', '']);
                el1ToQuery = loadElement(1).native;
                element(3, 'div');
                element(4, 'div', null, ['bar', '']);
                el2ToQuery = loadElement(4).native;
              }
            },
            6, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo', 'bar'], undefined, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                element(1, 'div', null, ['foo', '']);
                elToQuery = loadElement(1).native;
                element(3, 'div');
              }
            },
            4, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], false, QUERY_READ_ELEMENT_REF(ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                   elementContainerStart(1, null, ['foo', '']);
                   elToQuery = loadElement(1).native;
                   elementContainerEnd();
                 }
               },
               3, 0, [], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   query(0, ['foo'], false, QUERY_READ_ELEMENT_REF(ElementRef));
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   queryRefresh(tmp = load<QueryList<any>>(0)) &&
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
                elementContainerStart(1, null, ['foo', '']);
                elToQuery = loadElement(1).native;
                elementContainerEnd();
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(isElementRef(qList.first)).toBeTruthy();
        expect(qList.first.nativeElement).toEqual(elToQuery);
      });

      /**
       * BREAKING CHANGE: this tests asserts different behaviour as compared to Renderer2 when it
       * comes to descendants: false option and <ng-container>.
       *
       * Previous behaviour: queries with descendants: false would descend into <ng-container>.
       * New behaviour: queries with descendants: false would NOT descend into <ng-container>.
       *
       * Reasoning: the Renderer2 behaviour is inconsistent and hard to explain to users when it
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
                elementContainerStart(2);
                {
                  element(3, 'div', null, ['foo', '']);
                  elToQuery = loadElement(3).native;
                }
                elementContainerEnd();
              }
            },
            5, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_ELEMENT_REF(ElementRef));
                query(1, ['foo'], false, QUERY_READ_ELEMENT_REF(ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.deep = tmp as QueryList<any>);
                queryRefresh(tmp = load<QueryList<any>>(1)) &&
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
                element(1, 'div', null, ['foo', '']);
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], false, QUERY_READ_CONTAINER_REF(ViewContainerRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                template(1, null, 0, 0, null, null, ['foo', '']);
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], false, QUERY_READ_CONTAINER_REF(ViewContainerRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                   template(1, null, 0, 0, null, null, ['foo', '']);
                 }
               },
               3, 0, [], [],
               function(rf: RenderFlags, ctx: any) {

                 if (rf & RenderFlags.Create) {
                   query(0, ['foo'], false, QUERY_READ_ELEMENT_REF(ElementRef));
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   queryRefresh(tmp = load<QueryList<any>>(0)) &&
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
                template(1, null, 0, 0, null, null, ['foo', '']);
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], undefined, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                template(1, null, 0, 0, null, null, ['foo', '']);
              }
            },
            3, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], false, QUERY_READ_TEMPLATE_REF(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
                element(1, 'child', null, ['foo', '']);
              }
              if (rf & RenderFlags.Update) {
                childInstance = loadDirective(0);
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
          static ngComponentDef = defineComponent({
            type: Child,
            selectors: [['child']],
            factory: () => childInstance = new Child(),
            consts: 0,
            vars: 0,
            template: (rf: RenderFlags, ctx: Child) => {},
            exportAs: 'child'
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
                element(1, 'child', null, ['foo', 'child']);
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first).toBe(childInstance !);
      });

      it('should read directive instance if element queried for has an exported directive with a matching name',
         () => {
           const Child = createDirective('child', {exportAs: 'child'});

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
                   element(1, 'div', ['child', ''], ['foo', 'child']);
                 }
                 if (rf & RenderFlags.Update) {
                   childInstance = loadDirective(0);
                 }
               },
               3, 0, [Child], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   queryRefresh(tmp = load<QueryList<any>>(0)) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               });

           const cmptInstance = renderComponent(Cmpt);
           const qList = (cmptInstance.query as QueryList<any>);
           expect(qList.length).toBe(1);
           expect(qList.first).toBe(childInstance);
         });

      it('should read all matching directive instances from a given element', () => {
        const Child1 = createDirective('child1', {exportAs: 'child1'});
        const Child2 = createDirective('child2', {exportAs: 'child2'});

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
                element(1, 'div', ['child1', '', 'child2', ''], ['foo', 'child1', 'bar', 'child2']);
              }
              if (rf & RenderFlags.Update) {
                child1Instance = loadDirective(0);
                child2Instance = loadDirective(1);
              }
            },
            4, 0, [Child1, Child2], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo', 'bar'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(2);
        expect(qList.first).toBe(child1Instance);
        expect(qList.last).toBe(child2Instance);
      });

      it('should read multiple locals exporting the same directive from a given element', () => {
        const Child = createDirective('child', {exportAs: 'child'});
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
                element(2, 'div', ['child', ''], ['foo', 'child', 'bar', 'child']);
              }
              if (rf & RenderFlags.Update) {
                childInstance = loadDirective(0);
              }
            },
            5, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
                query(1, ['bar'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) &&
                    (ctx.fooQuery = tmp as QueryList<any>);
                queryRefresh(tmp = load<QueryList<any>>(1)) &&
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
        const Child = createDirective('child', {exportAs: 'child'});

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
                element(1, 'div', ['child', ''], ['foo', 'child']);
                div = loadElement(1).native;
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], undefined, QUERY_READ_ELEMENT_REF(ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement).toBe(div);
      });

      it('should support reading a mix of ElementRef and directive instances', () => {
        const Child = createDirective('child', {exportAs: 'child'});

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
                element(1, 'div', ['child', ''], ['foo', '', 'bar', 'child']);
                div = loadElement(1).native;
              }
              if (rf & RenderFlags.Update) {
                childInstance = loadDirective(0);
              }
            },
            4, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo', 'bar'], undefined, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(2);
        expect(qList.first.nativeElement).toBe(div);
        expect(qList.last).toBe(childInstance);
      });

      it('should not add results to query if a requested token cant be read', () => {
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
                element(1, 'div', ['foo', '']);
              }
            },
            3, 0, [Child], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], false, Child);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as QueryList<any>);
        expect(qList.length).toBe(0);
      });

    });
  });

  describe('view boundaries', () => {

    describe('ViewContainerRef', () => {

      let directiveInstances: ViewContainerManipulatorDirective[] = [];

      class ViewContainerManipulatorDirective {
        static ngDirectiveDef = defineDirective({
          type: ViewContainerManipulatorDirective,
          selectors: [['', 'vc', '']],
          factory: () => {
            const directiveInstance =
                new ViewContainerManipulatorDirective(directiveInject(ViewContainerRef as any));
            directiveInstances.push(directiveInstance);
            return directiveInstance;
          }
        });

        constructor(private _vcRef: ViewContainerRef) {}

        insertTpl(tpl: TemplateRef<{}>, ctx: {}, idx?: number) {
          this._vcRef.createEmbeddedView(tpl, ctx, idx);
        }

        remove(index?: number) { this._vcRef.remove(index); }
      }

      beforeEach(() => { directiveInstances = []; });

      it('should report results in views inserted / removed by ngIf', () => {

        function Cmpt_Template_1(rf: RenderFlags, ctx1: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', null, ['foo', '']);
          }
        }

        /**
         * <ng-template [ngIf]="value">
         *    <div #foo></div>
         * </ng-template>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                template(1, Cmpt_Template_1, 2, 0, null, ['ngIf', '']);
              }
              if (rf & RenderFlags.Update) {
                elementProperty(1, 'ngIf', bind(ctx.value));
              }
            },
            3, 1, [NgIf], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const fixture = new ComponentFixture(Cmpt);
        const qList = fixture.component.query;
        expect(qList.length).toBe(0);

        fixture.component.value = true;
        fixture.update();
        expect(qList.length).toBe(1);

        fixture.component.value = false;
        fixture.update();
        expect(qList.length).toBe(0);
      });

      it('should report results in views inserted / removed by ngFor', () => {

        function Cmpt_Template_1(rf1: RenderFlags, row: NgForOfContext<string>) {
          if (rf1 & RenderFlags.Create) {
            element(0, 'div', null, ['foo', '']);
          }
          if (rf1 & RenderFlags.Update) {
            elementProperty(0, 'id', bind(row.$implicit));
          }
        }

        /**
         * <ng-template ngFor let-item [ngForOf]="value">
         *    <div #foo [id]="item"></div>
         * </ng-template>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        class Cmpt {
          // TODO(issue/24571): remove '!'.
          value !: string[];
          query: any;
          static ngComponentDef = defineComponent({
            type: Cmpt,
            factory: () => new Cmpt(),
            selectors: [['my-app']],
            consts: 3,
            vars: 1,
            template: function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                template(1, Cmpt_Template_1, 2, 1, null, ['ngForOf', '']);
              }
              if (rf & RenderFlags.Update) {
                elementProperty(1, 'ngForOf', bind(ctx.value));
              }
            },
            viewQuery: function(rf: RenderFlags, ctx: Cmpt) {
              let tmp: any;
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            },
            directives: () => [NgForOf]
          });
        }

        const fixture = new ComponentFixture(Cmpt);
        const qList = fixture.component.query;
        expect(qList.length).toBe(0);

        fixture.component.value = ['a', 'b', 'c'];
        fixture.update();
        expect(qList.length).toBe(3);

        fixture.component.value.splice(1, 1);  // remove "b"
        fixture.update();
        expect(qList.length).toBe(2);

        // make sure that a proper element was removed from query results
        expect(qList.first.nativeElement.id).toBe('a');
        expect(qList.last.nativeElement.id).toBe('c');

      });

      // https://stackblitz.com/edit/angular-rrmmuf?file=src/app/app.component.ts
      it('should report results when different instances of TemplateRef are inserted into one ViewContainerRefs',
         () => {
           let tpl1: TemplateRef<{}>;
           let tpl2: TemplateRef<{}>;

           function Cmpt_Template_1(rf: RenderFlags, ctx: {idx: number}) {
             if (rf & RenderFlags.Create) {
               element(0, 'div', null, ['foo', '']);
             }
             if (rf & RenderFlags.Update) {
               elementProperty(0, 'id', bind('foo1_' + ctx.idx));
             }
           }

           function Cmpt_Template_5(rf: RenderFlags, ctx: {idx: number}) {
             if (rf & RenderFlags.Create) {
               element(0, 'div', null, ['foo', '']);
             }
             if (rf & RenderFlags.Update) {
               elementProperty(0, 'id', bind('foo2_' + ctx.idx));
             }
           }

           /**
            * <ng-template #tpl1 let-idx="idx">
            *   <div #foo [id]="'foo1_'+idx"></div>
            * </ng-template>
            *
            * <div #foo id="middle"></div>
            *
            * <ng-template #tpl2 let-idx="idx">
            *   <div #foo [id]="'foo2_'+idx"></div>
            * </ng-template>
            *
            * <ng-template viewInserter #vi="vi"></ng-template>
            */
           const Cmpt = createComponent(
               'cmpt',
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   template(
                       1, Cmpt_Template_1, 2, 1, null, null, ['tpl1', ''],
                       templateRefExtractor(TemplateRef, ElementRef));
                   element(3, 'div', ['id', 'middle'], ['foo', '']);
                   template(
                       5, Cmpt_Template_5, 2, 1, null, null, ['tpl2', ''],
                       templateRefExtractor(TemplateRef, ElementRef));
                   template(7, null, 0, 0, null, [AttributeMarker.SelectOnly, 'vc']);
                 }

                 if (rf & RenderFlags.Update) {
                   tpl1 = reference(2);
                   tpl2 = reference(6);
                 }

               },
               9, 0, [ViewContainerManipulatorDirective], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   queryRefresh(tmp = load<QueryList<any>>(0)) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               });

           const fixture = new ComponentFixture(Cmpt);
           const qList = fixture.component.query;

           expect(qList.length).toBe(1);
           expect(qList.first.nativeElement.getAttribute('id')).toBe('middle');

           directiveInstances[0].insertTpl(tpl1 !, {idx: 0}, 0);
           directiveInstances[0].insertTpl(tpl2 !, {idx: 1}, 1);
           fixture.update();
           expect(qList.length).toBe(3);
           let qListArr = qList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('middle');
           expect(qListArr[2].nativeElement.getAttribute('id')).toBe('foo2_1');

           directiveInstances[0].insertTpl(tpl1 !, {idx: 1}, 1);
           fixture.update();
           expect(qList.length).toBe(4);
           qListArr = qList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('foo1_1');
           expect(qListArr[2].nativeElement.getAttribute('id')).toBe('middle');
           expect(qListArr[3].nativeElement.getAttribute('id')).toBe('foo2_1');

           directiveInstances[0].remove(1);
           fixture.update();
           expect(qList.length).toBe(3);
           qListArr = qList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('middle');
           expect(qListArr[2].nativeElement.getAttribute('id')).toBe('foo2_1');

           directiveInstances[0].remove(1);
           fixture.update();
           expect(qList.length).toBe(2);
           qListArr = qList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('middle');
         });

      // https://stackblitz.com/edit/angular-7vvo9j?file=src%2Fapp%2Fapp.component.ts
      it('should report results when the same TemplateRef is inserted into different ViewContainerRefs',
         () => {
           let tpl: TemplateRef<{}>;

           function Cmpt_Template_1(rf: RenderFlags, ctx: {idx: number, container_idx: number}) {
             if (rf & RenderFlags.Create) {
               element(0, 'div', null, ['foo', '']);
             }
             if (rf & RenderFlags.Update) {
               elementProperty(0, 'id', bind('foo_' + ctx.container_idx + '_' + ctx.idx));
             }
           }

           /**
            * <ng-template #tpl let-idx="idx" let-container_idx="container_idx">
            *   <div #foo [id]="'foo_'+container_idx+'_'+idx"></div>
            * </ng-template>
            *
            * <ng-template viewInserter #vi1="vi"></ng-template>
            * <ng-template viewInserter #vi2="vi"></ng-template>
            */
           class Cmpt {
             query: any;
             static ngComponentDef = defineComponent({
               type: Cmpt,
               factory: () => new Cmpt(),
               selectors: [['my-app']],
               consts: 5,
               vars: 0,
               template: function(rf: RenderFlags, ctx: any) {
                 let tmp: any;
                 if (rf & RenderFlags.Create) {
                   template(
                       1, Cmpt_Template_1, 2, 1, null, [], ['tpl', ''],
                       templateRefExtractor(TemplateRef, ElementRef));
                   template(3, null, 0, 0, null, [AttributeMarker.SelectOnly, 'vc']);
                   template(4, null, 0, 0, null, [AttributeMarker.SelectOnly, 'vc']);
                 }

                 if (rf & RenderFlags.Update) {
                   tpl = reference(2);
                 }

               },
               viewQuery: (rf: RenderFlags, cmpt: Cmpt) => {
                 let tmp: any;
                 if (rf & RenderFlags.Create) {
                   query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
                 }
                 if (rf & RenderFlags.Update) {
                   queryRefresh(tmp = load<QueryList<any>>(0)) &&
                       (cmpt.query = tmp as QueryList<any>);
                 }
               },
               directives: () => [ViewContainerManipulatorDirective],
             });
           }
           const fixture = new ComponentFixture(Cmpt);
           const qList = fixture.component.query;

           expect(qList.length).toBe(0);

           directiveInstances[0].insertTpl(tpl !, {idx: 0, container_idx: 0}, 0);
           directiveInstances[1].insertTpl(tpl !, {idx: 0, container_idx: 1}, 0);
           fixture.update();
           expect(qList.length).toBe(2);
           let qListArr = qList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo_1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('foo_0_0');

           directiveInstances[0].remove();
           fixture.update();
           expect(qList.length).toBe(1);
           qListArr = qList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo_1_0');

           directiveInstances[1].remove();
           fixture.update();
           expect(qList.length).toBe(0);
         });

      // https://stackblitz.com/edit/angular-wpd6gv?file=src%2Fapp%2Fapp.component.ts
      it('should report results from views inserted in a lifecycle hook', () => {

        function MyApp_Template_1(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'span', ['id', 'from_tpl'], ['foo', '']);
          }
        }

        class MyApp {
          show = false;
          query: any;
          static ngComponentDef = defineComponent({
            type: MyApp,
            factory: () => new MyApp(),
            selectors: [['my-app']],
            consts: 5,
            vars: 1,
            /**
             * <ng-template #tpl><span #foo id="from_tpl"></span></ng-template>
             * <ng-template [ngTemplateOutlet]="show ? tpl : null"></ng-template>
             */
            template: (rf: RenderFlags, myApp: MyApp) => {
              if (rf & RenderFlags.Create) {
                template(
                    1, MyApp_Template_1, 2, 0, undefined, undefined, ['tpl', ''],
                    templateRefExtractor(TemplateRef, ElementRef));
                template(3, null, 0, 0, null, [AttributeMarker.SelectOnly, 'ngTemplateOutlet']);
              }
              if (rf & RenderFlags.Update) {
                const tplRef = reference(2);
                elementProperty(3, 'ngTemplateOutlet', bind(myApp.show ? tplRef : null));
              }
            },
            directives: () => [NgTemplateOutlet],
            viewQuery: (rf: RenderFlags, myApp: MyApp) => {
              let tmp: any;
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                queryRefresh(tmp = load<QueryList<any>>(0)) &&
                    (myApp.query = tmp as QueryList<any>);
              }
            }
          });
        }

        const fixture = new ComponentFixture(MyApp);
        const qList = fixture.component.query;

        expect(qList.length).toBe(0);

        fixture.component.show = true;
        fixture.update();
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement.id).toBe('from_tpl');

        fixture.component.show = false;
        fixture.update();
        expect(qList.length).toBe(0);
      });

    });

    describe('JS blocks', () => {

      it('should report results in embedded views', () => {
        let firstEl;
        /**
         * % if (exp) {
         *    <div #foo></div>
         * % }
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                container(1);
              }
              if (rf & RenderFlags.Update) {
                containerRefreshStart(1);
                {
                  if (ctx.exp) {
                    let rf1 = embeddedViewStart(1, 2, 0);
                    {
                      if (rf1 & RenderFlags.Create) {
                        element(0, 'div', null, ['foo', '']);
                        firstEl = loadElement(0).native;
                      }
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as any);
        expect(qList.length).toBe(0);

        cmptInstance.exp = true;
        detectChanges(cmptInstance);
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement).toBe(firstEl);

        cmptInstance.exp = false;
        detectChanges(cmptInstance);
        expect(qList.length).toBe(0);
      });

      it('should add results from embedded views in the correct order - views and elements mix',
         () => {
           let firstEl, lastEl, viewEl;
           /**
            * <span #foo></span>
            * % if (exp) {
            *    <div #foo></div>
            * % }
            * <span #foo></span>
            * class Cmpt {
            *  @ViewChildren('foo') query;
            * }
            */
           const Cmpt = createComponent(
               'cmpt',
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   element(1, 'span', null, ['foo', '']);
                   firstEl = loadElement(1).native;
                   container(3);
                   element(4, 'span', null, ['foo', '']);
                   lastEl = loadElement(4).native;
                 }
                 if (rf & RenderFlags.Update) {
                   containerRefreshStart(3);
                   {
                     if (ctx.exp) {
                       let rf1 = embeddedViewStart(1, 2, 0);
                       {
                         if (rf1 & RenderFlags.Create) {
                           element(0, 'div', null, ['foo', '']);
                           viewEl = loadElement(0).native;
                         }
                       }
                       embeddedViewEnd();
                     }
                   }
                   containerRefreshEnd();
                 }
               },
               6, 0, [], [],
               function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
                 }
                 if (rf & RenderFlags.Update) {
                   let tmp: any;
                   queryRefresh(tmp = load<QueryList<any>>(0)) &&
                       (ctx.query = tmp as QueryList<any>);
                 }
               });

           const cmptInstance = renderComponent(Cmpt);
           const qList = (cmptInstance.query as any);
           expect(qList.length).toBe(2);
           expect(qList.first.nativeElement).toBe(firstEl);
           expect(qList.last.nativeElement).toBe(lastEl);

           cmptInstance.exp = true;
           detectChanges(cmptInstance);
           expect(qList.length).toBe(3);
           expect(qList.toArray()[0].nativeElement).toBe(firstEl);
           expect(qList.toArray()[1].nativeElement).toBe(viewEl);
           expect(qList.toArray()[2].nativeElement).toBe(lastEl);

           cmptInstance.exp = false;
           detectChanges(cmptInstance);
           expect(qList.length).toBe(2);
           expect(qList.first.nativeElement).toBe(firstEl);
           expect(qList.last.nativeElement).toBe(lastEl);
         });

      it('should add results from embedded views in the correct order - views side by side', () => {
        let firstEl, lastEl;
        /**
         * % if (exp1) {
         *    <div #foo></div>
         * % } if (exp2) {
         *    <span #foo></span>
         * % }
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                container(1);
              }
              if (rf & RenderFlags.Update) {
                containerRefreshStart(1);
                {
                  if (ctx.exp1) {
                    let rf0 = embeddedViewStart(0, 2, 0);
                    {
                      if (rf0 & RenderFlags.Create) {
                        element(0, 'div', null, ['foo', '']);
                        firstEl = loadElement(0).native;
                      }
                    }
                    embeddedViewEnd();
                  }
                  if (ctx.exp2) {
                    let rf1 = embeddedViewStart(1, 2, 0);
                    {
                      if (rf1 & RenderFlags.Create) {
                        element(0, 'span', null, ['foo', '']);
                        lastEl = loadElement(0).native;
                      }
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as any);
        expect(qList.length).toBe(0);

        cmptInstance.exp2 = true;
        detectChanges(cmptInstance);
        expect(qList.length).toBe(1);
        expect(qList.last.nativeElement).toBe(lastEl);

        cmptInstance.exp1 = true;
        detectChanges(cmptInstance);
        expect(qList.length).toBe(2);
        expect(qList.first.nativeElement).toBe(firstEl);
        expect(qList.last.nativeElement).toBe(lastEl);
      });

      it('should add results from embedded views in the correct order - nested views', () => {
        let firstEl, lastEl;
        /**
         * % if (exp1) {
         *    <div #foo></div>
         *    % if (exp2) {
         *      <span #foo></span>
         *    }
         * % }
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                container(1);
              }
              if (rf & RenderFlags.Update) {
                containerRefreshStart(1);
                {
                  if (ctx.exp1) {
                    let rf0 = embeddedViewStart(0, 3, 0);
                    {
                      if (rf0 & RenderFlags.Create) {
                        element(0, 'div', null, ['foo', '']);
                        firstEl = loadElement(0).native;
                        container(2);
                      }
                      if (rf0 & RenderFlags.Update) {
                        containerRefreshStart(2);
                        {
                          if (ctx.exp2) {
                            let rf2 = embeddedViewStart(0, 2, 0);
                            {
                              if (rf2) {
                                element(0, 'span', null, ['foo', '']);
                                lastEl = loadElement(0).native;
                              }
                            }
                            embeddedViewEnd();
                          }
                        }
                        containerRefreshEnd();
                      }
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            },
            2, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const qList = (cmptInstance.query as any);
        expect(qList.length).toBe(0);

        cmptInstance.exp1 = true;
        detectChanges(cmptInstance);
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement).toBe(firstEl);

        cmptInstance.exp2 = true;
        detectChanges(cmptInstance);
        expect(qList.length).toBe(2);
        expect(qList.first.nativeElement).toBe(firstEl);
        expect(qList.last.nativeElement).toBe(lastEl);
      });

      /**
       * What is tested here can't be achieved in the Renderer2 as all view queries are deep by
       * default and can't be marked as shallow by a user.
       */
      it('should support combination of deep and shallow queries', () => {
        /**
         * % if (exp) { ">
         *   <div #foo>
         *     <div #foo></div>
         *   </div>
         * % }
         * <span #foo></span>
         * class Cmpt {
         *  @ViewChildren('foo') deep;
         *  @ViewChildren('foo') shallow;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                container(2);
                element(3, 'span', null, ['foo', '']);
              }
              if (rf & RenderFlags.Update) {
                containerRefreshStart(2);
                {
                  if (ctx.exp) {
                    let rf0 = embeddedViewStart(0, 4, 0);
                    {
                      if (rf0 & RenderFlags.Create) {
                        elementStart(0, 'div', null, ['foo', '']);
                        { element(2, 'div', null, ['foo', '']); }
                        elementEnd();
                      }
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            },
            5, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
                query(1, ['foo'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.deep = tmp as QueryList<any>);
                queryRefresh(tmp = load<QueryList<any>>(1)) &&
                    (ctx.shallow = tmp as QueryList<any>);
              }
            });

        const cmptInstance = renderComponent(Cmpt);
        const deep = (cmptInstance.deep as any);
        const shallow = (cmptInstance.shallow as any);
        expect(deep.length).toBe(1);
        expect(shallow.length).toBe(1);


        cmptInstance.exp = true;
        detectChanges(cmptInstance);
        expect(deep.length).toBe(3);

        // embedded % if blocks should behave the same way as *ngIf, namely they
        // should match shallow queries on the first level of elements underneath
        // the embedded view boundary.
        expect(shallow.length).toBe(2);

        cmptInstance.exp = false;
        detectChanges(cmptInstance);
        expect(deep.length).toBe(1);
        expect(shallow.length).toBe(1);
      });

    });

  });

  describe('observable interface', () => {

    it('should allow observing changes to query list', () => {
      const queryList = new QueryList();
      let changes = 0;

      queryList.changes.subscribe({
        next: (arg) => {
          changes += 1;
          expect(arg).toBe(queryList);
        }
      });

      // initial refresh, the query should be dirty
      queryRefresh(queryList);
      expect(changes).toBe(1);


      // refresh without setting dirty - no emit
      queryRefresh(queryList);
      expect(changes).toBe(1);

      // refresh with setting dirty - emit
      queryList.setDirty();
      queryRefresh(queryList);
      expect(changes).toBe(2);
    });

  });

  describe('queryList', () => {
    it('should be destroyed when the containing view is destroyed', () => {
      let queryInstance: QueryList<any>;

      const SimpleComponentWithQuery = createComponent(
          'some-component-with-query',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              element(1, 'div', null, ['foo', '']);
            }
          },
          2, 0, [], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              query(0, ['foo'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              queryRefresh(tmp = load<QueryList<any>>(0)) &&
                  (ctx.query = queryInstance = tmp as QueryList<any>);
            }
          });

      function createTemplate() { container(0); }

      function updateTemplate() {
        containerRefreshStart(0);
        {
          if (condition) {
            let rf1 = embeddedViewStart(1, 1, 0);
            {
              if (rf1 & RenderFlags.Create) {
                element(0, 'some-component-with-query');
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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

      static ngDirectiveDef = defineDirective({
        type: SomeDir,
        selectors: [['', 'someDir', '']],
        factory: () => new SomeDir(
                     directiveInject(ViewContainerRef as any), directiveInject(TemplateRef as any))
      });
    }

    function AppComponent_Template_1(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'div');
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
            template(
                1, AppComponent_Template_1, 1, 0, null, [AttributeMarker.SelectOnly, 'someDir']);
            element(2, 'div', null, ['foo', '']);
          }
        },
        4, 0, [SomeDir], [],
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            query(0, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
          }
        });

    const fixture = new ComponentFixture(AppComponent);
    expect(fixture.component.query.length).toBe(1);
  });

  describe('content', () => {
    let withContentInstance: WithContentDirective|null;
    let shallowCompInstance: ShallowComp|null;

    beforeEach(() => {
      withContentInstance = null;
      shallowCompInstance = null;
    });

    class WithContentDirective {
      // @ContentChildren('foo')
      foos !: QueryList<ElementRef>;
      contentInitQuerySnapshot = 0;
      contentCheckedQuerySnapshot = 0;

      ngAfterContentInit() { this.contentInitQuerySnapshot = this.foos ? this.foos.length : 0; }

      ngAfterContentChecked() {
        this.contentCheckedQuerySnapshot = this.foos ? this.foos.length : 0;
      }

      static ngComponentDef = defineDirective({
        type: WithContentDirective,
        selectors: [['', 'with-content', '']],
        factory: () => new WithContentDirective(),
        contentQueries: () => {
          registerContentQuery(
              query(null, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef)));
        },
        contentQueriesRefresh: (dirIndex: number, queryStartIdx: number) => {
          let tmp: any;
          withContentInstance = loadDirective<WithContentDirective>(dirIndex);
          queryRefresh(tmp = loadQueryList<ElementRef>(queryStartIdx)) &&
              (withContentInstance.foos = tmp);
        }
      });
    }

    class ShallowComp {
      // @ContentChildren('foo', {descendants: false})
      foos !: QueryList<ElementRef>;

      static ngComponentDef = defineComponent({
        type: ShallowComp,
        selectors: [['shallow-comp']],
        factory: () => new ShallowComp(),
        template: function(rf: RenderFlags, ctx: any) {},
        consts: 0,
        vars: 0,
        contentQueries: () => {
          registerContentQuery(
              query(null, ['foo'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef)));
        },
        contentQueriesRefresh: (dirIndex: number, queryStartIdx: number) => {
          let tmp: any;
          shallowCompInstance = loadDirective<ShallowComp>(dirIndex);
          queryRefresh(tmp = loadQueryList<ElementRef>(queryStartIdx)) &&
              (shallowCompInstance.foos = tmp);
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
          elementStart(0, 'div', [AttributeMarker.SelectOnly, 'with-content']);
          { element(1, 'span', null, ['foo', '']); }
          elementEnd();
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

    it('should support content query matches on directive hosts', () => {
      /**
       * <div with-content #foo>
       * </div>
       */
      const AppComponent = createComponent('app-component', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['with-content', ''], ['foo', '']);
        }
      }, 2, 0, [WithContentDirective]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance !.foos.length)
          .toBe(1, `Expected content query to match <div with-content #foo>.`);
    });

    it('should match shallow content queries in views inserted / removed by ngIf', () => {
      function IfTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', null, ['foo', '']);
        }
      }

      /**
       * <shallow-comp>
       *    <div *ngIf="showing" #foo></div>
       * </shallow-comp>
       */
      const AppComponent = createComponent('app-component', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'shallow-comp');
          { template(1, IfTemplate, 2, 0, null, [AttributeMarker.SelectOnly, 'ngIf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(1, 'ngIf', bind(ctx.showing));
        }
      }, 2, 1, [ShallowComp, NgIf]);

      const fixture = new ComponentFixture(AppComponent);
      const qList = shallowCompInstance !.foos;
      expect(qList.length).toBe(0);

      fixture.component.showing = true;
      fixture.update();
      expect(qList.length).toBe(1);

      fixture.component.showing = false;
      fixture.update();
      expect(qList.length).toBe(0);
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
              elementStart(1, 'div', ['with-content', '']);
              { element(2, 'div', null, ['foo', '']); }
              elementEnd();
              element(4, 'div', ['id', 'after'], ['bar', '']);
            }
          },
          6, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              query(0, ['foo', 'bar'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.foos = tmp as QueryList<any>);
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
              elementStart(1, 'div', ['with-content', '']);
              { element(2, 'div', ['id', 'yes'], ['foo', '']); }
              elementEnd();
              element(4, 'div', null, ['foo', '']);
            }
          },
          6, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              query(0, ['bar'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef));
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.bars = tmp as QueryList<any>);
            }
          });

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance !.foos.length).toBe(1);
      expect(withContentInstance !.foos.first.nativeElement.id).toEqual('yes');
    });

    it('should report results to appropriate queries where deep content queries are nested', () => {
      class QueryDirective {
        fooBars: any;
        static ngDirectiveDef = defineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: 'query',
          factory: () => new QueryDirective(),
          contentQueries: () => {
            // @ContentChildren('foo, bar, baz', {descendants: true}) fooBars:
            // QueryList<ElementRef>;
            registerContentQuery(query(
                null, ['foo', 'bar', 'baz'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef)));
          },
          contentQueriesRefresh: (dirIndex: number, queryStartIdx: number) => {
            let tmp: any;
            const instance = loadDirective<QueryDirective>(dirIndex);
            queryRefresh(tmp = loadQueryList<ElementRef>(queryStartIdx)) &&
                (instance.fooBars = tmp);
          },
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
              elementStart(0, 'div', [AttributeMarker.SelectOnly, 'query'], ['out', 'query']);
              {
                element(2, 'span', ['id', 'foo'], ['foo', '']);
                elementStart(4, 'div', [AttributeMarker.SelectOnly, 'query'], ['in', 'query']);
                { element(6, 'span', ['id', 'bar'], ['bar', '']); }
                elementEnd();
                element(8, 'span', ['id', 'baz'], ['baz', '']);
              }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              outInstance = load<QueryDirective>(1);
              inInstance = load<QueryDirective>(5);
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
        static ngDirectiveDef = defineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: 'query',
          factory: () => new QueryDirective(),
          contentQueries: () => {
            // @ContentChildren('foo, bar, baz', {descendants: true}) fooBars:
            // QueryList<ElementRef>;
            registerContentQuery(
                query(null, ['foo'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef)));
          },
          contentQueriesRefresh: (dirIndex: number, queryStartIdx: number) => {
            let tmp: any;
            const instance = loadDirective<QueryDirective>(dirIndex);
            queryRefresh(tmp = loadQueryList<ElementRef>(queryStartIdx)) &&
                (instance.fooBars = tmp);
          },
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
              elementStart(0, 'div', ['query', ''], ['out', 'query']);
              {
                elementStart(2, 'div', ['query', ''], ['in', 'query', 'foo', '']);
                { element(5, 'span', ['id', 'bar'], ['foo', '']); }
                elementEnd();
              }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              outInstance = load<QueryDirective>(1);
              inInstance = load<QueryDirective>(3);
            }
          },
          7, 0, [QueryDirective]);

      const fixture = new ComponentFixture(AppComponent);
      expect(outInstance !.fooBars.length).toBe(1);
      expect(inInstance !.fooBars.length).toBe(2);
    });

    it('should respect shallow flag on content queries when mixing deep and shallow queries',
       () => {
         class ShallowQueryDirective {
           foos: any;
           static ngDirectiveDef = defineDirective({
             type: ShallowQueryDirective,
             selectors: [['', 'shallow-query', '']],
             exportAs: 'shallow-query',
             factory: () => new ShallowQueryDirective(),
             contentQueries: () => {
               // @ContentChildren('foo', {descendants: false}) foos: QueryList<ElementRef>;
               registerContentQuery(
                   query(null, ['foo'], false, QUERY_READ_FROM_NODE(TemplateRef, ElementRef)));
             },
             contentQueriesRefresh: (dirIndex: number, queryStartIdx: number) => {
               let tmp: any;
               const instance = loadDirective<ShallowQueryDirective>(dirIndex);
               queryRefresh(tmp = loadQueryList<ElementRef>(queryStartIdx)) &&
                   (instance.foos = tmp);
             },
           });
         }

         class DeepQueryDirective {
           foos: any;
           static ngDirectiveDef = defineDirective({
             type: DeepQueryDirective,
             selectors: [['', 'deep-query', '']],
             exportAs: 'deep-query',
             factory: () => new DeepQueryDirective(),
             contentQueries: () => {
               // @ContentChildren('foo', {descendants: false}) foos: QueryList<ElementRef>;
               registerContentQuery(
                   query(null, ['foo'], true, QUERY_READ_FROM_NODE(TemplateRef, ElementRef)));
             },
             contentQueriesRefresh: (dirIndex: number, queryStartIdx: number) => {
               let tmp: any;
               const instance = loadDirective<DeepQueryDirective>(dirIndex);
               queryRefresh(tmp = loadQueryList<ElementRef>(queryStartIdx)) &&
                   (instance.foos = tmp);
             },
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
                 elementStart(
                     0, 'div', [AttributeMarker.SelectOnly, 'shallow-query', 'deep-query'],
                     ['shallow', 'shallow-query', 'deep', 'deep-query']);
                 {
                   element(3, 'span', null, ['foo', '']);
                   elementStart(5, 'div');
                   { element(6, 'span', null, ['foo', '']); }
                   elementEnd();
                 }
                 elementEnd();
               }
               if (rf & RenderFlags.Update) {
                 shallowInstance = load<ShallowQueryDirective>(1);
                 deepInstance = load<DeepQueryDirective>(2);
               }
             },
             8, 0, [ShallowQueryDirective, DeepQueryDirective]);

         const fixture = new ComponentFixture(AppComponent);
         expect(shallowInstance !.foos.length).toBe(1);
         expect(deepInstance !.foos.length).toBe(2);
       });
  });
});
