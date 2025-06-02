/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkVirtualScrollViewport,
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
} from '@angular/cdk/scrolling';
import {FlatTreeControl} from '@angular/cdk/tree';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {DevToolsNode, ElementPosition, Events, MessageBus} from '../../../../../../protocol';

import {TabUpdate} from '../../tab-update/index';

import {ComponentDataSource, FlatNode} from './component-data-source';
import {getFullNodeNameString, isChildOf, parentCollapsed} from './directive-forest-utils';
import {IndexedNode} from './index-forest';
import {FilterComponent, FilterFn} from './filter/filter.component';
import {TreeNodeComponent, NodeTextMatch} from './tree-node/tree-node.component';
import {directiveForestFilterFnGenerator} from './filter/directive-forest-filter-fn-generator';

const NODE_ITEM_HEIGHT = 18; // px; Required for CDK Virtual Scroll

@Component({
  selector: 'ng-directive-forest',
  templateUrl: './directive-forest.component.html',
  styleUrls: ['./directive-forest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FilterComponent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    TreeNodeComponent,
  ],
})
export class DirectiveForestComponent {
  private readonly tabUpdate = inject(TabUpdate);
  private readonly messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly elementRef = inject(ElementRef);

  readonly forest = input<DevToolsNode[]>([]);
  readonly showCommentNodes = input<boolean>(false);
  readonly currentSelectedElement = input.required<IndexedNode>();

  readonly selectNode = output<IndexedNode | null>();
  readonly selectDomElement = output<IndexedNode>();
  readonly setParents = output<FlatNode[] | null>();
  readonly highlightComponent = output<ElementPosition>();
  readonly removeComponentHighlight = output<void>();
  readonly toggleInspector = output<void>();

