/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, E, P, T, V, cR, cr, detectChanges, e, m, pD, r, v} from '../../src/render3/index';

import {createComponent, renderComponent, toHtml} from './render_util';

describe('content projection', () => {
  it('should project content', () => {

    /**
     * <div><ng-content></ng-content></div>
     */
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child);
        { T(2, 'content'); }
        e();
      }
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>content</div></child>');
  });

  it('should project content when root.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        P(1, 0);
      }
    });
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child);
        { T(2, 'content'); }
        e();
      }
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content</child>');
  });

  it('should re-project content when root.', () => {
    const GrandChild = createComponent('grand-child', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
      }
    });
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        E(1, GrandChild);
        { P(3, 0); }
        e();
        GrandChild.ngComponentDef.h(2, 1);
        r(2, 1);
      }
    });
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child);
        {
          E(2, 'b');
          T(3, 'Hello');
          e();
          T(4, 'World!');
        }
        e();
      }
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual('<child><grand-child><div><b>Hello</b>World!</div></grand-child></child>');
  });

  it('should project components', () => {

    /** <div><ng-content></ng-content></div> */
    const Child = createComponent('child', (ctx: any, cm: boolean) => {
      if (cm) {
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
      }
    });

    const ProjectedComp = createComponent('projected-comp', (ctx: any, cm: boolean) => {
      if (cm) {
        T(0, 'content');
      }
    });

    /**
     * <child>
     *   <projected-comp></projected-comp>
     * </child>
     */
    const Parent = createComponent('parent', (ctx: any, cm: boolean) => {
      if (cm) {
        E(0, Child);
        {
          E(2, ProjectedComp);
          e();
        }
        e();
      }
      Child.ngComponentDef.h(1, 0);
      ProjectedComp.ngComponentDef.h(3, 2);
      r(3, 2);
      r(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual('<child><div><projected-comp>content</projected-comp></div></child>');
  });

  it('should project content with container.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        E(0, Child);
        {
          T(2, '(');
          C(3);
          T(4, ')');
        }
        e();
      }
      cR(3);
      {
        if (ctx.value) {
          if (V(0)) {
            T(0, 'content');
          }
          v();
        }
      }
      cr();
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
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

  it('should project content with container into root', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        P(1, 0);
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        E(0, Child);
        { C(2); }
        e();
      }
      cR(2);
      {
        if (ctx.value) {
          if (V(0)) {
            T(0, 'content');
          }
          v();
        }
      }
      cr();
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child></child>');

    parent.value = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child>content</child>');

    parent.value = false;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child></child>');
  });

  it('should project content with container and if-else.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        E(0, Child);
        {
          T(2, '(');
          C(3);
          T(4, ')');
        }
        e();
      }
      cR(3);
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
      cr();
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
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
        pD(0);
        E(1, 'div');
        { C(2); }
        e();
      }
      cR(2);
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
      cr();
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child);
        {
          childCmptInstance = m(1);
          T(2, 'content');
        }
        e();
      }
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
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
           pD(0);
           E(1, 'div');
           { C(2); }
           e();
         }
         cR(2);
         {
           if (!ctx.skipContent) {
             if (V(0)) {
               P(0, 0);
             }
             v();
           }
         }
         cr();
       });

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
         if (cm) {
           E(0, Child);
           {
             childCmptInstance = m(1);
             T(2, 'content');
           }
           e();
         }
         Child.ngComponentDef.h(1, 0);
         r(1, 0);
       });
       const parent = renderComponent(Parent);
       expect(toHtml(parent)).toEqual('<child><div>content</div></child>');

       childCmptInstance.skipContent = true;
       detectChanges(parent);
       expect(toHtml(parent)).toEqual('<child><div></div></child>');
     });

  it('should support projection in embedded views when ng-content is a root node of an embedded view, with other nodes after',
     () => {
       let childCmptInstance: any;

       /**
        * <div>
        *  % if (!skipContent) {
        *    before-<ng-content></ng-content>-after
        *  % }
        * </div>
        */
       const Child = createComponent('child', function(ctx: any, cm: boolean) {
         if (cm) {
           pD(0);
           E(1, 'div');
           { C(2); }
           e();
         }
         cR(2);
         {
           if (!ctx.skipContent) {
             if (V(0)) {
               T(0, 'before-');
               P(1, 0);
               T(2, '-after');
             }
             v();
           }
         }
         cr();
       });

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
         if (cm) {
           E(0, Child);
           {
             childCmptInstance = m(1);
             T(2, 'content');
           }
           e();
         }
         Child.ngComponentDef.h(1, 0);
         r(1, 0);
       });
       const parent = renderComponent(Parent);
       expect(toHtml(parent)).toEqual('<child><div>before-content-after</div></child>');

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
        pD(0);
        E(1, 'div');
        { P(2, 0); }
        e();
        E(3, 'span');
        { P(4, 0); }
        e();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child);
        { T(2, 'content'); }
        e();
      }
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
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
        pD(0);
        P(1, 0);
        E(2, 'div');
        { C(3); }
        e();
      }
      cR(3);
      {
        if (ctx.show) {
          if (V(0)) {
            P(0, 0);
          }
          v();
        }
      }
      cr();
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, Child);
        {
          childCmptInstance = m(1);
          T(2, 'content');
        }
        e();
      }
      Child.ngComponentDef.h(1, 0);
      r(1, 0);
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
          pD(0, [[[['span', 'title', 'toFirst'], null]], [[['span', 'title', 'toSecond'], null]]]);
          E(1, 'div', ['id', 'first']);
          { P(2, 0, 1); }
          e();
          E(3, 'div', ['id', 'second']);
          { P(4, 0, 2); }
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
          E(0, Child);
          {
            E(2, 'span', ['title', 'toFirst']);
            { T(3, '1'); }
            e();
            E(4, 'span', ['title', 'toSecond']);
            { T(5, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
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
          pD(0, [[[['span', 'class', 'toFirst'], null]], [[['span', 'class', 'toSecond'], null]]]);
          E(1, 'div', ['id', 'first']);
          { P(2, 0, 1); }
          e();
          E(3, 'div', ['id', 'second']);
          { P(4, 0, 2); }
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
          E(0, Child);
          {
            E(2, 'span', ['class', 'toFirst']);
            { T(3, '1'); }
            e();
            E(4, 'span', ['class', 'toSecond']);
            { T(5, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
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
          pD(0, [[[['span', 'class', 'toFirst'], null]], [[['span', 'class', 'toSecond'], null]]]);
          E(1, 'div', ['id', 'first']);
          { P(2, 0, 1); }
          e();
          E(3, 'div', ['id', 'second']);
          { P(4, 0, 2); }
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
          E(0, Child);
          {
            E(2, 'span', ['class', 'other toFirst']);
            { T(3, '1'); }
            e();
            E(4, 'span', ['class', 'toSecond noise']);
            { T(5, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
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
          pD(0, [[[['span'], null]], [[['span', 'class', 'toSecond'], null]]]);
          E(1, 'div', ['id', 'first']);
          { P(2, 0, 1); }
          e();
          E(3, 'div', ['id', 'second']);
          { P(4, 0, 2); }
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
          E(0, Child);
          {
            E(2, 'span', ['class', 'toFirst']);
            { T(3, '1'); }
            e();
            E(4, 'span', ['class', 'toSecond']);
            { T(5, '2'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
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
          pD(0, [[[['span', 'class', 'toFirst'], null]]]);
          E(1, 'div', ['id', 'first']);
          { P(2, 0, 1); }
          e();
          E(3, 'div', ['id', 'second']);
          { P(4, 0); }
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
          E(0, Child);
          {
            E(2, 'span', ['class', 'toFirst']);
            { T(3, '1'); }
            e();
            E(4, 'span');
            { T(5, 'remaining'); }
            e();
            T(6, 'more remaining');
          }
          e();
        }
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
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
          pD(0, [[[['span', 'class', 'toSecond'], null]]]);
          E(1, 'div', ['id', 'first']);
          { P(2, 0); }
          e();
          E(3, 'div', ['id', 'second']);
          { P(4, 0, 1); }
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
          E(0, Child);
          {
            E(2, 'span');
            { T(3, '1'); }
            e();
            E(4, 'span', ['class', 'toSecond']);
            { T(5, '2'); }
            e();
            T(6, 'remaining');
          }
          e();
        }
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
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
    it('should not descend into re-projected content', () => {

      /**
       *  <ng-content select="span"></ng-content>
       *  <hr>
       *  <ng-content></ng-content>
       */
      const GrandChild = createComponent('grand-child', function(ctx: any, cm: boolean) {
        if (cm) {
          pD(0, [[[['span'], null]]]);
          P(1, 0, 1);
          E(2, 'hr');
          e();
          P(3, 0, 0);
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
          pD(0);
          E(1, GrandChild);
          {
            P(3, 0);
            E(4, 'span');
            { T(5, 'in child template'); }
            e();
          }
          e();
          GrandChild.ngComponentDef.h(2, 1);
          r(2, 1);
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
          E(0, Child);
          {
            E(2, 'span');
            { T(3, 'parent content'); }
            e();
          }
          e();
        }
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
      });

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><grand-child><span>in child template</span><hr><span>parent content</span></grand-child></child>');
    });

    it('should match selectors on ng-content nodes with attributes', () => {

      /**
       * <ng-content select="[card-title]"></ng-content>
       * <hr>
       * <ng-content select="[card-content]"></ng-content>
       */
      const Card = createComponent('card', function(ctx: any, cm: boolean) {
        if (cm) {
          pD(0, [[[['', 'card-title', ''], null]], [[['', 'card-content', ''], null]]]);
          P(1, 0, 1);
          E(2, 'hr');
          e();
          P(3, 0, 2);
        }
      });

      /**
       * <card>
       *  <h1 card-title>Title</h1>
       *  <ng-content card-content></ng-content>
       * </card>
       */
      const CardWithTitle = createComponent('card-with-title', function(ctx: any, cm: boolean) {
        if (cm) {
          pD(0);
          E(1, Card);
          {
            E(3, 'h1', ['card-title', '']);
            { T(4, 'Title'); }
            e();
            P(5, 0, 0, ['card-content', '']);
          }
          e();
          Card.ngComponentDef.h(2, 1);
          r(2, 1);
        }
      });

      /**
       * <card-with-title>
       *  content
       * </card-with-title>
       */
      const App = createComponent('app', function(ctx: any, cm: boolean) {
        if (cm) {
          E(0, CardWithTitle);
          { T(2, 'content'); }
          e();
        }
        CardWithTitle.ngComponentDef.h(1, 0);
        r(1, 0);
      });

      const app = renderComponent(App);
      expect(toHtml(app))
          .toEqual(
              '<card-with-title><card><h1 card-title="">Title</h1><hr>content</card></card-with-title>');
    });

    it('should match selectors against projected containers', () => {

      /**
       * <span>
       *  <ng-content select="div"></ng-content>
       * </span>
       */
      const Child = createComponent('child', function(ctx: any, cm: boolean) {
        if (cm) {
          pD(0, [[[['div'], null]]]);
          E(1, 'span');
          { P(2, 0, 1); }
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
          E(0, Child);
          { C(2, undefined, undefined, 'div'); }
          e();
        }
        cR(2);
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
        cr();
        Child.ngComponentDef.h(1, 0);
        r(1, 0);
      });
      const parent = renderComponent(Parent);
      expect(toHtml(parent)).toEqual('<child><span><div>content</div></span></child>');
    });

  });

});
