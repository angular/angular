/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const NON_ASCII = /[^\x00-\x7f]/;

/**
 * Normalizes tag names for ASCII case-insensitive HTML matching. Preserves non-ASCII characters
 * because Unicode lowercasing could change the custom element name. Uses `toLowerCase` for ASCII.
 */
export function normalizeCustomElementTagName(tagName: string): string {
  return NON_ASCII.test(tagName)
    ? tagName.replace(/[A-Z]/g, (char) => char.toLowerCase())
    : tagName.toLowerCase();
}

/**
 * Describes a single bindable property of a custom element.
 */
export interface CustomElementsManifestProperty {
  /** The property name, as bindable from a template. */
  name: string;

  /**
   * Validated TypeScript type text for checking binding values. Absent when only schema checks
   * apply. The compiler emits this text verbatim, so it must come from the CLI's manifest type
   * validator.
   */
  checkType?: string;

  /** Original CEM type text, retained for display in editor tooling. */
  typeText?: string;

  /** The manifest's serialized default value, when present. */
  default?: string;

  /** Whether the property is deprecated. A string gives the reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}

/**
 * Describes a single event emitted by a custom element.
 */
export interface CustomElementsManifestEvent {
  /** The event name, as bindable from a template. */
  name: string;

  /**
   * Validated TypeScript type text for `$event`. Absent when no validated type is available.
   * Must meet the validation requirements of `CustomElementsManifestProperty.checkType`.
   */
  checkType?: string;

  /** Original CEM type text, retained for display in editor tooling. */
  typeText?: string;

  /** Whether the event is deprecated. A string gives the reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}

/**
 * Describes an HTML attribute accepted by a custom element.
 *
 * An attribute declaration does not imply a JavaScript property with the same name.
 */
export interface CustomElementsManifestAttribute {
  /** The attribute name as it appears in markup. */
  name: string;

  /** Validated TypeScript type used for literal completions and static string-value checking. */
  checkType?: string;

  /** String literal values resolved from a referenced type alias, for editor completions. */
  stringLiteralValues?: string[];

  /** Original CEM type text, retained for display in editor tooling. */
  typeText?: string;

  /** The manifest's serialized default value, when present. */
  default?: string;

  /** Whether the attribute is deprecated. A string gives the reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}

/**
 * Describes a custom element for `DomElementSchemaRegistry`. The CLI reads manifests and supplies
 * this serializable data so `@angular/compiler` needs no file I/O.
 */
export interface CustomElementsManifestSchema {
  /** The custom element's tag name, such as `my-button`, normalized for HTML matching. */
  tagName: string;

  /** Bindable properties of the element. */
  properties: CustomElementsManifestProperty[];

  /** HTML attributes accepted by the element. */
  attributes: CustomElementsManifestAttribute[];

  /** Events emitted by the element. */
  events: CustomElementsManifestEvent[];

  /**
   * Validated TypeScript type text for local references to this element.
   * Must meet the validation requirements of `CustomElementsManifestProperty.checkType`.
   */
  instanceCheckType?: string;

  /** Whether the element is deprecated. A string gives the reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}

/** The members of one manifest-declared custom element, indexed by name. */
interface CustomElementsManifestTagEntry {
  schema: CustomElementsManifestSchema;
  properties: Map<string, CustomElementsManifestProperty>;
  attributes: Map<string, CustomElementsManifestAttribute>;
  events: Map<string, CustomElementsManifestEvent>;
}

/**
 * Index of manifest schemas shared by template checking, compilation, and editor tooling.
 * Normalizes template tag names on lookup. The loader supplies unique schema tags, and the index
 * keeps the first schema if a duplicate occurs.
 */
export class CustomElementsManifestIndex {
  private readonly byTag = new Map<string, CustomElementsManifestTagEntry>();

  /** Lower-case tag names of every manifest-declared custom element. */
  readonly tagNames: ReadonlySet<string>;

  constructor(readonly schemas: readonly CustomElementsManifestSchema[]) {
    for (const schema of schemas) {
      if (this.byTag.has(schema.tagName)) {
        continue;
      }
      this.byTag.set(schema.tagName, {
        schema,
        properties: new Map(schema.properties.map((property) => [property.name, property])),
        attributes: new Map(schema.attributes.map((attribute) => [attribute.name, attribute])),
        events: new Map(schema.events.map((event) => [event.name, event])),
      });
    }
    this.tagNames = new Set(this.byTag.keys());
  }

  /** The schema declared for `tagName`, or `null` if no configured manifest declares it. */
  getSchema(tagName: string): CustomElementsManifestSchema | null {
    return this.getEntry(tagName)?.schema ?? null;
  }

  getProperty(tagName: string, propertyName: string): CustomElementsManifestProperty | null {
    return this.getEntry(tagName)?.properties.get(propertyName) ?? null;
  }

  getAttribute(tagName: string, attributeName: string): CustomElementsManifestAttribute | null {
    return this.getEntry(tagName)?.attributes.get(attributeName) ?? null;
  }

  getEvent(tagName: string, eventName: string): CustomElementsManifestEvent | null {
    return this.getEntry(tagName)?.events.get(eventName) ?? null;
  }

  /** Whether a manifest declares this exact JavaScript property name for the element. */
  hasProperty(tagName: string, propertyName: string): boolean {
    return this.getEntry(tagName)?.properties.has(propertyName) === true;
  }

  /**
   * The validated check type for a property binding, or `null` if the property's binding values
   * cannot be checked.
   */
  getPropertyCheckType(tagName: string, propertyName: string): string | null {
    return this.getProperty(tagName, propertyName)?.checkType ?? null;
  }

  /**
   * The validated check type for the `$event` object of an event, or `null` if the event's type
   * cannot be checked.
   */
  getEventCheckType(tagName: string, eventName: string): string | null {
    return this.getEvent(tagName, eventName)?.checkType ?? null;
  }

  /**
   * The validated string literal union for a static attribute, or `null` for other types.
   * CEM has no general number or boolean converter for checking static attribute values.
   */
  getAttributeCheckType(tagName: string, attributeName: string): string | null {
    const attribute = this.getAttribute(tagName, attributeName);
    return attribute?.checkType !== undefined && attribute.stringLiteralValues?.length
      ? attribute.checkType
      : null;
  }

  /** The validated TypeScript type of the element instance, or `null` when unavailable. */
  getInstanceCheckType(tagName: string): string | null {
    return this.getSchema(tagName)?.instanceCheckType ?? null;
  }

  private getEntry(tagName: string): CustomElementsManifestTagEntry | undefined {
    return this.byTag.get(normalizeCustomElementTagName(tagName));
  }
}
