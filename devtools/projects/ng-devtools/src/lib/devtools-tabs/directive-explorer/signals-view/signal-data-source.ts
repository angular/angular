/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CollectionViewer, DataSource, SelectionChange} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {
  Descriptor,
  DirectivePosition,
  Events,
  MessageBus,
  Properties,
  SignalNodePosition,
} from '../../../../../../protocol';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {tap, takeUntil} from 'rxjs/operators';

import {FlatNode, Property} from './signals-value-tree.component';

export const arrayifyProps = (
  props: {[prop: string]: Descriptor} | Descriptor[],
  parent: Property | null = null,
): Property[] =>
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

export class SignalDataSource extends DataSource<FlatNode> {
  private data = new BehaviorSubject<FlatNode[]>([]);
  private expandedData = new BehaviorSubject<FlatNode[]>([]);
  private readonly destroy = new Subject<void>();

  constructor(
    props: Descriptor,
    private treeFlattener: MatTreeFlattener<Property, FlatNode>,
    private treeControl: FlatTreeControl<FlatNode>,
    private entityPosition: SignalNodePosition,
    private messageBus: MessageBus<Events>,
  ) {
    super();
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

  override connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    this.treeControl.expansionModel.changed
      .pipe(takeUntil(this.destroy))
      .subscribe((change: SelectionChange<FlatNode>) => {
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

    merge<unknown[]>(...changes)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.expandedData.next(
          this.treeFlattener.expandFlattenedNodes(this.data.value, this.treeControl),
        );
      });

    return this.expandedData.asObservable();
  }

  override disconnect(): void {
    this.destroy.next();
  }

  private toggleNode(node: FlatNode, expand: boolean): void {
    const index = this.data.value.indexOf(node);
    // If we cannot find the current node, or the current node is not expandable
    // or...if it's expandable but it does have a value, or we're collapsing
    // we're not interested in fetching its children.
    if (index < 0 || !node.expandable || node.prop.descriptor.value || !expand) {
      return;
    }

    let parentPath: string[] = [];
    let current: Property | null = node.prop;
    while (current) {
      parentPath.push(current.name);
      current = current.parent;
    }
    if (parentPath.pop() !== 'value') {
      throw new Error('expected parentPath to start with value');
    }
    parentPath = parentPath.reverse();

    this.messageBus.emit('getSignalNestedProperties', [this.entityPosition, parentPath]);

    this.messageBus.once(
      'signalNestedProperties',
      (_position: DirectivePosition, data: Properties, _path: string[]) => {
        node.prop.descriptor.value = data.props;
        this.treeControl.expand(node);
        const props = arrayifyProps(data.props, node.prop);
        const flatNodes = this.treeFlattener.flattenNodes(props);
        flatNodes.forEach((f) => (f.level += node.level + 1));
        this.data.value.splice(index + 1, 0, ...flatNodes);
        this.data.next(this.data.value);
      },
    );
  }
}
