/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';
import {inject} from '../di/injector_compatibility';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {
  checkSecurityContext,
  MATH_ML_NAMESPACE,
  SecurityContext,
  SVG_NAMESPACE,
} from '../sanitization/dom_security_schema';

import {
  AUTO_RESOLVED_NAMES,
  callAttributeResolver,
  getAttributeResolverToken,
  joinDeclarations,
  joinTokens,
  lastValue,
} from './attribute_resolver_provider';
import {
  applyResolvedClasses,
  applyResolvedStyles,
  applyResolvedValue,
  collectClassSources,
  collectStyleSources,
  collectValueSources,
  createTAttributeResolver,
  getTAttributeResolver,
  injectFromElement,
  readClassNames,
  refreshAttributeResolvers,
  registerAttributeResolverBinding,
  seedHydratedValue,
  toResolverArguments,
} from './instructions/attribute_resolver';
import {enableAttributeResolverHooks} from './instructions/attribute_resolver_hook';
import {
  AttributeGrammar,
  AttributeResolver,
  AttributeResolverFeature,
  AttributeResolverFeatureKind,
  AttributeResolverSlot,
  ClassResolver,
  TAttributeResolver,
} from './interfaces/attribute_resolver';
import {ComponentDef} from './interfaces/definition';
import {TElementNode, TNode, TNodeName} from './interfaces/node';
import {RElement} from './interfaces/renderer_dom';
import {isComponentHost, isRootView} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, INJECTOR, LView, TView, TVIEW} from './interfaces/view';
import {getComponentLViewByIndex, getNativeByTNode} from './util/view_utils';

const AUTO_RESOLUTION = new InjectionToken<boolean>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'AUTO_RESOLUTION' : '',
);

/**
 * The names of the attributes that automatic resolution covers, for the whole process: `class`,
 * `style`, and the names of the `provideAttributeResolvers` calls with `withAutoResolution()` in
 * root providers that turn it on. A template sets up the names covered when it's first created.
 */
const autoResolvedNames = /* @__PURE__ */ new Set(['class', 'style']);

/**
 * Whether the root providers turn automatic resolution on. Its factory also adds their names to
 * `autoResolvedNames`.
 */
const AUTO_RESOLUTION_IN_ROOT = new InjectionToken<boolean>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'AUTO_RESOLUTION_IN_ROOT' : '',
  {
    providedIn: 'root',
    factory: () => {
      const isOn = inject(AUTO_RESOLUTION, {self: true, optional: true}) === true;
      if (isOn) {
        for (const names of inject(AUTO_RESOLVED_NAMES, {self: true, optional: true}) ?? []) {
          for (const name of names) {
            if (!name.includes(':') && !name.toLowerCase().startsWith('on')) {
              autoResolvedNames.add(name);
            }
          }
        }
      }
      return isOn;
    },
  },
);

/** The plain merge; `applyResolvedClasses` drops repeated names. */
const joinClasses: ClassResolver = (...classes) => classes.join(' ');

function getBuiltInRule(grammar: AttributeGrammar): ClassResolver | AttributeResolver {
  switch (grammar) {
    case AttributeGrammar.ClassList:
      return joinClasses;
    case AttributeGrammar.Declarations:
      return joinDeclarations;
    case AttributeGrammar.TokenList:
      return joinTokens;
    default:
      return lastValue;
  }
}

interface AutoResolution {
  readonly injectFromHost: <T>(token: InjectionToken<T>) => T | null;
  /**
   * The resolver of each name, or `null` for its built-in rule. A name that a root lists after the
   * view is created is looked up when an element of the view first needs it.
   */
  readonly resolvers: Map<string, ClassResolver | AttributeResolver | null>;
}

const autoResolutions = /* @__PURE__ */ new WeakMap<LView, AutoResolution>();

