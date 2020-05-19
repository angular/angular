/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IMinimatch, Minimatch} from 'minimatch';

/** Map that holds patterns and their corresponding Minimatch globs. */
const patternCache = new Map<string, IMinimatch>();

/**
 * Context that is provided to conditions. Conditions can use various helpers
 * that PullApprove provides. We try to mock them here. Consult the official
 * docs for more details: https://docs.pullapprove.com/config/conditions.
 */
const conditionContext = {
  'len': (value: any[]) => value.length,
  'contains_any_globs': (files: PullApproveArray, patterns: string[]) => {
    // Note: Do not always create globs for the same pattern again. This method
    // could be called for each source file. Creating glob's is expensive.
    return files.some(f => patterns.some(pattern => getOrCreateGlob(pattern).match(f)));
  }
};

/**
 * Converts a given condition to a function that accepts a set of files. The returned
 * function can be called to check if the set of files matches the condition.
 */
export function convertConditionToFunction(expr: string): (files: string[]) => boolean {
  // Creates a dynamic function with the specified expression. The first parameter will
  // be `files` as that corresponds to the supported `files` variable that can be accessed
  // in PullApprove condition expressions. The followed parameters correspond to other
  // context variables provided by PullApprove for conditions.
  const evaluateFn = new Function('files', ...Object.keys(conditionContext), `
    return (${transformExpressionToJs(expr)});
  `);

  // Create a function that calls the dynamically constructed function which mimics
  // the condition expression that is usually evaluated with Python in PullApprove.
  return files => {
    const result = evaluateFn(new PullApproveArray(...files), ...Object.values(conditionContext));
    // If an array is returned, we consider the condition as active if the array is not
    // empty. This matches PullApprove's condition evaluation that is based on Python.
    if (Array.isArray(result)) {
      return result.length !== 0;
    }
    return !!result;
  };
}

/**
 * Transforms a condition expression from PullApprove that is based on python
 * so that it can be run inside JavaScript. Current transformations:
 *   1. `not <..>` -> `!<..>`
 */
function transformExpressionToJs(expression: string): string {
  return expression.replace(/not\s+/g, '!');
}

/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for files in conditions.
 */
class PullApproveArray extends Array<string> {
  constructor(...elements: string[]) {
    super(...elements);

    // Set the prototype explicitly because in ES5, the prototype is accidentally
    // lost due to a limitation in down-leveling.
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
    Object.setPrototypeOf(this, PullApproveArray.prototype);
  }

  /** Returns a new array which only includes files that match the given pattern. */
  include(pattern: string): PullApproveArray {
    return new PullApproveArray(...this.filter(s => getOrCreateGlob(pattern).match(s)));
  }

  /** Returns a new array which only includes files that did not match the given pattern. */
  exclude(pattern: string): PullApproveArray {
    return new PullApproveArray(...this.filter(s => !getOrCreateGlob(pattern).match(s)));
  }
}

/**
 * Gets a glob for the given pattern. The cached glob will be returned
 * if available. Otherwise a new glob will be created and cached.
 */
function getOrCreateGlob(pattern: string) {
  if (patternCache.has(pattern)) {
    return patternCache.get(pattern)!;
  }
  const glob = new Minimatch(pattern, {dot: true});
  patternCache.set(pattern, glob);
  return glob;
}
