/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, D, E, T, V, b, b1, c, defineComponent, detectChanges as _detectChanges, e, p, rC, rc, s, t, v} from '@angular/core/src/render3/index';
import {ComponentDef} from '@angular/core/src/render3/public_interfaces';

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
    tag: 'tree',
    template: function(ctx: TreeComponent, cm: boolean) {
      if (cm) {
        E(0, 'span');
        { T(1); }
        e();
        C(2);
        c();
        C(3);
        c();
      }
      s(0, 'background-color', b(ctx.data.depth % 2 ? '' : 'grey'));
      t(1, b1(' ', ctx.data.value, ' '));
      rC(2);
      {
        if (ctx.data.left != null) {
          let cm0 = V(0);
          {
            if (cm0) {
              E(0, TreeComponent.ngComponentDef);
              { D(0, TreeComponent.ngComponentDef.n(), TreeComponent.ngComponentDef); }
              e();
            }
            p(0, 'data', b(ctx.data.left));
            TreeComponent.ngComponentDef.r(0, 0);
          }
          v();
        }
      }
      rc();
      rC(3);
      {
        if (ctx.data.right != null) {
          let cm0 = V(0);
          {
            if (cm0) {
              E(0, TreeComponent.ngComponentDef);
              { D(0, TreeComponent.ngComponentDef.n(), TreeComponent.ngComponentDef); }
              e();
            }
            p(0, 'data', b(ctx.data.right));
            TreeComponent.ngComponentDef.r(0, 0);
          }
          v();
        }
      }
      rc();
    },
    factory: () => new TreeComponent,
    inputs: {data: 'data'}
  });
}

export class TreeFunction extends TreeComponent {
  data: TreeNode = emptyTree;

  /** @nocollapse */
  static ngComponentDef: ComponentDef<TreeFunction> = defineComponent({
    type: TreeFunction,
    tag: 'tree',
    template: function(ctx: TreeFunction, cm: boolean) {
      // bit of a hack
      TreeTpl(ctx.data, cm);
    },
    factory: () => new TreeFunction,
    inputs: {data: 'data'}
  });
}

export function TreeTpl(ctx: TreeNode, cm: boolean) {
  if (cm) {
    E(0, 'span');
    { T(1); }
    e();
    C(2);
    c();
    C(3);
    c();
  }
  s(0, 'background-color', b(ctx.depth % 2 ? '' : 'grey'));
  t(1, b1(' ', ctx.value, ' '));
  rC(2);
  {
    if (ctx.left != null) {
      let cm0 = V(0);
      { TreeTpl(ctx.left, cm0); }
      v();
    }
  }
  rc();
  rC(3);
  {
    if (ctx.right != null) {
      let cm0 = V(0);
      { TreeTpl(ctx.right, cm0); }
      v();
    }
  }
  rc();
}
