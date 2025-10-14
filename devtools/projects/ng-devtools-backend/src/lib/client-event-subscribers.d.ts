/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentType, DevToolsNode, DirectiveType, Events, MessageBus, Route } from '../../../protocol';
import { RoutePropertyType } from './router-tree';
import { DirectiveForestHooks } from './hooks/hooks';
export declare const subscribeToClientEvents: (messageBus: MessageBus<Events>, depsForTestOnly?: {
    directiveForestHooks?: typeof DirectiveForestHooks;
}) => void;
/**
 * Opens the source code of a component or a directive in the editor.
 * @param name - The name of the component, provider, or directive to view source for.
 * @param type - The type of the element to view source for  component, provider, or directive.
 * @returns - The element instance of the component, provider, or directive.
 */
export declare const viewSourceFromRouter: (name: string, type: RoutePropertyType) => any;
export interface SerializableDirectiveInstanceType extends DirectiveType {
    id: number;
}
export interface SerializableComponentInstanceType extends ComponentType {
    id: number;
}
export interface SerializableComponentTreeNode extends DevToolsNode<SerializableDirectiveInstanceType, SerializableComponentInstanceType> {
    children: SerializableComponentTreeNode[];
    nativeElement?: never;
    hasNativeElement: boolean;
}
export declare function sanitizeRouteData(route: Route): Route;
