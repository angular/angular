/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileTokenMetadata, tokenReference} from '../compile_metadata';
import * as o from '../output/output_ast';

import {CompileElement} from './compile_element';
import {CompileQuery} from './compile_query';


// Note: We can't do this when we create the CompileElements already,
// as we create embedded views before the <template> elements themselves.
export function bindQueryValues(ce: CompileElement) {
  const queriesWithReads: _QueryWithRead[] = [];

  ce.getProviderTokens().forEach((token) => {
    const queriesForProvider = ce.getQueriesFor(token);
    queriesWithReads.push(...queriesForProvider.map(query => new _QueryWithRead(query, token)));
  });

  Object.keys(ce.referenceTokens).forEach(varName => {
    const varToken = {value: varName};
    queriesWithReads.push(
        ...ce.getQueriesFor(varToken).map(query => new _QueryWithRead(query, varToken)));
  });

  queriesWithReads.forEach((queryWithRead) => {
    let value: o.Expression;
    if (queryWithRead.read.identifier) {
      // query for an identifier
      value = ce.instances.get(tokenReference(queryWithRead.read));
    } else {
      // query for a reference
      const token = ce.referenceTokens[queryWithRead.read.value];
      if (token) {
        value = ce.instances.get(tokenReference(token));
      } else {
        value = ce.elementRef;
      }
    }
    if (value) {
      queryWithRead.query.addValue(value, ce.view);
    }
  });
}

class _QueryWithRead {
  public read: CompileTokenMetadata;
  constructor(public query: CompileQuery, match: CompileTokenMetadata) {
    this.read = query.meta.read || match;
  }
}
