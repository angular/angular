/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion LocationComponent
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  selector: 'path-location',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  template: `
    <h1>PathLocationStrategy</h1>
    Current URL is: <code>{{location.path()}}</code><br>
    Normalize: <code>/foo/bar/</code> is: <code>{{location.normalize('foo/bar')}}</code><br>
  `
})
export class PathLocationComponent {
  location: Location;
  constructor(location: Location) {
    this.location = location;
  }
}
// #enddocregion
