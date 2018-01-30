/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {QUERY_READ_CONTAINER_REF, QUERY_READ_ELEMENT_REF, QUERY_READ_FROM_NODE, QUERY_READ_TEMPLATE_REF} from '../../src/render3/di';
import {C, E, Q, QueryList, V, cR, cr, detectChanges, e, m, qR, v} from '../../src/render3/index';

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
        Q(0, Child, false);
        Q(1, Child, true);
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
          Q(0, Child, false, QUERY_READ_ELEMENT_REF);
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
          Q(0, Child, false, OtherChild);
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
          Q(0, Child, false, OtherChild);
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

    it('should query for a single element and read ElementRef by default', () => {

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
          Q(0, ['foo'], false, QUERY_READ_FROM_NODE);
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
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          Q(0, ['foo', 'bar'], undefined, QUERY_READ_FROM_NODE);
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
          Q(0, ['foo'], false, QUERY_READ_ELEMENT_REF);
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
          Q(0, ['foo'], false, QUERY_READ_CONTAINER_REF);
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
          Q(0, ['foo'], false, QUERY_READ_CONTAINER_REF);
          C(1, undefined, undefined, undefined, undefined, ['foo', '']);
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(1);
      expect(isViewContainerRef(query.first)).toBeTruthy();
    });

    it('should no longer read ElementRef with a native element pointing to comment DOM node from containers',
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
             Q(0, ['foo'], false, QUERY_READ_ELEMENT_REF);
             C(1, undefined, undefined, undefined, undefined, ['foo', '']);
           }
           qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
         });

         const cmptInstance = renderComponent(Cmpt);
         const query = (cmptInstance.query as QueryList<any>);
         expect(query.length).toBe(1);
         expect(query.first.nativeElement).toBe(null);
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
          Q(0, ['foo'], undefined, QUERY_READ_FROM_NODE);
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
          Q(0, ['foo'], false, QUERY_READ_TEMPLATE_REF);
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
          Q(0, ['foo'], true, QUERY_READ_FROM_NODE);
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
             Q(0, ['foo'], true, QUERY_READ_FROM_NODE);
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
          Q(0, ['foo', 'bar'], true, QUERY_READ_FROM_NODE);
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
          Q(0, ['foo'], undefined, QUERY_READ_ELEMENT_REF);
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
          Q(0, ['foo', 'bar'], undefined, QUERY_READ_FROM_NODE);
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

      /**
       * <div #foo></div>
       * class Cmpt {
       *  @ViewChildren('foo', {read: Child}) query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          Q(0, ['foo'], false, Child);
          E(1, 'div', null, null, ['foo', '']);
          e();
        }
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as QueryList<any>);
      expect(query.length).toBe(0);
    });

  });

  describe('view boundaries', () => {

    it('should report results in embedded views', () => {
      let firstEl;
      /**
       * <ng-template [ngIf]="exp">
       *    <div #foo></div>
       * </ng-template>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          Q(0, ['foo'], true, QUERY_READ_FROM_NODE);
          C(1);
        }
        cR(1);
        {
          if (ctx.exp) {
            let cm1 = V(1);
            {
              if (cm1) {
                firstEl = E(0, 'div', null, null, ['foo', '']);
                e();
              }
            }
            v();
          }
        }
        cr();
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as any);
      expect(query.length).toBe(0);

      cmptInstance.exp = true;
      detectChanges(cmptInstance);
      expect(query.length).toBe(1);
      expect(query.first.nativeElement).toBe(firstEl);

      cmptInstance.exp = false;
      detectChanges(cmptInstance);
      expect(query.length).toBe(0);
    });

    it('should add results from embedded views in the correct order - views and elements mix',
       () => {
         let firstEl, lastEl, viewEl;
         /**
          * <span #foo></span>
          * <ng-template [ngIf]="exp">
          *    <div #foo></div>
          * </ng-template>
          * <span #foo></span>
          * class Cmpt {
          *  @ViewChildren('foo') query;
          * }
          */
         const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
           let tmp: any;
           if (cm) {
             Q(0, ['foo'], true, QUERY_READ_FROM_NODE);
             firstEl = E(1, 'b', null, null, ['foo', '']);
             e();
             C(2);
             lastEl = E(3, 'i', null, null, ['foo', '']);
             e();
           }
           cR(2);
           {
             if (ctx.exp) {
               let cm1 = V(1);
               {
                 if (cm1) {
                   viewEl = E(0, 'div', null, null, ['foo', '']);
                   e();
                 }
               }
               v();
             }
           }
           cr();
           qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
         });

         const cmptInstance = renderComponent(Cmpt);
         const query = (cmptInstance.query as any);
         expect(query.length).toBe(2);
         expect(query.first.nativeElement).toBe(firstEl);
         expect(query.last.nativeElement).toBe(lastEl);

         cmptInstance.exp = true;
         detectChanges(cmptInstance);
         expect(query.length).toBe(3);
         expect(query.toArray()[0].nativeElement).toBe(firstEl);
         expect(query.toArray()[1].nativeElement).toBe(viewEl);
         expect(query.toArray()[2].nativeElement).toBe(lastEl);

         cmptInstance.exp = false;
         detectChanges(cmptInstance);
         expect(query.length).toBe(2);
         expect(query.first.nativeElement).toBe(firstEl);
         expect(query.last.nativeElement).toBe(lastEl);
       });

    it('should add results from embedded views in the correct order - views side by side', () => {
      let firstEl, lastEl;
      /**
       * <ng-template [ngIf]="exp1">
       *    <div #foo></div>
       * </ng-template>
       * <ng-template [ngIf]="exp2">
       *    <span #foo></span>
       * </ng-template>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          Q(0, ['foo'], true, QUERY_READ_FROM_NODE);
          C(1);
        }
        cR(1);
        {
          if (ctx.exp1) {
            let cm1 = V(0);
            {
              if (cm1) {
                firstEl = E(0, 'div', null, null, ['foo', '']);
                e();
              }
            }
            v();
          }
          if (ctx.exp2) {
            let cm1 = V(1);
            {
              if (cm1) {
                lastEl = E(0, 'span', null, null, ['foo', '']);
                e();
              }
            }
            v();
          }
        }
        cr();
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as any);
      expect(query.length).toBe(0);

      cmptInstance.exp2 = true;
      detectChanges(cmptInstance);
      expect(query.length).toBe(1);
      expect(query.last.nativeElement).toBe(lastEl);

      cmptInstance.exp1 = true;
      detectChanges(cmptInstance);
      expect(query.length).toBe(2);
      expect(query.first.nativeElement).toBe(firstEl);
      expect(query.last.nativeElement).toBe(lastEl);
    });

    it('should add results from embedded views in the correct order - nested views', () => {
      let firstEl, lastEl;
      /**
       * <ng-template [ngIf]="exp1">
       *    <div #foo></div>
       *    <ng-template [ngIf]="exp2">
       *      <span #foo></span>
       *    </ng-template>
       * </ng-template>
       * class Cmpt {
       *  @ViewChildren('foo') query;
       * }
       */
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          Q(0, ['foo'], true, QUERY_READ_FROM_NODE);
          C(1);
        }
        cR(1);
        {
          if (ctx.exp1) {
            let cm1 = V(0);
            {
              if (cm1) {
                firstEl = E(0, 'div', null, null, ['foo', '']);
                e();
                C(1);
              }
              cR(1);
              {
                if (ctx.exp2) {
                  let cm2 = V(0);
                  {
                    if (cm2) {
                      lastEl = E(0, 'span', null, null, ['foo', '']);
                      e();
                    }
                  }
                  v();
                }
              }
              cr();
            }
            v();
          }
        }
        cr();
        qR(tmp = m<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      });

      const cmptInstance = renderComponent(Cmpt);
      const query = (cmptInstance.query as any);
      expect(query.length).toBe(0);

      cmptInstance.exp1 = true;
      detectChanges(cmptInstance);
      expect(query.length).toBe(1);
      expect(query.first.nativeElement).toBe(firstEl);

      cmptInstance.exp2 = true;
      detectChanges(cmptInstance);
      expect(query.length).toBe(2);
      expect(query.first.nativeElement).toBe(firstEl);
      expect(query.last.nativeElement).toBe(lastEl);
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
      const Cmpt = createComponent('cmpt', function(ctx: any, cm: boolean) {
        let tmp: any;
        if (cm) {
          Q(0, ['foo'], true, QUERY_READ_FROM_NODE);
          Q(1, ['foo'], false, QUERY_READ_FROM_NODE);
          C(2);
          E(3, 'span', null, null, ['foo', '']);
          e();
        }
        cR(2);
        {
          if (ctx.exp) {
            let cm1 = V(0);
            {
              if (cm1) {
                E(0, 'div', null, null, ['foo', '']);
                e();
              }
            }
            v();
          }
        }
        cr();
        qR(tmp = m<QueryList<any>>(0)) && (ctx.deep = tmp as QueryList<any>);
        qR(tmp = m<QueryList<any>>(1)) && (ctx.shallow = tmp as QueryList<any>);
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
      qR(queryList);
      expect(changes).toBe(1);


      // refresh without setting dirty - no emit
      qR(queryList);
      expect(changes).toBe(1);

      // refresh with setting dirty - emit
      queryList.setDirty();
      qR(queryList);
      expect(changes).toBe(2);
    });

  });
});
