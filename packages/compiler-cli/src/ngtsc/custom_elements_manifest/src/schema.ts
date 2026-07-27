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

/** A syntax-checked type and its origin, retained for semantic-validation diagnostics. */
export interface ManifestCheckType extends ValidatedCheckType {
  subject: string;
  /** Original author text, before package references are substituted. */
  originalText: string;
}

/** Parsed member metadata, before references and TypeScript semantics have been checked. */
export type ParsedMember<T> = Omit<T, 'checkType'> & {checkType?: ManifestCheckType};
export type PropertyRecord = Omit<ParsedMember<CustomElementsManifestProperty>, 'name'>;
export type EventRecord = Omit<ParsedMember<CustomElementsManifestEvent>, 'name'>;
export type AttributeRecord = Omit<ParsedMember<CustomElementsManifestAttribute>, 'name'>;

/** Internal schema whose type analyses stay attached until public schema construction. */
export interface ParsedCustomElementSchema extends Omit<
  CustomElementsManifestSchema,
  'properties' | 'attributes' | 'events' | 'instanceCheckType'
> {
  properties: ParsedMember<CustomElementsManifestProperty>[];
  attributes: ParsedMember<CustomElementsManifestAttribute>[];
  events: ParsedMember<CustomElementsManifestEvent>[];
  instanceCheckType?: ManifestCheckType;
}

/** Recoverable manifest metadata problem; unrelated records remain available. */
export interface ManifestWarning {
  kind: 'invalidTagName' | 'duplicateTag' | 'unusableType' | 'invalidStructure';
  /** Compact identity used in summarized diagnostics. */
  subject: string;
  message: string;
}

/** Inputs shared by the parsing passes of one manifest. */
export interface ParseContext {
  /** Already-quoted display identity for diagnostics. */
  manifestLabel: string;
  owningPackage: string | null;
  warnings: ManifestWarning[];
}

/** Named declaration; other JSON fields require validation before use. */
export interface CemDeclaration {
  name: string;
  modulePath: string;
  node: {[key: string]: unknown};
}
