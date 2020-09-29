/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BindingPipe, ImplicitReceiver, MethodCall, PropertyRead, PropertyWrite, RecursiveAstVisitor, SafeMethodCall, SafePropertyRead} from '../../expression_parser/ast';
import {SelectorMatcher} from '../../selector';
import {BoundAttribute, BoundEvent, BoundText, Content, Element, Icu, Node, Reference, Template, Text, TextAttribute, Variable, Visitor} from '../r3_ast';

import {BoundTarget, DirectiveMeta, Target, TargetBinder} from './t2_api';
import {createCssSelector} from './template';
import {getAttrsForDirectiveMatching} from './util';


/**
 * Processes `Target`s with a given set of directives and performs a binding operation, which
 * returns an object similar to TypeScript's `ts.TypeChecker` that contains knowledge about the
 * target.
 */
export class R3TargetBinder<DirectiveT extends DirectiveMeta> implements TargetBinder<DirectiveT> {
  constructor(private directiveMatcher: SelectorMatcher<DirectiveT>) {}

  /**
   * Perform a binding operation on the given `Target` and return a `BoundTarget` which contains
   * metadata about the types referenced in the template.
   */
  bind(target: Target): BoundTarget<DirectiveT> {
    if (!target.template) {
      // TODO(alxhub): handle targets which contain things like HostBindings, etc.
      throw new Error('Binding without a template not yet supported');
    }

    // First, parse the template into a `Scope` structure. This operation captures the syntactic
    // scopes in the template and makes them available for later use.
    const scope = Scope.apply(target.template);


    // Use the `Scope` to extract the entities present at every level of the template.
    const templateEntities = extractTemplateEntities(scope);

    // Next, perform directive matching on the template using the `DirectiveBinder`. This returns:
    //   - directives: Map of nodes (elements & ng-templates) to the directives on them.
    //   - bindings: Map of inputs, outputs, and attributes to the directive/element that claims
    //     them. TODO(alxhub): handle multiple directives claiming an input/output/etc.
    //   - references: Map of #references to their targets.
    const {directives, bindings, references} =
        DirectiveBinder.apply(target.template, this.directiveMatcher);
    // Finally, run the TemplateBinder to bind references, variables, and other entities within the
    // template. This extracts all the metadata that doesn't depend on directive matching.
    const {expressions, symbols, nestingLevel, usedPipes} =
        TemplateBinder.apply(target.template, scope);
    return new R3BoundTarget(
        target, directives, bindings, references, expressions, symbols, nestingLevel,
        templateEntities, usedPipes);
  }
}

/**
 * Represents a binding scope within a template.
 *
 * Any variables, references, or other named entities declared within the template will
 * be captured and available by name in `namedEntities`. Additionally, child templates will
 * be analyzed and have their child `Scope`s available in `childScopes`.
 */
class Scope implements Visitor {
  /**
   * Named members of the `Scope`, such as `Reference`s or `Variable`s.
   */
  readonly namedEntities = new Map<string, Reference|Variable>();

  /**
   * Child `Scope`s for immediately nested `Template`s.
   */
  readonly childScopes = new Map<Template, Scope>();

  private constructor(readonly parentScope: Scope|null, readonly template: Template|null) {}

  static newRootScope(): Scope {
    return new Scope(null, null);
  }

  /**
   * Process a template (either as a `Template` sub-template with variables, or a plain array of
   * template `Node`s) and construct its `Scope`.
   */
  static apply(template: Node[]): Scope {
    const scope = Scope.newRootScope();
    scope.ingest(template);
    return scope;
  }

  /**
   * Internal method to process the template and populate the `Scope`.
   */
  private ingest(template: Template|Node[]): void {
    if (template instanceof Template) {
      // Variables on an <ng-template> are defined in the inner scope.
      template.variables.forEach(node => this.visitVariable(node));

      // Process the nodes of the template.
      template.children.forEach(node => node.visit(this));
    } else {
      // No overarching `Template` instance, so process the nodes directly.
      template.forEach(node => node.visit(this));
    }
  }

  visitElement(element: Element) {
    // `Element`s in the template may have `Reference`s which are captured in the scope.
    element.references.forEach(node => this.visitReference(node));

    // Recurse into the `Element`'s children.
    element.children.forEach(node => node.visit(this));
  }

