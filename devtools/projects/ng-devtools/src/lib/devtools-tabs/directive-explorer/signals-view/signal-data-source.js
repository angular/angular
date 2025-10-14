/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
export const arrayifyProps = (props, parent = null) =>
  Object.entries(props)
    .map(([name, val]) => ({name, descriptor: val, parent}))
    .sort((a, b) => {
      const parsedA = parseInt(a.name, 10);
      const parsedB = parseInt(b.name, 10);
      if (isNaN(parsedA) || isNaN(parsedB)) {
        return a.name > b.name ? 1 : -1;
      }
      return parsedA - parsedB;
    });
export class SignalDataSource extends DataSource {
  constructor(props, treeFlattener, treeControl, entityPosition, messageBus) {
    super();
    this.treeFlattener = treeFlattener;
    this.treeControl = treeControl;
    this.entityPosition = entityPosition;
    this.messageBus = messageBus;
    this.data = new BehaviorSubject([]);
    this.expandedData = new BehaviorSubject([]);
    this.destroy = new Subject();
    this.data.next(
      this.treeFlattener.flattenNodes([
        {
          descriptor: props,
          parent: null,
          name: 'value',
        },
      ]),
    );
  }
  connect(collectionViewer) {
    this.treeControl.expansionModel.changed.pipe(takeUntil(this.destroy)).subscribe((change) => {
      for (const node of change.added) {
        this.toggleNode(node, true);
      }
      for (const node of change.removed.reverse()) {
        this.toggleNode(node, false);
      }
    });
    const changes = [
      collectionViewer.viewChange,
      this.treeControl.expansionModel.changed,
      this.data,
    ];
    merge(...changes)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.expandedData.next(
          this.treeFlattener.expandFlattenedNodes(this.data.value, this.treeControl),
        );
      });
    return this.expandedData.asObservable();
  }
  disconnect() {
    this.destroy.next();
  }
  toggleNode(node, expand) {
    const index = this.data.value.indexOf(node);
    // If we cannot find the current node, or the current node is not expandable
    // or...if it's expandable but it does have a value, or we're collapsing
    // we're not interested in fetching its children.
    if (index < 0 || !node.expandable || node.prop.descriptor.value || !expand) {
      return;
    }
    let parentPath = [];
    let current = node.prop;
    while (current) {
      parentPath.push(current.name);
      current = current.parent;
    }
    if (parentPath.pop() !== 'value') {
      throw new Error('expected parentPath to start with value');
    }
    parentPath = parentPath.reverse();
    this.messageBus.emit('getSignalNestedProperties', [this.entityPosition, parentPath]);
    this.messageBus.once('signalNestedProperties', (_position, data, _path) => {
      node.prop.descriptor.value = data.props;
      this.treeControl.expand(node);
      const props = arrayifyProps(data.props, node.prop);
      const flatNodes = this.treeFlattener.flattenNodes(props);
      flatNodes.forEach((f) => (f.level += node.level + 1));
      this.data.value.splice(index + 1, 0, ...flatNodes);
      this.data.next(this.data.value);
    });
  }
}
//# sourceMappingURL=signal-data-source.js.map
