/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRenderFlags, ɵcontainer, ɵcontainerRefreshEnd, ɵcontainerRefreshStart, ɵdefineComponent, ɵelementEnd, ɵelementStart, ɵelementStyleProp, ɵelementStyling, ɵembeddedViewEnd, ɵembeddedViewStart, ɵinterpolation1, ɵrenderComponent as renderComponent, ɵtext, ɵtextBinding} from '@angular/core';

import {bindAction, profile} from '../../util';
import {createDom, destroyDom, detectChanges} from '../render3/tree';
import {TreeNode, emptyTree} from '../util';

function noop() {}

export function main() {
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
      ɵelementStyling(null, c1);
      { ɵtext(2); }
      ɵelementEnd();
      ɵcontainer(3);
      ɵcontainer(4);
    }
    ɵelementEnd();
  }
  if (rf & ɵRenderFlags.Update) {
    ɵelementStyleProp(1, 0, ctx.depth % 2 ? '' : 'grey');
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
