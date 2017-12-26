/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {C, D, E, Q, QueryList, c, e, m, qR} from '../../src/render3/index';
import {QueryReadType} from '../../src/render3/interfaces';

import {createComponent, renderComponent} from './render_util';


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
    const Child = createComponent('child', function(ctx: any, cm: boolean) {});

    let child1 = null;
    let child2 = null;
    const Cmp = createComponent('cmp', function(ctx: any, cm: boolean) {
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
      if (cm) {
        m(0, Q(Child, false));
        m(1, Q(Child, true));
        E(2, Child.ngComponentDef);
        {
          child1 = D(3, Child.ngComponentDef.n(), Child.ngComponentDef);
          E(4, Child.ngComponentDef);
          { child2 = D(5, Child.ngComponentDef.n(), Child.ngComponentDef); }
          e();
        }
        e();
      }
      qR(tmp = m<QueryList<any>>(0)) && (ctx.query0 = tmp as QueryList<any>);
      qR(tmp = m<QueryList<any>>(1)) && (ctx.query1 = tmp as QueryList<any>);
    });

    const parent = renderComponent(Cmp);
    expect((parent.query0 as QueryList<any>).toArray()).toEqual([child1]);
    expect((parent.query1 as QueryList<any>).toArray()).toEqual([child1, child2]);
  });

  describe('local names', () => {

    it('should query for a single element and read ElementRef', () => {

      let elToQuery;
      /**
       * <div #foo></div>
       * <div></div>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo']));
          elToQuery = E(1, 'div', [], 'foo');
          e();
          E(2, 'div');
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(query.first.nativeElement).toEqual(elToQuery);
    });

    it('should query for multiple elements and read ElementRef', () => {

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
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo', 'bar']));
          el1ToQuery = E(1, 'div', null, 'foo');
          e();
          E(2, 'div');
          e();
          el2ToQuery = E(3, 'div', null, 'bar');
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(2);
      expect(query.first.nativeElement).toEqual(el1ToQuery);
      expect(query.last.nativeElement).toEqual(el2ToQuery);
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
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo'], false, QueryReadType.ElementRef));
          elToQuery = E(1, 'div', [], 'foo');
          e();
          E(2, 'div');
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(isElementRef(query.first)).toBeTruthy();
      expect(query.first.nativeElement).toEqual(elToQuery);
    });

    it('should read ViewContainerRef from element nodes when explicitly asked for', () => {
      /**
       * <div #foo></div>
       * class Cmpt {
       *  @ViewChildren('foo', {read: ViewContainerRef}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo'], false, QueryReadType.ViewContainerRef));
          E(1, 'div', [], 'foo');
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(isViewContainerRef(query.first)).toBeTruthy();
    });

    it('should read ViewContainerRef from container nodes when explicitly asked for', () => {
      /**
       * <ng-template #foo></ng-template>
       * class Cmpt {
       *  @ViewChildren('foo', {read: ViewContainerRef}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo'], false, QueryReadType.ViewContainerRef));
          C(1, undefined, undefined, undefined, 'foo');
          c();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(isViewContainerRef(query.first)).toBeTruthy();
    });

    it('should read ElementRef with a native element pointing to comment DOM node from containers',
       () => {
         /**
          * <ng-template #foo></ng-template>
          * class Cmpt {
          *  @ViewChildren('foo', {read: ElementRef}) query;
          * }
          */
         const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
           let tmp: any;
           if (cm) {
             m(0, Q(['foo'], false, QueryReadType.ElementRef));
             C(1, undefined, undefined, undefined, 'foo');
             c();
           }
           qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
         });

         const cmptInstance = renderComponent(Cmpt);
         const query = (cmptInstance.query as QueryList<any>);
         expect(query.length).toBe(1);
         expect(isElementRef(query.first)).toBeTruthy();
         expect(query.first.nativeElement.nodeType).toBe(8);  // Node.COMMENT_NODE = 8
       });

    it('should read TemplateRef from container nodes by default', () => {
      // http://plnkr.co/edit/BVpORly8wped9I3xUYsX?p=preview
      /**
       * <ng-template #foo></ng-template>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo']));
          C(1, undefined, undefined, undefined, 'foo');
          c();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(isTemplateRef(query.first)).toBeTruthy();
    });


    it('should read TemplateRef from container nodes when explicitly asked for', () => {
      /**
       * <ng-template #foo></ng-template>
       * class Cmpt {
       *  @ViewChildren('foo', {read: TemplateRef}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo'], false, QueryReadType.TemplateRef));
          C(1, undefined, undefined, undefined, 'foo');
          c();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(isTemplateRef(query.first)).toBeTruthy();
    });

  });
});
