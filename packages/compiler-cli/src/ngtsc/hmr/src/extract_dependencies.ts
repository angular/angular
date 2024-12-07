/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {R3CompiledExpression, R3HmrNamespaceDependency, outputAst as o} from '@angular/compiler';
import {DeclarationNode} from '../../reflection';
import {CompileResult} from '../../transform';
import ts from 'typescript';

/**
 * Determines the file-level dependencies that the HMR initializer needs to capture and pass along.
 * @param sourceFile File in which the file is being compiled.
 * @param definition Compiled component definition.
 * @param factory Compiled component factory.
 * @param classMetadata Compiled `setClassMetadata` expression, if any.
 * @param debugInfo Compiled `setClassDebugInfo` expression, if any.
 */
export function extractHmrDependencies(
  node: DeclarationNode,
  definition: R3CompiledExpression,
  factory: CompileResult,
  classMetadata: o.Statement | null,
  debugInfo: o.Statement | null,
): {local: string[]; external: R3HmrNamespaceDependency[]} {
  const name = ts.isClassDeclaration(node) && node.name ? node.name.text : null;
  const visitor = new PotentialTopLevelReadsVisitor();
  const sourceFile = node.getSourceFile();

  // Visit all of the compiled expression to look for potential
  // local references that would have to be retained.
  definition.expression.visitExpression(visitor, null);
  definition.statements.forEach((statement) => statement.visitStatement(visitor, null));
  factory.initializer?.visitExpression(visitor, null);
  factory.statements.forEach((statement) => statement.visitStatement(visitor, null));
  classMetadata?.visitStatement(visitor, null);
  debugInfo?.visitStatement(visitor, null);

  // Filter out only the references to defined top-level symbols. This allows us to ignore local
  // variables inside of functions. Note that we filter out the class name since it is always
  // defined and it saves us having to repeat this logic wherever the locals are consumed.
  const availableTopLevel = getTopLevelDeclarationNames(sourceFile);

  return {
    local: Array.from(visitor.allReads).filter((r) => r !== name && availableTopLevel.has(r)),
    external: Array.from(visitor.namespaceReads, (name, index) => ({
      moduleName: name,
      assignedName: `ɵhmr${index}`,
    })),
  };
}

/**
 * Gets the names of all top-level declarations within the file (imports, declared classes etc).
 * @param sourceFile File in which to search for locals.
 */
function getTopLevelDeclarationNames(sourceFile: ts.SourceFile): Set<string> {
  const results = new Set<string>();

  // Only look through the top-level statements.
  for (const node of sourceFile.statements) {
    // Class, function and const enum declarations need to be captured since they correspond
    // to runtime code. Intentionally excludes interfaces and type declarations.
    if (
      ts.isClassDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      (ts.isEnumDeclaration(node) &&
        !node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ConstKeyword))
    ) {
      if (node.name) {
        results.add(node.name.text);
      }
      continue;
    }

    // Variable declarations.
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        trackBindingName(decl.name, results);
      }
      continue;
    }

    // Import declarations.
    if (ts.isImportDeclaration(node) && node.importClause) {
      const importClause = node.importClause;

      // Skip over type-only imports since they won't be emitted to JS.
      if (importClause.isTypeOnly) {
        continue;
      }

      // import foo from 'foo'
      if (importClause.name) {
        results.add(importClause.name.text);
      }

      if (importClause.namedBindings) {
        const namedBindings = importClause.namedBindings;

        if (ts.isNamespaceImport(namedBindings)) {
          // import * as foo from 'foo';
          results.add(namedBindings.name.text);
        } else {
          // import {foo} from 'foo';
          namedBindings.elements.forEach((el) => {
            if (!el.isTypeOnly) {
              results.add(el.name.text);
            }
          });
        }
      }
      continue;
    }
  }

  return results;
}

/**
 * Adds all the variables declared through a `ts.BindingName` to a set of results.
 * @param node Node from which to start searching for variables.
 * @param results Set to which to add the matches.
 */
