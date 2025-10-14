/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../../interface/type';
import { ComponentDef, DirectiveDef } from '../interfaces/definition';
export declare function getSuperType(type: Type<any>): Type<any> & {
    ɵcmp?: ComponentDef<any>;
    ɵdir?: DirectiveDef<any>;
};
/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 *
 * @codeGenApi
 */
export declare function ɵɵInheritDefinitionFeature(definition: DirectiveDef<any> | ComponentDef<any>): void;
