/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';
import {Provider} from '../di/interface/provider';

import {AttributeResolver, ClassResolver} from './interfaces/attribute_resolver';

const attributeResolverTokens = /* @__PURE__ */ new Map<
  string,
  InjectionToken<ClassResolver | AttributeResolver | null>
>();

/**
 * Gets the token of the resolver of the attribute `name`, or `null` when no
 * `provideAttributeResolvers` call named it, so that no injector provides it.
 */
export function getAttributeResolverToken(
  name: string,
): InjectionToken<ClassResolver | AttributeResolver | null> | null {
  return attributeResolverTokens.get(name) ?? null;
}

function getOrCreateAttributeResolverToken(
  name: string,
): InjectionToken<ClassResolver | AttributeResolver | null> {
  let token = attributeResolverTokens.get(name);
  if (token === undefined) {
    token = new InjectionToken(
      typeof ngDevMode !== 'undefined' && ngDevMode ? `ATTRIBUTE_RESOLVER ${name}` : '',
    );
    attributeResolverTokens.set(name, token);
  }
  return token;
}

/**
 * Sets the resolvers that merge the attributes of elements with a resolver binding. The `class`
 * resolver merges the classes of elements with a `(class)` or `(attr.class)` binding, and the
 * resolver of another attribute, such as `aria-describedby`, merges that attribute's values for
 * elements with an `(attr.aria-describedby)` binding.
 *
 * Angular reads the classes of each source and the classes that the binding adds, then calls the
 * resolver with one argument per class, from the lowest to the highest priority. The classes that
 * the binding adds come right after the classes of its own source. Without a resolver, Angular
 * drops repeated names, keeping the first, and joins the rest with spaces.
 *
 * Another attribute's resolver receives one argument per value the same way: one per token for an
 * attribute that holds a list of tokens, such as `rel` or `aria-describedby`, and one per directive
 * or template that sets it for any other attribute. Without a resolver, a list of tokens takes
 * `joinTokens` and any other attribute `lastValue`. Event handler attributes, such as `onclick`,
 * can't be resolved; in dev mode, a key for one throws an error.
 *
 * Each binding looks the resolver of its attribute up from its element's injector, like a
 * dependency, so a component can resolve the elements of its own template with another resolver by
 * providing it in `viewProviders`. The resolvers compose per attribute: an attribute that the
 * nearest call doesn't name takes its resolver from the injectors above it, up to the element's
 * environment injector, such as a lazy route's, and a later call in the same providers replaces
 * only the resolvers that it names.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideAttributeResolvers({class: twMerge})],
 * });
 * ```
 *
 * @param resolvers The resolver of each attribute.
 *
 * @experimental 22.3
 */
export function provideAttributeResolvers(resolvers: {
  readonly class?: ClassResolver;
  readonly [name: string]: AttributeResolver | undefined;
}): Provider {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    for (const name of Object.keys(resolvers)) {
      if (name.toLowerCase().startsWith('on')) {
        throw new Error(
          `\`provideAttributeResolvers\` can't resolve the \`${name}\` attribute, because ` +
            'Angular never resolves an event handler attribute. Remove its key.',
        );
      }
    }
  }
  return Object.keys(resolvers).map((name) => ({
    provide: getOrCreateAttributeResolverToken(name),
    useValue: resolvers[name] ?? null,
  }));
}

/**
 * The resolver that Angular uses for an attribute that holds one value, such as `role` or
 * `data-testid`, without a resolver from `provideAttributeResolvers`: it returns the last value,
 * which has the highest priority, or `null` to remove the attribute when there's none.
 *
 * @param values The values of the attribute, from the lowest to the highest priority.
 *
 * @experimental 22.3
 */
export function lastValue(...values: string[]): string | null {
  return values.length === 0 ? null : values[values.length - 1];
}

/**
 * The resolver that Angular uses for an attribute that holds a list of tokens separated by
 * whitespace, such as `rel` or `aria-describedby`, without a resolver from
 * `provideAttributeResolvers`: it drops repeated tokens, keeping the first, and joins the rest with
 * a space. An empty result removes the attribute.
 *
 * @param tokens The tokens of the attribute, from the lowest to the highest priority. An argument
 *     that holds several tokens separated by whitespace counts as those tokens.
 *
 * @experimental 22.3
 */
export function joinTokens(...tokens: string[]): string {
  return joinTokenList(tokens);
}

function joinTokenList(tokens: readonly string[]): string {
  const joined = new Set<string>();
  for (const entry of tokens) {
    // Split on ASCII whitespace, the way the browser separates the tokens of an attribute.
    for (const token of entry.split(/[\t\n\f\r ]+/)) {
      if (token !== '') {
        joined.add(token);
      }
    }
  }
  return Array.from(joined).join(' ');
}

/**
 * The resolver that Angular uses for the `style` attribute without a resolver from
 * `provideAttributeResolvers`: it joins the declarations with `; `.
 *
 * @param declarations The style declarations of the element, such as `padding: 4px`, from the
 *     lowest to the highest priority.
 *
 * @experimental 22.3
 */
export function joinDeclarations(...declarations: string[]): string {
  return declarations.join('; ');
}

/** The separators of the resolvers that `joinValues` created, for `callAttributeResolver`. */
const joinValuesSeparators = /* @__PURE__ */ new WeakMap<AttributeResolver, string>();

/**
 * Calls `resolver` with `values`, one argument per value. A built-in rule, or a resolver that
 * `joinValues` created, reads the array itself, so a long list doesn't reach the engine's limit on
 * the number of arguments.
 */
export function callAttributeResolver(
  resolver: AttributeResolver,
  values: string[],
): string | null {
  if (resolver === lastValue) {
    return values.length === 0 ? null : values[values.length - 1];
  }
  if (resolver === joinTokens) {
    return joinTokenList(values);
  }
  if (resolver === joinDeclarations) {
    return values.join('; ');
  }
  const separator = joinValuesSeparators.get(resolver);
  if (separator !== undefined) {
    return values.length === 0 ? null : values.join(separator);
  }
  return resolver(...values) ?? null;
}

/**
 * Creates a resolver that joins the values of an attribute with `separator`, keeping repeated
 * values, such as `joinValues(', ')` for a `data-*` attribute that several directives set.
 *
 * ```ts
 * provideAttributeResolvers({'data-labels': joinValues(', ')});
 * ```
 *
 * @param separator The string to put between two values.
 * @returns A resolver that joins its arguments, from the lowest to the highest priority, or
 *     returns `null` to remove the attribute when there's none.
 *
 * @experimental 22.3
 */
export function joinValues(separator: string): AttributeResolver {
  const resolver: AttributeResolver = (...values) =>
    values.length === 0 ? null : values.join(separator);
  joinValuesSeparators.set(resolver, separator);
  return resolver;
}
