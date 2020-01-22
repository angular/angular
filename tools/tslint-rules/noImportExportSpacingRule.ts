import * as ts from 'typescript';
import * as Lint from 'tslint';

/**
 * Rule that ensures that there are no spaces before/after the braces in import and export clauses.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithFunction(sourceFile, walkContext, this.getOptions().ruleArguments);
  }
}

function walkContext(context: Lint.WalkContext<string[]>) {
  (function visitNode(node: ts.Node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const clause = ts.isImportDeclaration(node) ? node.importClause : node.exportClause;

      if (clause) {
        const clauseText = clause.getText();

        if (clauseText.startsWith('{') && clauseText.endsWith('}') && (
            clauseText.includes('{ ') || clauseText.includes(' }'))) {

          context.addFailureAtNode(clause,
              `${ts.isImportDeclaration(node) ? 'Import' : 'Export'} clauses should not have ` +
              `spaces after the opening brace or before the closing one.`,
              new Lint.Replacement(
                clause.getStart(), clause.getWidth(),
                clauseText.replace(/{\s+/, '{').replace(/\s+}/, '}')
              ));
        }
      }
    }

    ts.forEachChild(node, visitNode);
  })(context.sourceFile);
}
