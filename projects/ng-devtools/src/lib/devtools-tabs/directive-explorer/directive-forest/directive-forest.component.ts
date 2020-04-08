import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DevToolsNode, ElementPosition } from 'protocol';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ComponentDataSource, FlatNode } from './component-data-source';
import { isChildOf, parentCollapsed } from './directive-forest-utils';
import { IndexedNode } from './index-forest';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'ng-directive-forest',
  templateUrl: './directive-forest.component.html',
  styleUrls: ['./directive-forest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectiveForestComponent {
  @Input() set forest(forest: DevToolsNode[]) {
    const result = this._updateForest(forest);
    const changed = result.movedItems.length || result.newItems.length || result.removedItems.length;
    if (this.currentSelectedElement && changed) {
      this._reselectNodeOnUpdate();
    }
  }
  @Input() highlightIDinTreeFromElement: ElementPosition | null = null;
  @Input() currentSelectedElement: IndexedNode;

  @Output() selectNode = new EventEmitter<IndexedNode | null>();
  @Output() selectDomElement = new EventEmitter<IndexedNode>();
  @Output() setParents = new EventEmitter<FlatNode[] | null>();
  @Output() highlightFromComponent = new EventEmitter<ElementPosition>();
  @Output() unhighlightFromComponent = new EventEmitter<null>();

  @ViewChild(CdkVirtualScrollViewport) scrollParentElement: CdkVirtualScrollViewport;

  filterRegex = new RegExp('.^');
  currentlyMatchedIndex = -1;

  selectedNode: FlatNode | null = null;
  parents: FlatNode[];

  readonly treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );
  readonly dataSource = new ComponentDataSource(this.treeControl);
  readonly itemHeight = 21;

  private _initialized = false;

  hasChild = (_: number, node: FlatNode) => node.expandable;

  handleSelect(node: FlatNode): void {
    this.currentlyMatchedIndex = this.dataSource.data.findIndex((matchedNode) => matchedNode.id === node.id);
    this.selectAndEnsureVisible(this.currentlyMatchedIndex);
  }

  handleSelectDomElement(node: FlatNode): void {
    this.selectDomElement.emit(node.original);
  }

  selectAndEnsureVisible(idx: number): void {
    this.select(idx);

    const scrollParent = this.scrollParentElement.elementRef.nativeElement;
    // The top most point we see an element
    const top = scrollParent.scrollTop;
    // That's the bottom most point we currently see an element.
    const bottom = top + scrollParent.offsetHeight;
    const itemTop = idx * this.itemHeight;
    if (itemTop < top) {
      scrollParent.scrollTo({ top: itemTop });
    } else if (bottom < itemTop + this.itemHeight) {
      scrollParent.scrollTo({ top: itemTop - scrollParent.offsetHeight + this.itemHeight });
    }
  }

  select(idx: number): void {
    const node = this.dataSource.data[idx];
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
    const nodeThatStillExists = this.dataSource.getFlatNodeFromIndexedNode(this.currentSelectedElement);
    if (nodeThatStillExists) {
      this.select(this.dataSource.data.indexOf(nodeThatStillExists));
    } else {
      this.clearSelectedNode();
    }
  }

  private _updateForest(
    forest: DevToolsNode[]
  ): { newItems: FlatNode[]; movedItems: FlatNode[]; removedItems: FlatNode[] } {
    const result = this.dataSource.update(forest);
    if (!this._initialized && forest && forest.length) {
      this.treeControl.expandAll();
      this._initialized = true;
      result.newItems.forEach((item) => (item.newItem = false));
    }
    result.newItems.forEach((item) => {
      this.treeControl.expand(item);
    });
    return result;
  }

  populateParents(position: ElementPosition): void {
    this.parents = position.reduce((nodes: FlatNode[], index: number) => {
      let nodePosition = [index];
      if (nodes.length > 0) {
        nodePosition = nodes[nodes.length - 1].position.concat(index);
      }
      // It's possible selectedNode to be undefined
      // In this case, we don't want to push it to the list
      // of parent nodes. Instead, we want to report a warning.
      const selectedNode = this.dataSource.data.find((item) => item.position.toString() === nodePosition.toString());
      if (selectedNode) {
        nodes.push(selectedNode);
      } else {
        console.warn('Cant find node for position', nodePosition);
      }
      return nodes;
    }, []);
    this.setParents.emit(this.parents);
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  navigateUp(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    event.preventDefault();

    const data = this.dataSource.data;
    let prevIdx = data.findIndex((e) => this.selectedNode && e.id === this.selectedNode.id) - 1;
    if (prevIdx < 0) {
      return;
    }
    let prevNode = data[prevIdx];
    const currentNode = data[prevIdx + 1];
    if (prevNode.position.length <= currentNode.position.length) {
      return this.selectAndEnsureVisible(prevIdx);
    }
    while (prevIdx >= 0 && parentCollapsed(prevIdx, data, this.treeControl)) {
      prevIdx--;
      prevNode = data[prevIdx];
    }
    this.selectAndEnsureVisible(prevIdx);
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  navigateDown(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }
    event.preventDefault();

    const data = this.dataSource.data;
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
    this.selectAndEnsureVisible(idx);
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
    return this.filterRegex.test(node.name.toLowerCase()) || this.filterRegex.test(node.directives.toLowerCase());
  }

  handleFilter(filterText: string): void {
    this.resetCurrentlyMatchedIndex();
    this.setFilterRegex(filterText);
  }

  resetCurrentlyMatchedIndex(): void {
    this.currentlyMatchedIndex = -1;
  }

  setFilterRegex(filterText: string): void {
    try {
      this.filterRegex = new RegExp(filterText.toLowerCase() || '.^');
    } catch {
      this.filterRegex = new RegExp('.^');
    }
  }

  _findMatchedNodes(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.dataSource.data.length; i++) {
      if (this.isMatched(this.dataSource.data[i])) {
        result.push(i);
      }
    }
    return result;
  }

  hasMatched(): boolean {
    return this._findMatchedNodes().length > 0;
  }

  nextMatched(): void {
    const matchedTree = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex + 1) % matchedTree.length;
    const indexToSelect = matchedTree[this.currentlyMatchedIndex];
    if (indexToSelect !== undefined) {
      this.selectAndEnsureVisible(indexToSelect);
    }
    const nodeToSelect = this.dataSource.data[indexToSelect];
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.parents.forEach((parent) => this.treeControl.expand(parent));
    }
  }

  prevMatched(): void {
    const matchedTree = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex - 1 + matchedTree.length) % matchedTree.length;
    const indexToSelect = matchedTree[this.currentlyMatchedIndex];
    if (indexToSelect !== undefined) {
      this.selectAndEnsureVisible(indexToSelect);
    }
    const nodeToSelect = this.dataSource.data[indexToSelect];
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.parents.forEach((parent) => this.treeControl.expand(parent));
    }
  }

  highlightNode(position: ElementPosition): void {
    this.highlightFromComponent.emit(position);
  }

  removeHighlight(): void {
    this.unhighlightFromComponent.emit();
  }

  isHighlighted(node: FlatNode): boolean {
    return (
      !!this.highlightIDinTreeFromElement && this.highlightIDinTreeFromElement.join(',') === node.position.join(',')
    );
  }

  isElement(node: FlatNode): boolean | null {
    return node.original.component && node.original.component.isElement;
  }
}
