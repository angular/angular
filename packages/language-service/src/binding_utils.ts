/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
  KW_MICROSYNTAX = 7,
  /** The identifier after "bind-", "let-", "ref-/#", "on-", "bindon-", "@", or "*" */
  IDENT_KW = 8,
  /** Identifier inside [()] */
  IDENT_BANANA_BOX = 9,
  /** Identifier inside [] */
  IDENT_PROPERTY = 10,
  /** Identifier inside () */
  IDENT_EVENT = 11,
}

export interface BindingDescriptor {
  kind: ATTR;
  name: string;
}
/**
 * Returns a descriptor for a given Angular attribute, or undefined if the attribute is
 * not an Angular attribute.
 */
export function getBindingDescriptor(attribute: string): BindingDescriptor|undefined {
  const bindParts = attribute.match(BIND_NAME_REGEXP);
  if (!bindParts) return;
  // The first match element is skipped because it matches the entire attribute text, including the
  // binding part.
  const kind = bindParts.findIndex((val, i) => i > 0 && val !== undefined);
  if (!(kind in ATTR)) {
    throw TypeError(`"${kind}" is not a valid Angular binding kind for "${attribute}"`);
  }
  return {
    kind,
    name: bindParts[ATTR.IDENT_KW],
  };
}
