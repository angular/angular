/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The following set contains all keywords that can be used in the animation css shorthand
 * property and is used during the scoping of keyframes to make sure such keywords
 * are not modified.
 */
const animationKeywords = new Set([
  // global values
  'inherit',
  'initial',
  'revert',
  'unset',
  // animation-direction
  'alternate',
  'alternate-reverse',
  'normal',
  'reverse',
  // animation-fill-mode
  'backwards',
  'both',
  'forwards',
  'none',
  // animation-play-state
  'paused',
  'running',
  // animation-timing-function
  'ease',
  'ease-in',
  'ease-in-out',
  'ease-out',
  'linear',
  'step-start',
  'step-end',
  // `steps()` function
  'end',
  'jump-both',
  'jump-end',
  'jump-none',
  'jump-start',
  'start',
]);

/**
 * The following array contains all of the CSS at-rule identifiers which are scoped.
 */
const scopedAtRuleIdentifiers = [
  '@media',
  '@supports',
  '@document',
  '@layer',
  '@container',
  '@scope',
  '@starting-style',
];

/**
 * The following class has its origin from a port of shadowCSS from webcomponents.js to TypeScript.
 * It has since diverge in many ways to tailor Angular's needs.
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
  dom inside the ShadowDOM.
  The selectors are scoped by adding an attribute selector suffix to each
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
  /*
   * Shim some cssText with the given selector. Returns cssText that can be included in the document
   *
   * The selector is the attribute added to all elements inside the host,
   * The hostSelector is the attribute added to the host itself.
   */
  shimCssText(cssText: string, selector: string, hostSelector: string = ''): string {
    // **NOTE**: Do not strip comments as this will cause component sourcemaps to break
    // due to shift in lines.

    // Collect comments and replace them with a placeholder, this is done to avoid complicating
    // the rule parsing RegExp and keep it safer.
    const comments: string[] = [];
    cssText = cssText.replace(_commentRe, (m) => {
      if (m.match(_commentWithHashRe)) {
        comments.push(m);
      } else {
        // Replace non hash comments with empty lines.
        // This is done so that we do not leak any sensitive data in comments.
        const newLinesMatches = m.match(_newLinesRe);
        comments.push((newLinesMatches?.join('') ?? '') + '\n');
      }

      return COMMENT_PLACEHOLDER;
    });

    cssText = this._insertDirectives(cssText);
    const scopedCssText = this._scopeCssText(cssText, selector, hostSelector);
    // Add back comments at the original position.
    let commentIdx = 0;
    return scopedCssText.replace(_commentWithHashPlaceHolderRe, () => comments[commentIdx++]);
  }

  private _insertDirectives(cssText: string): string {
    cssText = this._insertPolyfillDirectivesInCssText(cssText);
    return this._insertPolyfillRulesInCssText(cssText);
  }

  /**
   * Process styles to add scope to keyframes.
   *
   * Modify both the names of the keyframes defined in the component styles and also the css
   * animation rules using them.
   *
   * Animation rules using keyframes defined elsewhere are not modified to allow for globally
   * defined keyframes.
   *
   * For example, we convert this css:
   *
   * ```scss
   * .box {
   *   animation: box-animation 1s forwards;
   * }
   *
   * @keyframes box-animation {
   *   to {
   *     background-color: green;
   *   }
   * }
   * ```
   *
   * to this:
   *
   * ```scss
   * .box {
   *   animation: scopeName_box-animation 1s forwards;
   * }
   *
   * @keyframes scopeName_box-animation {
   *   to {
   *     background-color: green;
   *   }
   * }
   * ```
   *
   * @param cssText the component's css text that needs to be scoped.
   * @param scopeSelector the component's scope selector.
   *
   * @returns the scoped css text.
   */
  private _scopeKeyframesRelatedCss(cssText: string, scopeSelector: string): string {
    const unscopedKeyframesSet = new Set<string>();
    const scopedKeyframesCssText = processRules(cssText, (rule) =>
      this._scopeLocalKeyframeDeclarations(rule, scopeSelector, unscopedKeyframesSet),
    );
    return processRules(scopedKeyframesCssText, (rule) =>
      this._scopeAnimationRule(rule, scopeSelector, unscopedKeyframesSet),
    );
  }

  /**
   * Scopes local keyframes names, returning the updated css rule and it also
   * adds the original keyframe name to a provided set to collect all keyframes names
   * so that it can later be used to scope the animation rules.
   *
   * For example, it takes a rule such as:
   *
   * ```scss
   * @keyframes box-animation {
   *   to {
   *     background-color: green;
   *   }
   * }
   * ```
   *
   * and returns:
   *
   * ```scss
   * @keyframes scopeName_box-animation {
   *   to {
   *     background-color: green;
   *   }
   * }
   * ```
   * and as a side effect it adds "box-animation" to the `unscopedKeyframesSet` set
   *
   * @param cssRule the css rule to process.
   * @param scopeSelector the component's scope selector.
   * @param unscopedKeyframesSet the set of unscoped keyframes names (which can be
   * modified as a side effect)
   *
   * @returns the css rule modified with the scoped keyframes name.
   */
  private _scopeLocalKeyframeDeclarations(
    rule: CssRule,
    scopeSelector: string,
    unscopedKeyframesSet: Set<string>,
  ): CssRule {
    return {
      ...rule,
      selector: rule.selector.replace(
        /(^@(?:-webkit-)?keyframes(?:\s+))(['"]?)(.+)\2(\s*)$/,
        (_, start, quote, keyframeName, endSpaces) => {
          unscopedKeyframesSet.add(unescapeQuotes(keyframeName, quote));
          return `${start}${quote}${scopeSelector}_${keyframeName}${quote}${endSpaces}`;
        },
      ),
    };
  }

  /**
   * Function used to scope a keyframes name (obtained from an animation declaration)
   * using an existing set of unscopedKeyframes names to discern if the scoping needs to be
   * performed (keyframes names of keyframes not defined in the component's css need not to be
   * scoped).
   *
   * @param keyframe the keyframes name to check.
   * @param scopeSelector the component's scope selector.
   * @param unscopedKeyframesSet the set of unscoped keyframes names.
   *
   * @returns the scoped name of the keyframe, or the original name is the name need not to be
   * scoped.
   */
  private _scopeAnimationKeyframe(
    keyframe: string,
    scopeSelector: string,
    unscopedKeyframesSet: ReadonlySet<string>,
  ): string {
    return keyframe.replace(/^(\s*)(['"]?)(.+?)\2(\s*)$/, (_, spaces1, quote, name, spaces2) => {
      name = `${
        unscopedKeyframesSet.has(unescapeQuotes(name, quote)) ? scopeSelector + '_' : ''
      }${name}`;
      return `${spaces1}${quote}${name}${quote}${spaces2}`;
    });
  }

  /**
   * Regular expression used to extrapolate the possible keyframes from an
   * animation declaration (with possibly multiple animation definitions)
   *
   * The regular expression can be divided in three parts
   *  - (^|\s+|,)
   *    captures how many (if any) leading whitespaces are present or a comma
   *  - (?:(?:(['"])((?:\\\\|\\\2|(?!\2).)+)\2)|(-?[A-Za-z][\w\-]*))
   *    captures two different possible keyframes, ones which are quoted or ones which are valid css
   * indents (custom properties excluded)
   *  - (?=[,\s;]|$)
   *    simply matches the end of the possible keyframe, valid endings are: a comma, a space, a
   * semicolon or the end of the string
   */
  private _animationDeclarationKeyframesRe =
    /(^|\s+|,)(?:(?:(['"])((?:\\\\|\\\2|(?!\2).)+)\2)|(-?[A-Za-z][\w\-]*))(?=[,\s]|$)/g;

  /**
   * Scope an animation rule so that the keyframes mentioned in such rule
   * are scoped if defined in the component's css and left untouched otherwise.
   *
   * It can scope values of both the 'animation' and 'animation-name' properties.
   *
   * @param rule css rule to scope.
   * @param scopeSelector the component's scope selector.
   * @param unscopedKeyframesSet the set of unscoped keyframes names.
   *
   * @returns the updated css rule.
   **/
  private _scopeAnimationRule(
    rule: CssRule,
    scopeSelector: string,
    unscopedKeyframesSet: ReadonlySet<string>,
  ): CssRule {
    let content = rule.content.replace(
      /((?:^|\s+|;)(?:-webkit-)?animation\s*:\s*),*([^;]+)/g,
      (_, start, animationDeclarations) =>
        start +
        animationDeclarations.replace(
          this._animationDeclarationKeyframesRe,
          (
            original: string,
            leadingSpaces: string,
            quote = '',
            quotedName: string,
            nonQuotedName: string,
          ) => {
            if (quotedName) {
              return `${leadingSpaces}${this._scopeAnimationKeyframe(
                `${quote}${quotedName}${quote}`,
                scopeSelector,
                unscopedKeyframesSet,
              )}`;
            } else {
              return animationKeywords.has(nonQuotedName)
                ? original
                : `${leadingSpaces}${this._scopeAnimationKeyframe(
                    nonQuotedName,
                    scopeSelector,
                    unscopedKeyframesSet,
                  )}`;
            }
          },
        ),
    );
    content = content.replace(
      /((?:^|\s+|;)(?:-webkit-)?animation-name(?:\s*):(?:\s*))([^;]+)/g,
      (_match, start, commaSeparatedKeyframes) =>
        `${start}${commaSeparatedKeyframes
          .split(',')
          .map((keyframe: string) =>
            this._scopeAnimationKeyframe(keyframe, scopeSelector, unscopedKeyframesSet),
          )
          .join(',')}`,
    );
    return {...rule, content};
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
    return cssText.replace(_cssContentNextSelectorRe, function (...m: string[]) {
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
    // replace :host and :host-context with -shadowcsshost and -shadowcsshostcontext respectively
    cssText = this._insertPolyfillHostInCssText(cssText);
    cssText = this._convertColonHost(cssText);
    cssText = this._convertColonHostContext(cssText);
    cssText = this._convertShadowDOMSelectors(cssText);
    if (scopeSelector) {
      cssText = this._scopeKeyframesRelatedCss(cssText, scopeSelector);
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
    let r = '';
    let m: RegExpExecArray | null;
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
        const hostSelectorArray = hostSelectors.split(',').map((p) => p.trim());
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
    const length = cssText.length;
    let parens = 0;
    let prev = 0;
    let result = '';

    // Splits up the selectors on their top-level commas, processes the :host-context in them
    // individually and stitches them back together. This ensures that individual selectors don't
    // affect each other.
    for (let i = 0; i < length; i++) {
      const char = cssText[i];

      // If we hit a comma and there are no open parentheses, take the current chunk and process it.
      if (char === ',' && parens === 0) {
        result += this._convertColonHostContextInSelectorPart(cssText.slice(prev, i)) + ',';
        prev = i + 1;
        continue;
      }

      // We've hit the end. Take everything since the last comma.
      if (i === length - 1) {
        result += this._convertColonHostContextInSelectorPart(cssText.slice(prev));
        break;
      }

      if (char === '(') {
        parens++;
      } else if (char === ')') {
        parens--;
      }
    }

    return result;
  }

  private _convertColonHostContextInSelectorPart(cssText: string): string {
    return cssText.replace(_cssColonHostContextReGlobal, (selectorText, pseudoPrefix) => {
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
      let match: RegExpExecArray | null;
      while ((match = _cssColonHostContextRe.exec(selectorText))) {
        // `match` = [':host-context(<selectors>)<rest>', <selectors>, <rest>]

        // The `<selectors>` could actually be a comma separated list: `:host-context(.one, .two)`.
        const newContextSelectors = (match[1] ?? '')
          .trim()
          .split(',')
          .map((m) => m.trim())
          .filter((m) => m !== '');

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
            contextSelectorGroups[j + i * contextSelectorGroupsLength].push(newContextSelectors[i]);
          }
        }

        // Update the `selectorText` and see repeat to see if there are more `:host-context`s.
        selectorText = match[2];
      }

      // The context selectors now must be combined with each other to capture all the possible
      // selectors that `:host-context` can match. See `_combineHostContextSelectors()` for more
      // info about how this is done.
      return contextSelectorGroups
        .map((contextSelectors) =>
          _combineHostContextSelectors(contextSelectors, selectorText, pseudoPrefix),
        )
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
      if (rule.selector[0] !== '@') {
        selector = this._scopeSelector({
          selector,
          scopeSelector,
          hostSelector,
          isParentSelector: true,
        });
      } else if (scopedAtRuleIdentifiers.some((atRule) => rule.selector.startsWith(atRule))) {
        content = this._scopeSelectors(rule.content, scopeSelector, hostSelector);
      } else if (rule.selector.startsWith('@font-face') || rule.selector.startsWith('@page')) {
        content = this._stripScopingSelectors(rule.content);
      }
      return new CssRule(selector, content);
    });
  }

  /**
   * Handle a css text that is within a rule that should not contain scope selectors by simply
   * removing them! An example of such a rule is `@font-face`.
   *
   * `@font-face` rules cannot contain nested selectors. Nor can they be nested under a selector.
   * Normally this would be a syntax error by the author of the styles. But in some rare cases, such
   * as importing styles from a library, and applying `:host ::ng-deep` to the imported styles, we
   * can end up with broken css if the imported styles happen to contain @font-face rules.
   *
   * For example:
   *
   * ```
   * :host ::ng-deep {
   *   import 'some/lib/containing/font-face';
   * }
   *
   * Similar logic applies to `@page` rules which can contain a particular set of properties,
   * as well as some specific at-rules. Since they can't be encapsulated, we have to strip
   * any scoping selectors from them. For more information: https://www.w3.org/TR/css-page-3
   * ```
   */
  private _stripScopingSelectors(cssText: string): string {
    return processRules(cssText, (rule) => {
      const selector = rule.selector
        .replace(_shadowDeepSelectors, ' ')
        .replace(_polyfillHostNoCombinatorRe, ' ');
      return new CssRule(selector, rule.content);
    });
  }

  private _safeSelector: SafeSelector | undefined;
  private _shouldScopeIndicator: boolean | undefined;

  // `isParentSelector` is used to distinguish the selectors which are coming from
  // the initial selector string and any nested selectors, parsed recursively,
  // for example `selector = 'a:where(.one)'` could be the parent, while recursive call
  // would have `selector = '.one'`.
  private _scopeSelector({
    selector,
    scopeSelector,
    hostSelector,
    isParentSelector = false,
  }: {
    selector: string;
    scopeSelector: string;
    hostSelector: string;
    isParentSelector?: boolean;
  }): string {
    // Split the selector into independent parts by `,` (comma) unless
    // comma is within parenthesis, for example `:is(.one, two)`.
    // Negative lookup after comma allows not splitting inside nested parenthesis,
    // up to three levels (((,))).
    const selectorSplitRe =
      / ?,(?!(?:[^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\))) ?/;

    return selector
      .split(selectorSplitRe)
      .map((part) => part.split(_shadowDeepSelectors))
      .map((deepParts) => {
        const [shallowPart, ...otherParts] = deepParts;
        const applyScope = (shallowPart: string) => {
          if (this._selectorNeedsScoping(shallowPart, scopeSelector)) {
            return this._applySelectorScope({
              selector: shallowPart,
              scopeSelector,
              hostSelector,
              isParentSelector,
            });
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

  // scope via name and [is=name]
  private _applySimpleSelectorScope(
    selector: string,
    scopeSelector: string,
    hostSelector: string,
  ): string {
    // In Android browser, the lastIndex is not reset when the regex is used in String.replace()
    _polyfillHostRe.lastIndex = 0;
    if (_polyfillHostRe.test(selector)) {
      const replaceBy = `[${hostSelector}]`;
      let result = selector;
      while (result.match(_polyfillHostNoCombinatorRe)) {
        result = result.replace(_polyfillHostNoCombinatorRe, (_hnc, selector) => {
          return selector.replace(
            /([^:\)]*)(:*)(.*)/,
            (_: string, before: string, colon: string, after: string) => {
              return before + replaceBy + colon + after;
            },
          );
        });
      }
      return result.replace(_polyfillHostRe, replaceBy);
    }

    return scopeSelector + ' ' + selector;
  }

  // return a selector with [name] suffix on each simple selector
  // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
  private _applySelectorScope({
    selector,
    scopeSelector,
    hostSelector,
    isParentSelector,
  }: {
    selector: string;
    scopeSelector: string;
    hostSelector: string;
    isParentSelector?: boolean;
  }): string {
    const isRe = /\[is=([^\]]*)\]/g;
    scopeSelector = scopeSelector.replace(isRe, (_: string, ...parts: string[]) => parts[0]);

    const attrName = `[${scopeSelector}]`;

    const _scopeSelectorPart = (p: string) => {
      let scopedP = p.trim();

      if (!scopedP) {
        return p;
      }

      if (p.includes(_polyfillHostNoCombinator)) {
        scopedP = this._applySimpleSelectorScope(p, scopeSelector, hostSelector);
        if (!p.match(_polyfillHostNoCombinatorOutsidePseudoFunction)) {
          const [_, before, colon, after] = scopedP.match(/([^:]*)(:*)([\s\S]*)/)!;
          scopedP = before + attrName + colon + after;
        }
      } else {
        // remove :host since it should be unnecessary
        const t = p.replace(_polyfillHostRe, '');
        if (t.length > 0) {
          const matches = t.match(/([^:]*)(:*)([\s\S]*)/);
          if (matches) {
            scopedP = matches[1] + attrName + matches[2] + matches[3];
          }
        }
      }

      return scopedP;
    };

    // Wraps `_scopeSelectorPart()` to not use it directly on selectors with
    // pseudo selector functions like `:where()`. Selectors within pseudo selector
    // functions are recursively sent to `_scopeSelector()`.
    const _pseudoFunctionAwareScopeSelectorPart = (selectorPart: string) => {
      let scopedPart = '';

      // Collect all outer `:where()` and `:is()` selectors,
      // counting parenthesis to keep nested selectors intact.
      const pseudoSelectorParts = [];
      let pseudoSelectorMatch: RegExpExecArray | null;
      while (
        (pseudoSelectorMatch = _cssPrefixWithPseudoSelectorFunction.exec(selectorPart)) !== null
      ) {
        let openedBrackets = 1;
        let index = _cssPrefixWithPseudoSelectorFunction.lastIndex;

        while (index < selectorPart.length) {
          const currentSymbol = selectorPart[index];
          index++;
          if (currentSymbol === '(') {
            openedBrackets++;
            continue;
          }
          if (currentSymbol === ')') {
            openedBrackets--;
            if (openedBrackets === 0) {
              break;
            }
            continue;
          }
        }

        pseudoSelectorParts.push(
          `${pseudoSelectorMatch[0]}${selectorPart.slice(_cssPrefixWithPseudoSelectorFunction.lastIndex, index)}`,
        );
        _cssPrefixWithPseudoSelectorFunction.lastIndex = index;
      }

      // If selector consists of only `:where()` and `:is()` on the outer level
      // scope those pseudo-selectors individually, otherwise scope the whole
      // selector.
      if (pseudoSelectorParts.join('') === selectorPart) {
        scopedPart = pseudoSelectorParts
          .map((selectorPart) => {
            const [cssPseudoSelectorFunction] =
              selectorPart.match(_cssPrefixWithPseudoSelectorFunction) ?? [];

            // Unwrap the pseudo selector to scope its contents.
            // For example,
            // - `:where(selectorToScope)` -> `selectorToScope`;
            // - `:is(.foo, .bar)` -> `.foo, .bar`.
            const selectorToScope = selectorPart.slice(cssPseudoSelectorFunction?.length, -1);

            if (selectorToScope.includes(_polyfillHostNoCombinator)) {
              this._shouldScopeIndicator = true;
            }

            const scopedInnerPart = this._scopeSelector({
              selector: selectorToScope,
              scopeSelector,
              hostSelector,
            });

            // Put the result back into the pseudo selector function.
            return `${cssPseudoSelectorFunction}${scopedInnerPart})`;
          })
          .join('');
      } else {
        this._shouldScopeIndicator =
          this._shouldScopeIndicator || selectorPart.includes(_polyfillHostNoCombinator);
        scopedPart = this._shouldScopeIndicator ? _scopeSelectorPart(selectorPart) : selectorPart;
      }

      return scopedPart;
    };

    if (isParentSelector) {
      this._safeSelector = new SafeSelector(selector);
      selector = this._safeSelector.content();
    }

    let scopedSelector = '';
    let startIndex = 0;
    let res: RegExpExecArray | null;
    // Combinators aren't used as a delimiter if they are within parenthesis,
    // for example `:where(.one .two)` stays intact.
    // Similarly to selector separation by comma initially, negative lookahead
    // is used here to not break selectors within nested parenthesis up to three
    // nested layers.
    const sep =
      /( |>|\+|~(?!=))(?!([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)))\s*/g;

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
    const hasHost = selector.includes(_polyfillHostNoCombinator);
    // Only scope parts after or on the same level as the first `-shadowcsshost-no-combinator`
    // when it is present. The selector has the same level when it is a part of a pseudo
    // selector, like `:where()`, for example `:where(:host, .foo)` would result in `.foo`
    // being scoped.
    if (isParentSelector || this._shouldScopeIndicator) {
      this._shouldScopeIndicator = !hasHost;
    }

    while ((res = sep.exec(selector)) !== null) {
      const separator = res[1];
      // Do not trim the selector, as otherwise this will break sourcemaps
      // when they are defined on multiple lines
      // Example:
      //  div,
      //  p { color: red}
      const part = selector.slice(startIndex, res.index);

      // A space following an escaped hex value and followed by another hex character
      // (ie: ".\fc ber" for ".über") is not a separator between 2 selectors
      // also keep in mind that backslashes are replaced by a placeholder by SafeSelector
      // These escaped selectors happen for example when esbuild runs with optimization.minify.
      if (part.match(/__esc-ph-(\d+)__/) && selector[res.index + 1]?.match(/[a-fA-F\d]/)) {
        continue;
      }

      const scopedPart = _pseudoFunctionAwareScopeSelectorPart(part);
      scopedSelector += `${scopedPart} ${separator} `;
      startIndex = sep.lastIndex;
    }

    const part = selector.substring(startIndex);
    scopedSelector += _pseudoFunctionAwareScopeSelectorPart(part);

    // replace the placeholders with their original values
    // using values stored inside the `safeSelector` instance.
    return this._safeSelector!.restore(scopedSelector);
  }

  private _insertPolyfillHostInCssText(selector: string): string {
    return selector
      .replace(_colonHostContextRe, _polyfillHostContext)
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
    // Escaped characters have a specific placeholder so they can be detected separately.
    selector = selector.replace(/(\\.)/g, (_, keep) => {
      const replaceBy = `__esc-ph-${this.index}__`;
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
    return content.replace(/__(?:ph|esc-ph)-(\d+)__/g, (_ph, index) => this.placeholders[+index]);
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

const _cssScopedPseudoFunctionPrefix = '(:(where|is)\\()?';
const _cssPrefixWithPseudoSelectorFunction = /:(where|is)\(/gi;
const _cssContentNextSelectorRe =
  /polyfill-next-selector[^}]*content:[\s]*?(['"])(.*?)\1[;\s]*}([^{]*?){/gim;
const _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _cssContentUnscopedRuleRe =
  /(polyfill-unscoped-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _polyfillHost = '-shadowcsshost';
// note: :host-context pre-processed to -shadowcsshostcontext.
const _polyfillHostContext = '-shadowcsscontext';
const _parenSuffix = '(?:\\((' + '(?:\\([^)(]*\\)|[^)(]*)+?' + ')\\))';
const _cssColonHostRe = new RegExp(_polyfillHost + _parenSuffix + '?([^,{]*)', 'gim');
// note: :host-context patterns are terminated with `{`, as opposed to :host which
// is both `{` and `,` because :host-context handles top-level commas differently.
const _hostContextPattern = _polyfillHostContext + _parenSuffix + '?([^{]*)';
const _cssColonHostContextReGlobal = new RegExp(
  `${_cssScopedPseudoFunctionPrefix}(${_hostContextPattern})`,
  'gim',
);
const _cssColonHostContextRe = new RegExp(_hostContextPattern, 'im');
const _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
const _polyfillHostNoCombinatorOutsidePseudoFunction = new RegExp(
  `${_polyfillHostNoCombinator}(?![^(]*\\))`,
  'g',
);
const _polyfillHostNoCombinatorRe = /-shadowcsshost-no-combinator([^\s,]*)/;
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
const _selectorReSuffix = '([>\\s~+[.,{:][\\s\\S]*)?$';
const _polyfillHostRe = /-shadowcsshost/gim;
const _colonHostRe = /:host/gim;
const _colonHostContextRe = /:host-context/gim;

const _newLinesRe = /\r?\n/g;
const _commentRe = /\/\*[\s\S]*?\*\//g;
const _commentWithHashRe = /\/\*\s*#\s*source(Mapping)?URL=/g;
const COMMENT_PLACEHOLDER = '%COMMENT%';
const _commentWithHashPlaceHolderRe = new RegExp(COMMENT_PLACEHOLDER, 'g');

const BLOCK_PLACEHOLDER = '%BLOCK%';
const _ruleRe = new RegExp(
  `(\\s*(?:${COMMENT_PLACEHOLDER}\\s*)*)([^;\\{\\}]+?)(\\s*)((?:{%BLOCK%}?\\s*;?)|(?:\\s*;))`,
  'g',
);
const CONTENT_PAIRS = new Map([['{', '}']]);

const COMMA_IN_PLACEHOLDER = '%COMMA_IN_PLACEHOLDER%';
const SEMI_IN_PLACEHOLDER = '%SEMI_IN_PLACEHOLDER%';
const COLON_IN_PLACEHOLDER = '%COLON_IN_PLACEHOLDER%';

const _cssCommaInPlaceholderReGlobal = new RegExp(COMMA_IN_PLACEHOLDER, 'g');
const _cssSemiInPlaceholderReGlobal = new RegExp(SEMI_IN_PLACEHOLDER, 'g');
const _cssColonInPlaceholderReGlobal = new RegExp(COLON_IN_PLACEHOLDER, 'g');

export class CssRule {
  constructor(
    public selector: string,
    public content: string,
  ) {}
}

export function processRules(input: string, ruleCallback: (rule: CssRule) => CssRule): string {
  const escaped = escapeInStrings(input);
  const inputWithEscapedBlocks = escapeBlocks(escaped, CONTENT_PAIRS, BLOCK_PLACEHOLDER);
  let nextBlockIndex = 0;
  const escapedResult = inputWithEscapedBlocks.escapedString.replace(_ruleRe, (...m: string[]) => {
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
  return unescapeInStrings(escapedResult);
}

class StringWithEscapedBlocks {
  constructor(
    public escapedString: string,
    public blocks: string[],
  ) {}
}

function escapeBlocks(
  input: string,
  charPairs: Map<string, string>,
  placeholder: string,
): StringWithEscapedBlocks {
  const resultParts: string[] = [];
  const escapedBlocks: string[] = [];
  let openCharCount = 0;
  let nonBlockStartIndex = 0;
  let blockStartIndex = -1;
  let openChar: string | undefined;
  let closeChar: string | undefined;

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
 * Object containing as keys characters that should be substituted by placeholders
 * when found in strings during the css text parsing, and as values the respective
 * placeholders
 */
const ESCAPE_IN_STRING_MAP: {[key: string]: string} = {
  ';': SEMI_IN_PLACEHOLDER,
  ',': COMMA_IN_PLACEHOLDER,
  ':': COLON_IN_PLACEHOLDER,
};

/**
 * Parse the provided css text and inside strings (meaning, inside pairs of unescaped single or
 * double quotes) replace specific characters with their respective placeholders as indicated
 * by the `ESCAPE_IN_STRING_MAP` map.
 *
 * For example convert the text
 *  `animation: "my-anim:at\"ion" 1s;`
 * to
 *  `animation: "my-anim%COLON_IN_PLACEHOLDER%at\"ion" 1s;`
 *
 * This is necessary in order to remove the meaning of some characters when found inside strings
 * (for example `;` indicates the end of a css declaration, `,` the sequence of values and `:` the
 * division between property and value during a declaration, none of these meanings apply when such
 * characters are within strings and so in order to prevent parsing issues they need to be replaced
 * with placeholder text for the duration of the css manipulation process).
 *
 * @param input the original css text.
 *
 * @returns the css text with specific characters in strings replaced by placeholders.
 **/
function escapeInStrings(input: string): string {
  let result = input;
  let currentQuoteChar: string | null = null;
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (char === '\\') {
      i++;
    } else {
      if (currentQuoteChar !== null) {
        // index i is inside a quoted sub-string
        if (char === currentQuoteChar) {
          currentQuoteChar = null;
        } else {
          const placeholder: string | undefined = ESCAPE_IN_STRING_MAP[char];
          if (placeholder) {
            result = `${result.substr(0, i)}${placeholder}${result.substr(i + 1)}`;
            i += placeholder.length - 1;
          }
        }
      } else if (char === "'" || char === '"') {
        currentQuoteChar = char;
      }
    }
  }
  return result;
}

/**
 * Replace in a string all occurrences of keys in the `ESCAPE_IN_STRING_MAP` map with their
 * original representation, this is simply used to revert the changes applied by the
 * escapeInStrings function.
 *
 * For example it reverts the text:
 *  `animation: "my-anim%COLON_IN_PLACEHOLDER%at\"ion" 1s;`
 * to it's original form of:
 *  `animation: "my-anim:at\"ion" 1s;`
 *
 * Note: For the sake of simplicity this function does not check that the placeholders are
 * actually inside strings as it would anyway be extremely unlikely to find them outside of strings.
 *
 * @param input the css text containing the placeholders.
 *
 * @returns the css text without the placeholders.
 */
function unescapeInStrings(input: string): string {
  let result = input.replace(_cssCommaInPlaceholderReGlobal, ',');
  result = result.replace(_cssSemiInPlaceholderReGlobal, ';');
  result = result.replace(_cssColonInPlaceholderReGlobal, ':');
  return result;
}

/**
 * Unescape all quotes present in a string, but only if the string was actually already
 * quoted.
 *
 * This generates a "canonical" representation of strings which can be used to match strings
 * which would otherwise only differ because of differently escaped quotes.
 *
 * For example it converts the string (assumed to be quoted):
 *  `this \\"is\\" a \\'\\\\'test`
 * to:
 *  `this "is" a '\\\\'test`
 * (note that the latter backslashes are not removed as they are not actually escaping the single
 * quote)
 *
 *
 * @param input the string possibly containing escaped quotes.
 * @param isQuoted boolean indicating whether the string was quoted inside a bigger string (if not
 * then it means that it doesn't represent an inner string and thus no unescaping is required)
 *
 * @returns the string in the "canonical" representation without escaped quotes.
 */
function unescapeQuotes(str: string, isQuoted: boolean): string {
  return !isQuoted ? str : str.replace(/((?:^|[^\\])(?:\\\\)*)\\(?=['"])/g, '$1');
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
 * @param contextSelectors an array of context selectors that will be combined.
 * @param otherSelectors the rest of the selectors that are not context selectors.
 */
function _combineHostContextSelectors(
  contextSelectors: string[],
  otherSelectors: string,
  pseudoPrefix = '',
): string {
  const hostMarker = _polyfillHostNoCombinator;
  _polyfillHostRe.lastIndex = 0; // reset the regex to ensure we get an accurate test
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
    .map((s) =>
      otherSelectorsHasHost
        ? `${pseudoPrefix}${s}${otherSelectors}`
        : `${pseudoPrefix}${s}${hostMarker}${otherSelectors}, ${pseudoPrefix}${s} ${hostMarker}${otherSelectors}`,
    )
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
export function repeatGroups(groups: string[][], multiples: number): void {
  const length = groups.length;
  for (let i = 1; i < multiples; i++) {
    for (let j = 0; j < length; j++) {
      groups[j + i * length] = groups[j].slice(0);
    }
  }
}
