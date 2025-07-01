/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool} from '../../../constant_pool';
import {SecurityContext} from '../../../core';
import * as e from '../../../expression_parser/ast';
import * as i18n from '../../../i18n/i18n_ast';
import {splitNsName} from '../../../ml_parser/tags';
import * as o from '../../../output/output_ast';
import {ParseSourceSpan} from '../../../parse_util';
import * as t from '../../../render3/r3_ast';
import {DeferBlockDepsEmitMode, R3ComponentDeferMetadata} from '../../../render3/view/api';
import {icuFromI18nMessage} from '../../../render3/view/i18n/util';
import {DomElementSchemaRegistry} from '../../../schema/dom_element_schema_registry';
import {BindingParser} from '../../../template_parser/binding_parser';
import * as ir from '../ir';

import {
  TemplateCompilationMode,
  CompilationUnit,
  ComponentCompilationJob,
  HostBindingCompilationJob,
  type CompilationJob,
  type ViewCompilationUnit,
} from './compilation';
import {BINARY_OPERATORS, namespaceForKey, prefixWithNamespace} from './conversion';

const compatibilityMode = ir.CompatibilityMode.TemplateDefinitionBuilder;

// Schema containing DOM elements and their properties.
const domSchema = new DomElementSchemaRegistry();

// Tag name of the `ng-template` element.
const NG_TEMPLATE_TAG_NAME = 'ng-template';

export function isI18nRootNode(meta?: i18n.I18nMeta): meta is i18n.Message {
  return meta instanceof i18n.Message;
}

export function isSingleI18nIcu(meta?: i18n.I18nMeta): meta is i18n.I18nMeta & {nodes: [i18n.Icu]} {
  return isI18nRootNode(meta) && meta.nodes.length === 1 && meta.nodes[0] instanceof i18n.Icu;
}

/**
 * Process a template AST and convert it into a `ComponentCompilation` in the intermediate
 * representation.
 * TODO: Refactor more of the ingestion code into phases.
 */
export function ingestComponent(
  componentName: string,
  template: t.Node[],
  constantPool: ConstantPool,
  compilationMode: TemplateCompilationMode,
  relativeContextFilePath: string,
  i18nUseExternalIds: boolean,
  deferMeta: R3ComponentDeferMetadata,
  allDeferrableDepsFn: o.ReadVarExpr | null,
  relativeTemplatePath: string | null,
  enableDebugLocations: boolean,
): ComponentCompilationJob {
  const job = new ComponentCompilationJob(
    componentName,
    constantPool,
    compatibilityMode,
    compilationMode,
    relativeContextFilePath,
    i18nUseExternalIds,
    deferMeta,
    allDeferrableDepsFn,
    relativeTemplatePath,
    enableDebugLocations,
  );
  ingestNodes(job.root, template);
  return job;
}

export interface HostBindingInput {
  componentName: string;
  componentSelector: string;
  properties: e.ParsedProperty[] | null;
  attributes: {[key: string]: o.Expression};
  events: e.ParsedEvent[] | null;
}

/**
 * Process a host binding AST and convert it into a `HostBindingCompilationJob` in the intermediate
 * representation.
 */
export function ingestHostBinding(
  input: HostBindingInput,
  bindingParser: BindingParser,
  constantPool: ConstantPool,
): HostBindingCompilationJob {
  const job = new HostBindingCompilationJob(
    input.componentName,
    constantPool,
    compatibilityMode,
    TemplateCompilationMode.DomOnly,
  );
  for (const property of input.properties ?? []) {
    let bindingKind = ir.BindingKind.Property;
    // TODO: this should really be handled in the parser.
    if (property.name.startsWith('attr.')) {
      property.name = property.name.substring('attr.'.length);
      bindingKind = ir.BindingKind.Attribute;
    }
    if (property.isLegacyAnimation) {
      bindingKind = ir.BindingKind.LegacyAnimation;
    }
    const securityContexts = bindingParser
      .calcPossibleSecurityContexts(
        input.componentSelector,
        property.name,
        bindingKind === ir.BindingKind.Attribute,
      )
      .filter((context) => context !== SecurityContext.NONE);
    ingestDomProperty(job, property, bindingKind, securityContexts);
  }
  for (const [name, expr] of Object.entries(input.attributes) ?? []) {
    const securityContexts = bindingParser
      .calcPossibleSecurityContexts(input.componentSelector, name, true)
      .filter((context) => context !== SecurityContext.NONE);
    ingestHostAttribute(job, name, expr, securityContexts);
  }
  for (const event of input.events ?? []) {
    ingestHostEvent(job, event);
  }
  return job;
}

// TODO: We should refactor the parser to use the same types and structures for host bindings as
// with ordinary components. This would allow us to share a lot more ingestion code.
export function ingestDomProperty(
  job: HostBindingCompilationJob,
  property: e.ParsedProperty,
  bindingKind: ir.BindingKind,
  securityContexts: SecurityContext[],
): void {
  let expression: o.Expression | ir.Interpolation;
  const ast = property.expression.ast;
  if (ast instanceof e.Interpolation) {
    expression = new ir.Interpolation(
      ast.strings,
      ast.expressions.map((expr) => convertAst(expr, job, property.sourceSpan)),
      [],
    );
  } else {
    expression = convertAst(ast, job, property.sourceSpan);
  }
  job.root.update.push(
    ir.createBindingOp(
      job.root.xref,
      bindingKind,
      property.name,
      expression,
      null,
      securityContexts,
      false,
      false,
      null,
      /* TODO: How do Host bindings handle i18n attrs? */ null,
      property.sourceSpan,
    ),
  );
}

export function ingestHostAttribute(
  job: HostBindingCompilationJob,
  name: string,
  value: o.Expression,
  securityContexts: SecurityContext[],
): void {
  const attrBinding = ir.createBindingOp(
    job.root.xref,
    ir.BindingKind.Attribute,
    name,
    value,
    null,
    securityContexts,
    /* Host attributes should always be extracted to const hostAttrs, even if they are not
     *strictly* text literals */
    true,
    false,
    null,
    /* TODO */ null,
    /** TODO: May be null? */ value.sourceSpan!,
  );
  job.root.update.push(attrBinding);
}

export function ingestHostEvent(job: HostBindingCompilationJob, event: e.ParsedEvent) {
  const [phase, target] =
    event.type !== e.ParsedEventType.LegacyAnimation
      ? [null, event.targetOrPhase]
      : [event.targetOrPhase, null];
  const eventBinding = ir.createListenerOp(
    job.root.xref,
    new ir.SlotHandle(),
    event.name,
    null,
    makeListenerHandlerOps(job.root, event.handler, event.handlerSpan),
    phase,
    target,
    true,
    event.sourceSpan,
  );
  job.root.create.push(eventBinding);
}

/**
 * Ingest the nodes of a template AST into the given `ViewCompilation`.
 */
function ingestNodes(unit: ViewCompilationUnit, template: t.Node[]): void {
  for (const node of template) {
    if (node instanceof t.Element) {
      ingestElement(unit, node);
    } else if (node instanceof t.Template) {
      ingestTemplate(unit, node);
    } else if (node instanceof t.Content) {
      ingestContent(unit, node);
    } else if (node instanceof t.Text) {
      ingestText(unit, node, null);
    } else if (node instanceof t.BoundText) {
      ingestBoundText(unit, node, null);
    } else if (node instanceof t.IfBlock) {
      ingestIfBlock(unit, node);
    } else if (node instanceof t.SwitchBlock) {
      ingestSwitchBlock(unit, node);
    } else if (node instanceof t.DeferredBlock) {
      ingestDeferBlock(unit, node);
    } else if (node instanceof t.Icu) {
      ingestIcu(unit, node);
    } else if (node instanceof t.ForLoopBlock) {
      ingestForBlock(unit, node);
    } else if (node instanceof t.LetDeclaration) {
      ingestLetDeclaration(unit, node);
    } else if (node instanceof t.Component) {
      // TODO(crisbeto): account for selectorless nodes.
    } else {
      throw new Error(`Unsupported template node: ${node.constructor.name}`);
    }
  }
}

