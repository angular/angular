/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getLContext} from '../../render3/context_discovery';
import {NodeInjector} from '../../render3/di';
import {TDirectiveHostNode, TNode} from '../../render3/interfaces/node';
import {INJECTOR, LView, T_HOST, TVIEW, TViewType} from '../../render3/interfaces/view';
import {DiGraph, SerializedInjector, serializeInjector} from './serialized_di_graph';
import {ChainedInjector} from '../../render3/chained_injector';
import {Injector} from '../../di/injector';
import {ToolDefinition} from './tool_definitions';
import {walkLViewDirectives} from './traversal';
import {getLViewParent} from '../../render3/util/view_utils';
import {R3Injector} from '../../di/r3_injector';
import {NullInjector} from '../../di/null_injector';

/** Tool that exposes Angular's DI graph to AI agents. */
export const diGraphTool: ToolDefinition<{}, DiGraph> = {
  name: 'angular:di_graph',
  // tslint:disable-next-line:no-toplevel-property-access
  description: `
Exposes the Angular Dependency Injection (DI) graph of the application.

This tool extracts both the element injector tree (associated with DOM elements and components)
and the environment injector tree (associated with modules and standalone application roots).
It captures the relationship structure and the providers resolved at each level.

Returns:
- \`elementInjectorRoots\`: An array of root element injectors (one for each Angular application
  root found). Each node forms a tree hierarchy:
  - \`name\`: The constructor name of this injector.
  - \`type\`: 'element'.
  - \`providers\`: Array of providers configured on this injector.
    - \`token\`: The DI token.
    - \`value\`: The resolved value of that provider if it was instantiated.
  - \`hostElement\`: The DOM element that this injector is associated with.
  - \`children\`: Array of child element injectors.
- \`environmentInjectorRoot\`: The root environment injector. It forms a tree hierarchy of nodes
  representing all environment injectors:
  - \`name\`: The identifier for the environment injector.
  - \`type\`: 'environment' or 'null'.
  - \`providers\`: Array of providers configured on this injector.
    - \`token\`: The DI token.
    - \`value\`: The resolved value of that provider if it was instantiated.
  - \`children\`: Array of child environment injectors.
  `.trim(),
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const roots = Array.from(document.querySelectorAll('[ng-version]')) as HTMLElement[];
    if (roots.length === 0) {
      throw new Error('Could not find Angular root element ([ng-version]) on the page.');
    }
    return discoverDiGraph(roots);
  },
};

/**
 * Traverses the Angular internal tree from the root to discover element and environment injectors.
 */
function discoverDiGraph(roots: HTMLElement[]): DiGraph {
  const rootLViews = roots.map((root) => {
    const lContext = getLContext(root);
    if (!lContext?.lView) {
      throw new Error(
        `Could not find an \`LView\` for root \`<${root.tagName.toLowerCase()}>\`, is it an Angular component?`,
      );
    }
    return lContext.lView;
  });

  return {
    elementInjectorRoots: rootLViews.map((rootLView) => walkElementInjectors(rootLView)),
    environmentInjectorRoot: collectEnvInjectors(rootLViews),
  };
}

/**
 * Traverses all directive-hosting nodes in the `rootLView` hierarchy and builds a tree of
 * serialized element injectors.
 *
 * This function uses `walkLViewDirectives` to visit nodes in depth-first order and a stack
 * to reconstruct the hierarchical tree of injectors, handling both same-view and cross-view
 * relationships.
 *
 * @param rootLView The root view to start traversal from.
 * @returns The root {@link SerializedInjector} object.
 */
function walkElementInjectors(rootLView: LView): SerializedInjector {
  // Assert that we were given a root `LView` rather than a random component.
  // A root component actually gets two `LView` objects, the "root `LView`" with
  // `type === TViewType.Root` and then an `LView` for the component itself as a child.
  if (rootLView[TVIEW].type !== TViewType.Root) {
    throw new Error(`Expected a root LView but got type: \`${rootLView[TVIEW].type}\`.`);
  }

  // Track the injectors we're currently processing.
  const stack: Array<[TNode, LView, SerializedInjector]> = [];

  // By constraining `rootLView` to only accepting root `LView` objects, we don't have to
  // process `rootLView` itself, knowing that it won't be a component or directive.
  // We can just check its descendants.
  for (const [tNode, lView] of walkLViewDirectives(rootLView)) {
    const injector = new NodeInjector(tNode as TDirectiveHostNode, lView);
    const serialized = serializeInjector(injector);

    // Look for our nearest ancestor in the stack.
    while (stack.length > 0) {
      const [lastTNode, lastLView, lastInjector] = stack[stack.length - 1];

      const isDescendantInSameView = isTNodeDescendant(tNode, lastTNode);
      const isDescendantInDifferentView = isLViewDescendantOfTNode(lView, lastLView, lastTNode);
      if (isDescendantInSameView || isDescendantInDifferentView) {
        // This injector is a child of the current last injector in the stack.
        lastInjector.children.push(serialized);
        break;
      } else {
        stack.pop();
      }
    }

    // Future injectors might be children of this one.
    stack.push([tNode, lView, serialized]);
  }

  // Since all component/directive LViews are descendants of the root LView, the first
  // item on the stack must still remain and will be the root injector.
  if (stack.length === 0) {
    throw new Error(`Expected at least one component/directive in the root \`LView\`.`);
  }
  const [, , rootInjector] = stack[0];
  return rootInjector;
}

