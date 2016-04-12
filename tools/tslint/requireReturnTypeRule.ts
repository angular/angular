import {RuleFailure} from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/rules';
import {RuleWalker} from 'tslint/lib/language/walker';
import * as ts from 'typescript';

export class Rule extends AbstractRule {
  public static FAILURE_STRING = "missing type declaration";

  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    const typedefWalker = new TypedefWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(typedefWalker);
  }
}

class TypedefWalker extends RuleWalker {
  hasReturnStatement: boolean;

  public visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    this.hasReturnStatement = false;
    super.visitFunctionDeclaration(node);
    if (this.hasReturnStatement) {
      this.handleCallSignature(node);
    }
  }
  public visitFunctionExpression(node: ts.FunctionExpression) {
    let orig = this.hasReturnStatement;
    super.visitFunctionExpression(node);
    this.hasReturnStatement = orig;
  }
  public visitMethodDeclaration(node: ts.MethodDeclaration) {
    this.hasReturnStatement = false;
    super.visitMethodDeclaration(node);
    if (this.hasReturnStatement) {
      this.handleCallSignature(node);
    }
  }
  public visitReturnStatement(node: ts.ReturnStatement) {
    if (node.expression) {
      this.hasReturnStatement = true;
    }
    super.visitReturnStatement(node);
  }

  private handleCallSignature(node: ts.SignatureDeclaration) {
    // set accessors can't have a return type.
    if (node.kind !== ts.SyntaxKind.SetAccessor) {
      this.checkTypeAnnotation(node.type, node.name, node.getStart());
    }
  }

  private checkTypeAnnotation(typeAnnotation: ts.TypeNode, name: ts.Node, start: number) {
    if (typeAnnotation == null) {
      let ns = "<name missing>";
      if (name != null && name.kind === ts.SyntaxKind.Identifier) {
        ns = (<ts.Identifier>name).text;
      }
      if (ns.charAt(0) === '_') return;
      let failure = this.createFailure(start, 1, "expected " + ns + " to have a return type");
      this.addFailure(failure);
    }
  }
}
