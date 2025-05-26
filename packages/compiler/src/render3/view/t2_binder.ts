/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  BindingPipe,
  ImplicitReceiver,
  PropertyRead,
  SafePropertyRead,
  ThisReceiver,
} from '../../expression_parser/ast';
import {CssSelector, SelectorlessMatcher, SelectorMatcher} from '../../directive_matching';
import {
  BoundAttribute,
  BoundEvent,
  BoundText,
  Comment,
  Component,
  Content,
  DeferredBlock,
  DeferredBlockError,
  DeferredBlockLoading,
  DeferredBlockPlaceholder,
  DeferredTrigger,
  Directive,
  Element,
  ForLoopBlock,
  ForLoopBlockEmpty,
  HostElement,
  HoverDeferredTrigger,
  Icu,
  IfBlock,
  IfBlockBranch,
  InteractionDeferredTrigger,
  LetDeclaration,
  Node,
  Reference,
  SwitchBlock,
  SwitchBlockCase,
  Template,
  Text,
  TextAttribute,
  UnknownBlock,
  Variable,
  ViewportDeferredTrigger,
  Visitor,
} from '../r3_ast';

import {
  BoundTarget,
  DirectiveMeta,
  DirectiveOwner,
  ReferenceTarget,
  ScopedNode,
  Target,
  TargetBinder,
  TemplateEntity,
} from './t2_api';
import {parseTemplate} from './template';
import {createCssSelectorFromNode} from './util';
import {CombinedRecursiveAstVisitor} from '../../combined_visitor';

/**
 * Computes a difference between full list (first argument) and
 * list of items that should be excluded from the full list (second
 * argument).
 */
function diff(fullList: string[], itemsToExclude: string[]): string[] {
  const exclude = new Set(itemsToExclude);
  return fullList.filter((item) => !exclude.has(item));
}

/** Shorthand for a map between a binding AST node and the entity it's targeting. */
type BindingsMap<DirectiveT> = Map<
  BoundAttribute | BoundEvent | TextAttribute,
  DirectiveT | Template | Element
>;

/** Shorthand for a map between a reference AST node and the entity it's targeting. */
type ReferenceMap<DirectiveT> = Map<
  Reference,
  Template | Element | {directive: DirectiveT; node: DirectiveOwner}
>;

/** Mapping between AST nodes and the directives that have been matched on them. */
type MatchedDirectives<DirectiveT> = Map<DirectiveOwner, DirectiveT[]>;

/**
 * Mapping between a scoped not and the template entities that exist in it.
 * `null` represents the root scope.
 */
type ScopedNodeEntities = Map<ScopedNode | null, Set<TemplateEntity>>;

/** Shorthand tuple type where a defer block is paired with its corresponding scope. */
type DeferBlockScopes = [DeferredBlock, Scope][];

/**
 * Given a template string and a set of available directive selectors,
 * computes a list of matching selectors and splits them into 2 buckets:
 * (1) eagerly used in a template and (2) directives used only in defer
 * blocks. Similarly, returns 2 lists of pipes (eager and deferrable).
 *
 * Note: deferrable directives selectors and pipes names used in `@defer`
 * blocks are **candidates** and API caller should make sure that:
 *
 *  * A Component where a given template is defined is standalone
 *  * Underlying dependency classes are also standalone
 *  * Dependency class symbols are not eagerly used in a TS file
 *    where a host component (that owns the template) is located
 */
export function findMatchingDirectivesAndPipes(template: string, directiveSelectors: string[]) {
  const matcher = new SelectorMatcher<DirectiveMeta[]>();
  for (const selector of directiveSelectors) {
    // Create a fake directive instance to account for the logic inside
    // of the `R3TargetBinder` class (which invokes the `hasBindingPropertyName`
    // function internally).
    const fakeDirective = {
      selector,
      exportAs: null,
      inputs: {
        hasBindingPropertyName() {
          return false;
        },
      },
      outputs: {
        hasBindingPropertyName() {
          return false;
        },
      },
    } as unknown as DirectiveMeta;
    matcher.addSelectables(CssSelector.parse(selector), [fakeDirective]);
  }
  const parsedTemplate = parseTemplate(template, '' /* templateUrl */);
  const binder = new R3TargetBinder(matcher);
  const bound = binder.bind({template: parsedTemplate.nodes});

  const eagerDirectiveSelectors = bound.getEagerlyUsedDirectives().map((dir) => dir.selector!);
  const allMatchedDirectiveSelectors = bound.getUsedDirectives().map((dir) => dir.selector!);
  const eagerPipes = bound.getEagerlyUsedPipes();
  return {
    directives: {
      regular: eagerDirectiveSelectors,
      deferCandidates: diff(allMatchedDirectiveSelectors, eagerDirectiveSelectors),
    },
    pipes: {
      regular: eagerPipes,
      deferCandidates: diff(bound.getUsedPipes(), eagerPipes),
    },
  };
}

