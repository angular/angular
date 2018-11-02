/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BindingType, BoundTarget, ImplicitReceiver, PropertyRead, TmplAstBoundText, TmplAstElement, TmplAstNode, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import * as ts from 'typescript';

import {Reference} from '../../metadata';
import {ImportManager, translateExpression} from '../../translator';

import {TypeCheckBlockMetadata, TypeCheckableDirectiveMeta} from './api';
import {astToTypescript} from './expression';


/**
 * Given a `ts.ClassDeclaration` for a component, and metadata regarding that component, compose a
 * "type check block" function.
 *
 * When passed through TypeScript's TypeChecker, type errors that arise within the type check block
 * function indicate issues in the template itself.
 *
 * @param node the TypeScript node for the component class.
 * @param meta metadata about the component's template and the function being generated.
 * @param importManager an `ImportManager` for the file into which the TCB will be written.
 */
export function generateTypeCheckBlock(
    node: ts.ClassDeclaration, meta: TypeCheckBlockMetadata,
    importManager: ImportManager): ts.FunctionDeclaration {
  const tcb = new Context(meta.boundTarget, node.getSourceFile(), importManager);
  const scope = new Scope(tcb);
  tcbProcessNodes(meta.boundTarget.target.template !, tcb, scope);

  const body = ts.createBlock([ts.createIf(ts.createTrue(), scope.getBlock())]);

  return ts.createFunctionDeclaration(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      /* asteriskToken */ undefined,
      /* name */ meta.fnName,
      /* typeParameters */ node.typeParameters,
      /* parameters */[tcbCtxParam(node)],
      /* type */ undefined,
      /* body */ body);
}

/**
 * Overall generation context for the type check block.
 *
 * `Context` handles operations during code generation which are global with respect to the whole
 * block. It's responsible for variable name allocation and management of any imports needed. It
 * also contains the template metadata itself.
 */
class Context {
  private nextId = 1;

  constructor(
      readonly boundTarget: BoundTarget<TypeCheckableDirectiveMeta>,
      private sourceFile: ts.SourceFile, private importManager: ImportManager) {}

  /**
   * Allocate a new variable name for use within the `Context`.
   *
   * Currently this uses a monotonically increasing counter, but in the future the variable name
   * might change depending on the type of data being stored.
   */
  allocateId(): ts.Identifier { return ts.createIdentifier(`_t${this.nextId++}`); }

  /**
   * Write a `ts.Expression` that references the given node.
   *
   * This may involve importing the node into the file if it's not declared there already.
   */
  reference(ref: Reference<ts.Node>): ts.Expression {
    const ngExpr = ref.toExpression(this.sourceFile);
    if (ngExpr === null) {
      throw new Error(`Unreachable reference: ${ref.node}`);
    }

    // Use `translateExpression` to convert the `Expression` into a `ts.Expression`.
    return translateExpression(ngExpr, this.importManager);
  }
}

/**
 * Local scope within the type check block for a particular template.
 *
 * The top-level template and each nested `<ng-template>` have their own `Scope`, which exist in a
 * hierarchy. The structure of this hierarchy mirrors the syntactic scopes in the generated type
 * check block, where each nested template is encased in an `if` structure.
 *
 * As a template is processed in a given `Scope`, statements are added via `addStatement()`. When
 * this processing is complete, the `Scope` can be turned into a `ts.Block` via `getBlock()`.
 */
class Scope {
  /**
   * Map of nodes to information about that node within the TCB.
   *
   * For example, this stores the `ts.Identifier` within the TCB for an element or <ng-template>.
   */
  private elementData = new Map<TmplAstElement|TmplAstTemplate, TcbNodeData>();

  /**
   * Map of immediately nested <ng-template>s (within this `Scope`) to the `ts.Identifier` of their
   * rendering contexts.
   */
  private templateCtx = new Map<TmplAstTemplate, ts.Identifier>();

  /**
   * Map of variables declared on the template that created this `Scope` to their `ts.Identifier`s
   * within the TCB.
   */
  private varMap = new Map<TmplAstVariable, ts.Identifier>();

  /**
   * Statements for this template.
   */
  private statements: ts.Statement[] = [];

  constructor(private tcb: Context, private parent: Scope|null = null) {}

