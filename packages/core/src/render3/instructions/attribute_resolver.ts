/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InternalInjectFlags} from '../../di/interface/injector';
import {ProviderToken} from '../../di/provider_token';
import {formatRuntimeError, RuntimeError, RuntimeErrorCode} from '../../errors';
import {RendererStyleFlags2} from '../../render/api_flags';
import {unwrapSafeValue} from '../../sanitization/bypass';
import {KeyValueArray} from '../../util/array_utils';
import {EMPTY_ARRAY} from '../../util/empty';
import {
  getAttributeResolverToken,
  callAttributeResolver,
  joinDeclarations,
  joinTokens,
  lastValue,
} from '../attribute_resolver_provider';
import {getOrCreateInjectable, setIncludeViewProviders} from '../di';
import {AttributeMarker} from '../interfaces/attribute_marker';
import {
  AttributeGrammar,
  AttributeResolveEvent,
  AttributeResolver,
  AttributeResolverFlags,
  AttributeResolverFn,
  AttributeResolverSlot,
  AttributeSource,
  AttributeValue,
  ClassBindingValue,
  ClassResolveEvent,
  ClassResolver,
  ResolvedAttribute,
  StyleBindingValue,
  StyleResolveEvent,
  TAttributeBinding,
  TAttributeResolver,
  TAttributeSourceSegment,
  TStaticStyle,
  ɵRESOLVED_CLASSES_BRAND,
} from '../interfaces/attribute_resolver';
import {DirectiveDef} from '../interfaces/definition';
import {TAttributes, TDirectiveHostNode, TNode, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {RElement} from '../interfaces/renderer_dom';
import {TStylingKey} from '../interfaces/styling';
import {LView, OpaqueViewState, RENDERER, TData, TView, TVIEW} from '../interfaces/view';
import {applyStyling} from '../node_manipulation';
import {
  getCurrentDirectiveIndex,
  getCurrentTNode,
  getLView,
  getTView,
  wasLastNodeCreated,
  ɵɵrestoreView,
} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/stringify_utils';
import {getNativeByTNode} from '../util/view_utils';
import {allocExpando} from '../view/construction';

import {enableAttributeResolverHooks} from './attribute_resolver_hook';
import {unwrapImgVideoSrcValue} from './shared';
import {classKeyValueArraySet, classStringParser, toStylingKeyValueArray} from './styling';

/**
 * Registers the handler of a resolver binding, such as `(class)`, `(attr.class)`, or
 * `(attr.role)`, on the current element.
 *
 * @param name Name of the resolved attribute, such as `class`.
 * @param resolverFn Handler compiled from the binding.
 * @param flags `AttributeResolverFlags` of the binding.
 *
 * @codeGenApi
 */
export function ɵɵattributeResolver(
  name: string,
  resolverFn: AttributeResolverFn,
  flags: number,
): typeof ɵɵattributeResolver {
  const lView = getLView<{} | null>();
  const tView = getTView();
  const tNode = getCurrentTNode()!;
  const owner = getCurrentDirectiveIndex();
  if (!(tNode.type & TNodeType.Element)) {
    if (ngDevMode) {
      reportAttributeResolverOnContainer(tView, name, owner, flags);
    }
    return ɵɵattributeResolver;
  }
  // Appending keeps the priority order: element creation runs the directives' host bindings in
  // match order, before the template's resolver binding registers.
  if (tView.firstCreatePass) {
    attributeResolverFirstCreatePass(tView, lView, tNode, name, owner, flags);
  }
  const tAttributeResolver = getTAttributeResolver(tNode, name)!;
  const index = tAttributeResolver.index;
  ((lView[index + AttributeResolverSlot.ResolverFns] ??= []) as AttributeResolverFn[]).push(
    resolverFn,
  );
  (
    (lView[index + AttributeResolverSlot.Resolvers] ??= []) as Array<
      ClassResolver | AttributeResolver | null
    >
  ).push(injectAttributeResolver(tNode, lView, owner, name));
  seedHydratedValue(tNode, tAttributeResolver, lView);
  return ɵɵattributeResolver;
}

const TOKEN_LIST_ATTRIBUTES = new Set([
  'rel',
  'part',
  'headers',
  'aria-describedby',
  'aria-controls',
  'aria-owns',
  'aria-flowto',
  'aria-details',
]);

/** Gets the grammar of the attribute `name`, which matches as written. */
function getAttributeGrammar(name: string): AttributeGrammar {
  if (name === 'class') {
    return AttributeGrammar.ClassList;
  } else if (name === 'style') {
    return AttributeGrammar.Declarations;
  }
  return TOKEN_LIST_ATTRIBUTES.has(name) ? AttributeGrammar.TokenList : AttributeGrammar.Scalar;
}

/** Gets the resolver data of an element's attribute `name`, or `null` if it isn't resolved. */
export function getTAttributeResolver(tNode: TNode, name: string): TAttributeResolver | null {
  const tAttributeResolvers = tNode.attributeResolvers;
  if (tAttributeResolvers !== null) {
    for (const tAttributeResolver of tAttributeResolvers) {
      if (tAttributeResolver.name === name) {
        return tAttributeResolver;
      }
    }
  }
  return null;
}

/**
 * Records that hydration claimed an element, for the first resolution of its classes or styles.
 * Call it when the element is created.
 */
export function seedHydratedValue(
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
  lView: LView,
): void {
  const appliedIndex = tAttributeResolver.index + AttributeResolverSlot.AppliedValue;
  if (
    tAttributeResolver.grammar === AttributeGrammar.Declarations &&
    !wasLastNodeCreated() &&
    lView[appliedIndex] === null
  ) {
    // With static styles, static initialization has already replaced the server's `style`
    // attribute with them, so styles that only the server or outside code set are lost there.
    lView[appliedIndex] = true;
    return;
  }
  if (tAttributeResolver.grammar !== AttributeGrammar.ClassList) {
    return;
  }
  if (!wasLastNodeCreated() && tNode.classes === null && lView[appliedIndex] === null) {
    // With static classes, static initialization has already rewritten the `class` attribute to
    // them, which is where the first resolution starts anyway.
    const element = getNativeByTNode(tNode, lView) as RElement;
    lView[appliedIndex] = toStylingKeyValueArray(
      classKeyValueArraySet,
      classStringParser,
      element.getAttribute('class'),
    );
  }
}

function hasShorthand(name: string): boolean {
  return name === 'class' || name === 'style';
}

function bindingForm(name: string, flags: AttributeResolverFlags): string {
  return flags & AttributeResolverFlags.Shorthand ? `\`(${name})\`` : `\`(attr.${name})\``;
}

function reportAttributeResolverOnContainer(
  tView: TView,
  name: string,
  owner: number,
  flags: number,
): void {
  const form = bindingForm(name, flags);
  const directiveName =
    owner === -1 ? null : (tView.data[owner] as DirectiveDef<unknown>).type.name;
  const binding =
    directiveName === null ? `${form} binding` : `${form} host binding of \`${directiveName}\``;
  const resolved = name === 'class' ? 'classes' : `the \`${name}\` attribute`;
  console.error(
    formatRuntimeError(
      RuntimeErrorCode.ATTRIBUTE_RESOLVER_ON_CONTAINER,
      `The ${binding} can't resolve ${resolved} on \`<ng-container>\` or \`<ng-template>\`, ` +
        'because neither is rendered as an element. ' +
        (directiveName === null
          ? 'Bind it on an element instead.'
          : `Apply \`${directiveName}\` to an element instead.`),
    ),
  );
}

/**
 * Looks up the registered resolver of the attribute `name` from the element's injector, the way
 * the registration's owner injects it: only the component on the element sees its own
 * `viewProviders`.
 */
function injectAttributeResolver(
  tNode: TNode,
  lView: LView,
  owner: number,
  name: string,
): ClassResolver | AttributeResolver | null {
  const token = getAttributeResolverToken(name);
  if (token === null) {
    return null;
  }
  const isComponent =
    tNode.componentOffset > -1 && owner === tNode.directiveStart + tNode.componentOffset;
  return injectFromElement(tNode as TDirectiveHostNode, lView, token, isComponent);
}

/**
 * Looks up `token` from the element's injector, through the injectors above it and then its
 * environment injector, or returns `null` when none provides it.
 *
 * @param includeViewProviders Whether the lookup sees the `viewProviders` of the component on the
 *     element.
 */
export function injectFromElement<T>(
  tNode: TDirectiveHostNode,
  lView: LView,
  token: ProviderToken<T>,
  includeViewProviders: boolean,
): T | null {
  const previousIncludeViewProviders = setIncludeViewProviders(includeViewProviders);
  try {
    return getOrCreateInjectable(tNode, lView, token, InternalInjectFlags.Optional);
  } finally {
    setIncludeViewProviders(previousIncludeViewProviders);
  }
}

function attributeResolverFirstCreatePass(
  tView: TView,
  lView: LView,
  tNode: TNode,
  name: string,
  owner: number,
  flags: AttributeResolverFlags,
): void {
  const existing = getTAttributeResolver(tNode, name);
  if (existing !== null) {
    // Only inheritance registers a second resolver for one directive: its host bindings run its
    // base class's first.
    if (ngDevMode && owner !== -1 && existing.owners.includes(owner)) {
      const bindings = hasShorthand(name)
        ? `\`(${name})\` or \`(attr.${name})\``
        : `\`(attr.${name})\``;
      throw new RuntimeError(
        RuntimeErrorCode.MULTIPLE_ATTRIBUTE_RESOLVERS,
        `\`${(tView.data[owner] as DirectiveDef<unknown>).type.name}\` has more than one ` +
          `${name} resolver, through inheritance. A directive can have at most one ${bindings} ` +
          'binding in its host, including the ones it inherits from its base classes.',
      );
    }
    existing.owners.push(owner);
    existing.flags.push(flags);
    return;
  }

  enableAttributeResolverHooks(refreshAttributeResolvers, registerAttributeResolverBinding, null);
  const tAttributeResolver = createTAttributeResolver(
    tView,
    lView,
    tNode,
    name,
    AttributeResolverSlot.Resolvers + 1,
  );
  tAttributeResolver.owners.push(owner);
  tAttributeResolver.flags.push(flags);
}

/**
 * Creates the resolver data of an element's attribute `name`, without registrations.
 *
 * @param slotCount Number of `AttributeResolverSlot`s to allocate in each instance.
 */
export function createTAttributeResolver(
  tView: TView,
  lView: LView,
  tNode: TNode,
  name: string,
  slotCount: number,
): TAttributeResolver {
  const tData = tView.data;
  const grammar = getAttributeGrammar(name);
  const segments: TAttributeSourceSegment[] = [];
  const addSegment = (source: AttributeSource, directiveIndex: number, statics: string[]) => {
    segments.push({
      source,
      directiveIndex,
      statics,
      staticStyles:
        grammar === AttributeGrammar.Declarations ? readStaticDeclarations(statics) : null,
      bindings: [],
    });
  };
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const hostAttrs = (tData[i] as DirectiveDef<unknown>).hostAttrs;
    addSegment(attributeSourceOf(tNode, i), i, readStaticValues(hostAttrs, name, grammar));
  }
  addSegment(AttributeSource.Template, -1, readStaticValues(tNode.attrs, name, grammar));

  const tAttributeResolver: TAttributeResolver = {
    name,
    grammar,
    index: allocExpando(tView, lView, slotCount, null),
    owners: [],
    flags: [],
    segments,
  };
  if (tNode.attributeResolvers === null) {
    tNode.attributeResolvers = [];
    (tView.attributeResolvers ??= []).push(tNode.index);
  }
  tNode.attributeResolvers.push(tAttributeResolver);
  return tAttributeResolver;
}

