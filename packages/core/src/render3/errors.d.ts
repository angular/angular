/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
import { TNode } from './interfaces/node';
import { LView } from './interfaces/view';
/** Verifies that a given type is a Standalone Component. */
export declare function assertStandaloneComponentType(type: Type<unknown>): void;
/** Verifies whether a given type is a component */
export declare function assertComponentDef(type: Type<unknown>): void;
/** Called when there are multiple component selectors that match a given node */
export declare function throwMultipleComponentError(tNode: TNode, first: Type<unknown>, second: Type<unknown>): never;
/** Throws an ExpressionChangedAfterChecked error if checkNoChanges mode is on. */
export declare function throwErrorIfNoChangesMode(creationMode: boolean, oldValue: any, currValue: any, propName: string | undefined, lView: LView): never;
/**
 * Constructs an object that contains details for the ExpressionChangedAfterItHasBeenCheckedError:
 * - property name (for property bindings or interpolations)
 * - old and new values, enriched using information from metadata
 *
 * More information on the metadata storage format can be found in `storePropertyBindingMetadata`
 * function description.
 */
export declare function getExpressionChangedErrorDetails(lView: LView, bindingIndex: number, oldValue: any, newValue: any): {
    propName?: string;
    oldValue: any;
    newValue: any;
};
