/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';

import {QUERY_READ_CONTAINER_REF, QUERY_READ_ELEMENT_REF, QUERY_READ_FROM_NODE, QUERY_READ_TEMPLATE_REF} from '../../src/render3/di';
import {QueryList, defineComponent, detectChanges} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, load, loadDirective} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {query, queryRefresh} from '../../src/render3/query';

import {NgForOf, NgIf} from './common_with_def';
import {ComponentFixture, createComponent, createDirective, renderComponent} from './render_util';


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
  it('should project query children', () => {
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {});

    let child1 = null;
    let child2 = null;
    const Cmp = createComponent('cmp', function(rf: RenderFlags, ctx: any) {
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
      let tmp: any;
      if (rf & RenderFlags.Create) {
        query(0, Child, false);
        query(1, Child, true);
        elementStart(2, 'child');
        {
          child1 = loadDirective(0);
          elementStart(3, 'child');
          { child2 = loadDirective(1); }
          elementEnd();
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query0 = tmp as QueryList<any>);
        queryRefresh(tmp = load<QueryList<any>>(1)) && (ctx.query1 = tmp as QueryList<any>);
      }
    }, [Child]);

    const parent = renderComponent(Cmp);
    expect((parent.query0 as QueryList<any>).toArray()).toEqual([child1]);
    expect((parent.query1 as QueryList<any>).toArray()).toEqual([child1, child2]);
  });

  describe('types predicate', () => {

    it('should query using type predicate and read a specified token', () => {
      const Child = createDirective('child');
      let elToQuery;
      /**
       * <div child></div>
       * class Cmpt {
       *  @ViewChildren(Child, {read: ElementRef}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, Child, false, QUERY_READ_ELEMENT_REF);
          elToQuery = elementStart(1, 'div', ['child', '']);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child]);

      const cmptInstance = renderComponent(Cmpt);
      const qList = (cmptInstance.query as QueryList<any>);
      expect(qList.length).toBe(1);
      expect(isElementRef(qList.first)).toBeTruthy();
      expect(qList.first.nativeElement).toEqual(elToQuery);
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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, Child, false, OtherChild);
          elementStart(1, 'div', ['child', '', 'otherChild', '']);
          { otherChildInstance = loadDirective(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child, OtherChild]);

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, Child, false, OtherChild);
          elementStart(1, 'div', ['child', '']);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child, OtherChild]);

      const cmptInstance = renderComponent(Cmpt);
      const qList = (cmptInstance.query as QueryList<any>);
      expect(qList.length).toBe(0);
    });
  });

  describe('local names predicate', () => {

    it('should query for a single element and read ElementRef by default', () => {

      let elToQuery;
      /**
       * <div #foo></div>
       * <div></div>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], false, QUERY_READ_FROM_NODE);
          elToQuery = elementStart(1, 'div', null, ['foo', '']);
          elementEnd();
          elementStart(3, 'div');
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], false, QUERY_READ_FROM_NODE);
          query(1, ['bar'], false, QUERY_READ_FROM_NODE);
          elToQuery = elementStart(2, 'div', null, ['foo', '', 'bar', '']);
          elementEnd();
          elementStart(5, 'div');
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.fooQuery = tmp as QueryList<any>);
          queryRefresh(tmp = load<QueryList<any>>(1)) && (ctx.barQuery = tmp as QueryList<any>);
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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo', 'bar'], undefined, QUERY_READ_FROM_NODE);
          el1ToQuery = elementStart(1, 'div', null, ['foo', '']);
          elementEnd();
          elementStart(3, 'div');
          elementEnd();
          el2ToQuery = elementStart(4, 'div', null, ['bar', '']);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], false, QUERY_READ_ELEMENT_REF);
          elToQuery = elementStart(1, 'div', null, ['foo', '']);
          elementEnd();
          elementStart(3, 'div');
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      });

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], false, QUERY_READ_CONTAINER_REF);
          elementStart(1, 'div', null, ['foo', '']);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], false, QUERY_READ_CONTAINER_REF);
          container(1, undefined, undefined, undefined, ['foo', '']);
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      });

      const cmptInstance = renderComponent(Cmpt);
      const qList = (cmptInstance.query as QueryList<any>);
      expect(qList.length).toBe(1);
      expect(isViewContainerRef(qList.first)).toBeTruthy();
    });

    it('should no longer read ElementRef with a native element pointing to comment DOM node from containers',
       () => {
         /**
          * <ng-template #foo></ng-template>
          * class Cmpt {
          *  @ViewChildren('foo', {read: ElementRef}) query;
          * }
          */
         const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
           let tmp: any;
           if (rf & RenderFlags.Create) {
             query(0, ['foo'], false, QUERY_READ_ELEMENT_REF);
             container(1, undefined, undefined, undefined, ['foo', '']);
           }
           if (rf & RenderFlags.Update) {
             queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
           }
         });

         const cmptInstance = renderComponent(Cmpt);
         const qList = (cmptInstance.query as QueryList<any>);
         expect(qList.length).toBe(1);
         expect(qList.first.nativeElement).toBe(null);
       });

    it('should read TemplateRef from container nodes by default', () => {
      // http://plnkr.co/edit/BVpORly8wped9I3xUYsX?p=preview
      /**
       * <ng-template #foo></ng-template>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], undefined, QUERY_READ_FROM_NODE);
          container(1, undefined, undefined, undefined, ['foo', '']);
        }
        if (rf & RenderFlags.Update) {
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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], false, QUERY_READ_TEMPLATE_REF);
          container(1, undefined, undefined, undefined, ['foo', '']);
        }
        if (rf & RenderFlags.Update) {
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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], true, QUERY_READ_FROM_NODE);
          elementStart(1, 'child', null, ['foo', '']);
          { childInstance = loadDirective(0); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child]);

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], true, QUERY_READ_FROM_NODE);
          elementStart(1, 'child', null, ['foo', 'child']);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child]);

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
         const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
           let tmp: any;
           if (rf & RenderFlags.Create) {
             query(0, ['foo'], true, QUERY_READ_FROM_NODE);
             elementStart(1, 'div', ['child', ''], ['foo', 'child']);
             childInstance = loadDirective(0);
             elementEnd();
           }
           if (rf & RenderFlags.Update) {
             queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
           }
         }, [Child]);

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo', 'bar'], true, QUERY_READ_FROM_NODE);
          elementStart(1, 'div', ['child1', '', 'child2', ''], ['foo', 'child1', 'bar', 'child2']);
          {
            child1Instance = loadDirective(0);
            child2Instance = loadDirective(1);
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child1, Child2]);

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], true, QUERY_READ_FROM_NODE);
          query(1, ['bar'], true, QUERY_READ_FROM_NODE);
          elementStart(2, 'div', ['child', ''], ['foo', 'child', 'bar', 'child']);
          { childInstance = loadDirective(0); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.fooQuery = tmp as QueryList<any>);
          queryRefresh(tmp = load<QueryList<any>>(1)) && (ctx.barQuery = tmp as QueryList<any>);
        }
      }, [Child]);

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], undefined, QUERY_READ_ELEMENT_REF);
          div = elementStart(1, 'div', ['child', ''], ['foo', 'child']);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child]);

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo', 'bar'], undefined, QUERY_READ_FROM_NODE);
          div = elementStart(1, 'div', ['child', ''], ['foo', '', 'bar', 'child']);
          { childInstance = loadDirective(0); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child]);

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
      const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
        let tmp: any;
        if (rf & RenderFlags.Create) {
          query(0, ['foo'], false, Child);
          elementStart(1, 'div', ['foo', '']);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
        }
      }, [Child]);

      const cmptInstance = renderComponent(Cmpt);
      const qList = (cmptInstance.query as QueryList<any>);
      expect(qList.length).toBe(0);
    });

  });

  describe('view boundaries', () => {

    describe('ViewContainerRef', () => {

      it('should report results in views inserted / removed by ngIf', () => {

        /**
         * <ng-template [ngIf]="value">
         *    <div #foo></div>
         * </ng-template>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
          let tmp: any;
          if (rf & RenderFlags.Create) {
            query(0, ['foo'], true, QUERY_READ_FROM_NODE);
            container(1, (rf1: RenderFlags, ctx1: any) => {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'div', null, ['foo', '']);
                elementEnd();
              }
            }, null, ['ngIf', '']);
          }
          if (rf & RenderFlags.Update) {
            elementProperty(1, 'ngIf', bind(ctx.value));
            queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
          }
        }, [NgIf]);

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

        /**
         * <ng-template ngFor let-item [ngForOf]="value">
         *    <div #foo [id]="item"></div>
         * </ng-template>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
          let tmp: any;
          if (rf & RenderFlags.Create) {
            query(0, ['foo'], true, QUERY_READ_FROM_NODE);
            container(1, (rf1: RenderFlags, row: NgForOfContext<string>) => {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'div', null, ['foo', '']);
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'id', bind(row.$implicit));
              }
            }, null, ['ngForOf', '']);
          }
          if (rf & RenderFlags.Update) {
            elementProperty(1, 'ngForOf', bind(ctx.value));
            queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
          }
        }, [NgForOf]);

        const fixture = new ComponentFixture(Cmpt);
        const qList = fixture.component.query;
        expect(qList.length).toBe(0);

        fixture.component.value = ['a', 'b', 'c'];
        fixture.update();
        fixture
            .update();  // invoking CD twice due to https://github.com/angular/angular/issues/23707
        expect(qList.length).toBe(3);

        fixture.component.value.splice(1, 1);  // remove "b"
        fixture.update();
        fixture
            .update();  // invoking CD twice due to https://github.com/angular/angular/issues/23707
        expect(qList.length).toBe(2);

        // make sure that a proper element was removed from query results
        expect(qList.first.nativeElement.id).toBe('a');
        expect(qList.last.nativeElement.id).toBe('c');

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
        const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
          let tmp: any;
          if (rf & RenderFlags.Create) {
            query(0, ['foo'], true, QUERY_READ_FROM_NODE);
            container(1);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(1);
            {
              if (ctx.exp) {
                let rf1 = embeddedViewStart(1);
                {
                  if (rf1 & RenderFlags.Create) {
                    firstEl = elementStart(0, 'div', null, ['foo', '']);
                    elementEnd();
                  }
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
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
           const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
             let tmp: any;
             if (rf & RenderFlags.Create) {
               query(0, ['foo'], true, QUERY_READ_FROM_NODE);
               firstEl = elementStart(1, 'span', null, ['foo', '']);
               elementEnd();
               container(3);
               lastEl = elementStart(4, 'span', null, ['foo', '']);
               elementEnd();
             }
             if (rf & RenderFlags.Update) {
               containerRefreshStart(3);
               {
                 if (ctx.exp) {
                   let rf1 = embeddedViewStart(1);
                   {
                     if (rf1 & RenderFlags.Create) {
                       viewEl = elementStart(0, 'div', null, ['foo', '']);
                       elementEnd();
                     }
                   }
                   embeddedViewEnd();
                 }
               }
               containerRefreshEnd();
               queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
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
        const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
          let tmp: any;
          if (rf & RenderFlags.Create) {
            query(0, ['foo'], true, QUERY_READ_FROM_NODE);
            container(1);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(1);
            {
              if (ctx.exp1) {
                let rf0 = embeddedViewStart(0);
                {
                  if (rf0 & RenderFlags.Create) {
                    firstEl = elementStart(0, 'div', null, ['foo', '']);
                    elementEnd();
                  }
                }
                embeddedViewEnd();
              }
              if (ctx.exp2) {
                let rf1 = embeddedViewStart(1);
                {
                  if (rf1 & RenderFlags.Create) {
                    lastEl = elementStart(0, 'span', null, ['foo', '']);
                    elementEnd();
                  }
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
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
        const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
          let tmp: any;
          if (rf & RenderFlags.Create) {
            query(0, ['foo'], true, QUERY_READ_FROM_NODE);
            container(1);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(1);
            {
              if (ctx.exp1) {
                let rf0 = embeddedViewStart(0);
                {
                  if (rf0 & RenderFlags.Create) {
                    firstEl = elementStart(0, 'div', null, ['foo', '']);
                    elementEnd();
                    container(2);
                  }
                  if (rf0 & RenderFlags.Update) {
                    containerRefreshStart(2);
                    {
                      if (ctx.exp2) {
                        let rf2 = embeddedViewStart(0);
                        {
                          if (rf2) {
                            lastEl = elementStart(0, 'span', null, ['foo', '']);
                            elementEnd();
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

      it('should support combination of deep and shallow queries', () => {
        /**
         * <ng-template [ngIf]="exp">
         *    <div #foo></div>
         * </ng-template>
         * <span #foo></span>
         * class Cmpt {
         *  @ViewChildren('foo') query;
         * }
         */
        const Cmpt = createComponent('cmpt', function(rf: RenderFlags, ctx: any) {
          let tmp: any;
          if (rf & RenderFlags.Create) {
            query(0, ['foo'], true, QUERY_READ_FROM_NODE);
            query(1, ['foo'], false, QUERY_READ_FROM_NODE);
            container(2);
            elementStart(3, 'span', null, ['foo', '']);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(2);
            {
              if (ctx.exp) {
                let rf0 = embeddedViewStart(0);
                {
                  if (rf0 & RenderFlags.Create) {
                    elementStart(0, 'div', null, ['foo', '']);
                    elementEnd();
                  }
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
            queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.deep = tmp as QueryList<any>);
            queryRefresh(tmp = load<QueryList<any>>(1)) && (ctx.shallow = tmp as QueryList<any>);
          }
        });

        const cmptInstance = renderComponent(Cmpt);
        const deep = (cmptInstance.deep as any);
        const shallow = (cmptInstance.shallow as any);
        expect(deep.length).toBe(1);
        expect(shallow.length).toBe(1);


        cmptInstance.exp = true;
        detectChanges(cmptInstance);
        expect(deep.length).toBe(2);
        expect(shallow.length).toBe(1);

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
});
