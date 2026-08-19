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
import {CdAnalyzer, getCdAnalyzer} from './analyzer';

// State of change detection highlighting
let isCdHighlightingEnabled = false;

let cdAnalyzerUnsubscriber: (() => void) | undefined;
let cdAnalyzerDispose: (() => void) | undefined;

export function enableCdHighlighting() {
  if (!isCdHighlightingEnabled) {
    const {analyzer, disposeFn} = getCdAnalyzer();
    cdAnalyzerDispose = disposeFn;
    initCdHighlighting(analyzer);
  }
  isCdHighlightingEnabled = true;
}

export function disableCdHighlighting() {
  cdAnalyzerUnsubscriber?.();
  cdAnalyzerDispose?.();
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

      // We check if the highlight is already detroyed, before attempting to destroy it.
      // This is needed in order to avoid warning messages for already destroyed instance.
      // In the case of CD highlighting, this can occur due to WeakRef<Highlight> not being
      // immediately cleared by GC after all references had been removed.
      if (!currentHighlight?.isDestroyed) {
        currentHighlight?.destroy();
      }

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
