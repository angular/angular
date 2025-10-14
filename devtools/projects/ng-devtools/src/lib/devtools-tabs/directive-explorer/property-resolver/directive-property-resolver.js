/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FlatTreeControl} from '@angular/cdk/tree';
import {getTreeFlattener} from './flatten';
import {PropertyDataSource} from './property-data-source';
import {getExpandedDirectiveProperties} from './property-expanded-directive-properties';
const getDirectiveControls = (dataSource) => {
  const treeControl = dataSource.treeControl;
  return {
    dataSource,
    treeControl,
  };
};
export const constructPathOfKeysToPropertyValue = (nodePropToGetKeysFor, keys = []) => {
  keys.unshift(nodePropToGetKeysFor.name);
  const parentNodeProp = nodePropToGetKeysFor.parent;
  if (parentNodeProp) {
    constructPathOfKeysToPropertyValue(parentNodeProp, keys);
  }
  return keys;
};
export class DirectivePropertyResolver {
  constructor(_messageBus, _props, _directivePosition) {
    this._messageBus = _messageBus;
    this._props = _props;
    this._directivePosition = _directivePosition;
    this._treeFlattener = getTreeFlattener();
    this._treeControl = new FlatTreeControl(
      (node) => node.level,
      (node) => node.expandable,
    );
    const {inputs, props, outputs, state} = this._classifyProperties();
    this._inputsDataSource = this._createDataSourceFromProps(inputs);
    this._propsDataSource = this._createDataSourceFromProps(props);
    this._outputsDataSource = this._createDataSourceFromProps(outputs);
    this._stateDataSource = this._createDataSourceFromProps(state);
  }
  get directiveInputControls() {
    return getDirectiveControls(this._inputsDataSource);
  }
  get directivePropControls() {
    return getDirectiveControls(this._propsDataSource);
  }
  get directiveOutputControls() {
    return getDirectiveControls(this._outputsDataSource);
  }
  get directiveStateControls() {
    return getDirectiveControls(this._stateDataSource);
  }
  get directiveMetadata() {
    return this._props.metadata;
  }
  get directiveProperties() {
    return this._props.props;
  }
  get directivePosition() {
    return this._directivePosition;
  }
  getExpandedProperties() {
    return [
      ...getExpandedDirectiveProperties(this._inputsDataSource.data),
      ...getExpandedDirectiveProperties(this._propsDataSource.data),
      ...getExpandedDirectiveProperties(this._outputsDataSource.data),
      ...getExpandedDirectiveProperties(this._stateDataSource.data),
    ];
  }
  updateProperties(newProps) {
    this._props = newProps;
    const {inputs, props, outputs, state} = this._classifyProperties();
    this._inputsDataSource.update(inputs);
    this._propsDataSource.update(props);
    this._outputsDataSource.update(outputs);
    this._stateDataSource.update(state);
  }
  updateValue(node, newValue) {
    const directiveId = this._directivePosition;
    const keyPath = constructPathOfKeysToPropertyValue(node.prop);
    this._messageBus.emit('updateState', [{directiveId, keyPath, newValue}]);
    node.prop.descriptor.value = newValue;
  }
  _createDataSourceFromProps(props) {
    return new PropertyDataSource(
      props,
      this._treeFlattener,
      this._treeControl,
      this._directivePosition,
      this._messageBus,
    );
  }
  _classifyProperties() {
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
    const inputs = {};
    const props = {};
    const outputs = {};
    const state = {};
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
//# sourceMappingURL=directive-property-resolver.js.map
