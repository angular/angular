/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

/** Highlighting definition for the `host` object of a directive or component. */
export const HostObjectLiteral: GrammarDefinition = {
  scopeName: 'host-object-literal.ng',
  // The second alternative is needed because `-text.html` in the first selector
  // prefix-matches `text.html.markdown`, blocking this injection inside markdown
  // fenced blocks (TextMate scope exclusions use prefix matching).
  injectionSelector:
    'L:meta.decorator.ts -comment -text.html -expression.ng, L:meta.embedded.block.angular-ts meta.decorator.ts -comment -expression.ng',
  patterns: [{include: '#hostObjectLiteral'}],
  repository: {
    hostObjectLiteral: {
      begin: /(host)\s*(:)\s*{/,
      beginCaptures: {
        // Key is shown as JS syntax.
        1: {name: 'meta.object-literal.key.ts'},
        // Colon is shown as JS syntax.
        2: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      contentName: 'hostbindings.ng',
      end: /}/,
      patterns: [
        // Style-specific bindings must come before the generic dynamic rule so
        // they win when the key is [style], [attr.style], or [style.xxx].
        {include: '#ngHostStyleDeclarationBinding'},
        {include: '#ngHostStylePropertyBinding'},
        // Try to match host bindings inside the `host`.
        {include: '#ngHostBindingDynamic'},
        // Static style binding gets CSS declaration embedding.
        {include: '#ngHostStyleStaticBinding'},
        // Try to match a static binding inside the `host`.
        {include: '#ngHostBindingStatic'},
        // Include the default TS syntax so that anything that doesn't
        // match the above will get the default highlighting.
        {include: 'source.ts'},
      ],
    },

    // Style declaration binding: [style] or [attr.style] keys get CSS declaration embedding.
    ngHostStyleDeclarationBinding: {
      begin: /\s*('|")(\[\s*(?:style|attr\.style)\s*])(\1)(:)/,
      beginCaptures: {
        1: {name: 'string'},
        2: {name: 'entity.other.attribute-name.html'},
        3: {name: 'string'},
        4: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      contentName: 'hostbinding.dynamic.ng',
      patterns: [{include: '#ngHostStyleDeclarationValue'}],
      end: /(?=,|})/,
    },

    // Value for [style]/[attr.style] host bindings — CSS declaration embedding before expression.ng.
    ngHostStyleDeclarationValue: {
      begin: /\s*(`|'|")/,
      beginCaptures: {
        1: {name: 'string'},
      },
      patterns: [
        {include: 'template.tag.ng#embeddedCssDeclarationInTsString'},
        {include: 'template.tag.ng#embeddedCssStyleObject'},
        {include: 'expression.ng'},
      ],
      // @ts-ignore
      end: /\1/,
      endCaptures: {
        0: {name: 'string'},
      },
    },

    // Style property binding: [style.xxx] or [style.xxx.yyy] keys get CSS value embedding.
    ngHostStylePropertyBinding: {
      begin: /\s*('|")(\[\s*style(?:\.[-_a-zA-Z0-9%]+)+\s*])(\1)(:)/,
      beginCaptures: {
        1: {name: 'string'},
        2: {
          name: 'entity.other.attribute-name.html',
          patterns: [
            {
              match:
                /(?<=\.)(px|em|rem|vh|vw|vmin|vmax|pt|pc|cm|mm|in|ch|ex|s|ms|deg|rad|turn|grad|dpi|dpcm|dppx|fr|%)(?=\s*\])/,
              name: 'keyword.other.unit.css',
            },
            {
              match: /(?<=style\.)([-a-zA-Z]+)/,
              name: 'support.type.property-name.css',
            },
          ],
        },
        3: {name: 'string'},
        4: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      contentName: 'hostbinding.dynamic.ng',
      patterns: [{include: '#ngHostStylePropertyValue'}],
      end: /(?=,|})/,
    },

    // Value for [style.xxx] host bindings — CSS property-value embedding before expression.ng.
    ngHostStylePropertyValue: {
      begin: /\s*(`|'|")/,
      beginCaptures: {
        1: {name: 'string'},
      },
      patterns: [{include: 'template.tag.ng#embeddedCssInTsString'}, {include: 'expression.ng'}],
      // @ts-ignore
      end: /\1/,
      endCaptures: {
        0: {name: 'string'},
      },
    },

    // A bound property inside `host`, e.g. `[attr.foo]="expr"` or `(click)="handleClick()"`.
    ngHostBindingDynamic: {
      begin: /\s*('|")([\[(].*?[\])])(\1)(:)/,
      beginCaptures: {
        // Opening quote is shown as a string. Only allows single and double quotes, no backticks.
        1: {name: 'string'},
        // Name is shown as an HTML attribute.
        2: {name: 'entity.other.attribute-name.html'},
        // Closing quote is shown as a string.
        3: {name: 'string'},
        // Colon is shown as JS syntax.
        4: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      contentName: 'hostbinding.dynamic.ng',
      patterns: [{include: '#ngHostBindingDynamicValue'}],
      end: /(?=,|})/,
    },

    // Value of a bound property inside `host`.
    ngHostBindingDynamicValue: {
      begin: /\s*(`|'|")/,
      beginCaptures: {
        // Opening quote is shown as a string. Allows backticks as well.
        1: {name: 'string'},
      },
      patterns: [
        // Content is shown as an Angular expression.
        {include: 'expression.ng'},
      ],
      // Ends on the same kind of quote as the opening.
      // @ts-ignore
      end: /\1/,
      endCaptures: {
        // Closing quote is shown as a string.
        0: {name: 'string'},
      },
    },

    // Static style binding: quoted or unquoted `style` key gets CSS declaration embedding.
    ngHostStyleStaticBinding: {
      begin: /\s*('|")?(style)(\1)?\s*(:)/,
      beginCaptures: {
        1: {name: 'string'},
        2: {name: 'meta.object-literal.key.ts'},
        3: {name: 'string'},
        4: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      contentName: 'hostbinding.static.ng',
      patterns: [{include: '#ngHostStyleStaticValue'}],
      end: /(?=,|})/,
    },

    // Value for static style host binding — CSS declaration embedding.
    ngHostStyleStaticValue: {
      begin: /\s*(`|'|")/,
      beginCaptures: {
        1: {name: 'string'},
      },
      patterns: [{include: 'template.tag.ng#cssDeclarationPatterns'}],
      contentName: 'meta.property-list.css source.css',
      // @ts-ignore
      end: /\1/,
      endCaptures: {
        0: {name: 'string'},
      },
    },

    // Static value inside `host`.
    ngHostBindingStatic: {
      // Note that we need to allow both quoted and non-quoted keys.
      begin: /\s*('|")?(.*?)(\1)?\s*(:)/,
      end: /(?=,|})/,
      beginCaptures: {
        // Opening quote is shown as a string. Only allows single and double quotes, no backticks.
        1: {name: 'string'},
        // Name is shown as an HTML attribute.
        2: {name: 'entity.other.attribute-name.html'},
        // Closing quote is shown as a string.
        3: {name: 'string'},
        // Colon is shown as JS syntax.
        4: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      contentName: 'hostbinding.static.ng',
      patterns: [
        // Use TypeScript highlighting for the value. This allows us to deal
        // with things like escaped strings and variables correctly.
        {include: 'source.ts'},
      ],
    },
  },
};
