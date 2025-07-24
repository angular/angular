/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: 'Hello {{ name }}!',
  standalone: false,
})
class MyApp {
  name: string = 'World';
}

@NgModule({imports: [BrowserModule], bootstrap: [MyApp]})
class AppModule {}

export function main() {
  platformBrowser().bootstrapModule(AppModule);
}
