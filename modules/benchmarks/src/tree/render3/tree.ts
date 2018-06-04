/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵC as C, ɵE as E, ɵRenderFlags as RenderFlags, ɵT as T, ɵV as V, ɵb as b, ɵcR as cR, ɵcr as cr, ɵdefineComponent as defineComponent, ɵdetectChanges as _detectChanges, ɵe as e, ɵi1 as i1, ɵp as p, ɵsn as sn, ɵt as t, ɵv as v} from '@angular/core';
import {ComponentDef} from '@angular/core/src/render3/interfaces/definition';

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

export class TreeComponent {
  data: TreeNode = emptyTree;

  /** @nocollapse */
  static ngComponentDef: ComponentDef<TreeComponent> = defineComponent({
    type: TreeComponent,
    selectors: [['tree']],
    template: function(rf: RenderFlags, ctx: TreeComponent) {
      if (rf & RenderFlags.Create) {
        E(0, 'span');
        { T(1); }
        e();
        C(2);
        C(3);
      }
      if (rf & RenderFlags.Update) {
        sn(0, 'background-color', b(ctx.data.depth % 2 ? '' : 'grey'));
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
  static ngComponentDef: ComponentDef<TreeFunction> = defineComponent({
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

export function TreeTpl(rf: RenderFlags, ctx: TreeNode) {
  if (rf & RenderFlags.Create) {
    E(0, 'tree');
    {
      E(1, 'span');
      { T(2); }
      e();
      C(3);
      C(4);
    }
    e();
  }
  if (rf & RenderFlags.Update) {
    sn(1, 'background-color', b(ctx.depth % 2 ? '' : 'grey'));
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
