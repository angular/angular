/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
// #docregion Observable
import 'rxjs/add/operator/map';

import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

const obs = new Observable<number>((obs: Subscriber<any>) => {
  let i = 0;
  setInterval(() => obs.next(++i), 1000);
});
obs.map((i: number) => `${i} seconds elapsed`).subscribe(msg => console.log(msg));
// #enddocregion
