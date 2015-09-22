/// <reference path="../../node_modules/typescript/lib/typescriptServices.d.ts" />
/// <reference path="../../node_modules/gulp-tslint/node_modules/tslint/lib/tslint.d.ts" />

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "missing type declaration";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const typedefWalker = new TypedefWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(typedefWalker);
  }
}

class TypedefWalker extends Lint.RuleWalker {
  public visitMethodDeclaration(node: ts.MethodDeclaration) {
    if (node.name.getText().charAt(0) !== '_') {
      node.parameters.forEach((p: ts.ParameterDeclaration) => {
        // a parameter's "type" could be a specific string value, for example `fn(option:
        // "someOption", anotherOption: number)`
        if (p.type == null || p.type.kind !== ts.SyntaxKind.StringLiteral) {
          this.checkTypeAnnotation(p.getEnd(), <ts.TypeNode>p.type, p.name);
        }
      });
    }
    super.visitMethodDeclaration(node);
  }

  private checkTypeAnnotation(location: number, typeAnnotation: ts.TypeNode, name?: ts.Node) {
    if (typeAnnotation == null) {
      let ns = "<name missing>";
      if (name != null && name.kind === ts.SyntaxKind.Identifier) {
        ns = (<ts.Identifier>name).text;
      }
      if (ns.charAt(0) === '_') return;
      let failure = this.createFailure(location, 1, "expected parameter " + ns + " to have a type");
      this.addFailure(failure);
    }
  }
}
