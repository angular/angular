/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Declaration} from '../../host';
import {Reference} from '../../metadata';

/**
 * Implement this interface if you want DecoratorHandlers to register
 * references that they find in their analysis of the code.
 */
export interface ReferencesRegistry {
  /**
   * Register one or more references in the registry.
   * Only `ResolveReference` references are stored. Other types are ignored.
   * @param references A collection of references to register.
   */
  add(...references: Reference<ts.Declaration>[]): void;
  /**
   * Create and return a mapping for the registered resolved references.
   * @returns A map of reference identifiers to reference declarations.
   */
  getDeclarationMap(): Map<ts.Identifier, Declaration>;
}

/**
 * This registry does nothing, since ngtsc does not currently need
 * this functionality.
 * The ngcc tool implements a working version for its purposes.
 */
export class NoopReferencesRegistry implements ReferencesRegistry {
  add(...references: Reference<ts.Declaration>[]): void {}
  getDeclarationMap(): Map<ts.Identifier, Declaration> { return new Map(); }
}