/** Records a binding of a resolved attribute with the source that owns it. */
export function registerAttributeResolverBinding(
  tAttributeResolver: TAttributeResolver,
  directiveIndex: number,
  bindingIndex: number,
  kind: TAttributeBinding['kind'],
): void {
  for (const segment of tAttributeResolver.segments) {
    if (segment.directiveIndex === directiveIndex) {
      const bindings = segment.bindings;
      // The first update pass runs again after an error, which records its bindings again.
      if (!bindings.some((binding) => binding.index === bindingIndex)) {
        // Styling bindings rank before attribute bindings, although a host's attribute bindings
        // run before its styling bindings.
        const firstAttribute =
          kind === 'styling' ? bindings.findIndex((binding) => binding.kind === 'attribute') : -1;
        bindings.splice(firstAttribute === -1 ? bindings.length : firstAttribute, 0, {
          kind,
          index: bindingIndex,
        });
      }
      return;
    }
  }
}

function attributeSourceOf(tNode: TNode, directiveIndex: number): AttributeSource {
  if (directiveIndex === -1) {
    return AttributeSource.Template;
  }
  // The component's host directives are matched before the component, so they're part of the
  // component's source.
  const componentIndex =
    tNode.componentOffset > -1 ? tNode.directiveStart + tNode.componentOffset : -1;
  return directiveIndex <= componentIndex ? AttributeSource.Component : AttributeSource.Directives;
}

function readStaticValues(
  attrs: TAttributes | null,
  name: string,
  grammar: AttributeGrammar,
): string[] {
  if (grammar === AttributeGrammar.ClassList) {
    return readStaticClasses(attrs);
  } else if (grammar === AttributeGrammar.Declarations) {
    return readStaticStyles(attrs);
  }
  return readStaticAttribute(attrs, name);
}

function readStaticAttribute(attrs: TAttributes | null, name: string): string[] {
  if (attrs !== null) {
    // Attributes are stored as name/value pairs, before any marker other than `NamespaceURI`.
    for (let i = 0; i < attrs.length; i += 2) {
      const item = attrs[i];
      if (typeof item === 'number') {
        if (item !== AttributeMarker.NamespaceURI) {
          break;
        }
        // Skip the marker, the namespace, the name, and the value.
        i += 2;
      } else if (item === name) {
        return [attrs[i + 1] as string];
      }
    }
  }
  return [];
}

function readStaticStyles(attrs: TAttributes | null): string[] {
  const declarations: string[] = [];
  if (attrs !== null) {
    let marker = AttributeMarker.ImplicitAttributes;
    for (let i = 0; i < attrs.length; i++) {
      const item = attrs[i];
      if (typeof item === 'number') {
        marker = item;
      } else if (marker === AttributeMarker.Styles) {
        // Styles are stored as key/value pairs.
        declarations.push(`${item}: ${attrs[++i]}`);
      }
    }
  }
  return declarations;
}

/** The compiler has split the `style` attribute into names and values already. */
function readStaticDeclarations(statics: string[]): TStaticStyle[] {
  return statics.map((declaration) => {
    const colon = declaration.indexOf(':');
    const property = canonicalPropertyName(decodeCssEscapes(declaration.slice(0, colon)));
    const value = readStyleValue(declaration.slice(colon + 1), property.startsWith('--'));
    return [property, value, value && writeDeclaration(property, value[0], value[1])];
  });
}

function readStaticClasses(attrs: TAttributes | null): string[] {
  const classes: string[] = [];
  if (attrs !== null) {
    let marker = AttributeMarker.ImplicitAttributes;
    for (let i = 0; i < attrs.length; i++) {
      const item = attrs[i];
      if (typeof item === 'number') {
        marker = item;
      } else if (marker === AttributeMarker.Classes) {
        classes.push(item as string);
      } else if (marker === AttributeMarker.Styles) {
        // Styles are stored as key/value pairs.
        i++;
      }
    }
  }
  return classes;
}

/**
 * Resolves the attributes of every element in the view that has a resolver binding, such as
 * `(class)` or `(attr.class)`. The resolvers run on every refresh because they may read state other
 * than their argument.
 *
 * @param refreshAutomatic Resolves an attribute that automatic resolution set up without a
 *     registration. Only automatic resolution creates such attributes, and it passes this function.
 */
export function refreshAttributeResolvers(
  tView: TView,
  lView: LView,
  refreshAutomatic?: (
    tView: TView,
    lView: LView,
    tNode: TNode,
    tAttributeResolver: TAttributeResolver,
  ) => void,
): void {
  const resolverNodes = tView.attributeResolvers!;
  try {
    for (let i = 0; i < resolverNodes.length; i++) {
      const tNode = tView.data[resolverNodes[i]] as TNode;
      for (const tAttributeResolver of tNode.attributeResolvers!) {
        if (tAttributeResolver.owners.length === 0) {
          refreshAutomatic!(tView, lView, tNode, tAttributeResolver);
        } else if (
          tAttributeResolver.grammar === AttributeGrammar.Scalar ||
          tAttributeResolver.grammar === AttributeGrammar.TokenList
        ) {
          refreshValueResolver(lView, tNode, tAttributeResolver);
        } else if (tAttributeResolver.grammar === AttributeGrammar.Declarations) {
          refreshStyleResolver(tView, lView, tNode, tAttributeResolver);
        } else {
          refreshClassResolver(tView, lView, tNode, tAttributeResolver);
        }
      }
    }
  } finally {
    // Compiled handlers restore their declaration view and reset it when they return.
    ɵɵrestoreView(lView as unknown as OpaqueViewState);
  }
}

function refreshClassResolver(
  tView: TView,
  lView: LView,
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
): void {
  const index = tAttributeResolver.index;
  const resolverFns = lView[index + AttributeResolverSlot.ResolverFns] as AttributeResolverFn[];
  const classResolvers = lView[index + AttributeResolverSlot.Resolvers] as (ClassResolver | null)[];
  const lastLevel = resolverFns.length - 1;
  let sources = collectClassSources(tView.data, lView, tAttributeResolver);
  for (let level = 0; level < lastLevel; level++) {
    const ownerSource = attributeSourceOf(tNode, tAttributeResolver.owners[level]);
    const classNames = resolveThroughEvent(
      resolverFns[level],
      tAttributeResolver.flags[level],
      classResolvers[level],
      sources,
      ownerSource,
    );
    sources = foldClassNames(sources, classNames, ownerSource);
  }
  const resolved = resolveThroughEvent(
    resolverFns[lastLevel],
    tAttributeResolver.flags[lastLevel],
    classResolvers[lastLevel],
    sources,
    attributeSourceOf(tNode, tAttributeResolver.owners[lastLevel]),
  );
  applyResolvedClasses(tNode, tAttributeResolver, lView, resolved);
}

type CollectedSources = [component: string[], directives: string[], template: string[]];