/**
 * Ingest an element AST from the template into the given `ViewCompilation`.
 */
function ingestElement(unit: ViewCompilationUnit, element: t.Element): void {
  if (
    element.i18n !== undefined &&
    !(element.i18n instanceof i18n.Message || element.i18n instanceof i18n.TagPlaceholder)
  ) {
    throw Error(`Unhandled i18n metadata type for element: ${element.i18n.constructor.name}`);
  }

  const id = unit.job.allocateXrefId();

  const [namespaceKey, elementName] = splitNsName(element.name);

  const startOp = ir.createElementStartOp(
    elementName,
    id,
    namespaceForKey(namespaceKey),
    element.i18n instanceof i18n.TagPlaceholder ? element.i18n : undefined,
    element.startSourceSpan,
    element.sourceSpan,
  );
  unit.create.push(startOp);

  ingestElementBindings(unit, startOp, element);
  ingestReferences(startOp, element);

  // Start i18n, if needed, goes after the element create and bindings, but before the nodes
  let i18nBlockId: ir.XrefId | null = null;
  if (element.i18n instanceof i18n.Message) {
    i18nBlockId = unit.job.allocateXrefId();
    unit.create.push(
      ir.createI18nStartOp(i18nBlockId, element.i18n, undefined, element.startSourceSpan),
    );
  }

  ingestNodes(unit, element.children);

  // The source span for the end op is typically the element closing tag. However, if no closing tag
  // exists, such as in `<input>`, we use the start source span instead. Usually the start and end
  // instructions will be collapsed into one `element` instruction, negating the purpose of this
  // fallback, but in cases when it is not collapsed (such as an input with a binding), we still
  // want to map the end instruction to the main element.
  const endOp = ir.createElementEndOp(id, element.endSourceSpan ?? element.startSourceSpan);
  unit.create.push(endOp);

  // If there is an i18n message associated with this element, insert i18n start and end ops.
  if (i18nBlockId !== null) {
    ir.OpList.insertBefore<ir.CreateOp>(
      ir.createI18nEndOp(i18nBlockId, element.endSourceSpan ?? element.startSourceSpan),
      endOp,
    );
  }
}

/**
 * Ingest an `ng-template` node from the AST into the given `ViewCompilation`.
 */
function ingestTemplate(unit: ViewCompilationUnit, tmpl: t.Template): void {
  if (
    tmpl.i18n !== undefined &&
    !(tmpl.i18n instanceof i18n.Message || tmpl.i18n instanceof i18n.TagPlaceholder)
  ) {
    throw Error(`Unhandled i18n metadata type for template: ${tmpl.i18n.constructor.name}`);
  }

  const childView = unit.job.allocateView(unit.xref);

  let tagNameWithoutNamespace = tmpl.tagName;
  let namespacePrefix: string | null = '';
  if (tmpl.tagName) {
    [namespacePrefix, tagNameWithoutNamespace] = splitNsName(tmpl.tagName);
  }

  const i18nPlaceholder = tmpl.i18n instanceof i18n.TagPlaceholder ? tmpl.i18n : undefined;
  const namespace = namespaceForKey(namespacePrefix);
  const functionNameSuffix =
    tagNameWithoutNamespace === null ? '' : prefixWithNamespace(tagNameWithoutNamespace, namespace);
  const templateKind = isPlainTemplate(tmpl)
    ? ir.TemplateKind.NgTemplate
    : ir.TemplateKind.Structural;
  const templateOp = ir.createTemplateOp(
    childView.xref,
    templateKind,
    tagNameWithoutNamespace,
    functionNameSuffix,
    namespace,
    i18nPlaceholder,
    tmpl.startSourceSpan,
    tmpl.sourceSpan,
  );
  unit.create.push(templateOp);

  ingestTemplateBindings(unit, templateOp, tmpl, templateKind);
  ingestReferences(templateOp, tmpl);
  ingestNodes(childView, tmpl.children);

  for (const {name, value} of tmpl.variables) {
    childView.contextVariables.set(name, value !== '' ? value : '$implicit');
  }

  // If this is a plain template and there is an i18n message associated with it, insert i18n start
  // and end ops. For structural directive templates, the i18n ops will be added when ingesting the
  // element/template the directive is placed on.
  if (templateKind === ir.TemplateKind.NgTemplate && tmpl.i18n instanceof i18n.Message) {
    const id = unit.job.allocateXrefId();
    ir.OpList.insertAfter(
      ir.createI18nStartOp(id, tmpl.i18n, undefined, tmpl.startSourceSpan),
      childView.create.head,
    );
    ir.OpList.insertBefore(
      ir.createI18nEndOp(id, tmpl.endSourceSpan ?? tmpl.startSourceSpan),
      childView.create.tail,
    );
  }
}

/**
 * Ingest a content node from the AST into the given `ViewCompilation`.
 */
function ingestContent(unit: ViewCompilationUnit, content: t.Content): void {
  if (content.i18n !== undefined && !(content.i18n instanceof i18n.TagPlaceholder)) {
    throw Error(`Unhandled i18n metadata type for element: ${content.i18n.constructor.name}`);
  }

  let fallbackView: ViewCompilationUnit | null = null;

  // Don't capture default content that's only made up of empty text nodes and comments.
  // Note that we process the default content before the projection in order to match the
  // insertion order at runtime.
  if (
    content.children.some(
      (child) =>
        !(child instanceof t.Comment) &&
        (!(child instanceof t.Text) || child.value.trim().length > 0),
    )
  ) {
    fallbackView = unit.job.allocateView(unit.xref);
    ingestNodes(fallbackView, content.children);
  }

  const id = unit.job.allocateXrefId();
  const op = ir.createProjectionOp(
    id,
    content.selector,
    content.i18n,
    fallbackView?.xref ?? null,
    content.sourceSpan,
  );
  for (const attr of content.attributes) {
    const securityContext = domSchema.securityContext(content.name, attr.name, true);
    unit.update.push(
      ir.createBindingOp(
        op.xref,
        ir.BindingKind.Attribute,
        attr.name,
        o.literal(attr.value),
        null,
        securityContext,
        true,
        false,
        null,
        asMessage(attr.i18n),
        attr.sourceSpan,
      ),
    );
  }
  unit.create.push(op);
}

/**
 * Ingest a literal text node from the AST into the given `ViewCompilation`.
 */
function ingestText(unit: ViewCompilationUnit, text: t.Text, icuPlaceholder: string | null): void {
  unit.create.push(
    ir.createTextOp(unit.job.allocateXrefId(), text.value, icuPlaceholder, text.sourceSpan),
  );
}

/**
 * Ingest an interpolated text node from the AST into the given `ViewCompilation`.
 */
function ingestBoundText(
  unit: ViewCompilationUnit,
  text: t.BoundText,
  icuPlaceholder: string | null,
): void {
  let value = text.value;
  if (value instanceof e.ASTWithSource) {
    value = value.ast;
  }
  if (!(value instanceof e.Interpolation)) {
    throw new Error(
      `AssertionError: expected Interpolation for BoundText node, got ${value.constructor.name}`,
    );
  }
  if (text.i18n !== undefined && !(text.i18n instanceof i18n.Container)) {
    throw Error(
      `Unhandled i18n metadata type for text interpolation: ${text.i18n?.constructor.name}`,
    );
  }

  const i18nPlaceholders =
    text.i18n instanceof i18n.Container
      ? text.i18n.children
          .filter((node): node is i18n.Placeholder => node instanceof i18n.Placeholder)
          .map((placeholder) => placeholder.name)
      : [];
  if (i18nPlaceholders.length > 0 && i18nPlaceholders.length !== value.expressions.length) {
    throw Error(
      `Unexpected number of i18n placeholders (${value.expressions.length}) for BoundText with ${value.expressions.length} expressions`,
    );
  }

  const textXref = unit.job.allocateXrefId();
  unit.create.push(ir.createTextOp(textXref, '', icuPlaceholder, text.sourceSpan));
  // TemplateDefinitionBuilder does not generate source maps for sub-expressions inside an
  // interpolation. We copy that behavior in compatibility mode.
  // TODO: is it actually correct to generate these extra maps in modern mode?
  const baseSourceSpan = unit.job.compatibility ? null : text.sourceSpan;
  unit.update.push(
    ir.createInterpolateTextOp(
      textXref,
      new ir.Interpolation(
        value.strings,
        value.expressions.map((expr) => convertAst(expr, unit.job, baseSourceSpan)),
        i18nPlaceholders,
      ),
      text.sourceSpan,
    ),
  );
}

