import * as path from 'path';
import * as Lint from 'tslint';
import ts from 'typescript';
import minimatch from 'minimatch';

const hooks = new Set([
  'ngOnChanges',
  'ngOnInit',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngOnDestroy',
  'ngDoBootstrap',
]);

/** Rule that prevents direct calls of the Angular lifecycle hooks */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  /** Whether the walker should check the current source file. */
  private _enabled: boolean;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    const fileGlobs = options.ruleArguments;
    const relativeFilePath = path.relative(process.cwd(), sourceFile.fileName);
    this._enabled = fileGlobs.some(p => minimatch(relativeFilePath, p));
  }

  override visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    // Flag any accesses of the lifecycle hooks that are
    // inside function call and don't match the allowed criteria.
    if (
      this._enabled &&
      ts.isCallExpression(node.parent) &&
      hooks.has(node.name.text) &&
      !this._isAllowedAccessor(node)
    ) {
      this.addFailureAtNode(node, 'Manually invoking Angular lifecycle hooks is not allowed.');
    }

    return super.visitPropertyAccessExpression(node);
  }

  /** Checks whether the accessor of an Angular lifecycle hook expression is allowed. */
  private _isAllowedAccessor(node: ts.PropertyAccessExpression): boolean {
    // We only allow accessing the lifecycle hooks via super.
    if (node.expression.kind !== ts.SyntaxKind.SuperKeyword) {
      return false;
    }

    let parent = node.parent;

    // Even if the access is on a `super` expression, verify that the hook is being called
    // from inside a method with the same name (e.g. to avoid calling `ngAfterViewInit` from
    // inside `ngOnInit`).
    while (parent && !ts.isSourceFile(parent)) {
      if (ts.isMethodDeclaration(parent)) {
        return (parent.name as ts.Identifier).text === node.name.text;
      } else {
        parent = parent.parent;
      }
    }

    return false;
  }
}
