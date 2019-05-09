/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRenderFlags, ɵrenderComponent as renderComponent, Δcontainer, ΔcontainerRefreshEnd, ΔcontainerRefreshStart, ΔdefineComponent, ΔelementEnd, ΔelementStart, ΔembeddedViewEnd, ΔembeddedViewStart, Δinterpolation1, Δselect, ΔstyleProp, Δstyling, Δtext, ΔtextBinding} from '@angular/core';

import {bindAction, profile} from '../../util';
import {createDom, destroyDom, detectChanges} from '../render3/tree';
import {TreeNode, emptyTree} from '../util';

function noop() {}

export class TreeFunction {
  data: TreeNode = emptyTree;

  /** @nocollapse */
  static ngComponentDef = ΔdefineComponent({
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
    ΔelementStart(0, 'tree');
    {
      ΔelementStart(1, 'span');
      Δstyling(null, c1);
      { Δtext(2); }
      ΔelementEnd();
      Δcontainer(3);
      Δcontainer(4);
    }
    ΔelementEnd();
  }
  if (rf & ɵRenderFlags.Update) {
    Δselect(1);
    ΔstyleProp(0, ctx.depth % 2 ? '' : 'grey');
    Δstyling();
    Δselect(2);
    ΔtextBinding(2, Δinterpolation1(' ', ctx.value, ' '));
    ΔcontainerRefreshStart(3);
    {
      if (ctx.left != null) {
        let rf0 = ΔembeddedViewStart(0, 5, 1);
        { TreeTpl(rf0, ctx.left); }
        ΔembeddedViewEnd();
      }
    }
    ΔcontainerRefreshEnd();
    ΔcontainerRefreshStart(4);
    {
      if (ctx.right != null) {
        let rf0 = ΔembeddedViewStart(0, 5, 1);
        { TreeTpl(rf0, ctx.right); }
        ΔembeddedViewEnd();
      }
    }
    ΔcontainerRefreshEnd();
  }
}

let component: TreeFunction;
if (typeof window !== 'undefined') {
  component = renderComponent(TreeFunction);
  bindAction('#createDom', () => createDom(component as any));
  bindAction('#destroyDom', () => destroyDom(component as any));
  bindAction('#detectChanges', () => detectChanges(component as any));
  bindAction(
      '#detectChangesProfile',
      profile(() => detectChanges(component as any), noop, 'detectChanges'));
  bindAction('#updateDomProfile', profile(() => createDom(component as any), noop, 'update'));
  bindAction(
      '#createDomProfile',
      profile(() => createDom(component as any), () => destroyDom(component as any), 'create'));
}