/** Object used to match template nodes to directives. */
export type DirectiveMatcher<DirectiveT extends DirectiveMeta> =
  | SelectorMatcher<DirectiveT[]>
  | SelectorlessMatcher<DirectiveT>;

/**
 * Processes `Target`s with a given set of directives and performs a binding operation, which
 * returns an object similar to TypeScript's `ts.TypeChecker` that contains knowledge about the
 * target.
 */
export class R3TargetBinder<DirectiveT extends DirectiveMeta> implements TargetBinder<DirectiveT> {
  constructor(private directiveMatcher: DirectiveMatcher<DirectiveT> | null) {}

  /**
   * Perform a binding operation on the given `Target` and return a `BoundTarget` which contains
   * metadata about the types referenced in the template.
   */
  bind(target: Target): BoundTarget<DirectiveT> {
    if (!target.template && !target.host) {
      throw new Error('Empty bound targets are not supported');
    }

    const directives: MatchedDirectives<DirectiveT> = new Map();
    const eagerDirectives: DirectiveT[] = [];
    const missingDirectives = new Set<string>();
    const bindings: BindingsMap<DirectiveT> = new Map();
    const references: ReferenceMap<DirectiveT> = new Map();
    const scopedNodeEntities: ScopedNodeEntities = new Map();
    const expressions = new Map<AST, TemplateEntity>();
    const symbols = new Map<TemplateEntity, Template>();
    const nestingLevel = new Map<ScopedNode, number>();
    const usedPipes = new Set<string>();
    const eagerPipes = new Set<string>();
    const deferBlocks: DeferBlockScopes = [];

    if (target.template) {
      // First, parse the template into a `Scope` structure. This operation captures the syntactic
      // scopes in the template and makes them available for later use.
      const scope = Scope.apply(target.template);

      // Use the `Scope` to extract the entities present at every level of the template.
      extractScopedNodeEntities(scope, scopedNodeEntities);

      // Next, perform directive matching on the template using the `DirectiveBinder`. This returns:
      //   - directives: Map of nodes (elements & ng-templates) to the directives on them.
      //   - bindings: Map of inputs, outputs, and attributes to the directive/element that claims
      //     them. TODO(alxhub): handle multiple directives claiming an input/output/etc.
      //   - references: Map of #references to their targets.
      DirectiveBinder.apply(
        target.template,
        this.directiveMatcher,
        directives,
        eagerDirectives,
        missingDirectives,
        bindings,
        references,
      );

      // Finally, run the TemplateBinder to bind references, variables, and other entities within the
      // template. This extracts all the metadata that doesn't depend on directive matching.
      TemplateBinder.applyWithScope(
        target.template,
        scope,
        expressions,
        symbols,
        nestingLevel,
        usedPipes,
        eagerPipes,
        deferBlocks,
      );
    }

    // Bind the host element in a separate scope. Note that it only uses the
    // `TemplateBinder` since directives don't apply inside a host context.
    if (target.host) {
      TemplateBinder.applyWithScope(
        target.host,
        Scope.apply(target.host),
        expressions,
        symbols,
        nestingLevel,
        usedPipes,
        eagerPipes,
        deferBlocks,
      );
    }

    return new R3BoundTarget(
      target,
      directives,
      eagerDirectives,
      missingDirectives,
      bindings,
      references,
      expressions,
      symbols,
      nestingLevel,
      scopedNodeEntities,
      usedPipes,
      eagerPipes,
      deferBlocks,
    );
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
  readonly namedEntities = new Map<string, TemplateEntity>();

  /**
   * Set of element-like nodes that belong to this scope.
   */
  readonly elementLikeInScope = new Set<Element | Component>();

  /**
   * Child `Scope`s for immediately nested `ScopedNode`s.
   */
  readonly childScopes = new Map<ScopedNode, Scope>();

  /** Whether this scope is deferred or if any of its ancestors are deferred. */
  readonly isDeferred: boolean;

  private constructor(
    readonly parentScope: Scope | null,
    readonly rootNode: ScopedNode | null,
  ) {
    this.isDeferred =
      parentScope !== null && parentScope.isDeferred ? true : rootNode instanceof DeferredBlock;
  }

  static newRootScope(): Scope {
    return new Scope(null, null);
  }

  /**
   * Process a template (either as a `Template` sub-template with variables, or a plain array of
   * template `Node`s) and construct its `Scope`.
   */
  static apply(template: ScopedNode | Node[]): Scope {
    const scope = Scope.newRootScope();
    scope.ingest(template);
    return scope;
  }

  /**
   * Internal method to process the scoped node and populate the `Scope`.
   */
  private ingest(nodeOrNodes: ScopedNode | Node[]): void {
    if (nodeOrNodes instanceof Template) {
      // Variables on an <ng-template> are defined in the inner scope.
      nodeOrNodes.variables.forEach((node) => this.visitVariable(node));

      // Process the nodes of the template.
      nodeOrNodes.children.forEach((node) => node.visit(this));
    } else if (nodeOrNodes instanceof IfBlockBranch) {
      if (nodeOrNodes.expressionAlias !== null) {
        this.visitVariable(nodeOrNodes.expressionAlias);
      }
      nodeOrNodes.children.forEach((node) => node.visit(this));
    } else if (nodeOrNodes instanceof ForLoopBlock) {
      this.visitVariable(nodeOrNodes.item);
      nodeOrNodes.contextVariables.forEach((v) => this.visitVariable(v));
      nodeOrNodes.children.forEach((node) => node.visit(this));
    } else if (
      nodeOrNodes instanceof SwitchBlockCase ||
      nodeOrNodes instanceof ForLoopBlockEmpty ||
      nodeOrNodes instanceof DeferredBlock ||
      nodeOrNodes instanceof DeferredBlockError ||
      nodeOrNodes instanceof DeferredBlockPlaceholder ||
      nodeOrNodes instanceof DeferredBlockLoading ||
      nodeOrNodes instanceof Content
    ) {
      nodeOrNodes.children.forEach((node) => node.visit(this));
    } else if (!(nodeOrNodes instanceof HostElement)) {
      // No overarching `Template` instance, so process the nodes directly.
      nodeOrNodes.forEach((node) => node.visit(this));
    }
  }

  visitElement(element: Element) {
    this.visitElementLike(element);
  }

  visitTemplate(template: Template) {
    template.directives.forEach((node) => node.visit(this));

    // References on a <ng-template> are defined in the outer scope, so capture them before
    // processing the template's child scope.
    template.references.forEach((node) => this.visitReference(node));

    // Next, create an inner scope and process the template within it.
    this.ingestScopedNode(template);
  }

  visitVariable(variable: Variable) {
    // Declare the variable if it's not already.
    this.maybeDeclare(variable);
  }

  visitReference(reference: Reference) {
    // Declare the variable if it's not already.
    this.maybeDeclare(reference);
  }

  visitDeferredBlock(deferred: DeferredBlock) {
    this.ingestScopedNode(deferred);
    deferred.placeholder?.visit(this);
    deferred.loading?.visit(this);
    deferred.error?.visit(this);
  }

  visitDeferredBlockPlaceholder(block: DeferredBlockPlaceholder) {
    this.ingestScopedNode(block);
  }

  visitDeferredBlockError(block: DeferredBlockError) {
    this.ingestScopedNode(block);
  }

  visitDeferredBlockLoading(block: DeferredBlockLoading) {
    this.ingestScopedNode(block);
  }

  visitSwitchBlock(block: SwitchBlock) {
    block.cases.forEach((node) => node.visit(this));
  }

  visitSwitchBlockCase(block: SwitchBlockCase) {
    this.ingestScopedNode(block);
  }

  visitForLoopBlock(block: ForLoopBlock) {
    this.ingestScopedNode(block);
    block.empty?.visit(this);
  }

  visitForLoopBlockEmpty(block: ForLoopBlockEmpty) {
    this.ingestScopedNode(block);
  }

  visitIfBlock(block: IfBlock) {
    block.branches.forEach((node) => node.visit(this));
  }

  visitIfBlockBranch(block: IfBlockBranch) {
    this.ingestScopedNode(block);
  }

  visitContent(content: Content) {
    this.ingestScopedNode(content);
  }

  visitLetDeclaration(decl: LetDeclaration) {
    this.maybeDeclare(decl);
  }

  visitComponent(component: Component) {
    this.visitElementLike(component);
  }

  visitDirective(directive: Directive) {
    directive.references.forEach((current) => this.visitReference(current));
  }

  // Unused visitors.
  visitBoundAttribute(attr: BoundAttribute) {}
  visitBoundEvent(event: BoundEvent) {}
  visitBoundText(text: BoundText) {}
  visitText(text: Text) {}
  visitTextAttribute(attr: TextAttribute) {}
  visitIcu(icu: Icu) {}
  visitDeferredTrigger(trigger: DeferredTrigger) {}
  visitUnknownBlock(block: UnknownBlock) {}

  private visitElementLike(node: Element | Component) {
    node.directives.forEach((current) => current.visit(this));
    node.references.forEach((current) => this.visitReference(current));
    node.children.forEach((current) => current.visit(this));
    this.elementLikeInScope.add(node);
  }

  private maybeDeclare(thing: TemplateEntity) {
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
  lookup(name: string): TemplateEntity | null {
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
   * Get the child scope for a `ScopedNode`.
   *
   * This should always be defined.
   */
  getChildScope(node: ScopedNode): Scope {
    const res = this.childScopes.get(node);
    if (res === undefined) {
      throw new Error(`Assertion error: child scope for ${node} not found`);
    }
    return res;
  }

  private ingestScopedNode(node: ScopedNode) {
    const scope = new Scope(this, node);
    scope.ingest(node);
    this.childScopes.set(node, scope);
  }
}

/**
 * Processes a template and matches directives on nodes (elements and templates).
 *
 * Usually used via the static `apply()` method.
 */
class DirectiveBinder<DirectiveT extends DirectiveMeta> implements Visitor {
  // Indicates whether we are visiting elements within a `defer` block
  private isInDeferBlock = false;

  private constructor(
    private directiveMatcher: DirectiveMatcher<DirectiveT> | null,
    private directives: MatchedDirectives<DirectiveT>,
    private eagerDirectives: DirectiveT[],
    private missingDirectives: Set<string>,
    private bindings: BindingsMap<DirectiveT>,
    private references: ReferenceMap<DirectiveT>,
  ) {}

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
    template: Node[],
    directiveMatcher: DirectiveMatcher<DirectiveT> | null,
    directives: MatchedDirectives<DirectiveT>,
    eagerDirectives: DirectiveT[],
    missingDirectives: Set<string>,
    bindings: BindingsMap<DirectiveT>,
    references: ReferenceMap<DirectiveT>,
  ): void {
    const matcher = new DirectiveBinder(
      directiveMatcher,
      directives,
      eagerDirectives,
      missingDirectives,
      bindings,
      references,
    );
    matcher.ingest(template);
  }

  private ingest(template: Node[]): void {
    template.forEach((node) => node.visit(this));
  }

  visitElement(element: Element): void {
    this.visitElementOrTemplate(element);
  }

  visitTemplate(template: Template): void {
    this.visitElementOrTemplate(template);
  }

  visitDeferredBlock(deferred: DeferredBlock): void {
    const wasInDeferBlock = this.isInDeferBlock;
    this.isInDeferBlock = true;
    deferred.children.forEach((child) => child.visit(this));
    this.isInDeferBlock = wasInDeferBlock;

    deferred.placeholder?.visit(this);
    deferred.loading?.visit(this);
    deferred.error?.visit(this);
  }

  visitDeferredBlockPlaceholder(block: DeferredBlockPlaceholder): void {
    block.children.forEach((child) => child.visit(this));
  }

  visitDeferredBlockError(block: DeferredBlockError): void {
    block.children.forEach((child) => child.visit(this));
  }

  visitDeferredBlockLoading(block: DeferredBlockLoading): void {
    block.children.forEach((child) => child.visit(this));
  }

  visitSwitchBlock(block: SwitchBlock) {
    block.cases.forEach((node) => node.visit(this));
  }

  visitSwitchBlockCase(block: SwitchBlockCase) {
    block.children.forEach((node) => node.visit(this));
  }

  visitForLoopBlock(block: ForLoopBlock) {
    block.item.visit(this);
    block.contextVariables.forEach((v) => v.visit(this));
    block.children.forEach((node) => node.visit(this));
    block.empty?.visit(this);
  }

  visitForLoopBlockEmpty(block: ForLoopBlockEmpty) {
    block.children.forEach((node) => node.visit(this));
  }

  visitIfBlock(block: IfBlock) {
    block.branches.forEach((node) => node.visit(this));
  }

  visitIfBlockBranch(block: IfBlockBranch) {
    block.expressionAlias?.visit(this);
    block.children.forEach((node) => node.visit(this));
  }

  visitContent(content: Content): void {
    content.children.forEach((child) => child.visit(this));
  }

  visitComponent(node: Component): void {
    if (this.directiveMatcher instanceof SelectorlessMatcher) {
      const componentMatches = this.directiveMatcher.match(node.componentName);

      if (componentMatches.length > 0) {
        this.trackSelectorlessMatchesAndDirectives(node, componentMatches);
      } else {
        this.missingDirectives.add(node.componentName);
      }
    }

    node.directives.forEach((directive) => directive.visit(this));
    node.children.forEach((child) => child.visit(this));
  }

  visitDirective(node: Directive): void {
    if (this.directiveMatcher instanceof SelectorlessMatcher) {
      const directives = this.directiveMatcher.match(node.name);

      if (directives.length > 0) {
        this.trackSelectorlessMatchesAndDirectives(node, directives);
      } else {
        this.missingDirectives.add(node.name);
      }
    }
  }

  private visitElementOrTemplate(node: Element | Template): void {
    if (this.directiveMatcher instanceof SelectorMatcher) {
      const directives: DirectiveT[] = [];
      const cssSelector = createCssSelectorFromNode(node);
      this.directiveMatcher.match(cssSelector, (_, results) => directives.push(...results));
      this.trackSelectorBasedBindingsAndDirectives(node, directives);
    } else {
      node.references.forEach((ref) => {
        if (ref.value.trim() === '') {
          this.references.set(ref, node);
        }
      });
    }

    node.directives.forEach((directive) => directive.visit(this));
    node.children.forEach((child) => child.visit(this));
  }

  private trackMatchedDirectives(node: DirectiveOwner, directives: DirectiveT[]): void {
    if (directives.length > 0) {
      this.directives.set(node, directives);
      if (!this.isInDeferBlock) {
        this.eagerDirectives.push(...directives);
      }
    }
  }

  private trackSelectorlessMatchesAndDirectives(
    node: Component | Directive,
    directives: DirectiveT[],
  ): void {
    if (directives.length === 0) {
      return;
    }

    this.trackMatchedDirectives(node, directives);

    const setBinding = (
      meta: DirectiveT,
      attribute: BoundAttribute | BoundEvent | TextAttribute,
      ioType: keyof Pick<DirectiveMeta, 'inputs' | 'outputs'>,
    ) => {
      if (meta[ioType].hasBindingPropertyName(attribute.name)) {
        this.bindings.set(attribute, meta);
      }
    };

    for (const directive of directives) {
      node.inputs.forEach((input) => setBinding(directive, input, 'inputs'));
      node.attributes.forEach((attr) => setBinding(directive, attr, 'inputs'));
      node.outputs.forEach((output) => setBinding(directive, output, 'outputs'));
    }

    // TODO(crisbeto): currently it's unclear how references should behave under selectorless,
    // given that there's one named class which can bring in multiple host directives.
    // For the time being only register the first directive as the reference target.
    node.references.forEach((ref) =>
      this.references.set(ref, {directive: directives[0], node: node}),
    );
  }

  private trackSelectorBasedBindingsAndDirectives(
    node: Element | Template,
    directives: DirectiveT[],
  ): void {
    this.trackMatchedDirectives(node, directives);

    // Resolve any references that are created on this node.
    node.references.forEach((ref) => {
      let dirTarget: DirectiveT | null = null;

      // If the reference expression is empty, then it matches the "primary" directive on the node
      // (if there is one). Otherwise it matches the host node itself (either an element or
      // <ng-template> node).
      if (ref.value.trim() === '') {
        // This could be a reference to a component if there is one.
        dirTarget = directives.find((dir) => dir.isComponent) || null;
      } else {
        // This should be a reference to a directive exported via exportAs.
        dirTarget =
          directives.find(
            (dir) => dir.exportAs !== null && dir.exportAs.some((value) => value === ref.value),
          ) || null;
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
    const setAttributeBinding = (
      attribute: BoundAttribute | BoundEvent | TextAttribute,
      ioType: keyof Pick<DirectiveMeta, 'inputs' | 'outputs'>,
    ) => {
      const dir = directives.find((dir) => dir[ioType].hasBindingPropertyName(attribute.name));
      const binding = dir !== undefined ? dir : node;
      this.bindings.set(attribute, binding);
    };

    // Node inputs (bound attributes) and text attributes can be bound to an
    // input on a directive.
    node.inputs.forEach((input) => setAttributeBinding(input, 'inputs'));
    node.attributes.forEach((attr) => setAttributeBinding(attr, 'inputs'));
    if (node instanceof Template) {
      node.templateAttrs.forEach((attr) => setAttributeBinding(attr, 'inputs'));
    }
    // Node outputs (bound events) can be bound to an output on a directive.
    node.outputs.forEach((output) => setAttributeBinding(output, 'outputs'));
  }

  // Unused visitors.
  visitVariable(variable: Variable): void {}
  visitReference(reference: Reference): void {}
  visitTextAttribute(attribute: TextAttribute): void {}
  visitBoundAttribute(attribute: BoundAttribute): void {}
  visitBoundEvent(attribute: BoundEvent): void {}
  visitBoundAttributeOrEvent(node: BoundAttribute | BoundEvent) {}
  visitText(text: Text): void {}
  visitBoundText(text: BoundText): void {}
  visitIcu(icu: Icu): void {}
  visitDeferredTrigger(trigger: DeferredTrigger): void {}
  visitUnknownBlock(block: UnknownBlock) {}
  visitLetDeclaration(decl: LetDeclaration) {}
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
class TemplateBinder extends CombinedRecursiveAstVisitor {
  private visitNode = (node: Node) => node.visit(this);

  private constructor(
    private bindings: Map<AST, TemplateEntity>,
    private symbols: Map<TemplateEntity, ScopedNode>,
    private usedPipes: Set<string>,
    private eagerPipes: Set<string>,
    private deferBlocks: DeferBlockScopes,
    private nestingLevel: Map<ScopedNode, number>,
    private scope: Scope,
    private rootNode: ScopedNode | null,
    private level: number,
  ) {
    super();
  }

  /**
   * Process a template and extract metadata about expressions and symbols within.
   *
   * @param nodeOrNodes the nodes of the template to process
   * @param scope the `Scope` of the template being processed.
   * @returns three maps which contain metadata about the template: `expressions` which interprets
   * special `AST` nodes in expressions as pointing to references or variables declared within the
   * template, `symbols` which maps those variables and references to the nested `Template` which
   * declares them, if any, and `nestingLevel` which associates each `Template` with a integer
   * nesting level (how many levels deep within the template structure the `Template` is), starting
   * at 1.
   */
  static applyWithScope(
    nodeOrNodes: ScopedNode | Node[],
    scope: Scope,
    expressions: Map<AST, TemplateEntity>,
    symbols: Map<TemplateEntity, Template>,
    nestingLevel: Map<ScopedNode, number>,
    usedPipes: Set<string>,
    eagerPipes: Set<string>,
    deferBlocks: DeferBlockScopes,
  ): void {
    const template = nodeOrNodes instanceof Template ? nodeOrNodes : null;
    // The top-level template has nesting level 0.
    const binder = new TemplateBinder(
      expressions,
      symbols,
      usedPipes,
      eagerPipes,
      deferBlocks,
      nestingLevel,
      scope,
      template,
      0,
    );
    binder.ingest(nodeOrNodes);
  }

  private ingest(nodeOrNodes: ScopedNode | Node[]): void {
    if (nodeOrNodes instanceof Template) {
      // For <ng-template>s, process only variables and child nodes. Inputs, outputs, templateAttrs,
      // and references were all processed in the scope of the containing template.
      nodeOrNodes.variables.forEach(this.visitNode);
      nodeOrNodes.children.forEach(this.visitNode);

      // Set the nesting level.
      this.nestingLevel.set(nodeOrNodes, this.level);
    } else if (nodeOrNodes instanceof IfBlockBranch) {
      if (nodeOrNodes.expressionAlias !== null) {
        this.visitNode(nodeOrNodes.expressionAlias);
      }
      nodeOrNodes.children.forEach(this.visitNode);
      this.nestingLevel.set(nodeOrNodes, this.level);
    } else if (nodeOrNodes instanceof ForLoopBlock) {
      this.visitNode(nodeOrNodes.item);
      nodeOrNodes.contextVariables.forEach((v) => this.visitNode(v));
      nodeOrNodes.trackBy.visit(this);
      nodeOrNodes.children.forEach(this.visitNode);
      this.nestingLevel.set(nodeOrNodes, this.level);
    } else if (nodeOrNodes instanceof DeferredBlock) {
      if (this.scope.rootNode !== nodeOrNodes) {
        throw new Error(
          `Assertion error: resolved incorrect scope for deferred block ${nodeOrNodes}`,
        );
      }
      this.deferBlocks.push([nodeOrNodes, this.scope]);
      nodeOrNodes.children.forEach((node) => node.visit(this));
      this.nestingLevel.set(nodeOrNodes, this.level);
    } else if (
      nodeOrNodes instanceof SwitchBlockCase ||
      nodeOrNodes instanceof ForLoopBlockEmpty ||
      nodeOrNodes instanceof DeferredBlockError ||
      nodeOrNodes instanceof DeferredBlockPlaceholder ||
      nodeOrNodes instanceof DeferredBlockLoading ||
      nodeOrNodes instanceof Content
    ) {
      nodeOrNodes.children.forEach((node) => node.visit(this));
      this.nestingLevel.set(nodeOrNodes, this.level);
    } else if (nodeOrNodes instanceof HostElement) {
      // Host elements are always at the top level.
      this.nestingLevel.set(nodeOrNodes, 0);
    } else {
      // Visit each node from the top-level template.
      nodeOrNodes.forEach(this.visitNode);
    }
  }

  override visitTemplate(template: Template) {
    // First, visit inputs, outputs and template attributes of the template node.
    template.inputs.forEach(this.visitNode);
    template.outputs.forEach(this.visitNode);
    template.directives.forEach(this.visitNode);
    template.templateAttrs.forEach(this.visitNode);
    template.references.forEach(this.visitNode);

    // Next, recurse into the template.
    this.ingestScopedNode(template);
  }

  override visitVariable(variable: Variable) {
    // Register the `Variable` as a symbol in the current `Template`.
    if (this.rootNode !== null) {
      this.symbols.set(variable, this.rootNode);
    }
  }

  override visitReference(reference: Reference) {
    // Register the `Reference` as a symbol in the current `Template`.
    if (this.rootNode !== null) {
      this.symbols.set(reference, this.rootNode);
    }
  }

  override visitDeferredBlock(deferred: DeferredBlock) {
    this.ingestScopedNode(deferred);
    deferred.triggers.when?.value.visit(this);
    deferred.prefetchTriggers.when?.value.visit(this);
    deferred.hydrateTriggers.when?.value.visit(this);
    deferred.hydrateTriggers.never?.visit(this);
    deferred.placeholder && this.visitNode(deferred.placeholder);
    deferred.loading && this.visitNode(deferred.loading);
    deferred.error && this.visitNode(deferred.error);
  }

  override visitDeferredBlockPlaceholder(block: DeferredBlockPlaceholder) {
    this.ingestScopedNode(block);
  }

  override visitDeferredBlockError(block: DeferredBlockError) {
    this.ingestScopedNode(block);
  }

  override visitDeferredBlockLoading(block: DeferredBlockLoading) {
    this.ingestScopedNode(block);
  }

  override visitSwitchBlockCase(block: SwitchBlockCase) {
    block.expression?.visit(this);
    this.ingestScopedNode(block);
  }

  override visitForLoopBlock(block: ForLoopBlock) {
    block.expression.visit(this);
    this.ingestScopedNode(block);
    block.empty?.visit(this);
  }

  override visitForLoopBlockEmpty(block: ForLoopBlockEmpty) {
    this.ingestScopedNode(block);
  }

  override visitIfBlockBranch(block: IfBlockBranch) {
    block.expression?.visit(this);
    this.ingestScopedNode(block);
  }

  override visitContent(content: Content) {
    this.ingestScopedNode(content);
  }

  override visitLetDeclaration(decl: LetDeclaration) {
    super.visitLetDeclaration(decl);

    if (this.rootNode !== null) {
      this.symbols.set(decl, this.rootNode);
    }
  }

  override visitPipe(ast: BindingPipe, context: any): any {
    this.usedPipes.add(ast.name);
    if (!this.scope.isDeferred) {
      this.eagerPipes.add(ast.name);
    }
    return super.visitPipe(ast, context);
  }

  // These five types of AST expressions can refer to expression roots, which could be variables
  // or references in the current scope.

  override visitPropertyRead(ast: PropertyRead, context: any): any {
    this.maybeMap(ast, ast.name);
    return super.visitPropertyRead(ast, context);
  }

  override visitSafePropertyRead(ast: SafePropertyRead, context: any): any {
    this.maybeMap(ast, ast.name);
    return super.visitSafePropertyRead(ast, context);
  }

  private ingestScopedNode(node: ScopedNode) {
    const childScope = this.scope.getChildScope(node);
    const binder = new TemplateBinder(
      this.bindings,
      this.symbols,
      this.usedPipes,
      this.eagerPipes,
      this.deferBlocks,
      this.nestingLevel,
      childScope,
      node,
      this.level + 1,
    );
    binder.ingest(node);
  }

  private maybeMap(ast: PropertyRead | SafePropertyRead, name: string): void {
    // If the receiver of the expression isn't the `ImplicitReceiver`, this isn't the root of an
    // `AST` expression that maps to a `Variable` or `Reference`.
    if (!(ast.receiver instanceof ImplicitReceiver) || ast.receiver instanceof ThisReceiver) {
      return;
    }

    // Check whether the name exists in the current scope. If so, map it. Otherwise, the name is
    // probably a property on the top-level component context.
    const target = this.scope.lookup(name);
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
class R3BoundTarget<DirectiveT extends DirectiveMeta> implements BoundTarget<DirectiveT> {
  /** Deferred blocks, ordered as they appear in the template. */
  private deferredBlocks: DeferredBlock[];

  /** Map of deferred blocks to their scope. */
  private deferredScopes: Map<DeferredBlock, Scope>;

  constructor(
    readonly target: Target,
    private directives: MatchedDirectives<DirectiveT>,
    private eagerDirectives: DirectiveT[],
    private missingDirectives: Set<string>,
    private bindings: BindingsMap<DirectiveT>,
    private references: ReferenceMap<DirectiveT>,
    private exprTargets: Map<AST, TemplateEntity>,
    private symbols: Map<TemplateEntity, Template>,
    private nestingLevel: Map<ScopedNode, number>,
    private scopedNodeEntities: ScopedNodeEntities,
    private usedPipes: Set<string>,
    private eagerPipes: Set<string>,
    rawDeferred: DeferBlockScopes,
  ) {
    this.deferredBlocks = rawDeferred.map((current) => current[0]);
    this.deferredScopes = new Map(rawDeferred);
  }

  getEntitiesInScope(node: ScopedNode | null): ReadonlySet<TemplateEntity> {
    return this.scopedNodeEntities.get(node) ?? new Set();
  }

  getDirectivesOfNode(node: DirectiveOwner): DirectiveT[] | null {
    return this.directives.get(node) || null;
  }

  getReferenceTarget(ref: Reference): ReferenceTarget<DirectiveT> | null {
    return this.references.get(ref) || null;
  }

  getConsumerOfBinding(
    binding: BoundAttribute | BoundEvent | TextAttribute,
  ): DirectiveT | Element | Template | null {
    return this.bindings.get(binding) || null;
  }

  getExpressionTarget(expr: AST): TemplateEntity | null {
    return this.exprTargets.get(expr) || null;
  }

  getDefinitionNodeOfSymbol(symbol: TemplateEntity): ScopedNode | null {
    return this.symbols.get(symbol) || null;
  }

  getNestingLevel(node: ScopedNode): number {
    return this.nestingLevel.get(node) || 0;
  }

  getUsedDirectives(): DirectiveT[] {
    const set = new Set<DirectiveT>();
    this.directives.forEach((dirs) => dirs.forEach((dir) => set.add(dir)));
    return Array.from(set.values());
  }

  getEagerlyUsedDirectives(): DirectiveT[] {
    const set = new Set<DirectiveT>(this.eagerDirectives);
    return Array.from(set.values());
  }

  getUsedPipes(): string[] {
    return Array.from(this.usedPipes);
  }

  getEagerlyUsedPipes(): string[] {
    return Array.from(this.eagerPipes);
  }

  getDeferBlocks(): DeferredBlock[] {
    return this.deferredBlocks;
  }

  getDeferredTriggerTarget(block: DeferredBlock, trigger: DeferredTrigger): Element | null {
    // Only triggers that refer to DOM nodes can be resolved.
    if (
      !(trigger instanceof InteractionDeferredTrigger) &&
      !(trigger instanceof ViewportDeferredTrigger) &&
      !(trigger instanceof HoverDeferredTrigger)
    ) {
      return null;
    }

    const name = trigger.reference;

    if (name === null) {
      let target: Element | null = null;

      if (block.placeholder !== null) {
        for (const child of block.placeholder.children) {
          // Skip over comment nodes. Currently by default the template parser doesn't capture
          // comments, but we have a safeguard here just in case since it can be enabled.
          if (child instanceof Comment) {
            continue;
          }

          // We can only infer the trigger if there's one root element node. Any other
          // nodes at the root make it so that we can't infer the trigger anymore.
          if (target !== null) {
            return null;
          }

          if (child instanceof Element) {
            target = child;
          }
        }
      }

      return target;
    }

    const outsideRef = this.findEntityInScope(block, name);

    // First try to resolve the target in the scope of the main deferred block. Note that we
    // skip triggers defined inside the main block itself, because they might not exist yet.
    if (outsideRef instanceof Reference && this.getDefinitionNodeOfSymbol(outsideRef) !== block) {
      const target = this.getReferenceTarget(outsideRef);

      if (target !== null) {
        return this.referenceTargetToElement(target);
      }
    }

    // If the trigger couldn't be found in the main block, check the
    // placeholder block which is shown before the main block has loaded.
    if (block.placeholder !== null) {
      const refInPlaceholder = this.findEntityInScope(block.placeholder, name);
      const targetInPlaceholder =
        refInPlaceholder instanceof Reference ? this.getReferenceTarget(refInPlaceholder) : null;

      if (targetInPlaceholder !== null) {
        return this.referenceTargetToElement(targetInPlaceholder);
      }
    }

    return null;
  }

  isDeferred(element: Element): boolean {
    for (const block of this.deferredBlocks) {
      if (!this.deferredScopes.has(block)) {
        continue;
      }

      const stack: Scope[] = [this.deferredScopes.get(block)!];

      while (stack.length > 0) {
        const current = stack.pop()!;

        if (current.elementLikeInScope.has(element)) {
          return true;
        }

        stack.push(...current.childScopes.values());
      }
    }

    return false;
  }

  referencedDirectiveExists(name: string): boolean {
    return !this.missingDirectives.has(name);
  }

  /**
   * Finds an entity with a specific name in a scope.
   * @param rootNode Root node of the scope.
   * @param name Name of the entity.
   */
  private findEntityInScope(rootNode: ScopedNode, name: string): TemplateEntity | null {
    const entities = this.getEntitiesInScope(rootNode);

    for (const entity of entities) {
      if (entity.name === name) {
        return entity;
      }
    }

    return null;
  }

  /** Coerces a `ReferenceTarget` to an `Element`, if possible. */
  private referenceTargetToElement(target: ReferenceTarget<DirectiveT>): Element | null {
    if (target instanceof Element) {
      return target;
    }

    if (
      target instanceof Template ||
      target.node instanceof Component ||
      target.node instanceof Directive
    ) {
      return null;
    }

    return this.referenceTargetToElement(target.node);
  }
}

function extractScopedNodeEntities(rootScope: Scope, templateEntities: ScopedNodeEntities): void {
  const entityMap = new Map<ScopedNode | null, Map<string, TemplateEntity>>();

  function extractScopeEntities(scope: Scope): Map<string, TemplateEntity> {
    if (entityMap.has(scope.rootNode)) {
      return entityMap.get(scope.rootNode)!;
    }

    const currentEntities = scope.namedEntities;

    let entities: Map<string, TemplateEntity>;
    if (scope.parentScope !== null) {
      entities = new Map([...extractScopeEntities(scope.parentScope), ...currentEntities]);
    } else {
      entities = new Map(currentEntities);
    }

    entityMap.set(scope.rootNode, entities);
    return entities;
  }

  const scopesToProcess: Scope[] = [rootScope];
  while (scopesToProcess.length > 0) {
    const scope = scopesToProcess.pop()!;
    for (const childScope of scope.childScopes.values()) {
      scopesToProcess.push(childScope);
    }
    extractScopeEntities(scope);
  }

  for (const [template, entities] of entityMap) {
    templateEntities.set(template, new Set(entities.values()));
  }
}
