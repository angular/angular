/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

export const TemplateTag: GrammarDefinition = {
  scopeName: 'template.tag.ng',
  // `-text.html.markdown` in the first alternative prevents Angular binding bleed
  // into non-fenced markdown HTML, but also blocks matching inside fences (the root
  // scope is always `text.html.markdown`). The embedded-block alternatives provide
  // positive matches that ensure bindings fire inside fenced code blocks.
  injectionSelector:
    'L:meta.tag -comment -text.html.markdown, L:meta.embedded.block.angular-ts meta.tag -comment, L:meta.embedded.block.angular-html meta.tag -comment',
  patterns: [
    {include: '#twoWayBinding'},
    {include: '#styleDeclarationBinding'},
    {include: '#stylePropertyBinding'},
    {include: '#plainStyleAttribute'},
    {include: '#propertyBinding'},
    {include: '#eventBinding'},
    {include: '#templateBinding'},
  ],
  repository: {
    styleDeclarationBinding: {
      begin: /(\[\s*(?:style|attr\.style)\s*])(=)(["'])/,
      beginCaptures: {
        1: {
          name: 'entity.other.attribute-name.html entity.other.ng-binding-name.property.html',
          patterns: [{include: '#bindingKey'}],
        },
        2: {name: 'punctuation.separator.key-value.html'},
        3: {name: 'string.quoted.html punctuation.definition.string.begin.html'},
      },
      // @ts-ignore
      end: /\3/,
      endCaptures: {
        0: {name: 'string.quoted.html punctuation.definition.string.end.html'},
      },
      name: 'meta.ng-binding.property.html',
      contentName: 'expression.ng',
      patterns: [
        {include: '#embeddedCssDeclarationInTsString'},
        {include: '#embeddedCssStyleObject'},
        {include: 'expression.ng'},
      ],
    },

    stylePropertyBinding: {
      begin: /(\[\s*style(?:\.[-_a-zA-Z0-9%]+)+\s*])(=)(["'])/,
      beginCaptures: {
        1: {
          name: 'entity.other.attribute-name.html entity.other.ng-binding-name.property.html',
          patterns: [{include: '#styleBindingKey'}],
        },
        2: {name: 'punctuation.separator.key-value.html'},
        3: {name: 'string.quoted.html punctuation.definition.string.begin.html'},
      },
      // @ts-ignore
      end: /\3/,
      endCaptures: {
        0: {name: 'string.quoted.html punctuation.definition.string.end.html'},
      },
      name: 'meta.ng-binding.property.html',
      contentName: 'expression.ng',
      patterns: [{include: '#embeddedCssInTsString'}, {include: 'expression.ng'}],
    },

    // Plain style="..." attribute with CSS declaration tokenization.
    // Overrides the base HTML grammar to provide consistent CSS scoping
    // with [style]="'...'" bindings, avoiding string scope interference.
    plainStyleAttribute: {
      begin: /(style)(=)(["'])/,
      beginCaptures: {
        1: {name: 'entity.other.attribute-name.style.html'},
        2: {name: 'punctuation.separator.key-value.html'},
        3: {name: 'string.quoted.html punctuation.definition.string.begin.html'},
      },
      contentName: 'source.css meta.property-list.css',
      patterns: [{include: '#cssDeclarationPatterns'}],
      // @ts-ignore
      end: /\3/,
      endCaptures: {
        0: {name: 'string.quoted.html punctuation.definition.string.end.html'},
      },
      name: 'meta.attribute.style.html',
    },

    // Object literal CSS embedding: matches only when `{` appears at the start
    // of the expression (after optional whitespace). Expressions like
    // `someCondition && { ... }` will fall through to expression.ng, which is
    // an acceptable trade-off vs false-positive `{` matching.
    embeddedCssStyleObject: {
      begin: /\G\s*\{/,
      beginCaptures: {0: {name: 'punctuation.definition.block.ts'}},
      end: /\}/,
      endCaptures: {0: {name: 'punctuation.definition.block.ts'}},
      contentName: 'expression.ng',
      patterns: [{include: '#cssStyleObjectEntry'}],
    },

    cssStyleObjectEntry: {
      patterns: [
        // Quoted custom property key: '--foo-bar':
        {
          match: /(')(--(?:[-a-zA-Z_\u0080-\uFFFF])(?:[-a-zA-Z0-9_\u0080-\uFFFF])*)(')\s*(:)/,
          captures: {
            1: {name: 'string.quoted.ts punctuation.definition.string.begin.ts'},
            2: {name: 'variable.css'},
            3: {name: 'string.quoted.ts punctuation.definition.string.end.ts'},
            4: {name: 'punctuation.separator.key-value.css'},
          },
        },
        // Quoted standard CSS property key: 'border-color':
        {
          match: /(')([-a-zA-Z]+)(')\s*(:)/,
          captures: {
            1: {name: 'string.quoted.ts punctuation.definition.string.begin.ts'},
            2: {name: 'support.type.property-name.css'},
            3: {name: 'string.quoted.ts punctuation.definition.string.end.ts'},
            4: {name: 'punctuation.separator.key-value.css'},
          },
        },
        // Unquoted TS identifier key followed by colon
        {
          match: /([-_a-zA-Z][-_a-zA-Z0-9]*)\s*(:)/,
          captures: {
            1: {name: 'support.type.property-name.css'},
            2: {name: 'punctuation.separator.key-value.css'},
          },
        },
        // Single-quoted string value — CSS property values
        {
          begin: /(')/,
          beginCaptures: {
            1: {name: 'string.quoted.single.ts punctuation.definition.string.begin.ts'},
          },
          end: /(')/,
          endCaptures: {
            1: {name: 'string.quoted.single.ts punctuation.definition.string.end.ts'},
          },
          contentName: 'source.css meta.property-value.css',
          patterns: [{include: 'source.css#property-values'}],
        },
        // Template string value — CSS property values
        {
          begin: /(`)/,
          beginCaptures: {
            1: {name: 'string.template.ts punctuation.definition.string.begin.ts'},
          },
          end: /(`)/,
          endCaptures: {
            1: {name: 'string.template.ts punctuation.definition.string.end.ts'},
          },
          contentName: 'source.css meta.property-value.css',
          patterns: [
            {include: '#embeddedCssInTsTemplateSubstitution'},
            {include: 'source.css#property-values'},
          ],
        },
        // Comma separator
        {match: /,/, name: 'punctuation.separator.comma.ts'},
      ],
    },

    embeddedCssDeclarationInTsString: {
      patterns: [
        {include: '#embeddedCssDeclarationInSingleTsString'},
        {include: '#embeddedCssDeclarationInDoubleTsString'},
        {include: '#embeddedCssDeclarationInTsTemplateString'},
      ],
    },

    // Inline CSS declaration patterns for [style]/[attr.style] bindings.
    // Uses match rules (not begin/end) plus property-values to avoid scope bleed
    // past the enclosing string delimiter.
    cssDeclarationPatterns: {
      patterns: [
        // CSS custom properties (--foo-bar)
        {
          match:
            /(?<![\w-])--(?:[-a-zA-Z_\u0080-\uFFFF])(?:[-a-zA-Z0-9_\u0080-\uFFFF]|\\(?:[0-9a-fA-F]{1,6}|.))*/,
          name: 'variable.css',
        },
        // Standard property names followed by colon
        {
          match: /(?<![-a-zA-Z])(?:[-a-zA-Z]+)(?=\s*:)/,
          name: 'meta.property-name.css support.type.property-name.css',
        },
        // Colon separator
        {match: /:/, name: 'punctuation.separator.key-value.css'},
        // Semicolon terminator
        {match: /;/, name: 'punctuation.terminator.rule.css'},
        // Property values (colors, functions, units, keywords, etc.)
        {include: 'source.css#property-values'},
      ],
    },

    embeddedCssDeclarationInSingleTsString: {
      begin: /\G\s*'/,
      beginCaptures: {
        0: {name: 'string.quoted.single.ts punctuation.definition.string.begin.ts'},
      },
      end: /'/,
      endCaptures: {
        0: {name: 'string.quoted.single.ts punctuation.definition.string.end.ts'},
      },
      name: 'meta.property-list.css',
      contentName: 'source.css',
      patterns: [{include: '#cssDeclarationPatterns'}],
    },

    embeddedCssDeclarationInDoubleTsString: {
      begin: /\G\s*"/,
      beginCaptures: {
        0: {name: 'string.quoted.double.ts punctuation.definition.string.begin.ts'},
      },
      end: /"/,
      endCaptures: {
        0: {name: 'string.quoted.double.ts punctuation.definition.string.end.ts'},
      },
      name: 'meta.property-list.css',
      contentName: 'source.css',
      patterns: [{include: '#cssDeclarationPatterns'}],
    },

    embeddedCssDeclarationInTsTemplateString: {
      begin: /\G\s*`/,
      beginCaptures: {
        0: {name: 'string.template.ts punctuation.definition.string.begin.ts'},
      },
      end: /`/,
      endCaptures: {
        0: {name: 'string.template.ts punctuation.definition.string.end.ts'},
      },
      name: 'meta.property-list.css',
      contentName: 'source.css',
      patterns: [
        {include: '#embeddedCssInTsTemplateSubstitution'},
        {include: '#cssDeclarationPatterns'},
      ],
    },

    embeddedCssInTsString: {
      patterns: [
        {include: '#embeddedCssInSingleTsString'},
        {include: '#embeddedCssInDoubleTsString'},
        {include: '#embeddedCssInTsTemplateString'},
      ],
    },

    embeddedCssInSingleTsString: {
      begin: /\G\s*'/,
      beginCaptures: {
        0: {name: 'string.quoted.single.ts punctuation.definition.string.begin.ts'},
      },
      end: /'/,
      endCaptures: {
        0: {name: 'string.quoted.single.ts punctuation.definition.string.end.ts'},
      },
      name: 'meta.property-list.css',
      contentName: 'meta.property-value.css source.css',
      patterns: [{include: 'source.css#property-values'}],
    },

    embeddedCssInDoubleTsString: {
      begin: /\G\s*"/,
      beginCaptures: {
        0: {name: 'string.quoted.double.ts punctuation.definition.string.begin.ts'},
      },
      end: /"/,
      endCaptures: {
        0: {name: 'string.quoted.double.ts punctuation.definition.string.end.ts'},
      },
      name: 'meta.property-list.css',
      contentName: 'meta.property-value.css source.css',
      patterns: [{include: 'source.css#property-values'}],
    },

    embeddedCssInTsTemplateString: {
      begin: /\G\s*`/,
      beginCaptures: {
        0: {name: 'string.template.ts punctuation.definition.string.begin.ts'},
      },
      end: /`/,
      endCaptures: {
        0: {name: 'string.template.ts punctuation.definition.string.end.ts'},
      },
      name: 'meta.property-list.css',
      contentName: 'meta.property-value.css source.css',
      patterns: [
        {include: '#embeddedCssInTsTemplateSubstitution'},
        {include: 'source.css#property-values'},
      ],
    },

    embeddedCssInTsTemplateSubstitution: {
      begin: /\$\{/,
      beginCaptures: {
        0: {
          name: 'meta.template.expression.ts punctuation.definition.template-expression.begin.ts',
        },
      },
      end: /\}/,
      endCaptures: {
        0: {name: 'meta.template.expression.ts punctuation.definition.template-expression.end.ts'},
      },
      contentName: 'expression.ng',
      patterns: [{include: 'expression.ng'}],
    },

    propertyBinding: {
      begin: /(\[\s*@?(?:[-_a-zA-Z0-9.$]+|\[[^\[\]]*]|\([^()]*\))*%?\s*])(=)(["'])/,
      beginCaptures: {
        1: {
          name: 'entity.other.attribute-name.html entity.other.ng-binding-name.property.html',
          patterns: [{include: '#bindingKey'}],
        },
        2: {name: 'punctuation.separator.key-value.html'},
        3: {name: 'string.quoted.html punctuation.definition.string.begin.html'},
      },
      // @ts-ignore
      end: /\3/,
      endCaptures: {
        0: {name: 'string.quoted.html punctuation.definition.string.end.html'},
      },
      name: 'meta.ng-binding.property.html',
      contentName: 'expression.ng',
      patterns: [{include: 'expression.ng'}],
    },

    eventBinding: {
      begin: /(\(\s*@?[-_a-zA-Z0-9.$]*\s*\))(=)(["'])/,
      beginCaptures: {
        1: {
          name: 'entity.other.attribute-name.html entity.other.ng-binding-name.event.html',
          patterns: [{include: '#bindingKey'}],
        },
        2: {name: 'punctuation.separator.key-value.html'},
        3: {name: 'string.quoted.html punctuation.definition.string.begin.html'},
      },
      // @ts-ignore
      end: /\3/,
      endCaptures: {
        0: {name: 'string.quoted.html punctuation.definition.string.end.html'},
      },
      name: 'meta.ng-binding.event.html',
      contentName: 'expression.ng',
      patterns: [{include: 'expression.ng'}],
    },

    twoWayBinding: {
      begin: /(\[\s*\(\s*@?[-_a-zA-Z0-9.$]*\s*\)\s*\])(=)(["'])/,
      beginCaptures: {
        1: {
          name: 'entity.other.attribute-name.html entity.other.ng-binding-name.two-way.html',
          patterns: [{include: '#bindingKey'}],
        },
        2: {name: 'punctuation.separator.key-value.html'},
        3: {name: 'string.quoted.html punctuation.definition.string.begin.html'},
      },
      // @ts-ignore
      end: /\3/,
      endCaptures: {
        0: {name: 'string.quoted.html punctuation.definition.string.end.html'},
      },
      name: 'meta.ng-binding.two-way.html',
      contentName: 'expression.ng',
      patterns: [{include: 'expression.ng'}],
    },

    templateBinding: {
      begin: /(\*[-_a-zA-Z0-9.$]*)(=)(["'])/,
      beginCaptures: {
        1: {
          name: 'entity.other.attribute-name.html entity.other.ng-binding-name.template.html',
          patterns: [{include: '#bindingKey'}],
        },
        2: {name: 'punctuation.separator.key-value.html'},
        3: {name: 'string.quoted.html punctuation.definition.string.begin.html'},
      },
      // @ts-ignore
      end: /\3/,
      endCaptures: {
        0: {name: 'string.quoted.html punctuation.definition.string.end.html'},
      },
      name: 'meta.ng-binding.template.html',
      contentName: 'expression.ng',
      patterns: [{include: 'expression.ng'}],
    },

    bindingKey: {
      patterns: [
        {
          match:
            /([\[\(]{1,2}|\*)(?:\s*)(@?(?:[-_a-zA-Z0-9.$]+|\[[^\[\]]*]|\([^()]*\))*%?)(?:\s*)([\]\)]{1,2})?/,
          captures: {
            1: {name: 'punctuation.definition.ng-binding-name.begin.html'},
            2: {
              name: 'entity.other.ng-binding-name.$2.html',
              patterns: [
                {
                  match: /\./,
                  name: 'punctuation.accessor.html',
                },
              ],
            },
            3: {name: 'punctuation.definition.ng-binding-name.end.html'},
          },
        },
      ],
    },

    styleBindingKey: {
      patterns: [
        {
          match:
            /([\[\(]{1,2}|\*)(?:\s*)(@?(?:[-_a-zA-Z0-9.$]+|\[[^\[\]]*]|\([^()]*\))*%?)(?:\s*)([\]\)]{1,2})?/,
          captures: {
            1: {name: 'punctuation.definition.ng-binding-name.begin.html'},
            2: {
              name: 'entity.other.ng-binding-name.$2.html',
              patterns: [
                {match: /\./, name: 'punctuation.accessor.html'},
                {
                  match:
                    /(?<=\.)(px|em|rem|vh|vw|vmin|vmax|pt|pc|cm|mm|in|ch|ex|s|ms|deg|rad|turn|grad|dpi|dpcm|dppx|fr|%)$/,
                  name: 'keyword.other.unit.css',
                },
              ],
            },
            3: {name: 'punctuation.definition.ng-binding-name.end.html'},
          },
        },
      ],
    },
  },
};
