/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {FlatTreeControl} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild,} from '@angular/core';
import {DevToolsNode, ElementPosition, Events, MessageBus} from 'protocol';
import {Subscription} from 'rxjs';

import {TabUpdate} from '../../tab-update/index';

import {ComponentDataSource, FlatNode} from './component-data-source';
import {isChildOf, parentCollapsed} from './directive-forest-utils';
import {IndexedNode} from './index-forest';

@Component({
  selector: 'ng-directive-forest',
  templateUrl: './directive-forest.component.html',
  styleUrls: ['./directive-forest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectiveForestComponent implements OnInit, OnDestroy {
  @Input()
  set forest(forest: DevToolsNode[]) {
    this._latestForest = forest;
    const result = this._updateForest(forest);
    const changed =
        result.movedItems.length || result.newItems.length || result.removedItems.length;
    if (this.currentSelectedElement && changed) {
      this._reselectNodeOnUpdate();
    }
  }
  @Input() currentSelectedElement: IndexedNode;
  @Input()
  set showCommentNodes(show: boolean) {
    this._showCommentNodes = show;
    this.forest = this._latestForest;
  }

  @Output() selectNode = new EventEmitter<IndexedNode|null>();
  @Output() selectDomElement = new EventEmitter<IndexedNode>();
  @Output() setParents = new EventEmitter<FlatNode[]|null>();
  @Output() highlightComponent = new EventEmitter<ElementPosition>();
  @Output() removeComponentHighlight = new EventEmitter<void>();
  @Output() toggleInspector = new EventEmitter<void>();

  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

  filterRegex = new RegExp('.^');
  currentlyMatchedIndex = -1;

  selectedNode: FlatNode|null = null;
  parents: FlatNode[];

  private _highlightIDinTreeFromElement: number|null = null;
  private _tabUpdateSubscription: Subscription;
  private _showCommentNodes = false;
  private _latestForest: DevToolsNode[];

  set highlightIDinTreeFromElement(id: number|null) {
    this._highlightIDinTreeFromElement = id;
    this._cdr.markForCheck();
  }

  readonly treeControl =
      new FlatTreeControl<FlatNode>((node) => node.level, (node) => node.expandable);
  readonly dataSource = new ComponentDataSource(this.treeControl);
  readonly itemHeight = 18;

  private _initialized = false;

  constructor(
      private _tabUpdate: TabUpdate, private _messageBus: MessageBus<Events>,
      private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscribeToInspectorEvents();
    this._tabUpdateSubscription = this._tabUpdate.tabUpdate$.subscribe(() => {
      if (this.viewport) {
        setTimeout(() => {
          this.viewport.scrollToIndex(0);
          this.viewport.checkViewportSize();
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this._tabUpdateSubscription) {
      this._tabUpdateSubscription.unsubscribe();
    }
  }

  subscribeToInspectorEvents(): void {
    this._messageBus.on('selectComponent', (id: number) => {
      this.selectNodeByComponentId(id);
      this.toggleInspector.emit();
      this.expandParents();
    });

    this._messageBus.on('highlightComponent', (id: number) => {
      this.highlightIDinTreeFromElement = id;
    });

    this._messageBus.on('removeComponentHighlight', () => {
      this.highlightIDinTreeFromElement = null;
    });
  }

  selectNodeByComponentId(id: number): void {
    const foundNode = this.dataSource.data.find((node) => node.original.component?.id === id);
    if (foundNode) {
      this.handleSelect(foundNode);
    }
  }

  handleSelect(node: FlatNode): void {
    this.currentlyMatchedIndex =
        this.dataSource.data.findIndex((matchedNode) => matchedNode.id === node.id);
    this.selectAndEnsureVisible(node);
  }

  handleSelectDomElement(node: FlatNode): void {
    this.selectDomElement.emit(node.original);
  }

  selectAndEnsureVisible(node: FlatNode): void {
    this.select(node);

    const scrollParent = this.viewport.elementRef.nativeElement;
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
    this.selectedNode = node;
  }

  clearSelectedNode(): void {
    this.selectNode.emit(null);
    this.selectedNode = null;
    this.parents = [];
    this.setParents.emit(null);
  }

  private _reselectNodeOnUpdate(): void {
    const nodeThatStillExists =
        this.dataSource.getFlatNodeFromIndexedNode(this.currentSelectedElement);
    if (nodeThatStillExists) {
      this.select(nodeThatStillExists);
    } else {
      this.clearSelectedNode();
    }
  }

  private _updateForest(forest: DevToolsNode[]):
      {newItems: FlatNode[]; movedItems: FlatNode[]; removedItems: FlatNode[];} {
    const result = this.dataSource.update(forest, this._showCommentNodes);
    if (!this._initialized && forest && forest.length) {
      this.treeControl.expandAll();
      this._initialized = true;
      result.newItems.forEach((item) => (item.newItem = false));
    }
    // We want to expand them once they are rendered.
    result.newItems.forEach((item) => {
      this.treeControl.expand(item);
    });
    return result;
  }

  populateParents(position: ElementPosition): void {
    this.parents = [];
    for (let i = 1; i <= position.length; i++) {
      const current = position.slice(0, i);
      const selectedNode =
          this.dataSource.data.find((item) => item.position.toString() === current.toString());

      // We might not be able to find the parent if the user has hidden the comment nodes.
      if (selectedNode) {
        this.parents.push(selectedNode);
      }
    }
    this.setParents.emit(this.parents);
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  navigateUp(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    event.preventDefault();

    const data = this.dataSource.expandedDataValues;
    let prevIdx = data.findIndex((e) => this.selectedNode && e.id === this.selectedNode.id) - 1;
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
    let idx = data.findIndex((e) => this.selectedNode && e.id === this.selectedNode.id);
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
    if (!this.selectedNode) {
      return;
    }
    this.treeControl.collapse(this.selectedNode);
    event.preventDefault();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  expandCurrent(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    if (!this.selectedNode) {
      return;
    }
    this.treeControl.expand(this.selectedNode);
    event.preventDefault();
  }

  isEditingDirectiveState(event: KeyboardEvent): boolean {
    return (event.target as Element).tagName === 'INPUT' || !this.selectedNode;
  }

  isSelected(node: FlatNode): boolean {
    return !!this.selectedNode && this.selectedNode.id === node.id;
  }

  isMatched(node: FlatNode): boolean {
    return this.filterRegex.test(node.name.toLowerCase()) ||
        this.filterRegex.test(node.directives.toLowerCase());
  }

  handleFilter(filterText: string): void {
    this.currentlyMatchedIndex = -1;

    try {
      this.filterRegex = new RegExp(filterText.toLowerCase() || '.^');
    } catch {
      this.filterRegex = new RegExp('.^');
    }
  }

  private _findMatchedNodes(): number[] {
    const indexesOfMatchedNodes: number[] = [];
    for (let i = 0; i < this.dataSource.data.length; i++) {
      if (this.isMatched(this.dataSource.data[i])) {
        indexesOfMatchedNodes.push(i);
      }
    }
    return indexesOfMatchedNodes;
  }

  get hasMatched(): boolean {
    return this._findMatchedNodes().length > 0;
  }

  nextMatched(): void {
    const indexesOfMatchedNodes = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex + 1) % indexesOfMatchedNodes.length;
    const indexToSelect = indexesOfMatchedNodes[this.currentlyMatchedIndex];
    const nodeToSelect = this.dataSource.data[indexToSelect];
    if (indexToSelect !== undefined) {
      this.treeControl.expand(nodeToSelect);
      this.selectAndEnsureVisible(nodeToSelect);
    }
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents();
    }
  }

  prevMatched(): void {
    const indexesOfMatchedNodes = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex - 1 + indexesOfMatchedNodes.length) %
        indexesOfMatchedNodes.length;
    const indexToSelect = indexesOfMatchedNodes[this.currentlyMatchedIndex];
    const nodeToSelect = this.dataSource.data[indexToSelect];
    if (indexToSelect !== undefined) {
      this.treeControl.expand(nodeToSelect);
      this.selectAndEnsureVisible(nodeToSelect);
    }
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents();
    }
  }

  expandParents(): void {
    this.parents.forEach((parent) => this.treeControl.expand(parent));
  }

  highlightNode(position: ElementPosition): void {
    this._highlightIDinTreeFromElement = null;
    this.highlightComponent.emit(position);
  }

  removeHighlight(): void {
    this.removeComponentHighlight.emit();
  }

  isHighlighted(node: FlatNode): boolean {
    return !!this._highlightIDinTreeFromElement &&
        this._highlightIDinTreeFromElement === node.original.component?.id;
  }

  isElement(node: FlatNode): boolean|null {
    return node.original.component && node.original.component.isElement;
  }
}
