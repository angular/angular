/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

// TODO(mmalerba): This is needed so the `mdc-helpers` directory will be counted as a secondary
//  entry point by our gulp build system. Being a secondary entry point ensures that the Sass
//  partial is copied to the root of the release. When we switch to bazel for building our releases
//  we can delete this.
@NgModule({})
export class MatMdcHelpersModule {
}
