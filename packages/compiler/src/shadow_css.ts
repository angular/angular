/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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

  * ::slotted: ShadowDOM allows styling of the immediate projected element(s),
  but not elements nested inside that/those (essentially ng-content > *).
  https://developer.mozilla.org/en-US/docs/Web/CSS/::slotted
  This is emulated by targeting projected elements with the child selector,
  in combination with scope selectors. Invalid configurations will be replaced
  with -invalidslotted, which should not match anything.
  For example (assuming [x-host] as the host scope and [x-foo] the elements scope):

    ::slotted(*) {
      font-weight: bold;
    }
    p ::slotted(.x) {
      font-size: large;
    }

  becomes:

    [x-host] > *:not([x-foo]), [x-foo] > *:not([x-foo]) {
      font-weight: bold;
    }
    p[x-foo] [x-foo] > .x:not([x-foo]), p[x-foo] > .x:not([x-foo]) {
      font-size: large;
    }

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
    return cssText.replace(
        _cssContentNextSelectorRe, function(...m: string[]) { return m[2] + '{'; });
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
    return this._convertColonRule(cssText, _cssColonHostRe, this._colonHostPartReplacer);
  }

  /*
   * convert a rule like :host-context(.foo) > .bar { }
   *
   * to
   *
   * .foo<scopeName> > .bar, .foo scopeName > .bar { }
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
    return this._convertColonRule(
        cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
  }

  private _convertColonRule(cssText: string, regExp: RegExp, partReplacer: Function): string {
    // m[1] = :host(-context), m[2] = contents of (), m[3] rest of rule
    return cssText.replace(regExp, function(...m: string[]) {
      if (m[2]) {
        const parts = m[2].split(',');
        const r: string[] = [];
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i].trim();
          if (!p) break;
          r.push(partReplacer(_polyfillHostNoCombinator, p, m[3]));
        }
        return r.join(',');
      } else {
        return _polyfillHostNoCombinator + m[3];
      }
    });
  }

  private _colonHostContextPartReplacer(host: string, part: string, suffix: string): string {
    if (part.indexOf(_polyfillHost) > -1) {
      return this._colonHostPartReplacer(host, part, suffix);
    } else {
      return host + part + suffix + ', ' + part + ' ' + host + suffix;
    }
  }

  private _colonHostPartReplacer(host: string, part: string, suffix: string): string {
    return host + part.replace(_polyfillHost, '') + suffix;
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
          return otherParts.length || !/::slotted/.test(shallowPart) ?
              [applyScope(shallowPart), ...otherParts].join(' ') :
              this._applySlottedSelector(
                  shallowPart.trim(), applyScope, scopeSelector, hostSelector);
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

  // ::slotted selectors should be converted to target the immediate child of
  // content projection. This either means the child or children of the host
  // or the scoped elements, which do not have the scoped selector.
  // `::slotted(*)` is transformed to
  // `[x-host] > *:not([x-foo]), [x-foo] > *:not([x-foo])`
  // `p ::slotted(.x)` is transformed to
  // `p[x-foo] [x-foo] > .x:not([x-foo]), p[x-foo] > .x:not([x-foo])`
  private _applySlottedSelector(
      selector: string, applyScope: (shallowPart: string) => string, scopeSelector: string,
      hostSelector: string) {
    const [preSlottedSelector, combinator, slottedSelector] =
        this._separateSlottedParts(selector, applyScope);
    const applySlotted = (...parts: string[]) =>
        parts.map(s => `${s} ${combinator || '>'} ${slottedSelector}:not([${scopeSelector}])`)
            .join(', ');
    if (combinator) {
      return applySlotted(`${preSlottedSelector}`);
    } else if (preSlottedSelector) {
      return applySlotted(`${preSlottedSelector} [${scopeSelector}]`, preSlottedSelector);
    } else {
      return applySlotted(`[${hostSelector}]`, `[${scopeSelector}]`);
    }
  }

  // Separate the ::slotted selector into the part before the selector, the combinator before
  // the selector and the part inside it.
  // e.g.
  // `::slotted(*)` is split into `'', '', '*'`
  // `p::slotted(*)` is split into `'p[x-foo]', '', '-invalidslotted'`
  // `p ::slotted(*)` is split into `'p[x-foo]', '', '*'`
  // `p>::slotted(*)` is split into `'p[x-foo]', '>', '*'`
  // For selectors trying to escape the host, -invalidslotted is returned
  // e.g. `:host+::slotted(*)` is split into `'[x-host]', '+', '-invalidslotted'`
  private _separateSlottedParts(selector: string, applyScope: (shallowPart: string) => string) {
    const [preSelectorPart, slottedPart] = selector.split(_slottedSelector);
    if (!preSelectorPart.trim()) {
      return ['', '', this._extractSlottedCompoundSelector(slottedPart)];
    }

    const match = preSelectorPart.trim().match(/^([\w\W]*)(>|\+|~(?!=))$/);
    if (!match) {
      const slottedSelector = /\s$/.test(preSelectorPart) ?
          this._extractSlottedCompoundSelector(slottedPart) :
          _invalidSlottedSelector;
      return [applyScope(preSelectorPart), '', slottedSelector];
    } else {
      const slottedSelector = this._isValidHostSelector(match[1], match[2]) ?
          this._extractSlottedCompoundSelector(slottedPart) :
          _invalidSlottedSelector;
      return [applyScope(match[1]), match[2], slottedSelector];
    }
  }

  private _isValidHostSelector(selector: string, combinator: string) {
    if (!selector.trim() || combinator === '>') {
      return true;
    }

    const safeSelector = new SafeSelector(selector.trim());
    const lastSelector = safeSelector.content().split(_selectorSeparatorsRe).reverse()[0];
    return lastSelector.indexOf(_polyfillHost) === -1;
  }

  // If the given selector is not a valid compound selector (i.e. contains a separator)
  // a selector (-invalidslotted) is returned that should not match anything.
  private _extractSlottedCompoundSelector(selector: string) {
    selector = selector.trim();
    if (selector[0] !== '(' || selector[selector.length - 1] !== ')') {
      return _invalidSlottedSelector;
    }

    selector = selector.substring(1, selector.length - 1).trim();
    const safeSelector = new SafeSelector(selector);
    return _selectorSeparatorsRe.test(safeSelector.content()) ? _invalidSlottedSelector : selector;
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
    selector = selector.replace(/(\[[^\]]*\])/g, (_, keep) => {
      const replaceBy = `__ph-${this.index}__`;
      this.placeholders.push(keep);
      this.index++;
      return replaceBy;
    });

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
    return content.replace(/__ph-(\d+)__/g, (ph, index) => this.placeholders[+index]);
  }

  content(): string { return this._content; }
}

const _cssContentNextSelectorRe =
    /polyfill-next-selector[^}]*content:[\s]*?(['"])(.*?)\1[;\s]*}([^{]*?){/gim;
const _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _cssContentUnscopedRuleRe =
    /(polyfill-unscoped-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _polyfillHost = '-shadowcsshost';
// note: :host-context pre-processed to -shadowcsshostcontext.
const _polyfillHostContext = '-shadowcsscontext';
const _parenSuffix = ')(?:\\((' +
    '(?:\\([^)(]*\\)|[^)(]*)+?' +
    ')\\))?([^,{]*)';
const _cssColonHostRe = new RegExp('(' + _polyfillHost + _parenSuffix, 'gim');
const _cssColonHostContextRe = new RegExp('(' + _polyfillHostContext + _parenSuffix, 'gim');
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
const _slottedSelector = /(?:::slotted)/g;
const _invalidSlottedSelector = '-invalidslotted';
const _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
const _polyfillHostRe = /-shadowcsshost/gim;
const _colonHostRe = /:host/gim;
const _colonHostContextRe = /:host-context/gim;

const _selectorSeparatorsRe = /( |>|\+|~(?!=))\s*/;
const _commentRe = /\/\*\s*[\s\S]*?\*\//g;

