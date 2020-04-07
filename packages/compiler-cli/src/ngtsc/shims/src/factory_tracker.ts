/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {FactoryGenerator, FactoryInfo} from './factory_generator';

/**
 * Maintains a mapping of which symbols in a .ngfactory file have been used.
 *
 * .ngfactory files are generated with one symbol per defined class in the source file, regardless
 * of whether the classes in the source files are NgModules (because that isn't known at the time
 * the factory files are generated). The `FactoryTracker` exists to support removing factory symbols
 * which didn't end up being NgModules, by tracking the ones which are.
 */
export class FactoryTracker {
  readonly sourceInfo = new Map<string, FactoryInfo>();
  private sourceToFactorySymbols = new Map<string, Set<string>>();

  constructor(generator: FactoryGenerator) {
    generator.factoryFileMap.forEach((sourceFilePath, factoryPath) => {
      const moduleSymbolNames = new Set<string>();
      this.sourceToFactorySymbols.set(sourceFilePath, moduleSymbolNames);
      this.sourceInfo.set(factoryPath, {sourceFilePath, moduleSymbolNames});
    });
  }

  track(sf: ts.SourceFile, factorySymbolName: string): void {
    if (this.sourceToFactorySymbols.has(sf.fileName)) {
      this.sourceToFactorySymbols.get(sf.fileName)!.add(factorySymbolName);
    }
  }
}
