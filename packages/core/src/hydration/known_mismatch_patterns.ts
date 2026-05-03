/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RNode} from '../render3/interfaces/renderer_dom';

interface KnownMismatchContext {
  /** The DOM `nodeType` expected at the mismatch location. */
  expectedNodeType: number;
  /** The lowercase tag name expected (or `null` for non-element nodes). */
  expectedTagName: string | null;
  /** The actual node found at the location, or `null` if no node was found. */
  actualNode: RNode | null;
  /** The parent RNode (already resolved by the caller), or `null` if none. */
  parentRNode: RNode | null;
  /**
   * The tag name of the *expected* parent element (per the template), or `null`
   * if the expected parent is not an element. This may differ from the actual DOM parent
   * when the browser HTML parser has restructured the markup (for example by closing a
   * `<p>` early when a block-level child was encountered).
   */
  expectedParentTagName: string | null;
}

interface KnownMismatchPattern {
  /** Returns a tailored hint when the mismatch matches this pattern, otherwise `null`. */
  detect(ctx: KnownMismatchContext): string | null;
}

/** Tag names that the HTML parser will move into an auto-inserted `<tbody>`. */
const TABLE_BODY_CHILD_TAGS = new Set(['tr']);

/**
 * Detects the case where a template renders a `<table>` whose direct child is
 * `<tr>` (or other implicit-tbody children) without an explicit `<tbody>`.
 *
 * The HTML parser inserts a `<tbody>` element in this case, which means the
 * browser's actual DOM has an extra wrapping element compared to what Angular's
 * template expected. As a result Angular either finds a `<tbody>` element where
 * it expected a `<tr>`, or fails to find the node entirely.
 *
 * See https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intable.
 */
const tableMissingTbody: KnownMismatchPattern = {
  detect({expectedTagName, actualNode, parentRNode}: KnownMismatchContext): string | null {
    if (!expectedTagName || !TABLE_BODY_CHILD_TAGS.has(expectedTagName)) {
      return null;
    }
    const parent = parentRNode as Element | null;
    if (!parent || parent.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }
    if (parent.tagName.toLowerCase() !== 'table') {
      return null;
    }
    // Either the node is missing, or the browser inserted a <tbody> at this position.
    const actualIsTbody =
      actualNode != null &&
      (actualNode as Node).nodeType === Node.ELEMENT_NODE &&
      (actualNode as Element).tagName.toLowerCase() === 'tbody';
    if (actualNode != null && !actualIsTbody) {
      return null;
    }
    return (
      `Note: this looks like a known browser HTML normalization issue. ` +
      `When a <table> contains a <${expectedTagName}> as a direct child without an ` +
      `explicit <tbody>, the browser inserts a <tbody> element automatically. This ` +
      `produces a DOM that does not match the structure declared in the template, ` +
      `which breaks hydration.\n` +
      `To fix this, wrap the table rows in an explicit <tbody> element in the ` +
      `component's template.\n\n`
    );
  },
};

/**
 * Detects the case where a template renders a `<table>` whose direct child is
 * `<col>` without an explicit `<colgroup>`.
 *
 * The HTML parser inserts a `<colgroup>` element in this case, which means the
 * browser's actual DOM has an extra wrapping element compared to what Angular's
 * template expected. As a result Angular either finds a `<colgroup>` element
 * where it expected a `<col>`, or fails to find the node entirely.
 *
 * See https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intable.
 */
const tableMissingColgroup: KnownMismatchPattern = {
  detect({
    expectedTagName,
    actualNode,
    expectedParentTagName,
  }: KnownMismatchContext): string | null {
    if (expectedTagName !== 'col' || expectedParentTagName !== 'table') {
      return null;
    }
    // Either the node is missing, or the browser inserted a <colgroup> at this position.
    const actualIsColgroup =
      actualNode != null &&
      (actualNode as Node).nodeType === Node.ELEMENT_NODE &&
      (actualNode as Element).tagName.toLowerCase() === 'colgroup';
    if (actualNode != null && !actualIsColgroup) {
      return null;
    }
    return (
      `Note: this looks like a known browser HTML normalization issue. ` +
      `When a <table> contains a <col> as a direct child without an explicit ` +
      `<colgroup>, the browser inserts a <colgroup> element automatically. ` +
      `This changes the DOM shape declared in the template, which breaks ` +
      `hydration.\n` +
      `To fix this, wrap the <col> elements in an explicit <colgroup> element ` +
      `in the component's template.\n\n`
    );
  },
};

/**
 * Block-level (and other auto-closing) elements that, when encountered as a
 * descendant of `<p>`, cause the HTML parser to implicitly close the `<p>`
 * before opening the descendant, splitting the paragraph into siblings.
 *
 * Mirrors the entries in
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-p-element
 * (the "tag omission" rules) plus a few common block elements.
 */
const P_AUTO_CLOSING_CHILDREN = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'div',
  'dl',
  'fieldset',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
]);

/**
 * Detects nested `<a>` elements. Browsers do not allow an `<a>` element to
 * contain another `<a>` (interactive content cannot contain interactive
 * content). The HTML parser closes the outer `<a>` as soon as the inner one
 * is opened, splitting them into siblings.
 *
 * Common reproductions: a `routerLink` inside another `routerLink`, a card
 * component wrapped in a link with another link inside its body, etc.
 *
 * See https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element and
 * See https://github.com/angular/angular/issues/57914
 */
