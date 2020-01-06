/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, absoluteFromSourceFile, relative} from '../../../src/ngtsc/file_system';
import {DependencyTracker} from '../../../src/ngtsc/incremental/api';
import {Decorator} from '../../../src/ngtsc/reflection';
import {DecoratorHandler, HandlerFlags, HandlerPrecedence, PendingTrait, Trait, analyzeTrait} from '../../../src/ngtsc/transform';
import {NgccClassSymbol} from '../host/ngcc_host';

import {AnalyzedClass} from './types';

export function isWithinPackage(packagePath: AbsoluteFsPath, sourceFile: ts.SourceFile): boolean {
  return !relative(packagePath, absoluteFromSourceFile(sourceFile)).startsWith('..');
}

export function analyzeDecorators(
    classSymbol: NgccClassSymbol, decorators: Decorator[] | null,
    handlers: DecoratorHandler<unknown, unknown, unknown>[], flags?: HandlerFlags): AnalyzedClass|
    null {
  const declaration = classSymbol.declaration.valueDeclaration;
  const pending: PendingTrait<unknown, unknown, unknown>[] = [];
  for (const handler of handlers) {
    const detected = handler.detect(declaration, decorators);
    if (detected !== undefined) {
      const trait = Trait.pending(handler, detected);
      pending.push(trait);
    }
  }

  if (pending.length === 0) {
    return null;
  }

  const traits: PendingTrait<unknown, unknown, unknown>[] = [];
  let hasWeakHandler: boolean = false;
  let hasNonWeakHandler: boolean = false;
  let hasPrimaryHandler: boolean = false;

  for (const trait of pending) {
    const {handler} = trait;
    if (hasNonWeakHandler && handler.precedence === HandlerPrecedence.WEAK) {
      continue;
    } else if (hasWeakHandler && handler.precedence !== HandlerPrecedence.WEAK) {
      // Clear all the WEAK handlers from the list of matches.
      traits.length = 0;
    }
    if (hasPrimaryHandler && handler.precedence === HandlerPrecedence.PRIMARY) {
      throw new Error(`TODO.Diagnostic: Class has multiple incompatible Angular decorators.`);
    }

    traits.push(trait);
    if (handler.precedence === HandlerPrecedence.WEAK) {
      hasWeakHandler = true;
    } else if (handler.precedence === HandlerPrecedence.SHARED) {
      hasNonWeakHandler = true;
    } else if (handler.precedence === HandlerPrecedence.PRIMARY) {
      hasNonWeakHandler = true;
      hasPrimaryHandler = true;
    }
  }

  for (const trait of traits) {
    analyzeTrait(declaration, trait, flags);
  }

  return {
    name: classSymbol.name,
    declaration,
    decorators,
    traits,
  };
}

class NoopDependencyTracker implements DependencyTracker {
  addDependency(): void {}
  addResourceDependency(): void {}
  addTransitiveDependency(): void {}
  addTransitiveResources(): void {}
}

export const NOOP_DEPENDENCY_TRACKER: DependencyTracker = new NoopDependencyTracker();
