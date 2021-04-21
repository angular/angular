/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PluginObj} from '@babel/core';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

import {FileLinker, isFatalLinkerError, LinkerEnvironment} from '../../../linker';

import {BabelAstFactory} from './ast/babel_ast_factory';
import {BabelAstHost} from './ast/babel_ast_host';
import {BabelDeclarationScope, ConstantScopePath} from './babel_declaration_scope';
import {LinkerPluginOptions} from './linker_plugin_options';


/**
 * Create a Babel plugin that visits the program, identifying and linking partial declarations.
 *
 * The plugin delegates most of its work to a generic `FileLinker` for each file (`t.Program` in
 * Babel) that is visited.
 */
export function createEs2015LinkerPlugin({fileSystem, logger, ...options}: LinkerPluginOptions):
    PluginObj {
  let fileLinker: FileLinker<ConstantScopePath, t.Statement, t.Expression>|null = null;

  return {
    visitor: {
      Program: {

        /**
         * Create a new `FileLinker` as we enter each file (`t.Program` in Babel).
         */
        enter(path: NodePath<t.Program>): void {
          assertNull(fileLinker);
          // Babel can be configured with a `filename` or `relativeFilename` (or both, or neither) -
          // possibly relative to the optional `cwd` path.
          const file: BabelFile = path.hub.file;
          const filename = file.opts.filename ?? file.opts.filenameRelative;
          if (!filename) {
            throw new Error(
                'No filename (nor filenameRelative) provided by Babel. This is required for the linking of partially compiled directives and components.');
          }
          const sourceUrl = fileSystem.resolve(file.opts.cwd ?? '.', filename);

          const linkerEnvironment = LinkerEnvironment.create<t.Statement, t.Expression>(
              fileSystem, logger, new BabelAstHost(), new BabelAstFactory(sourceUrl), options);
          fileLinker = new FileLinker(linkerEnvironment, sourceUrl, file.code);
        },

        /**
         * On exiting the file, insert any shared constant statements that were generated during
         * linking of the partial declarations.
         */
        exit(): void {
          assertNotNull(fileLinker);
          for (const {constantScope, statements} of fileLinker.getConstantStatements()) {
            insertStatements(constantScope, statements);
          }
          fileLinker = null;
        }
      },

      /**
       * Test each call expression to see if it is a partial declaration; it if is then replace it
       * with the results of linking the declaration.
       */
      CallExpression(call: NodePath<t.CallExpression>): void {
        if (fileLinker === null) {
          // Any statements that are inserted upon program exit will be visited outside of an active
          // linker context. These call expressions are known not to contain partial declarations,
          // so it's safe to skip visiting those call expressions.
          return;
        }

        try {
          const calleeName = getCalleeName(call);
          if (calleeName === null) {
            return;
          }
          const args = call.node.arguments;
          if (!fileLinker.isPartialDeclaration(calleeName) || !isExpressionArray(args)) {
            return;
          }

          const declarationScope = new BabelDeclarationScope(call.scope);
          const replacement = fileLinker.linkPartialDeclaration(calleeName, args, declarationScope);

          call.replaceWith(replacement);
        } catch (e) {
          const node = isFatalLinkerError(e) ? e.node as t.Node : call.node;
          throw buildCodeFrameError(call.hub.file, e.message, node);
        }
      }
    }
  };
}

/**
 * Insert the `statements` at the location defined by `path`.
 *
 * The actual insertion strategy depends upon the type of the `path`.
 */
function insertStatements(path: ConstantScopePath, statements: t.Statement[]): void {
  if (path.isFunction()) {
    insertIntoFunction(path, statements);
  } else if (path.isProgram()) {
    insertIntoProgram(path, statements);
  }
}

/**
 * Insert the `statements` at the top of the body of the `fn` function.
 */
function insertIntoFunction(fn: NodePath<t.Function>, statements: t.Statement[]): void {
  const body = fn.get('body');
  body.unshiftContainer('body', statements);
}

/**
 * Insert the `statements` at the top of the `program`, below any import statements.
 */
function insertIntoProgram(program: NodePath<t.Program>, statements: t.Statement[]): void {
  const body = program.get('body');
  const importStatements = body.filter(statement => statement.isImportDeclaration());
  if (importStatements.length === 0) {
    program.unshiftContainer('body', statements);
  } else {
    importStatements[importStatements.length - 1].insertAfter(statements);
  }
}

function getCalleeName(call: NodePath<t.CallExpression>): string|null {
  const callee = call.node.callee;
  if (t.isIdentifier(callee)) {
    return callee.name;
  } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
    return callee.property.name;
  } else if (t.isMemberExpression(callee) && t.isStringLiteral(callee.property)) {
    return callee.property.value;
  } else {
    return null;
  }
}

/**
 * Return true if all the `nodes` are Babel expressions.
 */
function isExpressionArray(nodes: t.Node[]): nodes is t.Expression[] {
  return nodes.every(node => t.isExpression(node));
}

/**
 * Assert that the given `obj` is `null`.
 */
function assertNull<T>(obj: T|null): asserts obj is null {
  if (obj !== null) {
    throw new Error('BUG - expected `obj` to be null');
  }
}

/**
 * Assert that the given `obj` is not `null`.
 */
function assertNotNull<T>(obj: T|null): asserts obj is T {
  if (obj === null) {
    throw new Error('BUG - expected `obj` not to be null');
  }
}

/**
 * Create a string representation of an error that includes the code frame of the `node`.
 */
function buildCodeFrameError(file: BabelFile, message: string, node: t.Node): string {
  const filename = file.opts.filename || '(unknown file)';
  const error = file.buildCodeFrameError(node, message);
  return `${filename}: ${error.message}`;
}

/**
 * This interface is making up for the fact that the Babel typings for `NodePath.hub.file` are
 * lacking.
 */
interface BabelFile {
  code: string;
  opts: {
    filename?: string,
    filenameRelative?: string,
    cwd?: string,
  };

  buildCodeFrameError(node: t.Node, message: string): Error;
}
