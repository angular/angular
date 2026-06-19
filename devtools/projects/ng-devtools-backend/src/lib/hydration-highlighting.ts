/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HydrationStatus} from '../../../protocol';
import {getDirectiveForestManager} from './directive-forest/manager';
import {highlightElement} from './highlighter';
import {
  Highlight,
  HighlightTemplate,
  hydrationMismatchedHighlightTemplate,
  hydrationCompletedHighlightTemplate,
  hydrationSkippedHighlightTemplate,
} from './highlighter/highlights';
import {ComponentTreeNode} from './interfaces';

let hydrationHighlights: Highlight[] = [];

export function highlightHydrationNodes(): void {
  const forest: ComponentTreeNode[] = getDirectiveForestManager().getDirectiveForest();

  // drop the root nodes, we don't want to highlight it
  const forestWithoutRoots = forest.flatMap((rootNode) => rootNode.children);

  const errorNodes = findErrorNodesForHydrationOverlay(forestWithoutRoots);

  // We get the first level of hydrated nodes
  // nested mismatched nodes nested in hydrated nodes aren't includes
  const nodes = findNodesForHydrationOverlay(forestWithoutRoots);

  // This ensures top level mismatched nodes are removed as we have a dedicated array
  const otherNodes = nodes.filter(({status}) => status?.status !== 'mismatched');

  for (const {node, status} of [...otherNodes, ...errorNodes]) {
    highlightHydrationElement(node as Element, status);
  }
}

export function removeHydrationHighlights() {
  for (const h of hydrationHighlights) {
    h.destroy();
  }
  hydrationHighlights = [];
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
    default:
      throw new Error(`Unsupported hydration status highlighting: ${status}`);
  }

  const highlight = highlightElement(node, template, {'icon': [status]});
  if (highlight) {
    hydrationHighlights.push(highlight);
  }
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
    if (node?.hydration?.status === 'mismatched') {
      // We highlight first level
      return {node: node.nativeElement!, status: node.hydration};
    }
    if (node.children.length) {
      return findNodesForHydrationOverlay(node.children);
    }
    return [];
  });
}
