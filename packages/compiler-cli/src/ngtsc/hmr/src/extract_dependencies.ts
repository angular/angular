/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DeferBlockDepsEmitMode,
  R3CompiledExpression,
  R3ComponentDeferMetadata,
  R3HmrNamespaceDependency,
  outputAst as o,
} from '@angular/compiler';
import {DeclarationNode, ReflectionHost} from '../../reflection';
import {CompileResult} from '../../transform';
import ts from 'typescript';

/**
 * Determines the file-level dependencies that the HMR initializer needs to capture and pass along.
 * @param node Node to be analyzed.
 * @param reflectionHost Host used to resolve symbol declarations.
 * @param definition Compiled component definition.
 * @param factory Compiled component factory.
 * @param deferBlockMetadata Metadata about the defer blocks in the component.
 * @param classMetadata Compiled `setClassMetadata` expression, if any.
 * @param debugInfo Compiled `setClassDebugInfo` expression, if any.
 */
export function extractHmrDependencies(
  node: DeclarationNode,
  reflectionHost: ReflectionHost,
  definition: R3CompiledExpression,
  factory: CompileResult,
  deferBlockMetadata: R3ComponentDeferMetadata,
  classMetadata: o.Statement | null,
  debugInfo: o.Statement | null,
): {local: string[]; external: R3HmrNamespaceDependency[]} {
  const visitor = new NamespaceReadAnalyzer();

  // Visit all of the compiled expressions to look for potential
  // local references that would have to be retained.
  definition.expression.visitExpression(visitor, null);
  definition.statements.forEach((statement) => statement.visitStatement(visitor, null));
  factory.initializer?.visitExpression(visitor, null);
  factory.statements.forEach((statement) => statement.visitStatement(visitor, null));
  classMetadata?.visitStatement(visitor, null);
  debugInfo?.visitStatement(visitor, null);

  if (deferBlockMetadata.mode === DeferBlockDepsEmitMode.PerBlock) {
    deferBlockMetadata.blocks.forEach((loader) => loader?.visitExpression(visitor, null));
  } else {
    deferBlockMetadata.dependenciesFn?.visitExpression(visitor, null);
  }

  return {
    // Note that we pass all of the top-level reads, even the ones that might not be used
    // within the definition, because they may become used depending on the template.
    local: getTopLevelDeclarationNames(node, reflectionHost),
    external: Array.from(visitor.namespaceReads, (name, index) => ({
      moduleName: name,
      assignedName: `ɵhmr${index}`,
    })),
  };
}

/**
 * Gets the names of all top-level declarations within the file (imports, declared classes etc).
 * @param analysisNode Node that for which the analysis was initiated.
 * @param reflectionHost Host used to resolve symbol declarations.
 */
function getTopLevelDeclarationNames(
  analysisNode: ts.Node,
  reflectionHost: ReflectionHost,
): string[] {
  const results = new Set<string>();
  const sourceFile = analysisNode.getSourceFile();

  // Only look through the top-level statements.
  for (const node of sourceFile.statements) {
    // Skip over the node that is being analyzed since it's not a dependency of itself.
    if (node === analysisNode) {
      continue;
    }

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
      if (importClause.name && !isTypeOnlyReference(importClause.name, reflectionHost)) {
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
            if (!el.isTypeOnly && !isTypeOnlyReference(el.name, reflectionHost)) {
              results.add(el.name.text);
            }
          });
        }
      }
      continue;
    }
  }

  return Array.from(results);
}

/**
 * Determines if an identifier is pointing to a type-only declaration.
 * @param identifier Identifier to check.
 * @param reflectionHost Host to use when resolving the declaration.
 */
function isTypeOnlyReference(identifier: ts.Identifier, reflectionHost: ReflectionHost): boolean {
  const node = reflectionHost.getDeclarationOfIdentifier(identifier)?.node ?? null;

  if (node === null) {
    return false;
  }

  // Interfaces and type aliases are always type-only. We're unlikely to
  // encounter a type node here, but we check it just in case.
  if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isTypeNode(node)) {
    return true;
  }

  // Enums are type-only if they're `const`.
  if (ts.isEnumDeclaration(node)) {
    return !!ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ConstKeyword);
  }

  return false;
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

/** Visitor that will traverse an AST looking for generated reads of namespaces. */
class NamespaceReadAnalyzer extends o.RecursiveAstVisitor {
  readonly namespaceReads = new Set<string>();

  override visitExternalExpr(ast: o.ExternalExpr, context: any) {
    if (ast.value.moduleName !== null) {
      this.namespaceReads.add(ast.value.moduleName);
    }
    super.visitExternalExpr(ast, context);
  }
}
