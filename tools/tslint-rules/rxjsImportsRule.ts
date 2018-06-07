import * as ts from 'typescript';
import * as Lint from 'tslint';

/**
 * Rule that ensures that all rxjs imports come only from `rxjs` and `rxjs/operators`.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  visitImportDeclaration(node: ts.ImportDeclaration) {
    const specifier = node.moduleSpecifier.getText().slice(1, -1);

    if (specifier.startsWith('rxjs') && specifier !== 'rxjs' && specifier !== 'rxjs/operators') {
      this.addFailureAtNode(node, 'RxJS imports are only allowed from `rxjs` or `rxjs/operators`.');
    }

    super.visitImportDeclaration(node);
  }
}
