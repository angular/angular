/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, D, E, P, T, V, c, dP, detectChanges, e, m, rC, rc, v} from '../../src/render3/index';

import {createComponent, renderComponent, toHtml} from './render_util';

describe('content projection', () => {
  it('should project content', () => {

    /**
     * <div><ng-content></ng-content></div>
     */
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        E(0, 'div');
        { P(1, 0); }
        e();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
          T(1, 'content');
        }
        e();
      }
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>content</div></child>');
  });

  it('should project content when root.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        P(0, 0);
      }
    });
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
          T(1, 'content');
        }
        e();
      }
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content</child>');
  });

  it('should re-project content when root.', () => {
    const GrandChild = createComponent('grand-child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        E(0, 'div');
        { P(1, 0); }
        e();
      }
    });
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        E(0, GrandChild.ngComponentDef);
        {
          D(0, GrandChild.ngComponentDef.n(), GrandChild.ngComponentDef);
          P(1, 0);
        }
        e();
        GrandChild.ngComponentDef.r(0, 0);
      }
    });
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
          E(1, 'b');
          T(2, 'Hello');
          e();
          T(3, 'World!');
        }
        e();
      }
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual('<child><grand-child><div><b>Hello</b>World!</div></grand-child></child>');
  });

  it('should project content with container.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        E(0, 'div');
        { P(1, 0); }
        e();
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
          T(1, '(');
          C(2);
          c();
          T(3, ')');
        }
        e();
      }
      rC(2);
      {
        if (ctx.value) {
          if (V(0)) {
            T(0, 'content');
          }
          v();
        }
      }
      rc();
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>()</div></child>');
    parent.value = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>(content)</div></child>');
    parent.value = false;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>()</div></child>');
  });

  it('should project content with container and if-else.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        E(0, 'div');
        { P(1, 0); }
        e();
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
          T(1, '(');
          C(2);
          c();
          T(3, ')');
        }
        e();
      }
      rC(2);
      {
        if (ctx.value) {
          if (V(0)) {
            T(0, 'content');
          }
          v();
        } else {
          if (V(1)) {
            T(0, 'else');
          }
          v();
        }
      }
      rc();
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>(else)</div></child>');
    parent.value = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>(content)</div></child>');
    parent.value = false;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>(else)</div></child>');
  });

  it('should support projection in embedded views', () => {
    let childCmptInstance: any;

    /**
     * <div>
     *  % if (!skipContent) {
     *    <span>
     *      <ng-content></ng-content>
     *    </span>
     *  % }
     * </div>
     */
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        E(0, 'div');
        {
          C(1);
          c();
        }
        e();
      }
      rC(1);
      {
        if (!ctx.skipContent) {
          if (V(0)) {
            E(0, 'span');
            P(1, 0);
            e();
          }
          v();
        }
      }
      rc();
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, childCmptInstance = Child.ngComponentDef.n(), Child.ngComponentDef);
          T(1, 'content');
        }
        e();
      }
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div><span>content</span></div></child>');

    childCmptInstance.skipContent = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div></div></child>');
  });

  it('should support projection in embedded views when ng-content is a root node of an embedded view',
     () => {
       let childCmptInstance: any;

       /**
        * <div>
        *  % if (!skipContent) {
        *    <ng-content></ng-content>
        *  % }
        * </div>
        */
       const Child = createComponent('child', function(ctx: any, cm: boolean) {
         if (cm) {
           m(0, dP());
           E(0, 'div');
           {
             C(1);
             c();
           }
           e();
         }
         rC(1);
         {
           if (!ctx.skipContent) {
             if (V(0)) {
               P(0, 0);
             }
             v();
           }
         }
         rc();
       });

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
         if (cm) {
           E(0, Child.ngComponentDef);
           {
             D(0, childCmptInstance = Child.ngComponentDef.n(), Child.ngComponentDef);
             T(1, 'content');
           }
           e();
         }
         Child.ngComponentDef.r(0, 0);
       });
       const parent = renderComponent(Parent);
       expect(toHtml(parent)).toEqual('<child><div>content</div></child>');

       childCmptInstance.skipContent = true;
       detectChanges(parent);
       expect(toHtml(parent)).toEqual('<child><div></div></child>');
     });

  it('should project nodes into the last ng-content', () => {
    /**
     * <div><ng-content></ng-content></div>
     * <span><ng-content></ng-content></span>
     */
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        E(0, 'div');
        { P(1, 0); }
        e();
        E(2, 'span');
        { P(3, 0); }
        e();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
          T(1, 'content');
        }
        e();
      }
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div></div><span>content</span></child>');
  });

  /**
   * Warning: this test is _not_ in-line with what Angular does atm.
   * Moreover the current implementation logic will result in DOM nodes
   * being re-assigned from one parent to another. Proposal: have compiler
   * to remove all but the latest occurrence of <ng-content> so we generate
   * only one P(n, m, 0) instruction. It would make it consistent with the
   * current Angular behaviour:
   * http://plnkr.co/edit/OAYkNawTDPkYBFTqovTP?p=preview
   */
  it('should project nodes into the last available ng-content', () => {
    let childCmptInstance: any;
    /**
     *  <ng-content></ng-content>
     *  <div>
     *  % if (show) {
     *    <ng-content></ng-content>
     *  % }
     *  </div>
     */
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        m(0, dP());
        P(0, 0);
        E(1, 'div');
        {
          C(2);
          c();
        }
        e();
      }
      rC(2);
      {
        if (ctx.show) {
          if (V(0)) {
            P(0, 0);
          }
          v();
        }
      }
      rc();
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child.ngComponentDef);
        {
          D(0, childCmptInstance = Child.ngComponentDef.n(), Child.ngComponentDef);
          T(1, 'content');
        }
        e();
      }
      Child.ngComponentDef.r(0, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content<div></div></child>');

    childCmptInstance.show = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>content</div></child>');
  });

  describe('with selectors', () => {

    it('should project nodes using attribute selectors', () => {
      /**
       *  <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
       *  <div id="second"><ng-content select="span[title=toSecond]"></ng-content></div>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0,
            dP([[[['span', 'title', 'toFirst'], null]], [[['span', 'title', 'toSecond'], null]]]));
          E(0, 'div', ['id', 'first']);
          { P(1, 0, 1); }
          e();
          E(2, 'div', ['id', 'second']);
          { P(3, 0, 2); }
          e();
        }
      });

      /**
       * <child>
       *  <span title="toFirst">1</span>
       *  <span title="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            E(1, 'span', ['title', 'toFirst']);
            { T(2, '1'); }
            e();
            E(3, 'span', ['title', 'toSecond']);
            { T(4, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.r(0, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span title="toFirst">1</span></div><div id="second"><span title="toSecond">2</span></div></child>');
    });

    it('should project nodes using class selectors', () => {
      /**
       *  <div id="first"><ng-content select="span.toFirst"></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0,
            dP([[[['span', 'class', 'toFirst'], null]], [[['span', 'class', 'toSecond'], null]]]));
          E(0, 'div', ['id', 'first']);
          { P(1, 0, 1); }
          e();
          E(2, 'div', ['id', 'second']);
          { P(3, 0, 2); }
          e();
        }
      });

      /**
       * <child>
       *  <span class="toFirst">1</span>
       *  <span class="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            E(1, 'span', ['class', 'toFirst']);
            { T(2, '1'); }
            e();
            E(3, 'span', ['class', 'toSecond']);
            { T(4, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.r(0, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="toFirst">1</span></div><div id="second"><span class="toSecond">2</span></div></child>');
    });

    it('should project nodes using class selectors when element has multiple classes', () => {
      /**
       *  <div id="first"><ng-content select="span.toFirst"></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0,
            dP([[[['span', 'class', 'toFirst'], null]], [[['span', 'class', 'toSecond'], null]]]));
          E(0, 'div', ['id', 'first']);
          { P(1, 0, 1); }
          e();
          E(2, 'div', ['id', 'second']);
          { P(3, 0, 2); }
          e();
        }
      });

      /**
       * <child>
       *  <span class="other toFirst">1</span>
       *  <span class="toSecond noise">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            E(1, 'span', ['class', 'other toFirst']);
            { T(2, '1'); }
            e();
            E(3, 'span', ['class', 'toSecond noise']);
            { T(4, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.r(0, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="other toFirst">1</span></div><div id="second"><span class="toSecond noise">2</span></div></child>');
    });

    it('should project nodes into the first matching selector', () => {
      /**
       *  <div id="first"><ng-content select="span"></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0, dP([[[['span'], null]], [[['span', 'class', 'toSecond'], null]]]));
          E(0, 'div', ['id', 'first']);
          { P(1, 0, 1); }
          e();
          E(2, 'div', ['id', 'second']);
          { P(3, 0, 2); }
          e();
        }
      });

      /**
       * <child>
       *  <span class="toFirst">1</span>
       *  <span class="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            E(1, 'span', ['class', 'toFirst']);
            { T(2, '1'); }
            e();
            E(3, 'span', ['class', 'toSecond']);
            { T(4, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.r(0, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="toFirst">1</span><span class="toSecond">2</span></div><div id="second"></div></child>');
    });

    it('should allow mixing ng-content with and without selectors', () => {
      /**
       *  <div id="first"><ng-content select="span.toFirst"></ng-content></div>
       *  <div id="second"><ng-content></ng-content></div>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0, dP([[[['span', 'class', 'toFirst'], null]]]));
          E(0, 'div', ['id', 'first']);
          { P(1, 0, 1); }
          e();
          E(2, 'div', ['id', 'second']);
          { P(3, 0); }
          e();
        }
      });

      /**
       * <child>
       *  <span class="other toFirst">1</span>
       *  <span class="toSecond noise">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            E(1, 'span', ['class', 'toFirst']);
            { T(2, '1'); }
            e();
            E(3, 'span');
            { T(4, 'remaining'); }
            e();
            T(5, 'more remaining');
          }
          e();
        }
        Child.ngComponentDef.r(0, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="toFirst">1</span></div><div id="second"><span>remaining</span>more remaining</div></child>');
    });

    it('should allow mixing ng-content with and without selectors - ng-content first', () => {
      /**
       *  <div id="first"><ng-content></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0, dP([[[['span', 'class', 'toSecond'], null]]]));
          E(0, 'div', ['id', 'first']);
          { P(1, 0); }
          e();
          E(2, 'div', ['id', 'second']);
          { P(3, 0, 1); }
          e();
        }
      });

      /**
       * <child>
       *  <span>1</span>
       *  <span class="toSecond">2</span>
       *  remaining
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            E(1, 'span');
            { T(2, '1'); }
            e();
            E(3, 'span', ['class', 'toSecond']);
            { T(4, '2'); }
            e();
            T(5, 'remaining');
          }
          e();
        }
        Child.ngComponentDef.r(0, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span>1</span>remaining</div><div id="second"><span class="toSecond">2</span></div></child>');
    });

    /**
     * Descending into projected content for selector-matching purposes is not supported
     * today: http://plnkr.co/edit/MYQcNfHSTKp9KvbzJWVQ?p=preview
     */
    it('should not match selectors on re-projected content', () => {

      /**
       *  <ng-content select="span"></ng-content>
       *  <hr>
       *  <ng-content></ng-content>
       */
      const GrandChild = createComponent('grand-child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0, dP([[[['span'], null]]]));
          P(0, 0, 1);
          E(1, 'hr');
          e();
          P(2, 0, 0);
        }
      });

      /**
       *  <grand-child>
       *    <ng-content></ng-content>
       *    <span>in child template</span>
       *  </grand-child>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0, dP());
          E(0, GrandChild.ngComponentDef);
          {
            D(0, GrandChild.ngComponentDef.n(), GrandChild.ngComponentDef);
            P(1, 0);
            E(2, 'span');
            { T(3, 'in child template'); }
            e();
          }
          e();
          GrandChild.ngComponentDef.r(0, 0);
        }
      });

      /**
       * <child>
       *  <div>
       *    parent content
       *  </div>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            E(1, 'span');
            { T(2, 'parent content'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.r(0, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><grand-child><span>in child template</span><hr><span>parent content</span></grand-child></child>');
    });

    it('should match selectors against projected containers', () => {

      /**
       * <span>
       *  <ng-content select="div"></ng-content>
       * </span>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          m(0, dP([[[['div'], null]]]));
          E(0, 'span');
          { P(1, 0, 1); }
          e();
        }
      });

      /**
       * <child>
       *   <div *ngIf="true">content</div>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
        if (cm) {
          E(0, Child.ngComponentDef);
          {
            D(0, Child.ngComponentDef.n(), Child.ngComponentDef);
            C(1, undefined, 'div');
            c();
          }
          e();
        }
        rC(1);
        {
          if (true) {
            if (V(0)) {
              E(0, 'div');
              { T(1, 'content'); }
              e();
            }
            v();
          }
        }
        rc();
        Child.ngComponentDef.r(0, 0);
      });
      const parent = renderComponent(Parent);
      expect(toHtml(parent)).toEqual('<child><span><div>content</div></span></child>');
    });

  });

});
