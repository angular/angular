/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentDef} from '../render3';
import {readPatchedLView} from '../render3/context_discovery';
import {isComponentHost, isLContainer, isLView} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, HOST, TVIEW} from '../render3/interfaces/view';
import {getTNode} from '../render3/util/view_utils';

/**
 * Gets the class name of the closest component to a node.
 * Warning! this function will return minified names if the name of the component is minified. The
 * consumer of the function is responsible for resolving the minified name to its original name.
 * @param node Node from which to start the search.
 */
export function getClosestComponentName(node: Node): string | null {
  let currentNode = node as Node | null;

  while (currentNode) {
    const lView = readPatchedLView(currentNode);

    if (lView !== null) {
      for (let i = HEADER_OFFSET; i < lView.length; i++) {
        const current = lView[i];

        if ((!isLView(current) && !isLContainer(current)) || current[HOST] !== currentNode) {
          continue;
        }

        const tView = lView[TVIEW];
        const tNode = getTNode(tView, i);
        if (isComponentHost(tNode)) {
          const def = tView.data[tNode.directiveStart + tNode.componentOffset] as ComponentDef<{}>;
          const name = def.debugInfo?.className || def.type.name;

          // Note: the name may be an empty string if the class name is
          // dropped due to minification. In such cases keep going up the tree.
          if (name) {
            return name;
          } else {
            break;
          }
        }
      }
    }

    currentNode = currentNode.parentNode;
  }

  return null;
}
