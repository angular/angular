/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CustomElementsManifestPropertyType,
  CustomElementsManifestSchema,
  normalizeCustomElementTagName,
} from '../../schema/custom_elements_manifest_schema';
import {TypeCheckingConfig} from '../api';

/** Per-tag validated check types: property name → type text, event name → type text. */
interface TagCheckTypes {
  propertyNames: Set<string>;
  properties: Map<string, string>;
  attributes: Map<string, CustomElementsManifestAttributeCheck>;
  events: Map<string, string>;
  instance: string | null;
}

/** Validated information used to check a static custom-element attribute. */
export interface CustomElementsManifestAttributeCheck {
  checkType: string;
  type: CustomElementsManifestPropertyType;
}

/**
 * Lazily-built lookup of custom element check types, keyed by the (per-program stable)
 * `customElementsManifestSchemas` array from the type-checking config.
 */
const customElementsManifestCheckTypes = new WeakMap<
  readonly CustomElementsManifestSchema[],
  Map<string, TagCheckTypes>
>();

function getTagCheckTypes(config: TypeCheckingConfig, tagName: string): TagCheckTypes | null {
  const schemas = config.customElementsManifestSchemas;
  if (schemas == null || schemas.length === 0) {
    return null;
  }
  let byTag = customElementsManifestCheckTypes.get(schemas);
  if (byTag === undefined) {
    byTag = new Map();
    for (const schema of schemas) {
      const tagName = normalizeCustomElementTagName(schema.tagName);
      let tagTypes = byTag.get(tagName);
      if (tagTypes === undefined) {
        tagTypes = {
          propertyNames: new Set(),
          properties: new Map(),
          attributes: new Map(),
          events: new Map(),
          instance: null,
        };
        byTag.set(tagName, tagTypes);
      }
      for (const property of schema.properties) {
        tagTypes.propertyNames.add(property.name);
        if (property.checkType !== undefined) {
          tagTypes.properties.set(property.name, property.checkType);
        }
      }
      for (const event of schema.events) {
        if (event.checkType !== undefined) {
          tagTypes.events.set(event.name, event.checkType);
        }
      }
      for (const attribute of schema.attributes ?? []) {
        if (attribute.checkType !== undefined && attribute.type !== undefined) {
          tagTypes.attributes.set(attribute.name, {
            checkType: attribute.checkType,
            type: attribute.type,
          });
        }
      }
      if (schema.instanceCheckType !== undefined) {
        tagTypes.instance = schema.instanceCheckType;
      }
    }
    customElementsManifestCheckTypes.set(schemas, byTag);
  }
  return byTag.get(normalizeCustomElementTagName(tagName)) ?? null;
}

/**
 * Looks up the validated check type for a property of a custom element declared in a
 * Custom Elements Manifest, or `null` if the property's binding values cannot be checked.
 */
export function getCustomElementsManifestPropertyCheckType(
  config: TypeCheckingConfig,
  tagName: string,
  propertyName: string,
): string | null {
  return getTagCheckTypes(config, tagName)?.properties.get(propertyName) ?? null;
}

/** Whether a manifest declares this exact JavaScript property name for the element. */
export function hasCustomElementsManifestProperty(
  config: TypeCheckingConfig,
  tagName: string,
  propertyName: string,
): boolean {
  return getTagCheckTypes(config, tagName)?.propertyNames.has(propertyName) === true;
}

/**
 * Looks up the validated check type for the `$event` object of an event emitted by a custom
 * element declared in a Custom Elements Manifest, or `null` if the event's type cannot be
 * checked.
 */
export function getCustomElementsManifestEventCheckType(
  config: TypeCheckingConfig,
  tagName: string,
  eventName: string,
): string | null {
  return getTagCheckTypes(config, tagName)?.events.get(eventName) ?? null;
}

/** Looks up validated type information for a static manifest-declared attribute. */
export function getCustomElementsManifestAttributeCheck(
  config: TypeCheckingConfig,
  tagName: string,
  attributeName: string,
): CustomElementsManifestAttributeCheck | null {
  return getTagCheckTypes(config, tagName)?.attributes.get(attributeName) ?? null;
}

/** Looks up the validated TypeScript type of a manifest-declared custom element instance. */
export function getCustomElementsManifestInstanceCheckType(
  config: TypeCheckingConfig,
  tagName: string,
): string | null {
  return getTagCheckTypes(config, tagName)?.instance ?? null;
}