function resolveThroughEvent(
  resolverFn: AttributeResolverFn,
  flags: AttributeResolverFlags,
  classResolver: ClassResolver | null,
  sources: CollectedSources,
  ownerSource: AttributeSource,
): string[] {
  let resolved: string[] | null = null;
  let calls = 0;
  let sealed = false;
  const event: ClassResolveEvent = {
    sources,
    resolver: (...extras) =>
      new ResolvedValue(
        AttributeGrammar.ClassList,
        mergeClassSources(sources, extras, ownerSource, classResolver, flags),
        event,
      ),
    resolve: (classes) => {
      if (ngDevMode && (sealed || calls > 0)) {
        throw invalidResolveCallError('class', flags, sealed);
      }
      if (sealed) {
        return;
      }
      // Count the call before checking or reading `classes`, whose proxy traps and getters can
      // call `resolve()` again. In production, the call that starts last wins.
      const call = ++calls;
      let classNames: string[] | null = null;
      if (classes instanceof ResolvedValue) {
        classNames =
          (readResult(classes, event, AttributeGrammar.ClassList, 'class', flags, false) as
            string[] | null) ?? [];
      } else if (ngDevMode) {
        checkSuppliedValue(classes, 'class', flags, false);
      }
      classNames ??= readClassNames(classes);
      if (call === calls) {
        resolved = classNames;
      }
    },
  };
  try {
    resolverFn(event);
  } finally {
    sealed = true;
  }
  return resolved ?? sources.flat();
}

function invalidResolveCallError(
  name: string,
  flags: AttributeResolverFlags,
  sealed: boolean,
): RuntimeError {
  const form = bindingForm(name, flags);
  return new RuntimeError(
    RuntimeErrorCode.INVALID_ATTRIBUTE_RESOLUTION,
    sealed
      ? `The ${form} handler called \`resolve()\` after it returned. Call it while the handler ` +
          'runs.'
      : `The ${form} handler called \`resolve()\` more than once. Call it at most once.`,
  );
}

/**
 * Reads a result that a handler supplied to `event`: as the argument of its `resolve()`, or as an
 * extra of its resolver when `extra` is true. A result is valid only as the argument of the
 * `resolve()` of the event whose resolver created it. In dev mode, any other result throws. In
 * production, a result of `grammar` reads as its value and any other result as `null`.
 */
function readResult(
  result: ResolvedValue,
  event: object | null,
  grammar: AttributeGrammar,
  name: string,
  flags: AttributeResolverFlags,
  extra: boolean,
): string[] | string | null {
  if (!extra && result.event === event) {
    return result.value;
  }
  if (ngDevMode) {
    throw foreignResultError(name, flags, extra);
  }
  return result.grammar === grammar ? result.value : null;
}

/**
 * Checks in dev mode a value other than a result that a handler supplied to a resolve event: as the
 * argument of its `resolve()`, or as an extra of its resolver when `extra` is true.
 */
function checkSuppliedValue(
  value: unknown,
  name: string,
  flags: AttributeResolverFlags,
  extra: boolean,
): void {
  if (!extra && flags & AttributeResolverFlags.Shorthand) {
    throw foreignShorthandResultError(name);
  }
  if (typeof value === 'function') {
    throw functionValueError(name, flags, extra);
  }
}

function functionValueError(
  name: string,
  flags: AttributeResolverFlags,
  extra: boolean,
): RuntimeError {
  const shorthand = flags & AttributeResolverFlags.Shorthand;
  const supplier = `The ${bindingForm(name, flags)} ${shorthand ? 'callback' : 'handler'}`;
  const target = extra ? (shorthand ? 'its resolver' : '`resolver()`') : '`resolve()`';
  return new RuntimeError(
    RuntimeErrorCode.INVALID_ATTRIBUTE_RESOLUTION,
    `${supplier} passed a function to ${target}, which doesn't read functions. Pass the value ` +
      'that the function computes.',
  );
}

function foreignResultError(
  name: string,
  flags: AttributeResolverFlags,
  extra: boolean,
): RuntimeError {
  const shorthand = flags & AttributeResolverFlags.Shorthand;
  const supplier = `The ${bindingForm(name, flags)} ${shorthand ? 'callback' : 'handler'}`;
  return new RuntimeError(
    RuntimeErrorCode.INVALID_ATTRIBUTE_RESOLUTION,
    extra
      ? `${supplier} passed a result to ${shorthand ? 'its resolver' : '`resolver()`'}. A result ` +
          "belongs to the resolve event that created it and is valid only in that event's " +
          '`resolve()`. Pass values as extras.'
      : `${supplier} ${shorthand ? 'returned' : 'passed `resolve()`'} a result that belongs to ` +
          'another resolve event. A result is valid only in the `resolve()` of the event whose ' +
          '`resolver()` created it.',
  );
}

function foreignShorthandResultError(name: string): RuntimeError {
  const example = name === 'class' ? "(cn) => cn('px-4')" : "(s) => s('padding: 4px')";
  return new RuntimeError(
    RuntimeErrorCode.INVALID_ATTRIBUTE_RESOLUTION,
    `The \`(${name})\` callback returned a value that its own resolver didn't create. Return ` +
      `the result of the resolver that the callback receives, such as \`${example}\`.`,
  );
}

/** A result that the resolver of a resolve event created. */
class ResolvedValue implements ResolvedAttribute {
  declare readonly [ɵRESOLVED_CLASSES_BRAND]: true;

  constructor(
    readonly grammar: AttributeGrammar,
    /** The class names for `class`, and otherwise the value, or `null` for no value. */
    readonly value: string[] | string | null,
    readonly event: object,
  ) {}

  toString(): string {
    return Array.isArray(this.value) ? this.value.join(' ') : (this.value ?? '');
  }
}

/**
 * Gets the value to read from an extra that a handler passed to the resolver of an event of
 * `grammar`. See `readResult`.
 */
function readExtra(
  extra: unknown,
  grammar: AttributeGrammar,
  name: string,
  flags: AttributeResolverFlags,
): unknown {
  if (extra instanceof ResolvedValue) {
    return readResult(extra, null, grammar, name, flags, true);
  }
  if (ngDevMode) {
    checkSuppliedValue(extra, name, flags, true);
  }
  return extra;
}

function mergeClassSources(
  sources: CollectedSources,
  extras: ClassBindingValue[],
  ownerSource: AttributeSource,
  classResolver: ClassResolver | null,
  flags: AttributeResolverFlags,
): string[] {
  const classes = sources.flatMap((classNames, source) => {
    if (source !== ownerSource) {
      return classNames;
    }
    const merged = [...classNames];
    for (const extra of extras) {
      // Append one at a time: a spread would take every name as an argument.
      for (const className of readClassNames(
        readExtra(extra, AttributeGrammar.ClassList, 'class', flags),
      )) {
        merged.push(className);
      }
    }
    return merged;
  });
  return readClassNames(
    classResolver == null
      ? classes.join(' ')
      : callAttributeResolver(classResolver, toResolverArguments(classes)),
  );
}

/**
 * Reads the arguments of a `ClassResolver` from classes in priority order: one per class, keeping
 * repeated names. An entry splits on ASCII whitespace, the way the `class` attribute separates
 * classes, and empty names are left out.
 */
export function toResolverArguments(classes: readonly string[]): string[] {
  const args: string[] = [];
  for (const entry of classes) {
    for (const className of entry.split(/[\t\n\f\r ]+/)) {
      if (className !== '') {
        args.push(className);
      }
    }
  }
  return args;
}

/** Reads classes the way a `[class]` binding reads them, but without names that contain a space. */
export function readClassNames(value: unknown): string[] {
  const classNames = new Set<string>();
  const add = (className: unknown) => {
    const name = String(className);
    if (name !== '' && !name.includes(' ')) {
      classNames.add(name);
    }
  };
  if (typeof value === 'string') {
    for (const className of value.split(/\s+/)) {
      add(className);
    }
  } else if (Array.isArray(value) || value instanceof Set) {
    for (const className of value) {
      add(className);
    }
  } else if (value !== null && typeof value === 'object') {
    const classMap = value as {[className: string]: unknown};
    for (const className of Object.keys(classMap)) {
      if (classMap[className]) {
        add(className);
      }
    }
  }
  return Array.from(classNames);
}

function foldClassNames(
  sources: CollectedSources,
  classNames: string[],
  ownerSource: AttributeSource,
): CollectedSources {
  const origins = new Map<string, AttributeSource>();
  for (let source = AttributeSource.Component; source <= AttributeSource.Template; source++) {
    for (const className of sources[source]) {
      origins.set(className, source);
    }
  }
  const folded: CollectedSources = [[], [], []];
  for (const className of classNames) {
    folded[origins.get(className) ?? ownerSource].push(className);
  }
  return folded;
}

/** Groups the element's classes by source. */
export function collectClassSources(
  tData: TData,
  lView: LView,
  tAttributeResolver: TAttributeResolver,
): CollectedSources {
  // Insertion order of the map is the priority order. `-1` marks a class turned off.
  const decided = new Map<string, AttributeSource | -1>();
  for (const segment of tAttributeResolver.segments) {
    for (const className of segment.statics) {
      decideClass(decided, className, true, segment.source);
    }
    for (const {kind, index: bindingIndex} of segment.bindings) {
      if (kind === 'attribute') {
        const value = lView[bindingIndex];
        if (value !== NO_CHANGE && value != null) {
          for (const className of toResolverArguments([renderStringify(value)])) {
            decideClass(decided, className, true, segment.source);
          }
        }
        continue;
      }
      const rawKey = tData[bindingIndex] as TStylingKey;
      const key = Array.isArray(rawKey) ? rawKey[1] : rawKey;
      const value = lView[bindingIndex + 1];
      if (value === NO_CHANGE) {
        // The binding hasn't executed yet.
        continue;
      }
      if (key === null) {
        // `[class]` binding, normalized to a `KeyValueArray`.
        const classes = value as KeyValueArray<unknown>;
        for (let j = 0; j < classes.length; j += 2) {
          decideClass(decided, classes[j] as string, classes[j + 1], segment.source);
        }
      } else {
        // `[class.name]` binding.
        decideClass(decided, key as string, value, segment.source);
      }
    }
  }

  const sources: CollectedSources = [[], [], []];
  for (const [className, source] of decided) {
    if (source !== -1) {
      sources[source].push(className);
    }
  }
  return sources;
}