  /**
   * Get the identifier within the TCB for a given `TmplAstElement`.
   */
  getElementId(el: TmplAstElement): ts.Identifier|null {
    const data = this.getElementData(el, false);
    if (data !== null && data.htmlNode !== null) {
      return data.htmlNode;
    }
    return this.parent !== null ? this.parent.getElementId(el) : null;
  }

  /**
   * Get the identifier of a directive instance on a given template node.
   */
  getDirectiveId(el: TmplAstElement|TmplAstTemplate, dir: TypeCheckableDirectiveMeta): ts.Identifier
      |null {
    const data = this.getElementData(el, false);
    if (data !== null && data.directives !== null && data.directives.has(dir)) {
      return data.directives.get(dir) !;
    }
    return this.parent !== null ? this.parent.getDirectiveId(el, dir) : null;
  }

  /**
   * Get the identifier of a template's rendering context.
   */
  getTemplateCtx(tmpl: TmplAstTemplate): ts.Identifier|null {
    return this.templateCtx.get(tmpl) ||
        (this.parent !== null ? this.parent.getTemplateCtx(tmpl) : null);
  }

  /**
   * Get the identifier of a template variable.
   */
  getVariableId(v: TmplAstVariable): ts.Identifier|null {
    return this.varMap.get(v) || (this.parent !== null ? this.parent.getVariableId(v) : null);
  }

  /**
   * Allocate an identifier for the given template element.
   */
  allocateElementId(el: TmplAstElement): ts.Identifier {
    const data = this.getElementData(el, true);
    if (data.htmlNode === null) {
      data.htmlNode = this.tcb.allocateId();
    }
    return data.htmlNode;
  }

  /**
   * Allocate an identifier for the given template variable.
   */
  allocateVariableId(v: TmplAstVariable): ts.Identifier {
    if (!this.varMap.has(v)) {
      this.varMap.set(v, this.tcb.allocateId());
    }
    return this.varMap.get(v) !;
  }

  /**
   * Allocate an identifier for an instance of the given directive on the given template node.
   */
  allocateDirectiveId(el: TmplAstElement|TmplAstTemplate, dir: TypeCheckableDirectiveMeta):
      ts.Identifier {
    // Look up the data for this template node.
    const data = this.getElementData(el, true);

    // Lazily populate the directives map, if it exists.
    if (data.directives === null) {
      data.directives = new Map<TypeCheckableDirectiveMeta, ts.Identifier>();
    }
    if (!data.directives.has(dir)) {
      data.directives.set(dir, this.tcb.allocateId());
    }
    return data.directives.get(dir) !;
  }

  /**
   * Allocate an identifier for the rendering context of a given template.
   */
  allocateTemplateCtx(tmpl: TmplAstTemplate): ts.Identifier {
    if (!this.templateCtx.has(tmpl)) {
      this.templateCtx.set(tmpl, this.tcb.allocateId());
    }
    return this.templateCtx.get(tmpl) !;
  }

  /**
   * Add a statement to this scope.
   */
  addStatement(stmt: ts.Statement): void { this.statements.push(stmt); }

  /**
   * Get a `ts.Block` containing the statements in this scope.
   */
  getBlock(): ts.Block { return ts.createBlock(this.statements); }

  /**
   * Internal helper to get the data associated with a particular element.
   *
   * This can either return `null` if the data is not present (when the `alloc` flag is set to
   * `false`), or it can initialize the data for the element (when `alloc` is `true`).
   */
  private getElementData(el: TmplAstElement|TmplAstTemplate, alloc: true): TcbNodeData;
  private getElementData(el: TmplAstElement|TmplAstTemplate, alloc: false): TcbNodeData|null;
  private getElementData(el: TmplAstElement|TmplAstTemplate, alloc: boolean): TcbNodeData|null {
    if (alloc && !this.elementData.has(el)) {
      this.elementData.set(el, {htmlNode: null, directives: null});
    }
    return this.elementData.get(el) || null;
  }
}

/**
 * Data stored for a template node in a TCB.
 */
interface TcbNodeData {
  /**
   * The identifier of the node element instance, if any.
   */
  htmlNode: ts.Identifier|null;
  directives: Map<TypeCheckableDirectiveMeta, ts.Identifier>|null;
}