  visitTemplate(template: Template) {
    // References on a <ng-template> are defined in the outer scope, so capture them before
    // processing the template's child scope.
    template.references.forEach(node => this.visitReference(node));

    // Next, create an inner scope and process the template within it.
    const scope = new Scope(this, template);
    scope.ingest(template);
    this.childScopes.set(template, scope);
  }

  visitVariable(variable: Variable) {
    // Declare the variable if it's not already.
    this.maybeDeclare(variable);
  }

  visitReference(reference: Reference) {
    // Declare the variable if it's not already.
    this.maybeDeclare(reference);
  }

  // Unused visitors.
  visitContent(content: Content) {}
  visitBoundAttribute(attr: BoundAttribute) {}
  visitBoundEvent(event: BoundEvent) {}
  visitBoundText(text: BoundText) {}
  visitText(text: Text) {}
  visitTextAttribute(attr: TextAttribute) {}
  visitIcu(icu: Icu) {}

  private maybeDeclare(thing: Reference|Variable) {
    // Declare something with a name, as long as that name isn't taken.
    if (!this.namedEntities.has(thing.name)) {
      this.namedEntities.set(thing.name, thing);
    }
  }

  /**
   * Look up a variable within this `Scope`.
   *
   * This can recurse into a parent `Scope` if it's available.
   */
  lookup(name: string): Reference|Variable|null {
    if (this.namedEntities.has(name)) {
      // Found in the local scope.
      return this.namedEntities.get(name)!;
    } else if (this.parentScope !== null) {
      // Not in the local scope, but there's a parent scope so check there.
      return this.parentScope.lookup(name);
    } else {
      // At the top level and it wasn't found.
      return null;
    }
  }

  /**
   * Get the child scope for a `Template`.
   *
   * This should always be defined.
   */
  getChildScope(template: Template): Scope {
    const res = this.childScopes.get(template);
    if (res === undefined) {
      throw new Error(`Assertion error: child scope for ${template} not found`);
    }
    return res;
  }
}

/**
 * Processes a template and matches directives on nodes (elements and templates).
 *
 * Usually used via the static `apply()` method.
 */
class DirectiveBinder<DirectiveT extends DirectiveMeta> implements Visitor {
  constructor(
      private matcher: SelectorMatcher<DirectiveT>,
      private directives: Map<Element|Template, DirectiveT[]>,
      private bindings: Map<BoundAttribute|BoundEvent|TextAttribute, DirectiveT|Element|Template>,
      private references:
          Map<Reference, {directive: DirectiveT, node: Element|Template}|Element|Template>) {}

  /**
   * Process a template (list of `Node`s) and perform directive matching against each node.
   *
   * @param template the list of template `Node`s to match (recursively).
   * @param selectorMatcher a `SelectorMatcher` containing the directives that are in scope for
   * this template.
   * @returns three maps which contain information about directives in the template: the
   * `directives` map which lists directives matched on each node, the `bindings` map which
   * indicates which directives claimed which bindings (inputs, outputs, etc), and the `references`
   * map which resolves #references (`Reference`s) within the template to the named directive or
   * template node.
   */
  static apply<DirectiveT extends DirectiveMeta>(
      template: Node[], selectorMatcher: SelectorMatcher<DirectiveT>): {
    directives: Map<Element|Template, DirectiveT[]>,
    bindings: Map<BoundAttribute|BoundEvent|TextAttribute, DirectiveT|Element|Template>,
    references: Map<Reference, {directive: DirectiveT, node: Element|Template}|Element|Template>,
  } {
    const directives = new Map<Element|Template, DirectiveT[]>();
    const bindings =
        new Map<BoundAttribute|BoundEvent|TextAttribute, DirectiveT|Element|Template>();
    const references =
        new Map<Reference, {directive: DirectiveT, node: Element | Template}|Element|Template>();
    const matcher = new DirectiveBinder(selectorMatcher, directives, bindings, references);
    matcher.ingest(template);
    return {directives, bindings, references};
  }

  private ingest(template: Node[]): void {
    template.forEach(node => node.visit(this));
  }

  visitElement(element: Element): void {
    this.visitElementOrTemplate(element.name, element);
  }

  visitTemplate(template: Template): void {
    this.visitElementOrTemplate('ng-template', template);
  }

