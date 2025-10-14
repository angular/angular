/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProfilerFrame } from '../../../../../../protocol';
export type Filter = (nodes: ProfilerFrame) => boolean;
export declare const noopFilter: (_: ProfilerFrame) => boolean;
type Operator = '>' | '<' | '=' | '<=' | '>=';
type DurationArgument = [Operator, number];
type SourceArgument = string;
declare const enum QueryType {
    Duration = "duration",
    Source = "source"
}
type QueryArguments = DurationArgument | SourceArgument;
type Predicate = true | false;
type QueryAST = [Predicate, QueryType, QueryArguments];
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
export declare const parseFilter: (query: string) => QueryAST[];
export declare const createFilter: (query: string) => (frame: ProfilerFrame) => boolean;
export {};
