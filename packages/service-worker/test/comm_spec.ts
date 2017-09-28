/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/toPromise';

import {NgswCommChannel} from '../src/low_level';
import {SwPush} from '../src/push';
import {SwUpdate} from '../src/update';
import {MockServiceWorkerContainer, MockServiceWorkerRegistration} from '../testing/mock';

export function main() {
  describe('ServiceWorker library', () => {
    let mock: MockServiceWorkerContainer;
    let comm: NgswCommChannel;
    beforeEach(() => {
      mock = new MockServiceWorkerContainer();
      comm = new NgswCommChannel(mock as any);
    });
    describe('NgswCommsChannel', () => {
      it('can access the registration when it comes before subscription', (done: DoneFn) => {
        const mock = new MockServiceWorkerContainer();
        const comm = new NgswCommChannel(mock as any);
        const regPromise = mock.getRegistration() as any as MockServiceWorkerRegistration;

        mock.setupSw();

        comm.registration.subscribe(reg => { done(); });
      });
      it('can access the registration when it comes after subscription', (done: DoneFn) => {
        const mock = new MockServiceWorkerContainer();
        const comm = new NgswCommChannel(mock as any);
        const regPromise = mock.getRegistration() as any as MockServiceWorkerRegistration;

        comm.registration.subscribe(reg => { done(); });

        mock.setupSw();
      });
    });
    describe('NgswPush', () => {
      let push: SwPush;
      let reg: MockServiceWorkerRegistration;
      beforeEach((done: DoneFn) => {
        push = new SwPush(comm);
        mock.setupSw();
        mock.mockRegistration.then(r => reg = r).then(() => done());
      });
      it('receives push messages', (done: DoneFn) => {
        push.messages.subscribe(msg => {
          expect(msg).toEqual({
            message: 'this was a push message',
          });
          done();
        });
        reg.sendMessage({
          type: 'PUSH',
          data: {
            message: 'this was a push message',
          },
        });
      });
    });
    describe('NgswUpdate', () => {
      let update: SwUpdate;
      let reg: MockServiceWorkerRegistration;
      beforeEach((done: DoneFn) => {
        update = new SwUpdate(comm);
        mock.setupSw();
        mock.mockRegistration.then(r => reg = r).then(() => done());
      });
      it('processes update availability notifications when sent', (done: DoneFn) => {
        update.available.subscribe(event => {
          expect(event.current).toEqual({version: 'A'});
          expect(event.available).toEqual({version: 'B'});
          expect(event.type).toEqual('UPDATE_AVAILABLE');
          done();
        });
        reg.sendMessage({
          type: 'UPDATE_AVAILABLE',
          current: {
            version: 'A',
          },
          available: {
            version: 'B',
          },
        });
      });
      it('processes update activation notifications when sent', (done: DoneFn) => {
        update.activated.subscribe(event => {
          expect(event.previous).toEqual({version: 'A'});
          expect(event.current).toEqual({version: 'B'});
          expect(event.type).toEqual('UPDATE_ACTIVATED');
          done();
        });
        reg.sendMessage({
          type: 'UPDATE_ACTIVATED',
          previous: {
            version: 'A',
          },
          current: {
            version: 'B',
          },
        });
      });
      it('activates updates when requested', (done: DoneFn) => {
        mock.messages.subscribe((msg: {action: string, statusNonce: number}) => {
          expect(msg.action).toEqual('ACTIVATE_UPDATE');
          reg.sendMessage({
            type: 'STATUS',
            nonce: msg.statusNonce,
            status: true,
          });
        });
        return update.activateUpdate().then(() => done()).catch(err => done.fail(err));
      });
      it('reports activation failure when requested', (done: DoneFn) => {
        mock.messages.subscribe((msg: {action: string, statusNonce: number}) => {
          expect(msg.action).toEqual('ACTIVATE_UPDATE');
          reg.sendMessage({
            type: 'STATUS',
            nonce: msg.statusNonce,
            status: false,
            error: 'Failed to activate',
          });
        });
        return update.activateUpdate()
            .catch(err => { expect(err.message).toEqual('Failed to activate'); })
            .then(() => done())
            .catch(err => done.fail(err));
      });
    });
  });
}