/**
 * Ingest an `@if` block into the given `ViewCompilation`.
 */
function ingestIfBlock(unit: ViewCompilationUnit, ifBlock: t.IfBlock): void {
  let firstXref: ir.XrefId | null = null;
  let conditions: Array<ir.ConditionalCaseExpr> = [];
  for (let i = 0; i < ifBlock.branches.length; i++) {
    const ifCase = ifBlock.branches[i];
    const cView = unit.job.allocateView(unit.xref);
    const tagName = ingestControlFlowInsertionPoint(unit, cView.xref, ifCase);

    if (ifCase.expressionAlias !== null) {
      cView.contextVariables.set(ifCase.expressionAlias.name, ir.CTX_REF);
    }

    let ifCaseI18nMeta: i18n.BlockPlaceholder | undefined = undefined;
    if (ifCase.i18n !== undefined) {
      if (!(ifCase.i18n instanceof i18n.BlockPlaceholder)) {
        throw Error(`Unhandled i18n metadata type for if block: ${ifCase.i18n?.constructor.name}`);
      }
      ifCaseI18nMeta = ifCase.i18n;
    }

    const createOp = i === 0 ? ir.createConditionalCreateOp : ir.createConditionalBranchCreateOp;

    const conditionalCreateOp = createOp(
      cView.xref,
      ir.TemplateKind.Block,
      tagName,
      'Conditional',
      ir.Namespace.HTML,
      ifCaseI18nMeta,
      ifCase.startSourceSpan,
      ifCase.sourceSpan,
    );
    unit.create.push(conditionalCreateOp);

    if (firstXref === null) {
      firstXref = cView.xref;
    }

    const caseExpr = ifCase.expression ? convertAst(ifCase.expression, unit.job, null) : null;
    const conditionalCaseExpr = new ir.ConditionalCaseExpr(
      caseExpr,
      conditionalCreateOp.xref,
      conditionalCreateOp.handle,
      ifCase.expressionAlias,
    );
    conditions.push(conditionalCaseExpr);
    ingestNodes(cView, ifCase.children);
  }
  unit.update.push(ir.createConditionalOp(firstXref!, null, conditions, ifBlock.sourceSpan));
}

/**
 * Ingest an `@switch` block into the given `ViewCompilation`.
 */
function ingestSwitchBlock(unit: ViewCompilationUnit, switchBlock: t.SwitchBlock): void {
  // Don't ingest empty switches since they won't render anything.
  if (switchBlock.cases.length === 0) {
    return;
  }

  let firstXref: ir.XrefId | null = null;
  let conditions: Array<ir.ConditionalCaseExpr> = [];
  for (let i = 0; i < switchBlock.cases.length; i++) {
    const switchCase = switchBlock.cases[i];
    const cView = unit.job.allocateView(unit.xref);
    const tagName = ingestControlFlowInsertionPoint(unit, cView.xref, switchCase);
    let switchCaseI18nMeta: i18n.BlockPlaceholder | undefined = undefined;
    if (switchCase.i18n !== undefined) {
      if (!(switchCase.i18n instanceof i18n.BlockPlaceholder)) {
        throw Error(
          `Unhandled i18n metadata type for switch block: ${switchCase.i18n?.constructor.name}`,
        );
      }
      switchCaseI18nMeta = switchCase.i18n;
    }

    const createOp = i === 0 ? ir.createConditionalCreateOp : ir.createConditionalBranchCreateOp;

    const conditionalCreateOp = createOp(
      cView.xref,
      ir.TemplateKind.Block,
      tagName,
      'Case',
      ir.Namespace.HTML,
      switchCaseI18nMeta,
      switchCase.startSourceSpan,
      switchCase.sourceSpan,
    );
    unit.create.push(conditionalCreateOp);

    if (firstXref === null) {
      firstXref = cView.xref;
    }
    const caseExpr = switchCase.expression
      ? convertAst(switchCase.expression, unit.job, switchBlock.startSourceSpan)
      : null;
    const conditionalCaseExpr = new ir.ConditionalCaseExpr(
      caseExpr,
      conditionalCreateOp.xref,
      conditionalCreateOp.handle,
    );
    conditions.push(conditionalCaseExpr);
    ingestNodes(cView, switchCase.children);
  }
  unit.update.push(
    ir.createConditionalOp(
      firstXref!,
      convertAst(switchBlock.expression, unit.job, null),
      conditions,
      switchBlock.sourceSpan,
    ),
  );
}

function ingestDeferView(
  unit: ViewCompilationUnit,
  suffix: string,
  i18nMeta: i18n.I18nMeta | undefined,
  children?: t.Node[],
  sourceSpan?: ParseSourceSpan,
): ir.TemplateOp | null {
  if (i18nMeta !== undefined && !(i18nMeta instanceof i18n.BlockPlaceholder)) {
    throw Error('Unhandled i18n metadata type for defer block');
  }
  if (children === undefined) {
    return null;
  }
  const secondaryView = unit.job.allocateView(unit.xref);
  ingestNodes(secondaryView, children);
  const templateOp = ir.createTemplateOp(
    secondaryView.xref,
    ir.TemplateKind.Block,
    null,
    `Defer${suffix}`,
    ir.Namespace.HTML,
    i18nMeta,
    sourceSpan!,
    sourceSpan!,
  );
  unit.create.push(templateOp);
  return templateOp;
}

function ingestDeferBlock(unit: ViewCompilationUnit, deferBlock: t.DeferredBlock): void {
  let ownResolverFn: o.Expression | null = null;

  if (unit.job.deferMeta.mode === DeferBlockDepsEmitMode.PerBlock) {
    if (!unit.job.deferMeta.blocks.has(deferBlock)) {
      throw new Error(
        `AssertionError: unable to find a dependency function for this deferred block`,
      );
    }
    ownResolverFn = unit.job.deferMeta.blocks.get(deferBlock) ?? null;
  }

  // Generate the defer main view and all secondary views.
  const main = ingestDeferView(
    unit,
    '',
    deferBlock.i18n,
    deferBlock.children,
    deferBlock.sourceSpan,
  )!;
  const loading = ingestDeferView(
    unit,
    'Loading',
    deferBlock.loading?.i18n,
    deferBlock.loading?.children,
    deferBlock.loading?.sourceSpan,
  );
  const placeholder = ingestDeferView(
    unit,
    'Placeholder',
    deferBlock.placeholder?.i18n,
    deferBlock.placeholder?.children,
    deferBlock.placeholder?.sourceSpan,
  );
  const error = ingestDeferView(
    unit,
    'Error',
    deferBlock.error?.i18n,
    deferBlock.error?.children,
    deferBlock.error?.sourceSpan,
  );

  // Create the main defer op, and ops for all secondary views.
  const deferXref = unit.job.allocateXrefId();
  const deferOp = ir.createDeferOp(
    deferXref,
    main.xref,
    main.handle,
    ownResolverFn,
    unit.job.allDeferrableDepsFn,
    deferBlock.sourceSpan,
  );
  deferOp.placeholderView = placeholder?.xref ?? null;
  deferOp.placeholderSlot = placeholder?.handle ?? null;
  deferOp.loadingSlot = loading?.handle ?? null;
  deferOp.errorSlot = error?.handle ?? null;
  deferOp.placeholderMinimumTime = deferBlock.placeholder?.minimumTime ?? null;
  deferOp.loadingMinimumTime = deferBlock.loading?.minimumTime ?? null;
  deferOp.loadingAfterTime = deferBlock.loading?.afterTime ?? null;
  deferOp.flags = calcDeferBlockFlags(deferBlock);
  unit.create.push(deferOp);

  // Configure all defer `on` conditions.
  // TODO: refactor prefetch triggers to use a separate op type, with a shared superclass. This will
  // make it easier to refactor prefetch behavior in the future.
  const deferOnOps: ir.DeferOnOp[] = [];
  const deferWhenOps: ir.DeferWhenOp[] = [];

  // Ingest the hydrate triggers first since they set up all the other triggers during SSR.
  ingestDeferTriggers(
    ir.DeferOpModifierKind.HYDRATE,
    deferBlock.hydrateTriggers,
    deferOnOps,
    deferWhenOps,
    unit,
    deferXref,
  );

  ingestDeferTriggers(
    ir.DeferOpModifierKind.NONE,
    deferBlock.triggers,
    deferOnOps,
    deferWhenOps,
    unit,
    deferXref,
  );

  ingestDeferTriggers(
    ir.DeferOpModifierKind.PREFETCH,
    deferBlock.prefetchTriggers,
    deferOnOps,
    deferWhenOps,
    unit,
    deferXref,
  );

  // If no (non-prefetching or hydrating) defer triggers were provided, default to `idle`.
  const hasConcreteTrigger =
    deferOnOps.some((op) => op.modifier === ir.DeferOpModifierKind.NONE) ||
    deferWhenOps.some((op) => op.modifier === ir.DeferOpModifierKind.NONE);

  if (!hasConcreteTrigger) {
    deferOnOps.push(
      ir.createDeferOnOp(
        deferXref,
        {kind: ir.DeferTriggerKind.Idle},
        ir.DeferOpModifierKind.NONE,
        null!,
      ),
    );
  }

  unit.create.push(deferOnOps);
  unit.update.push(deferWhenOps);
}

