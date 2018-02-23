/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {detectChanges} from '../../src/render3/index';
import {container, containerRefreshEnd, containerRefreshStart, directiveRefresh, elementEnd, elementStart, embeddedViewEnd, embeddedViewStart, load, projection, projectionDef, text} from '../../src/render3/instructions';

import {createComponent, renderComponent, toHtml} from './render_util';

describe('content projection', () => {
  it('should project content', () => {

    /**
     * <div><ng-content></ng-content></div>
     */
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        { text(2, 'content'); }
        elementEnd();
      }
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>content</div></child>');
  });

  it('should project content when root.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        projectionDef(0);
        projection(1, 0);
      }
    });
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        { text(2, 'content'); }
        elementEnd();
      }
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content</child>');
  });

  it('should re-project content when root.', () => {
    const GrandChild = createComponent('grand-child', function(ctx: any, cm: boolean) {
      if (cm) {
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        projectionDef(0);
        elementStart(1, GrandChild);
        { projection(3, 0); }
        elementEnd();
        GrandChild.ngComponentDef.h(2, 1);
        directiveRefresh(2, 1);
      }
    });
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        {
          elementStart(2, 'b');
          text(3, 'Hello');
          elementEnd();
          text(4, 'World!');
        }
        elementEnd();
      }
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual('<child><grand-child><div><b>Hello</b>World!</div></grand-child></child>');
  });

  it('should project components', () => {

    /** <div><ng-content></ng-content></div> */
    const Child = createComponent('child', (ctx: any, cm: boolean) => {
      if (cm) {
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });

    const ProjectedComp = createComponent('projected-comp', (ctx: any, cm: boolean) => {
      if (cm) {
        text(0, 'content');
      }
    });

    /**
     * <child>
     *   <projected-comp></projected-comp>
     * </child>
     */
    const Parent = createComponent('parent', (ctx: any, cm: boolean) => {
      if (cm) {
        elementStart(0, Child);
        {
          elementStart(2, ProjectedComp);
          elementEnd();
        }
        elementEnd();
      }
      Child.ngComponentDef.h(1, 0);
      ProjectedComp.ngComponentDef.h(3, 2);
      directiveRefresh(3, 2);
      directiveRefresh(1, 0);
    });
    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual('<child><div><projected-comp>content</projected-comp></div></child>');
  });

  it('should project content with container.', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        {
          text(2, '(');
          container(3);
          text(4, ')');
        }
        elementEnd();
      }
      containerRefreshStart(3);
      {
        if (ctx.value) {
          if (embeddedViewStart(0)) {
            text(0, 'content');
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
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
        projectionDef(0);
        projection(1, 0);
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        { container(2); }
        elementEnd();
      }
      containerRefreshStart(2);
      {
        if (ctx.value) {
          if (embeddedViewStart(0)) {
            text(0, 'content');
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
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
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
      }
    });
    const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        {
          text(2, '(');
          container(3);
          text(4, ')');
        }
        elementEnd();
      }
      containerRefreshStart(3);
      {
        if (ctx.value) {
          if (embeddedViewStart(0)) {
            text(0, 'content');
          }
          embeddedViewEnd();
        } else {
          if (embeddedViewStart(1)) {
            text(0, 'else');
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
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
        projectionDef(0);
        elementStart(1, 'div');
        { container(2); }
        elementEnd();
      }
      containerRefreshStart(2);
      {
        if (!ctx.skipContent) {
          if (embeddedViewStart(0)) {
            elementStart(0, 'span');
            projection(1, 0);
            elementEnd();
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        {
          childCmptInstance = load(1);
          text(2, 'content');
        }
        elementEnd();
      }
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
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
           projectionDef(0);
           elementStart(1, 'div');
           { container(2); }
           elementEnd();
         }
         containerRefreshStart(2);
         {
           if (!ctx.skipContent) {
             if (embeddedViewStart(0)) {
               projection(0, 0);
             }
             embeddedViewEnd();
           }
         }
         containerRefreshEnd();
       });

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
         if (cm) {
           elementStart(0, Child);
           {
             childCmptInstance = load(1);
             text(2, 'content');
           }
           elementEnd();
         }
         Child.ngComponentDef.h(1, 0);
         directiveRefresh(1, 0);
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
           projectionDef(0);
           elementStart(1, 'div');
           { container(2); }
           elementEnd();
         }
         containerRefreshStart(2);
         {
           if (!ctx.skipContent) {
             if (embeddedViewStart(0)) {
               text(0, 'before-');
               projection(1, 0);
               text(2, '-after');
             }
             embeddedViewEnd();
           }
         }
         containerRefreshEnd();
       });

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
         if (cm) {
           elementStart(0, Child);
           {
             childCmptInstance = load(1);
             text(2, 'content');
           }
           elementEnd();
         }
         Child.ngComponentDef.h(1, 0);
         directiveRefresh(1, 0);
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
        projectionDef(0);
        elementStart(1, 'div');
        { projection(2, 0); }
        elementEnd();
        elementStart(3, 'span');
        { projection(4, 0); }
        elementEnd();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        { text(2, 'content'); }
        elementEnd();
      }
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
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
        projectionDef(0);
        projection(1, 0);
        elementStart(2, 'div');
        { container(3); }
        elementEnd();
      }
      containerRefreshStart(3);
      {
        if (ctx.show) {
          if (embeddedViewStart(0)) {
            projection(0, 0);
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, Child);
        {
          childCmptInstance = load(1);
          text(2, 'content');
        }
        elementEnd();
      }
      Child.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
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
          projectionDef(
              0, [[[['span', 'title', 'toFirst'], null]], [[['span', 'title', 'toSecond'], null]]]);
          elementStart(1, 'div', ['id', 'first']);
          { projection(2, 0, 1); }
          elementEnd();
          elementStart(3, 'div', ['id', 'second']);
          { projection(4, 0, 2); }
          elementEnd();
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
          elementStart(0, Child);
          {
            elementStart(2, 'span', ['title', 'toFirst']);
            { text(3, '1'); }
            elementEnd();
            elementStart(4, 'span', ['title', 'toSecond']);
            { text(5, '2'); }
            elementEnd();
          }
          elementEnd();
        }
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(
              0, [[[['span', 'class', 'toFirst'], null]], [[['span', 'class', 'toSecond'], null]]]);
          elementStart(1, 'div', ['id', 'first']);
          { projection(2, 0, 1); }
          elementEnd();
          elementStart(3, 'div', ['id', 'second']);
          { projection(4, 0, 2); }
          elementEnd();
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
          elementStart(0, Child);
          {
            elementStart(2, 'span', ['class', 'toFirst']);
            { text(3, '1'); }
            elementEnd();
            elementStart(4, 'span', ['class', 'toSecond']);
            { text(5, '2'); }
            elementEnd();
          }
          elementEnd();
        }
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(
              0, [[[['span', 'class', 'toFirst'], null]], [[['span', 'class', 'toSecond'], null]]]);
          elementStart(1, 'div', ['id', 'first']);
          { projection(2, 0, 1); }
          elementEnd();
          elementStart(3, 'div', ['id', 'second']);
          { projection(4, 0, 2); }
          elementEnd();
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
          elementStart(0, Child);
          {
            elementStart(2, 'span', ['class', 'other toFirst']);
            { text(3, '1'); }
            elementEnd();
            elementStart(4, 'span', ['class', 'toSecond noise']);
            { text(5, '2'); }
            elementEnd();
          }
          elementEnd();
        }
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(0, [[[['span'], null]], [[['span', 'class', 'toSecond'], null]]]);
          elementStart(1, 'div', ['id', 'first']);
          { projection(2, 0, 1); }
          elementEnd();
          elementStart(3, 'div', ['id', 'second']);
          { projection(4, 0, 2); }
          elementEnd();
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
          elementStart(0, Child);
          {
            elementStart(2, 'span', ['class', 'toFirst']);
            { text(3, '1'); }
            elementEnd();
            elementStart(4, 'span', ['class', 'toSecond']);
            { text(5, '2'); }
            elementEnd();
          }
          elementEnd();
        }
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(0, [[[['span', 'class', 'toFirst'], null]]]);
          elementStart(1, 'div', ['id', 'first']);
          { projection(2, 0, 1); }
          elementEnd();
          elementStart(3, 'div', ['id', 'second']);
          { projection(4, 0); }
          elementEnd();
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
          elementStart(0, Child);
          {
            elementStart(2, 'span', ['class', 'toFirst']);
            { text(3, '1'); }
            elementEnd();
            elementStart(4, 'span');
            { text(5, 'remaining'); }
            elementEnd();
            text(6, 'more remaining');
          }
          elementEnd();
        }
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(0, [[[['span', 'class', 'toSecond'], null]]]);
          elementStart(1, 'div', ['id', 'first']);
          { projection(2, 0); }
          elementEnd();
          elementStart(3, 'div', ['id', 'second']);
          { projection(4, 0, 1); }
          elementEnd();
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
          elementStart(0, Child);
          {
            elementStart(2, 'span');
            { text(3, '1'); }
            elementEnd();
            elementStart(4, 'span', ['class', 'toSecond']);
            { text(5, '2'); }
            elementEnd();
            text(6, 'remaining');
          }
          elementEnd();
        }
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(0, [[[['span'], null]]]);
          projection(1, 0, 1);
          elementStart(2, 'hr');
          elementEnd();
          projection(3, 0, 0);
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
          projectionDef(0);
          elementStart(1, GrandChild);
          {
            projection(3, 0);
            elementStart(4, 'span');
            { text(5, 'in child template'); }
            elementEnd();
          }
          elementEnd();
          GrandChild.ngComponentDef.h(2, 1);
          directiveRefresh(2, 1);
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
          elementStart(0, Child);
          {
            elementStart(2, 'span');
            { text(3, 'parent content'); }
            elementEnd();
          }
          elementEnd();
        }
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(0, [[[['', 'card-title', ''], null]], [[['', 'card-content', ''], null]]]);
          projection(1, 0, 1);
          elementStart(2, 'hr');
          elementEnd();
          projection(3, 0, 2);
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
          projectionDef(0);
          elementStart(1, Card);
          {
            elementStart(3, 'h1', ['card-title', '']);
            { text(4, 'Title'); }
            elementEnd();
            projection(5, 0, 0, ['card-content', '']);
          }
          elementEnd();
          Card.ngComponentDef.h(2, 1);
          directiveRefresh(2, 1);
        }
      });

      /**
       * <card-with-title>
       *  content
       * </card-with-title>
       */
      const App = createComponent('app', function(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, CardWithTitle);
          { text(2, 'content'); }
          elementEnd();
        }
        CardWithTitle.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          projectionDef(0, [[[['div'], null]]]);
          elementStart(1, 'span');
          { projection(2, 0, 1); }
          elementEnd();
        }
      });

      /**
       * <child>
       *   <div *ngIf="true">content</div>
       * </child>
       */
      const Parent = createComponent('parent', function(ctx: {value: any}, cm: boolean) {
        if (cm) {
          elementStart(0, Child);
          { container(2, undefined, undefined, 'div'); }
          elementEnd();
        }
        containerRefreshStart(2);
        {
          if (true) {
            if (embeddedViewStart(0)) {
              elementStart(0, 'div');
              { text(1, 'content'); }
              elementEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
        Child.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      });
      const parent = renderComponent(Parent);
      expect(toHtml(parent)).toEqual('<child><span><div>content</div></span></child>');
    });

  });

});
