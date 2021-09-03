/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ArgumentsContainer, ArgumentsScope, ArgumentsScopes, isArgumentsAccessInAsyncArrowFn, isArgumentsContainer, isShorthandArgumentsInAsyncArrowFn} from './scopes/arguments_scope';
import {AsyncSuperScope, isSuperContainer, isSuperElementAccess, isSuperPropertyAccess, SuperContainer, SuperScopes} from './scopes/super_scope';
import {TransformSuperElementAccessesVisitor} from './super_accesses_transform';
import {AsyncFunction, filterAsyncModifier, hasFunctionBody, isAssignmentReceiver, isAsyncFunction, isNamedFunction, uniqueName} from './utils';

const NO_ASTERISK = undefined;
const NO_DECORATORS = undefined;
const NO_DOT_DOT_DOT = undefined;
const NO_EQUALS_GREATER_THAN = undefined;
const NO_EXCLAMATION = undefined;
const NO_MODIFIERS = undefined;
const NO_TYPE_ARGUMENTS = undefined;
const NO_TYPE = undefined;
const NO_TYPE_PARAMETERS = undefined;

/**
 * Call this function to create a factory for a TS transformer that can convert async-await code
 * into code that is compatible with Zone.js.
 *
 * There is no way for Zone.js to hook into the promises that are created by native use of `async`
 * functions. This can cause the tasks created by such promises to be ignored by Zone.js and in
 * Angular, cause missed changed detection notifications.
 *
 * This transform converts each `async` function in a source file into a generator function that is
 * iterated over by the `Zone.__awaiter()` helper function.
 *
 * Each `await` point in the `async` function is converted to a `yield` in the generator.
 * The `__awaiter()` helper function then ensures that each `yield` point is correctly handled
 * within the correct Zone.
 *
 * There is additional processing to ensure that `super` and `arguments` are handled correctly
 * within the transformed generator functions.
 *
 * @returns a TS transformer factory function that returns the TS transformer.
 */
export function createAsyncTransform(): ts.TransformerFactory<ts.SourceFile> {
  // The transformer factory function.
  return (context) => {
    const visitor = new AsyncFunctionVisitor(context);

    // The transformer function.
    return (sourceFile) => {
      if (sourceFile.isDeclarationFile || !sourceFile.text.includes('async')) {
        // Do not waste time visiting the AST if:
        // - it is a .d.ts file or
        // - there is no `async` string in the file.
        return sourceFile;
      }
      return ts.visitNode(sourceFile, visitor.visit);
    };
  };
}

/**
 * This class implements a TypeScript visitor function to transform async functions into Zone safe
 * wrapped generator functions.
 */
export class AsyncFunctionVisitor {
  private readonly factory = this.context.factory;
  private readonly superScopes = new SuperScopes(this.factory);
  private readonly argumentsScopes = new ArgumentsScopes(this.factory);

  constructor(private readonly context: ts.TransformationContext) {}

  /**
   * The visitor function that is passed to TypeScript's `visitNode` in the transformer above.
   *
   * Note that this must be defined as an arrow function property for it to hold on to its `this`
   * value correctly when called as a free-standing function.
   */
  visit: ts.Visitor = node => {
    this.enterScopes(node);
    this.recordUsage(node);
    node = ts.visitEachChild(node, this.visit, this.context);
    node = this.transformNode(node);
    this.leaveScopes(node);
    return node;
  };

  /**
   * Store lexical scopes associated with this `node`.
   */
  private enterScopes(node: ts.Node): void {
    if (isSuperContainer(node)) {
      this.superScopes.push(node);
    }
    if (isArgumentsContainer(node)) {
      this.argumentsScopes.push(node);
    }

    const superScope = this.superScopes.peek();
    if (superScope !== null && isAsyncFunction(node)) {
      // Track entering and leaving async functions within a `super` scope since we only want to
      // create proxies if the `super` access is from within an `async` function, which may not be
      // the `super` scope container.
      superScope.enterAsyncFunction();
    }
  }

  /**
   * Remove lexical scopes associated with this `node`.
   */
  private leaveScopes(node: ts.Node): void {
    const superScope = this.superScopes.peek();
    if (superScope !== null && isAsyncFunction(node)) {
      superScope.leaveAsyncFunction();
    }

    if (isSuperContainer(node)) {
      this.superScopes.pop();
    }
    if (isArgumentsContainer(node)) {
      this.argumentsScopes.pop();
    }
  }

