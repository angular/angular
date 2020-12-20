/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This file should not be necessary because node resolution should just default to `./di/index`!
 *
 * However it does not seem to work and it breaks:
 *  - //packages/animations/browser/test:test_web_chromium-local
 *  - //packages/compiler-cli/test:extract_i18n
 *  - //packages/compiler-cli/test:ngc
 *  - //packages/compiler-cli/test:perform_watch
 *  - //packages/compiler-cli/test/diagnostics:check_types
 *  - //packages/compiler-cli/test/transformers:test
 *  - //packages/compiler/test:test
 *  - //tools/public_api_guard:core_api
 *
 * Remove this file once the above is solved or wait until `ngc` is deleted and then it should be
 * safe to delete this file.
 */

export * from './di/index';