function decideClass(
  decided: Map<string, AttributeSource | -1>,
  className: string,
  value: unknown,
  source: AttributeSource,
): void {
  if (value === undefined) {
    return;
  }
  // Re-insert so the class moves to the position of the binding that decided it.
  decided.delete(className);
  decided.set(className, value ? source : -1);
}

/** Applies the difference between the previously applied classes and the resolved ones. */
export function applyResolvedClasses(
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
  lView: LView,
  resolved: string[],
): void {
  const renderer = lView[RENDERER];
  const element = getNativeByTNode(tNode, lView) as RElement;
  const appliedIndex = tAttributeResolver.index + AttributeResolverSlot.AppliedValue;
  const next = toStylingKeyValueArray(classKeyValueArraySet, classStringParser, resolved);
  // Before the first resolution, an element that wasn't hydrated has the static classes from all
  // sources. `seedHydratedValue` records the classes of a hydrated element instead.
  const previous =
    (lView[appliedIndex] as KeyValueArray<unknown> | null) ??
    (tNode.classes === null
      ? (EMPTY_ARRAY as unknown as KeyValueArray<unknown>)
      : toStylingKeyValueArray(classKeyValueArraySet, classStringParser, tNode.classes));

  // Both arrays are sorted by class name and hold only the names of classes that are on, so their
  // keys diff in one pass.
  let previousIndex = 0;
  let nextIndex = 0;
  while (previousIndex < previous.length || nextIndex < next.length) {
    const previousKey =
      previousIndex < previous.length ? (previous[previousIndex] as string) : null;
    const nextKey = nextIndex < next.length ? (next[nextIndex] as string) : null;
    if (previousKey === nextKey) {
      previousIndex += 2;
      nextIndex += 2;
    } else if (nextKey === null || (previousKey !== null && previousKey < nextKey)) {
      applyStyling(renderer, true, element, previousKey!, false);
      previousIndex += 2;
    } else {
      applyStyling(renderer, true, element, nextKey, true);
      nextIndex += 2;
    }
  }
  lView[appliedIndex] = next;
}

function refreshValueResolver(
  lView: LView,
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
): void {
  const index = tAttributeResolver.index;
  const resolverFns = lView[index + AttributeResolverSlot.ResolverFns] as AttributeResolverFn[];
  const resolvers = lView[index + AttributeResolverSlot.Resolvers] as (AttributeResolver | null)[];
  const lastLevel = resolverFns.length - 1;
  let sources = collectValueSources(lView, tNode, tAttributeResolver);
  for (let level = 0; level < lastLevel; level++) {
    const ownerSource = attributeSourceOf(tNode, tAttributeResolver.owners[level]);
    const value = resolveValueThroughEvent(
      tAttributeResolver,
      resolverFns[level],
      tAttributeResolver.flags[level],
      resolvers[level],
      sources,
      ownerSource,
    );
    sources =
      tAttributeResolver.grammar === AttributeGrammar.TokenList
        ? foldTokens(sources, value, ownerSource)
        : foldScalarValue(sources, value, ownerSource);
  }
  const resolved = resolveValueThroughEvent(
    tAttributeResolver,
    resolverFns[lastLevel],
    tAttributeResolver.flags[lastLevel],
    resolvers[lastLevel],
    sources,
    attributeSourceOf(tNode, tAttributeResolver.owners[lastLevel]),
  );
  applyResolvedValue(
    tNode,
    tAttributeResolver,
    lView,
    tAttributeResolver.grammar === AttributeGrammar.TokenList && resolved === '' ? null : resolved,
  );
}

function resolveValueThroughEvent(
  tAttributeResolver: TAttributeResolver,
  resolverFn: AttributeResolverFn,
  flags: AttributeResolverFlags,
  resolver: AttributeResolver | null,
  sources: CollectedSources,
  ownerSource: AttributeSource,
): string | null {
  const {name, grammar} = tAttributeResolver;
  let resolved: string | null | undefined = undefined;
  let calls = 0;
  let sealed = false;
  const event: AttributeResolveEvent = {
    sources,
    resolver: (...extras) =>
      new ResolvedValue(
        grammar,
        mergeValueSources(tAttributeResolver, sources, extras, ownerSource, resolver, flags),
        event,
      ),
    resolve: (value) => {
      if (ngDevMode && (sealed || calls > 0)) {
        throw invalidResolveCallError(name, flags, sealed);
      }
      if (sealed) {
        return;
      }
      // Count the call before checking or reading `value`, whose proxy traps and entries can call
      // `resolve()` again. In production, the call that starts last wins.
      const call = ++calls;
      let scalar: string | null | undefined = undefined;
      if (value instanceof ResolvedValue) {
        scalar = readResult(value, event, grammar, name, flags, false) as string | null;
      } else if (ngDevMode) {
        checkSuppliedValue(value, name, flags, false);
      }
      if (scalar === undefined) {
        scalar = readScalarValue(value);
      }
      if (call === calls) {
        resolved = scalar;
      }
    },
  };
  try {
    resolverFn(event);
  } finally {
    sealed = true;
  }
  // Without a call to `resolve()`, the built-in rule applies, without the app's resolver.
  return resolved === undefined
    ? callAttributeResolver(getBuiltInRule(grammar), sources.flat())
    : resolved;
}

function readScalarValue(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? value.join(' ') : String(value);
}

function getBuiltInRule(grammar: AttributeGrammar): AttributeResolver {
  return grammar === AttributeGrammar.TokenList ? joinTokens : lastValue;
}

function mergeValueSources(
  {name, grammar}: TAttributeResolver,
  sources: CollectedSources,
  extras: AttributeValue[],
  ownerSource: AttributeSource,
  resolver: AttributeResolver | null,
  flags: AttributeResolverFlags,
): string | null {
  const values = sources.flatMap((sourceValues, source) => {
    if (source !== ownerSource) {
      return sourceValues;
    }
    const merged = [...sourceValues];
    for (const extra of extras) {
      const value = readScalarValue(readExtra(extra, grammar, name, flags));
      if (value !== null) {
        if (grammar === AttributeGrammar.TokenList) {
          for (const token of toResolverArguments([value])) {
            merged.push(token);
          }
        } else {
          merged.push(value);
        }
      }
    }
    return merged;
  });
  return callAttributeResolver(resolver ?? getBuiltInRule(grammar), values);
}

function foldScalarValue(
  sources: CollectedSources,
  value: string | null,
  ownerSource: AttributeSource,
): CollectedSources {
  const folded: CollectedSources = [[], [], []];
  if (value !== null) {
    let origin = ownerSource;
    for (let source = AttributeSource.Component; source <= AttributeSource.Template; source++) {
      if (sources[source].includes(value)) {
        origin = source;
      }
    }
    folded[origin].push(value);
  }
  return folded;
}

function foldTokens(
  sources: CollectedSources,
  value: string | null,
  ownerSource: AttributeSource,
): CollectedSources {
  const origins = new Map<string, AttributeSource>();
  for (let source = AttributeSource.Component; source <= AttributeSource.Template; source++) {
    for (const token of sources[source]) {
      origins.set(token, source);
    }
  }
  const folded: CollectedSources = [[], [], []];
  if (value !== null) {
    for (const token of toResolverArguments([value])) {
      folded[origins.get(token) ?? ownerSource].push(token);
    }
  }
  return folded;
}

/** Groups the values of an attribute that holds one value or a list of tokens by source. */
export function collectValueSources(
  lView: LView,
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
): CollectedSources {
  const name = tAttributeResolver.name;
  const isTokenList = tAttributeResolver.grammar === AttributeGrammar.TokenList;
  const element = getNativeByTNode(tNode, lView) as RElement;
  const sources: CollectedSources = [[], [], []];
  let firstSegment: TAttributeSourceSegment | null = null;
  let firstValue: string | null = null;
  let conflictingSegment: TAttributeSourceSegment | null = null;
  let conflictingValue: string | null = null;
  for (const segment of tAttributeResolver.segments) {
    let value: string | null = segment.statics.length > 0 ? segment.statics[0] : null;
    for (const {index: bindingIndex} of segment.bindings) {
      const bound = lView[bindingIndex];
      if (bound === NO_CHANGE) {
        // The binding hasn't executed yet.
        continue;
      }
      // Read the value the way `ɵɵattribute` writes it.
      const unwrapped = unwrapImgVideoSrcValue(name, element, bound, true);
      if (unwrapped != null) {
        value = renderStringify(unwrapped);
      }
    }
    if (value === null) {
      continue;
    }
    if (isTokenList) {
      for (const token of toResolverArguments([value])) {
        sources[segment.source].push(token);
      }
      continue;
    }
    sources[segment.source].push(value);
    if (ngDevMode && segment.directiveIndex !== -1) {
      if (firstSegment === null) {
        firstSegment = segment;
        firstValue = value;
      } else if (conflictingSegment === null && value !== firstValue) {
        conflictingSegment = segment;
        conflictingValue = value;
      }
    }
  }
  if (ngDevMode && conflictingSegment !== null) {
    warnConflictingValues(
      lView[TVIEW].data,
      element,
      name,
      [firstSegment!.directiveIndex, firstValue!],
      [conflictingSegment.directiveIndex, conflictingValue!],
    );
  }
  return sources;
}

