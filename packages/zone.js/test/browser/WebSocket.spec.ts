/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ifEnvSupports} from '../test-util';
declare const window: any;

const TIMEOUT = 5000;

if (!window['saucelabs']) {
  // sauceLabs does not support WebSockets; skip these tests

  xdescribe(
    'WebSocket',
    ifEnvSupports('WebSocket', function () {
      let socket: WebSocket;
      const TEST_SERVER_URL = 'ws://localhost:8001';
      const testZone = Zone.current.fork({name: 'test'});

      beforeEach(function (done) {
        socket = new WebSocket(TEST_SERVER_URL);
        socket.addEventListener('open', function () {
          done();
        });
        socket.addEventListener('error', function () {
          fail(
            "Can't establish socket to " +
              TEST_SERVER_URL +
              '! do you have test/ws-server.js running?',
          );
          done();
        });
      }, TIMEOUT);

      afterEach(function (done) {
        socket.addEventListener('close', function () {
          done();
        });
        socket.close();
      }, TIMEOUT);

      xit('should be patched in a Web Worker', (done) => {
        const worker = new Worker('/base/test/ws-webworker-context.js');
        worker.onmessage = (e: MessageEvent) => {
          if (e.data !== 'pass' && e.data !== 'fail') {
            fail(`web worker ${e.data}`);
            return;
          }
          expect(e.data).toBe('pass');
          done();
        };
      }, 10000);

      it(
        'should work with addEventListener',
        function (done) {
          testZone.run(function () {
            socket.addEventListener('message', function (event) {
              expect(Zone.current).toBe(testZone);
              expect(event['data']).toBe('hi');
              done();
            });
          });
          socket.send('hi');
        },
        TIMEOUT,
      );

      it(
        'should respect removeEventListener',
        function (done) {
          let log = '';

          function logOnMessage() {
            log += 'a';

            expect(log).toEqual('a');

            socket.removeEventListener('message', logOnMessage);
            socket.send('hi');

            setTimeout(function () {
              expect(log).toEqual('a');
              done();
            }, 10);
          }

          socket.addEventListener('message', logOnMessage);
          socket.send('hi');
        },
        TIMEOUT,
      );

      it(
        'should work with onmessage',
        function (done) {
          testZone.run(function () {
            socket.onmessage = function (contents) {
              expect(Zone.current).toBe(testZone);
              expect(contents.data).toBe('hi');
              done();
            };
          });
          socket.send('hi');
        },
        TIMEOUT,
      );

      it(
        'should only allow one onmessage handler',
        function (done) {
          let log = '';

          socket.onmessage = function () {
            log += 'a';
            expect(log).toEqual('b');
            done();
          };

          socket.onmessage = function () {
            log += 'b';
            expect(log).toEqual('b');
            done();
          };

          socket.send('hi');
        },
        TIMEOUT,
      );

      it(
        'should handler removing onmessage',
        function (done) {
          let log = '';

          socket.onmessage = function () {
            log += 'a';
          };

          socket.onmessage = null as any;

          socket.send('hi');

          setTimeout(function () {
            expect(log).toEqual('');
            done();
          }, 100);
        },
        TIMEOUT,
      );

      it('should have constants', function () {
        expect(Object.keys(WebSocket)).toContain('CONNECTING');
        expect(Object.keys(WebSocket)).toContain('OPEN');
        expect(Object.keys(WebSocket)).toContain('CLOSING');
        expect(Object.keys(WebSocket)).toContain('CLOSED');
      });
    }),
  );
}
