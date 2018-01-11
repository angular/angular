/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {C, E, Q, QueryList, e, m, qR} from '../../src/render3/index';
import {QueryReadType} from '../../src/render3/interfaces/query';

import {createComponent, createDirective, renderComponent} from './render_util';


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
        E(2, Child);
        {
          child1 = m(3);
          E(4, Child);
          { child2 = m(5); }
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

  describe('types predicate', () => {

    it('should query using type predicate and read a specified token', () => {
      const Child = createDirective();
      let elToQuery;
      /**
       * <div child></div>
       * class Cmpt {
       *  @ViewChildren(Child, {read: ElementRef}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(Child, false, QueryReadType.ElementRef));
          elToQuery = E(1, 'div', null, [Child]);
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


    it('should query using type predicate and read another directive type', () => {
      const Child = createDirective();
      const OtherChild = createDirective();
      let otherChildInstance;
      /**
       * <div child otherChild></div>
       * class Cmpt {
       *  @ViewChildren(Child, {read: OtherChild}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(Child, false, OtherChild));
          E(1, 'div', null, [Child, OtherChild]);
          { otherChildInstance = m(3); }
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(query.first).toBe(otherChildInstance);
    });

    it('should not add results to query if a requested token cant be read', () => {
      const Child = createDirective();
      const OtherChild = createDirective();
      /**
       * <div child></div>
       * class Cmpt {
       *  @ViewChildren(Child, {read: OtherChild}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(Child, false, OtherChild));
          E(1, 'div', null, [Child]);
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(0);
    });
  });

  describe('local names predicate', () => {

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
          elToQuery = E(1, 'div', null, null, ['foo', '']);
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
          el1ToQuery = E(1, 'div', null, null, ['foo', '']);
          e();
          E(2, 'div');
          e();
          el2ToQuery = E(3, 'div', null, null, ['bar', '']);
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
          elToQuery = E(1, 'div', null, null, ['foo', '']);
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
          E(1, 'div', null, null, ['foo', '']);
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
          C(1, undefined, undefined, undefined, undefined, ['foo', '']);
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
             C(1, undefined, undefined, undefined, undefined, ['foo', '']);
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
          C(1, undefined, undefined, undefined, undefined, ['foo', '']);
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
          C(1, undefined, undefined, undefined, undefined, ['foo', '']);
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(isTemplateRef(query.first)).toBeTruthy();
    });

    it('should read component instance if element queried for is a component host', () => {
      const Child = createComponent('child', function(ctx: any, cm: boolean) {});

      let childInstance;
      /**
       * <cmpt #foo></cmpt>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo']));
          E(1, Child, null, null, ['foo', '']);
          { childInstance = m(2); }
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(query.first).toBe(childInstance);
    });

    it('should read directive instance if element queried for has an exported directive with a matching name',
       () => {
         const Child = createDirective({exportAs: 'child'});

         let childInstance;
         /**
          * <div #foo="child" child></div>
          * class Cmpt {
          *  @ViewChildren('foo') query;
          * }
          */
         const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
           let tmp: any;
           if (cm) {
             m(0, Q(['foo']));
             E(1, 'div', null, [Child], ['foo', 'child']);
             childInstance = m(2);
             e();
           }
           qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
         });

         const cmptInstance = renderComponent(Cmpt);
         const query = (cmptInstance.query as QueryList<any>);
         expect(query.length).toBe(1);
         expect(query.first).toBe(childInstance);
       });

    it('should read all matching directive instances from a given element', () => {
      const Child1 = createDirective({exportAs: 'child1'});
      const Child2 = createDirective({exportAs: 'child2'});

      let child1Instance, child2Instance;
      /**
       * <div #foo="child1" child1 #bar="child2" child2></div>
       * class Cmpt {
       *  @ViewChildren('foo, bar') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo', 'bar']));
          E(1, 'div', null, [Child1, Child2], ['foo', 'child1', 'bar', 'child2']);
          {
            child1Instance = m(2);
            child2Instance = m(3);
          }
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(2);
      expect(query.first).toBe(child1Instance);
      expect(query.last).toBe(child2Instance);
    });

    it('should match match on exported directive name and read a requested token', () => {
      const Child = createDirective({exportAs: 'child'});

      let div;
      /**
       * <div #foo="child" child></div>
       * class Cmpt {
       *  @ViewChildren('foo', {read: ElementRef}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo'], undefined, QueryReadType.ElementRef));
          div = E(1, 'div', null, [Child], ['foo', 'child']);
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(query.first.nativeElement).toBe(div);
    });

    it('should support reading a mix of ElementRef and directive instances', () => {
      const Child = createDirective({exportAs: 'child'});

      let childInstance, div;
      /**
       * <div #foo #bar="child" child></div>
       * class Cmpt {
       *  @ViewChildren('foo, bar') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo', 'bar']));
          div = E(1, 'div', null, [Child], ['foo', '', 'bar', 'child']);
          { childInstance = m(2); }
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(2);
      expect(query.first.nativeElement).toBe(div);
      expect(query.last).toBe(childInstance);
    });

    it('should not add results to query if a requested token cant be read', () => {
      const Child = createDirective();

      let childInstance, div;
      /**
       * <div #foo></div>
       * class Cmpt {
       *  @ViewChildren('foo', {read: Child}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          m(0, Q(['foo'], false, Child));
          div = E(1, 'div', null, null, ['foo', '']);
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(0);
    });

  });
});
