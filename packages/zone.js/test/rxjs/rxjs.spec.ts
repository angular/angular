/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
(Object as any).setPrototypeOf =
  (Object as any).setPrototypeOf ||
  function (obj: any, proto: any) {
    obj.__proto__ = proto;
    return obj;
  };
import '../../lib/rxjs/rxjs';
import './rxjs.common.spec';
import './rxjs.asap.spec';
import './rxjs.bindCallback.spec';
import './rxjs.bindNodeCallback.spec';
import './rxjs.combineLatest.spec';
import './rxjs.concat.spec';
import './rxjs.defer.spec';
import './rxjs.empty.spec';
import './rxjs.forkjoin.spec';
import './rxjs.from.spec';
import './rxjs.fromEvent.spec';
import './rxjs.fromPromise.spec';
import './rxjs.interval.spec';
import './rxjs.merge.spec';
import './rxjs.never.spec';
import './rxjs.of.spec';
import './rxjs.range.spec';
import './rxjs.retry.spec';
import './rxjs.throw.spec';
import './rxjs.timer.spec';
import './rxjs.zip.spec';
import './rxjs.Observable.audit.spec';
import './rxjs.Observable.buffer.spec';
import './rxjs.Observable.catch.spec';
import './rxjs.Observable.combine.spec';
import './rxjs.Observable.concat.spec';
import './rxjs.Observable.count.spec';
import './rxjs.Observable.debounce.spec';
import './rxjs.Observable.default.spec';
import './rxjs.Observable.delay.spec';
import './rxjs.Observable.notification.spec';
import './rxjs.Observable.distinct.spec';
import './rxjs.Observable.do.spec';
import './rxjs.Observable.collection.spec';
// // TODO: @JiaLiPassion, add exhaust test
import './rxjs.Observable.merge.spec';
import './rxjs.Observable.multicast.spec';
import './rxjs.Observable.map.spec';
import './rxjs.Observable.race.spec';
import './rxjs.Observable.sample.spec';
import './rxjs.Observable.take.spec';
import './rxjs.Observable.retry.spec';
import './rxjs.Observable.timeout.spec';
import './rxjs.Observable.window.spec';
