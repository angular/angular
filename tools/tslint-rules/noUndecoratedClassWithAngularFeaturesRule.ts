import * as Lint from 'tslint';
import ts from 'typescript';

const RULE_FAILURE =
  `Undecorated class uses Angular features. Undecorated ` +
  `classes using Angular features cannot be extended in Ivy since no definition is generated. ` +
  `Add an Angular decorator to fix this.`;

/** Set of lifecycle hooks that indicate that a given class declaration uses Angular features. */
const LIFECYCLE_HOOKS = new Set([
  'ngOnChanges',
  'ngOnInit',
  'ngOnDestroy',
  'ngDoCheck',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngAfterContentInit',
  'ngAfterContentChecked',
]);

/**
 * Rule that doesn't allow undecorated class declarations using Angular features.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new Walker(sourceFile, this.getOptions(), program.getTypeChecker()),
    );
  }
}

class Walker extends Lint.RuleWalker {
  constructor(
    sourceFile: ts.SourceFile,
    options: Lint.IOptions,
    private _typeChecker: ts.TypeChecker,
  ) {
    super(sourceFile, options);
  }

  override visitClassDeclaration(node: ts.ClassDeclaration) {
    if (this._hasAngularDecorator(node)) {
      return;
    }

    for (let member of node.members) {
      const hasLifecycleHook =
        member.name !== undefined &&
        ts.isIdentifier(member.name) &&
        LIFECYCLE_HOOKS.has(member.name.text);
      // A class is considering using Angular features if it declares any of
      // the known Angular lifecycle hooks, or if it has class members that are
      // decorated with Angular decorators (e.g. `@Input`).
      if (hasLifecycleHook || this._hasAngularDecorator(member)) {
        this.addFailureAtNode(node, RULE_FAILURE);
        return;
      }
    }
  }

  /** Checks if the specified node has an Angular decorator. */
  private _hasAngularDecorator(node: ts.Node): boolean {
    return (
      !!node.decorators &&
      node.decorators.some(d => {
        if (!ts.isCallExpression(d.expression) || !ts.isIdentifier(d.expression.expression)) {
          return false;
        }

        const moduleImport = this._getModuleImportOfIdentifier(d.expression.expression);
        return moduleImport ? moduleImport.startsWith('@angular/core') : false;
      })
    );
  }

  /** Gets the module import of the given identifier if imported. */
  private _getModuleImportOfIdentifier(node: ts.Identifier): string | null {
    const symbol = this._typeChecker.getSymbolAtLocation(node);
    if (!symbol || !symbol.declarations || !symbol.declarations.length) {
      return null;
    }
    const decl = symbol.declarations[0];
    if (!ts.isImportSpecifier(decl)) {
      return null;
    }
    const importDecl = decl.parent.parent.parent;
    const moduleSpecifier = importDecl.moduleSpecifier;
    return ts.isStringLiteral(moduleSpecifier) ? moduleSpecifier.text : null;
  }
}
