/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵC as C, ɵE as E, ɵRenderFlags as RenderFlags, ɵT as T, ɵV as V, ɵb as b, ɵcR as cR, ɵcr as cr, ɵdefineComponent as defineComponent, ɵdetectChanges as _detectChanges, ɵe as e, ɵi1 as i1, ɵp as p, ɵs as s, ɵsa as sa, ɵsm as sm, ɵsp as sp, ɵt as t, ɵv as v} from '@angular/core';

import {TreeNode, buildTree, emptyTree} from '../util';

export function destroyDom(component: TreeComponent) {
  component.data = emptyTree;
  _detectChanges(component);
}

export function createDom(component: TreeComponent) {
  component.data = buildTree();
  _detectChanges(component);
}

const numberOfChecksEl = document.getElementById('numberOfChecks') !;
let detectChangesRuns = 0;
export function detectChanges(component: TreeComponent) {
  for (let i = 0; i < 10; i++) {
    _detectChanges(component);
  }
  detectChangesRuns += 10;
  numberOfChecksEl.textContent = `${detectChangesRuns}`;
}

const c0 = ['background-color'];
export class TreeComponent {
  data: TreeNode = emptyTree;

  /** @nocollapse */
  static ngComponentDef = defineComponent({
    type: TreeComponent,
    selectors: [['tree']],
    template: function(rf: RenderFlags, ctx: TreeComponent) {
      if (rf & RenderFlags.Create) {
        E(0, 'span');
        s(null, c0);
        { T(1); }
        e();
        C(2);
        C(3);
      }
      if (rf & RenderFlags.Update) {
        sp(0, 0, ctx.data.depth % 2 ? '' : 'grey');
        t(1, i1(' ', ctx.data.value, ' '));
        cR(2);
        {
          if (ctx.data.left != null) {
            let rf0 = V(0);
            {
              if (rf0 & RenderFlags.Create) {
                E(0, 'tree');
                e();
              }
              if (rf0 & RenderFlags.Update) {
                p(0, 'data', b(ctx.data.left));
              }
            }
            v();
          }
        }
        cr();
        cR(3);
        {
          if (ctx.data.right != null) {
            let rf0 = V(0);
            {
              if (rf0 & RenderFlags.Create) {
                E(0, 'tree');
                e();
              }
              if (rf0 & RenderFlags.Update) {
                p(0, 'data', b(ctx.data.right));
              }
            }
            v();
          }
        }
        cr();
      }
    },
    factory: () => new TreeComponent,
    inputs: {data: 'data'},
    directives: () => [TreeComponent]
  });
}

export class TreeFunction {
  data: TreeNode = emptyTree;

  /** @nocollapse */
  static ngComponentDef = defineComponent({
    type: TreeFunction,
    selectors: [['tree']],
    template: function(rf: RenderFlags, ctx: TreeFunction) {
      // bit of a hack
      TreeTpl(rf, ctx.data);
    },
    factory: () => new TreeFunction,
    inputs: {data: 'data'}
  });
}

const c1 = ['background-color'];
export function TreeTpl(rf: RenderFlags, ctx: TreeNode) {
  if (rf & RenderFlags.Create) {
    E(0, 'tree');
    {
      E(1, 'span');
      s(null, c1);
      { T(2); }
      e();
      C(3);
      C(4);
    }
    e();
  }
  if (rf & RenderFlags.Update) {
    sp(1, 0, ctx.depth % 2 ? '' : 'grey');
    t(2, i1(' ', ctx.value, ' '));
    cR(3);
    {
      if (ctx.left != null) {
        let rf0 = V(0);
        { TreeTpl(rf0, ctx.left); }
        v();
      }
    }
    cr();
    cR(4);
    {
      if (ctx.right != null) {
        let rf0 = V(0);
        { TreeTpl(rf0, ctx.right); }
        v();
      }
    }
    cr();
  }
}