/**
 * Collects and serializes all environment injectors found in the hierarchy of the given
 * `rootLViews`.
 *
 * Injectors have pointers to their parents, but not their children, so walking "down" the
 * hierarchy is not a generally supported operation.
 *
 * The function walks down the `LView` hierarchy to find all the component/directive descendants.
 * For each one, it then walks back up the injector hierarchy to find the full set of environment
 * injectors.
 *
 * @param rootLViews The root views to start traversal from.
 * @returns The root {@link SerializedInjector} object containing the entire environment
 *     injector tree.
 */
function collectEnvInjectors(rootLViews: LView[]): SerializedInjector {
  const serializedEnvInjectorMap = new Map<Injector, SerializedInjector>();
  let rootEnvInjector: SerializedInjector | undefined = undefined;

  /**
   * Serialize all the ancestors of the given injector and return
   * its serialized version.
   *
   * @param injector The environment injector to start from.
   * @returns The serialized form of the input {@link Injector}.
   */
  function serializeAncestors(injector: Injector): SerializedInjector {
    const existing = serializedEnvInjectorMap.get(injector);
    if (existing) return existing;

    const serialized = serializeInjector(injector);
    serializedEnvInjectorMap.set(injector, serialized);

    const parentInjector = getParentEnvInjector(injector);
    if (parentInjector) {
      // Recursively process the parent and attach ourselves as a child.
      const parentSerialized = serializeAncestors(parentInjector);
      parentSerialized.children.push(serialized);
    } else {
      // If there is no parent, this is a root environment injector.
      if (!rootEnvInjector) {
        rootEnvInjector = serialized;
      } else if (rootEnvInjector !== serialized) {
        throw new Error('Expected only one root environment injector, but found multiple.', {
          cause: {firstRoot: rootEnvInjector, secondRoot: serialized},
        });
      }
    }

    return serialized;
  }

  // Process all descendant environment injectors.
  for (const rootLView of rootLViews) {
    for (const [, lView] of walkLViewDirectives(rootLView)) {
      serializeAncestors(lView[INJECTOR]);
    }
  }

  if (!rootEnvInjector) {
    throw new Error('Expected a root environment injector but did not find one.');
  }

  return rootEnvInjector;
}

/**
 * Checks if `node` is a descendant of `ancestor` within the SAME view.
 *
 * Since we are in the same view, we can safely use `tNode.parent` to determine
 * if `ancestor` is an ancestor of the current `node`.
 */
function isTNodeDescendant(node: TNode, ancestor: TNode): boolean {
  let curr: TNode | null = node;
  while (curr) {
    if (curr === ancestor) return true;
    curr = curr.parent;
  }
  return false;
}

/**
 * Checks if `lView` is a descendant of `parentTNode` in `parentLView` (crossing view boundaries).
 *
 * `tNode.parent` is restricted to referring to nodes within the SAME view. When we cross
 * view boundaries (e.g., entering a component's internal view or an embedded view like `@if`),
 * `tNode.parent` becomes `null` or points to something inside that view, breaking the chain to the
 * outside.
 *
 * To solve this, we use the `LView` hierarchy to find if the current view is a descendant of the
 * `parentLView`.
 */
function isLViewDescendantOfTNode(lView: LView, parentLView: LView, parentTNode: TNode): boolean {
  let currentLView: LView | null = lView;
  let hostTNode: TNode | null = null;

  while (currentLView && currentLView !== parentLView) {
    hostTNode = currentLView[T_HOST];
    currentLView = getLViewParent(currentLView);
  }

  return (
    currentLView === parentLView && hostTNode !== null && isTNodeDescendant(hostTNode, parentTNode)
  );
}

/** Find the parent environment injector of the given injector. */
function getParentEnvInjector(injector: Injector): Injector | undefined {
  if (injector instanceof ChainedInjector) {
    // We skip `chainedInjector.injector` because that points at the parent element injector
    // which is handled by `walkElementInjectors`.
    const chainedInjector = injector;
    return chainedInjector.parentInjector;
  } else if (injector instanceof R3Injector) {
    return injector.parent;
  } else if (injector instanceof NullInjector) {
    return undefined;
  } else {
    throw new Error(`Unknown injector type: "${injector.constructor.name}".`);
  }
}
