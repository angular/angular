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
import { Node } from 'protocol';
import { CdkTree, FlatTreeControl } from '@angular/cdk/tree';
import { ComponentDataSource, FlatNode } from './component-data-source';

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import { isChildOf, parentCollapsed } from './directive-forest-utils';
import { animate, style, transition, trigger } from '@angular/animations';
import { FilterComponent } from './filter/filter.component';

@Component({
  selector: 'ng-directive-forest',
  templateUrl: './directive-forest.component.html',
  styleUrls: ['./directive-forest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('simpleFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(75, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(75, style({ opacity: 0 }))
      ])])]
})
export class DirectiveForestComponent {
  @Input() set forest(forest: Node[]) {
    this.dataSource.update(forest);
    if (!this._initialized && forest && forest.length) {
      this.treeControl.expandAll();
      this._initialized = true;
    }
  }

  @Output() selectNode = new EventEmitter();

  @ViewChild(CdkTree) tree: CdkTree<any>;

  @ViewChild(FilterComponent) filterComponent;

  filterRegex = new RegExp('.^');
  currentlyMatchedIndex = -1;

  selectedNode: FlatNode | null = null;
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
    this.currentlyMatchedIndex = matchedTree.findIndex(matchedNode =>  matchedNode.id === node.id);
    this.select(node);
  }

  select(node: FlatNode): void {
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

  @HostListener('document:keydown.ArrowUp', ['$event'])
  navigateUp(evnt: KeyboardEvent): void {
    if (this.invalidArrowEvent(evnt)) {
      return;
    }
    evnt.preventDefault();
    const data = this.dataSource.data;
    let prevIdx = data.findIndex(e => e.id === this.selectedNode.id) - 1;
    if (prevIdx < 0) {
      return;
    }
    let prevNode = data[prevIdx];
    const currentNode = data[prevIdx + 1];
    if (prevNode.id.length <= currentNode.id.length) {
      return this.select(data[prevIdx]);
    }
    while (prevIdx >= 0 && parentCollapsed(prevIdx, data, this.treeControl)) {
      prevIdx--;
      prevNode = data[prevIdx];
    }
    this.select(data[prevIdx]);
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  navigateDown(evnt: KeyboardEvent): void {
    if (this.invalidArrowEvent(evnt)) {
      return;
    }
    const data = this.dataSource.data;
    let idx = data.findIndex(e => e.id === this.selectedNode.id);
    const currentNode = data[idx];
    if (!this.treeControl.isExpanded(currentNode) && currentNode.expandable) {
      for (let i = idx + 1; i < data.length; i++) {
        const node = data[i];
        if (!isChildOf(node.id, currentNode.id)) {
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
    evnt.preventDefault();
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  collapseCurrent(evnt: KeyboardEvent): void {
    if (this.invalidArrowEvent(evnt)) {
      return;
    }
    this.treeControl.collapse(this.selectedNode);
    evnt.preventDefault();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  expandCurrent(evnt: KeyboardEvent): void {
    if (this.invalidArrowEvent(evnt)) {
      return;
    }
    this.treeControl.expand(this.selectedNode);
    evnt.preventDefault();
  }

  invalidArrowEvent(event: KeyboardEvent): boolean {
    return event.target === this.filterComponent.filterElement.nativeElement || !this.selectedNode;
  }

  isSelected(node: FlatNode): boolean {
    return !!this.selectedNode && this.selectedNode.id.join(',') === node.id.join(',');
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
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
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
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents(nodeToSelect);
    }
    if (nodeToSelect) {
      this.select(nodeToSelect);
    }
  }

  expandParents(nodeToExpand: FlatNode): void {
    if (nodeToExpand) {
      // Todo: implement optimized array equals method
      const parentNode = this.dataSource.data.find(node =>
        node.id.toString() === nodeToExpand.id.slice(0, nodeToExpand.id.length - 1).toString());
      this.treeControl.expand(parentNode);
      this.expandParents(parentNode);
    }
  }
}

