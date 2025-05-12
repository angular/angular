/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: This is needed so that dependent compilations relying on inferred types properly
// emit module names instead of relative imports. Previously, Bazel auto-inserted this.
// TODO: Consider removing this and enforcing proper explicit types.
/// <amd-module name="@angular/core" />

export * from './public_api';
