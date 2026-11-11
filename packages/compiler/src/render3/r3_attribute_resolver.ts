/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../core';
import {ParsedEventType} from '../expression_parser/ast';
import {splitNsName} from '../ml_parser/tags';
import {DomElementSchemaRegistry} from '../schema/dom_element_schema_registry';
import {calcPossibleSecurityContexts} from '../template_parser/binding_parser';
import {splitAtColon} from '../util';

const ATTRIBUTE_PREFIX = 'attr.';

/**
 * The form of an event binding that resolves an attribute of its node: a shorthand such as
 * `(class)`, or the full form such as `(attr.class)`.
 */
export type AttributeResolverForm = 'shorthand' | 'fullForm';

/** An event binding that resolves an attribute of its node. */
export interface AttributeResolverBinding {
  /** Name of the resolved attribute, such as `class`. */
  readonly attribute: string;

  /** Form of the binding. */
  readonly form: AttributeResolverForm;
}

/**
 * Gets the attribute that an event binding resolves and the form of the binding, or `null` for an
 * ordinary event binding. `(attr.x)` resolves the attribute `x` for any `x` other than `style`;
 * whether `x` can be resolved is checked by `getAttributeResolverError`.
 */
export function getAttributeResolver(
  name: string,
  type: ParsedEventType,
  target: string | null,
): AttributeResolverBinding | null {
  if (type !== ParsedEventType.Regular) {
    return null;
  }

  if (target === null) {
    if (hasShorthand(name)) {
      return {attribute: name, form: 'shorthand'};
    }
    // Resolving `style` isn't supported yet, so `(attr.style)` stays an ordinary event binding.
    if (name.startsWith(ATTRIBUTE_PREFIX) && name.length > ATTRIBUTE_PREFIX.length) {
      const attribute = name.slice(ATTRIBUTE_PREFIX.length);
      return attribute === 'style' ? null : {attribute, form: 'fullForm'};
    }
    return null;
  }

  // The parser splits a namespaced name such as `attr.xlink:title` at its colon, into the target
  // `attr.xlink` and the name `title`.
  if (target.startsWith(ATTRIBUTE_PREFIX)) {
    return {attribute: `${target.slice(ATTRIBUTE_PREFIX.length)}:${name}`, form: 'fullForm'};
  }

  return null;
}

/**
 * Gets the attribute that a host listener resolves from its unparsed name, such as a key of a
 * directive's `host` listeners or the name of a `@HostListener`, or `null` for an ordinary
 * listener. The name splits at its colon the way the binding parser splits it, so
 * `' attr.xlink:title'` resolves `xlink:title`.
 */
export function getHostListenerAttributeResolver(rawName: string): AttributeResolverBinding | null {
  const [target, name] = splitAtColon(rawName, [null, rawName]);
  return getAttributeResolver(name!, ParsedEventType.Regular, target);
}

function hasShorthand(attribute: string): boolean {
  return attribute === 'class';
}

let domSchema: DomElementSchemaRegistry | null = null;

/**
 * Gets why an attribute can't be resolved, or `null` if it can. `tagName` is the element's name,
 * with its namespace, or `null` for a host binding, whose element isn't known, so the attribute is
 * checked on every element.
 */
export function getAttributeResolverError(
  attribute: string,
  tagName: string | null,
): string | null {
  if (attribute.includes(':')) {
    return (
      `Can't resolve the namespaced attribute '${attribute}'. Only attributes without a ` +
      `namespace can be resolved.`
    );
  }

  if (attribute.toLowerCase().startsWith('on')) {
    return `Can't resolve the event attribute '${attribute}' for security reasons.`;
  }

  domSchema ??= new DomElementSchemaRegistry();
  if (tagName === null) {
    const contexts = calcPossibleSecurityContexts(domSchema, null, attribute, true);
    if (contexts.some(needsSanitization)) {
      return (
        `Can't resolve the '${attribute}' attribute in a host binding, because its value needs ` +
        `sanitization on some elements.`
      );
    }
  } else if (needsSanitization(domSchema.securityContext(tagName, attribute, true))) {
    return (
      `Can't resolve the '${attribute}' attribute of <${splitNsName(tagName, false)[1]}>, because its ` +
      `value needs sanitization.`
    );
  }

  return null;
}

/** Whether a value in the given context needs sanitization. */
function needsSanitization(context: SecurityContext): boolean {
  return context !== SecurityContext.NONE;
}

/** Gets the error for a shorthand of `attribute`, such as `(class)`, that isn't a single expression. */
export function getShorthandChainError(attribute: string): string {
  return (
    `A '(${attribute})' shorthand must be a single expression, a function that receives the ` +
    `resolver. Bind '(attr.${attribute})' to run more than one statement.`
  );
}

/** Gets the error for a second resolver of `attribute` on one element or in one host. */
export function getMultipleAttributeResolversError(
  attribute: string,
  place: 'on one element' | 'in one host',
): string {
  const bindings = hasShorthand(attribute)
    ? `'(${attribute})' or '(attr.${attribute})' binding`
    : `'(attr.${attribute})' binding`;
  return `Can't have multiple ${attribute} resolvers ${place}. Use only one ${bindings}.`;
}

/**
 * Gets the error for a `@HostListener` that would declare a resolver of `attribute`: why the
 * attribute can't be resolved, or else where to declare the resolver instead.
 */
export function getHostListenerAttributeResolverError(
  eventName: string,
  attribute: string,
  handler: string,
): string {
  const unresolvable = getAttributeResolverError(attribute, null);
  if (unresolvable !== null) {
    return unresolvable;
  }
  return (
    `@HostListener('${eventName}') can't declare a ${attribute} resolver. Bind it in the host ` +
    `metadata instead: host: {'(${eventName})': '${handler}'}.`
  );
}