/**
 * Create the `ctx` parameter to the top-level TCB function.
 *
 * This is a parameter with a type equivalent to the component type, with all generic type
 * parameters listed (without their generic bounds).
 */
function tcbCtxParam(node: ts.ClassDeclaration): ts.ParameterDeclaration {
  let typeArguments: ts.TypeNode[]|undefined = undefined;
  // Check if the component is generic, and pass generic type parameters if so.
  if (node.typeParameters !== undefined) {
    typeArguments =
        node.typeParameters.map(param => ts.createTypeReferenceNode(param.name, undefined));
  }
  const type = ts.createTypeReferenceNode(node.name !, typeArguments);
  return ts.createParameter(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      /* dotDotDotToken */ undefined,
      /* name */ 'ctx',
      /* questionToken */ undefined,
      /* type */ type,
      /* initializer */ undefined);
}

/**
 * Process an array of template nodes and generate type checking code for them within the given
 * `Scope`.
 *
 * @param nodes template node array over which to iterate.
 * @param tcb context of the overall type check block.
 * @param scope
 */
function tcbProcessNodes(nodes: TmplAstNode[], tcb: Context, scope: Scope): void {
  nodes.forEach(node => {
    // Process elements, templates, and bindings.
    if (node instanceof TmplAstElement) {
      tcbProcessElement(node, tcb, scope);
    } else if (node instanceof TmplAstTemplate) {
      tcbProcessTemplateDeclaration(node, tcb, scope);
    } else if (node instanceof TmplAstBoundText) {
      const expr = tcbExpression(node.value, tcb, scope);
      scope.addStatement(ts.createStatement(expr));
    }
  });
}

/**
 * Process an element, generating type checking code for it, its directives, and its children.
 */
function tcbProcessElement(el: TmplAstElement, tcb: Context, scope: Scope): ts.Identifier {
  let id = scope.getElementId(el);
  if (id !== null) {
    // This element has been processed before. No need to run through it again.
    return id;
  }
  id = scope.allocateElementId(el);

  // Add the declaration of the element using document.createElement.
  scope.addStatement(tsCreateVariable(id, tsCreateElement(el.name)));


  // Construct a set of all the input bindings. Anything matched by directives will be removed from
  // this set. The rest are bindings being made on the element itself.
  const inputs = new Set(
      el.inputs.filter(input => input.type === BindingType.Property).map(input => input.name));

  // Process directives of the node.
  tcbProcessDirectives(el, inputs, tcb, scope);

  // At this point, `inputs` now contains only those bindings not matched by any directive. These
  // bindings go to the element itself.
  inputs.forEach(name => {
    const binding = el.inputs.find(input => input.name === name) !;
    const expr = tcbExpression(binding.value, tcb, scope);

    const prop = ts.createPropertyAccess(id !, name);
    const assign = ts.createBinary(prop, ts.SyntaxKind.EqualsToken, expr);
    scope.addStatement(ts.createStatement(assign));
  });

  // Recurse into children.
  tcbProcessNodes(el.children, tcb, scope);

  return id;
}

/**
 * Process all the directives associated with a given template node.
 */
function tcbProcessDirectives(
    el: TmplAstElement | TmplAstTemplate, unclaimed: Set<string>, tcb: Context,
    scope: Scope): void {
  const directives = tcb.boundTarget.getDirectivesOfNode(el);
  if (directives === null) {
    // No directives, nothing to do.
    return;
  }
  directives.forEach(dir => tcbProcessDirective(el, dir, unclaimed, tcb, scope));
}

/**
 * Process a directive, generating type checking code for it.
 */
function tcbProcessDirective(
    el: TmplAstElement | TmplAstTemplate, dir: TypeCheckableDirectiveMeta, unclaimed: Set<string>,
    tcb: Context, scope: Scope): ts.Identifier {
  let id = scope.getDirectiveId(el, dir);
  if (id !== null) {
    // This directive has been processed before. No need to run through it again.
    return id;
  }
  id = scope.allocateDirectiveId(el, dir);

  const bindings = tcbGetInputBindingExpressions(el, dir, tcb, scope);


  // Call the type constructor of the directive to infer a type, and assign the directive instance.
  scope.addStatement(tsCreateVariable(id, tcbCallTypeCtor(el, dir, tcb, scope, bindings)));

  tcbProcessBindings(id, bindings, unclaimed, tcb, scope);

  return id;
}

