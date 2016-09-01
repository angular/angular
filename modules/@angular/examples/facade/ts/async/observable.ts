/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Observable
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

var obs = new Observable<number>((obs: Subscriber<number>) => {
  var i = 0;
  setInterval(() => { obs.next(++i); }, 1000);
});
obs.subscribe(i => console.log(`${i} seconds elapsed`));
// #enddocregion
