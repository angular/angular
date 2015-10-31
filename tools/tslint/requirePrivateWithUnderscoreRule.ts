import {RuleFailure} from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/rules';
import {RuleWalker} from 'tslint/lib/language/walker';
import * as ts from 'tslint/node_modules/typescript';

export class Rule extends AbstractRule {
  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    const typedefWalker = new TypedefWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(typedefWalker);
  }
}

class TypedefWalker extends RuleWalker {
  protected visitPropertyDeclaration(node: ts.PropertyDeclaration): void {
    this.assertUnderscoreIsPrivate(node);
    super.visitPropertyDeclaration(node);
  }

  public visitMethodDeclaration(node: ts.MethodDeclaration): void {
    this.assertUnderscoreIsPrivate(node);
    super.visitMethodDeclaration(node);
  }

  private assertUnderscoreIsPrivate(node: ts.Declaration) {
    if (node.name.getText().charAt(0) === '_') return;

    if (node.modifiers && node.modifiers.flags & ts.NodeFlags.Private) {
      this.addFailure(
          this.createFailure(node.getStart(), node.getWidth(),
                             `expected private member ${node.name.getText()} to start with _`));
    }
  }
}
