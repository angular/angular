/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Decorator, ReflectionHost} from '../ngtsc/reflection';
import {isAliasImportDeclaration, loadIsReferencedAliasDeclarationPatch} from './patch_alias_reference_resolution';

/**
 * Whether a given decorator should be treated as an Angular decorator.
 * Either it's used in @angular/core, or it's imported from there.
 */
function isAngularDecorator(decorator: Decorator, isCore: boolean): boolean {
  return isCore || (decorator.import !== null && decorator.import.from === '@angular/core');
}

/*
 #####################################################################
  Code below has been extracted from the tsickle decorator downlevel transformer
  and a few local modifications have been applied:

    1. Tsickle by default processed all decorators that had the `@Annotation` JSDoc.
       We modified the transform to only be concerned with known Angular decorators.
    2. Tsickle by default added `@nocollapse` to all generated `ctorParameters` properties.
       We only do this when `annotateForClosureCompiler` is enabled.
    3. Tsickle does not handle union types for dependency injection. i.e. if a injected type
       is denoted with `@Optional`, the actual type could be set to `T | null`.
       See: https://github.com/angular/angular-cli/commit/826803d0736b807867caff9f8903e508970ad5e4.
    4. Tsickle relied on `emitDecoratorMetadata` to be set to `true`. This is due to a limitation
       in TypeScript transformers that never has been fixed. We were able to work around this
       limitation so that `emitDecoratorMetadata` doesn't need to be specified.
       See: `patchAliasReferenceResolution` for more details.

  Here is a link to the tsickle revision on which this transformer is based:
  https://github.com/angular/tsickle/blob/fae06becb1570f491806060d83f29f2d50c43cdd/src/decorator_downlevel_transformer.ts
 #####################################################################
*/

/**
 * Creates the AST for the decorator field type annotation, which has the form
 *     { type: Function, args?: any[] }[]
 */
function createDecoratorInvocationType(): ts.TypeNode {
  const typeElements: ts.TypeElement[] = [];
  typeElements.push(ts.createPropertySignature(
      undefined, 'type', undefined,
      ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
  typeElements.push(ts.createPropertySignature(
      undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken),
      ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
  return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
}

/**
 * Extracts the type of the decorator (the function or expression invoked), as well as all the
 * arguments passed to the decorator. Returns an AST with the form:
 *
 *     // For @decorator(arg1, arg2)
 *     { type: decorator, args: [arg1, arg2] }
 */
function extractMetadataFromSingleDecorator(
    decorator: ts.Decorator, diagnostics: ts.Diagnostic[]): ts.ObjectLiteralExpression {
  const metadataProperties: ts.ObjectLiteralElementLike[] = [];
  const expr = decorator.expression;
  switch (expr.kind) {
    case ts.SyntaxKind.Identifier:
      // The decorator was a plain @Foo.
      metadataProperties.push(ts.createPropertyAssignment('type', expr));
      break;
    case ts.SyntaxKind.CallExpression:
      // The decorator was a call, like @Foo(bar).
      const call = expr as ts.CallExpression;
      metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
      if (call.arguments.length) {
        const args: ts.Expression[] = [];
        for (const arg of call.arguments) {
          args.push(arg);
        }
        const argsArrayLiteral = ts.createArrayLiteral(args);
        argsArrayLiteral.elements.hasTrailingComma = true;
        metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
      }
      break;
    default:
      diagnostics.push({
        file: decorator.getSourceFile(),
        start: decorator.getStart(),
        length: decorator.getEnd() - decorator.getStart(),
        messageText:
            `${ts.SyntaxKind[decorator.kind]} not implemented in gathering decorator metadata.`,
        category: ts.DiagnosticCategory.Error,
        code: 0,
      });
      break;
  }
  return ts.createObjectLiteral(metadataProperties);
}

/**
 * Takes a list of decorator metadata object ASTs and produces an AST for a
 * static class property of an array of those metadata objects.
 */
function createDecoratorClassProperty(decoratorList: ts.ObjectLiteralExpression[]) {
  const modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
  const type = createDecoratorInvocationType();
  const initializer = ts.createArrayLiteral(decoratorList, true);
  // NB: the .decorators property does not get a @nocollapse property. There is
  // no good reason why - it means .decorators is not runtime accessible if you
  // compile with collapse properties, whereas propDecorators is, which doesn't
  // follow any stringent logic. However this has been the case previously, and
  // adding it back in leads to substantial code size increases as Closure fails
  // to tree shake these props without @nocollapse.
  return ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
}

/**
 * Creates the AST for the 'ctorParameters' field type annotation:
 *   () => ({ type: any, decorators?: {type: Function, args?: any[]}[] }|null)[]
 */
function createCtorParametersClassPropertyType(): ts.TypeNode {
  // Sorry about this. Try reading just the string literals below.
  const typeElements: ts.TypeElement[] = [];
  typeElements.push(ts.createPropertySignature(
      undefined, 'type', undefined,
      ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined), undefined));
  typeElements.push(ts.createPropertySignature(
      undefined, 'decorators', ts.createToken(ts.SyntaxKind.QuestionToken),
      ts.createArrayTypeNode(ts.createTypeLiteralNode([
        ts.createPropertySignature(
            undefined, 'type', undefined,
            ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined),
        ts.createPropertySignature(
            undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken),
            ts.createArrayTypeNode(
                ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined)),
            undefined),
      ])),
      undefined));

  return ts.createFunctionTypeNode(undefined, [], ts.createArrayTypeNode(ts.createUnionTypeNode([
    ts.createTypeLiteralNode(typeElements),
    ts.createLiteralTypeNode(ts.createNull()),
  ])));
}