let conflictsReported: WeakMap<RElement, Set<string>> | null = null;

function warnConflictingValues(
  tData: TData,
  element: RElement,
  name: string,
  [firstIndex, firstValue]: [directiveIndex: number, value: string],
  [secondIndex, secondValue]: [directiveIndex: number, value: string],
): void {
  conflictsReported ??= new WeakMap();
  let reported = conflictsReported.get(element);
  if (reported === undefined) {
    conflictsReported.set(element, (reported = new Set()));
  } else if (reported.has(name)) {
    return;
  }
  reported.add(name);
  const directiveName = (index: number) => (tData[index] as DirectiveDef<unknown>).type.name;
  console.warn(
    formatRuntimeError(
      RuntimeErrorCode.CONFLICTING_ATTRIBUTE_VALUES,
      `Directives \`${directiveName(firstIndex)}\` and \`${directiveName(secondIndex)}\` set ` +
        `different values for the \`${name}\` attribute of an element: \`${firstValue}\` and ` +
        `\`${secondValue}\`. Reconcile the values that the directives contribute, for example by ` +
        'setting the attribute in only one of them.',
    ),
  );
}

/**
 * Sets or removes the attribute when the resolved value differs from the one that the previous
 * resolution applied.
 */
export function applyResolvedValue(
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
  lView: LView,
  resolved: string | null,
): void {
  const name = tAttributeResolver.name;
  const element = getNativeByTNode(tNode, lView) as RElement;
  const appliedIndex = tAttributeResolver.index + AttributeResolverSlot.AppliedValue;
  const applied = lView[appliedIndex] as string | false | null;
  const previous =
    applied === null ? element.getAttribute(name) : applied === false ? null : applied;
  if (resolved !== previous) {
    const renderer = lView[RENDERER];
    if (resolved === null) {
      renderer.removeAttribute(element, name);
    } else {
      renderer.setAttribute(element, name, resolved);
    }
  }
  lView[appliedIndex] = resolved ?? false;
}

function refreshStyleResolver(
  tView: TView,
  lView: LView,
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
): void {
  const index = tAttributeResolver.index;
  const resolverFns = lView[index + AttributeResolverSlot.ResolverFns] as AttributeResolverFn[];
  const resolvers = lView[index + AttributeResolverSlot.Resolvers] as (AttributeResolver | null)[];
  const lastLevel = resolverFns.length - 1;
  const named =
    lView[index + AttributeResolverSlot.AppliedValue] === true ? new Set<string>() : null;
  let sources = collectStyleSources(tView.data, lView, tAttributeResolver, named);
  for (let level = 0; level < lastLevel; level++) {
    const ownerSource = attributeSourceOf(tNode, tAttributeResolver.owners[level]);
    const declarations = resolveStyleThroughEvent(
      resolverFns[level],
      tAttributeResolver.flags[level],
      resolvers[level],
      sources,
      ownerSource,
    );
    sources = foldDeclarations(sources, declarations, ownerSource);
  }
  const resolved = resolveStyleThroughEvent(
    resolverFns[lastLevel],
    tAttributeResolver.flags[lastLevel],
    resolvers[lastLevel],
    sources,
    attributeSourceOf(tNode, tAttributeResolver.owners[lastLevel]),
  );
  applyResolvedStyles(tNode, tAttributeResolver, lView, resolved, named);
}

function resolveStyleThroughEvent(
  resolverFn: AttributeResolverFn,
  flags: AttributeResolverFlags,
  resolver: AttributeResolver | null,
  sources: CollectedSources,
  ownerSource: AttributeSource,
): string | null {
  let resolved: string | null | undefined = undefined;
  let calls = 0;
  let sealed = false;
  const event: StyleResolveEvent = {
    sources,
    resolver: (...extras) =>
      new ResolvedValue(
        AttributeGrammar.Declarations,
        mergeStyleSources(sources, extras, ownerSource, resolver, flags),
        event,
      ),
    resolve: (value) => {
      if (ngDevMode && (sealed || calls > 0)) {
        throw invalidResolveCallError('style', flags, sealed);
      }
      if (sealed) {
        return;
      }
      // Count the call before checking or reading `value`, whose proxy traps and getters can call
      // `resolve()` again. In production, the call that starts last wins.
      const call = ++calls;
      let declarations: string | null | undefined = undefined;
      if (value instanceof ResolvedValue) {
        declarations = readResult(
          value,
          event,
          AttributeGrammar.Declarations,
          'style',
          flags,
          false,
        ) as string | null;
      } else if (ngDevMode) {
        checkSuppliedValue(value, 'style', flags, false);
      }
      if (declarations === undefined) {
        declarations = value == null ? null : readDeclarations(value).join('; ');
      }
      if (call === calls) {
        resolved = declarations;
      }
    },
  };
  try {
    resolverFn(event);
  } finally {
    sealed = true;
  }
  // Without a call to `resolve()`, the built-in rule applies, without the app's resolver.
  return resolved === undefined ? sources.flat().join('; ') : resolved;
}

function mergeStyleSources(
  sources: CollectedSources,
  extras: StyleBindingValue[],
  ownerSource: AttributeSource,
  resolver: AttributeResolver | null,
  flags: AttributeResolverFlags,
): string | null {
  const declarations = sources.flatMap((sourceDeclarations, source) => {
    if (source !== ownerSource) {
      return sourceDeclarations;
    }
    const merged = [...sourceDeclarations];
    for (const extra of extras) {
      for (const declaration of readDeclarations(
        readExtra(extra, AttributeGrammar.Declarations, 'style', flags),
      )) {
        merged.push(declaration);
      }
    }
    return merged;
  });
  return callAttributeResolver(resolver ?? joinDeclarations, declarations);
}

function readDeclarations(value: unknown): string[] {
  const declarations: string[] = [];
  const unwrapped = unwrapSafeValue(value);
  if (typeof unwrapped === 'string' || Array.isArray(unwrapped)) {
    const texts: readonly unknown[] = typeof unwrapped === 'string' ? [unwrapped] : unwrapped;
    for (const text of texts) {
      for (const [property, propertyValue, important] of parseDeclarationList(`${text ?? ''}`)) {
        declarations.push(writeDeclaration(property, propertyValue, important));
      }
    }
  } else if (unwrapped !== null && typeof unwrapped === 'object') {
    const styleMap = unwrapped as {[property: string]: unknown};
    for (const key of Object.keys(styleMap)) {
      const property = canonicalPropertyName(key);
      const read = readBindingValue(property, unwrapSafeValue(styleMap[key]));
      if (read != null) {
        declarations.push(writeDeclaration(property, read[0], read[1]));
      }
    }
  }
  return declarations;
}

type StyleValue = [value: string, important: boolean];

/**
 * Writes a declaration the way sources and resolved results hold it, such as `color: red`. The
 * property is written as a CSS identifier, so that reading the declaration again gives the same
 * name.
 */
function writeDeclaration(property: string, value: string, important: boolean): string {
  const name = serializeCssIdentifier(property);
  return important ? `${name}: ${value} !important` : `${name}: ${value}`;
}

/**
 * Writes a name as a CSS identifier, as CSSOM serializes one: a character that CSS wouldn't read as
 * part of the name is escaped, so that `--x;color` is written `--x\;color`.
 */
function serializeCssIdentifier(name: string): string {
  if (/^(?!-?[0-9]|-$)[-\w\u0080-\uffff]+$/.test(name)) {
    return name;
  }
  let serialized = '';
  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    const code = name.charCodeAt(i);
    if (code === 0) {
      serialized += '\ufffd';
    } else if (
      code <= 0x1f ||
      code === 0x7f ||
      (code >= 0x30 && code <= 0x39 && (i === 0 || (i === 1 && name[0] === '-')))
    ) {
      // A control character, or a digit that would start a number.
      serialized += `\\${code.toString(16)} `;
    } else if (isCssNameChar(char) && !(char === '-' && name.length === 1)) {
      serialized += char;
    } else {
      serialized += `\\${char}`;
    }
  }
  return serialized;
}

/**
 * Reads the value of a style binding, or of an entry of a `[style]` map, for `property`, the way
 * the `style` attribute reads it. Returns `undefined` for a value that has no opinion, and `null`
 * for one that removes the property: `null`, `''`, and, except for a custom property, whitespace.
 */
function readBindingValue(property: string, value: unknown): StyleValue | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }
  const text = String(value);
  return text === '' ? null : readStyleValue(text, property.startsWith('--'));
}

/** Kinds of the tokens that `readCssToken` reads. */
const enum CssToken {
  Whitespace,
  Comment,
  /** A run of name characters and escapes, such as `color`, `-webkit-box`, or `1px`. */
  Name,
  /** A single character that no other kind takes, such as `!`, `:`, or `;`. */
  Delim,
  /** A string, a block with its contents, a function with its arguments, or a `url()`. */
  Other,
}

function isCssWhitespace(char: string | undefined): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f';
}

function isCssNameChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x61 && code <= 0x7a) || // a-z
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x30 && code <= 0x39) || // 0-9
    code === 0x2d || // -
    code === 0x5f || // _
    code >= 0x80
  );
}

