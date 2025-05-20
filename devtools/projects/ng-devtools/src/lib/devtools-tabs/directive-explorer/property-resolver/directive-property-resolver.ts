/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {
  Descriptor,
  DirectiveMetadata,
  DirectivePosition,
  Events,
  MessageBus,
  NestedProp,
  Properties,
} from '../../../../../../protocol';

import {FlatNode, Property} from './element-property-resolver';
import {getTreeFlattener} from './flatten';
import {PropertyDataSource} from './property-data-source';
import {getExpandedDirectiveProperties} from './property-expanded-directive-properties';

export interface DirectiveTreeData {
  dataSource: PropertyDataSource;
  treeControl: FlatTreeControl<FlatNode>;
}

const getDirectiveControls = (
  dataSource: PropertyDataSource,
): {dataSource: PropertyDataSource; treeControl: FlatTreeControl<FlatNode>} => {
  const treeControl = dataSource.treeControl;
  return {
    dataSource,
    treeControl,
  };
};

export const constructPathOfKeysToPropertyValue = (
  nodePropToGetKeysFor: Property,
  keys: string[] = [],
): string[] => {
  keys.unshift(nodePropToGetKeysFor.name);
  const parentNodeProp = nodePropToGetKeysFor.parent;
  if (parentNodeProp) {
    constructPathOfKeysToPropertyValue(parentNodeProp, keys);
  }
  return keys;
};

export class DirectivePropertyResolver {
  private _treeFlattener = getTreeFlattener();

  private _treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private _inputsDataSource: PropertyDataSource;
  private _propsDataSource: PropertyDataSource;
  private _outputsDataSource: PropertyDataSource;
  private _stateDataSource: PropertyDataSource;

  constructor(
    private _messageBus: MessageBus<Events>,
    private _props: Properties,
    private _directivePosition: DirectivePosition,
  ) {
    const {inputs, props, outputs, state} = this._classifyProperties();

    this._inputsDataSource = this._createDataSourceFromProps(inputs);
    this._propsDataSource = this._createDataSourceFromProps(props);
    this._outputsDataSource = this._createDataSourceFromProps(outputs);
    this._stateDataSource = this._createDataSourceFromProps(state);
  }

  get directiveInputControls(): DirectiveTreeData {
    return getDirectiveControls(this._inputsDataSource);
  }

  get directivePropControls(): DirectiveTreeData {
    return getDirectiveControls(this._propsDataSource);
  }

  get directiveOutputControls(): DirectiveTreeData {
    return getDirectiveControls(this._outputsDataSource);
  }

  get directiveStateControls(): DirectiveTreeData {
    return getDirectiveControls(this._stateDataSource);
  }

  get directiveMetadata(): DirectiveMetadata | undefined {
    return this._props.metadata;
  }

  get directiveProperties(): {[name: string]: Descriptor} {
    return this._props.props;
  }

  get directivePosition(): DirectivePosition {
    return this._directivePosition;
  }

  getExpandedProperties(): NestedProp[] {
    return [
      ...getExpandedDirectiveProperties(this._inputsDataSource.data),
      ...getExpandedDirectiveProperties(this._propsDataSource.data),
      ...getExpandedDirectiveProperties(this._outputsDataSource.data),
      ...getExpandedDirectiveProperties(this._stateDataSource.data),
    ];
  }

  updateProperties(newProps: Properties): void {
    this._props = newProps;
    const {inputs, props, outputs, state} = this._classifyProperties();

    this._inputsDataSource.update(inputs);
    this._propsDataSource.update(props);
    this._outputsDataSource.update(outputs);
    this._stateDataSource.update(state);
  }

  updateValue(node: FlatNode, newValue: unknown): void {
    const directiveId = this._directivePosition;
    const keyPath = constructPathOfKeysToPropertyValue(node.prop);
    this._messageBus.emit('updateState', [{directiveId, keyPath, newValue}]);
    node.prop.descriptor.value = newValue;
  }

  private _createDataSourceFromProps(props: {[name: string]: Descriptor}): PropertyDataSource {
    return new PropertyDataSource(
      props,
      this._treeFlattener,
      this._treeControl,
      this._directivePosition,
      this._messageBus,
    );
  }

  private _classifyProperties(): {
    inputs: {[name: string]: Descriptor};
    props: {[name: string]: Descriptor};
    outputs: {[name: string]: Descriptor};
    state: {[name: string]: Descriptor};
  } {
    const metadata = this._props.metadata;
    if (!metadata) {
      return {
        inputs: {},
        props: {},
        outputs: {},
        state: this.directiveProperties,
      };
    }

    const inputLabels = new Set('inputs' in metadata ? Object.values(metadata.inputs) : []);
    const propLabels = new Set('props' in metadata ? Object.values(metadata.props) : []);
    const outputLabels = new Set('outputs' in metadata ? Object.values(metadata.outputs) : []);

    const inputs: {[name: string]: Descriptor} = {};
    const props: {[name: string]: Descriptor} = {};
    const outputs: {[name: string]: Descriptor} = {};
    const state: {[name: string]: Descriptor} = {};

    for (const [propName, value] of Object.entries(this.directiveProperties)) {
      if (inputLabels.has(propName)) {
        inputs[propName] = value;
      } else if (propLabels.has(propName)) {
        props[propName] = value;
      } else if (outputLabels.has(propName)) {
        outputs[propName] = value;
      } else {
        state[propName] = value;
      }
    }

    return {
      inputs,
      props,
      outputs,
      state,
    };
  }
}