  visitElementOrTemplate(elementName: string, node: Element|Template): void {
    // First, determine the HTML shape of the node for the purpose of directive matching.
    // Do this by building up a `CssSelector` for the node.
    const cssSelector = createCssSelector(elementName, getAttrsForDirectiveMatching(node));

    // Next, use the `SelectorMatcher` to get the list of directives on the node.
    const directives: DirectiveT[] = [];
    this.matcher.match(cssSelector, (_, directive) => directives.push(directive));
    if (directives.length > 0) {
      this.directives.set(node, directives);
    }

    // Resolve any references that are created on this node.
    node.references.forEach(ref => {
      let dirTarget: DirectiveT|null = null;

      // If the reference expression is empty, then it matches the "primary" directive on the node
      // (if there is one). Otherwise it matches the host node itself (either an element or
      // <ng-template> node).
      if (ref.value.trim() === '') {
        // This could be a reference to a component if there is one.
        dirTarget = directives.find(dir => dir.isComponent) || null;
      } else {
        // This should be a reference to a directive exported via exportAs.
        dirTarget =
            directives.find(
                dir => dir.exportAs !== null && dir.exportAs.some(value => value === ref.value)) ||
            null;
        // Check if a matching directive was found.
        if (dirTarget === null) {
          // No matching directive was found - this reference points to an unknown target. Leave it
          // unmapped.
          return;
        }
      }

      if (dirTarget !== null) {
        // This reference points to a directive.
        this.references.set(ref, {directive: dirTarget, node});
      } else {
        // This reference points to the node itself.
        this.references.set(ref, node);
      }
    });

    // Associate attributes/bindings on the node with directives or with the node itself.
    type BoundNode = BoundAttribute|BoundEvent|TextAttribute;
    const setAttributeBinding =
        (attribute: BoundNode, ioType: keyof Pick<DirectiveMeta, 'inputs'|'outputs'>) => {
          const dir = directives.find(dir => dir[ioType].hasBindingPropertyName(attribute.name));
          const binding = dir !== undefined ? dir : node;
          this.bindings.set(attribute, binding);
        };

    // Node inputs (bound attributes) and text attributes can be bound to an
    // input on a directive.
    node.inputs.forEach(input => setAttributeBinding(input, 'inputs'));
    node.attributes.forEach(attr => setAttributeBinding(attr, 'inputs'));
    if (node instanceof Template) {
      node.templateAttrs.forEach(attr => setAttributeBinding(attr, 'inputs'));
    }
    // Node outputs (bound events) can be bound to an output on a directive.
    node.outputs.forEach(output => setAttributeBinding(output, 'outputs'));

    // Recurse into the node's children.
    node.children.forEach(child => child.visit(this));
  }

  // Unused visitors.
  visitContent(content: Content): void {}
  visitVariable(variable: Variable): void {}
  visitReference(reference: Reference): void {}
  visitTextAttribute(attribute: TextAttribute): void {}
  visitBoundAttribute(attribute: BoundAttribute): void {}
  visitBoundEvent(attribute: BoundEvent): void {}
  visitBoundAttributeOrEvent(node: BoundAttribute|BoundEvent) {}
  visitText(text: Text): void {}
  visitBoundText(text: BoundText): void {}
  visitIcu(icu: Icu): void {}
}

/**
 * Processes a template and extract metadata about expressions and symbols within.
 *
 * This is a companion to the `DirectiveBinder` that doesn't require knowledge of directives matched
 * within the template in order to operate.
 *
 * Expressions are visited by the superclass `RecursiveAstVisitor`, with custom logic provided
 * by overridden methods from that visitor.
 */
class TemplateBinder extends RecursiveAstVisitor implements Visitor {
  private visitNode: (node: Node) => void;

  private pipesUsed: string[] = [];

  private constructor(
      private bindings: Map<AST, Reference|Variable>,
      private symbols: Map<Reference|Variable, Template>, private usedPipes: Set<string>,
      private nestingLevel: Map<Template, number>, private scope: Scope,
      private template: Template|null, private level: number) {
    super();

    // Save a bit of processing time by constructing this closure in advance.
    this.visitNode = (node: Node) => node.visit(this);
  }

  // This method is defined to reconcile the type of TemplateBinder since both
  // RecursiveAstVisitor and Visitor define the visit() method in their
  // interfaces.
  visit(node: AST|Node, context?: any) {
    if (node instanceof AST) {
      node.visit(this, context);
    } else {
      node.visit(this);
    }
  }

