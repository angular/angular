/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import ts from 'typescript';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {isPositionInHostBinding} from './utils.js';
import {makeClassKey} from '../../src/compiler-utils.js';
import {ClassMetadata} from '../../src/types.js';

import {positionToOffset} from '../../src/tcb_ls_util.js';

export interface SetupResult {
  tsFilePath: string;
  meta: any;
  parsedTemplate: any;
  offset: number;
  tcbSf: ts.SourceFile;
  tcbCode: string;
  isHostBinding?: boolean;
  hostElement?: any;
}

/**
 * Resolves the TCB (Type Check Block), parsed template, and mapped offsets for a file and position.
 *
 * Unlike reference Angular (`TemplateTypeCheckerImpl`), which uses a `ProgramDriver` to inject TCB
 * shims into a persistent TypeScript program, this queries `HybridCompiler` for the TCB code and
 * parsed template on demand and constructs a synthetic source file for `SymbolBuilder`.
 *
 * @param hybridCompiler The hybrid compiler instance to query for data.
 * @param filePath The path to the file (HTML or TS).
 * @param position The line and character position in the file.
 * @returns The setup result containing the TCB source file and mapped offsets, or null if resolution fails.
 */
export function getSetup(
  hybridCompiler: HybridCompiler,
  filePath: string,
  position: {line: number; character: number},
): SetupResult | null {
  try {
    let fileContent: string;
    try {
      fileContent = hybridCompiler.getFileContent(filePath);
    } catch {
      return null;
    }
    const offset = positionToOffset(fileContent, position);

    let meta: any = null;
    let tsFilePath = filePath;
    let isHostBinding = false;

    if (filePath.endsWith('.html')) {
      const resolved = hybridCompiler.getTsFileForTemplate(filePath);

      if (!resolved) {
        return null;
      }
      tsFilePath = resolved.tsFilePath;

      const fileResult = hybridCompiler.getClassMetadata(tsFilePath);
      if (!fileResult) {
        return null;
      }

      const compClass = fileResult.classes.find(
        (c: ClassMetadata) => c.symbolId === resolved.symbolId,
      );

      if (!compClass) {
        return null;
      }

      meta = {
        className: compClass.className,
        classKey: makeClassKey(compClass.className, compClass.span.start),
        selector: compClass.component?.selector,
        template: compClass.component?.template,
        isStandalone: compClass.component?.standalone,
        resolvedDeclarations: compClass.component?.resolvedDeclarations || [],
        allDeclarations: fileResult.classes || [],
      };
    } else {
      const fileResult = hybridCompiler.getClassMetadata(filePath);
      if (!fileResult) {
        return null;
      }

      const compClass = fileResult.classes.find((c: ClassMetadata) => {
        // Only a `template` literal has spans in this file; any other inline template's spans
        // are offsets into the resolved template string.
        const contentSpan = c.component?.templateContentSpan;
        if (contentSpan != null && offset >= contentSpan.start && offset <= contentSpan.end) {
          return true;
        }

        if (isPositionInHostBinding(c, offset)) {
          isHostBinding = true;
          return true;
        }

        return false;
      });

      const targetComp = compClass;
      if (!targetComp) {
        return null;
      }

      meta = {
        className: targetComp.className,
        classKey: makeClassKey(targetComp.className, targetComp.span.start),
        selector: targetComp.component?.selector,
        template: targetComp.component?.template,
        resolvedDeclarations: targetComp.component?.resolvedDeclarations || [],
        allDeclarations: fileResult.classes || [],
        isStandalone: targetComp.component?.standalone,
      };
    }

    if (!meta || (!meta.template && !filePath.endsWith('.html') && !isHostBinding)) {
      return null;
    }

    const tcbCode = hybridCompiler.getTcbForFile(tsFilePath);
    if (!tcbCode) {
      return null;
    }

    let parsedTemplate = hybridCompiler.getParsedTemplate(tsFilePath, meta.classKey);
    if (!parsedTemplate) {
      if (isHostBinding) {
        parsedTemplate = {nodes: [], errors: []};
      } else {
        return null;
      }
    }

    const dummyTcbPath = path.join(path.dirname(tsFilePath), '__tcb__.ts');
    const tcbSf = ts.createSourceFile(
      dummyTcbPath,
      tcbCode,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    const hostElement = isHostBinding
      ? hybridCompiler.getHostElement(tsFilePath, meta.classKey)
      : null;

    return {
      tsFilePath,
      meta,
      parsedTemplate,
      offset,
      tcbSf,
      tcbCode,
      isHostBinding,
      hostElement,
    };
  } catch (e) {
    console.error('getSetup CRITICAL ERROR:', e);
    return null;
  }
}