function trackBindingName(node: ts.BindingName, results: Set<string>): void {
  if (ts.isIdentifier(node)) {
    results.add(node.text);
  } else {
    for (const el of node.elements) {
      if (!ts.isOmittedExpression(el)) {
        trackBindingName(el.name, results);
      }
    }
  }
}

/**
 * Visitor that will traverse an AST looking for potential top-level variable reads.
 * The reads are "potential", because the visitor doesn't account for local variables
 * inside functions.
 */
class PotentialTopLevelReadsVisitor extends o.RecursiveAstVisitor {
  readonly allReads = new Set<string>();
  readonly namespaceReads = new Set<string>();

  override visitExternalExpr(ast: o.ExternalExpr, context: any) {
    if (ast.value.moduleName !== null) {
      this.namespaceReads.add(ast.value.moduleName);
    }
    super.visitExternalExpr(ast, context);
  }

  override visitReadVarExpr(ast: o.ReadVarExpr, context: any) {
    this.allReads.add(ast.name);
    super.visitReadVarExpr(ast, context);
  }

  override visitWrappedNodeExpr(ast: o.WrappedNodeExpr<unknown>, context: any) {
    if (this.isTypeScriptNode(ast.node)) {
      this.addAllTopLevelIdentifiers(ast.node);
    }

    super.visitWrappedNodeExpr(ast, context);
  }

  /**
   * Traverses a TypeScript AST and tracks all the top-level reads.
   * @param node Node from which to start the traversal.
   */
  private addAllTopLevelIdentifiers = (node: ts.Node) => {
    if (ts.isIdentifier(node) && this.isTopLevelIdentifierReference(node)) {
      this.allReads.add(node.text);
    } else {
      ts.forEachChild(node, this.addAllTopLevelIdentifiers);
    }
  };

  /**
   * TypeScript identifiers are used both when referring to a variable (e.g. `console.log(foo)`)
   * and for names (e.g. `{foo: 123}`). This function determines if the identifier is a top-level
   * variable read, rather than a nested name.
   * @param node Identifier to check.
   */
  private isTopLevelIdentifierReference(node: ts.Identifier): boolean {
    const parent = node.parent;

    // The parent might be undefined for a synthetic node or if `setParentNodes` is set to false
    // when the SourceFile was created. We can account for such cases using the type checker, at
    // the expense of performance. At the moment of writing, we're keeping it simple since the
    // compiler sets `setParentNodes: true`.
    if (!parent) {
      return false;
    }

    // Identifier referenced at the top level. Unlikely.
    if (
      ts.isSourceFile(parent) ||
      (ts.isExpressionStatement(parent) && parent.expression === node)
    ) {
      return true;
    }

    // Identifier used inside a call is only top-level if it's an argument.
    // This also covers decorators since their expression is usually a call.
    if (ts.isCallExpression(parent)) {
      return parent.expression === node || parent.arguments.includes(node);
    }

    // Identifier used in a property read is only top-level if it's the expression.
    if (ts.isPropertyAccessExpression(parent)) {
      return parent.expression === node;
    }

    // Identifier used in an array is only top-level if it's one of the elements.
    if (ts.isArrayLiteralExpression(parent)) {
      return parent.elements.includes(node);
    }

    // Identifier in a property assignment is only top level if it's the initializer.
    if (ts.isPropertyAssignment(parent)) {
      return parent.initializer === node;
    }

    // Identifier in a class is only top level if it's the name.
    if (ts.isClassDeclaration(parent)) {
      return parent.name === node;
    }

    // Otherwise it's not top-level.
    return false;
  }

  /** Checks if a value is a TypeScript AST node. */
  private isTypeScriptNode(value: any): value is ts.Node {
    // If this is too permissive, we can also check for `getSourceFile`. This code runs
    // on a narrow set of use cases so checking for `kind` should be enough.
    return !!value && typeof value.kind === 'number';
  }
}
