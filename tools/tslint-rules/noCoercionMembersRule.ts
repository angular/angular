import ts from 'typescript';
import * as Lint from 'tslint';

/** Lint rule that disallows coercion class members. */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithFunction(
      sourceFile,
      (context: Lint.WalkContext<string[]>) => {
        (function visitNode(node: ts.Node) {
          if (ts.isClassDeclaration(node)) {
            node.members.forEach(member => {
              if (member.name?.getText().startsWith('ngAcceptInputType_')) {
                context.addFailureAtNode(
                  member,
                  'Coercion members are not allowed. Add the type to the input setter instead.',
                );
              }
            });
          }

          ts.forEachChild(node, visitNode);
        })(context.sourceFile);
      },
      this.getOptions().ruleArguments,
    );
  }
}