/**
 * Sets a Closure \@nocollapse synthetic comment on the given node. This prevents Closure Compiler
 * from collapsing the apparently static property, which would make it impossible to find for code
 * trying to detect it at runtime.
 */
function addNoCollapseComment(n: ts.Node) {
  ts.setSyntheticLeadingComments(n, [{
                                   kind: ts.SyntaxKind.MultiLineCommentTrivia,
                                   text: '* @nocollapse ',
                                   pos: -1,
                                   end: -1,
                                   hasTrailingNewLine: true
                                 }]);
}

/**
 * createCtorParametersClassProperty creates a static 'ctorParameters' property containing
 * downleveled decorator information.
 *
 * The property contains an arrow function that returns an array of object literals of the shape:
 *     static ctorParameters = () => [{
 *       type: SomeClass|undefined,  // the type of the param that's decorated, if it's a value.
 *       decorators: [{
 *         type: DecoratorFn,  // the type of the decorator that's invoked.
 *         args: [ARGS],       // the arguments passed to the decorator.
 *       }]
 *     }];
 */
function createCtorParametersClassProperty(
    diagnostics: ts.Diagnostic[],
    entityNameToExpression: (n: ts.EntityName) => ts.Expression | undefined,
    ctorParameters: ParameterDecorationInfo[],
    isClosureCompilerEnabled: boolean): ts.PropertyDeclaration {
  const params: ts.Expression[] = [];

  for (const ctorParam of ctorParameters) {
    if (!ctorParam.type && ctorParam.decorators.length === 0) {
      params.push(ts.createNull());
      continue;
    }

    const paramType = ctorParam.type ?
        typeReferenceToExpression(entityNameToExpression, ctorParam.type) :
        undefined;
    const members =
        [ts.createPropertyAssignment('type', paramType || ts.createIdentifier('undefined'))];

    const decorators: ts.ObjectLiteralExpression[] = [];
    for (const deco of ctorParam.decorators) {
      decorators.push(extractMetadataFromSingleDecorator(deco, diagnostics));
    }
    if (decorators.length) {
      members.push(ts.createPropertyAssignment('decorators', ts.createArrayLiteral(decorators)));
    }
    params.push(ts.createObjectLiteral(members));
  }

  const initializer = ts.createArrowFunction(
      undefined, undefined, [], undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      ts.createArrayLiteral(params, true));
  const type = createCtorParametersClassPropertyType();
  const ctorProp = ts.createProperty(
      undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'ctorParameters', undefined, type,
      initializer);
  if (isClosureCompilerEnabled) {
    addNoCollapseComment(ctorProp);
  }
  return ctorProp;
}

