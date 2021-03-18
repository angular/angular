/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This file is a port of shadowCSS from webcomponents.js to TypeScript.
 *
 * Please make sure to keep to edits in sync with the source file.
 *
 * Source:
 * https://github.com/webcomponents/webcomponentsjs/blob/4efecd7e0e/src/ShadowCSS/ShadowCSS.js
 *
 * The original file level comment is reproduced below
 */

/*
  This is a limited shim for ShadowDOM css styling.
  https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#styles

  The intention here is to support only the styling features which can be
  relatively simply implemented. The goal is to allow users to avoid the
  most obvious pitfalls and do so without compromising performance significantly.
  For ShadowDOM styling that's not covered here, a set of best practices
  can be provided that should allow users to accomplish more complex styling.

  The following is a list of specific ShadowDOM styling features and a brief
  discussion of the approach used to shim.

  Shimmed features:

  * :host, :host-context: ShadowDOM allows styling of the shadowRoot's host
  element using the :host rule. To shim this feature, the :host styles are
  reformatted and prefixed with a given scope name and promoted to a
  document level stylesheet.
  For example, given a scope name of .foo, a rule like this:

    :host {
        background: red;
      }
    }

  becomes:

    .foo {
      background: red;
    }

  * encapsulation: Styles defined within ShadowDOM, apply only to
  dom inside the ShadowDOM. Polymer uses one of two techniques to implement
  this feature.

  By default, rules are prefixed with the host element tag name
  as a descendant selector. This ensures styling does not leak out of the 'top'
  of the element's ShadowDOM. For example,

  div {
      font-weight: bold;
    }

  becomes:

  x-foo div {
      font-weight: bold;
    }

  becomes:


  Alternatively, if WebComponents.ShadowCSS.strictStyling is set to true then
  selectors are scoped by adding an attribute selector suffix to each
  simple selector that contains the host element tag name. Each element
  in the element's ShadowDOM template is also given the scope attribute.
  Thus, these rules match only elements that have the scope attribute.
  For example, given a scope name of x-foo, a rule like this:

    div {
      font-weight: bold;
    }

  becomes:

    div[x-foo] {
      font-weight: bold;
    }

  Note that elements that are dynamically added to a scope must have the scope
  selector added to them manually.

  * upper/lower bound encapsulation: Styles which are defined outside a
  shadowRoot should not cross the ShadowDOM boundary and should not apply
  inside a shadowRoot.

  This styling behavior is not emulated. Some possible ways to do this that
  were rejected due to complexity and/or performance concerns include: (1) reset
  every possible property for every possible selector for a given scope name;
  (2) re-implement css in javascript.

  As an alternative, users should make sure to use selectors
  specific to the scope in which they are working.

  * ::distributed: This behavior is not emulated. It's often not necessary
  to style the contents of a specific insertion point and instead, descendants
  of the host element can be styled selectively. Users can also create an
  extra node around an insertion point and style that node's contents
  via descendent selectors. For example, with a shadowRoot like this:

    <style>
      ::content(div) {
        background: red;
      }
    </style>
    <content></content>

  could become:

    <style>
      / *@polyfill .content-container div * /
      ::content(div) {
        background: red;
      }
    </style>
    <div class="content-container">
      <content></content>
    </div>

  Note the use of @polyfill in the comment above a ShadowDOM specific style
  declaration. This is a directive to the styling shim to use the selector
  in comments in lieu of the next selector when running under polyfill.
*/

export class ShadowCss {
  strictStyling: boolean = true;

  constructor() {}

  /*
   * Shim some cssText with the given selector. Returns cssText that can
   * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
   *
   * When strictStyling is true:
   * - selector is the attribute added to all elements inside the host,
   * - hostSelector is the attribute added to the host itself.
   */
  shimCssText(cssText: string, selector: string, hostSelector: string = ''): string {
    const commentsWithHash = extractCommentsWithHash(cssText);
    cssText = stripComments(cssText);
    cssText = this._insertDirectives(cssText);

    const scopedCssText = this._scopeCssText(cssText, selector, hostSelector);
    return [scopedCssText, ...commentsWithHash].join('\n');
  }

