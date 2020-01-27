import { Component, Input, EventEmitter, HostListener, Output, ViewChild, ElementRef } from '@angular/core';
import { Node } from 'protocol';
import { FlatTreeControl, CdkTree } from '@angular/cdk/tree';
import { FlatNode, ComponentDataSource } from './component-data-source';

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

@Component({
  selector: 'ng-component-tree',
  templateUrl: './component-tree.component.html',
  styleUrls: ['./component-tree.component.css'],
})
export class ComponentTreeComponent {
  @Output() selectNode = new EventEmitter();

  @ViewChild(CdkTree) tree: CdkTree<any>;

  selectedNode: FlatNode | null = null;
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );
  dataSource = new ComponentDataSource(this.treeControl);

  private _initialized = false;

  hasChild = (_: number, node: FlatNode) => node.expandable;

  constructor(private _host: ElementRef) {}

  select(node: FlatNode) {
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

  @Input() set forest(forest: Node[]) {
    this.dataSource.update(forest);
    if (!this._initialized && forest && forest.length) {
      this.treeControl.expandAll();
      this._initialized = true;
    }
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  navigateUp(evnt: KeyboardEvent) {
    if (!this.selectedNode) {
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
  navigateDown(evnt: KeyboardEvent) {
    if (!this.selectedNode) {
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
  collapseCurrent(evnt: KeyboardEvent) {
    if (!this.selectedNode) {
      return;
    }
    this.treeControl.collapse(this.selectedNode);
    evnt.preventDefault();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  expandCurrent(evnt: KeyboardEvent) {
    if (!this.selectedNode) {
      return;
    }
    this.treeControl.expand(this.selectedNode);
    evnt.preventDefault();
  }

  isSelected(node: FlatNode) {
    if (!this.selectedNode) {
      return false;
    }
    return this.selectedNode.id.join(',') === node.id.join(',');
  }
}

const isChildOf = (childId: number[], parentId: number[]) => {
  if (childId.length <= parentId.length) {
    return false;
  }
  for (let i = 0; i < parentId.length; i++) {
    if (childId[i] !== parentId[i]) {
      return false;
    }
  }
  return true;
};

const parentCollapsed = (nodeIdx: number, all: FlatNode[], treeControl: FlatTreeControl<FlatNode>) => {
  const node = all[nodeIdx];
  for (let i = nodeIdx - 1; i >= 0; i--) {
    if (isChildOf(node.id, all[i].id) && !treeControl.isExpanded(all[i])) {
      return true;
    }
  }
  return false;
};
