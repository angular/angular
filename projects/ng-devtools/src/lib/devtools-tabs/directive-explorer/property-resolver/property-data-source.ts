import { Descriptor, DirectivePosition, Events, MessageBus, Properties, PropType } from 'protocol';
import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { map } from 'rxjs/operators';
import { DefaultIterableDiffer } from '@angular/core';
import { diff } from '../../diffing';
import { FlatNode, Property } from './element-property-resolver';
import { PropertyViewFilterOptions } from './directive-property-resolver';

const expandable = (prop: Descriptor, messageBus?: MessageBus<Events>) => {
  if (!prop) {
    return false;
  }
  if (!prop.value && !messageBus) {
    return false;
  }
  if (!prop.expandable) {
    return false;
  }
  return !(prop.type !== PropType.Object && prop.type !== PropType.Array);
};

const trackBy = (_: number, item: FlatNode) => {
  return `#${item.prop.name}#${item.level}`;
};

export class PropertyDataSource extends DataSource<FlatNode> {
  private _data = new BehaviorSubject<FlatNode[]>([]);
  private _subscriptions: Subscription[] = [];
  private _expandedData = new BehaviorSubject<FlatNode[]>([]);
  private _differ = new DefaultIterableDiffer(trackBy);

  private readonly _originalData: FlatNode[];

  constructor(
    props: { [prop: string]: Descriptor },
    private _treeFlattener: MatTreeFlattener<Property, FlatNode>,
    private _treeControl: FlatTreeControl<FlatNode>,
    private _entityPosition: DirectivePosition,
    private _messageBus: MessageBus<Events>,
    private _onRequestingNestedProperties: () => void,
    private _onReceivedNestedProperties: () => void
  ) {
    super();
    this._originalData = this._treeFlattener.flattenNodes(this._arrayify(props));
    this._data.next(this._originalData);
  }

  get data(): FlatNode[] {
    return this._data.value;
  }

  get treeControl(): FlatTreeControl<FlatNode> {
    return this._treeControl;
  }

  update(props: { [prop: string]: Descriptor }): void {
    const newData = this._treeFlattener.flattenNodes(this._arrayify(props));
    diff(this._differ, this.data, newData);
    this._data.next(this.data);
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changed = this._treeControl.expansionModel.changed;
    if (!changed) {
      throw new Error('Unable to subscribe to the expansion model change');
    }
    const s = changed.subscribe((change: SelectionChange<FlatNode>) => {
      if (change.added) {
        change.added.forEach(node => this._toggleNode(node, true));
      }
      if (change.removed) {
        change.removed.reverse().forEach(node => this._toggleNode(node, false));
      }
    });
    this._subscriptions.push(s);

    const changes = [collectionViewer.viewChange, this._treeControl.expansionModel.changed, this._data];

    return merge(...changes).pipe(
      map(() => {
        this._expandedData.next(this._treeFlattener.expandFlattenedNodes(this.data, this._treeControl));
        return this._expandedData.value;
      })
    );
  }

  disconnect(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  private _arrayify(props: { [prop: string]: Descriptor }, parent: Property | null = null): Property[] {
    return Object.keys(props).map(name => ({ name, descriptor: props[name], parent }));
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

    this._onRequestingNestedProperties();
    this._messageBus.emit('getNestedProperties', [this._entityPosition, parentPath]);

    this._messageBus.once('nestedProperties', (position: DirectivePosition, data: Properties, path: string[]) => {
      node.prop.descriptor.value = data.props;
      this._treeControl.expand(node);
      const props = this._arrayify(data.props, node.prop);
      const flatNodes = this._treeFlattener.flattenNodes(props);
      flatNodes.forEach(f => (f.level += node.level + 1));
      this.data.splice(index + 1, 0, ...flatNodes);
      this._data.next(this.data);
      this._onReceivedNestedProperties();
    });
  }

  filterDataSource(filter: string[] | null): void {
    if (filter === null) {
      return;
    }
    let pushFlag = false;
    const filteredData: FlatNode[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this._originalData.length; i++) {
      const node = this._originalData[i];
      if (node.level === 0) {
        pushFlag = filter.includes(node.prop.name);
      }
      if (pushFlag) {
        filteredData.push(node);
      }
    }
    this._data.next(filteredData);
  }
}