function calcDeferBlockFlags(deferBlockDetails: t.DeferredBlock): ir.TDeferDetailsFlags | null {
  if (Object.keys(deferBlockDetails.hydrateTriggers).length > 0) {
    return ir.TDeferDetailsFlags.HasHydrateTriggers;
  }
  return null;
}

function ingestDeferTriggers(
  modifier: ir.DeferOpModifierKind,
  triggers: Readonly<t.DeferredBlockTriggers>,
  onOps: ir.DeferOnOp[],
  whenOps: ir.DeferWhenOp[],
  unit: ViewCompilationUnit,
  deferXref: ir.XrefId,
) {
  if (triggers.idle !== undefined) {
    const deferOnOp = ir.createDeferOnOp(
      deferXref,
      {kind: ir.DeferTriggerKind.Idle},
      modifier,
      triggers.idle.sourceSpan,
    );
    onOps.push(deferOnOp);
  }
  if (triggers.immediate !== undefined) {
    const deferOnOp = ir.createDeferOnOp(
      deferXref,
      {kind: ir.DeferTriggerKind.Immediate},
      modifier,
      triggers.immediate.sourceSpan,
    );
    onOps.push(deferOnOp);
  }
  if (triggers.timer !== undefined) {
    const deferOnOp = ir.createDeferOnOp(
      deferXref,
      {kind: ir.DeferTriggerKind.Timer, delay: triggers.timer.delay},
      modifier,
      triggers.timer.sourceSpan,
    );
    onOps.push(deferOnOp);
  }
  if (triggers.hover !== undefined) {
    const deferOnOp = ir.createDeferOnOp(
      deferXref,
      {
        kind: ir.DeferTriggerKind.Hover,
        targetName: triggers.hover.reference,
        targetXref: null,
        targetSlot: null,
        targetView: null,
        targetSlotViewSteps: null,
      },
      modifier,
      triggers.hover.sourceSpan,
    );
    onOps.push(deferOnOp);
  }
  if (triggers.interaction !== undefined) {
    const deferOnOp = ir.createDeferOnOp(
      deferXref,
      {
        kind: ir.DeferTriggerKind.Interaction,
        targetName: triggers.interaction.reference,
        targetXref: null,
        targetSlot: null,
        targetView: null,
        targetSlotViewSteps: null,
      },
      modifier,
      triggers.interaction.sourceSpan,
    );
    onOps.push(deferOnOp);
  }
  if (triggers.viewport !== undefined) {
    const deferOnOp = ir.createDeferOnOp(
      deferXref,
      {
        kind: ir.DeferTriggerKind.Viewport,
        targetName: triggers.viewport.reference,
        targetXref: null,
        targetSlot: null,
        targetView: null,
        targetSlotViewSteps: null,
      },
      modifier,
      triggers.viewport.sourceSpan,
    );
    onOps.push(deferOnOp);
  }
  if (triggers.never !== undefined) {
    const deferOnOp = ir.createDeferOnOp(
      deferXref,
      {kind: ir.DeferTriggerKind.Never},
      modifier,
      triggers.never.sourceSpan,
    );
    onOps.push(deferOnOp);
  }
  if (triggers.when !== undefined) {
    if (triggers.when.value instanceof e.Interpolation) {
      // TemplateDefinitionBuilder supports this case, but it's very strange to me. What would it
      // even mean?
      throw new Error(`Unexpected interpolation in defer block when trigger`);
    }
    const deferOnOp = ir.createDeferWhenOp(
      deferXref,
      convertAst(triggers.when.value, unit.job, triggers.when.sourceSpan),
      modifier,
      triggers.when.sourceSpan,
    );
    whenOps.push(deferOnOp);
  }
}

function ingestIcu(unit: ViewCompilationUnit, icu: t.Icu) {
  if (icu.i18n instanceof i18n.Message && isSingleI18nIcu(icu.i18n)) {
    const xref = unit.job.allocateXrefId();
    unit.create.push(ir.createIcuStartOp(xref, icu.i18n, icuFromI18nMessage(icu.i18n).name, null!));
    for (const [placeholder, text] of Object.entries({...icu.vars, ...icu.placeholders})) {
      if (text instanceof t.BoundText) {
        ingestBoundText(unit, text, placeholder);
      } else {
        ingestText(unit, text, placeholder);
      }
    }
    unit.create.push(ir.createIcuEndOp(xref));
  } else {
    throw Error(`Unhandled i18n metadata type for ICU: ${icu.i18n?.constructor.name}`);
  }
}

/**
 * Ingest an `@for` block into the given `ViewCompilation`.
 */
