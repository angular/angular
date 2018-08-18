/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRenderFlags, ɵbind, ɵcontainer, ɵcontainerRefreshEnd, ɵcontainerRefreshStart, ɵdefineComponent, ɵdetectChanges, ɵelementEnd, ɵelementProperty, ɵelementStart, ɵelementStyling as s, ɵelementStylingProp, ɵembeddedViewEnd, ɵembeddedViewStart, ɵinterpolation1, ɵtext, ɵtextBinding as ɵtextBinding} from '@angular/core';

import {TreeNode, buildTree, emptyTree} from '../util';

export function destroyDom(component: TreeComponent) {
  component.data = emptyTree;
  ɵdetectChanges(component);
}

export function createDom(component: TreeComponent) {
  component.data = buildTree();
  ɵdetectChanges(component);
}

const numberOfChecksEl = document.getElementById('numberOfChecks') !;
let detectChangesRuns = 0;
export function detectChanges(component: TreeComponent) {
  for (let i = 0; i < 10; i++) {
    ɵdetectChanges(component);
  }
  detectChangesRuns += 10;
  numberOfChecksEl.textContent = `${detectChangesRuns}`;
}

const c0 = ['background-color'];
export class TreeComponent {
  data: TreeNode = emptyTree;

  /** @nocollapse */
  static ngComponentDef = ɵdefineComponent({
    type: TreeComponent,
    selectors: [['tree']],
    consts: 4,
    vars: 1,
    template: function(rf: ɵRenderFlags, ctx: TreeComponent) {
      if (rf & ɵRenderFlags.Create) {
        ɵelementStart(0, 'span');
        s(null, c0);
        { ɵtext(1); }
        ɵelementEnd();
        ɵcontainer(2);
        ɵcontainer(3);
      }
      if (rf & ɵRenderFlags.Update) {
        ɵelementStylingProp(0, 0, ctx.data.depth % 2 ? '' : 'grey');
        ɵtextBinding(1, ɵinterpolation1(' ', ctx.data.value, ' '));
        ɵcontainerRefreshStart(2);
        {
          if (ctx.data.left != null) {
            let rf0 = ɵembeddedViewStart(0, 1, 1);
            {
              if (rf0 & ɵRenderFlags.Create) {
                ɵelementStart(0, 'tree');
                ɵelementEnd();
              }
              if (rf0 & ɵRenderFlags.Update) {
                ɵelementProperty(0, 'data', ɵbind(ctx.data.left));
              }
            }
            ɵembeddedViewEnd();
          }
        }
        ɵcontainerRefreshEnd();
        ɵcontainerRefreshStart(3);
        {
          if (ctx.data.right != null) {
            let rf0 = ɵembeddedViewStart(0, 1, 1);
            {
              if (rf0 & ɵRenderFlags.Create) {
                ɵelementStart(0, 'tree');
                ɵelementEnd();
              }
              if (rf0 & ɵRenderFlags.Update) {
                ɵelementProperty(0, 'data', ɵbind(ctx.data.right));
              }
            }
            ɵembeddedViewEnd();
          }
        }
        ɵcontainerRefreshEnd();
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
  static ngComponentDef = ɵdefineComponent({
    type: TreeFunction,
    selectors: [['tree']],
    consts: 5,
    vars: 1,
    template: function(rf: ɵRenderFlags, ctx: TreeFunction) {
      // bit of a hack
      TreeTpl(rf, ctx.data);
    },
    factory: () => new TreeFunction,
    inputs: {data: 'data'}
  });
}

const c1 = ['background-color'];
export function TreeTpl(rf: ɵRenderFlags, ctx: TreeNode) {
  if (rf & ɵRenderFlags.Create) {
    ɵelementStart(0, 'tree');
    {
      ɵelementStart(1, 'span');
      s(null, c1);
      { ɵtext(2); }
      ɵelementEnd();
      ɵcontainer(3);
      ɵcontainer(4);
    }
    ɵelementEnd();
  }
  if (rf & ɵRenderFlags.Update) {
    ɵelementStylingProp(1, 0, ctx.depth % 2 ? '' : 'grey');
    ɵtextBinding(2, ɵinterpolation1(' ', ctx.value, ' '));
    ɵcontainerRefreshStart(3);
    {
      if (ctx.left != null) {
        let rf0 = ɵembeddedViewStart(0, 5, 1);
        { TreeTpl(rf0, ctx.left); }
        ɵembeddedViewEnd();
      }
    }
    ɵcontainerRefreshEnd();
    ɵcontainerRefreshStart(4);
    {
      if (ctx.right != null) {
        let rf0 = ɵembeddedViewStart(0, 5, 1);
        { TreeTpl(rf0, ctx.right); }
        ɵembeddedViewEnd();
      }
    }
    ɵcontainerRefreshEnd();
  }
}
