/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition} from '../../../../protocol';
import {ComponentTreeNode} from '../shared/interfaces';
import {ngDebugClient} from '../shared/ng-debug-api/ng-debug-api';
import {selectTreeStrategy} from './tree-strategies';
import {getAppRoots} from './utils/app-roots';

/** Gets the all the root components in the Dom, including those outside the application root */
export function getRootElements(): Element[] {
  if (!ngDebugClient().getComponent) {
    // If the ngDebugClient does not support getComponent, we cannot proceed.
    return [];
  }

  const roots = getAppRoots();
  const rootSet = new Set(roots);

  // Traverse the DOM tree for other non application root Angular components.
  // Pass in the existing roots to inform the traversal that we can skip those paths.
  discoverNonApplicationRootComponents(document.body, rootSet);

  return [...rootSet];
}

export function buildDirectiveForest(): ComponentTreeNode[] {
  const ng = ngDebugClient();
  if ((ng as any).getComponentForest) {
    const forest: ComponentTreeNode[] = (ng as any).getComponentForest();
    const frontier = [...forest];
    while (frontier.length) {
      const node = frontier.pop()!;
      const rawNode = node as any;
      node.tagName ??= rawNode.element ?? rawNode.nativeElement?.nodeName.toLowerCase() ?? '';
      node.component!.isElement ??= false;
      for (const child of node.children) {
        frontier.push(child);
      }
    }
    return forest;
  }
  return buildDirectiveForestWithStrategy(getRootElements());
}

// Based on an ElementID we return a specific component node.
// If we can't find any, we return null.
export function queryDirectiveForest(
  position: ElementPosition,
  forest: ComponentTreeNode[],
): ComponentTreeNode | null {
  if (!position.length) {
    return null;
  }
  let node: null | ComponentTreeNode = null;
  for (const i of position) {
    node = forest[i];
    if (!node) {
      return null;
    }
    forest = node.children;
  }
  if (node?.controlFlowBlock) {
    return null;
  }
  return node;
}

export function findNodeInForest(
  position: ElementPosition,
  forest: ComponentTreeNode[],
): Element | null {
  const foundComponent: ComponentTreeNode | null = queryDirectiveForest(position, forest);
  const nativeElement = foundComponent?.nativeElement;
  return nativeElement instanceof Element ? nativeElement : null;
}

export function findNodeFromSerializedPosition(
  serializedPosition: string,
): ComponentTreeNode | null {
  const position: number[] = JSON.parse(serializedPosition);
  return queryDirectiveForest(position, buildDirectiveForest());
}

/**
 * Warning: This function mutates the `roots` arg!
 *
 * Recursively traverse the DOM tree to find all Angular component root elements.
 *
 * This function starts from the given element and traverses its children.
 * When it finds an Angular component, it adds that element to the `roots` set.
 *
 * If we discover an angular component that we've already added to the `roots` set,
 * we skip traversing its children. This is to ensure that we only collect unique root elements.
 *
 *
 * Example:
 *
 * Lets say we have the following DOM structure:
 *
 * ```html
 * <body>
 *   <app-root-1>...</app-root-1>
 *   <app-root-2>...</app-root-2>
 *
 *   <mat-dialog>
 *    ...
 *   </mat-dialog>
 *
 *   <div id="not-angular">Not an angular component</div>
 * </body>
 *
 * ```
 *
 * In this case, `app-root-1` and `app-root-2` are the root elements of Angular components.
 * The `mat-dialog` is a non application root Angular component.
 *
 * We can discover the roots by searching for ng-version. This gives us a set of paths that we can skip traversing.
 *
 * ```ts
 * const rootSet = new Set(getAppRoots());
 * console.log(rootSet);
 * // Set(<app-root-1>, <app-root-2>)
 * discoverNonApplicationRootComponents(document.body, rootSet);
 * console.log(rootSet);
 * // Set(<app-root-1>, <app-root-2>, <mat-dialog>)
 * ```
 *
 * ```md
 *
 * traversing document.body.children:
 * - child: <app-root-1>
 *   - Since we have this already in the `roots` set, we skip traversing its children.
 * - child: <app-root-2>
 *   - Since we have this already in the `roots` set, we skip traversing its children.
 * - child: <mat-dialog>
 *   - Since this is not in the `roots` set, we check if it is an Angular component.
 *   - Since it is, we add it to the `roots` set and break the loop.
 * - child: <div id="not-angular">
 *   - Since this is not an Angular component, we traverse its children to see if we can find any Angular components.
 *
 * ```
 *
 * @param element The current DOM element being traversed.
 * @param roots A set of root elements found during the traversal.
 */
function discoverNonApplicationRootComponents(element: Element, roots: Set<Element>): void {
  if (roots.has(element)) {
    return;
  }
  const children = Array.from(element.children);
  for (const child of children) {
    if (roots.has(child)) {
      continue;
    }

    const ng = ngDebugClient();
    if (ng.getComponent && ng.getComponent(child)) {
      roots.add(child);
      // If the child is an Angular component, we can skip traversing its children.
      continue;
    }

    discoverNonApplicationRootComponents(child, roots);
  }
}

function buildDirectiveForestWithStrategy(elements: Element[]) {
  if (!elements || !elements.length) {
    return [];
  }

  let i = 0;
  return elements.flatMap((element) => {
    // Different roots can have different Angular versions.
    // Different versions depend on different component tree discovery strategies.
    const strategy = selectTreeStrategy(element);
    if (!strategy) {
      return [];
    }

    return strategy.build(element, i++);
  });
}