  private _insertDirectives(cssText: string): string {
    cssText = this._insertPolyfillDirectivesInCssText(cssText);
    return this._insertPolyfillRulesInCssText(cssText);
  }

  /*
   * Process styles to convert native ShadowDOM rules that will trip
   * up the css parser; we rely on decorating the stylesheet with inert rules.
   *
   * For example, we convert this rule:
   *
   * polyfill-next-selector { content: ':host menu-item'; }
   * ::content menu-item {
   *
   * to this:
   *
   * scopeName menu-item {
   *
   **/
  private _insertPolyfillDirectivesInCssText(cssText: string): string {
    // Difference with webcomponents.js: does not handle comments
    return cssText.replace(_cssContentNextSelectorRe, function(...m: string[]) {
      return m[2] + '{';
    });
  }

  /*
   * Process styles to add rules which will only apply under the polyfill
   *
   * For example, we convert this rule:
   *
   * polyfill-rule {
   *   content: ':host menu-item';
   * ...
   * }
   *
   * to this:
   *
   * scopeName menu-item {...}
   *
   **/
  private _insertPolyfillRulesInCssText(cssText: string): string {
    // Difference with webcomponents.js: does not handle comments
    return cssText.replace(_cssContentRuleRe, (...m: string[]) => {
      const rule = m[0].replace(m[1], '').replace(m[2], '');
      return m[4] + rule;
    });
  }

  /* Ensure styles are scoped. Pseudo-scoping takes a rule like:
   *
   *  .foo {... }
   *
   *  and converts this to
   *
   *  scopeName .foo { ... }
   */
  private _scopeCssText(cssText: string, scopeSelector: string, hostSelector: string): string {
    const unscopedRules = this._extractUnscopedRulesFromCssText(cssText);
    // replace :host and :host-context -shadowcsshost and -shadowcsshost respectively
    cssText = this._insertPolyfillHostInCssText(cssText);
    cssText = this._convertColonHost(cssText);
    cssText = this._convertColonHostContext(cssText);
    cssText = this._convertShadowDOMSelectors(cssText);
    if (scopeSelector) {
      cssText = this._scopeSelectors(cssText, scopeSelector, hostSelector);
    }
    cssText = cssText + '\n' + unscopedRules;
    return cssText.trim();
  }

  /*
   * Process styles to add rules which will only apply under the polyfill
   * and do not process via CSSOM. (CSSOM is destructive to rules on rare
   * occasions, e.g. -webkit-calc on Safari.)
   * For example, we convert this rule:
   *
   * @polyfill-unscoped-rule {
   *   content: 'menu-item';
   * ... }
   *
   * to this:
   *
   * menu-item {...}
   *
   **/
  private _extractUnscopedRulesFromCssText(cssText: string): string {
    // Difference with webcomponents.js: does not handle comments
    let r = '';
    let m: RegExpExecArray|null;
    _cssContentUnscopedRuleRe.lastIndex = 0;
    while ((m = _cssContentUnscopedRuleRe.exec(cssText)) !== null) {
      const rule = m[0].replace(m[2], '').replace(m[1], m[4]);
      r += rule + '\n\n';
    }
    return r;
  }

  /*
   * convert a rule like :host(.foo) > .bar { }
   *
   * to
   *
   * .foo<scopeName> > .bar
   */
  private _convertColonHost(cssText: string): string {
    return cssText.replace(_cssColonHostRe, (_, hostSelectors: string, otherSelectors: string) => {
      if (hostSelectors) {
        const convertedSelectors: string[] = [];
        const hostSelectorArray = hostSelectors.split(',').map(p => p.trim());
        for (const hostSelector of hostSelectorArray) {
          if (!hostSelector) break;
          const convertedSelector =
              _polyfillHostNoCombinator + hostSelector.replace(_polyfillHost, '') + otherSelectors;
          convertedSelectors.push(convertedSelector);
        }
        return convertedSelectors.join(',');
      } else {
        return _polyfillHostNoCombinator + otherSelectors;
      }
    });
  }