/**
 * createPropDecoratorsClassProperty creates a static 'propDecorators' property containing type
 * information for every property that has a decorator applied.
 *
 *     static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
 *       propA: [{type: MyDecorator, args: [1, 2]}, ...],
 *       ...
 *     };
 */
function createPropDecoratorsClassProperty(
    diagnostics: ts.Diagnostic[], properties: Map<string, ts.Decorator[]>): ts.PropertyDeclaration {
  //  `static propDecorators: {[key: string]: ` + {type: Function, args?: any[]}[] + `} = {\n`);
  const entries: ts.ObjectLiteralElementLike[] = [];
  for (const [name, decorators] of properties.entries()) {
    entries.push(ts.createPropertyAssignment(
        name,
        ts.createArrayLiteral(
            decorators.map(deco => extractMetadataFromSingleDecorator(deco, diagnostics)))));
  }
  const initializer = ts.createObjectLiteral(entries, true);
  const type = ts.createTypeLiteralNode([ts.createIndexSignature(
      undefined, undefined, [ts.createParameter(
                                undefined, undefined, undefined, 'key', undefined,
                                ts.createTypeReferenceNode('string', undefined), undefined)],
      createDecoratorInvocationType())]);
  return ts.createProperty(
      undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'propDecorators', undefined, type,
      initializer);
}

/**
 * Returns an expression representing the (potentially) value part for the given node.
 *
 * This is a partial re-implementation of TypeScript's serializeTypeReferenceNode. This is a
 * workaround for https://github.com/Microsoft/TypeScript/issues/17516 (serializeTypeReferenceNode
 * not being exposed). In practice this implementation is sufficient for Angular's use of type
 * metadata.
 */
function typeReferenceToExpression(
    entityNameToExpression: (n: ts.EntityName) => ts.Expression | undefined,
    node: ts.TypeNode): ts.Expression|undefined {
  let kind = node.kind;
  if (ts.isLiteralTypeNode(node)) {
    // Treat literal types like their base type (boolean, string, number).
    kind = node.literal.kind;
  }
  switch (kind) {
    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.ConstructorType:
      return ts.createIdentifier('Function');
    case ts.SyntaxKind.ArrayType:
    case ts.SyntaxKind.TupleType:
      return ts.createIdentifier('Array');
    case ts.SyntaxKind.TypePredicate:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.BooleanKeyword:
      return ts.createIdentifier('Boolean');
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.StringKeyword:
      return ts.createIdentifier('String');
    case ts.SyntaxKind.ObjectKeyword:
      return ts.createIdentifier('Object');
    case ts.SyntaxKind.NumberKeyword:
    case ts.SyntaxKind.NumericLiteral:
      return ts.createIdentifier('Number');
    case ts.SyntaxKind.TypeReference:
      const typeRef = node as ts.TypeReferenceNode;
      // Ignore any generic types, just return the base type.
      return entityNameToExpression(typeRef.typeName);
    case ts.SyntaxKind.UnionType:
      const childTypeNodes =
          (node as ts.UnionTypeNode)
              .types.filter(
                  t => !(ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword));
      return childTypeNodes.length === 1 ?
          typeReferenceToExpression(entityNameToExpression, childTypeNodes[0]) :
          undefined;
    default:
      return undefined;
  }
}

/**
 * Checks whether a given symbol refers to a value that exists at runtime (as distinct from a type).
 *
 * Expands aliases, which is important for the case where
 *   import * as x from 'some-module';
 * and x is now a value (the module object).
 */
function symbolIsRuntimeValue(typeChecker: ts.TypeChecker, symbol: ts.Symbol): boolean {
  if (symbol.flags & ts.SymbolFlags.Alias) {
    symbol = typeChecker.getAliasedSymbol(symbol);
  }

  // Note that const enums are a special case, because
  // while they have a value, they don't exist at runtime.
  return (symbol.flags & ts.SymbolFlags.Value & ts.SymbolFlags.ConstEnumExcludes) !== 0;
}

/** ParameterDecorationInfo describes the information for a single constructor parameter. */
interface ParameterDecorationInfo {
  /**
   * The type declaration for the parameter. Only set if the type is a value (e.g. a class, not an
   * interface).
   */
  type: ts.TypeNode|null;
  /** The list of decorators found on the parameter, null if none. */
  decorators: ts.Decorator[];
}