  /**
   * Record usage of `super` and `arguments` at this `node` within the current lexical scopes.
   */
  private recordUsage(node: ts.Node): void {
    const argumentsScope = this.argumentsScopes.peek();
    if (isSuperPropertyAccess(node)) {
      this.recordSuperPropertyAccess(node);
    } else if (isSuperElementAccess(node)) {
      this.recordSuperElementAccess(node);
    } else if (
        argumentsScope !== null && isArgumentsAccessInAsyncArrowFn(node, argumentsScope.node)) {
      this.recordArgumentsAccess(node, argumentsScope);
    }
  }

  /**
   * Transform this `node` after all its descendants have been processed.
   */
  private transformNode(node: ts.Node): ts.Node {
    const argumentsScope = this.argumentsScopes.peek();
    const superScope = this.superScopes.peek();

    if (argumentsScope !== null) {
      if (isShorthandArgumentsInAsyncArrowFn(node, argumentsScope.node)) {
        // We have something like: `{ arguments }`.
        // Split it into a property name and value `{ arguments: arguments }`
        // and then replace the property value with a reference to the arguments proxy:
        // `{ arguments: ɵarguments }`
        node = this.factory.createPropertyAssignment('arguments', argumentsScope.argumentsProxy);
      }

      if (isArgumentsAccessInAsyncArrowFn(node, argumentsScope.node)) {
        // Substitute the `arguments` identifier with the `ɵarguments` proxy identifier if this
        // access is within an async arrow function.
        node = argumentsScope.argumentsProxy;
      }

      if (isArgumentsContainer(node) && argumentsScope.hasArgumentsAccess) {
        // This `arguments` container contains an `arguments` access from within an async arrow
        // function. Define the `ɵarguments` proxy variable at the start of the function body.
        node = this.addArgumentsProxy(node, argumentsScope);
      }
    }

    if (ts.isAwaitExpression(node)) {
      // Convert `await` expression to `yield` expression.
      node = this.factory.createYieldExpression(NO_ASTERISK, node.expression);
    }

    if (isAsyncFunction(node)) {
      // Convert `async` functions into generators that are driven by the `Zone.__awaiter()`
      // function. This is the main point of this TS transform!
      node = this.transformAsyncFunction((node as AsyncFunction), superScope);
    }

    if (isSuperContainer(node) && superScope !== null && superScope.hasSuperAccess) {
      // Convert the `super` container to include `super` proxies if there were accesses to `super`
      // from within an `async` function in this scope.
      node = this.addSuperProxies(node, superScope);
    }

    return node;
  }

  /**
   * Record the name of the `super` property being accessed in an `async` method.
   *
   * This is used later on to indicate that a `super` proxy variable is required.
   */
  private recordSuperPropertyAccess(node: ts.PropertyAccessExpression): void {
    const asyncScope = this.superScopes.peek();
    if (asyncScope !== null) {
      // Store this `super` access in the async scope
      if (isAssignmentReceiver(node)) {
        asyncScope.recordSuperPropertyWrite(node.name.text);
      } else {
        asyncScope.recordSuperPropertyRead(node.name.text);
      }
    }
  }

  /**
   * Record the `super` element access in an `async` method.
   *
   * This is used later on to indicate that a `ɵsuperIndex` proxy function is required.
   */
  private recordSuperElementAccess(node: ts.ElementAccessExpression): void {
    const asyncScope = this.superScopes.peek();
    if (asyncScope !== null) {
      // Store this super access in the async scope
      if (isAssignmentReceiver(node)) {
        asyncScope.recordSuperElementWrite();
      } else {
        asyncScope.recordSuperElementRead();
      }
    }
  }

  /**
   * Record an `arguments` access in an async arrow function.
   *
   * This is used later on to indicate that a `ɵarguments` proxy variable is required.
   */
  private recordArgumentsAccess(node: ts.Identifier, asyncScope: ArgumentsScope): void {
    asyncScope.recordArgumentsAccess();
  }


