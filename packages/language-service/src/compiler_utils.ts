/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Matches an Angular attribute to a binding type. See `ATTR` for more details.
 *
 * This is adapted from packages/compiler/src/render3/r3_template_transform.ts
 * to allow empty binding names and match template attributes.
 */
const BIND_NAME_REGEXP =
    /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@)|(\*))(.*))|\[\(([^\)]*)\)\]|\[([^\]]*)\]|\(([^\)]*)\))$/;
/**
 * Represents possible Angular attribute bindings, as indices on a match of `BIND_NAME_REGEXP`.
 */
export enum ATTR {
  /** "bind-" */
  KW_BIND = 1,
  /** "let-" */
  KW_LET = 2,
  /** "ref-/#" */
  KW_REF = 3,
  /** "on-" */
  KW_ON = 4,
  /** "bindon-" */
  KW_BINDON = 5,
  /** "@" */
  KW_AT = 6,
  /**
   * "*"
   * Microsyntax template starts with '*'. See https://angular.io/api/core/TemplateRef
   */
  KW_TEMPLATE_ATTR = 7,
  /** The identifier after "bind-", "let-", "ref-/#", "on-", "bindon-", "@", or "*" */
  IDENT_KW = 8,
  /** Identifier inside [()] */
  IDENT_BANANA_BOX = 9,
  /** Identifier inside [] */
  IDENT_PROPERTY = 10,
  /** Identifier inside () */
  IDENT_EVENT = 11,
}

/**
 * Returns an Angular binding kind and name of a given attribute, or undefined if the attribute is
 * not an Angular attribute.
 */
export function getBindingKind(attribute: string): {bindingKind: ATTR, bindingName: string}|
    undefined {
  const bindParts = attribute.match(BIND_NAME_REGEXP);
  if (!bindParts) return undefined;
  const bindingKind = bindParts.findIndex((val, i) => i !== 0 && val !== undefined);
  return {
    bindingKind,
    bindingName: bindParts[ATTR.IDENT_KW],
  };
}
