/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Lowercases the ASCII letters of a tag name, as HTML tag matching does. Other characters are kept
 * because Unicode lowercasing can change a custom element name.
 */
export function normalizeCustomElementTagName(tagName: string): string {
  return tagName.replace(/[A-Z]/g, (char) => char.toLowerCase());
}

/** Editor documentation from the manifest. */
export interface CustomElementsManifestDocs {
  /** Whether the entry is deprecated. A string gives the reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}

/** A property, attribute, or event of a custom element. */
export interface CustomElementsManifestMember extends CustomElementsManifestDocs {
  /** The JavaScript property name, attribute name, or event name. */
  name: string;

  /**
   * TypeScript type text of a property binding value, a static attribute value, or `$event`. When
   * absent, the value isn't checked and `$event` has the native DOM event type. Template
   * type-checking code includes this text verbatim, so only the manifest loader in
   * `@angular/compiler-cli` may set it after validating it.
   */
  checkType?: string;

  /** Original CEM type text, retained for display in editor tooling. */
  typeText?: string;
}

/** A property of a custom element that templates can bind to. */
export interface CustomElementsManifestProperty extends CustomElementsManifestMember {
  /** The manifest's serialized default value, when present. */
  default?: string;
}

/** An event that a custom element dispatches. */
export type CustomElementsManifestEvent = CustomElementsManifestMember;

/**
 * An HTML attribute of a custom element. Declaring an attribute does not declare a property with the
 * same name.
 */
export interface CustomElementsManifestAttribute extends CustomElementsManifestMember {
  /**
   * The values of `checkType` when it resolves to a union of string literals. Static attribute
   * values are checked, and value completions offered, only when this is set.
   */
  stringLiteralValues?: string[];

  /** The manifest's serialized default value, when present. */
  default?: string;
}

/**
 * A custom element declared by a Custom Elements Manifest. `@angular/compiler-cli` reads manifests
 * and passes this serializable data to the compiler, which does no file I/O.
 */
export interface CustomElementsManifestSchema extends CustomElementsManifestDocs {
  /** The tag name, such as `my-button`. */
  tagName: string;

  /** Properties that templates can bind to. */
  properties: CustomElementsManifestProperty[];

  /** HTML attributes of the element. */
  attributes: CustomElementsManifestAttribute[];

  /** Events that the element dispatches. */
  events: CustomElementsManifestEvent[];

  /**
   * TypeScript type text for local references to the element, or absent to use `HTMLElement`.
   * Validated like `CustomElementsManifestMember.checkType`.
   */
  instanceCheckType?: string;
}

/** The members of one custom element, by name. */
interface CustomElementsManifestTagEntry {
  schema: CustomElementsManifestSchema;
  properties: Map<string, CustomElementsManifestProperty>;
  attributes: Map<string, CustomElementsManifestAttribute>;
  events: Map<string, CustomElementsManifestEvent>;
}

/**
 * Looks up manifest schemas by tag for template type checking, code generation, and the language
 * service. Lookups normalize the tag name. When two schemas use the same tag, the first is kept.
 */
export class CustomElementsManifestIndex {
  private readonly byTag = new Map<string, CustomElementsManifestTagEntry>();

  /** The tag names of all declared custom elements. */
  readonly tagNames: ReadonlySet<string>;

  /** One schema per tag: the first schema passed for that tag. */
  readonly schemas: readonly CustomElementsManifestSchema[];

  constructor(schemas: readonly CustomElementsManifestSchema[]) {
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
    this.schemas = Array.from(this.byTag.values(), ({schema}) => schema);
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

  /** Whether the element declares a property with exactly this name. */
  hasProperty(tagName: string, propertyName: string): boolean {
    return this.getEntry(tagName)?.properties.has(propertyName) === true;
  }

  /**
   * The type text for checking a static attribute value, or `null` if the value isn't checked.
   * Only unions of string literals are checked, because CEM doesn't define how attribute strings
   * convert to other types.
   */
  getAttributeCheckType(tagName: string, attributeName: string): string | null {
    const attribute = this.getAttribute(tagName, attributeName);
    return attribute?.checkType !== undefined && attribute.stringLiteralValues?.length
      ? attribute.checkType
      : null;
  }

  private getEntry(tagName: string): CustomElementsManifestTagEntry | undefined {
    return this.byTag.get(normalizeCustomElementTagName(tagName));
  }
}