function isHexDigit(char: string | undefined): boolean {
  return char !== undefined && /^[0-9a-f]$/i.test(char);
}

/**
 * Gets the end of the escape that starts with the backslash at `start`, or `-1` when the backslash
 * doesn't start one, before a newline or at the end. An escape is up to six hexadecimal digits
 * and one whitespace character, or any other single character.
 */
function cssEscapeEnd(text: string, start: number): number {
  const next = text[start + 1];
  if (next === undefined || next === '\n' || next === '\r' || next === '\f') {
    return -1;
  }
  let end = start + 1;
  while (end < start + 7 && isHexDigit(text[end])) {
    end++;
  }
  if (end === start + 1) {
    return start + 2;
  }
  if (text[end] === '\r' && text[end + 1] === '\n') {
    return end + 2;
  }
  return isCssWhitespace(text[end]) ? end + 1 : end;
}

/** Decodes the escapes of a CSS name, so that `\63 olor` reads as `color`. */
function decodeCssEscapes(text: string): string {
  if (!text.includes('\\')) {
    return text;
  }
  let decoded = '';
  for (let i = 0; i < text.length; i++) {
    const end = text[i] === '\\' ? cssEscapeEnd(text, i) : -1;
    if (end === -1) {
      decoded += text[i];
      continue;
    }
    const escaped = text.slice(i + 1, end);
    if (isHexDigit(escaped[0])) {
      const code = parseInt(escaped, 16);
      decoded +=
        code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)
          ? '\ufffd'
          : String.fromCodePoint(code);
    } else {
      decoded += escaped;
    }
    i = end - 1;
  }
  return decoded;
}

/**
 * Reads the CSS token that starts at `start`, as CSS tokenizes a declaration list, and returns its
 * kind and its end. A block, such as `(a; b)`, is read with its contents up to its closing
 * bracket, and a function, such as `var(--x)`, with its arguments. An unquoted `url()` is read as
 * one token, so that `/*` or `;` in it is part of the URL.
 */
function readCssToken(text: string, start: number): [kind: CssToken, end: number] {
  const char = text[start];
  if (isCssWhitespace(char)) {
    let end = start + 1;
    while (isCssWhitespace(text[end])) {
      end++;
    }
    return [CssToken.Whitespace, end];
  }
  if (char === '/' && text[start + 1] === '*') {
    const close = text.indexOf('*/', start + 2);
    return [CssToken.Comment, close === -1 ? text.length : close + 2];
  }
  if (char === '"' || char === "'") {
    return [CssToken.Other, cssStringEnd(text, start)];
  }
  if (char === '(' || char === '[' || char === '{') {
    return [CssToken.Other, cssBlockEnd(text, start)];
  }
  if (isCssNameChar(char) || (char === '\\' && cssEscapeEnd(text, start) !== -1)) {
    let end = start;
    while (end < text.length) {
      if (isCssNameChar(text[end])) {
        end++;
      } else if (text[end] === '\\' && cssEscapeEnd(text, end) !== -1) {
        end = cssEscapeEnd(text, end);
      } else {
        break;
      }
    }
    if (text[end] !== '(') {
      return [CssToken.Name, end];
    }
    let argument = end + 1;
    while (isCssWhitespace(text[argument])) {
      argument++;
    }
    const isUrl =
      decodeCssEscapes(text.slice(start, end)).toLowerCase() === 'url' &&
      text[argument] !== '"' &&
      text[argument] !== "'";
    return [CssToken.Other, isUrl ? cssUrlEnd(text, end + 1) : cssBlockEnd(text, end)];
  }
  return [CssToken.Delim, start + 1];
}

function cssStringEnd(text: string, start: number): number {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    const char = text[i];
    if (char === quote) {
      return i + 1;
    } else if (char === '\\') {
      i++;
    } else if (char === '\n' || char === '\r' || char === '\f') {
      // An unescaped newline ends a string that CSS drops.
      return i;
    }
  }
  return text.length;
}

function cssBlockEnd(text: string, start: number): number {
  const close = text[start] === '(' ? ')' : text[start] === '[' ? ']' : '}';
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === close) {
      return i + 1;
    }
    i = readCssToken(text, i)[1];
  }
  return text.length;
}

function cssUrlEnd(text: string, start: number): number {
  for (let i = start; i < text.length; i++) {
    if (text[i] === ')') {
      return i + 1;
    } else if (text[i] === '\\') {
      const end = cssEscapeEnd(text, i);
      if (end !== -1) {
        i = end - 1;
      }
    }
  }
  return text.length;
}

/**
 * Splits a list of declarations, such as `color: red; padding: 4px`, into property names, values,
 * and importance, in the order written, the way CSS reads a `style` attribute. Semicolons and
 * colons inside strings, blocks, functions, and `url()` don't separate. Names are decoded and
 * written as `canonicalPropertyName` writes them. A declaration without a name is left out, as CSS
 * drops it, and so is one with an empty value, except for a custom property, whose value can be
 * empty.
 */
function parseDeclarationList(
  text: string,
): Array<[property: string, value: string, important: boolean]> {
  const declarations: Array<[property: string, value: string, important: boolean]> = [];
  let start = 0;
  let colon = -1;
  const end = (position: number) => {
    if (colon !== -1) {
      const property = canonicalPropertyName(readPropertyName(text.slice(start, colon)));
      const value = readStyleValue(text.slice(colon + 1, position), property.startsWith('--'));
      if (property !== '' && value !== null) {
        declarations.push([property, value[0], value[1]]);
      }
    }
  };
  let i = 0;
  while (i < text.length) {
    const [kind, tokenEnd] = readCssToken(text, i);
    if (kind === CssToken.Delim && text[i] === ';') {
      end(i);
      start = tokenEnd;
      colon = -1;
    } else if (kind === CssToken.Delim && text[i] === ':' && colon === -1) {
      colon = i;
    }
    i = tokenEnd;
  }
  end(text.length);
  return declarations;
}

/**
 * Reads the property name of a declaration from the text before its colon, without the whitespace
 * and comments around it, and decodes its escapes. A comment in the name reads as a space, since
 * it separates what's around it. Only CSS whitespace is left out, so a no-break space or an
 * escaped space is part of the name.
 */
function readPropertyName(text: string): string {
  let name = '';
  let blank = '';
  for (let i = 0; i < text.length;) {
    const [kind, end] = readCssToken(text, i);
    if (kind === CssToken.Whitespace || kind === CssToken.Comment) {
      blank += kind === CssToken.Comment ? ' ' : text.slice(i, end);
    } else {
      name += (name === '' ? '' : blank) + text.slice(i, end);
      blank = '';
    }
    i = end;
  }
  return decodeCssEscapes(name);
}

/**
 * Reads the value of a declaration as CSS does, without the whitespace around it. Its
 * `!important` annotation is a `!` and the name `important`, in any case, as the last tokens apart
 * from whitespace and comments. The value of a custom property keeps its comments as written, and
 * can be empty; the value of another property leaves comments out, and `null` is returned when
 * it's empty.
 */
function readStyleValue(text: string, isCustomProperty: boolean): StyleValue | null {
  const tokens: Array<[kind: CssToken, start: number, end: number]> = [];
  for (let i = 0; i < text.length;) {
    const [kind, end] = readCssToken(text, i);
    tokens.push([kind, i, end]);
    i = end;
  }
  const isBlank = (index: number) =>
    tokens[index][0] === CssToken.Whitespace || tokens[index][0] === CssToken.Comment;
  let last = tokens.length;
  while (last > 0 && isBlank(last - 1)) {
    last--;
  }
  let important = false;
  if (
    last > 0 &&
    tokens[last - 1][0] === CssToken.Name &&
    decodeCssEscapes(text.slice(tokens[last - 1][1], tokens[last - 1][2])).toLowerCase() ===
      'important'
  ) {
    let bang = last - 1;
    while (bang > 0 && isBlank(bang - 1)) {
      bang--;
    }
    if (bang > 0 && tokens[bang - 1][0] === CssToken.Delim && text[tokens[bang - 1][1]] === '!') {
      important = true;
      last = bang - 1;
      while (last > 0 && isBlank(last - 1)) {
        last--;
      }
    }
  }
  let first = 0;
  while (first < last && isBlank(first)) {
    first++;
  }
  let value = '';
  for (let i = first; i < last; i++) {
    const [kind, start, end] = tokens[i];
    if (kind === CssToken.Comment && !isCustomProperty) {
      value += ' ';
    } else if (kind === CssToken.Delim && end === text.length && text[start] === '\\') {
      // CSS reads an escape at the end of the input as U+FFFD. Completing it keeps the backslash
      // from escaping the separator of a declaration joined after this one.
      value += '\ufffd';
    } else {
      value += text.slice(start, end);
    }
  }
  return value === '' && !isCustomProperty ? null : [value, important];
}

/**
 * Writes the name of a style property the way CSS names the property, so that the names of one
 * property meet: an ordinary property in dash case and in lowercase, such as `font-size` for
 * `fontSize` or `COLOR`, a vendor-prefixed one with its leading dash, such as `-webkit-transform`
 * for `WebkitTransform` or `webkit-transform`, `float` for `cssFloat`, and a custom property as
 * written. The compiler writes `[style.WebkitTransform]` as `webkit-transform`, which this repairs.
 */
function canonicalPropertyName(property: string): string {
  if (property.startsWith('--')) {
    return property;
  }
  const name = property.replace(/[a-z][A-Z]/g, (pair) => `${pair[0]}-${pair[1]}`).toLowerCase();
  if (name === 'css-float') {
    return 'float';
  }
  return /^(webkit|moz|ms)-/.test(name) ? `-${name}` : name;
}

