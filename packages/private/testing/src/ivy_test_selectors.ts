/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bazelDefineCompileValue} from './bazel_define_compile_value';

/**
 * Set this constant to `true` to run all tests and report which of the tests marked with `fixmeIvy`
 * are actually already passing.
 *
 * This is useful for locating already passing tests. The already passing tests should have their
 * `fixmeIvy` removed.
 */
const FIND_PASSING_TESTS = false;

/**
 * A function to conditionally include a test or a block of tests only when tests run against Ivy.
 *
 * The modification of the behavior must be well justified, not affect common usage patterns, and
 * documented as a breaking change.
 *
 * ```
 * ivyEnabled && describe(...);
 * ```
 *
 * or
 *
 * ```
 * ivyEnabled && it(...);
 * ```
 */
export const ivyEnabled = 'aot' === (bazelDefineCompileValue as string);


/**
 * A function to conditionally skip the execution of tests that are yet to be fixed
 * when running against Ivy.
 *
 * ```
 * fixmeIvy('some reason').describe(...);
 * ```
 *
 * or
 *
 * ```
 * fixmeIvy('some reason').it(...);
 * ```
 */
export function fixmeIvy(reason: string): JasmineMethods {
  if (FIND_PASSING_TESTS) {
    return ivyEnabled ? PASSTHROUGH : IGNORE;
  } else {
    return ivyEnabled ? IGNORE : PASSTHROUGH;
  }
}


/**
 * A function to conditionally skip the execution of tests that are not relevant when
 * running against Ivy.
 *
 * Any tests disabled using this switch should not be user-facing breaking changes.
 *
 * ```
 * obsoleteInIvy('some reason').describe(...);
 * ```
 *
 * or
 *
 * ```
 * obsoleteInIvy('some reason').it(...);
 * ```
 */
export function obsoleteInIvy(reason: string): JasmineMethods {
  return ivyEnabled ? IGNORE : PASSTHROUGH;
}

/**
 * A function to conditionally skip the execution of tests that are not relevant when
 * not running against Ivy.
 *
 * ```
 * onlyInIvy('some reason').describe(...);
 * ```
 *
 * or
 *
 * ```
 * onlyInIvy('some reason').it(...);
 * ```
 */
export function onlyInIvy(reason: string): JasmineMethods {
  return ivyEnabled && !FIND_PASSING_TESTS ? PASSTHROUGH : IGNORE;
}

/**
 * A function to conditionally skip the execution of tests that have intentionally
 * been broken when running against Ivy.
 *
 * The modification of the behavior must be well justified, not affect common usage patterns, and
 * documented as a breaking change.
 *
 * ```
 * modifiedInIvy('some reason').describe(...);
 * ```
 *
 * or
 *
 * ```
 * modifiedInIvy('some reason').it(...);
 * ```
 */
export function modifiedInIvy(reason: string): JasmineMethods {
  return ivyEnabled ? IGNORE : PASSTHROUGH;
}

export interface JasmineMethods {
  it: typeof it;
  fit: typeof fit;
  describe: typeof describe;
  fdescribe: typeof fdescribe;
  fixmeIvy: typeof fixmeIvy;
  isEnabled: boolean;
}

const PASSTHROUGH: JasmineMethods = {
  it: maybeAppendFindPassingTestsMarker(it),
  fit: maybeAppendFindPassingTestsMarker(fit),
  describe: maybeAppendFindPassingTestsMarker(describe),
  fdescribe: maybeAppendFindPassingTestsMarker(fdescribe),
  fixmeIvy: maybeAppendFindPassingTestsMarker(fixmeIvy),
  isEnabled: true,
};

const FIND_PASSING_TESTS_MARKER = '__FIND_PASSING_TESTS_MARKER__';
function maybeAppendFindPassingTestsMarker<T extends Function>(fn: T): T {
  return FIND_PASSING_TESTS ? function(...args: any[]) {
    if (typeof args[0] == 'string') {
      args[0] += FIND_PASSING_TESTS_MARKER;
    }
    return fn.apply(this, args);
  } : fn as any;
}

function noop() {}

const IGNORE: JasmineMethods = {
  it: noop,
  fit: noop,
  describe: noop,
  fdescribe: noop,
  fixmeIvy: (reason) => IGNORE,
  isEnabled: false,
};

if (FIND_PASSING_TESTS) {
  const env = jasmine.getEnv();
  const passingTests: jasmine.CustomReporterResult[] = [];
  const stillFailing: jasmine.CustomReporterResult[] = [];
  let specCount = 0;
  env.clearReporters();
  env.addReporter({
    specDone: function(result: jasmine.CustomReporterResult) {
      specCount++;
      if (result.fullName.indexOf(FIND_PASSING_TESTS_MARKER) != -1) {
        (result.status == 'passed' ? passingTests : stillFailing).push(result);
      }
    },
    jasmineDone: function(details: jasmine.RunDetails) {
      if (passingTests.length) {
        passingTests.forEach((result) => {
          // tslint:disable-next-line:no-console
          console.log('ALREADY PASSING', result.fullName.replace(FIND_PASSING_TESTS_MARKER, ''));
        });
        // tslint:disable-next-line:no-console
        console.log(
            `${specCount} specs,`,                    //
            `${passingTests.length} passing specs,`,  //
            `${stillFailing.length} still failing specs`);

      } else {
        // tslint:disable-next-line:no-console
        console.log('NO PASSING TESTS FOUND.');
      }
    }
  });
}