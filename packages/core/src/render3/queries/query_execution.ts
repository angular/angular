/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../../primitives/signals';
import {LView, TView} from '../interfaces/view';
import {DirectiveDef, RenderFlags, ViewQueriesFunction} from '../interfaces/definition';
import {assertDefined} from '../../util/assert';
import {setCurrentQueryIndex} from '../state';
import {TNode} from '../interfaces/node';
import {isContentQueryHost} from '../interfaces/type_checks';

/** Refreshes all content queries declared by directives in a given view */
export function refreshContentQueries(tView: TView, lView: LView): void {
  const contentQueries = tView.contentQueries;
  if (contentQueries !== null) {
    const prevConsumer = setActiveConsumer(null);
    try {
      for (let i = 0; i < contentQueries.length; i += 2) {
        const queryStartIdx = contentQueries[i];
        const directiveDefIdx = contentQueries[i + 1];
        if (directiveDefIdx !== -1) {
          const directiveDef = tView.data[directiveDefIdx] as DirectiveDef<any>;
          ngDevMode && assertDefined(directiveDef, 'DirectiveDef not found.');
          ngDevMode &&
            assertDefined(directiveDef.contentQueries, 'contentQueries function should be defined');
          setCurrentQueryIndex(queryStartIdx);
          directiveDef.contentQueries!(RenderFlags.Update, lView[directiveDefIdx], directiveDefIdx);
        }
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}

export function executeViewQueryFn<T>(
  flags: RenderFlags,
  viewQueryFn: ViewQueriesFunction<T>,
  component: T,
): void {
  ngDevMode && assertDefined(viewQueryFn, 'View queries function to execute must be defined.');
  setCurrentQueryIndex(0);
  const prevConsumer = setActiveConsumer(null);
  try {
    viewQueryFn(flags, component);
  } finally {
    setActiveConsumer(prevConsumer);
  }
}

export function executeContentQueries(tView: TView, tNode: TNode, lView: LView) {
  if (isContentQueryHost(tNode)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const start = tNode.directiveStart;
      const end = tNode.directiveEnd;
      for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
        const def = tView.data[directiveIndex] as DirectiveDef<any>;
        if (def.contentQueries) {
          const directiveInstance = lView[directiveIndex];
          ngDevMode &&
            assertDefined(
              directiveIndex,
              'Incorrect reference to a directive defining a content query',
            );
          def.contentQueries(RenderFlags.Create, directiveInstance, directiveIndex);
        }
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
