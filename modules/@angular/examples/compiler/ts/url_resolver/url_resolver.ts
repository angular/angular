/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UrlResolver} from '@angular/compiler';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

var MyApp: any;

// #docregion url_resolver
class MyUrlResolver extends UrlResolver {
  resolve(baseUrl: string, url: string): string {
    // Serve CSS files from a special CDN.
    if (url.substr(-4) === '.css') {
      return super.resolve('http://cdn.myapp.com/css/', url);
    }
    return super.resolve(baseUrl, url);
  }
}

@NgModule({
  imports: [BrowserModule],
  providers: [{provide: UrlResolver, useClass: MyUrlResolver}],
  bootstrap: [MyApp]
})
class AppModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(AppModule);
}
// #enddocregion
