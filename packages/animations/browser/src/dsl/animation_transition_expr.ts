/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export const ANY_STATE = '*';
export declare type TransitionMatcherFn =
    (fromState: any, toState: any, element: any, params: {[key: string]: any}) => boolean;

export function parseTransitionExpr(
    transitionValue: string|TransitionMatcherFn, errors: string[]): TransitionMatcherFn[] {
  const expressions: TransitionMatcherFn[] = [];
  if (typeof transitionValue == 'string') {
    transitionValue.split(/\s*,\s*/).forEach(
        str => parseInnerTransitionStr(str, expressions, errors));
  } else {
    expressions.push(<TransitionMatcherFn>transitionValue);
  }
  return expressions;
}

function parseInnerTransitionStr(
    eventStr: string, expressions: TransitionMatcherFn[], errors: string[]) {
  if (eventStr[0] == ':') {
    const result = parseAnimationAlias(eventStr, errors);
    if (typeof result == 'function') {
      expressions.push(result);
      return;
    }
    eventStr = result;
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

function parseAnimationAlias(alias: string, errors: string[]): string|TransitionMatcherFn {
  switch (alias) {
    case ':enter':
      return 'void => *';
    case ':leave':
      return '* => void';
    case ':increment':
      return (fromState: any, toState: any): boolean => parseFloat(toState) > parseFloat(fromState);
    case ':decrement':
      return (fromState: any, toState: any): boolean => parseFloat(toState) < parseFloat(fromState);
    default:
      errors.push(`The transition alias value "${alias}" is not supported`);
      return '* => *';
  }
}

// DO NOT REFACTOR ... keep the follow set instantiations
// with the values intact (closure compiler for some reason
// removes follow-up lines that add the values outside of
// the constructor...
const TRUE_BOOLEAN_VALUES = new Set<string>(['true', '1']);
const FALSE_BOOLEAN_VALUES = new Set<string>(['false', '0']);

function makeLambdaFromStates(lhs: string, rhs: string): TransitionMatcherFn {
  const LHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(lhs) || FALSE_BOOLEAN_VALUES.has(lhs);
  const RHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(rhs) || FALSE_BOOLEAN_VALUES.has(rhs);

  return (fromState: any, toState: any): boolean => {
    let lhsMatch = lhs == ANY_STATE || lhs == fromState;
    let rhsMatch = rhs == ANY_STATE || rhs == toState;

    if (!lhsMatch && LHS_MATCH_BOOLEAN && typeof fromState === 'boolean') {
      lhsMatch = fromState ? TRUE_BOOLEAN_VALUES.has(lhs) : FALSE_BOOLEAN_VALUES.has(lhs);
    }
    if (!rhsMatch && RHS_MATCH_BOOLEAN && typeof toState === 'boolean') {
      rhsMatch = toState ? TRUE_BOOLEAN_VALUES.has(rhs) : FALSE_BOOLEAN_VALUES.has(rhs);
    }

    return lhsMatch && rhsMatch;
  };
}
