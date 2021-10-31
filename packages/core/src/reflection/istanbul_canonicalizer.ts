/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * When running tests with code coverage using Istanbul, the code is instrumented with coverage
 * reporting statements. These statements are also inserted into synthesized constructors,
 * preventing Angular from properly recognizing them as synthesized constructors.
 *
 * In ES2015, the statements look as follows:
 *
 * ```
 * class TestService extends BaseService {
 *   constructor() {
 *     cov_8nt6qq5zt().f[2]++;
 *     cov_8nt6qq5zt().s[6]++;
 *     super(...arguments);
 *     cov_8nt6qq5zt().s[7]++;
 *     this.foo = 'bar';
 *   }
 * }
 * ```
 *
 * In ES5, they look like this:
 *
 * ```
 * function TestService() {
 *   cov_8nt6qq5zt().f[4]++;
 *
 *   var _this = (cov_8nt6qq5zt().s[8]++, (cov_8nt6qq5zt().b[0][0]++, _super !== null) &&
 * (cov_8nt6qq5zt().b[0][1]++, _super.apply(this, arguments)) || (cov_8nt6qq5zt().b[0][2]++, this));
 *
 *   cov_8nt6qq5zt().s[9]++;
 *   _this.foo = 'bar';
 *   cov_8nt6qq5zt().s[10]++;
 *   return _this;
 * }
 * ```
 *
 * This function removes the statements that look like Istanbul instrumentation statements.
 *
 * @see https://github.com/angular/angular/issues/31337
 * @param ctor The string representation of the constructor code.
 * @returns The constructor code without any Istanbul instrumentation statements.
 */
export function stripIstanbulInstrumentationStatements(ctor: string): string {
  return ctor.replace(/([\s;(])cov_(?:[a-z\d]+)\(\)\.[^;,]+[;,]/gi, '$1');
}