function tcbProcessBindings(
    recv: ts.Expression, bindings: TcbBinding[], unclaimed: Set<string>, tcb: Context,
    scope: Scope): void {
  // Iterate through all the bindings this directive is consuming.
  bindings.forEach(binding => {
    // Generate an assignment statement for this binding.
    const prop = ts.createPropertyAccess(recv, binding.field);
    const assign = ts.createBinary(prop, ts.SyntaxKind.EqualsToken, binding.expression);
    scope.addStatement(ts.createStatement(assign));

    // Remove the binding from the set of unclaimed inputs, as this directive has 'claimed' it.
    unclaimed.delete(binding.property);
  });
}

/**
 * Process a nested <ng-template>, generating type-checking code for it and its children.
 *
 * The nested <ng-template> is represented with an `if` structure, which creates a new syntactical
 * scope for the type checking code for the template. If the <ng-template> has any directives, they
 * can influence type inference within the `if` block through defined guard functions.
 */
function tcbProcessTemplateDeclaration(tmpl: TmplAstTemplate, tcb: Context, scope: Scope) {
  // Create a new Scope to represent bindings captured in the template.
  const tmplScope = new Scope(tcb, scope);

  // Allocate a template ctx variable and declare it with an 'any' type.
  const ctx = tmplScope.allocateTemplateCtx(tmpl);
  const type = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  scope.addStatement(tsDeclareVariable(ctx, type));

  // Process directives on the template.
  tcbProcessDirectives(tmpl, new Set(), tcb, scope);

  // Process the template itself (inside the inner Scope).
  tcbProcessNodes(tmpl.children, tcb, tmplScope);

  // An `if` will be constructed, within which the template's children will be type checked. The
  // `if` is used for two reasons: it creates a new syntactic scope, isolating variables declared in
  // the template's TCB from the outer context, and it allows any directives on the templates to
  // perform type narrowing of either expressions or the template's context.

  // The guard is the `if` block's condition. It's usually set to `true` but directives that exist
  // on the template can trigger extra guard expressions that serve to narrow types within the
  // `if`. `guard` is calculated by starting with `true` and adding other conditions as needed.
  // Collect these into `guards` by processing the directives.
  const directiveGuards: ts.Expression[] = [];

  const directives = tcb.boundTarget.getDirectivesOfNode(tmpl);
  if (directives !== null) {
    directives.forEach(dir => {
      const dirInstId = scope.getDirectiveId(tmpl, dir) !;
      const dirId = tcb.reference(dir.ref);

      // There are two kinds of guards. Template guards (ngTemplateGuards) allow type narrowing of
      // the expression passed to an @Input of the directive. Scan the directive to see if it has
      // any template guards, and generate them if needed.
      dir.ngTemplateGuards.forEach(inputName => {
        // For each template guard function on the directive, look for a binding to that input.
        const boundInput = tmpl.inputs.find(i => i.name === inputName);
        if (boundInput !== undefined) {
          // If there is such a binding, generate an expression for it.
          const expr = tcbExpression(boundInput.value, tcb, scope);
          // Call the guard function on the directive with the directive instance and that
          // expression.
          const guardInvoke = tsCallMethod(dirId, `ngTemplateGuard_${inputName}`, [
            dirInstId,
            expr,
          ]);
          directiveGuards.push(guardInvoke);
        }
      });

      // The second kind of guard is a template context guard. This guard narrows the template
      // rendering context variable `ctx`.
      if (dir.hasNgTemplateContextGuard) {
        const guardInvoke = tsCallMethod(dirId, 'ngTemplateContextGuard', [dirInstId, ctx]);
        directiveGuards.push(guardInvoke);
      }
    });
  }

  // By default the guard is simply `true`.
  let guard: ts.Expression = ts.createTrue();

  // If there are any guards from directives, use them instead.
  if (directiveGuards.length > 0) {
    // Pop the first value and use it as the initializer to reduce(). This way, a single guard
    // will be used on its own, but two or more will be combined into binary expressions.
    guard = directiveGuards.reduce(
        (expr, dirGuard) => ts.createBinary(expr, ts.SyntaxKind.AmpersandAmpersandToken, dirGuard),
        directiveGuards.pop() !);
  }

  // Construct the `if` block for the template with the generated guard expression.
  const tmplIf = ts.createIf(
      /* expression */ guard,
      /* thenStatement */ tmplScope.getBlock());
  scope.addStatement(tmplIf);
}