function foldDeclarations(
  sources: CollectedSources,
  value: string | null,
  ownerSource: AttributeSource,
): CollectedSources {
  const origins = new Map<string, AttributeSource>();
  for (let source = AttributeSource.Component; source <= AttributeSource.Template; source++) {
    for (const declaration of sources[source]) {
      origins.set(declaration, source);
    }
  }
  const folded: CollectedSources = [[], [], []];
  if (value !== null) {
    for (const declaration of readDeclarations(value)) {
      folded[origins.get(declaration) ?? ownerSource].push(declaration);
    }
  }
  return folded;
}

interface DecidedDeclaration {
  source: AttributeSource;
  declaration: string;
  important: boolean;
}

/**
 * Groups the element's style declarations by source, one per property.
 *
 * @param named Receives the name of every property that a source names, whatever its value.
 */
export function collectStyleSources(
  tData: TData,
  lView: LView,
  tAttributeResolver: TAttributeResolver,
  named: Set<string> | null,
): CollectedSources {
  // Insertion order of the map is the priority order. `null` marks a property that is removed.
  const decided = new Map<string, DecidedDeclaration | null>();
  for (const segment of tAttributeResolver.segments) {
    const source = segment.source;
    for (const [property, value, declaration] of segment.staticStyles!) {
      decideDeclaration(decided, property, value ?? undefined, source, named, declaration);
    }
    for (const binding of segment.bindings) {
      if (binding.kind === 'attribute') {
        const value = lView[binding.index];
        if (value !== NO_CHANGE && value != null) {
          const text = renderStringify(unwrapSafeValue(value));
          for (const [property, propertyValue, important] of parseDeclarationList(text)) {
            decideDeclaration(decided, property, [propertyValue, important], source, named);
          }
        }
        continue;
      }
      const rawKey = tData[binding.index] as TStylingKey;
      const key = Array.isArray(rawKey) ? rawKey[1] : rawKey;
      const value = lView[binding.index + 1];
      if (value === NO_CHANGE) {
        // The binding hasn't executed yet.
        continue;
      }
      if (key === null) {
        // `[style]` binding. Its normalized string keeps only the last declaration of a property,
        // which can drop an earlier important one, so a string is read as written.
        const raw = unwrapSafeValue(lView[binding.index]);
        if (typeof raw === 'string') {
          for (const [property, propertyValue, important] of parseDeclarationList(raw)) {
            decideDeclaration(decided, property, [propertyValue, important], source, named);
          }
          continue;
        }
        const styles = value as KeyValueArray<unknown>;
        for (let j = 0; j < styles.length; j += 2) {
          const property = canonicalPropertyName(styles[j] as string);
          const read = readBindingValue(property, styles[j + 1]);
          decideDeclaration(decided, property, read, source, named);
        }
      } else {
        // `[style.property]` binding.
        const property = canonicalPropertyName(key as string);
        decideDeclaration(decided, property, readBindingValue(property, value), source, named);
      }
    }
  }

  const sources: CollectedSources = [[], [], []];
  for (const decision of decided.values()) {
    if (decision !== null) {
      sources[decision.source].push(decision.declaration);
    }
  }
  return sources;
}

/**
 * @param value The value and its importance, `undefined` for no opinion, or `null` to remove it.
 * @param declaration The declaration that `writeDeclaration` writes for the value, when known.
 */
function decideDeclaration(
  decided: Map<string, DecidedDeclaration | null>,
  property: string,
  value: StyleValue | null | undefined,
  source: AttributeSource,
  named: Set<string> | null,
  declaration: string | null = null,
): void {
  named?.add(property);
  if (value === undefined) {
    return;
  }
  const important = value !== null && value[1];
  if (!important && decided.get(property)?.important) {
    // An important declaration wins over a later one that isn't, and over a later removal.
    return;
  }
  // Re-insert so the property moves to the position of the binding that decided it.
  decided.delete(property);
  decided.set(
    property,
    value === null
      ? null
      : {
          source,
          declaration: declaration ?? writeDeclaration(property, value[0], important),
          important,
        },
  );
}

interface StyleDeclaration {
  value: string;
  important: boolean;
  position: number;
}

/**
 * Evaluates a list of declarations into one declaration per property, keyed by property in the
 * order that they apply. As in CSS, the last declaration of a property wins, except that a
 * declaration marked `!important` wins over later ones that aren't. How the importance of a
 * shorthand and of its longhands interact isn't modeled.
 */
function evaluateDeclarations(text: string | null): Map<string, StyleDeclaration> {
  const declarations = new Map<string, StyleDeclaration>();
  if (text !== null) {
    for (const [property, value, important] of parseDeclarationList(text)) {
      if (!important && declarations.get(property)?.important) {
        continue;
      }
      // The winning declaration applies at its own position.
      declarations.delete(property);
      declarations.set(property, {value, important, position: 0});
    }
    let position = 0;
    for (const declaration of declarations.values()) {
      declaration.position = position++;
    }
  }
  return declarations;
}

/**
 * The properties that each CSS shorthand sets, from the CSS specifications: its longhands, and the
 * shorthands in it, such as `border-top` in `border`, which list their own. A shorthand that
 * resets a property without setting it from its value, as `border` resets `border-image`, lists
 * that property too. A legacy alias, such as `grid-gap`, lists the properties that it sets. A
 * property that isn't a key is its own only longhand.
 *
 * Logical and physical properties, vendor-prefixed aliases, and `all` aren't linked.
 */
