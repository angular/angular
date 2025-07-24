/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition, HydrationStatus} from '../../../../protocol';

import {findNodeInForest} from '../component-tree/component-tree';
import {
  findComponentAndHost,
  highlightHydrationElement,
  highlightSelectedElement,
  removeHydrationHighlights,
  unHighlight,
} from '../highlighter';
import {initializeOrGetDirectiveForestHooks} from '../hooks';
import {ComponentTreeNode} from '../interfaces';

interface Type<T> extends Function {
  new (...args: any[]): T;
}
export interface ComponentInspectorOptions {
  onComponentEnter: (id: number) => void;
  onComponentSelect: (id: number) => void;
  onComponentLeave: () => void;
}

export class ComponentInspector {
  private _selectedComponent!: {component: Type<unknown>; host: HTMLElement | null};
  private readonly _onComponentEnter;
  private readonly _onComponentSelect;
  private readonly _onComponentLeave;

  constructor(
    componentOptions: ComponentInspectorOptions = {
      onComponentEnter: () => {},
      onComponentLeave: () => {},
      onComponentSelect: () => {},
    },
  ) {
    this.bindMethods();
    this._onComponentEnter = componentOptions.onComponentEnter;
    this._onComponentSelect = componentOptions.onComponentSelect;
    this._onComponentLeave = componentOptions.onComponentLeave;
  }

  startInspecting(): void {
    window.addEventListener('mouseover', this.elementMouseOver, true);
    window.addEventListener('click', this.elementClick, true);
    window.addEventListener('mouseout', this.cancelEvent, true);
  }

  stopInspecting(): void {
    window.removeEventListener('mouseover', this.elementMouseOver, true);
    window.removeEventListener('click', this.elementClick, true);
    window.removeEventListener('mouseout', this.cancelEvent, true);
  }

  elementClick(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.preventDefault();

    if (this._selectedComponent.component && this._selectedComponent.host) {
      this._onComponentSelect(
        initializeOrGetDirectiveForestHooks().getDirectiveId(this._selectedComponent.component)!,
      );
    }
  }

  elementMouseOver(e: MouseEvent): void {
    this.cancelEvent(e);

    const el = e.target as HTMLElement;
    if (el) {
      this._selectedComponent = findComponentAndHost(el);
    }

    unHighlight();
    if (this._selectedComponent.component && this._selectedComponent.host) {
      highlightSelectedElement(this._selectedComponent.host);
      this._onComponentEnter(
        initializeOrGetDirectiveForestHooks().getDirectiveId(this._selectedComponent.component)!,
      );
    }
  }

  cancelEvent(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.preventDefault();
    this._onComponentLeave();
  }

  bindMethods(): void {
    this.startInspecting = this.startInspecting.bind(this);
    this.stopInspecting = this.stopInspecting.bind(this);
    this.elementMouseOver = this.elementMouseOver.bind(this);
    this.elementClick = this.elementClick.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
  }

  highlightByPosition(position: ElementPosition): void {
    const forest: ComponentTreeNode[] = initializeOrGetDirectiveForestHooks().getDirectiveForest();
    const elementToHighlight: HTMLElement | null = findNodeInForest(position, forest);
    if (elementToHighlight) {
      highlightSelectedElement(elementToHighlight);
    }
  }

  highlightHydrationNodes(): void {
    const forest: ComponentTreeNode[] = initializeOrGetDirectiveForestHooks().getDirectiveForest();

    // drop the root nodes, we don't want to highlight it
    const forestWithoutRoots = forest.flatMap((rootNode) => rootNode.children);

    const errorNodes = findErrorNodesForHydrationOverlay(forestWithoutRoots);

    // We get the first level of hydrated nodes
    // nested mismatched nodes nested in hydrated nodes aren't includes
    const nodes = findNodesForHydrationOverlay(forestWithoutRoots);

    // This ensures top level mismatched nodes are removed as we have a dedicated array
    const otherNodes = nodes.filter(({status}) => status?.status !== 'mismatched');

    for (const {node, status} of [...otherNodes, ...errorNodes]) {
      highlightHydrationElement(node, status);
    }
  }

  removeHydrationHighlights() {
    removeHydrationHighlights();
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
