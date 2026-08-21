/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview Contains the business logic for
 * change detection component highlighting feature.
 */

import {getDirectiveName} from '../../directive-forest/component-tree/component-tree';
import {highlightElement, removeHighlightsByType} from '../../shared/highlighter';
import {
  changeDetectionHighlightTemplate,
  Highlight,
  HighlightType,
} from '../../shared/highlighter/highlights';
import {ngDebugClient} from '../../shared/ng-debug-api/ng-debug-api';
import {CdAnalyzer, getCdAnalyzer, gracefullyDisposeAnalyzer} from './analyzer';

// State of change detection highlighting
let isCdHighlightingEnabled = false;

let cdAnalyzerUnsubscriber: (() => void) | undefined;

const ANALYZER_CONSUMER_KEY = 'cd-highlighting';

export function enableCdHighlighting() {
  if (!isCdHighlightingEnabled) {
    initCdHighlighting(getCdAnalyzer(ANALYZER_CONSUMER_KEY));
  }
  isCdHighlightingEnabled = true;
}

export function disableCdHighlighting() {
  cdAnalyzerUnsubscriber?.();
  gracefullyDisposeAnalyzer(ANALYZER_CONSUMER_KEY);
  removeHighlightsByType(HighlightType.ChangeDetection);
  isCdHighlightingEnabled = false;
}

function initCdHighlighting(cdAnalyzer: CdAnalyzer) {
  const activeHighlights = new WeakMap<Element, WeakRef<Highlight>>();
  const ng = ngDebugClient();

  cdAnalyzerUnsubscriber = cdAnalyzer.onCycle((current) => {
    for (const data of current) {
      const cmp = data.component.deref();
      if (!cmp) {
        continue;
      }
      const element = ng.getHostElement?.(cmp);
      if (!element) {
        continue;
      }

      const currentHighlight = activeHighlights.get(element)?.deref();
      // We use silent mode for the destroy, since it's not guaranteed
      // that the WeakRef will be immediately disposed after the highlight
      // has been cleaned up from the global state. Still, we use a WeakRef
      // to avoid any other leakages.
      currentHighlight?.destroy(true);

      const newHighlight = highlightElement(element, changeDetectionHighlightTemplate, {
        'component-name': [getDirectiveName(cmp)],
        'cycles-count': [data.cdPassDurations.length],
      });

      if (newHighlight) {
        activeHighlights.set(element, new WeakRef(newHighlight));
      } else {
        activeHighlights.delete(element);
      }
    }
  });
}