function ingestForBlock(unit: ViewCompilationUnit, forBlock: t.ForLoopBlock): void {
  const repeaterView = unit.job.allocateView(unit.xref);

  // We copy TemplateDefinitionBuilder's scheme of creating names for `$count` and `$index`
  // that are suffixed with special information, to disambiguate which level of nested loop
  // the below aliases refer to.
  // TODO: We should refactor Template Pipeline's variable phases to gracefully handle
  // shadowing, and arbitrarily many levels of variables depending on each other.
  const indexName = `ɵ$index_${repeaterView.xref}`;
  const countName = `ɵ$count_${repeaterView.xref}`;
  const indexVarNames = new Set<string>();

  // Set all the context variables and aliases available in the repeater.
  repeaterView.contextVariables.set(forBlock.item.name, forBlock.item.value);

  for (const variable of forBlock.contextVariables) {
    if (variable.value === '$index') {
      indexVarNames.add(variable.name);
    }
    if (variable.name === '$index') {
      repeaterView.contextVariables.set('$index', variable.value).set(indexName, variable.value);
    } else if (variable.name === '$count') {
      repeaterView.contextVariables.set('$count', variable.value).set(countName, variable.value);
    } else {
      repeaterView.aliases.add({
        kind: ir.SemanticVariableKind.Alias,
        name: null,
        identifier: variable.name,
        expression: getComputedForLoopVariableExpression(variable, indexName, countName),
      });
    }
  }

  const sourceSpan = convertSourceSpan(forBlock.trackBy.span, forBlock.sourceSpan);
  const track = convertAst(forBlock.trackBy, unit.job, sourceSpan);

  ingestNodes(repeaterView, forBlock.children);

  let emptyView: ViewCompilationUnit | null = null;
  let emptyTagName: string | null = null;
  if (forBlock.empty !== null) {
    emptyView = unit.job.allocateView(unit.xref);
    ingestNodes(emptyView, forBlock.empty.children);
    emptyTagName = ingestControlFlowInsertionPoint(unit, emptyView.xref, forBlock.empty);
  }

  const varNames: ir.RepeaterVarNames = {
    $index: indexVarNames,
    $implicit: forBlock.item.name,
  };

  if (forBlock.i18n !== undefined && !(forBlock.i18n instanceof i18n.BlockPlaceholder)) {
    throw Error('AssertionError: Unhandled i18n metadata type or @for');
  }
  if (
    forBlock.empty?.i18n !== undefined &&
    !(forBlock.empty.i18n instanceof i18n.BlockPlaceholder)
  ) {
    throw Error('AssertionError: Unhandled i18n metadata type or @empty');
  }
  const i18nPlaceholder = forBlock.i18n;
  const emptyI18nPlaceholder = forBlock.empty?.i18n;

  const tagName = ingestControlFlowInsertionPoint(unit, repeaterView.xref, forBlock);
  const repeaterCreate = ir.createRepeaterCreateOp(
    repeaterView.xref,
    emptyView?.xref ?? null,
    tagName,
    track,
    varNames,
    emptyTagName,
    i18nPlaceholder,
    emptyI18nPlaceholder,
    forBlock.startSourceSpan,
    forBlock.sourceSpan,
  );
  unit.create.push(repeaterCreate);

  const expression = convertAst(
    forBlock.expression,
    unit.job,
    convertSourceSpan(forBlock.expression.span, forBlock.sourceSpan),
  );
  const repeater = ir.createRepeaterOp(
    repeaterCreate.xref,
    repeaterCreate.handle,
    expression,
    forBlock.sourceSpan,
  );
  unit.update.push(repeater);
}

/**
 * Gets an expression that represents a variable in an `@for` loop.
 * @param variable AST representing the variable.
 * @param indexName Loop-specific name for `$index`.
 * @param countName Loop-specific name for `$count`.
 */
function getComputedForLoopVariableExpression(
  variable: t.Variable,
  indexName: string,
  countName: string,
): o.Expression {
  switch (variable.value) {
    case '$index':
      return new ir.LexicalReadExpr(indexName);

    case '$count':
      return new ir.LexicalReadExpr(countName);

    case '$first':
      return new ir.LexicalReadExpr(indexName).identical(o.literal(0));

    case '$last':
      return new ir.LexicalReadExpr(indexName).identical(
        new ir.LexicalReadExpr(countName).minus(o.literal(1)),
      );

    case '$even':
      return new ir.LexicalReadExpr(indexName).modulo(o.literal(2)).identical(o.literal(0));

    case '$odd':
      return new ir.LexicalReadExpr(indexName).modulo(o.literal(2)).notIdentical(o.literal(0));

    default:
      throw new Error(`AssertionError: unknown @for loop variable ${variable.value}`);
  }
}

function ingestLetDeclaration(unit: ViewCompilationUnit, node: t.LetDeclaration) {
  const target = unit.job.allocateXrefId();

  unit.create.push(ir.createDeclareLetOp(target, node.name, node.sourceSpan));
  unit.update.push(
    ir.createStoreLetOp(
      target,
      node.name,
      convertAst(node.value, unit.job, node.valueSpan),
      node.sourceSpan,
    ),
  );
}

/**
 * Convert a template AST expression into an output AST expression.
 */
