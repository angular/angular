/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
// #docregion Observable
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {map} from 'rxjs/operator/map';

const obs = new Observable<number>((sub: Subscriber<number>) => {
  let i = 0;
  setInterval(() => sub.next(++i), 1000);
});
map.call(obs, (i: number) => `${i} seconds elapsed`).subscribe((msg: string) => console.log(msg));
// #enddocregion
