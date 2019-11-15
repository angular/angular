import * as Lint from 'tslint';
import * as ts from 'typescript';

const RULE_FAILURE = `Undecorated class defines fields with Angular decorators. Undecorated ` +
  `classes with Angular fields cannot be extended in Ivy since no definition is generated. ` +
  `Add a "@Directive" decorator to fix this.`;

/**
 * Rule that doesn't allow undecorated class declarations with fields using Angular
 * decorators.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new Walker(sourceFile, this.getOptions(), program.getTypeChecker()));
  }
}

class Walker extends Lint.RuleWalker {
  constructor(
      sourceFile: ts.SourceFile, options: Lint.IOptions, private _typeChecker: ts.TypeChecker) {
    super(sourceFile, options);
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    if (this._hasAngularDecorator(node)) {
      return;
    }

    for (let member of node.members) {
      if (member.decorators && this._hasAngularDecorator(member)) {
        this.addFailureAtNode(node, RULE_FAILURE);
        return;
      }
    }
  }

  /** Checks if the specified node has an Angular decorator. */
  private _hasAngularDecorator(node: ts.Node): boolean {
    return !!node.decorators && node.decorators.some(d => {
      if (!ts.isCallExpression(d.expression) ||
          !ts.isIdentifier(d.expression.expression)) {
        return false;
      }

      const moduleImport = this._getModuleImportOfIdentifier(d.expression.expression);
      return moduleImport ? moduleImport.startsWith('@angular/core') : false;
    });
  }

  /** Gets the module import of the given identifier if imported. */
  private _getModuleImportOfIdentifier(node: ts.Identifier): string|null {
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