const SHORTHAND_PROPERTIES = new Map<string, readonly string[]>([
  [
    'animation',
    [
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-delay',
      'animation-iteration-count',
      'animation-direction',
      'animation-fill-mode',
      'animation-play-state',
      'animation-timeline',
      'animation-range-start',
      'animation-range-end',
    ],
  ],
  ['animation-range', ['animation-range-start', 'animation-range-end']],
  [
    'background',
    [
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-attachment',
      'background-origin',
      'background-clip',
      'background-color',
    ],
  ],
  ['background-position', ['background-position-x', 'background-position-y']],
  ['border', ['border-top', 'border-right', 'border-bottom', 'border-left', 'border-image']],
  ['border-block', ['border-block-start', 'border-block-end']],
  ['border-block-color', ['border-block-start-color', 'border-block-end-color']],
  [
    'border-block-end',
    ['border-block-end-width', 'border-block-end-style', 'border-block-end-color'],
  ],
  [
    'border-block-start',
    ['border-block-start-width', 'border-block-start-style', 'border-block-start-color'],
  ],
  ['border-block-style', ['border-block-start-style', 'border-block-end-style']],
  ['border-block-width', ['border-block-start-width', 'border-block-end-width']],
  ['border-bottom', ['border-bottom-width', 'border-bottom-style', 'border-bottom-color']],
  [
    'border-color',
    ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
  ],
  [
    'border-image',
    [
      'border-image-source',
      'border-image-slice',
      'border-image-width',
      'border-image-outset',
      'border-image-repeat',
    ],
  ],
  ['border-inline', ['border-inline-start', 'border-inline-end']],
  ['border-inline-color', ['border-inline-start-color', 'border-inline-end-color']],
  [
    'border-inline-end',
    ['border-inline-end-width', 'border-inline-end-style', 'border-inline-end-color'],
  ],
  [
    'border-inline-start',
    ['border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color'],
  ],
  ['border-inline-style', ['border-inline-start-style', 'border-inline-end-style']],
  ['border-inline-width', ['border-inline-start-width', 'border-inline-end-width']],
  ['border-left', ['border-left-width', 'border-left-style', 'border-left-color']],
  [
    'border-radius',
    [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
    ],
  ],
  ['border-right', ['border-right-width', 'border-right-style', 'border-right-color']],
  [
    'border-style',
    ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
  ],
  ['border-top', ['border-top-width', 'border-top-style', 'border-top-color']],
  [
    'border-width',
    ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
  ],
  ['column-rule', ['column-rule-width', 'column-rule-style', 'column-rule-color']],
  ['columns', ['column-width', 'column-count', 'column-height', 'column-wrap']],
  ['contain-intrinsic-size', ['contain-intrinsic-width', 'contain-intrinsic-height']],
  ['container', ['container-name', 'container-type']],
  ['corner-block-end-shape', ['corner-end-start-shape', 'corner-end-end-shape']],
  ['corner-block-start-shape', ['corner-start-start-shape', 'corner-start-end-shape']],
  ['corner-bottom-shape', ['corner-bottom-left-shape', 'corner-bottom-right-shape']],
  ['corner-inline-end-shape', ['corner-start-end-shape', 'corner-end-end-shape']],
  ['corner-inline-start-shape', ['corner-start-start-shape', 'corner-end-start-shape']],
  ['corner-left-shape', ['corner-top-left-shape', 'corner-bottom-left-shape']],
  ['corner-right-shape', ['corner-top-right-shape', 'corner-bottom-right-shape']],
  [
    'corner-shape',
    [
      'corner-top-left-shape',
      'corner-top-right-shape',
      'corner-bottom-right-shape',
      'corner-bottom-left-shape',
    ],
  ],
  ['corner-top-shape', ['corner-top-left-shape', 'corner-top-right-shape']],
  ['flex', ['flex-grow', 'flex-shrink', 'flex-basis']],
  ['flex-flow', ['flex-direction', 'flex-wrap']],
  [
    'font',
    [
      'font-style',
      'font-variant',
      'font-weight',
      'font-width',
      'font-size',
      'line-height',
      'font-family',
      'font-size-adjust',
      'font-kerning',
      'font-optical-sizing',
      'font-feature-settings',
      'font-variation-settings',
      'font-language-override',
    ],
  ],
  ['font-stretch', ['font-width']],
  [
    'font-synthesis',
    [
      'font-synthesis-weight',
      'font-synthesis-style',
      'font-synthesis-small-caps',
      'font-synthesis-position',
    ],
  ],
  [
    'font-variant',
    [
      'font-variant-ligatures',
      'font-variant-caps',
      'font-variant-alternates',
      'font-variant-numeric',
      'font-variant-east-asian',
      'font-variant-position',
      'font-variant-emoji',
    ],
  ],
  ['gap', ['row-gap', 'column-gap']],
  ['grid', ['grid-template', 'grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow']],
  ['grid-area', ['grid-row', 'grid-column']],
  ['grid-column', ['grid-column-start', 'grid-column-end']],
  ['grid-column-gap', ['column-gap']],
  ['grid-gap', ['row-gap', 'column-gap']],
  ['grid-row', ['grid-row-start', 'grid-row-end']],
  ['grid-row-gap', ['row-gap']],
  ['grid-template', ['grid-template-rows', 'grid-template-columns', 'grid-template-areas']],
  ['inset', ['top', 'right', 'bottom', 'left']],
  ['inset-block', ['inset-block-start', 'inset-block-end']],
  ['inset-inline', ['inset-inline-start', 'inset-inline-end']],
  ['list-style', ['list-style-position', 'list-style-image', 'list-style-type']],
  ['margin', ['margin-top', 'margin-right', 'margin-bottom', 'margin-left']],
  ['margin-block', ['margin-block-start', 'margin-block-end']],
  ['margin-inline', ['margin-inline-start', 'margin-inline-end']],
  ['marker', ['marker-start', 'marker-mid', 'marker-end']],
  [
    'mask',
    [
      'mask-image',
      'mask-mode',
      'mask-position',
      'mask-size',
      'mask-repeat',
      'mask-origin',
      'mask-clip',
      'mask-composite',
      'mask-border',
    ],
  ],
  [
    'mask-border',
    [
      'mask-border-source',
      'mask-border-slice',
      'mask-border-width',
      'mask-border-outset',
      'mask-border-repeat',
      'mask-border-mode',
    ],
  ],
  [
    'offset',
    ['offset-position', 'offset-path', 'offset-distance', 'offset-rotate', 'offset-anchor'],
  ],
  ['outline', ['outline-width', 'outline-style', 'outline-color']],
  ['overflow', ['overflow-x', 'overflow-y']],
  ['overscroll-behavior', ['overscroll-behavior-x', 'overscroll-behavior-y']],
  ['padding', ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']],
  ['padding-block', ['padding-block-start', 'padding-block-end']],
  ['padding-inline', ['padding-inline-start', 'padding-inline-end']],
  ['page-break-after', ['break-after']],
  ['page-break-before', ['break-before']],
  ['page-break-inside', ['break-inside']],
  ['place-content', ['align-content', 'justify-content']],
  ['place-items', ['align-items', 'justify-items']],
  ['place-self', ['align-self', 'justify-self']],
  ['position-try', ['position-try-order', 'position-try-fallbacks']],
  [
    'scroll-margin',
    ['scroll-margin-top', 'scroll-margin-right', 'scroll-margin-bottom', 'scroll-margin-left'],
  ],
  ['scroll-margin-block', ['scroll-margin-block-start', 'scroll-margin-block-end']],
  ['scroll-margin-inline', ['scroll-margin-inline-start', 'scroll-margin-inline-end']],
  [
    'scroll-padding',
    ['scroll-padding-top', 'scroll-padding-right', 'scroll-padding-bottom', 'scroll-padding-left'],
  ],
  ['scroll-padding-block', ['scroll-padding-block-start', 'scroll-padding-block-end']],
  ['scroll-padding-inline', ['scroll-padding-inline-start', 'scroll-padding-inline-end']],
  ['scroll-timeline', ['scroll-timeline-name', 'scroll-timeline-axis']],
  ['text-box', ['text-box-trim', 'text-box-edge']],
  [
    'text-decoration',
    [
      'text-decoration-line',
      'text-decoration-style',
      'text-decoration-color',
      'text-decoration-thickness',
    ],
  ],
  ['text-emphasis', ['text-emphasis-style', 'text-emphasis-color']],
  ['text-wrap', ['text-wrap-mode', 'text-wrap-style']],
  [
    'timeline-trigger',
    ['timeline-trigger-name', 'timeline-trigger-source', 'timeline-trigger-range'],
  ],
  [
    'timeline-trigger-activation-range',
    ['timeline-trigger-activation-range-start', 'timeline-trigger-activation-range-end'],
  ],
  [
    'timeline-trigger-active-range',
    ['timeline-trigger-active-range-start', 'timeline-trigger-active-range-end'],
  ],
  [
    'timeline-trigger-range',
    ['timeline-trigger-activation-range', 'timeline-trigger-active-range'],
  ],
  [
    'transition',
    [
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
      'transition-behavior',
    ],
  ],
  ['view-timeline', ['view-timeline-name', 'view-timeline-axis', 'view-timeline-inset']],
  ['white-space', ['white-space-collapse', 'text-wrap-mode']],
  ['word-wrap', ['overflow-wrap']],
]);

function addLonghands(longhands: Set<string>, property: string): void {
  const properties = SHORTHAND_PROPERTIES.get(property);
  if (properties === undefined) {
    longhands.add(property);
    return;
  }
  for (const subproperty of properties) {
    addLonghands(longhands, subproperty);
  }
}

function setsLonghand(longhands: ReadonlySet<string>, property: string): boolean {
  const properties = SHORTHAND_PROPERTIES.get(property);
  if (properties === undefined) {
    return longhands.has(property);
  }
  for (const subproperty of properties) {
    if (setsLonghand(longhands, subproperty)) {
      return true;
    }
  }
  return false;
}

/**
 * Applies the resolved styles in order, after removing the properties that the previous resolution
 * set and this one doesn't.
 *
 * @param named On the first resolution of an element that hydration claimed, the properties that
 *     its sources name. The element holds the styles that the server resolved, and those that
 *     aren't named or resolved, such as styles that a constructor set, stay.
 */
export function applyResolvedStyles(
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
  lView: LView,
  resolved: string | null,
  named: Set<string> | null,
): void {
  const renderer = lView[RENDERER];
  const element = getNativeByTNode(tNode, lView) as RElement;
  const appliedIndex = tAttributeResolver.index + AttributeResolverSlot.AppliedValue;
  const next = evaluateDeclarations(resolved);
  // Before the first resolution, an element that hydration didn't claim has the static styles
  // from all sources.
  const previous =
    named === null
      ? ((lView[appliedIndex] as Map<string, StyleDeclaration> | null) ??
        evaluateDeclarations(tNode.styles))
      : null;
  lView[appliedIndex] = next;

  let written: Set<string> | null = null;
  let earlier: Set<string> | null = null;
  for (const property of previous === null ? named! : previous.keys()) {
    if (!next.has(property)) {
      applyStyling(renderer, false, element, property, null);
      addLonghands((written ??= new Set()), property);
    }
  }
  let highest = -1;
  for (const [property, declaration] of next) {
    const before = previous === null ? undefined : previous.get(property);
    const overlaps = written !== null && setsLonghand(written, property);
    let changed =
      before === undefined ||
      before.value !== declaration.value ||
      before.important !== declaration.important ||
      overlaps;
    if (before !== undefined) {
      if (before.position < highest) {
        changed = true;
      } else {
        highest = before.position;
      }
    }
    // A declaration that the previous resolution didn't set can be on the element already, as when
    // a constructor set it, before a declaration that comes before it in the result.
    const takesOver =
      before === undefined &&
      !overlaps &&
      setsLonghand((earlier ??= getLonghandsBefore(next, property)), property);
    if (changed) {
      // Removing a declaration before setting it again moves it to the end of the element's
      // declarations, so that the element serializes them in the resolved order, as on the server.
      if (before !== undefined || overlaps || takesOver) {
        applyStyling(renderer, false, element, property, null);
      }
      setResolvedStyle(renderer, element, property, declaration);
      addLonghands((written ??= new Set()), property);
    }
    if (earlier !== null) {
      addLonghands(earlier, property);
    }
  }
}

function getLonghandsBefore(
  declarations: Map<string, StyleDeclaration>,
  property: string,
): Set<string> {
  const longhands = new Set<string>();
  for (const other of declarations.keys()) {
    if (other === property) {
      break;
    }
    addLonghands(longhands, other);
  }
  return longhands;
}

/**
 * Sets a resolved declaration with the renderer, as `applyStyling` sets a style, except that its
 * importance comes from the declaration, so a value such as `\!important` isn't read as important.
 */
function setResolvedStyle(
  renderer: Renderer,
  element: RElement,
  property: string,
  declaration: StyleDeclaration,
) {
  let flags: number = property.includes('-') ? RendererStyleFlags2.DashCase : 0;
  if (declaration.important) {
    flags |= RendererStyleFlags2.Important;
  }
  // The renderer would remove a custom property set to `''`, but an empty value is a value.
  const value = declaration.value === '' ? ' ' : declaration.value;
  renderer.setStyle(element, property, value, flags || undefined);
}
