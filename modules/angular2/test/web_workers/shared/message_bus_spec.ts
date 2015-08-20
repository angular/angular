import {
  AsyncTestCompleter,
  inject,
  describe,
  it,
  expect,
  beforeEach,
  createTestInjector,
  beforeEachBindings,
  SpyObject,
  proxy
} from 'angular2/test_lib';
import {ObservableWrapper} from 'angular2/src/core/facade/async';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {createConnectedMessageBus} from './message_bus_util';

export function main() {
  /**
   * Tests the PostMessageBus in TypeScript and the IsolateMessageBus in Dart
   */
  describe("MessageBus", () => {
    var bus: MessageBus;

    beforeEach(() => { bus = createConnectedMessageBus(); });

    it("should pass messages in the same channel from sink to source",
       inject([AsyncTestCompleter], (async) => {
         const CHANNEL = "CHANNEL 1";
         const MESSAGE = "Test message";

         var fromEmitter = bus.from(CHANNEL);
         ObservableWrapper.subscribe(fromEmitter, (message: any) => {
           expect(message).toEqual(MESSAGE);
           async.done();
         });
         var toEmitter = bus.to(CHANNEL);
         ObservableWrapper.callNext(toEmitter, MESSAGE);
       }));

    it("should broadcast", inject([AsyncTestCompleter], (async) => {
         const CHANNEL = "CHANNEL 1";
         const MESSAGE = "TESTING";
         const NUM_LISTENERS = 2;

         var callCount = 0;
         var emitHandler = (message: any) => {
           expect(message).toEqual(MESSAGE);
           callCount++;
           if (callCount == NUM_LISTENERS) {
             async.done();
           }
         };

         for (var i = 0; i < NUM_LISTENERS; i++) {
           var emitter = bus.from(CHANNEL);
           ObservableWrapper.subscribe(emitter, emitHandler);
         }

         var toEmitter = bus.to(CHANNEL);
         ObservableWrapper.callNext(toEmitter, MESSAGE);
       }));

    it("should keep channels independent", inject([AsyncTestCompleter], (async) => {
         const CHANNEL_ONE = "CHANNEL 1";
         const CHANNEL_TWO = "CHANNEL 2";
         const MESSAGE_ONE = "This is a message on CHANNEL 1";
         const MESSAGE_TWO = "This is a message on CHANNEL 2";
         var callCount = 0;

         var firstFromEmitter = bus.from(CHANNEL_ONE);
         ObservableWrapper.subscribe(firstFromEmitter, (message) => {
           expect(message).toEqual(MESSAGE_ONE);
           callCount++;
           if (callCount == 2) {
             async.done();
           }
         });
         var secondFromEmitter = bus.from(CHANNEL_TWO);
         ObservableWrapper.subscribe(secondFromEmitter, (message) => {
           expect(message).toEqual(MESSAGE_TWO);
           callCount++;
           if (callCount == 2) {
             async.done();
           }
         });

         var firstToEmitter = bus.to(CHANNEL_ONE);
         ObservableWrapper.callNext(firstToEmitter, MESSAGE_ONE);

         var secondToEmitter = bus.to(CHANNEL_TWO);
         ObservableWrapper.callNext(secondToEmitter, MESSAGE_TWO);
       }));
  });
}
