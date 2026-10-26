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

/**
 * The compiled output of a class that HMR inspects for the file-level dependencies it has to
 * capture.
 */
export interface HmrCompiledOutput {
  /** Compiled component definition. */
  definition: R3CompiledExpression;
  /** Compiled component factory. */
  factory: {
    initializer: o.Expression | null;
    statements: o.Statement[];
  };
  /** Metadata about the defer blocks in the component. */
  deferBlockMetadata: R3ComponentDeferMetadata;
  /** Compiled `setClassMetadata` expression, if any. */
  classMetadata: o.Statement | null;
  /** Compiled `setClassDebugInfo` expression, if any. */
  debugInfo: o.Statement | null;
}

/**
 * Resolves the reads a `PotentialTopLevelReadsVisitor` found to the top-level bindings they
 * refer to. `T` is the read representation of whatever is wrapped in the output's
 * `WrappedNodeExpr`s (`ts.Identifier` in ngtsc).
 */
export interface HmrReadResolver<T> {
  /** Name of the top-level binding a read refers to. */
  getName(read: o.ReadVarExpr | T): string;
  /**
   * Expression that stands in for the read in the HMR initializer's capture list, or `null` when
   * it has no runtime representation, in which case HMR is disabled for the class.
   */
  getRuntimeRepresentation(read: o.ReadVarExpr | T): o.Expression | null;
}

/** The file-level dependencies that the HMR initializer needs to capture and pass along. */
export interface HmrDependencies {
  local: Array<{name: string; runtimeRepresentation: o.Expression}>;
  external: R3HmrNamespaceDependency[];
}

/**
 * Extracts file-level dependencies that the HMR initializer needs to capture and pass along.
 */
export function extractHmrDependenciesFromOutput<T>(
  className: string | null,
  output: HmrCompiledOutput,
  visitor: PotentialTopLevelReadsVisitor<T>,
  availableTopLevel: ReadonlySet<string>,
  resolver: HmrReadResolver<T>,
): HmrDependencies | null {
  const {definition, factory, deferBlockMetadata, classMetadata, debugInfo} = output;

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
  const local: Array<{name: string; runtimeRepresentation: o.Expression}> = [];
  const seenLocals = new Set<string>();

  for (const readNode of visitor.allReads) {
    const readName = resolver.getName(readNode);

    if (readName !== className && !seenLocals.has(readName) && availableTopLevel.has(readName)) {
      const runtimeRepresentation = resolver.getRuntimeRepresentation(readNode);

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
 * Visitor that will traverse an AST looking for potential top-level variable reads.
 * The reads are "potential", because the visitor doesn't account for local variables
 * inside functions.
 */
export abstract class PotentialTopLevelReadsVisitor<T> extends o.RecursiveAstVisitor {
  readonly allReads = new Set<o.ReadVarExpr | T>();
  readonly namespaceReads = new Set<string>();

  // tslint:disable-next-line:no-any
  override visitExternalExpr(ast: o.ExternalExpr, context: any) {
    if (ast.value.moduleName !== null) {
      this.namespaceReads.add(ast.value.moduleName);
    }
    super.visitExternalExpr(ast, context);
  }

  // tslint:disable-next-line:no-any
  override visitReadVarExpr(ast: o.ReadVarExpr, context: any) {
    this.allReads.add(ast);
    super.visitReadVarExpr(ast, context);
  }

  // tslint:disable-next-line:no-any
  override visitWrappedNodeExpr(ast: o.WrappedNodeExpr<unknown>, context: any) {
    this.addWrappedNodeReads(ast.node);
    super.visitWrappedNodeExpr(ast, context);
  }

  protected abstract addWrappedNodeReads(node: unknown): void;
}
