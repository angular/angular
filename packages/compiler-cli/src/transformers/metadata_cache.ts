/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {MetadataCollector, MetadataValue, ModuleMetadata} from '../metadata/index';

import {MetadataProvider} from './compiler_host';
import {TS} from './util';

export type ValueTransform = (value: MetadataValue, node: ts.Node) => MetadataValue;

export interface MetadataTransformer {
  connect?(cache: MetadataCache): void;
  start(sourceFile: ts.SourceFile): ValueTransform|undefined;
}

/**
 * Cache, and potentially transform, metadata as it is being collected.
 */
export class MetadataCache implements MetadataProvider {
  private metadataCache = new Map<string, ModuleMetadata|undefined>();

  constructor(
      private collector: MetadataCollector, private readonly strict: boolean,
      private transformers: MetadataTransformer[]) {
    for (let transformer of transformers) {
      if (transformer.connect) {
        transformer.connect(this);
      }
    }
  }

  getMetadata(sourceFile: ts.SourceFile): ModuleMetadata|undefined {
    if (this.metadataCache.has(sourceFile.fileName)) {
      return this.metadataCache.get(sourceFile.fileName);
    }
    let substitute: ValueTransform|undefined = undefined;

    // Only process transformers on modules that are not declaration files.
    const declarationFile = sourceFile.isDeclarationFile;
    const moduleFile = ts.isExternalModule(sourceFile);
    if (!declarationFile && moduleFile) {
      for (let transform of this.transformers) {
        const transformSubstitute = transform.start(sourceFile);
        if (transformSubstitute) {
          if (substitute) {
            const previous: ValueTransform = substitute;
            substitute = (value: MetadataValue, node: ts.Node) =>
                transformSubstitute(previous(value, node), node);
          } else {
            substitute = transformSubstitute;
          }
        }
      }
    }

    const isTsFile = TS.test(sourceFile.fileName);
    const result = this.collector.getMetadata(sourceFile, this.strict && isTsFile, substitute);
    this.metadataCache.set(sourceFile.fileName, result);
    return result;
  }
}
