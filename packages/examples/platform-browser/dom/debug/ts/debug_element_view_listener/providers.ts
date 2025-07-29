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
  selector: 'my-component',
  template: 'text',
  standalone: false,
})
class MyAppComponent {}
@NgModule({imports: [BrowserModule], bootstrap: [MyAppComponent]})
class AppModule {}
platformBrowser().bootstrapModule(AppModule);
