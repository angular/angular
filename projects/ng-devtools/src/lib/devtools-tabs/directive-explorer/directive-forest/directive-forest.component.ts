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
import { CdkTree, FlatTreeControl } from '@angular/cdk/tree';
import { ComponentDataSource, FlatNode } from './component-data-source';

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import { isChildOf, parentCollapsed } from './directive-forest-utils';
import { IndexedNode } from './index-forest';
import { arrayEquals } from 'shared-utils';

@Component({
  selector: 'ng-directive-forest',
  templateUrl: './directive-forest.component.html',
  styleUrls: ['./directive-forest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectiveForestComponent {
  @Input() set forest(forest: DevToolsNode[]) {
    this._updateForest(forest);

    if (this.currentSelectedElement) {
      this._reselectNodeOnUpdate();
    }
  }
  @Input() highlightIDinTreeFromElement: ElementPosition | null = null;
  @Input() currentSelectedElement: IndexedNode;

  @Output() selectNode = new EventEmitter();
  @Output() selectDomElement = new EventEmitter();
  @Output() highlightFromComponent = new EventEmitter<ElementPosition>();
  @Output() unhighlightFromComponent = new EventEmitter<null>();

  @ViewChild(CdkTree) tree: CdkTree<any>;

  filterRegex = new RegExp('.^');
  currentlyMatchedIndex = -1;

  selectedNode: FlatNode | null = null;
  parents: FlatNode[];

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );
  dataSource = new ComponentDataSource(this.treeControl);

  private _initialized = false;

  hasChild = (_: number, node: FlatNode) => node.expandable;

  constructor(private _host: ElementRef) {}

  handleSelect(node: FlatNode): void {
    const matchedTree: FlatNode[] = this._findMatchedNodes();
    this.currentlyMatchedIndex = matchedTree.findIndex(matchedNode => matchedNode.id === node.id);
    this.select(node);
  }

  handleSelectDomElement(node: FlatNode): void {
    this.selectDomElement.emit(node.original);
  }

  select(node: FlatNode): void {
    this.populateParents(node.position);
    this.selectNode.emit(node.original);
    this.selectedNode = node;

    // We wait for the CD to run.
    setTimeout(() => {
      const el = this._host.nativeElement.querySelector('.selected');
      if (!el) {
        return;
      }
      scrollIntoViewIfNeeded(el, {
        scrollMode: 'if-needed',
        block: 'nearest',
        inline: 'nearest',
      });
    }, 0);
  }

  clearSelectedNode(): void {
    this.selectNode.emit(null);
    this.selectedNode = null;
    this.parents = [];
  }

  private _findCurrentlySelectedNode(currentlySelected: IndexedNode): FlatNode {
    return this.dataSource.data.find(flatNode => {
      const flatNodeIsNotComponent = flatNode.id[0] === '-';
      if (currentlySelected.component && flatNodeIsNotComponent) {
        return false;
      }

      const idArray = flatNode.id
        .split('-')
        .filter(id => id !== '')
        .map(Number);

      return currentlySelected.component
        ? idArray[0] === currentlySelected.component.id
        : arrayEquals(
            idArray,
            currentlySelected.directives.map(dir => dir.id)
          );
    });
  }

  private _reselectNodeOnUpdate(): void {
    const searchNode = this._findCurrentlySelectedNode(this.currentSelectedElement);
    if (searchNode) {
      this.select(searchNode);
    } else {
      this.clearSelectedNode();
    }
  }

  private _updateForest(forest: DevToolsNode[]): void {
    const newItems = this.dataSource.update(forest);
    if (!this._initialized && forest && forest.length) {
      this.treeControl.expandAll();
      this._initialized = true;
      newItems.forEach(item => (item.newItem = false));
    }
    if (newItems && newItems.length) {
      newItems.forEach(item => {
        this.treeControl.expand(item);
      });
    }
  }

  populateParents(position: ElementPosition): void {
    this.parents = position.reduce((nodes: FlatNode[], index: number) => {
      let nodeId = [index];
      if (nodes.length > 0) {
        nodeId = nodes[nodes.length - 1].position.concat(index);
      }
      const selectedNode = this.dataSource.data.find(item => item.position.toString() === nodeId.toString());
      nodes.push(selectedNode);
      return nodes;
    }, []);
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  navigateUp(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }

    const data = this.dataSource.data;
    let prevIdx = data.findIndex(e => e.id === this.selectedNode.id) - 1;
    if (prevIdx < 0) {
      return;
    }
    let prevNode = data[prevIdx];
    const currentNode = data[prevIdx + 1];
    if (prevNode.position.length <= currentNode.position.length) {
      return this.select(data[prevIdx]);
    }
    while (prevIdx >= 0 && parentCollapsed(prevIdx, data, this.treeControl)) {
      prevIdx--;
      prevNode = data[prevIdx];
    }
    this.select(data[prevIdx]);

    event.preventDefault();
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  navigateDown(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
      return;
    }

    const data = this.dataSource.data;
    let idx = data.findIndex(e => e.id === this.selectedNode.id);
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
    this.select(data[idx]);

    event.preventDefault();
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  collapseCurrent(event: KeyboardEvent): void {
    if (this.isEditingDirectiveState(event)) {
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

  _findMatchedNodes(): FlatNode[] {
    return this.dataSource.data.filter(node => this.isMatched(node));
  }

  hasMatched(): boolean {
    return this._findMatchedNodes().length > 0;
  }

  nextMatched(): void {
    const matchedTree: FlatNode[] = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex + 1) % matchedTree.length;
    const nodeToSelect = matchedTree[this.currentlyMatchedIndex];
    const nodeIsVisible = this.dataSource.expandedDataValues.find(node => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents(nodeToSelect);
    }
    if (nodeToSelect) {
      this.select(nodeToSelect);
    }
  }

  prevMatched(): void {
    const matchedTree: FlatNode[] = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex - 1 + matchedTree.length) % matchedTree.length;
    const nodeToSelect = matchedTree[this.currentlyMatchedIndex];
    const nodeIsVisible = this.dataSource.expandedDataValues.find(node => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents(nodeToSelect);
    }
    if (nodeToSelect) {
      this.select(nodeToSelect);
    }
  }

  expandParents(nodeToExpand: FlatNode): void {
    if (nodeToExpand) {
      const parentNode = this.dataSource.data.find(node =>
        arrayEquals(node.position, nodeToExpand.position.slice(0, nodeToExpand.position.length - 1))
      );
      this.treeControl.expand(parentNode);
      this.expandParents(parentNode);
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
}
