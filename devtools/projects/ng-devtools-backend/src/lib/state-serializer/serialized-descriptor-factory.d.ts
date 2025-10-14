/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ContainerType, Descriptor, NestedProp, PropType } from '../../../../protocol';
type NestedType = PropType.Array | PropType.Object;
export interface CompositeType {
    type: Extract<PropType, NestedType>;
    prop: any;
    containerType: ContainerType;
}
export interface TerminalType {
    type: Exclude<PropType, NestedType>;
    prop: any;
    containerType: ContainerType;
}
export type PropertyData = TerminalType | CompositeType;
export type Formatter<Result> = {
    [key in PropType]: (data: any) => Result;
};
interface LevelOptions {
    currentLevel: number;
    level?: number;
}
type NestedSerializerFn = (instance: any, propName: string | number, nodes: NestedProp[], isReadonly: boolean, currentLevel: number, level?: number) => Descriptor;
export declare function createShallowSerializedDescriptor(instance: any, propName: string | number, propData: TerminalType, isReadonly: boolean): Descriptor;
export declare function createLevelSerializedDescriptor(instance: {}, propName: string | number, propData: CompositeType, levelOptions: LevelOptions, continuation: (instance: any, propName: string | number, isReadonly: boolean, level?: number, max?: number) => Descriptor): Descriptor;
export declare function createNestedSerializedDescriptor(instance: {}, propName: string | number, propData: CompositeType, levelOptions: LevelOptions, nodes: NestedProp[], nestedSerializer: NestedSerializerFn): Descriptor;
export {};