  /*
   * convert a rule like :host-context(.foo) > .bar { }
   *
   * to
   *
   * .foo<scopeName> > .bar, .foo <scopeName> > .bar { }
   *
   * and
   *
   * :host-context(.foo:host) .bar { ... }
   *
   * to
   *
   * .foo<scopeName> .bar { ... }
   */
  private _convertColonHostContext(cssText: string): string {
    return cssText.replace(_cssColonHostContextReGlobal, selectorText => {
      // We have captured a selector that contains a `:host-context` rule.

      // For backward compatibility `:host-context` may contain a comma separated list of selectors.
      // Each context selector group will contain a list of host-context selectors that must match
      // an ancestor of the host.
      // (Normally `contextSelectorGroups` will only contain a single array of context selectors.)
      const contextSelectorGroups: string[][] = [[]];

      // There may be more than `:host-context` in this selector so `selectorText` could look like:
      // `:host-context(.one):host-context(.two)`.
      // Execute `_cssColonHostContextRe` over and over until we have extracted all the
      // `:host-context` selectors from this selector.
      let match: RegExpMatchArray|null;
      while (match = _cssColonHostContextRe.exec(selectorText)) {
        // `match` = [':host-context(<selectors>)<rest>', <selectors>, <rest>]

        // The `<selectors>` could actually be a comma separated list: `:host-context(.one, .two)`.
        const newContextSelectors =
            (match[1] ?? '').trim().split(',').map(m => m.trim()).filter(m => m !== '');

        // We must duplicate the current selector group for each of these new selectors.
        // For example if the current groups are:
        // ```
        // [
        //   ['a', 'b', 'c'],
        //   ['x', 'y', 'z'],
        // ]
        // ```
        // And we have a new set of comma separated selectors: `:host-context(m,n)` then the new
        // groups are:
        // ```
        // [
        //   ['a', 'b', 'c', 'm'],
        //   ['x', 'y', 'z', 'm'],
        //   ['a', 'b', 'c', 'n'],
        //   ['x', 'y', 'z', 'n'],
        // ]
        // ```
        const contextSelectorGroupsLength = contextSelectorGroups.length;
        repeatGroups(contextSelectorGroups, newContextSelectors.length);
        for (let i = 0; i < newContextSelectors.length; i++) {
          for (let j = 0; j < contextSelectorGroupsLength; j++) {
            contextSelectorGroups[j + (i * contextSelectorGroupsLength)].push(
                newContextSelectors[i]);
          }
        }

        // Update the `selectorText` and see repeat to see if there are more `:host-context`s.
        selectorText = match[2];
      }

      // The context selectors now must be combined with each other to capture all the possible
      // selectors that `:host-context` can match. See `combineHostContextSelectors()` for more
      // info about how this is done.
      return contextSelectorGroups
          .map(contextSelectors => combineHostContextSelectors(contextSelectors, selectorText))
          .join(', ');
    });
  }

  /*
   * Convert combinators like ::shadow and pseudo-elements like ::content
   * by replacing with space.
   */
  private _convertShadowDOMSelectors(cssText: string): string {
    return _shadowDOMSelectorsRe.reduce((result, pattern) => result.replace(pattern, ' '), cssText);
  }

  // change a selector like 'div' to 'name div'
  private _scopeSelectors(cssText: string, scopeSelector: string, hostSelector: string): string {
    return processRules(cssText, (rule: CssRule) => {
      let selector = rule.selector;
      let content = rule.content;
      if (rule.selector[0] != '@') {
        selector =
            this._scopeSelector(rule.selector, scopeSelector, hostSelector, this.strictStyling);
      } else if (
          rule.selector.startsWith('@media') || rule.selector.startsWith('@supports') ||
          rule.selector.startsWith('@page') || rule.selector.startsWith('@document')) {
        content = this._scopeSelectors(rule.content, scopeSelector, hostSelector);
      }
      return new CssRule(selector, content);
    });
  }

