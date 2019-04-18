import * as ts from 'typescript';
import * as Lint from 'tslint';

/**
 * Rule that ensures that there are no spaces before/after the braces in import clauses.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  visitImportDeclaration(node: ts.ImportDeclaration) {
    if (!node.importClause) {
      return super.visitImportDeclaration(node);
    }

    const importClauseText = node.importClause.getText();

    if (importClauseText.startsWith('{') && importClauseText.endsWith('}') && (
        importClauseText.includes('{ ') || importClauseText.includes(' }'))) {

      const fix = new Lint.Replacement(
        node.importClause.getStart(), node.importClause.getWidth(),
        importClauseText.replace(/{\s+/, '{').replace(/\s+}/, '}')
      );

      this.addFailureAtNode(node.importClause, 'Import clauses should not have spaces after the ' +
                                               'opening brace or before the closing one.', fix);
    }

    super.visitImportDeclaration(node);
  }
}
