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
import {KeyValueArray} from '../../util/array_utils';
import {EMPTY_ARRAY} from '../../util/empty';
import {
  getAttributeResolverToken,
  callAttributeResolver,
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
  TAttributeBinding,
  TAttributeResolver,
  TAttributeSourceSegment,
  ɵRESOLVED_CLASSES_BRAND,
} from '../interfaces/attribute_resolver';
import {DirectiveDef} from '../interfaces/definition';
import {TAttributes, TDirectiveHostNode, TNode, TNodeType} from '../interfaces/node';
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
  }
  return TOKEN_LIST_ATTRIBUTES.has(name) ? AttributeGrammar.TokenList : AttributeGrammar.Scalar;
}

/** Gets the resolver data of an element's attribute `name`, or `null` if it isn't resolved. */
function getTAttributeResolver(tNode: TNode, name: string): TAttributeResolver | null {
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
 * Records that hydration claimed an element, for the first resolution of its classes. Call it when
 * the element is created.
 */
function seedHydratedValue(
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
  lView: LView,
): void {
  const appliedIndex = tAttributeResolver.index + AttributeResolverSlot.AppliedValue;
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
  return name === 'class';
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
function injectFromElement<T>(
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

  enableAttributeResolverHooks(refreshAttributeResolvers, registerAttributeResolverBinding);
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
function createTAttributeResolver(
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
    segments.push({source, directiveIndex, statics, bindings: []});
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
function registerAttributeResolverBinding(
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
 */
function refreshAttributeResolvers(tView: TView, lView: LView): void {
  const resolverNodes = tView.attributeResolvers!;
  try {
    for (let i = 0; i < resolverNodes.length; i++) {
      const tNode = tView.data[resolverNodes[i]] as TNode;
      for (const tAttributeResolver of tNode.attributeResolvers!) {
        if (
          tAttributeResolver.grammar === AttributeGrammar.Scalar ||
          tAttributeResolver.grammar === AttributeGrammar.TokenList
        ) {
          refreshValueResolver(lView, tNode, tAttributeResolver);
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
  const example = "(cn) => cn('px-4')";
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
function toResolverArguments(classes: readonly string[]): string[] {
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
function readClassNames(value: unknown): string[] {
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
function collectClassSources(
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
function applyResolvedClasses(
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
function collectValueSources(
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
function applyResolvedValue(
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
