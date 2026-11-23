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

import {getTreeFlattener} from './flatten';
import {PropertyDataSource} from './property-data-source';
import {getExpandedDirectiveProperties} from './property-expanded-directive-properties';
import {FlatNode, Property} from '../../../shared/object-tree-explorer/object-tree-types';

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
  private treeFlattener = getTreeFlattener();

  private treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private inputsDataSource: PropertyDataSource;
  private propsDataSource: PropertyDataSource;
  private outputsDataSource: PropertyDataSource;
  private stateDataSource: PropertyDataSource;

  constructor(
    private messageBus: MessageBus<Events>,
    private props: Properties,
    private directivePos: DirectivePosition,
  ) {
    const {inputs, props: properties, outputs, state} = this.classifyProperties();

    this.inputsDataSource = this.createDataSourceFromProps(inputs);
    this.propsDataSource = this.createDataSourceFromProps(properties);
    this.outputsDataSource = this.createDataSourceFromProps(outputs);
    this.stateDataSource = this.createDataSourceFromProps(state);
  }

  get directiveInputControls(): DirectiveTreeData {
    return getDirectiveControls(this.inputsDataSource);
  }

  get directivePropControls(): DirectiveTreeData {
    return getDirectiveControls(this.propsDataSource);
  }

  get directiveOutputControls(): DirectiveTreeData {
    return getDirectiveControls(this.outputsDataSource);
  }

  get directiveStateControls(): DirectiveTreeData {
    return getDirectiveControls(this.stateDataSource);
  }

  get directiveMetadata(): DirectiveMetadata | undefined {
    return this.props.metadata;
  }

  get directiveProperties(): {[name: string]: Descriptor} {
    return this.props.props;
  }

  get directivePosition(): DirectivePosition {
    return this.directivePos;
  }

  getExpandedProperties(): NestedProp[] {
    return [
      ...getExpandedDirectiveProperties(this.inputsDataSource.data),
      ...getExpandedDirectiveProperties(this.propsDataSource.data),
      ...getExpandedDirectiveProperties(this.outputsDataSource.data),
      ...getExpandedDirectiveProperties(this.stateDataSource.data),
    ];
  }

  updateProperties(newProps: Properties): void {
    this.props = newProps;
    const {inputs, props, outputs, state} = this.classifyProperties();

    this.inputsDataSource.update(inputs);
    this.propsDataSource.update(props);
    this.outputsDataSource.update(outputs);
    this.stateDataSource.update(state);
  }

  updateValue(node: FlatNode, newValue: unknown): void {
    const directiveId = this.directivePos;
    const keyPath = constructPathOfKeysToPropertyValue(node.prop);
    this.messageBus.emit('updateState', [{directiveId, keyPath, newValue}]);
    node.prop.descriptor.value = newValue;
  }

  logValue(node?: FlatNode): void {
    const directiveId = this.directivePos;
    const keyPath = node ? constructPathOfKeysToPropertyValue(node.prop) : null;
    this.messageBus.emit('logValue', [{directiveId, keyPath}]);
  }

  private createDataSourceFromProps(props: {[name: string]: Descriptor}): PropertyDataSource {
    return new PropertyDataSource(
      props,
      this.treeFlattener,
      this.treeControl,
      this.directivePos,
      this.messageBus,
    );
  }

  private classifyProperties(): {
    inputs: {[name: string]: Descriptor};
    props: {[name: string]: Descriptor};
    outputs: {[name: string]: Descriptor};
    state: {[name: string]: Descriptor};
  } {
    const metadata = this.props.metadata;
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
