import ts from 'typescript';
import * as Lint from 'tslint';

/** Lint rule that doesn't allow usages of type-only imports/exports. */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithFunction(sourceFile, walker);
  }
}

function walker(context: Lint.WalkContext): void {
  (function visitNode(node: ts.Node) {
    if (ts.isTypeOnlyImportOrExportDeclaration(node)) {
      context.addFailureAtNode(node, 'Type-only symbols are not allowed.');
    }

    ts.forEachChild(node, visitNode);
  })(context.sourceFile);
}
