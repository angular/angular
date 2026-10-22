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
import {BehaviorSubject, merge, Observable, Subscription, map} from 'rxjs';

import {diff} from '../diffing';

import {arrayifyProps} from './arrayify-props';
import {FlatNode, Property} from '../../../shared/object-tree-explorer/object-tree-types';

const trackBy: TrackByFunction<FlatNode> = (_: number, item: FlatNode) =>
  `#${item.prop.name}#${item.level}`;

export class PropertyDataSource extends DataSource<FlatNode> {
  private dataStream = new BehaviorSubject<FlatNode[]>([]);
  private subscriptions: Subscription[] = [];
  private expandedData = new BehaviorSubject<FlatNode[]>([]);
  private differ = new DefaultIterableDiffer<FlatNode>(trackBy);

  constructor(
    props: {[prop: string]: Descriptor},
    private treeFlattener: MatTreeFlattener<Property, FlatNode>,
    private treeCtrl: FlatTreeControl<FlatNode>,
    private entityPosition: DirectivePosition,
    private messageBus: MessageBus<Events>,
  ) {
    super();
    this.dataStream.next(this.treeFlattener.flattenNodes(arrayifyProps(props)));
  }

  get data(): FlatNode[] {
    return this.dataStream.value;
  }

  get treeControl(): FlatTreeControl<FlatNode> {
    return this.treeCtrl;
  }

  update(props: {[prop: string]: Descriptor}): void {
    const newData = this.treeFlattener.flattenNodes(arrayifyProps(props));
    diff(this.differ, this.data, newData);
    this.dataStream.next(this.data);
  }

  override connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changed = this.treeCtrl.expansionModel.changed;
    if (!changed) {
      throw new Error('Unable to subscribe to the expansion model change');
    }
    const s = changed.subscribe((change: SelectionChange<FlatNode>) => {
      if (change.added) {
        change.added.forEach((node) => this.toggleNode(node, true));
      }
      if (change.removed) {
        change.removed.reverse().forEach((node) => this.toggleNode(node, false));
      }
    });
    this.subscriptions.push(s);

    const changes = [
      collectionViewer.viewChange,
      this.treeCtrl.expansionModel.changed,
      this.dataStream,
    ];

    return merge<unknown[]>(...changes).pipe(
      map(() => {
        this.expandedData.next(this.treeFlattener.expandFlattenedNodes(this.data, this.treeCtrl));
        return this.expandedData.value;
      }),
    );
  }

  override disconnect(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }

  private toggleNode(node: FlatNode, expand: boolean): void {
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

    this.messageBus.emit('getNestedProperties', [this.entityPosition, parentPath]);

    this.messageBus.once(
      'nestedProperties',
      (position: DirectivePosition, data: Properties, _path: string[]) => {
        node.prop.descriptor.value = data.props;
        this.treeCtrl.expand(node);
        const props = arrayifyProps(data.props, node.prop);
        const flatNodes = this.treeFlattener.flattenNodes(props);
        flatNodes.forEach((f) => (f.level += node.level + 1));
        this.data.splice(index + 1, 0, ...flatNodes);
        this.dataStream.next(this.data);
      },
    );
  }
}
