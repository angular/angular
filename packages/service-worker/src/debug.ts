/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {filter as op_filter} from 'rxjs/operator/filter';
import {take as op_take} from 'rxjs/operator/take';
import {toPromise as op_toPromise} from 'rxjs/operator/toPromise';

import {CMD_FAKE_PUSH, CMD_PING, EVENT_PONG, NgswCommChannel} from './low_level';

interface PongPayload {
  nonce: number;
}

/**
 * Debug the communication between the Service Worker and the client.
 *
 * @experimental
 */
@Injectable()
export class NgswDebug {
  constructor(private sw: NgswCommChannel) {}

  /**
   * @internal
   */
  fakePush(payload: object): Promise<void> { return this.sw.postMessage(CMD_FAKE_PUSH, {payload}) }

  ping(): Promise<void> {
    const nonce = this.sw.generateNonce();
    const pongsWithNonce = <Observable<PongPayload>>(op_filter.call(
        this.sw.eventsOfType(EVENT_PONG), (pong: PongPayload) => pong.nonce === nonce));
    const firstPongWithNonce = (op_take.call(pongsWithNonce, 1) as Observable<PongPayload>);
    const recvPong =
        (op_toPromise.call(firstPongWithNonce) as Promise<PongPayload>).then(() => undefined);
    const sendPing = this.sw.postMessage(CMD_PING, {nonce});
    return Promise.all([sendPing, recvPong]).then(() => undefined);
  }
}
