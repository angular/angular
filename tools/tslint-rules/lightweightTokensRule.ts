import ts from 'typescript';
import minimatch from 'minimatch';

import * as path from 'path';
import * as Lint from 'tslint';

/** Arguments this rule supports. */
type RuleArguments = [
  /** Glob that matches files which should be checked */
  string[],
  /** List of symbols that should be skipped for lightweight tokens. */
  string[],
];

/** TSLint walk context for this rule. */
type Context = Lint.WalkContext<RuleArguments>;

/** Failure message that is used when a heavy token is optionally used. */
const failureMessage =
  `Use a lightweight token for optionally injecting. This is necessary as ` +
  `otherwise the injected symbol is always retained even though it might not be used. ` +
  `Read more about it: https://next.angular.io/guide/lightweight-injection-tokens`;

/**
 * Rule that warns if a DI constructor is discovered for which parameters optionally
 * inject classes without using the lightweight token pattern. The rule intends to help
 * with optimized source code that works well for tree shakers. Read more about this here:
 * https://next.angular.io/guide/lightweight-injection-tokens.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithFunction(
      sourceFile,
      checkSourceFileForLightweightTokens,
      this.getOptions().ruleArguments as RuleArguments,
      program.getTypeChecker(),
    );
  }
}

/**
 * Checks whether the given source file has classes with DI constructor parameters
 * for which lightweight tokens are suitable (for optimized tree shaking).
 */
function checkSourceFileForLightweightTokens(ctx: Context, typeChecker: ts.TypeChecker): void {
  // Relative path for the current TypeScript source file. This allows for
  // relative globs being used in the rule options.
  const relativeFilePath = path.relative(process.cwd(), ctx.sourceFile.fileName);
  const [enabledFilesGlobs] = ctx.options;
  const visitNode = (node: ts.Node) => {
    if (ts.isClassDeclaration(node)) {
      checkClassDeclarationForLightweightToken(node, ctx, typeChecker);
    } else {
      ts.forEachChild(node, visitNode);
    }
  };

  if (enabledFilesGlobs.some(g => minimatch(relativeFilePath, g))) {
    ts.forEachChild(ctx.sourceFile, visitNode);
  }
}

/**
 * Checks whether the given class declarations has a constructor with parameters
 * for which lightweight tokens are suitable (for optimized tree shaking).
 */
function checkClassDeclarationForLightweightToken(
  node: ts.ClassDeclaration,
  ctx: Context,
  typeChecker: ts.TypeChecker,
) {
  // If a class has any decorator, it is assumed to be an Angular decorator.
  // There are no other decorators available and we do not want to complicate
  // this lint rule.
  if (!node.decorators || node.decorators.length === 0) {
    return;
  }

  for (const member of node.members) {
    if (member.kind === ts.SyntaxKind.Constructor) {
      checkConstructorForLightweightTokens(member as ts.ConstructorDeclaration, ctx, typeChecker);
    }
  }
}

/**
 * Checks whether the given constructor has parameters where a lightweight
 * token is suitable.
 */
function checkConstructorForLightweightTokens(
  node: ts.ConstructorDeclaration,
  ctx: Context,
  typeChecker: ts.TypeChecker,
) {
  for (const param of node.parameters) {
    // Skip parameters without an explicit type. This should never happen in this
    // repository but we handle it silently if there are such instances.
    if (param.type === undefined) {
      continue;
    }

    // Skip parameters which already have `@Inject` or are not using `@Optional` at all.
    const {isOptional, hasInject} = analyzeDecorators(param);
    if (hasInject || !isOptional) {
      continue;
    }

    // Determine the type being used for injection of this parameter.
    const injectionType = getInjectionType(param.type);
    if (injectionType === null) {
      continue;
    }

    let symbol = typeChecker.getSymbolAtLocation(injectionType);
    // Symbols can be aliases of the declaration symbol. e.g. in named import specifiers.
    // We need to resolve the aliased symbol back to the declaration symbol.
    // tslint:disable-next-line:no-bitwise
    if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
      symbol = typeChecker.getAliasedSymbol(symbol);
    }

    if (!symbol || !symbol.valueDeclaration) {
      continue;
    }

    // Skip symbols which are explicitly disabled in the rule arguments. Some classes
    // such as `Directionality` are always retained anyway, so there is no need to
    // consume them through an optionally lightweight token.
    if (ctx.options[1].includes(symbol.getName())) {
      continue;
    }

    // No lightweight tokens are available for external symbols. Framework might
    // add tokens in the future, but now there is no way for most symbols.
    if (symbol.valueDeclaration.getSourceFile().isDeclarationFile) {
      continue;
    }

    // If the containing class injects itself, then lightweight tokens will not have
    // any effect, and we skip the lint.
    if (symbol.valueDeclaration === node.parent) {
      continue;
    }

    ctx.addFailureAtNode(param.type, failureMessage);
  }
}

/** Gets an identifier that represents the given type node's resolved value. */
function getInjectionType(type: ts.TypeNode): ts.Identifier | null {
  // Unwraps union types with `null`. This is supported in Angular when
  // `@Optional` is used. The `null` union type is ignored.
  if (ts.isUnionTypeNode(type)) {
    const nonNullTypes = type.types.filter(t => t.kind !== ts.SyntaxKind.NullKeyword);
    return nonNullTypes.length === 1 ? getInjectionType(nonNullTypes[0]) : null;
  }
  if (!ts.isTypeReferenceNode(type)) {
    return null;
  }
  const unwrapEntityName = (n: ts.EntityName): ts.Identifier => {
    if (ts.isQualifiedName(n)) {
      return unwrapEntityName(n.right);
    }
    return n;
  };
  return unwrapEntityName(type.typeName);
}

/**
 * Analyzes the decorators of the given parameter. Returns whether it has
 * an `@Inject` or `@Optional` decorator applied.
 */
function analyzeDecorators(param: ts.ParameterDeclaration): {
  hasInject: boolean;
  isOptional: boolean;
} {
  if (!param.decorators) {
    return {hasInject: false, isOptional: false};
  }
  let hasInject = false;
  let isOptional = false;
  for (const decorator of param.decorators) {
    const expr = decorator.expression;
    if (!ts.isCallExpression(expr) || !ts.isIdentifier(expr.expression)) {
      continue;
    }
    if (expr.expression.text === 'Inject') {
      hasInject = true;
    }
    if (expr.expression.text === 'Optional') {
      isOptional = true;
    }
  }
  return {hasInject, isOptional};
}
