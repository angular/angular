/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {isFatalDiagnosticError} from '../../../src/ngtsc/diagnostics';
import {AbsoluteFsPath, absoluteFromSourceFile, relative} from '../../../src/ngtsc/file_system';
import {DependencyTracker} from '../../../src/ngtsc/incremental/api';
import {Decorator} from '../../../src/ngtsc/reflection';
import {DecoratorHandler, HandlerFlags, HandlerPrecedence} from '../../../src/ngtsc/transform';
import {NgccClassSymbol} from '../host/ngcc_host';

import {AnalyzedClass, MatchingHandler} from './types';

export function isWithinPackage(packagePath: AbsoluteFsPath, sourceFile: ts.SourceFile): boolean {
  return !relative(packagePath, absoluteFromSourceFile(sourceFile)).startsWith('..');
}

const NOT_YET_KNOWN: Readonly<unknown> = null as unknown as Readonly<unknown>;

export function analyzeDecorators(
    classSymbol: NgccClassSymbol, decorators: Decorator[] | null,
    handlers: DecoratorHandler<unknown, unknown, unknown>[], flags?: HandlerFlags): AnalyzedClass|
    null {
  const declaration = classSymbol.declaration.valueDeclaration;
  const matchingHandlers: MatchingHandler<unknown, unknown, unknown>[] = [];
  for (const handler of handlers) {
    const detected = handler.detect(declaration, decorators);
    if (detected !== undefined) {
      matchingHandlers.push({
        handler,
        detected,
        analysis: NOT_YET_KNOWN,
        resolution: NOT_YET_KNOWN,
      });
    }
  }

  if (matchingHandlers.length === 0) {
    return null;
  }

  const detections: MatchingHandler<unknown, unknown, unknown>[] = [];
  let hasWeakHandler: boolean = false;
  let hasNonWeakHandler: boolean = false;
  let hasPrimaryHandler: boolean = false;

  for (const match of matchingHandlers) {
    const {handler} = match;
    if (hasNonWeakHandler && handler.precedence === HandlerPrecedence.WEAK) {
      continue;
    } else if (hasWeakHandler && handler.precedence !== HandlerPrecedence.WEAK) {
      // Clear all the WEAK handlers from the list of matches.
      detections.length = 0;
    }
    if (hasPrimaryHandler && handler.precedence === HandlerPrecedence.PRIMARY) {
      throw new Error(`TODO.Diagnostic: Class has multiple incompatible Angular decorators.`);
    }

    detections.push(match);
    if (handler.precedence === HandlerPrecedence.WEAK) {
      hasWeakHandler = true;
    } else if (handler.precedence === HandlerPrecedence.SHARED) {
      hasNonWeakHandler = true;
    } else if (handler.precedence === HandlerPrecedence.PRIMARY) {
      hasNonWeakHandler = true;
      hasPrimaryHandler = true;
    }
  }

  const matches: MatchingHandler<unknown, unknown, unknown>[] = [];
  const allDiagnostics: ts.Diagnostic[] = [];
  for (const match of detections) {
    try {
      const {analysis, diagnostics} =
          match.handler.analyze(declaration, match.detected.metadata, flags);
      if (diagnostics !== undefined) {
        allDiagnostics.push(...diagnostics);
      }
      if (analysis !== undefined) {
        match.analysis = analysis;
        if (match.handler.register !== undefined) {
          match.handler.register(declaration, analysis);
        }
      }
      matches.push(match);
    } catch (e) {
      if (isFatalDiagnosticError(e)) {
        allDiagnostics.push(e.toDiagnostic());
      } else {
        throw e;
      }
    }
  }
  return {
    name: classSymbol.name,
    declaration,
    decorators,
    matches,
    diagnostics: allDiagnostics.length > 0 ? allDiagnostics : undefined,
  };
}

class NoopDependencyTracker implements DependencyTracker {
  addDependency(): void {}
  addResourceDependency(): void {}
  addTransitiveDependency(): void {}
  addTransitiveResources(): void {}
}

export const NOOP_DEPENDENCY_TRACKER: DependencyTracker = new NoopDependencyTracker();
