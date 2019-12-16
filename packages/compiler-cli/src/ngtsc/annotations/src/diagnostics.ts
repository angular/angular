/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, makeDiagnostic} from '../../diagnostics';
import {Reference} from '../../imports';
import {InjectableClassRegistry} from '../../metadata/src/registry';
import {ClassDeclaration} from '../../reflection';

/**
 * Gets the diagnostics for a set of provider classes.
 * @param providerClasses Classes that should be checked.
 * @param providersDeclaration Node that declares the providers array.
 * @param registry Registry that keeps track of the registered injectable classes.
 */
export function getProviderDiagnostics(
    providerClasses: Set<Reference<ClassDeclaration>>, providersDeclaration: ts.Node,
    registry: InjectableClassRegistry): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];

  for (const provider of providerClasses) {
    if (registry.isInjectable(provider.node)) {
      continue;
    }

    const identity = provider.getIdentityIn(providersDeclaration.getSourceFile());
    let highlightNode: ts.Node;

    // Try to narrow down the node in which the provider is declared so we can show a more
    // accurate diagnostic. If the can find the `Identifier` and it is contained within the
    // providers array we can use it, otherwise fall back to the array itself.
    if (identity !== null && identity.pos >= providersDeclaration.pos &&
        identity.end <= providersDeclaration.end) {
      highlightNode = identity;
    } else {
      highlightNode = providersDeclaration;
    }

    diagnostics.push(makeDiagnostic(
        ErrorCode.UNDECORATED_PROVIDER, highlightNode,
        `Provider ${provider.node.name.text} is not injectable, because it doesn't have ` +
            `an Angular decorator. This will result in an error at runtime.`));
  }

  return diagnostics;
}
