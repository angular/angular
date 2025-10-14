/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FlatTreeControl } from '@angular/cdk/tree';
import { Descriptor, DirectiveMetadata, DirectivePosition, Events, MessageBus, NestedProp, Properties } from '../../../../../../protocol';
import { FlatNode, Property } from './element-property-resolver';
import { PropertyDataSource } from './property-data-source';
export interface DirectiveTreeData {
    dataSource: PropertyDataSource;
    treeControl: FlatTreeControl<FlatNode>;
}
export declare const constructPathOfKeysToPropertyValue: (nodePropToGetKeysFor: Property, keys?: string[]) => string[];
export declare class DirectivePropertyResolver {
    private _messageBus;
    private _props;
    private _directivePosition;
    private _treeFlattener;
    private _treeControl;
    private _inputsDataSource;
    private _propsDataSource;
    private _outputsDataSource;
    private _stateDataSource;
    constructor(_messageBus: MessageBus<Events>, _props: Properties, _directivePosition: DirectivePosition);
    get directiveInputControls(): DirectiveTreeData;
    get directivePropControls(): DirectiveTreeData;
    get directiveOutputControls(): DirectiveTreeData;
    get directiveStateControls(): DirectiveTreeData;
    get directiveMetadata(): DirectiveMetadata | undefined;
    get directiveProperties(): {
        [name: string]: Descriptor;
    };
    get directivePosition(): DirectivePosition;
    getExpandedProperties(): NestedProp[];
    updateProperties(newProps: Properties): void;
    updateValue(node: FlatNode, newValue: unknown): void;
    private _createDataSourceFromProps;
    private _classifyProperties;
}
