/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {IncrementalBuild} from '../../../src/ngtsc/incremental/api';
import {NOOP_PERF_RECORDER} from '../../../src/ngtsc/perf';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {DecoratorHandler, DtsTransformRegistry, HandlerFlags, Trait, TraitCompiler} from '../../../src/ngtsc/transform';
import {NgccReflectionHost} from '../host/ngcc_host';
import {isDefined} from '../utils';

export class NgccTraitCompiler extends TraitCompiler {
  constructor(
      handlers: DecoratorHandler<unknown, unknown, unknown>[],
      private ngccReflector: NgccReflectionHost) {
    super(
        handlers, ngccReflector, NOOP_PERF_RECORDER, new NoIncrementalBuild(),
        /* compileNonExportedClasses */ true, new DtsTransformRegistry());
  }

  get analyzedFiles(): ts.SourceFile[] { return Array.from(this.fileToClasses.keys()); }

  analyzeFile(sf: ts.SourceFile): void {
    const ngccClassSymbols = this.ngccReflector.findClassSymbols(sf);
    for (const classSymbol of ngccClassSymbols) {
      this.analyzeClass(classSymbol.declaration.valueDeclaration, null);
    }

    return undefined;
  }

  injectSyntheticDecorator(clazz: ClassDeclaration, decorator: Decorator, flags?: HandlerFlags):
      Trait<unknown, unknown, unknown>[] {
    const migratedTraits = this.detectTraits(clazz, [decorator]);
    if (migratedTraits === null) {
      return [];
    }

    for (const trait of migratedTraits) {
      this.analyzeTrait(clazz, trait, flags);
    }

    return migratedTraits;
  }

  getAllDecorators(clazz: ClassDeclaration): Decorator[]|null {
    const record = this.recordFor(clazz);
    if (record === null) {
      return null;
    }

    return record.traits.map(trait => trait.detected.decorator).filter(isDefined);
  }
}

class NoIncrementalBuild implements IncrementalBuild<any> {
  priorWorkFor(sf: ts.SourceFile): any[]|null { return null; }
}