/**
 * Resolves every element that a component or directive matches, without a resolver binding: its
 * `class` and `style` attributes, and each attribute that a `provideAttributeResolvers` call with
 * this feature in the root providers names. Each attribute takes its resolver from
 * `provideAttributeResolvers`, or its built-in rule when no provider names it. This includes the
 * host of a component created in code and the component's host directives. An attribute with a
 * resolver binding, such as `(class)` or `(attr.role)`, is resolved only through its bindings.
 *
 * An attribute whose value is a URL, HTML, or a script on an element, such as the `href` of an
 * `<a>` or the `src` of an `<iframe>`, isn't resolved on that element, and neither is an event
 * handler attribute, such as `onclick`.
 *
 * Only the root providers, such as those of `bootstrapApplication`, can turn it on, and only their
 * calls list the attributes it covers. Below the root, a component turns automatic resolution off
 * for its template by providing `withAutoResolution(false)`, and back on by providing
 * `withAutoResolution()`. A `provideAttributeResolvers` call without this feature keeps the setting
 * of the providers above it, whichever resolvers it names, and a call below the root changes the
 * resolvers of the attributes, never which attributes are resolved. The templates nested in a
 * component's template take its setting. In dev mode, `withAutoResolution()` in providers below the
 * root while the root providers don't turn it on throws an error; in production, it's ignored.
 *
 * The attributes are listed for the whole application: a template that's first created before the
 * root providers that list an attribute are created doesn't resolve that attribute.
 *
 * Automatic resolution calls a resolver again only when the values of a source change.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideAttributeResolvers({class: twMerge, role: lastValue}, withAutoResolution())],
 * });
 * ```
 *
 * @param enabled Whether automatic resolution is on for the elements that the providers reach.
 *
 * @experimental 22.3
 */
export function withAutoResolution(enabled = true): AttributeResolverFeature {
  if (enabled) {
    enableAttributeResolverHooks(
      refreshAllAttributeResolvers,
      registerAttributeResolverBinding,
      setUpAttributeResolution,
    );
  }
  return {
    ɵkind: enabled
      ? AttributeResolverFeatureKind.AutoResolution
      : AttributeResolverFeatureKind.NoAutoResolution,
    ɵproviders: [{provide: AUTO_RESOLUTION, useValue: enabled}],
  };
}

function refreshAllAttributeResolvers(tView: TView, lView: LView): void {
  refreshAttributeResolvers(tView, lView, refreshAutoResolvedAttribute);
}

function setUpAttributeResolution(tView: TView, lView: LView, tNode: TElementNode): void {
  if (isRootView(lView)) {
    const injector = lView[INJECTOR];
    decideAutoResolution(lView, (token) => injector.get(token, null), lView, tNode, false);
  }

  if (tView.firstCreatePass) {
    for (const name of autoResolvedNames) {
      if (getTAttributeResolver(tNode, name) === null && isResolvableOn(tNode, lView, name)) {
        createTAttributeResolver(tView, lView, tNode, name, AttributeResolverSlot.AutoSources + 1);
      }
    }
  }
  const autoResolution = autoResolutions.get(lView[DECLARATION_COMPONENT_VIEW]);
  if (autoResolution !== undefined && tNode.attributeResolvers !== null) {
    for (const tAttributeResolver of tNode.attributeResolvers) {
      if (tAttributeResolver.owners.length === 0) {
        lView[tAttributeResolver.index + AttributeResolverSlot.AutoResolver] =
          getAutoResolver(autoResolution, tAttributeResolver.name) ??
          getBuiltInRule(tAttributeResolver.grammar);
        seedHydratedValue(tNode, tAttributeResolver, lView);
      }
    }
  }

  if (isComponentHost(tNode)) {
    decideAutoResolution(
      getComponentLViewByIndex(tNode.index, lView),
      (token) => injectFromElement(tNode, lView, token, true),
      lView,
      tNode,
      autoResolutions.has(lView[DECLARATION_COMPONENT_VIEW]),
    );
  }
}

/**
 * Whether automatic resolution can resolve the attribute `name` of an element: unless the
 * attribute's value is a URL, HTML, or a script there, which a resolved value would bypass the
 * sanitizer for. `style` is resolved, because `[style]` bindings aren't sanitized either.
 */
