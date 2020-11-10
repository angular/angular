/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Renderer2} from '../render/api';
import {isProceduralRenderer} from './interfaces/renderer';
import {isLView} from './interfaces/type_checks';
import {LView, RENDERER} from './interfaces/view';
import {getCurrentTNode, getLView} from './state';
import {getComponentLViewByIndex} from './util/view_utils';



/** Returns a Renderer2 (or throws when application was bootstrapped with Renderer3) */
function getOrCreateRenderer2(view: LView): Renderer2 {
  const renderer = view[RENDERER];
  if (isProceduralRenderer(renderer)) {
    return renderer as Renderer2;
  } else {
    throw new Error('Cannot inject Renderer2 when the application uses Renderer3!');
  }
}

/** Injects a Renderer2 for the current component. */
export function injectRenderer2(): Renderer2 {
  // We need the Renderer to be based on the component that it's being injected into, however since
  // DI happens before we've entered its view, `getLView` will return the parent view instead.
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const nodeAtIndex = getComponentLViewByIndex(tNode.index, lView);
  return getOrCreateRenderer2(isLView(nodeAtIndex) ? nodeAtIndex : lView);
}