  /**
   * Transform the identified async function into a generator function that is wrapped in a call
   * to the `Zone.__awaiter()` helper.
   *
   * The async function is replaced with an updated function, which runs a generator function
   * inside a call to the `Zone.__awaiter()` helper function.
   *
   * This function uses a specific TypeScript factory function for each type of function that can be
   * transformed.
   */
  private transformAsyncFunction(asyncFn: AsyncFunction, asyncSuperScope: AsyncSuperScope|null):
      ts.SignatureDeclaration {
    const modifiers = filterAsyncModifier(asyncFn.modifiers);
    const generatorFn = this.createGeneratorFunction(asyncFn, asyncSuperScope);
    const args = this.convertParamsToArgs(asyncFn.parameters ?? []);
    const awaiterCall = this.createAwaiterCall(generatorFn, args);

    if (ts.isArrowFunction(asyncFn)) {
      // Arrow functions can be simpler than normal functions since we do not need to create a
      // return statement.
      return this.factory.updateArrowFunction(
          asyncFn, NO_MODIFIERS, asyncFn.typeParameters, asyncFn.parameters, asyncFn.type,
          this.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), awaiterCall);
    }

    const body = this.factory.createBlock(
        [this.factory.createReturnStatement(awaiterCall)], /* multiLine */ true);
    if (ts.isFunctionExpression(asyncFn)) {
      return this.factory.updateFunctionExpression(
          asyncFn, modifiers, NO_ASTERISK, asyncFn.name, asyncFn.typeParameters, asyncFn.parameters,
          asyncFn.type, body);
    } else if (ts.isFunctionDeclaration(asyncFn)) {
      return this.factory.updateFunctionDeclaration(
          asyncFn, asyncFn.decorators, modifiers, NO_ASTERISK, asyncFn.name, asyncFn.typeParameters,
          asyncFn.parameters, asyncFn.type, body);
    } else {
      return this.factory.updateMethodDeclaration(
          asyncFn, asyncFn.decorators, modifiers, NO_ASTERISK, asyncFn.name, asyncFn.questionToken,
          asyncFn.typeParameters, asyncFn.parameters, asyncFn.type, body);
    }
  }

  /**
   * There were element accesses to `super` in an async function within this `super` container.
   *
   * Add proxies to the container and traverse the lexical scope of this `super` container again to
   * transform each of the `super` accesses.
   *
   * It is not possible to transform the `super` accesses as part of the larger AST traversal, since
   * is it only known whether the `super` "element" accesses must support "writes" as well as
   * "reads" after all nodes in the scope have been traversed.
   */
  private addSuperProxies(node: SuperContainer, superScope: AsyncSuperScope): SuperContainer {
    const superAccessesVisitor = new TransformSuperElementAccessesVisitor(this.context, superScope);
    const container = ts.visitEachChild(node, superAccessesVisitor.visitor, this.context);

    const bodyStatements: ts.Statement[] = [];
    if (superScope.hasPropertyAccess) {
      // If there are super property accesses (e.g. `super.foo`) then insert the `super` proxy
      bodyStatements.push(this.createSuperPropertyAccessProxy(superScope));
    }

    // Now add the original statements from the body, if there is one.
    if (container.body !== undefined) bodyStatements.push(...container.body.statements);
    const body = this.factory.createBlock(bodyStatements, true);

    if (superScope.hasElementAccess) {
      // If there are super element accesses (e.g. `super['foo']`) then insert the `super` element
      // access helper.
      this.addSuperElementAccessProxy(superScope, body);
    }

    if (ts.isGetAccessorDeclaration(container)) {
      return this.factory.updateGetAccessorDeclaration(
          container, container.decorators, container.modifiers, container.name,
          container.parameters, container.type, body);
    } else if (ts.isSetAccessorDeclaration(container)) {
      return this.factory.updateSetAccessorDeclaration(
          container, container.decorators, container.modifiers, container.name,
          container.parameters, body);
    } else if (ts.isConstructorDeclaration(container)) {
      return this.factory.updateConstructorDeclaration(
          container, container.decorators, container.modifiers, container.parameters, body);
    } else {
      return this.factory.updateMethodDeclaration(
          container, container.decorators, container.modifiers, NO_ASTERISK, container.name,
          container.questionToken, container.typeParameters, container.parameters, container.type,
          body);
    }
  }

  /**
   * Inject the `super` element access proxy function (`ɵsuperIndex()`) into the body of the async
   * function where the `super` accesses occur.
   *
   * Rather than generate this code via the AST factory API this function uses the `EmitHelper` API.
   */
  private addSuperElementAccessProxy(asyncScope: AsyncSuperScope, body: ts.Block) {
    if (asyncScope.hasElementWrite) {
      ts.addEmitHelper(body, {
        name: 'super-element-write-proxy',
        scoped: false,
        text: `
          const ${asyncScope.elementAccessProxy.text} = (function (geti, seti) {
            const cache = Object.create(null);
            return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });
          })(name => super[name], (name, value) => super[name] = value);`,
      });
    } else if (asyncScope.hasElementRead) {
      ts.addEmitHelper(body, {
        name: 'super-element-read-proxy',
        scoped: false,
        text: `
          const ${asyncScope.elementAccessProxy.text} = name => super[name];`,
      });
    }
  }

  /**
   * Create the `super` property access proxy variable (`ɵsuper`).
   *
   * This proxy is an object containing getters and setters for each `super` property that is
   * accessed. For example:
   *
   * ```
   * const ɵsuper = Object.create(null, {
   *     foo: { get: () => super.foo },
   *     bar: { get: () => super.bar, set: (v) => super.bar = v }
   * });
   * ```
   */
  private createSuperPropertyAccessProxy(asyncScope: AsyncSuperScope): ts.Statement {
    // Handle property access (e.g. `super.foo`).
    const props: ts.PropertyAssignment[] = [];
    for (const [prop, accesses] of asyncScope.superPropertyAccesses) {
      const accessors: ts.PropertyAssignment[] = [];
      // super.foo
      const superAccess =
          this.factory.createPropertyAccessExpression(this.factory.createSuper(), prop);
      if (accesses.read) {
        // () => super.foo
        const getterBody = this.factory.createArrowFunction(
            NO_MODIFIERS, NO_TYPE_PARAMETERS, [], NO_TYPE, NO_EQUALS_GREATER_THAN, superAccess);
        // get: () => super.foo
        const getter = this.factory.createPropertyAssignment('get', getterBody);
        accessors.push(getter);
      }
      if (accesses.write) {
        // super.foo = v
        const superAssignment =
            this.factory.createAssignment(superAccess, this.factory.createIdentifier('v'));
        // v => super.foo = v
        const setterBody = this.factory.createArrowFunction(
            NO_MODIFIERS, NO_TYPE_PARAMETERS,
            [this.factory.createParameterDeclaration(
                NO_DECORATORS, NO_MODIFIERS, NO_DOT_DOT_DOT, 'v')],
            NO_TYPE, NO_EQUALS_GREATER_THAN, superAssignment);
        // set: v => super.foo = v
        const setter = this.factory.createPropertyAssignment('set', setterBody);
        accessors.push(setter);
      }
      props.push(this.factory.createPropertyAssignment(
          prop, this.factory.createObjectLiteralExpression(accessors)));
    }

    // Object
    const objectIdentifier = this.factory.createIdentifier('Object');
    // Object.create
    const objectCreate = this.factory.createPropertyAccessExpression(objectIdentifier, 'create');
    // LITERAL : { foo: {get: ..., set: ...}, ... }
    const proxyObjectLiteral = this.factory.createObjectLiteralExpression(props, true);
    // Object.create(null, { LITERAL })
    const proxyObject = this.factory.createCallExpression(
        objectCreate, NO_TYPE_ARGUMENTS, [this.factory.createNull(), proxyObjectLiteral]);
    // ɵsuper = Object.create(null, { LITERAL })
    const proxyDeclaration = this.factory.createVariableDeclaration(
        asyncScope.propertyAccessProxy, NO_EXCLAMATION, NO_TYPE, proxyObject);
    // const ɵsuper = Object.create(null, { LITERAL })
    const proxyDeclarationList =
        this.factory.createVariableDeclarationList([proxyDeclaration], ts.NodeFlags.Const);
    // const ɵsuper = Object.create(null, { LITERAL });
    return this.factory.createVariableStatement(NO_MODIFIERS, proxyDeclarationList);
  }

  /**
   * Inject the `arguments` access proxy variable (`ɵarguments`) into the body of the function that
   * defines the `arguments` lexical scope.
   */
  private addArgumentsProxy(fn: ArgumentsContainer, argumentsScope: ArgumentsScope):
      ts.SignatureDeclaration {
    const proxy = this.createArgumentsProxy(argumentsScope);

    if (ts.isFunctionExpression(fn)) {
      const body = this.factory.updateBlock(fn.body, [proxy, ...fn.body.statements]);
      return this.factory.updateFunctionExpression(
          fn, fn.modifiers, fn.asteriskToken, fn.name, fn.typeParameters, fn.parameters, fn.type,
          body);
    }

    if (ts.isFunctionDeclaration(fn) && fn.body !== undefined) {
      const body = this.factory.updateBlock(fn.body, [proxy, ...fn.body.statements]);
      return this.factory.updateFunctionDeclaration(
          fn, fn.decorators, fn.modifiers, fn.asteriskToken, fn.name, fn.typeParameters,
          fn.parameters, fn.type, body);
    }

    if (ts.isMethodDeclaration(fn) && fn.body !== undefined) {
      const body = this.factory.updateBlock(fn.body, [proxy, ...fn.body.statements]);
      return this.factory.updateMethodDeclaration(
          fn, fn.decorators, fn.modifiers, fn.asteriskToken, fn.name, fn.questionToken,
          fn.typeParameters, fn.parameters, fn.type, body);
    }

    return fn;
  }

  /**
   * Create the `arguments` access proxy variable.
   *
   * For example:
   *
   * ```
   * const ɵarguments = arguments;
   * ```
   */
  private createArgumentsProxy(asyncScope: ArgumentsScope): ts.Statement {
    // ɵarguments = arguments
    const proxyDeclaration =
        this.factory.createVariableDeclaration(
            asyncScope.argumentsProxy, NO_EXCLAMATION, NO_TYPE,
            this.factory.createIdentifier('arguments')) as ts.VariableDeclaration &
        {name: ts.Identifier};
    // const ɵarguments = arguments
    const proxyDeclarationList =
        this.factory.createVariableDeclarationList([proxyDeclaration], ts.NodeFlags.Const);
    // const ɵarguments = arguments;
    return this.factory.createVariableStatement(NO_MODIFIERS, proxyDeclarationList);
  }

  /**
   * Create a call to the `Zone.__awaiter()` function, which passes in the new generator function
   * as one of its parameters.
   */
  private createAwaiterCall(generatorFn: ts.Expression, args: ts.Expression[]): ts.CallExpression {
    const globalZone = this.factory.createIdentifier('Zone');
    const awaiterFn = this.factory.createPropertyAccessExpression(globalZone, '__awaiter');
    const awaiterArgs: readonly ts.Expression[] = [
      this.factory.createThis(),
      this.factory.createArrayLiteralExpression(args),
      generatorFn,
    ];
    return this.factory.createCallExpression(awaiterFn, NO_TYPE, awaiterArgs);
  }

  /**
   * Convert the given `params` to a list of expressions that can be passed as arguments.
   *
   * This is necessary because if we have `foo(...[{x: a}])` which has a complex parameter,
   * we need to pass an equivalent expression through to the generator when calling it via
   * the awaiter helper function, `Zone.__awaiter(this, [...[{x: a}]], generatorFn)`.
   */
  private convertParamsToArgs(params: readonly ts.ParameterDeclaration[]): ts.Expression[] {
    const visitBinding: (node: ts.Node) => ts.Expression = node => {
      if (ts.isIdentifier(node)) {
        return node;
      }
      if (ts.isArrayBindingPattern(node)) {
        const args = node.elements.map(element => {
          if (ts.isOmittedExpression(element)) {
            return element;
          }
          const arg = visitBinding(element.name);
          return element.dotDotDotToken !== undefined ? this.factory.createSpreadElement(arg) : arg;
        });
        return this.factory.createArrayLiteralExpression(args);
      }
      if (ts.isObjectBindingPattern(node)) {
        const args = node.elements.map(element => {
          const name = visitBinding(element.name);
          if (element.dotDotDotToken !== undefined) {
            return this.factory.createSpreadAssignment(name);
          }
          return (element.propertyName === undefined) ?
              this.factory.createShorthandPropertyAssignment(name as ts.Identifier) :
              this.factory.createPropertyAssignment(element.propertyName, name);
        });
        return this.factory.createObjectLiteralExpression(args);
      }
      throw new Error('Unknown parameter binding expression');
    };
    return params.map(param => {
      const arg = visitBinding(param.name);
      return param.dotDotDotToken !== undefined ? this.factory.createSpreadElement(arg) : arg;
    });
  }

  /**
   * Create the generator function that will replace an async function expression.
   *
   * Normally, the generator function will be hoisted to the containing lexical scope and the name
   * of the function will be returned so that it can be referenced in the `Zone.__awaiter()` call.
   *
   * If the lexical scope contains access to `super` that need to be transformed, then instead of
   * hoisting the generator function is returned so that it can be injected inline into the
   * `Zone.__awaiter()` call.
   */
  private createGeneratorFunction(asyncFn: AsyncFunction, asyncScope: AsyncSuperScope|null):
      ts.Expression {
    const generatorName = this.computeGeneratorName(asyncFn);
    if (asyncScope === null || !asyncScope.hasSuperAccess) {
      // No super accesses in this async function so we can hoist the generator outside the body.
      const generatorFn = this.createGeneratorFunctionDeclaration(asyncFn, generatorName);
      this.context.hoistFunctionDeclaration(generatorFn);
      return generatorName;
    } else {
      return this.createGeneratorFunctionExpression(asyncFn, generatorName);
    }
  }

  /**
   * Create the actual generator function declaration that will replace an async function
   * declaration. This will either be hoisted or added inline into the `Zone.__awaiter()` call.
   */
  private createGeneratorFunctionDeclaration(asyncFn: AsyncFunction, generatorName: ts.Identifier):
      ts.FunctionDeclaration {
    const star = this.factory.createToken(ts.SyntaxKind.AsteriskToken);
    const generatorBody = this.createGeneratorBody(asyncFn);
    const generatorFn = this.factory.createFunctionDeclaration(
        NO_DECORATORS, NO_MODIFIERS, star, generatorName, NO_TYPE_PARAMETERS, asyncFn.parameters,
        NO_TYPE, generatorBody);
    return generatorFn;
  }

  /**
   * Create the generator function expression that will replace the async function.
   */
  private createGeneratorFunctionExpression(asyncFn: AsyncFunction, generatorName: ts.Identifier):
      ts.FunctionExpression {
    const star = this.factory.createToken(ts.SyntaxKind.AsteriskToken);
    const generatorBody = this.createGeneratorBody(asyncFn);

    const generatorFn = this.factory.createFunctionExpression(
        NO_MODIFIERS, star, generatorName, NO_TYPE_PARAMETERS, asyncFn.parameters, NO_TYPE,
        generatorBody);
    return generatorFn;
  }

  /**
   * Compute a unique name for the new generator function.
   *
   * The name is computed from the name of the `async` function if this is available.
   */
  private computeGeneratorName(asyncFn: AsyncFunction): ts.Identifier {
    // We need to use the original node because if this asyncFn has been synthesized it might not
    // have a `parent` property.
    const node = ts.getOriginalNode(asyncFn, isAsyncFunction);
    if (node.name !== undefined && ts.isIdentifier(node.name)) {
      return uniqueName(this.factory, node.name.text + '_generator');
    } else if (isNamedFunction(node)) {
      return uniqueName(this.factory, node.parent.name.text + '_generator');
    } else {
      return uniqueName(this.factory, 'anonymous_generator');
    }
  }

  /**
   * Create a body block to be used in the generator function that will replace an async function.
   *
   * In most cases we can just take the body of the async function, but arrow functions need
   * special consideration, since they may have an expression rather than a function body block.
   *
   * See `convertConciseBodyToFunctionBody()` for an example.
   */
  private createGeneratorBody(asyncFn: AsyncFunction): ts.FunctionBody {
    const generatorBody = ts.isArrowFunction(asyncFn) ?
        this.convertConciseBodyToFunctionBody(asyncFn.body) :
        hasFunctionBody(asyncFn) ? asyncFn.body : null;
    if (generatorBody === null) {
      throw new Error('Unexpected lack of body for async function.');
    }
    return generatorBody;
  }

  /**
   * Convert the "body" of an arrow function into a full function body that can be used in a
   * generator function.
   *
   * Generator functions cannot be arrow functions, and so cannot have a simple expression for
   * their body.
   *
   * For example:
   *
   * ```ts
   * const foo => 100;
   * ```
   *
   * would be converted to:
   *
   * ```ts
   * function* foo_generator() { return 100; }
   * ```
   */
  private convertConciseBodyToFunctionBody(body: ts.ConciseBody): ts.FunctionBody {
    return ts.isBlock(body) ? body :
                              this.factory.createBlock([this.factory.createReturnStatement(body)]);
  }
}
