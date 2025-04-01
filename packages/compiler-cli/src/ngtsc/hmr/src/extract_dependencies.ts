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
import {EnumValue, PartialEvaluator} from '../../partial_evaluator';

/**
 * Determines the file-level dependencies that the HMR initializer needs to capture and pass along.
 * @param sourceFile File in which the file is being compiled.
 * @param definition Compiled component definition.
 * @param factory Compiled component factory.
 * @param deferBlockMetadata Metadata about the defer blocks in the component.
 * @param classMetadata Compiled `setClassMetadata` expression, if any.
 * @param debugInfo Compiled `setClassDebugInfo` expression, if any.
 */
export function extractHmrDependencies(
  node: DeclarationNode,
  definition: R3CompiledExpression,
  factory: CompileResult,
  deferBlockMetadata: R3ComponentDeferMetadata,
  classMetadata: o.Statement | null,
  debugInfo: o.Statement | null,
  reflection: ReflectionHost,
  evaluator: PartialEvaluator,
): {
  local: {name: string; runtimeRepresentation: o.Expression}[];
  external: R3HmrNamespaceDependency[];
} | null {
  const name = ts.isClassDeclaration(node) && node.name ? node.name.text : null;
  const visitor = new PotentialTopLevelReadsVisitor();
  const sourceFile = ts.getOriginalNode(node).getSourceFile();

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

  // Filter out only the references to defined top-level symbols. This allows us to ignore local
  // variables inside of functions. Note that we filter out the class name since it is always
  // defined and it saves us having to repeat this logic wherever the locals are consumed.
  const availableTopLevel = getTopLevelDeclarationNames(sourceFile);
  const local: {name: string; runtimeRepresentation: o.Expression}[] = [];
  const seenLocals = new Set<string>();

  for (const readNode of visitor.allReads) {
    const readName = readNode instanceof o.ReadVarExpr ? readNode.name : readNode.text;

    if (readName !== name && !seenLocals.has(readName) && availableTopLevel.has(readName)) {
      const runtimeRepresentation = getRuntimeRepresentation(readNode, reflection, evaluator);

      if (runtimeRepresentation === null) {
        return null;
      }

      local.push({name: readName, runtimeRepresentation});
      seenLocals.add(readName);
    }
  }

  return {
    local,
    external: Array.from(visitor.namespaceReads, (name, index) => ({
      moduleName: name,
      assignedName: `ɵhmr${index}`,
    })),
  };
}

/**
 * Gets a node that can be used to represent an identifier in the HMR replacement code at runtime.
 */
