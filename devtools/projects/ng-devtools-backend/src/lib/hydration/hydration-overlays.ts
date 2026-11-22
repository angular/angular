/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {debounceTime, Subscription} from 'rxjs';
import {HydrationStatus} from '../../../../protocol';
import {getConfig} from '../config/config';
import {getDirectiveForestManager} from '../directive-forest/manager';
import {getHydrationMismatchHighlightElement} from '../directive-forest';
import {getProfiler} from '../profiling/profiler';
import {highlightElement, removeHighlightsByType} from '../shared/highlighter';
import {
  hydrationMismatchedHighlightTemplate,
  hydrationCompletedHighlightTemplate,
  hydrationSkippedHighlightTemplate,
} from '../shared/highlighter/templates';
import {ComponentTreeNode} from '../shared/interfaces';
import {AngularDevtoolsError} from '../shared/utils/error';
import {runOutsideAngular} from '../shared/utils/general';
import {HighlightTemplate, HighlightType} from '../shared/highlighter/types';

let hydrationOverlaysEnabled = false;
let profilerSubs: Subscription | undefined;

export function loadHydrationOverlays(): () => void {
  return getConfig().onValue('hydrationOverlays', (enabled) => {
    if (enabled) {
      enableHydrationOverlays();
    } else {
      disableHydrationOverlays();
    }
  });
}

function enableHydrationOverlays() {
  if (hydrationOverlaysEnabled) {
    return;
  }

  hydrationOverlaysEnabled = true;
  highlightHydrationNodes();

  runOutsideAngular(() => {
    // We are throttling CD events due to the
    // possiblity of scroll-induced event flood.
    profilerSubs = getProfiler()
      .changeDetection$.pipe(debounceTime(250))
      .subscribe(() => refresh());
  });
}

function disableHydrationOverlays() {
  removeHydrationHighlights();
  profilerSubs?.unsubscribe();
  hydrationOverlaysEnabled = false;
}

function highlightHydrationNodes(): void {
  const forest: ComponentTreeNode[] = getDirectiveForestManager().getDirectiveForest();

  // Include root nodes when collecting mismatched hydration nodes so errors directly inside
  // the root component (e.g. `<app-root>`) are still highlighted.
  const errorNodes = findErrorNodesForHydrationOverlay(forest);

  // Drop the root nodes for non-error overlays so we don't shade the entire application root.
  const forestWithoutRoots = forest.flatMap((rootNode) => rootNode.children);

  // We get the first level of hydrated nodes
  // nested mismatched nodes nested in hydrated nodes aren't included
  const nodes = findNodesForHydrationOverlay(forestWithoutRoots);

  // Exclude mismatched (handled above with root coverage) and dehydrated (no overlay highlight).
  const otherNodes = nodes.filter(
    ({status}) => status?.status !== 'mismatched' && status?.status !== 'dehydrated',
  );

  for (const {node, status} of otherNodes) {
    highlightHydrationElement(node as Element, status);
  }
  for (const {node, status} of errorNodes) {
    const target = getHydrationMismatchHighlightElement(node);
    if (target) {
      highlightHydrationElement(target, status);
    }
  }
}

function removeHydrationHighlights() {
  removeHighlightsByType(HighlightType.HydrationCompleted);
  removeHighlightsByType(HighlightType.HydrationMismatched);
  removeHighlightsByType(HighlightType.HydrationSkipped);
}

function refresh() {
  removeHydrationHighlights();
  highlightHydrationNodes();
}

function highlightHydrationElement(node: Element, {status}: HydrationStatus) {
  let template: HighlightTemplate;

  switch (status) {
    case 'hydrated':
      template = hydrationCompletedHighlightTemplate;
      break;
    case 'mismatched':
      template = hydrationMismatchedHighlightTemplate;
      break;
    case 'skipped':
      template = hydrationSkippedHighlightTemplate;
      break;
    case 'dehydrated':
      return;
    default:
      throw new AngularDevtoolsError(`Unsupported hydration status highlighting: ${status}`);
  }

  highlightElement(node, template, {'icon': [status]});
}

/**
 * Returns the first level of hydrated nodes
 * Note: Mismatched nodes nested in hydrated nodes aren't included
 */
function findNodesForHydrationOverlay(
  forest: ComponentTreeNode[],
): {node: Node; status: HydrationStatus}[] {
  return forest.flatMap((node) => {
    if (node?.hydration?.status) {
      // We highlight first level
      return {node: node.nativeElement!, status: node.hydration};
    }
    if (node.children.length) {
      return findNodesForHydrationOverlay(node.children);
    }
    return [];
  });
}

function findErrorNodesForHydrationOverlay(
  forest: ComponentTreeNode[],
): {node: Node; status: HydrationStatus}[] {
  return forest.flatMap((node) => {
    const childErrors = node.children.length
      ? findErrorNodesForHydrationOverlay(node.children)
      : [];
    if (node?.hydration?.status === 'mismatched' && node.nativeElement) {
      return [{node: node.nativeElement, status: node.hydration}, ...childErrors];
    }
    return childErrors;
  });
}
