/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng from '@angular/compiler-cli';
import {CompilerHost, debug, fixUmdModuleDeclarations} from '@bazel/typescript';
import * as tsickle from 'tsickle';
import * as ts from 'typescript';

interface EmitCacheEntry {
  emitResult: tsickle.EmitResult;
  writtenFiles: Array<{fileName: string, content: string, sourceFiles?: ts.SourceFile[]}>;
  generatedFile: ng.GeneratedFile;
}

interface SourceFileWithEmitCache extends ts.SourceFile {
  emitCache: Map<string, EmitCacheEntry>;
}

function getCache(sf: ts.SourceFile, genFileName?: string): EmitCacheEntry|undefined {
  const emitCache = (sf as SourceFileWithEmitCache).emitCache;
  return emitCache ? emitCache.get(genFileName || sf.fileName) : undefined;
}

function setCache(sf: ts.SourceFile, entry: EmitCacheEntry) {
  let emitCache = (sf as SourceFileWithEmitCache).emitCache;
  if (!emitCache) {
    emitCache = new Map();
    (sf as SourceFileWithEmitCache).emitCache = emitCache;
  }
  emitCache.set(entry.generatedFile ? entry.generatedFile.genFileName : sf.fileName, entry);
}

export function getCachedGeneratedFile(sf: ts.SourceFile, genFileName: string): ng.GeneratedFile|
    undefined {
  const cacheEntry = getCache(sf, genFileName);
  return cacheEntry ? cacheEntry.generatedFile : undefined;
}

export function emitWithCache(
    program: ng.Program, inputsChanged: boolean, targetFileNames: string[],
    compilerOpts: ng.CompilerOptions, host: CompilerHost): tsickle.EmitResult {
  const emitCallback: ng.EmitCallback = ({
    targetSourceFiles,
    writeFile,
    cancellationToken,
    emitOnlyDtsFiles,
    customTransformers = {}
  }) => {
    if (!targetSourceFiles) {
      // Note: we know that we always have targetSourceFiles
      // as we called `ng.Program.emit` with `targetFileNames`.
      throw new Error('Unexpected state: no targetSourceFiles!');
    }
    let cacheHits = 0;
    const mergedEmitResult = tsickle.mergeEmitResults(targetSourceFiles.map(targetSourceFile => {
      const targetGeneratedFile = program.getGeneratedFile(targetSourceFile.fileName);
      const cacheSf = targetGeneratedFile ?
          program.getTsProgram().getSourceFile(targetGeneratedFile.srcFileName) :
          targetSourceFile;
      const cacheEntry = getCache(cacheSf, targetGeneratedFile && targetGeneratedFile.genFileName);
      if (cacheEntry) {
        let useEmitCache = false;
        if (targetGeneratedFile && !program.hasChanged(targetSourceFile.fileName)) {
          // we emitted a GeneratedFile with the same content as before -> use the cache
          useEmitCache = true;
        } else if (!inputsChanged && !targetGeneratedFile) {
          // this is an input and no inputs have changed -> use the cache
          useEmitCache = true;
        }
        if (useEmitCache) {
          cacheHits++;
          cacheEntry.writtenFiles.forEach(
              ({fileName, content, sourceFiles}) => writeFile(
                  fileName, content, /*writeByteOrderMark*/ false, /*onError*/ undefined,
                  sourceFiles));
          return cacheEntry.emitResult;
        }
      }
      const writtenFiles:
          Array<{fileName: string, content: string, sourceFiles?: ts.SourceFile[]}> = [];
      const recordingWriteFile =
          (fileName: string, content: string, writeByteOrderMark: boolean,
           onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
            writtenFiles.push({fileName, content, sourceFiles});
            writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
          };
      const emitResult = tsickle.emitWithTsickle(
          program.getTsProgram(), host, host, compilerOpts, targetSourceFile, recordingWriteFile,
          cancellationToken, emitOnlyDtsFiles, {
            beforeTs: customTransformers.before,
            afterTs: [
              ...(customTransformers.after || []),
              fixUmdModuleDeclarations((sf: ts.SourceFile) => host.amdModuleName(sf)),
            ],
          });
      setCache(cacheSf, {
        emitResult,
        writtenFiles,
        generatedFile: targetGeneratedFile,
      });
      return emitResult;
    }));
    debug(`Emitted ${targetSourceFiles.length} files with ${cacheHits} cache hits`);
    return mergedEmitResult;
  };
  return program
      .emit({
        targetFileNames,
        emitCallback,
        emitFlags: ng.EmitFlags.DTS | ng.EmitFlags.JS | ng.EmitFlags.Codegen
      }) as tsickle.EmitResult;
}