  private _scopeSelector(
      selector: string, scopeSelector: string, hostSelector: string, strict: boolean): string {
    return selector.split(',')
        .map(part => part.trim().split(_shadowDeepSelectors))
        .map((deepParts) => {
          const [shallowPart, ...otherParts] = deepParts;
          const applyScope = (shallowPart: string) => {
            if (this._selectorNeedsScoping(shallowPart, scopeSelector)) {
              return strict ?
                  this._applyStrictSelectorScope(shallowPart, scopeSelector, hostSelector) :
                  this._applySelectorScope(shallowPart, scopeSelector, hostSelector);
            } else {
              return shallowPart;
            }
          };
          return [applyScope(shallowPart), ...otherParts].join(' ');
        })
        .join(', ');
  }

  private _selectorNeedsScoping(selector: string, scopeSelector: string): boolean {
    const re = this._makeScopeMatcher(scopeSelector);
    return !re.test(selector);
  }

  private _makeScopeMatcher(scopeSelector: string): RegExp {
    const lre = /\[/g;
    const rre = /\]/g;
    scopeSelector = scopeSelector.replace(lre, '\\[').replace(rre, '\\]');
    return new RegExp('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
  }

  private _applySelectorScope(selector: string, scopeSelector: string, hostSelector: string):
      string {
    // Difference from webcomponents.js: scopeSelector could not be an array
    return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
  }

  // scope via name and [is=name]
  private _applySimpleSelectorScope(selector: string, scopeSelector: string, hostSelector: string):
      string {
    // In Android browser, the lastIndex is not reset when the regex is used in String.replace()
    _polyfillHostRe.lastIndex = 0;
    if (_polyfillHostRe.test(selector)) {
      const replaceBy = this.strictStyling ? `[${hostSelector}]` : scopeSelector;
      return selector
          .replace(
              _polyfillHostNoCombinatorRe,
              (hnc, selector) => {
                return selector.replace(
                    /([^:]*)(:*)(.*)/,
                    (_: string, before: string, colon: string, after: string) => {
                      return before + replaceBy + colon + after;
                    });
              })
          .replace(_polyfillHostRe, replaceBy + ' ');
    }

    return scopeSelector + ' ' + selector;
  }

  // return a selector with [name] suffix on each simple selector
  // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
  private _applyStrictSelectorScope(selector: string, scopeSelector: string, hostSelector: string):
      string {
    const isRe = /\[is=([^\]]*)\]/g;
    scopeSelector = scopeSelector.replace(isRe, (_: string, ...parts: string[]) => parts[0]);

    const attrName = '[' + scopeSelector + ']';

    const _scopeSelectorPart = (p: string) => {
      let scopedP = p.trim();

      if (!scopedP) {
        return '';
      }

      if (p.indexOf(_polyfillHostNoCombinator) > -1) {
        scopedP = this._applySimpleSelectorScope(p, scopeSelector, hostSelector);
      } else {
        // remove :host since it should be unnecessary
        const t = p.replace(_polyfillHostRe, '');
        if (t.length > 0) {
          const matches = t.match(/([^:]*)(:*)(.*)/);
          if (matches) {
            scopedP = matches[1] + attrName + matches[2] + matches[3];
          }
        }
      }

      return scopedP;
    };

    const safeContent = new SafeSelector(selector);
    selector = safeContent.content();

    let scopedSelector = '';
    let startIndex = 0;
    let res: RegExpExecArray|null;
    const sep = /( |>|\+|~(?!=))\s*/g;

    // If a selector appears before :host it should not be shimmed as it
    // matches on ancestor elements and not on elements in the host's shadow
    // `:host-context(div)` is transformed to
    // `-shadowcsshost-no-combinatordiv, div -shadowcsshost-no-combinator`
    // the `div` is not part of the component in the 2nd selectors and should not be scoped.
    // Historically `component-tag:host` was matching the component so we also want to preserve
    // this behavior to avoid breaking legacy apps (it should not match).
    // The behavior should be:
    // - `tag:host` -> `tag[h]` (this is to avoid breaking legacy apps, should not match anything)
    // - `tag :host` -> `tag [h]` (`tag` is not scoped because it's considered part of a
    //   `:host-context(tag)`)
    const hasHost = selector.indexOf(_polyfillHostNoCombinator) > -1;
    // Only scope parts after the first `-shadowcsshost-no-combinator` when it is present
    let shouldScope = !hasHost;

    while ((res = sep.exec(selector)) !== null) {
      const separator = res[1];
      const part = selector.slice(startIndex, res.index).trim();
      shouldScope = shouldScope || part.indexOf(_polyfillHostNoCombinator) > -1;
      const scopedPart = shouldScope ? _scopeSelectorPart(part) : part;
      scopedSelector += `${scopedPart} ${separator} `;
      startIndex = sep.lastIndex;
    }

    const part = selector.substring(startIndex);
    shouldScope = shouldScope || part.indexOf(_polyfillHostNoCombinator) > -1;
    scopedSelector += shouldScope ? _scopeSelectorPart(part) : part;

    // replace the placeholders with their original values
    return safeContent.restore(scopedSelector);
  }