const nestedAnchor: KnownMismatchPattern = {
  detect({expectedTagName, expectedParentTagName}: KnownMismatchContext): string | null {
    if (expectedTagName !== 'a' || expectedParentTagName !== 'a') {
      return null;
    }
    return (
      `Note: this looks like a known browser HTML normalization issue. ` +
      `An <a> element cannot be nested inside another <a> element. The browser ` +
      `automatically closes the outer <a> when it encounters the inner one, which ` +
      `splits them into siblings and produces a DOM that does not match the ` +
      `structure declared in the template.\n` +
      `To fix this, restructure your template so that the <a> elements are ` +
      `siblings (not nested), or replace the inner element with a non-link ` +
      `container such as <button> or <span>.\n\n`
    );
  },
};

/**
 * Detects nested `<button>` elements. Browsers do not allow a `<button>`
 * element to contain another `<button>`. The HTML parser closes the outer
 * `<button>` before inserting the inner one, splitting them into siblings.
 *
 * See https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element.
 */
const nestedButton: KnownMismatchPattern = {
  detect({expectedTagName, expectedParentTagName}: KnownMismatchContext): string | null {
    if (expectedTagName !== 'button' || expectedParentTagName !== 'button') {
      return null;
    }
    return (
      `Note: this looks like a known browser HTML normalization issue. ` +
      `A <button> element cannot be nested inside another <button> element. ` +
      `The browser implicitly closes the outer <button> before inserting the ` +
      `inner <button>, which turns the expected parent-child structure into ` +
      `siblings and produces a DOM that does not match the structure declared ` +
      `in the template.\n` +
      `To fix this, restructure your template so that the <button> elements are ` +
      `siblings, or replace the outer clickable container with a non-button ` +
      `element plus proper accessibility handling.\n\n`
    );
  },
};

/**
 * Detects mismatches under a `<p>` element. The `<p>` element has an
 * "end tag omission" rule: when the parser encounters certain block-level
 * children (e.g. `<div>`, `<table>`, another `<p>`, headings, lists, etc.) it
 * implicitly closes the `<p>` first. The descendant becomes a sibling of the
 * `<p>` instead of a child, producing a DOM that does not match the template.
 *
 * The Angular template compiler already rejects literal block-in-`<p>` markup,
 * so runtime mismatches under `<p>` typically come from cross-component
 * composition (a child component renders a `<div>` / `<table>` / `<p>` / ...
 * as its root) or from `@defer` blocks rendered inside `<p>`. In both cases
 * Angular's mismatch fires on the *child component's host element* whose tag
 * name is unrelated to the auto-closing list, but the underlying cause is
 * the same. We therefore emit the hint whenever the expected parent (per
 * template) is `<p>` and either the expected child tag is in the auto-closing
 * set or the expected node is missing entirely from the (now-empty) `<p>`.
 *
 * See https://html.spec.whatwg.org/multipage/grouping-content.html#the-p-element
 * and https://github.com/angular/angular/issues/56990.
 */
const pBlockChild: KnownMismatchPattern = {
  detect({
    expectedTagName,
    expectedParentTagName,
    actualNode,
  }: KnownMismatchContext): string | null {
    if (expectedParentTagName !== 'p') {
      return null;
    }
    const isKnownBlockChild = !!expectedTagName && P_AUTO_CLOSING_CHILDREN.has(expectedTagName);
    // A missing-node case under <p> is almost always the early-close pattern
    // because the compiler rejects literal block-in-<p> templates; mismatches
    // here come from cross-component composition or @defer blocks.
    const isMissingChildOfP = actualNode === null;
    if (!isKnownBlockChild && !isMissingChildOfP) {
      return null;
    }
    const childDescription = isKnownBlockChild
      ? `The <${expectedTagName}> element`
      : `A block-level descendant`;
    return (
      `Note: this looks like a known browser HTML normalization issue. ` +
      `${childDescription} is not allowed inside a <p> element. ` +
      `The browser automatically closes the <p> when it encounters a block-level ` +
      `descendant, which splits the paragraph and the descendant into siblings ` +
      `and produces a DOM that does not match the structure declared in the ` +
      `template.\n` +
      `To fix this, replace the surrounding <p> with a non-paragraph container ` +
      `such as <div>, or move the descendant outside of the <p>. This commonly ` +
      `happens with child components whose root element is a block (e.g. <div>, ` +
      `<table>, another <p>) and with control flow blocks such as @defer ` +
      `rendered inside <p>.\n\n`
    );
  },
};

const KNOWN_MISMATCH_PATTERNS: KnownMismatchPattern[] = [
  tableMissingTbody,
  tableMissingColgroup,
  nestedAnchor,
  nestedButton,
  pBlockChild,
];

/**
 * Returns a tailored hint string for known browser HTML-normalization mismatches,
 * or an empty string when no known pattern applies.
 */
export function getKnownMismatchPatternHint(
  expectedNodeType: number,
  expectedTagName: string | null,
  actualNode: RNode | null,
  parentRNode: RNode | null,
  expectedParentTagName: string | null,
): string {
  const ctx: KnownMismatchContext = {
    expectedNodeType,
    expectedTagName,
    actualNode,
    parentRNode,
    expectedParentTagName,
  };

  for (const pattern of KNOWN_MISMATCH_PATTERNS) {
    const hint = pattern.detect(ctx);
    if (hint !== null) {
      return hint;
    }
  }

  return '';
}
