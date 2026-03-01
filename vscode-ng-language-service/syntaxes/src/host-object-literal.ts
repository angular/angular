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
        // Try to match host bindings inside the `host`.
        {include: '#ngHostBindingDynamic'},
        // Try to match a static binding inside the `host`.
        {include: '#ngHostBindingStatic'},
        // Include the default TS syntax so that anything that doesn't
        // match the above will get the default highlighting.
        {include: 'source.ts'},
      ],
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

    // Static value inside `host`.
    ngHostBindingStatic: {
      // Note that we need to allow both quoted and non-quoted keys.
      begin: /\s*('|")?(.*?)(\1)?\s*:/,
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
