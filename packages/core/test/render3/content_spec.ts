/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, D, E, P, T, V, c, detectChanges, e, rC, rc, v} from '../../src/render3/index';

import {createComponent, renderComponent, toHtml} from './render_util';

describe('content projection', () => {
  it('should project content', () => {

    /**
     * <div><ng-content></ng-content></div>
     */
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, 'div');
        { P(1); }
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
        P(0);
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
        E(0, 'div');
        { P(1); }
        e();
      }
    });
    const Child = createComponent('child', function(ctx: any, cm: boolean) {
      if (cm) {
        E(0, GrandChild.ngComponentDef);
        {
          D(0, GrandChild.ngComponentDef.n(), GrandChild.ngComponentDef);
          P(1);
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
        E(0, 'div');
        { P(1); }
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
        E(0, 'div');
        { P(1); }
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
            P(1);
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
               P(0);
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
        E(0, 'div');
        { P(1); }
        e();
        E(2, 'span');
        { P(3); }
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
        P(0);
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
            P(0);
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
});