  readonly viewport = viewChild.required<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);

  readonly selectedNode = signal<FlatNode | null>(null);
  readonly highlightIdInTreeFromElement = signal<number | null>(null);
  readonly matchedNodes = signal<Map<number, NodeTextMatch[]>>(new Map()); // Node index, NodeTextMatch
  readonly matchesCount = computed(() => this.matchedNodes().size);
  readonly currentlyMatchedIndex = signal<number>(-1);

  readonly treeControl = new FlatTreeControl<FlatNode>(
    (node) => node!.level,
    (node) => node.expandable,
  );
  readonly dataSource = new ComponentDataSource(this.treeControl);
  readonly itemHeight = NODE_ITEM_HEIGHT;
  readonly filterGenerator = directiveForestFilterFnGenerator;

  private parents!: FlatNode[];
  private initialized = false;
  private forestRoot: FlatNode | null = null;
  private resizeObserver: ResizeObserver;

  constructor() {
    this.subscribeToInspectorEvents();
    afterRenderEffect({
      read: () => {
        // Listen for tab updates to reset the scroll position to the top
        // This ensures the viewport is properly updated when switching tabs
        this.tabUpdate.tabUpdate();

        const viewport = this.viewport();
        viewport.scrollToIndex(0);
        viewport.checkViewportSize();
      },
    });

    // In some cases there a height changes, we need to recalculate the viewport size.
    this.resizeObserver = new ResizeObserver(() => {
      this.viewport().scrollToIndex(0);
      this.viewport().checkViewportSize();
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);

    effect(() => {
      const result = this.updateForest(this.forest());

      const changed =
        result.movedItems.length || result.newItems.length || result.removedItems.length;

      if (changed) {
        this.reselectNodeOnUpdate();
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }

  handleSelectDomElement(node: FlatNode): void {
    this.selectDomElement.emit(node.original);
  }

  highlightNode(node: FlatNode): void {
    this.highlightIdInTreeFromElement.set(null);
    this.highlightComponent.emit(node.position);
  }

  removeHighlight(): void {
    this.removeComponentHighlight.emit();
  }

  selectAndEnsureVisible(node: FlatNode): void {
    this.select(node);

    const scrollParent = this.viewport().elementRef.nativeElement;
    // The top most point we see an element
    const top = scrollParent.scrollTop;
    // That's the bottom most point we currently see an element.
    const parentHeight = scrollParent.offsetHeight;
    const bottom = top + parentHeight;
    const idx = this.dataSource.expandedDataValues.findIndex((el) => el.id === node.id);
    // The node might be hidden.
    if (idx < 0) {
      return;
    }
    const itemTop = idx * this.itemHeight;
    if (itemTop < top) {
      scrollParent.scrollTo({top: itemTop});
    } else if (bottom < itemTop + this.itemHeight) {
      scrollParent.scrollTo({top: itemTop - parentHeight + this.itemHeight});
    }
  }

  select(node: FlatNode): void {
    this.populateParents(node.position);
    this.selectNode.emit(node.original);
    this.selectedNode.set(node);
    this.currentlyMatchedIndex.set(-1);
  }

  clearSelectedNode(): void {
    this.selectNode.emit(null);
    this.selectedNode.set(null);
    this.parents = [];
    this.setParents.emit(null);
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  navigateUp(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    event.preventDefault();

    const data = this.dataSource.expandedDataValues;
    const selectedNode = this.selectedNode();
    let prevIdx = data.findIndex((e) => selectedNode && e.id === selectedNode.id) - 1;
    if (prevIdx < 0) {
      return;
    }
    let prevNode = data[prevIdx];
    const currentNode = data[prevIdx + 1];
    if (prevNode.position.length <= currentNode.position.length) {
      return this.selectAndEnsureVisible(data[prevIdx]);
    }
    while (prevIdx >= 0 && parentCollapsed(prevIdx, data, this.treeControl)) {
      prevIdx--;
      prevNode = data[prevIdx];
    }
    this.selectAndEnsureVisible(data[prevIdx]);
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  navigateDown(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    event.preventDefault();

    const data = this.dataSource.expandedDataValues;
    const selectedNode = this.selectedNode();
    let idx = data.findIndex((e) => selectedNode && e.id === selectedNode.id);
    const currentNode = data[idx];
    if (!this.treeControl.isExpanded(currentNode) && currentNode.expandable) {
      for (let i = idx + 1; i < data.length; i++) {
        const node = data[i];
        if (!isChildOf(node.position, currentNode.position)) {
          idx = i;
          break;
        }
      }
    } else {
      idx++;
    }
    if (idx >= data.length) {
      return;
    }
    this.selectAndEnsureVisible(data[idx]);
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  collapseCurrent(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return;
    }
    this.treeControl.collapse(selectedNode);
    event.preventDefault();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  expandCurrent(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return;
    }
    this.treeControl.expand(selectedNode);
    event.preventDefault();
  }

  isEditingDirectiveState(event: KeyboardEvent): boolean {
    return (event.target as Element).tagName === 'INPUT' || !this.selectedNode;
  }

  handleFilter(filterFn: FilterFn): void {
    this.currentlyMatchedIndex.set(-1);
    this.matchedNodes.set(new Map());

    for (let i = 0; i < this.dataSource.data.length; i++) {
      const node = this.dataSource.data[i];
      const fullName = getFullNodeNameString(node);
      const matches = filterFn(fullName);

      if (matches.length) {
        this.matchedNodes.update((matched) => {
          const map = new Map(matched);
          map.set(i, matches);
          return map;
        });
      }
    }

    // Select the first match, if there are any.
    if (this.matchesCount()) {
      this.navigateMatchedNode('next');
    }
  }

  navigateMatchedNode(dir: 'next' | 'prev') {
    const dirIdx = dir === 'next' ? 1 : -1;
    const indexesOfMatchedNodes = Array.from(this.matchedNodes());
    const newMatchedIndex =
      (this.currentlyMatchedIndex() + dirIdx + indexesOfMatchedNodes.length) %
      indexesOfMatchedNodes.length;

    const [nodeIdxToSelect] = indexesOfMatchedNodes[newMatchedIndex];
    const nodeToSelect = this.dataSource.data[nodeIdxToSelect];
    if (nodeIdxToSelect !== undefined) {
      this.treeControl.expand(nodeToSelect);
      this.selectAndEnsureVisible(nodeToSelect);

      // Set the `currentlyMatchedIndex` after `selectAndEnsureVisible` since it resets it.
      this.currentlyMatchedIndex.set(newMatchedIndex);
    }
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents();
    }
  }

  private reselectNodeOnUpdate(): void {
    const nodeThatStillExists = this.dataSource.getFlatNodeFromIndexedNode(
      this.currentSelectedElement(),
    );
    if (nodeThatStillExists) {
      this.select(nodeThatStillExists);
    } else if (this.forestRoot) {
      this.select(this.forestRoot);
    } else {
      this.clearSelectedNode();
    }
  }

  private updateForest(forest: DevToolsNode[]): {
    newItems: FlatNode[];
    movedItems: FlatNode[];
    removedItems: FlatNode[];
  } {
    const result = this.dataSource.update(forest, this.showCommentNodes());
    this.forestRoot = this.dataSource.data[0];

    if (!this.initialized && forest && forest.length) {
      this.treeControl.expandAll();
      this.initialized = true;
      result.newItems.forEach((item) => (item.newItem = false));
    }
    // We want to expand them once they are rendered.
    result.newItems.forEach((item) => {
      this.treeControl.expand(item);
    });
    return result;
  }

  private populateParents(position: ElementPosition): void {
    this.parents = [];
    for (let i = 1; i <= position.length; i++) {
      const current = position.slice(0, i);
      const selectedNode = this.dataSource.data.find(
        (item) => item.position.toString() === current.toString(),
      );

      // We might not be able to find the parent if the user has hidden the comment nodes.
      if (selectedNode) {
        this.parents.push(selectedNode);
      }
    }
    this.setParents.emit(this.parents);
  }

  private subscribeToInspectorEvents(): void {
    this.messageBus.on('selectComponent', (id: number) => {
      this.selectNodeByComponentId(id);
      this.toggleInspector.emit();
      this.expandParents();
    });

    this.messageBus.on('highlightComponent', (id: number) => {
      this.highlightIdInTreeFromElement.set(id);
    });

    this.messageBus.on('removeComponentHighlight', () => {
      this.highlightIdInTreeFromElement.set(null);
    });
  }

  private selectNodeByComponentId(id: number): void {
    const foundNode = this.dataSource.data.find((node) => node.original.component?.id === id);
    if (foundNode) {
      this.selectAndEnsureVisible(foundNode);
    }
  }

  private expandParents(): void {
    this.parents.forEach((parent) => this.treeControl.expand(parent));
  }
}