/**
 * Gets a transformer for downleveling Angular decorators.
 * @param typeChecker Reference to the program's type checker.
 * @param host Reflection host that is used for determining decorators.
 * @param diagnostics List which will be populated with diagnostics if any.
 * @param isCore Whether the current TypeScript program is for the `@angular/core` package.
 * @param isClosureCompilerEnabled Whether closure annotations need to be added where needed.
 * @param skipClassDecorators Whether class decorators should be skipped from downleveling.
 *   This is useful for JIT mode where class decorators should be preserved as they could rely
 *   on immediate execution. e.g. downleveling `@Injectable` means that the injectable factory
 *   is not created, and injecting the token will not work. If this decorator would not be
 *   downleveled, the `Injectable` decorator will execute immediately on file load, and
 *   Angular will generate the corresponding injectable factory.
 */
export function getDownlevelDecoratorsTransform(
    typeChecker: ts.TypeChecker, host: ReflectionHost, diagnostics: ts.Diagnostic[],
    isCore: boolean, isClosureCompilerEnabled: boolean,
    skipClassDecorators: boolean): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    // Ensure that referenced type symbols are not elided by TypeScript. Imports for
    // such parameter type symbols previously could be type-only, but now might be also
    // used in the `ctorParameters` static property as a value. We want to make sure
    // that TypeScript does not elide imports for such type references. Read more
    // about this in the description for `loadIsReferencedAliasDeclarationPatch`.
    const referencedParameterTypes = loadIsReferencedAliasDeclarationPatch(context);

    /**
     * Converts an EntityName (from a type annotation) to an expression (accessing a value).
     *
     * For a given qualified name, this walks depth first to find the leftmost identifier,
     * and then converts the path into a property access that can be used as expression.
     */
    function entityNameToExpression(name: ts.EntityName): ts.Expression|undefined {
      const symbol = typeChecker.getSymbolAtLocation(name);
      // Check if the entity name references a symbol that is an actual value. If it is not, it
      // cannot be referenced by an expression, so return undefined.
      if (!symbol || !symbolIsRuntimeValue(typeChecker, symbol) || !symbol.declarations ||
          symbol.declarations.length === 0) {
        return undefined;
      }
      // If we deal with a qualified name, build up a property access expression
      // that could be used in the JavaScript output.
      if (ts.isQualifiedName(name)) {
        const containerExpr = entityNameToExpression(name.left);
        if (containerExpr === undefined) {
          return undefined;
        }
        return ts.createPropertyAccess(containerExpr, name.right);
      }
      const decl = symbol.declarations[0];
      // If the given entity name has been resolved to an alias import declaration,
      // ensure that the alias declaration is not elided by TypeScript, and use its
      // name identifier to reference it at runtime.
      if (isAliasImportDeclaration(decl)) {
        referencedParameterTypes.add(decl);
        // If the entity name resolves to an alias import declaration, we reference the
        // entity based on the alias import name. This ensures that TypeScript properly
        // resolves the link to the import. Cloning the original entity name identifier
        // could lead to an incorrect resolution at local scope. e.g. Consider the following
        // snippet: `constructor(Dep: Dep) {}`. In such a case, the local `Dep` identifier
        // would resolve to the actual parameter name, and not to the desired import.
        // This happens because the entity name identifier symbol is internally considered
        // as type-only and therefore TypeScript tries to resolve it as value manually.
        // We can help TypeScript and avoid this non-reliable resolution by using an identifier
        // that is not type-only and is directly linked to the import alias declaration.
        if (decl.name !== undefined) {
          return ts.getMutableClone(decl.name);
        }
      }
      // Clone the original entity name identifier so that it can be used to reference
      // its value at runtime. This is used when the identifier is resolving to a file
      // local declaration (otherwise it would resolve to an alias import declaration).
      return ts.getMutableClone(name);
    }

    /**
     * Transforms a class element. Returns a three tuple of name, transformed element, and
     * decorators found. Returns an undefined name if there are no decorators to lower on the
     * element, or the element has an exotic name.
     */
    function transformClassElement(element: ts.ClassElement):
        [string|undefined, ts.ClassElement, ts.Decorator[]] {
      element = ts.visitEachChild(element, decoratorDownlevelVisitor, context);
      const decoratorsToKeep: ts.Decorator[] = [];
      const toLower: ts.Decorator[] = [];
      const decorators = host.getDecoratorsOfDeclaration(element) || [];
      for (const decorator of decorators) {
        // We only deal with concrete nodes in TypeScript sources, so we don't
        // need to handle synthetically created decorators.
        const decoratorNode = decorator.node! as ts.Decorator;
        if (!isAngularDecorator(decorator, isCore)) {
          decoratorsToKeep.push(decoratorNode);
          continue;
        }
        toLower.push(decoratorNode);
      }
      if (!toLower.length) return [undefined, element, []];

      if (!element.name || !ts.isIdentifier(element.name)) {
        // Method has a weird name, e.g.
        //   [Symbol.foo]() {...}
        diagnostics.push({
          file: element.getSourceFile(),
          start: element.getStart(),
          length: element.getEnd() - element.getStart(),
          messageText: `Cannot process decorators for class element with non-analyzable name.`,
          category: ts.DiagnosticCategory.Error,
          code: 0,
        });
        return [undefined, element, []];
      }

      const name = (element.name as ts.Identifier).text;
      const mutable = ts.getMutableClone(element);
      (mutable as any).decorators = decoratorsToKeep.length ?
          ts.setTextRange(ts.createNodeArray(decoratorsToKeep), mutable.decorators) :
          undefined;
      return [name, mutable, toLower];
    }

    /**
     * Transforms a constructor. Returns the transformed constructor and the list of parameter
     * information collected, consisting of decorators and optional type.
     */
    function transformConstructor(ctor: ts.ConstructorDeclaration):
        [ts.ConstructorDeclaration, ParameterDecorationInfo[]] {
      ctor = ts.visitEachChild(ctor, decoratorDownlevelVisitor, context);

      const newParameters: ts.ParameterDeclaration[] = [];
      const oldParameters =
          ts.visitParameterList(ctor.parameters, decoratorDownlevelVisitor, context);
      const parametersInfo: ParameterDecorationInfo[] = [];
      for (const param of oldParameters) {
        const decoratorsToKeep: ts.Decorator[] = [];
        const paramInfo: ParameterDecorationInfo = {decorators: [], type: null};
        const decorators = host.getDecoratorsOfDeclaration(param) || [];

        for (const decorator of decorators) {
          // We only deal with concrete nodes in TypeScript sources, so we don't
          // need to handle synthetically created decorators.
          const decoratorNode = decorator.node! as ts.Decorator;
          if (!isAngularDecorator(decorator, isCore)) {
            decoratorsToKeep.push(decoratorNode);
            continue;
          }
          paramInfo!.decorators.push(decoratorNode);
        }
        if (param.type) {
          // param has a type provided, e.g. "foo: Bar".
          // The type will be emitted as a value expression in entityNameToExpression, which takes
          // care not to emit anything for types that cannot be expressed as a value (e.g.
          // interfaces).
          paramInfo!.type = param.type;
        }
        parametersInfo.push(paramInfo);
        const newParam = ts.updateParameter(
            param,
            // Must pass 'undefined' to avoid emitting decorator metadata.
            decoratorsToKeep.length ? decoratorsToKeep : undefined, param.modifiers,
            param.dotDotDotToken, param.name, param.questionToken, param.type, param.initializer);
        newParameters.push(newParam);
      }
      const updated = ts.updateConstructor(
          ctor, ctor.decorators, ctor.modifiers, newParameters,
          ts.visitFunctionBody(ctor.body, decoratorDownlevelVisitor, context));
      return [updated, parametersInfo];
    }

    /**
     * Transforms a single class declaration:
     * - dispatches to strip decorators on members
     * - converts decorators on the class to annotations
     * - creates a ctorParameters property
     * - creates a propDecorators property
     */
    function transformClassDeclaration(classDecl: ts.ClassDeclaration): ts.ClassDeclaration {
      classDecl = ts.getMutableClone(classDecl);

      const newMembers: ts.ClassElement[] = [];
      const decoratedProperties = new Map<string, ts.Decorator[]>();
      let classParameters: ParameterDecorationInfo[]|null = null;

      for (const member of classDecl.members) {
        switch (member.kind) {
          case ts.SyntaxKind.PropertyDeclaration:
          case ts.SyntaxKind.GetAccessor:
          case ts.SyntaxKind.SetAccessor:
          case ts.SyntaxKind.MethodDeclaration: {
            const [name, newMember, decorators] = transformClassElement(member);
            newMembers.push(newMember);
            if (name) decoratedProperties.set(name, decorators);
            continue;
          }
          case ts.SyntaxKind.Constructor: {
            const ctor = member as ts.ConstructorDeclaration;
            if (!ctor.body) break;
            const [newMember, parametersInfo] =
                transformConstructor(member as ts.ConstructorDeclaration);
            classParameters = parametersInfo;
            newMembers.push(newMember);
            continue;
          }
          default:
            break;
        }
        newMembers.push(ts.visitEachChild(member, decoratorDownlevelVisitor, context));
      }

      // The `ReflectionHost.getDecoratorsOfDeclaration()` method will not return certain kinds of
      // decorators that will never be Angular decorators. So we cannot rely on it to capture all
      // the decorators that should be kept. Instead we start off with a set of the raw decorators
      // on the class, and only remove the ones that have been identified for downleveling.
      const decoratorsToKeep = new Set<ts.Decorator>(classDecl.decorators);
      const possibleAngularDecorators = host.getDecoratorsOfDeclaration(classDecl) || [];

      let hasAngularDecorator = false;
      const decoratorsToLower = [];
      for (const decorator of possibleAngularDecorators) {
        // We only deal with concrete nodes in TypeScript sources, so we don't
        // need to handle synthetically created decorators.
        const decoratorNode = decorator.node! as ts.Decorator;
        const isNgDecorator = isAngularDecorator(decorator, isCore);

        // Keep track if we come across an Angular class decorator. This is used
        // for to determine whether constructor parameters should be captured or not.
        if (isNgDecorator) {
          hasAngularDecorator = true;
        }

        if (isNgDecorator && !skipClassDecorators) {
          decoratorsToLower.push(extractMetadataFromSingleDecorator(decoratorNode, diagnostics));
          decoratorsToKeep.delete(decoratorNode);
        }
      }

      if (decoratorsToLower.length) {
        newMembers.push(createDecoratorClassProperty(decoratorsToLower));
      }
      if (classParameters) {
        if (hasAngularDecorator || classParameters.some(p => !!p.decorators.length)) {
          // Capture constructor parameters if the class has Angular decorator applied,
          // or if any of the parameters has decorators applied directly.
          newMembers.push(createCtorParametersClassProperty(
              diagnostics, entityNameToExpression, classParameters, isClosureCompilerEnabled));
        }
      }
      if (decoratedProperties.size) {
        newMembers.push(createPropDecoratorsClassProperty(diagnostics, decoratedProperties));
      }

      const members = ts.setTextRange(
          ts.createNodeArray(newMembers, classDecl.members.hasTrailingComma), classDecl.members);

      return ts.updateClassDeclaration(
          classDecl, decoratorsToKeep.size ? Array.from(decoratorsToKeep) : undefined,
          classDecl.modifiers, classDecl.name, classDecl.typeParameters, classDecl.heritageClauses,
          members);
    }

    /**
     * Transformer visitor that looks for Angular decorators and replaces them with
     * downleveled static properties. Also collects constructor type metadata for
     * class declaration that are decorated with an Angular decorator.
     */
    function decoratorDownlevelVisitor(node: ts.Node): ts.Node {
      if (ts.isClassDeclaration(node)) {
        return transformClassDeclaration(node);
      }
      return ts.visitEachChild(node, decoratorDownlevelVisitor, context);
    }

    return (sf: ts.SourceFile) => {
      // Downlevel decorators and constructor parameter types. We will keep track of all
      // referenced constructor parameter types so that we can instruct TypeScript to
      // not elide their imports if they previously were only type-only.
      return ts.visitEachChild(sf, decoratorDownlevelVisitor, context);
    };
  };
}
