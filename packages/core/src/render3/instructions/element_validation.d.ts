/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SchemaMetadata } from '../../metadata/schema';
import { ComponentDef } from '../interfaces/definition';
import { TElementNode, TNodeType } from '../interfaces/node';
import { RComment, RElement } from '../interfaces/renderer_dom';
import { LView } from '../interfaces/view';
/**
 * Sets a strict mode for JIT-compiled components to throw an error on unknown elements,
 * instead of just logging the error.
 * (for AOT-compiled ones this check happens at build time).
 */
export declare function ɵsetUnknownElementStrictMode(shouldThrow: boolean): void;
/**
 * Gets the current value of the strict mode.
 */
export declare function ɵgetUnknownElementStrictMode(): boolean;
/**
 * Sets a strict mode for JIT-compiled components to throw an error on unknown properties,
 * instead of just logging the error.
 * (for AOT-compiled ones this check happens at build time).
 */
export declare function ɵsetUnknownPropertyStrictMode(shouldThrow: boolean): void;
/**
 * Gets the current value of the strict mode.
 */
export declare function ɵgetUnknownPropertyStrictMode(): boolean;
/**
 * Validates that the element is known at runtime and produces
 * an error if it's not the case.
 * This check is relevant for JIT-compiled components (for AOT-compiled
 * ones this check happens at build time).
 *
 * The element is considered known if either:
 * - it's a known HTML element
 * - it's a known custom element
 * - the element matches any directive
 * - the element is allowed by one of the schemas
 *
 * @param lView An `LView` associated with a template is being rendered
 * @param tNode TNode representing an element to be validated
 */
export declare function validateElementIsKnown(lView: LView, tNode: TElementNode): void;
/**
 * Validates that the property of the element is known at runtime and returns
 * false if it's not the case.
 * This check is relevant for JIT-compiled components (for AOT-compiled
 * ones this check happens at build time).
 *
 * The property is considered known if either:
 * - it's a known property of the element
 * - the element is allowed by one of the schemas
 * - the property is used for animations
 *
 * @param element Element to validate
 * @param propName Name of the property to check
 * @param tagName Name of the tag hosting the property
 * @param schemas Array of schemas
 */
export declare function isPropertyValid(element: RElement | RComment, propName: string, tagName: string | null, schemas: SchemaMetadata[] | null): boolean;
/**
 * Logs or throws an error that a property is not supported on an element.
 *
 * @param propName Name of the invalid property
 * @param tagName Name of the tag hosting the property
 * @param nodeType Type of the node hosting the property
 * @param lView An `LView` that represents a current component
 */
export declare function handleUnknownPropertyError(propName: string, tagName: string | null, nodeType: TNodeType, lView: LView): void;
export declare function reportUnknownPropertyError(message: string): void;
/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode and also it relies on the constructor function being available.
 *
 * Gets a reference to the host component def (where a current component is declared).
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
export declare function getDeclarationComponentDef(lView: LView): ComponentDef<unknown> | null;
/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode.
 *
 * Checks if the current component is declared inside of a standalone component template.
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
export declare function isHostComponentStandalone(lView: LView): boolean;
/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode.
 *
 * Constructs a string describing the location of the host component template. The function is used
 * in dev mode to produce error messages.
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
export declare function getTemplateLocationDetails(lView: LView): string;
/**
 * The set of known control flow directives and their corresponding imports.
 * We use this set to produce a more precises error message with a note
 * that the `CommonModule` should also be included.
 */
export declare const KNOWN_CONTROL_FLOW_DIRECTIVES: Map<string, string>;
/**
 * Returns true if the tag name is allowed by specified schemas.
 * @param schemas Array of schemas
 * @param tagName Name of the tag
 */
export declare function matchingSchemas(schemas: SchemaMetadata[] | null, tagName: string | null): boolean;
