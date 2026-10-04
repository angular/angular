/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵCustomElementsManifestSchema as CustomElementsManifestSchema} from '@angular/compiler';
import {ValidatedCheckType} from './check_type';

type CustomElementsManifestProperty = CustomElementsManifestSchema['properties'][number];
type CustomElementsManifestEvent = CustomElementsManifestSchema['events'][number];
type CustomElementsManifestAttribute = CustomElementsManifestSchema['attributes'][number];

/** A check type that passed syntax checks, with the details that diagnostics need. */
export interface ManifestCheckType extends ValidatedCheckType {
  /** What declares the type, such as `property 'value' on 'my-element'`. */
  subject: string;
  /** What Angular does if the type cannot be used, as a sentence for diagnostics. */
  fallbackEffect: string;
  /** The manifest's type text, before references were replaced with `import()` types. */
  originalText: string;
}

/** Member metadata whose check type isn't yet resolved against TypeScript declarations. */
export type ParsedMember<T> = Omit<T, 'checkType'> & {checkType?: ManifestCheckType};
export type PropertyRecord = Omit<ParsedMember<CustomElementsManifestProperty>, 'name'>;
export type EventRecord = Omit<ParsedMember<CustomElementsManifestEvent>, 'name'>;
export type AttributeRecord = Omit<ParsedMember<CustomElementsManifestAttribute>, 'name'>;

/** An element schema whose check types aren't yet resolved against TypeScript declarations. */
export interface ParsedCustomElementSchema extends Omit<
  CustomElementsManifestSchema,
  'properties' | 'attributes' | 'events' | 'instanceCheckType'
> {
  properties: ParsedMember<CustomElementsManifestProperty>[];
  attributes: ParsedMember<CustomElementsManifestAttribute>[];
  events: ParsedMember<CustomElementsManifestEvent>[];
  instanceCheckType?: ManifestCheckType;
}

/** A problem that affects only some of a manifest's records. */
export interface ManifestWarning {
  kind:
    | 'invalidTagName'
    | 'duplicateTag'
    | 'unresolvableReference'
    | 'unusableType'
    | 'invalidStructure';
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
}

/** A named declaration in a manifest module. Validate other fields of `node` before use. */
export interface CemDeclaration {
  name: string;
  modulePath: string;
  node: {[key: string]: unknown};
}