function convertAst(
  ast: e.AST,
  job: CompilationJob,
  baseSourceSpan: ParseSourceSpan | null,
): o.Expression {
  if (ast instanceof e.ASTWithSource) {
    return convertAst(ast.ast, job, baseSourceSpan);
  } else if (ast instanceof e.PropertyRead) {
    // Whether this is an implicit receiver, *excluding* explicit reads of `this`.
    const isImplicitReceiver =
      ast.receiver instanceof e.ImplicitReceiver && !(ast.receiver instanceof e.ThisReceiver);
    if (isImplicitReceiver) {
      return new ir.LexicalReadExpr(ast.name);
    } else {
      return new o.ReadPropExpr(
        convertAst(ast.receiver, job, baseSourceSpan),
        ast.name,
        null,
        convertSourceSpan(ast.span, baseSourceSpan),
      );
    }
  } else if (ast instanceof e.Call) {
    if (ast.receiver instanceof e.ImplicitReceiver) {
      throw new Error(`Unexpected ImplicitReceiver`);
    } else {
      return new o.InvokeFunctionExpr(
        convertAst(ast.receiver, job, baseSourceSpan),
        ast.args.map((arg) => convertAst(arg, job, baseSourceSpan)),
        undefined,
        convertSourceSpan(ast.span, baseSourceSpan),
      );
    }
  } else if (ast instanceof e.LiteralPrimitive) {
    return o.literal(ast.value, undefined, convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.Unary) {
    switch (ast.operator) {
      case '+':
        return new o.UnaryOperatorExpr(
          o.UnaryOperator.Plus,
          convertAst(ast.expr, job, baseSourceSpan),
          undefined,
          convertSourceSpan(ast.span, baseSourceSpan),
        );
      case '-':
        return new o.UnaryOperatorExpr(
          o.UnaryOperator.Minus,
          convertAst(ast.expr, job, baseSourceSpan),
          undefined,
          convertSourceSpan(ast.span, baseSourceSpan),
        );
      default:
        throw new Error(`AssertionError: unknown unary operator ${ast.operator}`);
    }
  } else if (ast instanceof e.Binary) {
    const operator = BINARY_OPERATORS.get(ast.operation);
    if (operator === undefined) {
      throw new Error(`AssertionError: unknown binary operator ${ast.operation}`);
    }
    return new o.BinaryOperatorExpr(
      operator,
      convertAst(ast.left, job, baseSourceSpan),
      convertAst(ast.right, job, baseSourceSpan),
      undefined,
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else if (ast instanceof e.ThisReceiver) {
    // TODO: should context expressions have source maps?
    return new ir.ContextExpr(job.root.xref);
  } else if (ast instanceof e.KeyedRead) {
    return new o.ReadKeyExpr(
      convertAst(ast.receiver, job, baseSourceSpan),
      convertAst(ast.key, job, baseSourceSpan),
      undefined,
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else if (ast instanceof e.Chain) {
    throw new Error(`AssertionError: Chain in unknown context`);
  } else if (ast instanceof e.LiteralMap) {
    const entries = ast.keys.map((key, idx) => {
      const value = ast.values[idx];
      // TODO: should literals have source maps, or do we just map the whole surrounding
      // expression?
      return new o.LiteralMapEntry(key.key, convertAst(value, job, baseSourceSpan), key.quoted);
    });
    return new o.LiteralMapExpr(entries, undefined, convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.LiteralArray) {
    // TODO: should literals have source maps, or do we just map the whole surrounding expression?
    return new o.LiteralArrayExpr(
      ast.expressions.map((expr) => convertAst(expr, job, baseSourceSpan)),
    );
  } else if (ast instanceof e.Conditional) {
    return new o.ConditionalExpr(
      convertAst(ast.condition, job, baseSourceSpan),
      convertAst(ast.trueExp, job, baseSourceSpan),
      convertAst(ast.falseExp, job, baseSourceSpan),
      undefined,
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else if (ast instanceof e.NonNullAssert) {
    // A non-null assertion shouldn't impact generated instructions, so we can just drop it.
    return convertAst(ast.expression, job, baseSourceSpan);
  } else if (ast instanceof e.BindingPipe) {
    // TODO: pipes should probably have source maps; figure out details.
    return new ir.PipeBindingExpr(job.allocateXrefId(), new ir.SlotHandle(), ast.name, [
      convertAst(ast.exp, job, baseSourceSpan),
      ...ast.args.map((arg) => convertAst(arg, job, baseSourceSpan)),
    ]);
  } else if (ast instanceof e.SafeKeyedRead) {
    return new ir.SafeKeyedReadExpr(
      convertAst(ast.receiver, job, baseSourceSpan),
      convertAst(ast.key, job, baseSourceSpan),
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else if (ast instanceof e.SafePropertyRead) {
    // TODO: source span
    return new ir.SafePropertyReadExpr(convertAst(ast.receiver, job, baseSourceSpan), ast.name);
  } else if (ast instanceof e.SafeCall) {
    // TODO: source span
    return new ir.SafeInvokeFunctionExpr(
      convertAst(ast.receiver, job, baseSourceSpan),
      ast.args.map((a) => convertAst(a, job, baseSourceSpan)),
    );
  } else if (ast instanceof e.EmptyExpr) {
    return new ir.EmptyExpr(convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.PrefixNot) {
    return o.not(
      convertAst(ast.expression, job, baseSourceSpan),
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else if (ast instanceof e.TypeofExpression) {
    return o.typeofExpr(convertAst(ast.expression, job, baseSourceSpan));
  } else if (ast instanceof e.VoidExpression) {
    return new o.VoidExpr(
      convertAst(ast.expression, job, baseSourceSpan),
      undefined,
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else if (ast instanceof e.TemplateLiteral) {
    return convertTemplateLiteral(ast, job, baseSourceSpan);
  } else if (ast instanceof e.TaggedTemplateLiteral) {
    return new o.TaggedTemplateLiteralExpr(
      convertAst(ast.tag, job, baseSourceSpan),
      convertTemplateLiteral(ast.template, job, baseSourceSpan),
      undefined,
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else if (ast instanceof e.ParenthesizedExpression) {
    return new o.ParenthesizedExpr(
      convertAst(ast.expression, job, baseSourceSpan),
      undefined,
      convertSourceSpan(ast.span, baseSourceSpan),
    );
  } else {
    throw new Error(
      `Unhandled expression type "${ast.constructor.name}" in file "${baseSourceSpan?.start.file.url}"`,
    );
  }
}

function convertTemplateLiteral(
  ast: e.TemplateLiteral,
  job: CompilationJob,
  baseSourceSpan: ParseSourceSpan | null,
) {
  return new o.TemplateLiteralExpr(
    ast.elements.map((el) => {
      return new o.TemplateLiteralElementExpr(el.text, convertSourceSpan(el.span, baseSourceSpan));
    }),
    ast.expressions.map((expr) => convertAst(expr, job, baseSourceSpan)),
    convertSourceSpan(ast.span, baseSourceSpan),
  );
}

function convertAstWithInterpolation(
  job: CompilationJob,
  value: e.AST | string,
  i18nMeta: i18n.I18nMeta | null | undefined,
  sourceSpan?: ParseSourceSpan,
): o.Expression | ir.Interpolation {
  let expression: o.Expression | ir.Interpolation;
  if (value instanceof e.Interpolation) {
    expression = new ir.Interpolation(
      value.strings,
      value.expressions.map((e) => convertAst(e, job, sourceSpan ?? null)),
      Object.keys(asMessage(i18nMeta)?.placeholders ?? {}),
    );
  } else if (value instanceof e.AST) {
    expression = convertAst(value, job, sourceSpan ?? null);
  } else {
    expression = o.literal(value);
  }
  return expression;
}

// TODO: Can we populate Template binding kinds in ingest?
const BINDING_KINDS = new Map<e.BindingType, ir.BindingKind>([
  [e.BindingType.Property, ir.BindingKind.Property],
  [e.BindingType.TwoWay, ir.BindingKind.TwoWayProperty],
  [e.BindingType.Attribute, ir.BindingKind.Attribute],
  [e.BindingType.Class, ir.BindingKind.ClassName],
  [e.BindingType.Style, ir.BindingKind.StyleProperty],
  [e.BindingType.LegacyAnimation, ir.BindingKind.LegacyAnimation],
]);

/**
 * Checks whether the given template is a plain ng-template (as opposed to another kind of template
 * such as a structural directive template or control flow template). This is checked based on the
 * tagName. We can expect that only plain ng-templates will come through with a tagName of
 * 'ng-template'.
 *
 * Here are some of the cases we expect:
 *
 * | Angular HTML                       | Template tagName   |
 * | ---------------------------------- | ------------------ |
 * | `<ng-template>`                    | 'ng-template'      |
 * | `<div *ngIf="true">`               | 'div'              |
 * | `<svg><ng-template>`               | 'svg:ng-template'  |
 * | `@if (true) {`                     | 'Conditional'      |
 * | `<ng-template *ngIf>` (plain)      | 'ng-template'      |
 * | `<ng-template *ngIf>` (structural) | null               |
 */
function isPlainTemplate(tmpl: t.Template) {
  return splitNsName(tmpl.tagName ?? '')[1] === NG_TEMPLATE_TAG_NAME;
}

/**
 * Ensures that the i18nMeta, if provided, is an i18n.Message.
 */
function asMessage(i18nMeta: i18n.I18nMeta | null | undefined): i18n.Message | null {
  if (i18nMeta == null) {
    return null;
  }
  if (!(i18nMeta instanceof i18n.Message)) {
    throw Error(`Expected i18n meta to be a Message, but got: ${i18nMeta.constructor.name}`);
  }
  return i18nMeta;
}

/**
 * Process all of the bindings on an element in the template AST and convert them to their IR
 * representation.
 */
function ingestElementBindings(
  unit: ViewCompilationUnit,
  op: ir.ElementOpBase,
  element: t.Element,
): void {
  let bindings = new Array<ir.BindingOp | ir.ExtractedAttributeOp | null>();

  let i18nAttributeBindingNames = new Set<string>();

  for (const attr of element.attributes) {
    // Attribute literal bindings, such as `attr.foo="bar"`.
    const securityContext = domSchema.securityContext(element.name, attr.name, true);
    bindings.push(
      ir.createBindingOp(
        op.xref,
        ir.BindingKind.Attribute,
        attr.name,
        convertAstWithInterpolation(unit.job, attr.value, attr.i18n),
        null,
        securityContext,
        true,
        false,
        null,
        asMessage(attr.i18n),
        attr.sourceSpan,
      ),
    );
    if (attr.i18n) {
      i18nAttributeBindingNames.add(attr.name);
    }
  }

  for (const input of element.inputs) {
    if (i18nAttributeBindingNames.has(input.name)) {
      console.error(
        `On component ${unit.job.componentName}, the binding ${input.name} is both an i18n attribute and a property. You may want to remove the property binding. This will become a compilation error in future versions of Angular.`,
      );
    }
    // All dynamic bindings (both attribute and property bindings).
    bindings.push(
      ir.createBindingOp(
        op.xref,
        BINDING_KINDS.get(input.type)!,
        input.name,
        convertAstWithInterpolation(unit.job, astOf(input.value), input.i18n),
        input.unit,
        input.securityContext,
        false,
        false,
        null,
        asMessage(input.i18n) ?? null,
        input.sourceSpan,
      ),
    );
  }

  unit.create.push(
    bindings.filter((b): b is ir.ExtractedAttributeOp => b?.kind === ir.OpKind.ExtractedAttribute),
  );
  unit.update.push(bindings.filter((b): b is ir.BindingOp => b?.kind === ir.OpKind.Binding));

  for (const output of element.outputs) {
    if (output.type === e.ParsedEventType.LegacyAnimation && output.phase === null) {
      throw Error('Animation listener should have a phase');
    }

    if (output.type === e.ParsedEventType.TwoWay) {
      unit.create.push(
        ir.createTwoWayListenerOp(
          op.xref,
          op.handle,
          output.name,
          op.tag,
          makeTwoWayListenerHandlerOps(unit, output.handler, output.handlerSpan),
          output.sourceSpan,
        ),
      );
    } else {
      unit.create.push(
        ir.createListenerOp(
          op.xref,
          op.handle,
          output.name,
          op.tag,
          makeListenerHandlerOps(unit, output.handler, output.handlerSpan),
          output.phase,
          output.target,
          false,
          output.sourceSpan,
        ),
      );
    }
  }

  // If any of the bindings on this element have an i18n message, then an i18n attrs configuration
  // op is also required.
  if (bindings.some((b) => b?.i18nMessage) !== null) {
    unit.create.push(
      ir.createI18nAttributesOp(unit.job.allocateXrefId(), new ir.SlotHandle(), op.xref),
    );
  }
}

/**
 * Process all of the bindings on a template in the template AST and convert them to their IR
 * representation.
 */
function ingestTemplateBindings(
  unit: ViewCompilationUnit,
  op: ir.ElementOpBase,
  template: t.Template,
  templateKind: ir.TemplateKind | null,
): void {
  let bindings = new Array<ir.BindingOp | ir.ExtractedAttributeOp | null>();

  for (const attr of template.templateAttrs) {
    if (attr instanceof t.TextAttribute) {
      const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
      bindings.push(
        createTemplateBinding(
          unit,
          op.xref,
          e.BindingType.Attribute,
          attr.name,
          attr.value,
          null,
          securityContext,
          true,
          templateKind,
          asMessage(attr.i18n),
          attr.sourceSpan,
        ),
      );
    } else {
      bindings.push(
        createTemplateBinding(
          unit,
          op.xref,
          attr.type,
          attr.name,
          astOf(attr.value),
          attr.unit,
          attr.securityContext,
          true,
          templateKind,
          asMessage(attr.i18n),
          attr.sourceSpan,
        ),
      );
    }
  }

  for (const attr of template.attributes) {
    // Attribute literal bindings, such as `attr.foo="bar"`.
    const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
    bindings.push(
      createTemplateBinding(
        unit,
        op.xref,
        e.BindingType.Attribute,
        attr.name,
        attr.value,
        null,
        securityContext,
        false,
        templateKind,
        asMessage(attr.i18n),
        attr.sourceSpan,
      ),
    );
  }

  for (const input of template.inputs) {
    // Dynamic bindings (both attribute and property bindings).
    bindings.push(
      createTemplateBinding(
        unit,
        op.xref,
        input.type,
        input.name,
        astOf(input.value),
        input.unit,
        input.securityContext,
        false,
        templateKind,
        asMessage(input.i18n),
        input.sourceSpan,
      ),
    );
  }

  unit.create.push(
    bindings.filter((b): b is ir.ExtractedAttributeOp => b?.kind === ir.OpKind.ExtractedAttribute),
  );
  unit.update.push(bindings.filter((b): b is ir.BindingOp => b?.kind === ir.OpKind.Binding));

  for (const output of template.outputs) {
    if (output.type === e.ParsedEventType.LegacyAnimation && output.phase === null) {
      throw Error('Animation listener should have a phase');
    }

    if (templateKind === ir.TemplateKind.NgTemplate) {
      if (output.type === e.ParsedEventType.TwoWay) {
        unit.create.push(
          ir.createTwoWayListenerOp(
            op.xref,
            op.handle,
            output.name,
            op.tag,
            makeTwoWayListenerHandlerOps(unit, output.handler, output.handlerSpan),
            output.sourceSpan,
          ),
        );
      } else {
        unit.create.push(
          ir.createListenerOp(
            op.xref,
            op.handle,
            output.name,
            op.tag,
            makeListenerHandlerOps(unit, output.handler, output.handlerSpan),
            output.phase,
            output.target,
            false,
            output.sourceSpan,
          ),
        );
      }
    }
    if (
      templateKind === ir.TemplateKind.Structural &&
      output.type !== e.ParsedEventType.LegacyAnimation
    ) {
      // Animation bindings are excluded from the structural template's const array.
      const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, output.name, false);
      unit.create.push(
        ir.createExtractedAttributeOp(
          op.xref,
          ir.BindingKind.Property,
          null,
          output.name,
          null,
          null,
          null,
          securityContext,
        ),
      );
    }
  }

  // TODO: Perhaps we could do this in a phase? (It likely wouldn't change the slot indices.)
  if (bindings.some((b) => b?.i18nMessage) !== null) {
    unit.create.push(
      ir.createI18nAttributesOp(unit.job.allocateXrefId(), new ir.SlotHandle(), op.xref),
    );
  }
}

/**
 * Helper to ingest an individual binding on a template, either an explicit `ng-template`, or an
 * implicit template created via structural directive.
 *
 * Bindings on templates are *extremely* tricky. I have tried to isolate all of the confusing edge
 * cases into this function, and to comment it well to document the behavior.
 *
 * Some of this behavior is intuitively incorrect, and we should consider changing it in the future.
 *
 * @param view The compilation unit for the view containing the template.
 * @param xref The xref of the template op.
 * @param type The binding type, according to the parser. This is fairly reasonable, e.g. both
 *     dynamic and static attributes have e.BindingType.Attribute.
 * @param name The binding's name.
 * @param value The bindings's value, which will either be an input AST expression, or a string
 *     literal. Note that the input AST expression may or may not be const -- it will only be a
 *     string literal if the parser considered it a text binding.
 * @param unit If the binding has a unit (e.g. `px` for style bindings), then this is the unit.
 * @param securityContext The security context of the binding.
 * @param isStructuralTemplateAttribute Whether this binding actually applies to the structural
 *     ng-template. For example, an `ngFor` would actually apply to the structural template. (Most
 *     bindings on structural elements target the inner element, not the template.)
 * @param templateKind Whether this is an explicit `ng-template` or an implicit template created by
 *     a structural directive. This should never be a block template.
 * @param i18nMessage The i18n metadata for the binding, if any.
 * @param sourceSpan The source span of the binding.
 * @returns An IR binding op, or null if the binding should be skipped.
 */
function createTemplateBinding(
  view: ViewCompilationUnit,
  xref: ir.XrefId,
  type: e.BindingType,
  name: string,
  value: e.AST | string,
  unit: string | null,
  securityContext: SecurityContext,
  isStructuralTemplateAttribute: boolean,
  templateKind: ir.TemplateKind | null,
  i18nMessage: i18n.Message | null,
  sourceSpan: ParseSourceSpan,
): ir.BindingOp | ir.ExtractedAttributeOp | null {
  const isTextBinding = typeof value === 'string';
  // If this is a structural template, then several kinds of bindings should not result in an
  // update instruction.
  if (templateKind === ir.TemplateKind.Structural) {
    if (!isStructuralTemplateAttribute) {
      switch (type) {
        case e.BindingType.Property:
        case e.BindingType.Class:
        case e.BindingType.Style:
          // Because this binding doesn't really target the ng-template, it must be a binding on an
          // inner node of a structural template. We can't skip it entirely, because we still need
          // it on the ng-template's consts (e.g. for the purposes of directive matching). However,
          // we should not generate an update instruction for it.
          return ir.createExtractedAttributeOp(
            xref,
            ir.BindingKind.Property,
            null,
            name,
            null,
            null,
            i18nMessage,
            securityContext,
          );
        case e.BindingType.TwoWay:
          return ir.createExtractedAttributeOp(
            xref,
            ir.BindingKind.TwoWayProperty,
            null,
            name,
            null,
            null,
            i18nMessage,
            securityContext,
          );
      }
    }

    if (
      !isTextBinding &&
      (type === e.BindingType.Attribute || type === e.BindingType.LegacyAnimation)
    ) {
      // Again, this binding doesn't really target the ng-template; it actually targets the element
      // inside the structural template. In the case of non-text attribute or animation bindings,
      // the binding doesn't even show up on the ng-template const array, so we just skip it
      // entirely.
      return null;
    }
  }

  let bindingType = BINDING_KINDS.get(type)!;

  if (templateKind === ir.TemplateKind.NgTemplate) {
    // We know we are dealing with bindings directly on an explicit ng-template.
    // Static attribute bindings should be collected into the const array as k/v pairs. Property
    // bindings should result in a `property` instruction, and `AttributeMarker.Bindings` const
    // entries.
    //
    // The difficulty is with dynamic attribute, style, and class bindings. These don't really make
    // sense on an `ng-template` and should probably be parser errors. However,
    // TemplateDefinitionBuilder generates `property` instructions for them, and so we do that as
    // well.
    //
    // Note that we do have a slight behavior difference with TemplateDefinitionBuilder: although
    // TDB emits `property` instructions for dynamic attributes, styles, and classes, only styles
    // and classes also get const collected into the `AttributeMarker.Bindings` field. Dynamic
    // attribute bindings are missing from the consts entirely. We choose to emit them into the
    // consts field anyway, to avoid creating special cases for something so arcane and nonsensical.
    if (
      type === e.BindingType.Class ||
      type === e.BindingType.Style ||
      (type === e.BindingType.Attribute && !isTextBinding)
    ) {
      // TODO: These cases should be parse errors.
      bindingType = ir.BindingKind.Property;
    }
  }

  return ir.createBindingOp(
    xref,
    bindingType,
    name,
    convertAstWithInterpolation(view.job, value, i18nMessage),
    unit,
    securityContext,
    isTextBinding,
    isStructuralTemplateAttribute,
    templateKind,
    i18nMessage,
    sourceSpan,
  );
}

function makeListenerHandlerOps(
  unit: CompilationUnit,
  handler: e.AST,
  handlerSpan: ParseSourceSpan,
): ir.UpdateOp[] {
  handler = astOf(handler);
  const handlerOps = new Array<ir.UpdateOp>();
  let handlerExprs: e.AST[] = handler instanceof e.Chain ? handler.expressions : [handler];
  if (handlerExprs.length === 0) {
    throw new Error('Expected listener to have non-empty expression list.');
  }
  const expressions = handlerExprs.map((expr) => convertAst(expr, unit.job, handlerSpan));
  const returnExpr = expressions.pop()!;
  handlerOps.push(
    ...expressions.map((e) =>
      ir.createStatementOp<ir.UpdateOp>(new o.ExpressionStatement(e, e.sourceSpan)),
    ),
  );
  handlerOps.push(ir.createStatementOp(new o.ReturnStatement(returnExpr, returnExpr.sourceSpan)));
  return handlerOps;
}

function makeTwoWayListenerHandlerOps(
  unit: CompilationUnit,
  handler: e.AST,
  handlerSpan: ParseSourceSpan,
): ir.UpdateOp[] {
  handler = astOf(handler);
  const handlerOps = new Array<ir.UpdateOp>();

  if (handler instanceof e.Chain) {
    if (handler.expressions.length === 1) {
      handler = handler.expressions[0];
    } else {
      // This is validated during parsing already, but we do it here just in case.
      throw new Error('Expected two-way listener to have a single expression.');
    }
  }

  const handlerExpr = convertAst(handler, unit.job, handlerSpan);
  const eventReference = new ir.LexicalReadExpr('$event');
  const twoWaySetExpr = new ir.TwoWayBindingSetExpr(handlerExpr, eventReference);

  handlerOps.push(ir.createStatementOp<ir.UpdateOp>(new o.ExpressionStatement(twoWaySetExpr)));
  handlerOps.push(ir.createStatementOp(new o.ReturnStatement(eventReference)));
  return handlerOps;
}

function astOf(ast: e.AST | e.ASTWithSource): e.AST {
  return ast instanceof e.ASTWithSource ? ast.ast : ast;
}

/**
 * Process all of the local references on an element-like structure in the template AST and
 * convert them to their IR representation.
 */
function ingestReferences(op: ir.ElementOpBase, element: t.Element | t.Template): void {
  assertIsArray<ir.LocalRef>(op.localRefs);
  for (const {name, value} of element.references) {
    op.localRefs.push({
      name,
      target: value,
    });
  }
}

/**
 * Assert that the given value is an array.
 */
function assertIsArray<T>(value: any): asserts value is Array<T> {
  if (!Array.isArray(value)) {
    throw new Error(`AssertionError: expected an array`);
  }
}

/**
 * Creates an absolute `ParseSourceSpan` from the relative `ParseSpan`.
 *
 * `ParseSpan` objects are relative to the start of the expression.
 * This method converts these to full `ParseSourceSpan` objects that
 * show where the span is within the overall source file.
 *
 * @param span the relative span to convert.
 * @param baseSourceSpan a span corresponding to the base of the expression tree.
 * @returns a `ParseSourceSpan` for the given span or null if no `baseSourceSpan` was provided.
 */
function convertSourceSpan(
  span: e.ParseSpan,
  baseSourceSpan: ParseSourceSpan | null,
): ParseSourceSpan | null {
  if (baseSourceSpan === null) {
    return null;
  }
  const start = baseSourceSpan.start.moveBy(span.start);
  const end = baseSourceSpan.start.moveBy(span.end);
  const fullStart = baseSourceSpan.fullStart.moveBy(span.start);
  return new ParseSourceSpan(start, end, fullStart);
}

/**
 * With the directive-based control flow users were able to conditionally project content using
 * the `*` syntax. E.g. `<div *ngIf="expr" projectMe></div>` will be projected into
 * `<ng-content select="[projectMe]"/>`, because the attributes and tag name from the `div` are
 * copied to the template via the template creation instruction. With `@if` and `@for` that is
 * not the case, because the conditional is placed *around* elements, rather than *on* them.
 * The result is that content projection won't work in the same way if a user converts from
 * `*ngIf` to `@if`.
 *
 * This function aims to cover the most common case by doing the same copying when a control flow
 * node has *one and only one* root element or template node.
 *
 * This approach comes with some caveats:
 * 1. As soon as any other node is added to the root, the copying behavior won't work anymore.
 *    A diagnostic will be added to flag cases like this and to explain how to work around it.
 * 2. If `preserveWhitespaces` is enabled, it's very likely that indentation will break this
 *    workaround, because it'll include an additional text node as the first child. We can work
 *    around it here, but in a discussion it was decided not to, because the user explicitly opted
 *    into preserving the whitespace and we would have to drop it from the generated code.
 *    The diagnostic mentioned point in #1 will flag such cases to users.
 *
 * @returns Tag name to be used for the control flow template.
 */
function ingestControlFlowInsertionPoint(
  unit: ViewCompilationUnit,
  xref: ir.XrefId,
  node: t.IfBlockBranch | t.SwitchBlockCase | t.ForLoopBlock | t.ForLoopBlockEmpty,
): string | null {
  let root: t.Element | t.Template | null = null;

  for (const child of node.children) {
    // Skip over comment nodes and @let declarations since
    // it doesn't matter where they end up in the DOM.
    if (child instanceof t.Comment || child instanceof t.LetDeclaration) {
      continue;
    }

    // We can only infer the tag name/attributes if there's a single root node.
    if (root !== null) {
      return null;
    }

    // Root nodes can only elements or templates with a tag name (e.g. `<div *foo></div>`).
    if (child instanceof t.Element || (child instanceof t.Template && child.tagName !== null)) {
      root = child;
    } else {
      return null;
    }
  }

  // If we've found a single root node, its tag name and attributes can be
  // copied to the surrounding template to be used for content projection.
  if (root !== null) {
    // Collect the static attributes for content projection purposes.
    for (const attr of root.attributes) {
      const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
      unit.update.push(
        ir.createBindingOp(
          xref,
          ir.BindingKind.Attribute,
          attr.name,
          o.literal(attr.value),
          null,
          securityContext,
          true,
          false,
          null,
          asMessage(attr.i18n),
          attr.sourceSpan,
        ),
      );
    }

    // Also collect the inputs since they participate in content projection as well.
    // Note that TDB used to collect the outputs as well, but it wasn't passing them into
    // the template instruction. Here we just don't collect them.
    for (const attr of root.inputs) {
      if (attr.type !== e.BindingType.LegacyAnimation && attr.type !== e.BindingType.Attribute) {
        const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
        unit.create.push(
          ir.createExtractedAttributeOp(
            xref,
            ir.BindingKind.Property,
            null,
            attr.name,
            null,
            null,
            null,
            securityContext,
          ),
        );
      }
    }

    const tagName = root instanceof t.Element ? root.name : root.tagName;

    // Don't pass along `ng-template` tag name since it enables directive matching.
    return tagName === NG_TEMPLATE_TAG_NAME ? null : tagName;
  }

  return null;
}