function isResolvableOn(tNode: TElementNode, lView: LView, name: string): boolean {
  if (name === 'class' || name === 'style') {
    return true;
  }
  let tagName: string | null = tNode.value;
  let namespace: string | null | undefined = tNode.namespace;
  if (tagName === TNodeName.DynamicHost) {
    const element = getNativeByTNode(tNode, lView) as HostElement;
    tagName = getLocalName(element);
    namespace ??= getNamespace(element);
    if (tagName === null || namespace === undefined) {
      // Nothing tells which element the host is, so which attributes are safe to resolve.
      return false;
    }
  }
  const context = checkSecurityContext(tagName, name, namespace);
  return context === SecurityContext.NONE || context === SecurityContext.STYLE;
}

/**
 * The host of a component created in code, from the DOM or from a renderer. A renderer's element
 * can lack `localName` and `namespaceURI`, which `RElement` doesn't declare.
 */
type HostElement = RElement & {localName?: unknown; namespaceURI?: unknown};

/**
 * Gets the name of a host created in code without a prefix, as the security schema lists it: `a`
 * for an element created with the qualified name `svg:a`, whose tag name is `svg:a`. An element
 * from a renderer without `localName` falls back to its tag name, or `null` when it has none.
 */
function getLocalName(element: HostElement): string | null {
  if (typeof element.localName === 'string') {
    return element.localName;
  }
  const tagName = element.tagName as unknown;
  return typeof tagName === 'string' ? tagName.slice(tagName.indexOf(':') + 1) : null;
}

/**
 * Gets the namespace of a host created in code, as the security schema names it: `svg`, `math`, or
 * `null` for any other namespace, or `undefined` when the host doesn't tell its namespace, as an
 * element from a renderer without `namespaceURI` doesn't. An element without a namespace has a
 * `namespaceURI` of `null`, which the schema reads like HTML.
 */
function getNamespace(element: HostElement): string | null | undefined {
  const namespaceURI = element.namespaceURI;
  if (typeof namespaceURI !== 'string') {
    return namespaceURI === null ? null : undefined;
  }
  return namespaceURI === 'http://www.w3.org/2000/svg'
    ? SVG_NAMESPACE
    : namespaceURI === 'http://www.w3.org/1998/Math/MathML'
      ? MATH_ML_NAMESPACE
      : null;
}

/**
 * @param injectFromHost Looks a token up the way the view's template sees it.
 * @param isOnInDeclarationView Whether automatic resolution is on in the view that declares the
 *     host, which means the root providers turn it on.
 */
function decideAutoResolution(
  view: LView,
  injectFromHost: <T>(token: InjectionToken<T>) => T | null,
  hostLView: LView,
  hostTNode: TNode,
  isOnInDeclarationView: boolean,
): void {
  if (injectFromHost(AUTO_RESOLUTION) !== true) {
    return;
  }
  if (!isOnInDeclarationView && !hostLView[INJECTOR].get(AUTO_RESOLUTION_IN_ROOT, false)) {
    if (ngDevMode) {
      const component = hostLView[TVIEW].data[
        hostTNode.directiveStart + hostTNode.componentOffset
      ] as ComponentDef<unknown>;
      throw new RuntimeError(
        RuntimeErrorCode.AUTO_ATTRIBUTE_RESOLUTION_BELOW_ROOT,
        `Automatic resolution is turned on for \`${component.type.name}\` by ` +
          "`withAutoResolution()` in providers below the root, but the root providers don't " +
          'declare it. Provide `provideAttributeResolvers({class: resolver}, withAutoResolution())` ' +
          'in the root providers, such as those of `bootstrapApplication()`.',
      );
    }
    return;
  }
  const autoResolution: AutoResolution = {injectFromHost, resolvers: new Map()};
  // The names are read after the check above, which lists the names of the root providers.
  for (const name of autoResolvedNames) {
    getAutoResolver(autoResolution, name);
  }
  autoResolutions.set(view, autoResolution);
}

function getAutoResolver(
  autoResolution: AutoResolution,
  name: string,
): ClassResolver | AttributeResolver | null {
  const resolvers = autoResolution.resolvers;
  if (resolvers.has(name)) {
    return resolvers.get(name) ?? null;
  }
  const token = getAttributeResolverToken(name);
  const resolver = token === null ? null : autoResolution.injectFromHost(token);
  resolvers.set(name, resolver);
  return resolver;
}