function stripComments(input: string): string {
  return input.replace(_commentRe, '');
}

const _commentWithHashRe = /\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g;

function extractCommentsWithHash(input: string): string[] {
  return input.match(_commentWithHashRe) || [];
}

const _ruleRe = /(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g;
const _curlyRe = /([{}])/g;
const OPEN_CURLY = '{';
const CLOSE_CURLY = '}';
const BLOCK_PLACEHOLDER = '%BLOCK%';

export class CssRule {
  constructor(public selector: string, public content: string) {}
}

export function processRules(input: string, ruleCallback: (rule: CssRule) => CssRule): string {
  const inputWithEscapedBlocks = escapeBlocks(input);
  let nextBlockIndex = 0;
  return inputWithEscapedBlocks.escapedString.replace(_ruleRe, function(...m: string[]) {
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
  });
}

class StringWithEscapedBlocks {
  constructor(public escapedString: string, public blocks: string[]) {}
}

function escapeBlocks(input: string): StringWithEscapedBlocks {
  const inputParts = input.split(_curlyRe);
  const resultParts: string[] = [];
  const escapedBlocks: string[] = [];
  let bracketCount = 0;
  let currentBlockParts: string[] = [];
  for (let partIndex = 0; partIndex < inputParts.length; partIndex++) {
    const part = inputParts[partIndex];
    if (part == CLOSE_CURLY) {
      bracketCount--;
    }
    if (bracketCount > 0) {
      currentBlockParts.push(part);
    } else {
      if (currentBlockParts.length > 0) {
        escapedBlocks.push(currentBlockParts.join(''));
        resultParts.push(BLOCK_PLACEHOLDER);
        currentBlockParts = [];
      }
      resultParts.push(part);
    }
    if (part == OPEN_CURLY) {
      bracketCount++;
    }
  }
  if (currentBlockParts.length > 0) {
    escapedBlocks.push(currentBlockParts.join(''));
    resultParts.push(BLOCK_PLACEHOLDER);
  }
  return new StringWithEscapedBlocks(resultParts.join(''), escapedBlocks);
}
