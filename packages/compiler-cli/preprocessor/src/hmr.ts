/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {compileHmrUpdateCallback, outputAst as o, R3HmrMetadata} from '@angular/compiler';
import {
  extractHmrDependenciesFromOutput,
  PotentialTopLevelReadsVisitor,
  type HmrCompiledOutput,
  type HmrReadResolver,
} from '@angular/compiler-cli/private/hybrid_analysis';
import {ExpressionPrinter, RawSource} from './output_ast_printer.js';
import * as nga from './types.js';

export interface HmrMetadataOptions {
  className: string;
  filePath: string;
  classMeta: nga.ClassMetadata;
  topLevelValueBindings: readonly string[];
  compiled: HmrCompiledOutput;
}

export function extractHmrMetadata(options: HmrMetadataOptions): R3HmrMetadata | null {
  const {className, filePath, classMeta, topLevelValueBindings, compiled} = options;
  const dependencies = extractHmrDependenciesFromOutput(
    className,
    compiled,
    new RawSourceTopLevelReadsVisitor(classMeta.topLevelReferences ?? []),
    new Set(topLevelValueBindings),
    READ_RESOLVER,
  );
  if (dependencies === null) {
    return null;
  }
  return {
    type: o.variable(className),
    className,
    filePath,
    localDependencies: dependencies.local,
    namespaceDependencies: dependencies.external,
  };
}

const READ_RESOLVER: HmrReadResolver<nga.TopLevelReferenceMetadata> = {
  getName: readName,
  // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/hmr/src/extract_dependencies.ts#L96-L139
  getRuntimeRepresentation(read) {
    if (read instanceof o.ReadVarExpr || !read.isConstEnum) {
      return o.variable(readName(read));
    }
    // Const enums can't be passed by reference, because their values are inlined. Pass in an
    // object literal with all of the values instead; the analyzer gives up (no members) when one
    // of them did not fold to a primitive, in which case HMR is disabled for the class.
    if (read.constEnumMembers === undefined) {
      return null;
    }
    return o.literalMap(
      read.constEnumMembers.map((member) => ({
        key: member.key,
        quoted: false,
        value: o.literal(constEnumMemberValue(member)),
      })),
    );
  },
};

function readName(read: o.ReadVarExpr | nga.TopLevelReferenceMetadata): string {
  if (!(read instanceof o.ReadVarExpr)) {
    return read.name;
  }
  const dot = read.name.indexOf('.');
  return dot === -1 ? read.name : read.name.slice(0, dot);
}

function constEnumMemberValue(
  member: nga.ConstEnumMemberMetadata,
): string | number | boolean | null | undefined {
  switch (member.kind) {
    case nga.ConstEnumMemberKind.String:
      return member.value;
    case nga.ConstEnumMemberKind.Number:
      return Number(member.value);
    case nga.ConstEnumMemberKind.Boolean:
      return member.value === 'true';
    case nga.ConstEnumMemberKind.Null:
      return null;
    case nga.ConstEnumMemberKind.Undefined:
      return undefined;
  }
}

class RawSourceTopLevelReadsVisitor extends PotentialTopLevelReadsVisitor<nga.TopLevelReferenceMetadata> {
  private readonly topLevelReferences: readonly nga.TopLevelReferenceMetadata[];

  constructor(topLevelReferences: readonly nga.TopLevelReferenceMetadata[]) {
    super();
    // Source order, so reads inside one slice come out in the order ngtsc visits them.
    this.topLevelReferences = [...topLevelReferences].sort((a, b) => a.span.start - b.span.start);
  }

  protected override addWrappedNodeReads(node: unknown): void {
    if (!(node instanceof RawSource)) {
      return;
    }
    for (const span of node.spans) {
      for (const reference of this.topLevelReferences) {
        if (reference.span.start >= span.start && reference.span.end <= span.end) {
          this.allReads.add(reference);
        }
      }
    }
  }
}

export function getHmrUpdateDeclaration(
  compilationResults: {name: string; initializer: o.Expression | null; statements: o.Statement[]}[],
  constantStatements: o.Statement[],
  meta: R3HmrMetadata,
  filePath: string,
): string {
  // TODO(parity): ngtsc's translator emits the `@__PURE__` annotation on the pure `ɵɵdefineComponent`
  // call inside the callback; this printer only adds it to static fields (`createStaticField`). The
  // module is dev-only and never tree-shaken, so the annotation carries no weight here.
  const printer = new ExpressionPrinter(filePath);
  for (const dependency of meta.namespaceDependencies) {
    printer.addNamespaceImport(dependency.moduleName, dependency.assignedName);
  }
  const callback = compileHmrUpdateCallback(compilationResults, constantStatements, meta);
  // The output AST has no modifiers, so `export default` is added to the printed declaration.
  return `export default ${printer.printStatement(callback)}`;
}
