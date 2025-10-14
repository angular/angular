/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SchemaMetadata, SecurityContext } from '../core';
import { ElementSchemaRegistry } from './element_schema_registry';
/**
 * This array represents the DOM schema. It encodes inheritance, properties, and events.
 *
 * ## Overview
 *
 * Each line represents one kind of element. The `element_inheritance` and properties are joined
 * using `element_inheritance|properties` syntax.
 *
 * ## Element Inheritance
 *
 * The `element_inheritance` can be further subdivided as `element1,element2,...^parentElement`.
 * Here the individual elements are separated by `,` (commas). Every element in the list
 * has identical properties.
 *
 * An `element` may inherit additional properties from `parentElement` If no `^parentElement` is
 * specified then `""` (blank) element is assumed.
 *
 * NOTE: The blank element inherits from root `[Element]` element, the super element of all
 * elements.
 *
 * NOTE an element prefix such as `:svg:` has no special meaning to the schema.
 *
 * ## Properties
 *
 * Each element has a set of properties separated by `,` (commas). Each property can be prefixed
 * by a special character designating its type:
 *
 * - (no prefix): property is a string.
 * - `*`: property represents an event.
 * - `!`: property is a boolean.
 * - `#`: property is a number.
 * - `%`: property is an object.
 *
 * ## Query
 *
 * The class creates an internal squas representation which allows to easily answer the query of
 * if a given property exist on a given element.
 *
 * NOTE: We don't yet support querying for types or events.
 * NOTE: This schema is auto extracted from `schema_extractor.ts` located in the test folder,
 *       see dom_element_schema_registry_spec.ts
 */
export declare const SCHEMA: string[];
export declare const _ATTR_TO_PROP: Map<string, string>;
export declare class DomElementSchemaRegistry extends ElementSchemaRegistry {
    private _schema;
    private _eventSchema;
    constructor();
    hasProperty(tagName: string, propName: string, schemaMetas: SchemaMetadata[]): boolean;
    hasElement(tagName: string, schemaMetas: SchemaMetadata[]): boolean;
    /**
     * securityContext returns the security context for the given property on the given DOM tag.
     *
     * Tag and property name are statically known and cannot change at runtime, i.e. it is not
     * possible to bind a value into a changing attribute or tag name.
     *
     * The filtering is based on a list of allowed tags|attributes. All attributes in the schema
     * above are assumed to have the 'NONE' security context, i.e. that they are safe inert
     * string values. Only specific well known attack vectors are assigned their appropriate context.
     */
    securityContext(tagName: string, propName: string, isAttribute: boolean): SecurityContext;
    getMappedPropName(propName: string): string;
    getDefaultComponentElementName(): string;
    validateProperty(name: string): {
        error: boolean;
        msg?: string;
    };
    validateAttribute(name: string): {
        error: boolean;
        msg?: string;
    };
    allKnownElementNames(): string[];
    allKnownAttributesOfElement(tagName: string): string[];
    allKnownEventsOfElement(tagName: string): string[];
    normalizeAnimationStyleProperty(propName: string): string;
    normalizeAnimationStyleValue(camelCaseProp: string, userProvidedProp: string, val: string | number): {
        error: string;
        value: string;
    };
}
