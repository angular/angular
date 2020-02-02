/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This module provides methods for extracting TypeScript type data in cases where a pass through
 * tsc is unavoidable. In such cases, a trivial program is constructed and evaluated during the
 * language service runtime.
 */

import * as ts from 'typescript';

class TyHost {
  private static compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2015,
    script: true,
  };
  private static sourceFileCache = new Map<string, ts.SourceFile|undefined>();

  static createProgram(targetFile: string, content: string): ts.Program {
    const options = TyHost.compilerOptions;
    const compilerHost = ts.createCompilerHost(options);
    const originalGetSourceFile = compilerHost.getSourceFile;
    compilerHost.getSourceFile = (fileName) => {
      if (fileName === targetFile) {
        return ts.createSourceFile(fileName, content, ts.ScriptTarget.ES2015, true);
      }

      // Creating TS library source files is expensive. Programs are created with the same compiler
      // options, so we can cache common source files after they are generated once.
      if (!TyHost.sourceFileCache.has(fileName)) {
        const sf = originalGetSourceFile.call(compilerHost, fileName, ts.ScriptTarget.ES2015);
        TyHost.sourceFileCache.set(fileName, sf);
      }
      return TyHost.sourceFileCache.get(fileName);
    };

    return ts.createProgram([targetFile], options, compilerHost);
  }
}

/**
 * A context a TypeScript symbol is discovered in.
 */
export interface TypeContext {
  node: ts.Node;
  program: ts.Program;
  checker: ts.TypeChecker;
}

/**
 * Returns the TypeScript event type corresponding to a DOM event name. If no DOM event of the
 * specified name exists, the generic `Event` type is returned.
 * @param eventName DOM event name
 * @return TS event type corresponding to the DOM event. If calls through tsc fail, the return type
 * is undefined.
 */
export function getDOMEventType(eventName: string): {type: ts.Type, context: TypeContext}|
    undefined {
  const fileName = 'event.ts';
  const ev = 'ev';
  const content = `
    type EventKind<K> = K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] : Event;
    let ${ev}: EventKind<'${eventName}'>;
  `;

  const program = TyHost.createProgram(fileName, content);
  const ast = program.getSourceFile(fileName);

  const vstmt = ast ?.getChildAt(0).getChildren().find(ts.isVariableStatement);
  const evDecl = vstmt ?.declarationList.declarations.find(decl => decl.name.getText() === ev);

  if (!evDecl) return;

  const checker = program.getTypeChecker();
  const type = checker.getTypeAtLocation(evDecl);

  return {
    type,
    context: {
      node: evDecl,
      program,
      checker,
    },
  };
}