function refreshAutoResolvedAttribute(
  tView: TView,
  lView: LView,
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
): void {
  const resolver = lView[tAttributeResolver.index + AttributeResolverSlot.AutoResolver] as
    ClassResolver | AttributeResolver | null;
  if (resolver === null) {
    return;
  }
  switch (tAttributeResolver.grammar) {
    case AttributeGrammar.ClassList:
      refreshAutoResolvedClasses(
        tView,
        lView,
        tNode,
        tAttributeResolver,
        resolver as ClassResolver,
      );
      break;
    case AttributeGrammar.Declarations:
      refreshAutoResolvedStyles(tView, lView, tNode, tAttributeResolver, resolver);
      break;
    default:
      refreshAutoResolvedValue(lView, tNode, tAttributeResolver, resolver);
  }
}

function refreshAutoResolvedClasses(
  tView: TView,
  lView: LView,
  tNode: TNode,
  tClassResolver: TAttributeResolver,
  resolver: ClassResolver,
): void {
  const index = tClassResolver.index;
  const previous = lView[index + AttributeResolverSlot.AutoSources] as string[] | null;
  if (previous !== null && !hasSources(tClassResolver)) {
    // Unlike other attributes, an element without sources resolves once, which drops the classes
    // that only the server resolved. Sources are never removed, so they haven't changed.
    return;
  }
  const sources = collectClassSources(tView.data, lView, tClassResolver);
  const classes = sources.map((classNames) => classNames.join(' '));
  if (
    previous !== null &&
    previous[0] === classes[0] &&
    previous[1] === classes[1] &&
    previous[2] === classes[2]
  ) {
    return;
  }
  applyResolvedClasses(
    tNode,
    tClassResolver,
    lView,
    readClassNames(
      resolver === joinClasses
        ? toResolverArguments(sources.flat()).join(' ')
        : callAttributeResolver(resolver, toResolverArguments(sources.flat())),
    ),
  );
  lView[index + AttributeResolverSlot.AutoSources] = classes;
}

function refreshAutoResolvedStyles(
  tView: TView,
  lView: LView,
  tNode: TNode,
  tStyleResolver: TAttributeResolver,
  resolver: AttributeResolver,
): void {
  if (!hasSources(tStyleResolver)) {
    return;
  }
  const index = tStyleResolver.index;
  const named =
    lView[index + AttributeResolverSlot.AppliedValue] === true ? new Set<string>() : null;
  const sources = collectStyleSources(tView.data, lView, tStyleResolver, named);
  const sourcesIndex = index + AttributeResolverSlot.AutoSources;
  if (haveSameValues(lView[sourcesIndex] as string[][] | null, sources)) {
    return;
  }
  applyResolvedStyles(
    tNode,
    tStyleResolver,
    lView,
    callAttributeResolver(resolver, sources.flat()),
    named,
  );
  lView[sourcesIndex] = sources;
}

function refreshAutoResolvedValue(
  lView: LView,
  tNode: TNode,
  tAttributeResolver: TAttributeResolver,
  resolver: AttributeResolver,
): void {
  if (!hasSources(tAttributeResolver)) {
    return;
  }
  const sources = collectValueSources(lView, tNode, tAttributeResolver);
  const sourcesIndex = tAttributeResolver.index + AttributeResolverSlot.AutoSources;
  if (haveSameValues(lView[sourcesIndex] as string[][] | null, sources)) {
    return;
  }
  const resolved = callAttributeResolver(resolver, sources.flat());
  applyResolvedValue(
    tNode,
    tAttributeResolver,
    lView,
    tAttributeResolver.grammar === AttributeGrammar.TokenList && resolved === '' ? null : resolved,
  );
  lView[sourcesIndex] = sources;
}

function hasSources(tAttributeResolver: TAttributeResolver): boolean {
  return tAttributeResolver.segments.some(
    (segment) => segment.statics.length > 0 || segment.bindings.length > 0,
  );
}

function haveSameValues(previous: string[][] | null, sources: string[][]): boolean {
  return (
    previous !== null &&
    previous.every(
      (values, source) =>
        values.length === sources[source].length &&
        values.every((value, i) => value === sources[source][i]),
    )
  );
}