  private _insertPolyfillHostInCssText(selector: string): string {
    return selector.replace(_colonHostContextRe, _polyfillHostContext)
        .replace(_colonHostRe, _polyfillHost);
  }
}

class SafeSelector {
  private placeholders: string[] = [];
  private index = 0;
  private _content: string;

  constructor(selector: string) {
    // Replaces attribute selectors with placeholders.
    // The WS in [attr="va lue"] would otherwise be interpreted as a selector separator.
    selector = this._escapeRegexMatches(selector, /(\[[^\]]*\])/g);

    // CSS allows for certain special characters to be used in selectors if they're escaped.
    // E.g. `.foo:blue` won't match a class called `foo:blue`, because the colon denotes a
    // pseudo-class, but writing `.foo\:blue` will match, because the colon was escaped.
    // Replace all escape sequences (`\` followed by a character) with a placeholder so
    // that our handling of pseudo-selectors doesn't mess with them.
    selector = this._escapeRegexMatches(selector, /(\\.)/g);

    // Replaces the expression in `:nth-child(2n + 1)` with a placeholder.
    // WS and "+" would otherwise be interpreted as selector separators.
    this._content = selector.replace(/(:nth-[-\w]+)(\([^)]+\))/g, (_, pseudo, exp) => {
      const replaceBy = `__ph-${this.index}__`;
      this.placeholders.push(exp);
      this.index++;
      return pseudo + replaceBy;
    });
  }

  restore(content: string): string {
    return content.replace(/__ph-(\d+)__/g, (_ph, index) => this.placeholders[+index]);
  }

  content(): string {
    return this._content;
  }

  /**
   * Replaces all of the substrings that match a regex within a
   * special string (e.g. `__ph-0__`, `__ph-1__`, etc).
   */
  private _escapeRegexMatches(content: string, pattern: RegExp): string {
    return content.replace(pattern, (_, keep) => {
      const replaceBy = `__ph-${this.index}__`;
      this.placeholders.push(keep);
      this.index++;
      return replaceBy;
    });
  }
}

