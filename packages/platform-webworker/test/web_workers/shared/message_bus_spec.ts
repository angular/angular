/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core';
import {withModule} from '@angular/core/testing/src/test_bed';
import {AsyncTestCompleter, MockNgZone, beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {MessageBus} from '@angular/platform-webworker/src/web_workers/shared/message_bus';

import {createConnectedMessageBus} from './message_bus_util';

export function main() {
  /**
   * Tests the PostMessageBus
   */
  describe('MessageBus', () => {
    let bus: MessageBus;

    beforeEach(() => { bus = createConnectedMessageBus(); });

    it('should pass messages in the same channel from sink to source',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const CHANNEL = 'CHANNEL 1';
         const MESSAGE = 'Test message';
         bus.initChannel(CHANNEL, false);

         const fromEmitter = bus.from(CHANNEL);
         fromEmitter.subscribe({
           next: (message: any) => {
             expect(message).toEqual(MESSAGE);
             async.done();
           }
         });
         const toEmitter = bus.to(CHANNEL);
         toEmitter.emit(MESSAGE);
       }));

    it('should broadcast', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const CHANNEL = 'CHANNEL 1';
         const MESSAGE = 'TESTING';
         const NUM_LISTENERS = 2;
         bus.initChannel(CHANNEL, false);

         let callCount = 0;
         const emitHandler = (message: any) => {
           expect(message).toEqual(MESSAGE);
           callCount++;
           if (callCount == NUM_LISTENERS) {
             async.done();
           }
         };

         for (let i = 0; i < NUM_LISTENERS; i++) {
           const emitter = bus.from(CHANNEL);
           emitter.subscribe({next: emitHandler});
         }

         const toEmitter = bus.to(CHANNEL);
         toEmitter.emit(MESSAGE);
       }));

    it('should keep channels independent',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const CHANNEL_ONE = 'CHANNEL 1';
         const CHANNEL_TWO = 'CHANNEL 2';
         const MESSAGE_ONE = 'This is a message on CHANNEL 1';
         const MESSAGE_TWO = 'This is a message on CHANNEL 2';
         let callCount = 0;
         bus.initChannel(CHANNEL_ONE, false);
         bus.initChannel(CHANNEL_TWO, false);

         const firstFromEmitter = bus.from(CHANNEL_ONE);
         firstFromEmitter.subscribe({
           next: (message: any) => {
             expect(message).toEqual(MESSAGE_ONE);
             callCount++;
             if (callCount == 2) {
               async.done();
             }
           }
         });
         const secondFromEmitter = bus.from(CHANNEL_TWO);
         secondFromEmitter.subscribe({
           next: (message: any) => {
             expect(message).toEqual(MESSAGE_TWO);
             callCount++;
             if (callCount == 2) {
               async.done();
             }
           }
         });

         const firstToEmitter = bus.to(CHANNEL_ONE);
         firstToEmitter.emit(MESSAGE_ONE);

         const secondToEmitter = bus.to(CHANNEL_TWO);
         secondToEmitter.emit(MESSAGE_TWO);
       }));
  });

  describe('PostMessageBusSink', () => {
    let bus: MessageBus;
    const CHANNEL = 'Test Channel';

    function setup(runInZone: boolean, zone: NgZone) {
      bus.attachToZone(zone);
      bus.initChannel(CHANNEL, runInZone);
    }

    /**
     * Flushes pending messages and then runs the given function.
     */
    // TODO(mlaval): timeout is fragile, test to be rewritten
    function flushMessages(fn: () => void) { setTimeout(fn, 50); }

    it('should buffer messages and wait for the zone to exit before sending',
       withModule({providers: [{provide: NgZone, useClass: MockNgZone}]})
           .inject(
               [AsyncTestCompleter, NgZone],
               (async: AsyncTestCompleter, zone: MockNgZone) => {
                 bus = createConnectedMessageBus();
                 setup(true, zone);

                 let wasCalled = false;
                 bus.from(CHANNEL).subscribe({next: (message: any) => { wasCalled = true; }});
                 bus.to(CHANNEL).emit('hi');


                 flushMessages(() => {
                   expect(wasCalled).toBeFalsy();

                   zone.simulateZoneExit();
                   flushMessages(() => {
                     expect(wasCalled).toBeTruthy();
                     async.done();
                   });
                 });
               }),
       500);

    it('should send messages immediatly when run outside the zone',
       inject([AsyncTestCompleter, NgZone], (async: AsyncTestCompleter, zone: MockNgZone) => {
         bus = createConnectedMessageBus();
         setup(false, zone);

         let wasCalled = false;
         bus.from(CHANNEL).subscribe({next: (message: any) => { wasCalled = true; }});
         bus.to(CHANNEL).emit('hi');

         flushMessages(() => {
           expect(wasCalled).toBeTruthy();
           async.done();
         });
       }), 10000);
  });
}