  /**
   * Process a template and extract metadata about expressions and symbols within.
   *
   * @param template the nodes of the template to process
   * @param scope the `Scope` of the template being processed.
   * @returns three maps which contain metadata about the template: `expressions` which interprets
   * special `AST` nodes in expressions as pointing to references or variables declared within the
   * template, `symbols` which maps those variables and references to the nested `Template` which
   * declares them, if any, and `nestingLevel` which associates each `Template` with a integer
   * nesting level (how many levels deep within the template structure the `Template` is), starting
   * at 1.
   */
  static apply(template: Node[], scope: Scope): {
    expressions: Map<AST, Reference|Variable>,
    symbols: Map<Variable|Reference, Template>,
    nestingLevel: Map<Template, number>,
    usedPipes: Set<string>,
  } {
    const expressions = new Map<AST, Reference|Variable>();
    const symbols = new Map<Variable|Reference, Template>();
    const nestingLevel = new Map<Template, number>();
    const usedPipes = new Set<string>();
    // The top-level template has nesting level 0.
    const binder = new TemplateBinder(
        expressions, symbols, usedPipes, nestingLevel, scope,
        template instanceof Template ? template : null, 0);
    binder.ingest(template);
    return {expressions, symbols, nestingLevel, usedPipes};
  }

  private ingest(template: Template|Node[]): void {
    if (template instanceof Template) {
      // For <ng-template>s, process only variables and child nodes. Inputs, outputs, templateAttrs,
      // and references were all processed in the scope of the containing template.
      template.variables.forEach(this.visitNode);
      template.children.forEach(this.visitNode);

      // Set the nesting level.
      this.nestingLevel.set(template, this.level);
    } else {
      // Visit each node from the top-level template.
      template.forEach(this.visitNode);
    }
  }

  visitElement(element: Element) {
    // Visit the inputs, outputs, and children of the element.
    element.inputs.forEach(this.visitNode);
    element.outputs.forEach(this.visitNode);
    element.children.forEach(this.visitNode);
  }

  visitTemplate(template: Template) {
    // First, visit inputs, outputs and template attributes of the template node.
    template.inputs.forEach(this.visitNode);
    template.outputs.forEach(this.visitNode);
    template.templateAttrs.forEach(this.visitNode);

    // References are also evaluated in the outer context.
    template.references.forEach(this.visitNode);

    // Next, recurse into the template using its scope, and bumping the nesting level up by one.
    const childScope = this.scope.getChildScope(template);
    const binder = new TemplateBinder(
        this.bindings, this.symbols, this.usedPipes, this.nestingLevel, childScope, template,
        this.level + 1);
    binder.ingest(template);
  }

  visitVariable(variable: Variable) {
    // Register the `Variable` as a symbol in the current `Template`.
    if (this.template !== null) {
      this.symbols.set(variable, this.template);
    }
  }

  visitReference(reference: Reference) {
    // Register the `Reference` as a symbol in the current `Template`.
    if (this.template !== null) {
      this.symbols.set(reference, this.template);
    }
  }

  // Unused template visitors

  visitText(text: Text) {}
  visitContent(content: Content) {}
  visitTextAttribute(attribute: TextAttribute) {}
  visitIcu(icu: Icu): void {
    Object.keys(icu.vars).forEach(key => icu.vars[key].visit(this));
    Object.keys(icu.placeholders).forEach(key => icu.placeholders[key].visit(this));
  }

  // The remaining visitors are concerned with processing AST expressions within template bindings

  visitBoundAttribute(attribute: BoundAttribute) {
    attribute.value.visit(this);
  }

  visitBoundEvent(event: BoundEvent) {
    event.handler.visit(this);
  }

  visitBoundText(text: BoundText) {
    text.value.visit(this);
  }
  visitPipe(ast: BindingPipe, context: any): any {
    this.usedPipes.add(ast.name);
    return super.visitPipe(ast, context);
  }

  // These five types of AST expressions can refer to expression roots, which could be variables
  // or references in the current scope.

  visitPropertyRead(ast: PropertyRead, context: any): any {
    this.maybeMap(context, ast, ast.name);
    return super.visitPropertyRead(ast, context);
  }

  visitSafePropertyRead(ast: SafePropertyRead, context: any): any {
    this.maybeMap(context, ast, ast.name);
    return super.visitSafePropertyRead(ast, context);
  }

  visitPropertyWrite(ast: PropertyWrite, context: any): any {
    this.maybeMap(context, ast, ast.name);
    return super.visitPropertyWrite(ast, context);
  }

