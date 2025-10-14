/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const noopFilter = (_) => true;
const ops = {
  '>'(a, b) {
    return a > b;
  },
  '<'(a, b) {
    return a < b;
  },
  '='(a, b) {
    return a === b;
  },
  '<='(a, b) {
    return a <= b;
  },
  '>='(a, b) {
    return a >= b;
  },
};
const operatorRe = /^(>=|<=|=|<|>|)/;
class DurationQuery {
  constructor() {
    this.name = 'duration' /* QueryType.Duration */;
  }
  parseArguments([arg]) {
    arg = arg.trim();
    const operator = (arg.match(operatorRe) ?? [null])[0];
    if (!operator) {
      return undefined;
    }
    const num = parseFloat(arg.replace(operatorRe, '').trim());
    if (isNaN(num)) {
      return undefined;
    }
    return [operator, num];
  }
  apply(node, args) {
    return ops[args[0]](node.duration, args[1]);
  }
}
class SourceQuery {
  constructor() {
    this.name = 'source' /* QueryType.Source */;
  }
  parseArguments([arg]) {
    return arg;
  }
  apply(node, args) {
    return node.source.indexOf(args) >= 0;
  }
}
const queryMap = [new DurationQuery(), new SourceQuery()].reduce((map, query) => {
  map[query.name] = query;
  return map;
}, {});
const queryRe = new RegExp(
  `!?s*(${'duration' /* QueryType.Duration */}|${'source' /* QueryType.Source */})$`,
  'g',
);
/**
 * Parses a query in the form:
 *  filter := ('!'? query)*
 *  query := 'sort': [a-z]* | 'duration': operator duration
 *  operator := '=' | '>' | '<' | '>=' | '<='
 *  duration := [0-9]* 'ms'?
 *
 * @param query string that represents the search query
 * @returns tuples representing the query type and its arguments
 */
export const parseFilter = (query) => {
  const parts = query.split(':').map((part) => part.trim());
  if (parts.length <= 1) {
    return [];
  }
  const result = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!queryRe.test(part)) {
      continue;
    }
    const match = part.match(/(\w+)$/);
    if (!match) {
      continue;
    }
    const operator = queryMap[match[0]];
    if (!operator) {
      continue;
    }
    const operandString = parts[i + 1].replace(queryRe, '').trim();
    const operand = operator.parseArguments([operandString]);
    if (!operand) {
      continue;
    }
    const hasNegation = /^(.*?)\s*!\s*\w+/.test(part);
    result.push([!hasNegation, operator.name, operand]);
  }
  return result;
};
export const createFilter = (query) => {
  const queries = parseFilter(query);
  return (frame) => {
    return queries.every(([predicate, queryName, args]) => {
      const currentQuery = queryMap[queryName];
      if (!currentQuery) {
        return true;
      }
      const result = currentQuery.apply(frame, args);
      return predicate ? result : !result;
    });
  };
};
//# sourceMappingURL=filter.js.map
