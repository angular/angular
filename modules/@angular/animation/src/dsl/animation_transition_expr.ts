/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export const ANY_STATE = '*';
export declare type TransitionMatcherFn = (fromState: any, toState: any) => boolean;

export function parseTransitionExpr(
    transitionValue: string | TransitionMatcherFn, errors: string[]): TransitionMatcherFn[] {
  const expressions: TransitionMatcherFn[] = [];
  if (typeof transitionValue == 'string') {
    (<string>transitionValue)
        .split(/\s*,\s*/)
        .forEach(str => parseInnerTransitionStr(str, expressions, errors));
  } else {
    expressions.push(<TransitionMatcherFn>transitionValue);
  }
  return expressions;
}

function parseInnerTransitionStr(
    eventStr: string, expressions: TransitionMatcherFn[], errors: string[]) {
  if (eventStr[0] == ':') {
    eventStr = parseAnimationAlias(eventStr, errors);
  }
  const match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
  if (match == null || match.length < 4) {
    errors.push(`The provided transition expression "${eventStr}" is not supported`);
    return expressions;
  }

  const fromState = match[1];
  const separator = match[2];
  const toState = match[3];
  expressions.push(makeLambdaFromStates(fromState, toState));

  const isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
  if (separator[0] == '<' && !isFullAnyStateExpr) {
    expressions.push(makeLambdaFromStates(toState, fromState));
  }
}

function parseAnimationAlias(alias: string, errors: string[]): string {
  switch (alias) {
    case ':enter':
      return 'void => *';
    case ':leave':
      return '* => void';
    default:
      errors.push(`The transition alias value "${alias}" is not supported`);
      return '* => *';
  }
}

function makeLambdaFromStates(lhs: string, rhs: string): TransitionMatcherFn {
  return (fromState: any, toState: any): boolean => {
    const lhsMatch = lhs == ANY_STATE || lhs == fromState;
    const rhsMatch = rhs == ANY_STATE || rhs == toState;
    return lhsMatch && rhsMatch;
  };
}