/**
 * Process an `AST` expression and convert it into a `ts.Expression`, generating references to the
 * correct identifiers in the current scope.
 */
function tcbExpression(ast: AST, tcb: Context, scope: Scope): ts.Expression {
  // `astToTypescript` actually does the conversion. A special resolver `tcbResolve` is passed which
  // interprets specific expression nodes that interact with the `ImplicitReceiver`. These nodes
  // actually refer to identifiers within the current scope.
  return astToTypescript(ast, (ast) => tcbResolve(ast, tcb, scope));
}

/**
 * Call the type constructor of a directive instance on a given template node, inferring a type for
 * the directive instance from any bound inputs.
 */
function tcbCallTypeCtor(
    el: TmplAstElement | TmplAstTemplate, dir: TypeCheckableDirectiveMeta, tcb: Context,
    scope: Scope, bindings: TcbBinding[]): ts.Expression {
  const dirClass = tcb.reference(dir.ref);

  // Construct an array of `ts.PropertyAssignment`s for each input of the directive that has a
  // matching binding.
  const members = bindings.map(b => ts.createPropertyAssignment(b.field, b.expression));

  // Call the `ngTypeCtor` method on the directive class, with an object literal argument created
  // from the matched inputs.
  return tsCallMethod(
      /* receiver */ dirClass,
      /* methodName */ 'ngTypeCtor',
      /* args */[ts.createObjectLiteral(members)]);
}

interface TcbBinding {
  field: string;
  property: string;
  expression: ts.Expression;
}

function tcbGetInputBindingExpressions(
    el: TmplAstElement | TmplAstTemplate, dir: TypeCheckableDirectiveMeta, tcb: Context,
    scope: Scope): TcbBinding[] {
  const bindings: TcbBinding[] = [];
  // `dir.inputs` is an object map of field names on the directive class to property names.
  // This is backwards from what's needed to match bindings - a map of properties to field names
  // is desired. Invert `dir.inputs` into `propMatch` to create this map.
  const propMatch = new Map<string, string>();
  const inputs = dir.inputs;
  Object.keys(inputs).forEach(key => {
    Array.isArray(inputs[key]) ? propMatch.set(inputs[key][0], key) :
                                 propMatch.set(inputs[key] as string, key);
  });

  // Add a binding expression to the map for each input of the directive that has a
  // matching binding.
  el.inputs.filter(input => propMatch.has(input.name)).forEach(input => {
    // Produce an expression representing the value of the binding.
    const expr = tcbExpression(input.value, tcb, scope);

    // Call the callback.
    bindings.push({
      property: input.name,
      field: propMatch.get(input.name) !,
      expression: expr,
    });
  });
  return bindings;
}

/**
 * Create an expression which instantiates an element by its HTML tagName.
 *
 * Thanks to narrowing of `document.createElement()`, this expression will have its type inferred
 * based on the tag name, including for custom elements that have appropriate .d.ts definitions.
 */
function tsCreateElement(tagName: string): ts.Expression {
  const createElement = ts.createPropertyAccess(
      /* expression */ ts.createIdentifier('document'), 'createElement');
  return ts.createCall(
      /* expression */ createElement,
      /* typeArguments */ undefined,
      /* argumentsArray */[ts.createLiteral(tagName)]);
}

/**
 * Create a `ts.VariableStatement` which declares a variable without explicit initialization.
 *
 * The initializer `null!` is used to bypass strict variable initialization checks.
 *
 * Unlike with `tsCreateVariable`, the type of the variable is explicitly specified.
 */
function tsDeclareVariable(id: ts.Identifier, type: ts.TypeNode): ts.VariableStatement {
  const decl = ts.createVariableDeclaration(
      /* name */ id,
      /* type */ type,
      /* initializer */ ts.createNonNullExpression(ts.createNull()));
  return ts.createVariableStatement(
      /* modifiers */ undefined,
      /* declarationList */[decl]);
}

