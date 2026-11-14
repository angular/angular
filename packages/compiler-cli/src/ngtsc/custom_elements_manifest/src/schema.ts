/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CustomElementsManifestSchema} from '@angular/compiler';
import ts from 'typescript';
import {ErrorCode} from '../../diagnostics';
import {ValidatedCheckType} from './check_type';

type CustomElementsManifestProperty = CustomElementsManifestSchema['properties'][number];
type CustomElementsManifestEvent = CustomElementsManifestSchema['events'][number];
type CustomElementsManifestAttribute = CustomElementsManifestSchema['attributes'][number];

/** A check type that passed syntax checks, with the details that diagnostics need. */
export interface ManifestCheckType extends ValidatedCheckType {
  /** What declares the type, such as `property 'value' on 'my-element'`. */
  subject: string;
  /** A short name for what declares the type, such as `my-element.value`, for summaries. */
  warningSubject: string;
  /** What Angular does if the type cannot be used, as a sentence for diagnostics. */
  fallbackEffect: string;
  /** The manifest's type text, before references were replaced with `import()` types. */
  originalText: string;
}

/** Member metadata whose check type isn't yet resolved against TypeScript declarations. */
export type ParsedMember<T> = Omit<T, 'checkType'> & {
  checkType?: ManifestCheckType;
  /**
   * Why the manifest's type can't be used, when it has one and `checkType` is unset. Reported
   * unless the element class provides the type instead.
   */
  typeWarning?: ManifestWarning;
};
export type PropertyRecord = Omit<ParsedMember<CustomElementsManifestProperty>, 'name'>;
export type EventRecord = Omit<ParsedMember<CustomElementsManifestEvent>, 'name'>;
export type AttributeRecord = Omit<ParsedAttribute, 'name'>;

/** An attribute and the property that it reflects, if the manifest links them. */
export type ParsedAttribute = ParsedMember<CustomElementsManifestAttribute> & {
  /** Name of the linked property, whose class type applies when the attribute has no usable type. */
  property?: string;
};

/** An element schema whose check types aren't yet resolved against TypeScript declarations. */
export interface ParsedCustomElementSchema extends Omit<
  CustomElementsManifestSchema,
  'properties' | 'attributes' | 'events' | 'instanceCheckType'
> {
  properties: ParsedMember<CustomElementsManifestProperty>[];
  attributes: ParsedAttribute[];
  events: ParsedMember<CustomElementsManifestEvent>[];
  instanceCheckType?: ManifestCheckType;
  /**
   * Fields that the manifest declares but that templates can't bind to, such as `readonly` and
   * private ones. The element class doesn't make these bindable.
   */
  unbindableProperties: string[];
}

/** A problem that affects only some of a manifest's records. */
export interface ManifestWarning {
  code:
    | ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_TAG_NAME
    | ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG
    | ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE
    | ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE
    | ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE;
  /** A short name for the affected record, used in summarized diagnostics. */
  subject: string;
  message: string;
  /** A sentence that `message` includes and that a summary of these warnings repeats once. */
  note?: string;
}

/** Inputs shared by the parsing passes of one manifest. */
export interface ParseContext {
  /** How diagnostics refer to the manifest. Already quoted. */
  manifestLabel: string;
  owningPackage: string | null;
  warnings: ManifestWarning[];
  /** The type text that is already parsed, for `computeCheckType`. */
  parsedTypes: Map<string, ts.SourceFile>;
}

/** A named declaration in a manifest module. Validate other fields of `node` before use. */
export interface ManifestDeclaration {
  name: string;
  modulePath: string;
  node: {[key: string]: unknown};
}
