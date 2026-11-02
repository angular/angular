/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DocsExtractor,
  type ClassDeclaration,
  type DocEntry,
  type DocsDirectiveMetadata,
  type DocsMetadataReader,
  type DocsNgModuleMetadata,
  type DocsPipeMetadata,
} from '@angular/compiler-cli/private/hybrid_analysis';
import path from 'path';
import ts from 'typescript';
import type {HybridCompiler} from './hybrid_compiler.js';
import {createInputPropertyMapping, createOutputPropertyMapping} from './tcb_adapter.js';
import * as nga from './types.js';

function getCandidatePaths(fileName: string): string[] {
  const candidates = [fileName];
  const resolved = path.resolve(fileName).replace(/\\/g, '/');
  if (resolved !== fileName) {
    candidates.push(resolved);
  }
  const normalized = fileName.replace(/\\/g, '/');
  if (normalized !== fileName) {
    candidates.push(normalized);
  }
  const withoutDrive = normalized.replace(/^[a-zA-Z]:/, '');
  if (withoutDrive !== normalized) {
    candidates.push(withoutDrive.startsWith('/') ? withoutDrive : '/' + withoutDrive);
  }
  return candidates;
}

function createDocsMetadataReader(
  resolveFileMetadata: (fileName: string) => nga.AnalysisResult | null,
): DocsMetadataReader {
  const findClassMetadata = (node: ClassDeclaration): nga.ClassMetadata | null => {
    const sf = node.getSourceFile();
    const result = resolveFileMetadata(sf.fileName);
    if (!result) {
      return null;
    }
    const className = node.name.text;
    const nodeStart = node.getStart(sf);
    return (
      result.classes.find((cls) => cls.className === className && cls.span.start === nodeStart) ??
      result.classes.find((cls) => cls.className === className) ??
      null
    );
  };

  return {
    getDirectiveMetadata(ref): DocsDirectiveMetadata | null {
      const cls = findClassMetadata(ref.node);
      if (!cls) {
        return null;
      }
      if (cls.component && !cls.component.isJit) {
        return {
          isComponent: true,
          isStandalone: cls.component.standalone,
          selector: cls.component.selector ?? 'ng-component',
          exportAs: cls.component.exportAs ?? null,
          inputs: createInputPropertyMapping(cls.inputs),
          outputs: createOutputPropertyMapping(cls.outputs),
        };
      }
      if (cls.directive && !cls.directive.isJit) {
        return {
          isComponent: false,
          isStandalone: cls.directive.standalone,
          selector: cls.directive.selector ?? null,
          exportAs: cls.directive.exportAs ?? null,
          inputs: createInputPropertyMapping(cls.inputs),
          outputs: createOutputPropertyMapping(cls.outputs),
        };
      }
      return null;
    },
    getPipeMetadata(ref): DocsPipeMetadata | null {
      const cls = findClassMetadata(ref.node);
      if (!cls || !cls.pipe) {
        return null;
      }
      return {
        name: cls.pipe.name ?? null,
        isStandalone: cls.pipe.standalone ?? true,
        isPure: cls.pipe.pure ?? true,
      };
    },
    getNgModuleMetadata(ref): DocsNgModuleMetadata | null {
      const cls = findClassMetadata(ref.node);
      if (!cls || !cls.ngModule || cls.ngModule.isJit) {
        return null;
      }
      return {};
    },
  };
}

function extractWithReader(
  tsProgram: ts.Program,
  metadataReader: DocsMetadataReader,
  entryPoint: string,
  privateModules: Set<string>,
): {entries: DocEntry[]; symbols: Map<string, string>} {
  const checker = tsProgram.getTypeChecker();
  const docsExtractor = new DocsExtractor(checker, metadataReader);

  const entryPointSourceFile = tsProgram.getSourceFiles().find((sourceFile) => {
    return sourceFile.fileName.includes(entryPoint);
  });

  if (!entryPointSourceFile) {
    throw new Error(`Entry point "${entryPoint}" not found in program sources.`);
  }

  const rootDir = tsProgram.getCurrentDirectory();
  return docsExtractor.extractAll(entryPointSourceFile, rootDir, privateModules);
}

export async function getApiDocumentation(
  compiler: HybridCompiler,
  tsProgram: ts.Program,
  entryPoint: string,
  privateModules: Set<string>,
): Promise<{entries: DocEntry[]; symbols: Map<string, string>}> {
  const metadataByFileName = new Map<string, nga.AnalysisResult | null>();
  for (const sf of tsProgram.getSourceFiles()) {
    let resolved: nga.AnalysisResult | null = null;
    for (const candidatePath of getCandidatePaths(sf.fileName)) {
      resolved = compiler.getCachedMetadata(candidatePath);
      if (resolved) {
        break;
      }
    }
    if (!resolved) {
      for (const candidatePath of getCandidatePaths(sf.fileName)) {
        resolved = await compiler.analyzer.getMetadataForFile(candidatePath);
        if (resolved) {
          break;
        }
      }
    }
    metadataByFileName.set(sf.fileName, resolved);
    if (resolved) {
      for (const candidatePath of getCandidatePaths(sf.fileName)) {
        metadataByFileName.set(candidatePath, resolved);
      }
    }
  }

  const metadataReader = createDocsMetadataReader((fileName) => {
    let meta = metadataByFileName.get(fileName);
    if (!meta) {
      for (const candidate of getCandidatePaths(fileName)) {
        meta = metadataByFileName.get(candidate);
        if (meta) {
          break;
        }
      }
    }
    return meta ?? null;
  });
  return extractWithReader(tsProgram, metadataReader, entryPoint, privateModules);
}

export function getApiDocumentationSync(
  compiler: HybridCompiler,
  tsProgram: ts.Program,
  entryPoint: string,
  privateModules: Set<string>,
): {entries: DocEntry[]; symbols: Map<string, string>} {
  const metadataByFileName = new Map<string, nga.AnalysisResult | null>();
  const resolveFileMetadata = (fileName: string): nga.AnalysisResult | null => {
    if (metadataByFileName.has(fileName)) {
      return metadataByFileName.get(fileName)!;
    }
    let resolved: nga.AnalysisResult | null = null;
    for (const candidatePath of getCandidatePaths(fileName)) {
      resolved =
        compiler.getCachedMetadata(candidatePath) ??
        compiler.analyzer.getMetadataForFileSync(candidatePath);
      if (resolved) {
        break;
      }
    }
    metadataByFileName.set(fileName, resolved);
    return resolved;
  };

  const metadataReader = createDocsMetadataReader(resolveFileMetadata);
  return extractWithReader(tsProgram, metadataReader, entryPoint, privateModules);
}