/**
 * Create a `ts.VariableStatement` that initializes a variable with a given expression.
 *
 * Unlike with `tsDeclareVariable`, the type of the variable is inferred from the initializer
 * expression.
 */
function tsCreateVariable(id: ts.Identifier, initializer: ts.Expression): ts.VariableStatement {
  const decl = ts.createVariableDeclaration(
      /* name */ id,
      /* type */ undefined,
      /* initializer */ initializer);
  return ts.createVariableStatement(
      /* modifiers */ undefined,
      /* declarationList */[decl]);
}

/**
 * Construct a `ts.CallExpression` that calls a method on a receiver.
 */
function tsCallMethod(
    receiver: ts.Expression, methodName: string, args: ts.Expression[] = []): ts.CallExpression {
  const methodAccess = ts.createPropertyAccess(receiver, methodName);
  return ts.createCall(
      /* expression */ methodAccess,
      /* typeArguments */ undefined,
      /* argumentsArray */ args);
}

/**
 * Resolve an `AST` expression within the given scope.
 *
 * Some `AST` expressions refer to top-level concepts (references, variables, the component
 * context). This method assists in resolving those.
 */
function tcbResolve(ast: AST, tcb: Context, scope: Scope): ts.Expression|null {
  // Short circuit for AST types that won't have mappings.
  if (!(ast instanceof ImplicitReceiver || ast instanceof PropertyRead)) {
    return null;
  }

  if (ast instanceof PropertyRead && ast.receiver instanceof ImplicitReceiver) {
    // Check whether the template metadata has bound a target for this expression. If so, then
    // resolve that target. If not, then the expression is referencing the top-level component
    // context.
    const binding = tcb.boundTarget.getExpressionTarget(ast);
    if (binding !== null) {
      // This expression has a binding to some variable or reference in the template. Resolve it.
      if (binding instanceof TmplAstVariable) {
        return tcbResolveVariable(binding, tcb, scope);
      } else {
        throw new Error(`Not handled: ${binding}`);
      }
    } else {
      // This is a PropertyRead(ImplicitReceiver) and probably refers to a property access on the
      // component context. Let it fall through resolution here so it will be caught when the
      // ImplicitReceiver is resolved in the branch below.
      return null;
    }
  } else if (ast instanceof ImplicitReceiver) {
    // AST instances representing variables and references look very similar to property reads from
    // the component context: both have the shape PropertyRead(ImplicitReceiver, 'propertyName').
    // `tcbExpression` will first try to `tcbResolve` the outer PropertyRead. If this works, it's
    // because the `BoundTarget` found an expression target for the whole expression, and therefore
    // `tcbExpression` will never attempt to `tcbResolve` the ImplicitReceiver of that PropertyRead.
    //
    // Therefore if `tcbResolve` is called on an `ImplicitReceiver`, it's because no outer
    // PropertyRead resolved to a variable or reference, and therefore this is a property read on
    // the component context itself.
    return ts.createIdentifier('ctx');
  } else {
    // This AST isn't special after all.
    return null;
  }
}

/**
 * Resolve a variable to an identifier that represents its value.
 */
function tcbResolveVariable(binding: TmplAstVariable, tcb: Context, scope: Scope): ts.Identifier {
  // Look to see whether the variable was already initialized. If so, just reuse it.
  let id = scope.getVariableId(binding);
  if (id !== null) {
    return id;
  }

  // Look for the template which declares this variable.
  const tmpl = tcb.boundTarget.getTemplateOfSymbol(binding);
  if (tmpl === null) {
    throw new Error(`Expected TmplAstVariable to be mapped to a TmplAstTemplate`);
  }
  // Look for a context variable for the template. This should've been declared before anything
  // that could reference the template's variables.
  const ctx = scope.getTemplateCtx(tmpl);
  if (ctx === null) {
    throw new Error('Expected template context to exist.');
  }

  // Allocate an identifier for the TmplAstVariable, and initialize it to a read of the variable on
  // the template context.
  id = scope.allocateVariableId(binding);
  const initializer = ts.createPropertyAccess(
      /* expression */ ctx,
      /* name */ binding.value);

  // Declare the variable, and return its identifier.
  scope.addStatement(tsCreateVariable(id, initializer));
  return id;
}
