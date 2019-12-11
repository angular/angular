/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, makeDiagnostic} from '../../diagnostics';
import {InjectableClassRegistry} from '../../metadata/src/registry';
import {ClassDeclaration} from '../../reflection';

/**
 * Gets the diagnostics for a set of provider classes.
 * @param providerClasses Classes that should be checked.
 * @param highlightNode Node that should be highlighted in the diagnostic.
 *    Usually the place where the providers are being used.
 * @param registry Registry that keeps track of the registered injectable classes.
 */
export function getProviderDiagnostics(
    providerClasses: Set<ClassDeclaration>, highlightNode: ts.Node,
    registry: InjectableClassRegistry): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];

  providerClasses.forEach(provider => {
    if (!registry.hasClass(provider)) {
      diagnostics.push(makeDiagnostic(
          ErrorCode.UNDECORATED_PROVIDER, highlightNode,
          `Provider ${provider.name.text} is not injectable, because it doesn't have an Angular decorator. This will result in an error at runtime.`));
    }
  });

  return diagnostics;
}