  visitMethodCall(ast: MethodCall, context: any): any {
    this.maybeMap(context, ast, ast.name);
    return super.visitMethodCall(ast, context);
  }

  visitSafeMethodCall(ast: SafeMethodCall, context: any): any {
    this.maybeMap(context, ast, ast.name);
    return super.visitSafeMethodCall(ast, context);
  }

  private maybeMap(
      scope: Scope, ast: PropertyRead|SafePropertyRead|PropertyWrite|MethodCall|SafeMethodCall,
      name: string): void {
    // If the receiver of the expression isn't the `ImplicitReceiver`, this isn't the root of an
    // `AST` expression that maps to a `Variable` or `Reference`.
    if (!(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }

    // Check whether the name exists in the current scope. If so, map it. Otherwise, the name is
    // probably a property on the top-level component context.
    let target = this.scope.lookup(name);
    if (target !== null) {
      this.bindings.set(ast, target);
    }
  }
}

/**
 * Metadata container for a `Target` that allows queries for specific bits of metadata.
 *
 * See `BoundTarget` for documentation on the individual methods.
 */
export class R3BoundTarget<DirectiveT extends DirectiveMeta> implements BoundTarget<DirectiveT> {
  constructor(
      readonly target: Target, private directives: Map<Element|Template, DirectiveT[]>,
      private bindings: Map<BoundAttribute|BoundEvent|TextAttribute, DirectiveT|Element|Template>,
      private references:
          Map<BoundAttribute|BoundEvent|Reference|TextAttribute,
              {directive: DirectiveT, node: Element|Template}|Element|Template>,
      private exprTargets: Map<AST, Reference|Variable>,
      private symbols: Map<Reference|Variable, Template>,
      private nestingLevel: Map<Template, number>,
      private templateEntities: Map<Template|null, ReadonlySet<Reference|Variable>>,
      private usedPipes: Set<string>) {}

  getEntitiesInTemplateScope(template: Template|null): ReadonlySet<Reference|Variable> {
    return this.templateEntities.get(template) ?? new Set();
  }

  getDirectivesOfNode(node: Element|Template): DirectiveT[]|null {
    return this.directives.get(node) || null;
  }

  getReferenceTarget(ref: Reference): {directive: DirectiveT, node: Element|Template}|Element
      |Template|null {
    return this.references.get(ref) || null;
  }

  getConsumerOfBinding(binding: BoundAttribute|BoundEvent|TextAttribute): DirectiveT|Element
      |Template|null {
    return this.bindings.get(binding) || null;
  }

  getExpressionTarget(expr: AST): Reference|Variable|null {
    return this.exprTargets.get(expr) || null;
  }

  getTemplateOfSymbol(symbol: Reference|Variable): Template|null {
    return this.symbols.get(symbol) || null;
  }

  getNestingLevel(template: Template): number {
    return this.nestingLevel.get(template) || 0;
  }

  getUsedDirectives(): DirectiveT[] {
    const set = new Set<DirectiveT>();
    this.directives.forEach(dirs => dirs.forEach(dir => set.add(dir)));
    return Array.from(set.values());
  }

  getUsedPipes(): string[] {
    return Array.from(this.usedPipes);
  }
}

function extractTemplateEntities(rootScope: Scope): Map<Template|null, Set<Reference|Variable>> {
  const entityMap = new Map<Template|null, Map<string, Reference|Variable>>();

  function extractScopeEntities(scope: Scope): Map<string, Reference|Variable> {
    if (entityMap.has(scope.template)) {
      return entityMap.get(scope.template)!;
    }

    const currentEntities = scope.namedEntities;

    let templateEntities: Map<string, Reference|Variable>;
    if (scope.parentScope !== null) {
      templateEntities = new Map([...extractScopeEntities(scope.parentScope), ...currentEntities]);
    } else {
      templateEntities = new Map(currentEntities);
    }

    entityMap.set(scope.template, templateEntities);
    return templateEntities;
  }

  const scopesToProcess: Scope[] = [rootScope];
  while (scopesToProcess.length > 0) {
    const scope = scopesToProcess.pop()!;
    for (const childScope of scope.childScopes.values()) {
      scopesToProcess.push(childScope);
    }
    extractScopeEntities(scope);
  }

  const templateEntities = new Map<Template|null, Set<Reference|Variable>>();
  for (const [template, entities] of entityMap) {
    templateEntities.set(template, new Set(entities.values()));
  }
  return templateEntities;
}
