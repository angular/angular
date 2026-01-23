/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {getSymbolUrl} from '../symbol-context.mjs';

const symbolRegex = /([a-zA-Z_$][a-zA-Z_$0-9\.]*)/;

/**
 * Component that generates a code block with a link to a Symbol if it's known,
 * else generates a string code block
 */
export function CodeSymbol(props: {code: string}) {
  return (
    <code>
      {props.code.split(symbolRegex).map((rawSymbol, index) => {
        // Every even index is a non-match when the regex has 1 capturing group
        if (index % 2 === 0) return rawSymbol;

        const url = getSymbolUrl(rawSymbol);
        if (url) {
          return <a href={url}>{rawSymbol}</a>;
        }

        return rawSymbol;
      })}
    </code>
  );
}
