/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {setActiveConsumer} from '../../../primitives/signals';
import {assertDefined} from '../../util/assert';
import {setCurrentQueryIndex} from '../state';
import {isContentQueryHost} from '../interfaces/type_checks';
/** Refreshes all content queries declared by directives in a given view */
export function refreshContentQueries(tView, lView) {
  const contentQueries = tView.contentQueries;
  if (contentQueries !== null) {
    const prevConsumer = setActiveConsumer(null);
    try {
      for (let i = 0; i < contentQueries.length; i += 2) {
        const queryStartIdx = contentQueries[i];
        const directiveDefIdx = contentQueries[i + 1];
        if (directiveDefIdx !== -1) {
          const directiveDef = tView.data[directiveDefIdx];
          ngDevMode && assertDefined(directiveDef, 'DirectiveDef not found.');
          ngDevMode &&
            assertDefined(directiveDef.contentQueries, 'contentQueries function should be defined');
          setCurrentQueryIndex(queryStartIdx);
          directiveDef.contentQueries(
            2 /* RenderFlags.Update */,
            lView[directiveDefIdx],
            directiveDefIdx,
          );
        }
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
export function executeViewQueryFn(flags, viewQueryFn, component) {
  ngDevMode && assertDefined(viewQueryFn, 'View queries function to execute must be defined.');
  setCurrentQueryIndex(0);
  const prevConsumer = setActiveConsumer(null);
  try {
    viewQueryFn(flags, component);
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
export function executeContentQueries(tView, tNode, lView) {
  if (isContentQueryHost(tNode)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const start = tNode.directiveStart;
      const end = tNode.directiveEnd;
      for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
        const def = tView.data[directiveIndex];
        if (def.contentQueries) {
          const directiveInstance = lView[directiveIndex];
          ngDevMode &&
            assertDefined(
              directiveIndex,
              'Incorrect reference to a directive defining a content query',
            );
          def.contentQueries(1 /* RenderFlags.Create */, directiveInstance, directiveIndex);
        }
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
//# sourceMappingURL=query_execution.js.map
