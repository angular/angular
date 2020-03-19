import { Injectable } from '@angular/core';
import {
  DirectivesProperties,
  ComponentExplorerViewProperties,
  Descriptor,
  MessageBus,
  Events,
  PropType,
  Properties,
  DirectivePosition,
  NestedProp,
} from 'protocol';
import { PropertyDataSource } from './property-data-source';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener } from '@angular/material/tree';
import { Observable } from 'rxjs';
import { getExpandedDirectiveProperties } from './property-expanded-directive-properties';
import { IndexedNode } from './directive-forest/index-forest';

export interface FlatNode {
  expandable: boolean;
  prop: Property;
  level: number;
}

export interface Property {
  name: string;
  descriptor: Descriptor;
  parent: Property;
}

const expandable = (prop: Descriptor) => {
  if (!prop) {
    return false;
  }
  if (!prop.expandable) {
    return false;
  }
  return !(prop.type !== PropType.Object && prop.type !== PropType.Array);
};

export class PropertyController {
  _treeFlattener = new MatTreeFlattener(
    (node: Property, level: number): FlatNode => {
      return {
        expandable: expandable(node.descriptor),
        prop: node,
        level,
      };
    },
    node => node.level,
    node => node.expandable,
    node => this._getChildren(node)
  );

  _treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  private _dataSource = new PropertyDataSource(
    this._props.props,
    this._treeFlattener,
    this._treeControl,
    this._directivePosition,
    this._messageBus
  );

  constructor(
    private _messageBus: MessageBus<Events>,
    private _props: Properties,
    private _directivePosition: DirectivePosition
  ) {}

  getDirectiveControls(): { dataSource: PropertyDataSource; treeControl: FlatTreeControl<FlatNode> } {
    return {
      dataSource: this._dataSource,
      treeControl: this._treeControl,
    };
  }

  getDirectiveProperties(): { [name: string]: Descriptor } {
    return this._props.props;
  }

  getExpandedProperties(): NestedProp[] {
    return getExpandedDirectiveProperties(this._dataSource.data);
  }

  updateValue(node: FlatNode, newValue: any): void {
    const directiveId = this._directivePosition;
    const keyPath = this._constructPathOfKeysToPropertyValue(node.prop);
    this._messageBus.emit('updateState', [{ directiveId, keyPath, newValue }]);
    node.prop.descriptor.value = newValue;
  }

  private _constructPathOfKeysToPropertyValue(nodePropToGetKeysFor: Property, keys: string[] = []): string[] {
    keys.unshift(nodePropToGetKeysFor.name);
    const parentNodeProp = nodePropToGetKeysFor.parent;
    if (parentNodeProp) {
      this._constructPathOfKeysToPropertyValue(parentNodeProp, keys);
    }
    return keys;
  }

  private _getChildren(prop: Property): Property[] {
    const descriptor = prop.descriptor;
    if (descriptor.type === PropType.Object && !(descriptor.value instanceof Observable)) {
      return Object.keys(descriptor.value || {}).map(name => {
        return {
          name,
          descriptor: descriptor.value ? descriptor.value[name] : null,
          parent: prop,
        };
      });
    } else if (descriptor.type === PropType.Array && !(descriptor.value instanceof Observable)) {
      return (descriptor.value || []).map((el: Descriptor, idx: number) => {
        return {
          name: idx.toString(),
          descriptor: el,
          parent: prop,
        };
      });
    } else {
      console.error('Unexpected data type', descriptor, 'in property', prop);
    }
  }
}

@Injectable()
export class NestedPropertyResolver {
  private _directivePropertiesController: Map<string, PropertyController>;

  constructor(private _messageBus: MessageBus<Events>) {}

  setProperties(indexedNode: IndexedNode, data: DirectivesProperties): void {
    this._directivePropertiesController = new Map<string, PropertyController>();
    Object.keys(data).forEach(key => {
      const position: DirectivePosition = {
        element: indexedNode.position,
        directive: undefined,
      };
      if (!indexedNode.component || indexedNode.component.name !== key) {
        position.directive = indexedNode.directives.findIndex(d => d.name === key);
      }
      this._directivePropertiesController.set(key, new PropertyController(this._messageBus, data[key], position));
    });
  }

  getExpandedProperties(): ComponentExplorerViewProperties {
    const result: ComponentExplorerViewProperties = {};
    for (const [directive] of this._directivePropertiesController) {
      const controller = this._directivePropertiesController.get(directive);
      if (!controller) {
        console.error('Unable to find nested properties controller for', directive);
        continue;
      }
      result[directive] = controller.getExpandedProperties();
    }
    return {} as any;
  }

  getDirectiveController(directive: string): PropertyController | undefined {
    return this._directivePropertiesController.get(directive);
  }
}
