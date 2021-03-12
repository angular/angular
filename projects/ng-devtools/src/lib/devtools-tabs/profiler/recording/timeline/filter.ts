import { ProfilerFrame } from 'protocol';
import { GraphNode } from './record-formatter/record-formatter';

export type Filter = (nodes: GraphNode) => boolean;

export const noopFilter = (_: GraphNode) => true;

interface Query<Arguments = unknown> {
  readonly name: QueryType;
  parseArguments(args: string[]): Arguments | undefined;
  apply(node: ProfilerFrame, args: Arguments): boolean;
}

type Operator = '>' | '<' | '=' | '<=' | '>=';

const ops: { [operator in Operator]: (a: number, b: number) => boolean } = {
  '>'(a: number, b: number): boolean {
    return a > b;
  },
  '<'(a: number, b: number): boolean {
    return a < b;
  },
  '='(a: number, b: number): boolean {
    return a === b;
  },
  '<='(a: number, b: number): boolean {
    return a <= b;
  },
  '>='(a: number, b: number): boolean {
    return a >= b;
  },
};

type DurationArgument = [Operator, number];
type SourceArgument = string;

const enum QueryType {
  Duration = 'duration',
  Source = 'source',
}

type QueryArguments = DurationArgument | SourceArgument;

const operatorRe = /^(>=|<=|=|<|>|)/;
class DurationQuery implements Query<DurationArgument> {
  readonly name = QueryType.Duration;
  parseArguments([arg]: string[]): DurationArgument | undefined {
    arg.trim();
    const operator = (arg.match(operatorRe) ?? [null])[0];
    if (!operator) {
      return undefined;
    }
    const num = parseFloat(arg.replace(operatorRe, '').trim());
    if (isNaN(num)) {
      return undefined;
    }
    return [operator as Operator, num] as DurationArgument;
  }

  apply(node: ProfilerFrame, args: DurationArgument): boolean {
    return ops[args[0]](node.duration, args[1]);
  }
}

class SourceQuery implements Query<SourceArgument> {
  readonly name = QueryType.Source;
  parseArguments([arg]: string[]): SourceArgument {
    return arg;
  }

  apply(node: ProfilerFrame, args: SourceArgument): boolean {
    return node.source.indexOf(args) >= 0;
  }
}

const queryMap: { [query in QueryType]: Query } = [new DurationQuery(), new SourceQuery()].reduce((map, query) => {
  map[query.name] = query;
  return map;
}, {} as { [query in QueryType]: Query });

const queryRe = new RegExp(`(${QueryType.Duration}|${QueryType.Source})$`, 'g');

export const parseFilter = (query: string): [QueryType, QueryArguments][] => {
  const parts = query.split(':').map((part) => part.trim());
  if (parts.length <= 1) {
    return [];
  }
  const result: [QueryType, QueryArguments][] = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!queryRe.test(part)) {
      continue;
    }
    const match = part.match(/(\w+)$/);
    if (!match) {
      continue;
    }
    const operator = queryMap[match[0] as QueryType];
    if (!operator) {
      continue;
    }
    const operandString = parts[i + 1].replace(queryRe, '').trim();
    const operand = operator.parseArguments([operandString]) as QueryArguments;
    if (!operand) {
      continue;
    }
    result.push([operator.name, operand]);
  }
  return result;
};

export const createFilter = (query: string) => {
  const queries = parseFilter(query);
  return (frame: GraphNode) => {
    return queries.every(([queryName, args]) => {
      const currentQuery = queryMap[queryName];
      if (!currentQuery) {
        return true;
      }
      return currentQuery.apply(frame.frame, args);
    });
  };
};
