/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The type of a custom element property, mirroring the type tags used internally by the
 * `DomElementSchemaRegistry` for built-in DOM properties.
 */
export type CustomElementsManifestPropertyType = 'boolean' | 'number' | 'string' | 'object';

/**
 * Normalizes an HTML custom-element tag name for manifest lookups.
 *
 * HTML tag matching is ASCII case-insensitive. Non-ASCII PCENChars are preserved because applying
 * Unicode lowercasing would incorrectly change the custom element's identity.
 */
export function normalizeCustomElementTagName(tagName: string): string {
  return tagName.replace(/[A-Z]/g, (char) => char.toLowerCase());
}

/**
 * Describes a single bindable property of a custom element.
 */
export interface CustomElementsManifestProperty {
  /** The property name, as bindable from a template. */
  name: string;

  /** Coarse type tag used by the `DomElementSchemaRegistry`. */
  type: CustomElementsManifestPropertyType;

  /**
   * Fully self-contained, validated TypeScript type source text used to type-check binding
   * values in type-check blocks, or absent when only existence checking is possible.
   *
   * SECURITY: this text is spliced verbatim into generated type-check code, so it must only
   * ever be produced by the compiler CLI's manifest type validator.
   */
  checkType?: string;

  /** Original CEM type text, retained for display in editor tooling. */
  typeText?: string;

  /** The manifest's serialized default value, when present. */
  default?: string;

  /** Whether the property is deprecated; a string carries the manifest's stated reason. */
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
   * Fully self-contained, validated TypeScript type source text for the emitted event object,
   * used to type `$event` in type-check blocks, or absent when the type is not trustworthy.
   *
   * SECURITY: this text is spliced verbatim into generated type-check code, so it must only
   * ever be produced by the compiler CLI's manifest type validator.
   */
  checkType?: string;

  /** Original CEM type text, retained for display in editor tooling. */
  typeText?: string;

  /** Whether the event is deprecated; a string carries the manifest's stated reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}

/**
 * Describes an HTML attribute accepted by a custom element.
 *
 * Attributes are deliberately distinct from properties. An attribute declaration does not imply
 * that assigning to a same-named JavaScript property has any effect.
 */
export interface CustomElementsManifestAttribute {
  /** The attribute name as it appears in markup. */
  name: string;

  /** The backing JavaScript field, when the manifest identifies one. */
  fieldName?: string;

  /** Coarse type category used to apply HTML attribute conversion semantics. */
  type?: CustomElementsManifestPropertyType;

  /** Validated TypeScript type used for literal completions and static-value checking. */
  checkType?: string;

  /** String literal values resolved from a referenced type alias, for editor completions. */
  stringLiteralValues?: string[];

  /** Original CEM type text, retained for display in editor tooling. */
  typeText?: string;

  /** The manifest's serialized default value, when present. */
  default?: string;

  /** Whether the attribute is deprecated; a string carries the manifest's stated reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}

/**
 * Describes a single custom element so it can be registered with the
 * `DomElementSchemaRegistry` alongside the built-in DOM schema.
 *
 * Instances are typically derived from a Custom Elements Manifest
 * (`custom-elements.json`) by the compiler CLI. The structure is plain,
 * serializable data so that `@angular/compiler` remains free of file I/O.
 */
export interface CustomElementsManifestSchema {
  /** The tag name of the custom element, in lower case (e.g. `my-button`). */
  tagName: string;

  /** Bindable properties of the element. */
  properties: CustomElementsManifestProperty[];

  /** HTML attributes accepted by the element. */
  attributes?: CustomElementsManifestAttribute[];

  /** Events emitted by the element. */
  events: CustomElementsManifestEvent[];

  /**
   * Fully self-contained, validated TypeScript type source for the element instance. This allows
   * local template references to retain the web component class type instead of `HTMLElement`.
   *
   * SECURITY: this text is spliced verbatim into generated type-check code, so it must only ever
   * be produced by the compiler CLI's manifest type validator.
   */
  instanceCheckType?: string;

  /** Whether the element is deprecated; a string carries the manifest's stated reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest, for display in editor tooling. */
  description?: string;
}
