/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CollectionViewer, DataSource, SelectionChange} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DefaultIterableDiffer, TrackByFunction} from '@angular/core';
import {MatTreeFlattener} from '@angular/material/tree';
import {
  Descriptor,
  DirectivePosition,
  Events,
  MessageBus,
  Properties,
} from '../../../../../../protocol';
import {BehaviorSubject, merge, Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

import {diff} from '../../diffing';

import {arrayifyProps} from './arrayify-props';
import {FlatNode, Property} from './element-property-resolver';

const trackBy: TrackByFunction<FlatNode> = (_: number, item: FlatNode) =>
  `#${item.prop.name}#${item.prop.descriptor.preview}#${item.level}`;

export class PropertyDataSource extends DataSource<FlatNode> {
  private _data = new BehaviorSubject<FlatNode[]>([]);
  private _subscriptions: Subscription[] = [];
  private _expandedData = new BehaviorSubject<FlatNode[]>([]);
  private _differ = new DefaultIterableDiffer<FlatNode>(trackBy);

  constructor(
    props: {[prop: string]: Descriptor},
    private _treeFlattener: MatTreeFlattener<Property, FlatNode>,
    private _treeControl: FlatTreeControl<FlatNode>,
    private _entityPosition: DirectivePosition,
    private _messageBus: MessageBus<Events>,
  ) {
    super();
    this._data.next(this._treeFlattener.flattenNodes(arrayifyProps(props)));
  }

  get data(): FlatNode[] {
    return this._data.value;
  }

  get treeControl(): FlatTreeControl<FlatNode> {
    return this._treeControl;
  }

  update(props: {[prop: string]: Descriptor}): void {
    const newData = this._treeFlattener.flattenNodes(arrayifyProps(props));
    diff(this._differ, this.data, newData);
    this._data.next(this.data);
  }

  override connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changed = this._treeControl.expansionModel.changed;
    if (!changed) {
      throw new Error('Unable to subscribe to the expansion model change');
    }
    const s = changed.subscribe((change: SelectionChange<FlatNode>) => {
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

    return merge<unknown[]>(...changes).pipe(
      map(() => {
        this._expandedData.next(
          this._treeFlattener.expandFlattenedNodes(this.data, this._treeControl),
        );
        return this._expandedData.value;
      }),
    );
  }

  override disconnect(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }

  private _toggleNode(node: FlatNode, expand: boolean): void {
    const index = this.data.indexOf(node);
    // If we cannot find the current node, or the current node is not expandable
    // or...if it's expandable but it does have a value, or we're collapsing
    // we're not interested in fetching its children.
    if (index < 0 || !node.expandable || node.prop.descriptor.value || !expand) {
      return;
    }

    let parentPath: string[] = [];
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

    this._messageBus.once(
      'nestedProperties',
      (position: DirectivePosition, data: Properties, _path: string[]) => {
        node.prop.descriptor.value = data.props;
        this._treeControl.expand(node);
        const props = arrayifyProps(data.props, node.prop);
        const flatNodes = this._treeFlattener.flattenNodes(props);
        flatNodes.forEach((f) => (f.level += node.level + 1));
        this.data.splice(index + 1, 0, ...flatNodes);
        this._data.next(this.data);
      },
    );
  }
}