function getRuntimeRepresentation(
  node: o.ReadVarExpr | ts.Identifier,
  reflection: ReflectionHost,
  evaluator: PartialEvaluator,
): o.Expression | null {
  if (node instanceof o.ReadVarExpr) {
    return o.variable(node.name);
  }

  // Const enums can't be passed by reference, because their values are inlined.
  // Pass in an object literal with all of the values instead.
  if (isConstEnumReference(node, reflection)) {
    const evaluated = evaluator.evaluate(node);

    if (evaluated instanceof Map) {
      const members: {key: string; quoted: boolean; value: o.Expression}[] = [];

      for (const [name, value] of evaluated.entries()) {
        if (
          value instanceof EnumValue &&
          (value.resolved == null ||
            typeof value.resolved === 'string' ||
            typeof value.resolved === 'boolean' ||
            typeof value.resolved === 'number')
        ) {
          members.push({
            key: name,
            quoted: false,
            value: o.literal(value.resolved),
          });
        } else {
          // TS is pretty restrictive about what values can be in a const enum so our evaluator
          // should be able to handle them, however if we happen to hit such a case, we return null
          // so the HMR update can be invalidated.
          return null;
        }
      }

      return o.literalMap(members);
    }
  }

  return o.variable(node.text);
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
      ts.isEnumDeclaration(node)
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
  readonly allReads = new Set<o.ReadVarExpr | ts.Identifier>();
  readonly namespaceReads = new Set<string>();

  override visitExternalExpr(ast: o.ExternalExpr, context: any) {
    if (ast.value.moduleName !== null) {
      this.namespaceReads.add(ast.value.moduleName);
    }
    super.visitExternalExpr(ast, context);
  }

  override visitReadVarExpr(ast: o.ReadVarExpr, context: any) {
    this.allReads.add(ast);
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
      this.allReads.add(node);
    } else {
      ts.forEachChild(node, this.addAllTopLevelIdentifiers);
    }
  };

  /**
   * TypeScript identifiers are used both when referring to a variable (e.g. `console.log(foo)`)
   * and for names (e.g. `{foo: 123}`). This function determines if the identifier is a top-level
   * variable read, rather than a nested name.
   * @param identifier Identifier to check.
   */
  private isTopLevelIdentifierReference(identifier: ts.Identifier): boolean {
    let node = identifier as ts.Expression;
    let parent = node.parent;

    // The parent might be undefined for a synthetic node or if `setParentNodes` is set to false
    // when the SourceFile was created. We can account for such cases using the type checker, at
    // the expense of performance. At the moment of writing, we're keeping it simple since the
    // compiler sets `setParentNodes: true`.
    if (!parent) {
      return false;
    }

    // Unwrap parenthesized identifiers, but use the closest parenthesized expression
    // as the reference node so that we can check cases like `{prop: ((value))}`.
    if (ts.isParenthesizedExpression(parent) && parent.expression === node) {
      while (parent && ts.isParenthesizedExpression(parent)) {
        node = parent;
        parent = parent.parent;
      }
    }

    // Identifier referenced at the top level. Unlikely.
    if (ts.isSourceFile(parent)) {
      return true;
    }

    // Identifier used inside a call is only top-level if it's an argument.
    // This also covers decorators since their expression is usually a call.
    if (ts.isCallExpression(parent)) {
      return parent.expression === node || parent.arguments.includes(node);
    }

    // Identifier used in a nested expression is only top-level if it's the actual expression.
    if (
      ts.isExpressionStatement(parent) ||
      ts.isPropertyAccessExpression(parent) ||
      ts.isComputedPropertyName(parent) ||
      ts.isTemplateSpan(parent) ||
      ts.isSpreadAssignment(parent) ||
      ts.isSpreadElement(parent) ||
      ts.isAwaitExpression(parent) ||
      ts.isNonNullExpression(parent) ||
      ts.isIfStatement(parent) ||
      ts.isDoStatement(parent) ||
      ts.isWhileStatement(parent) ||
      ts.isSwitchStatement(parent) ||
      ts.isCaseClause(parent) ||
      ts.isThrowStatement(parent) ||
      ts.isNewExpression(parent)
    ) {
      return parent.expression === node;
    }

    // Identifier used in an array is only top-level if it's one of the elements.
    if (ts.isArrayLiteralExpression(parent)) {
      return parent.elements.includes(node);
    }

    // If the parent is an initialized node, the identifier is
    // at the top level if it's the initializer itself.
    if (
      ts.isPropertyAssignment(parent) ||
      ts.isParameter(parent) ||
      ts.isBindingElement(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isEnumMember(parent)
    ) {
      return parent.initializer === node;
    }

    // Identifier in a function is top level if it's either the name or the initializer.
    if (ts.isVariableDeclaration(parent)) {
      return parent.name === node || parent.initializer === node;
    }

    // Identifier in a declaration is only top level if it's the name.
    // In shorthand assignments the name is also the value.
    if (
      ts.isClassDeclaration(parent) ||
      ts.isFunctionDeclaration(parent) ||
      ts.isShorthandPropertyAssignment(parent)
    ) {
      return parent.name === node;
    }

    if (ts.isElementAccessExpression(parent)) {
      return parent.expression === node || parent.argumentExpression === node;
    }

    if (ts.isBinaryExpression(parent)) {
      return parent.left === node || parent.right === node;
    }

    if (ts.isForInStatement(parent) || ts.isForOfStatement(parent)) {
      return parent.expression === node || parent.initializer === node;
    }

    if (ts.isForStatement(parent)) {
      return (
        parent.condition === node || parent.initializer === node || parent.incrementor === node
      );
    }

    if (ts.isArrowFunction(parent)) {
      return parent.body === node;
    }

    // It's unlikely that we'll run into imports/exports in this use case.
    // We handle them since it's simple and for completeness' sake.
    if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) {
      return (parent.propertyName || parent.name) === node;
    }

    if (ts.isConditionalExpression(parent)) {
      return parent.condition === node || parent.whenFalse === node || parent.whenTrue === node;
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

/** Checks whether a node is a reference to a const enum. */
function isConstEnumReference(node: ts.Identifier, reflection: ReflectionHost): boolean {
  const parent = node.parent;

  // Only check identifiers that are in the form of `Foo.bar` where `Foo` is the node being checked.
  if (
    !parent ||
    !ts.isPropertyAccessExpression(parent) ||
    parent.expression !== node ||
    !ts.isIdentifier(parent.name)
  ) {
    return false;
  }

  const declaration = reflection.getDeclarationOfIdentifier(node);
  return (
    declaration !== null &&
    ts.isEnumDeclaration(declaration.node) &&
    !!declaration.node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ConstKeyword)
  );
}
