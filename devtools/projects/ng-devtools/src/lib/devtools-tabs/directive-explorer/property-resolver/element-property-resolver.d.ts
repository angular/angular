/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentExplorerViewProperties, Descriptor, DirectivesProperties, Events, MessageBus } from '../../../../../../protocol';
import { IndexedNode } from '../directive-forest/index-forest';
import { DirectivePropertyResolver } from './directive-property-resolver';
export interface FlatNode {
    expandable: boolean;
    prop: Property;
    level: number;
}
export interface Property {
    name: string;
    descriptor: Descriptor;
    parent: Property | null;
}
export declare class ElementPropertyResolver {
    private _messageBus;
    private _directivePropertiesController;
    constructor(_messageBus: MessageBus<Events>);
    clearProperties(): void;
    setProperties(indexedNode: IndexedNode, data: DirectivesProperties): void;
    private _flushDeletedProperties;
    getExpandedProperties(): ComponentExplorerViewProperties;
    getDirectiveController(directive: string): DirectivePropertyResolver | undefined;
}
