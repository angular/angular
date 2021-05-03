/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ReferencesRegistry} from '../../../src/ngtsc/annotations';
import {Reference} from '../../../src/ngtsc/imports';
import {Declaration, DeclarationNode, ReflectionHost} from '../../../src/ngtsc/reflection';
import {hasNameIdentifier} from '../utils';

/**
 * This is a place for DecoratorHandlers to register references that they
 * find in their analysis of the code.
 *
 * This registry is used to ensure that these references are publicly exported
 * from libraries that are compiled by ngcc.
 */
export class NgccReferencesRegistry implements ReferencesRegistry {
  private map = new Map<ts.Identifier, Declaration>();

  constructor(private host: ReflectionHost) {}

  /**
   * Register one or more references in the registry.
   * Only `ResolveReference` references are stored. Other types are ignored.
   * @param references A collection of references to register.
   */
  add(source: DeclarationNode, ...references: Reference<DeclarationNode>[]): void {
    references.forEach(ref => {
      // Only store relative references. We are not interested in literals.
      if (ref.bestGuessOwningModule === null && hasNameIdentifier(ref.node)) {
        const declaration = this.host.getDeclarationOfIdentifier(ref.node.name);
        if (declaration && hasNameIdentifier(declaration.node)) {
          this.map.set(declaration.node.name, declaration);
        }
      }
    });
  }

  /**
   * Create and return a mapping for the registered resolved references.
   * @returns A map of reference identifiers to reference declarations.
   */
  getDeclarationMap(): Map<ts.Identifier, Declaration> {
    return this.map;
  }
}