const _cssContentNextSelectorRe =
    /polyfill-next-selector[^}]*content:[\s]*?(['"])(.*?)\1[;\s]*}([^{]*?){/gim;
const _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _cssContentUnscopedRuleRe =
    /(polyfill-unscoped-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _polyfillHost = '-shadowcsshost';
// note: :host-context pre-processed to -shadowcsshostcontext.
const _polyfillHostContext = '-shadowcsscontext';
const _parenSuffix = '(?:\\((' +
    '(?:\\([^)(]*\\)|[^)(]*)+?' +
    ')\\))?([^,{]*)';
const _cssColonHostRe = new RegExp(_polyfillHost + _parenSuffix, 'gim');
const _cssColonHostContextReGlobal = new RegExp(_polyfillHostContext + _parenSuffix, 'gim');
const _cssColonHostContextRe = new RegExp(_polyfillHostContext + _parenSuffix, 'im');
const _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
const _polyfillHostNoCombinatorRe = /-shadowcsshost-no-combinator([^\s]*)/;
const _shadowDOMSelectorsRe = [
  /::shadow/g,
  /::content/g,
  // Deprecated selectors
  /\/shadow-deep\//g,
  /\/shadow\//g,
];

// The deep combinator is deprecated in the CSS spec
// Support for `>>>`, `deep`, `::ng-deep` is then also deprecated and will be removed in the future.
// see https://github.com/angular/angular/pull/17677
const _shadowDeepSelectors = /(?:>>>)|(?:\/deep\/)|(?:::ng-deep)/g;
const _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
const _polyfillHostRe = /-shadowcsshost/gim;
const _colonHostRe = /:host/gim;
const _colonHostContextRe = /:host-context/gim;

const _commentRe = /\/\*\s*[\s\S]*?\*\//g;

function stripComments(input: string): string {
  return input.replace(_commentRe, '');
}

const _commentWithHashRe = /\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g;

function extractCommentsWithHash(input: string): string[] {
  return input.match(_commentWithHashRe) || [];
}

const BLOCK_PLACEHOLDER = '%BLOCK%';
const QUOTE_PLACEHOLDER = '%QUOTED%';
const _ruleRe = /(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g;
const _quotedRe = /%QUOTED%/g;
const CONTENT_PAIRS = new Map([['{', '}']]);
const QUOTE_PAIRS = new Map([[`"`, `"`], [`'`, `'`]]);

export class CssRule {
  constructor(public selector: string, public content: string) {}
}

export function processRules(input: string, ruleCallback: (rule: CssRule) => CssRule): string {
  const inputWithEscapedQuotes = escapeBlocks(input, QUOTE_PAIRS, QUOTE_PLACEHOLDER);
  const inputWithEscapedBlocks =
      escapeBlocks(inputWithEscapedQuotes.escapedString, CONTENT_PAIRS, BLOCK_PLACEHOLDER);
  let nextBlockIndex = 0;
  let nextQuoteIndex = 0;
  return inputWithEscapedBlocks.escapedString
      .replace(
          _ruleRe,
          (...m: string[]) => {
            const selector = m[2];
            let content = '';
            let suffix = m[4];
            let contentPrefix = '';
            if (suffix && suffix.startsWith('{' + BLOCK_PLACEHOLDER)) {
              content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
              suffix = suffix.substring(BLOCK_PLACEHOLDER.length + 1);
              contentPrefix = '{';
            }
            const rule = ruleCallback(new CssRule(selector, content));
            return `${m[1]}${rule.selector}${m[3]}${contentPrefix}${rule.content}${suffix}`;
          })
      .replace(_quotedRe, () => inputWithEscapedQuotes.blocks[nextQuoteIndex++]);
}

class StringWithEscapedBlocks {
  constructor(public escapedString: string, public blocks: string[]) {}
}

function escapeBlocks(
    input: string, charPairs: Map<string, string>, placeholder: string): StringWithEscapedBlocks {
  const resultParts: string[] = [];
  const escapedBlocks: string[] = [];
  let openCharCount = 0;
  let nonBlockStartIndex = 0;
  let blockStartIndex = -1;
  let openChar: string|undefined;
  let closeChar: string|undefined;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '\\') {
      i++;
    } else if (char === closeChar) {
      openCharCount--;
      if (openCharCount === 0) {
        escapedBlocks.push(input.substring(blockStartIndex, i));
        resultParts.push(placeholder);
        nonBlockStartIndex = i;
        blockStartIndex = -1;
        openChar = closeChar = undefined;
      }
    } else if (char === openChar) {
      openCharCount++;
    } else if (openCharCount === 0 && charPairs.has(char)) {
      openChar = char;
      closeChar = charPairs.get(char);
      openCharCount = 1;
      blockStartIndex = i + 1;
      resultParts.push(input.substring(nonBlockStartIndex, blockStartIndex));
    }
  }
  if (blockStartIndex !== -1) {
    escapedBlocks.push(input.substring(blockStartIndex));
    resultParts.push(placeholder);
  } else {
    resultParts.push(input.substring(nonBlockStartIndex));
  }
  return new StringWithEscapedBlocks(resultParts.join(''), escapedBlocks);
}

/**
 * Combine the `contextSelectors` with the `hostMarker` and the `otherSelectors`
 * to create a selector that matches the same as `:host-context()`.
 *
 * Given a single context selector `A` we need to output selectors that match on the host and as an
 * ancestor of the host:
 *
 * ```
 * A <hostMarker>, A<hostMarker> {}
 * ```
 *
 * When there is more than one context selector we also have to create combinations of those
 * selectors with each other. For example if there are `A` and `B` selectors the output is:
 *
 * ```
 * AB<hostMarker>, AB <hostMarker>, A B<hostMarker>,
 * B A<hostMarker>, A B <hostMarker>, B A <hostMarker> {}
 * ```
 *
 * And so on...
 *
 * @param hostMarker the string that selects the host element.
 * @param contextSelectors an array of context selectors that will be combined.
 * @param otherSelectors the rest of the selectors that are not context selectors.
 */
function combineHostContextSelectors(contextSelectors: string[], otherSelectors: string): string {
  const hostMarker = _polyfillHostNoCombinator;
  _polyfillHostRe.lastIndex = 0;  // reset the regex to ensure we get an accurate test
  const otherSelectorsHasHost = _polyfillHostRe.test(otherSelectors);

  // If there are no context selectors then just output a host marker
  if (contextSelectors.length === 0) {
    return hostMarker + otherSelectors;
  }

  const combined: string[] = [contextSelectors.pop() || ''];
  while (contextSelectors.length > 0) {
    const length = combined.length;
    const contextSelector = contextSelectors.pop();
    for (let i = 0; i < length; i++) {
      const previousSelectors = combined[i];
      // Add the new selector as a descendant of the previous selectors
      combined[length * 2 + i] = previousSelectors + ' ' + contextSelector;
      // Add the new selector as an ancestor of the previous selectors
      combined[length + i] = contextSelector + ' ' + previousSelectors;
      // Add the new selector to act on the same element as the previous selectors
      combined[i] = contextSelector + previousSelectors;
    }
  }
  // Finally connect the selector to the `hostMarker`s: either acting directly on the host
  // (A<hostMarker>) or as an ancestor (A <hostMarker>).
  return combined
      .map(
          s => otherSelectorsHasHost ?
              `${s}${otherSelectors}` :
              `${s}${hostMarker}${otherSelectors}, ${s} ${hostMarker}${otherSelectors}`)
      .join(',');
}

/**
 * Mutate the given `groups` array so that there are `multiples` clones of the original array
 * stored.
 *
 * For example `repeatGroups([a, b], 3)` will result in `[a, b, a, b, a, b]` - but importantly the
 * newly added groups will be clones of the original.
 *
 * @param groups An array of groups of strings that will be repeated. This array is mutated
 *     in-place.
 * @param multiples The number of times the current groups should appear.
 */
export function repeatGroups<T>(groups: string[][], multiples: number): void {
  const length = groups.length;
  for (let i = 1; i < multiples; i++) {
    for (let j = 0; j < length; j++) {
      groups[j + (i * length)] = groups[j].slice(0);
    }
  }
}
