/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {DataSource} from '@angular/cdk/collections';
import {DefaultIterableDiffer} from '@angular/core';
import {BehaviorSubject, merge} from 'rxjs';
import {map} from 'rxjs/operators';
import {diff} from '../../diffing';
import {arrayifyProps} from './arrayify-props';
const trackBy = (_, item) => `#${item.prop.name}#${item.prop.descriptor.preview}#${item.level}`;
export class PropertyDataSource extends DataSource {
  constructor(props, _treeFlattener, _treeControl, _entityPosition, _messageBus) {
    super();
    this._treeFlattener = _treeFlattener;
    this._treeControl = _treeControl;
    this._entityPosition = _entityPosition;
    this._messageBus = _messageBus;
    this._data = new BehaviorSubject([]);
    this._subscriptions = [];
    this._expandedData = new BehaviorSubject([]);
    this._differ = new DefaultIterableDiffer(trackBy);
    this._data.next(this._treeFlattener.flattenNodes(arrayifyProps(props)));
  }
  get data() {
    return this._data.value;
  }
  get treeControl() {
    return this._treeControl;
  }
  update(props) {
    const newData = this._treeFlattener.flattenNodes(arrayifyProps(props));
    diff(this._differ, this.data, newData);
    this._data.next(this.data);
  }
  connect(collectionViewer) {
    const changed = this._treeControl.expansionModel.changed;
    if (!changed) {
      throw new Error('Unable to subscribe to the expansion model change');
    }
    const s = changed.subscribe((change) => {
      if (change.added) {
        change.added.forEach((node) => this._toggleNode(node, true));
      }
      if (change.removed) {
        change.removed.reverse().forEach((node) => this._toggleNode(node, false));
      }
    });
    this._subscriptions.push(s);
    const changes = [
      collectionViewer.viewChange,
      this._treeControl.expansionModel.changed,
      this._data,
    ];
    return merge(...changes).pipe(
      map(() => {
        this._expandedData.next(
          this._treeFlattener.expandFlattenedNodes(this.data, this._treeControl),
        );
        return this._expandedData.value;
      }),
    );
  }
  disconnect() {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }
  _toggleNode(node, expand) {
    const index = this.data.indexOf(node);
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
      if (!current.parent) {
        break;
      }
      current = current.parent;
    }
    parentPath = parentPath.reverse();
    this._messageBus.emit('getNestedProperties', [this._entityPosition, parentPath]);
    this._messageBus.once('nestedProperties', (position, data, _path) => {
      node.prop.descriptor.value = data.props;
      this._treeControl.expand(node);
      const props = arrayifyProps(data.props, node.prop);
      const flatNodes = this._treeFlattener.flattenNodes(props);
      flatNodes.forEach((f) => (f.level += node.level + 1));
      this.data.splice(index + 1, 0, ...flatNodes);
      this._data.next(this.data);
    });
  }
}
//# sourceMappingURL=property-data-source.js.map
