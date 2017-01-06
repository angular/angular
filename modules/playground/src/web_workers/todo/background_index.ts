/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {WorkerAppModule} from '@angular/platform-webworker';
import {platformWorkerAppDynamic} from '@angular/platform-webworker-dynamic';

import {TodoApp} from './index_common';

@NgModule({imports: [WorkerAppModule, FormsModule], bootstrap: [TodoApp], declarations: [TodoApp]})
class ExampleModule {
}

export function main() {
  platformWorkerAppDynamic().bootstrapModule(ExampleModule);
}
