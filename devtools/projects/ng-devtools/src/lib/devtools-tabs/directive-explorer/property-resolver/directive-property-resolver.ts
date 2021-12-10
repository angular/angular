/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {ViewEncapsulation} from '@angular/core';
import {Descriptor, DirectivePosition, Events, MessageBus, NestedProp, Properties} from 'protocol';

import {FlatNode, Property} from './element-property-resolver';
import {getTreeFlattener} from './flatten';
import {PropertyDataSource} from './property-data-source';
import {getExpandedDirectiveProperties} from './property-expanded-directive-properties';

export interface DirectiveTreeData {
  dataSource: PropertyDataSource;
  treeControl: FlatTreeControl<FlatNode>;
}

const getDirectiveControls = (dataSource: PropertyDataSource):
    {dataSource: PropertyDataSource; treeControl: FlatTreeControl<FlatNode>} => {
      const treeControl = dataSource.treeControl;
      return {
        dataSource,
        treeControl,
      };
    };

export const constructPathOfKeysToPropertyValue =
    (nodePropToGetKeysFor: Property, keys: string[] = []): string[] => {
      keys.unshift(nodePropToGetKeysFor.name);
      const parentNodeProp = nodePropToGetKeysFor.parent;
      if (parentNodeProp) {
        constructPathOfKeysToPropertyValue(parentNodeProp, keys);
      }
      return keys;
    };

export class DirectivePropertyResolver {
  private _treeFlattener = getTreeFlattener();

  private _treeControl =
      new FlatTreeControl<FlatNode>((node) => node.level, (node) => node.expandable);

  private _inputsDataSource: PropertyDataSource;
  private _outputsDataSource: PropertyDataSource;
  private _stateDataSource: PropertyDataSource;

  constructor(
      private _messageBus: MessageBus<Events>, private _props: Properties,
      private _directivePosition: DirectivePosition) {
    this._initDataSources();
  }

  get directiveInputControls(): DirectiveTreeData {
    return getDirectiveControls(this._inputsDataSource);
  }

  get directiveOutputControls(): DirectiveTreeData {
    return getDirectiveControls(this._outputsDataSource);
  }

  get directiveStateControls(): DirectiveTreeData {
    return getDirectiveControls(this._stateDataSource);
  }

  get directiveProperties(): {[name: string]: Descriptor} {
    return this._props.props;
  }

  get directivePosition(): DirectivePosition {
    return this._directivePosition;
  }

  get directiveViewEncapsulation(): ViewEncapsulation|undefined {
    return this._props.metadata?.encapsulation;
  }

  get directiveHasOnPushStrategy(): boolean|undefined {
    return this._props.metadata?.onPush;
  }

  getExpandedProperties(): NestedProp[] {
    return [
      ...getExpandedDirectiveProperties(this._inputsDataSource.data),
      ...getExpandedDirectiveProperties(this._outputsDataSource.data),
      ...getExpandedDirectiveProperties(this._stateDataSource.data),
    ];
  }

  updateProperties(newProps: Properties): void {
    this._props = newProps;
    const {inputProps, outputProps, stateProps} = this._classifyProperties();

    this._inputsDataSource.update(inputProps);
    this._outputsDataSource.update(outputProps);
    this._stateDataSource.update(stateProps);
  }

  updateValue(node: FlatNode, newValue: any): void {
    const directiveId = this._directivePosition;
    const keyPath = constructPathOfKeysToPropertyValue(node.prop);
    this._messageBus.emit('updateState', [{directiveId, keyPath, newValue}]);
    node.prop.descriptor.value = newValue;
  }

  private _initDataSources(): void {
    const {inputProps, outputProps, stateProps} = this._classifyProperties();

    this._inputsDataSource = this._createDataSourceFromProps(inputProps);
    this._outputsDataSource = this._createDataSourceFromProps(outputProps);
    this._stateDataSource = this._createDataSourceFromProps(stateProps);
  }

  private _createDataSourceFromProps(props: {[name: string]: Descriptor}): PropertyDataSource {
    return new PropertyDataSource(
        props, this._treeFlattener, this._treeControl, this._directivePosition, this._messageBus);
  }

  private _classifyProperties(): {
    inputProps: {[name: string]: Descriptor}; outputProps: {[name: string]: Descriptor};
    stateProps: {[name: string]: Descriptor};
  } {
    const inputLabels: Set<string> = new Set(Object.values(this._props.metadata?.inputs || {}));
    const outputLabels: Set<string> = new Set(Object.values(this._props.metadata?.outputs || {}));

    const inputProps = {};
    const outputProps = {};
    const stateProps = {};
    let propPointer: {[name: string]: Descriptor};

    Object.keys(this.directiveProperties).forEach((propName) => {
      propPointer = inputLabels.has(propName) ? inputProps :
          outputLabels.has(propName)          ? outputProps :
                                                stateProps;
      propPointer[propName] = this.directiveProperties[propName];
    });

    return {
      inputProps,
      outputProps,
      stateProps,
    };
  }
}
