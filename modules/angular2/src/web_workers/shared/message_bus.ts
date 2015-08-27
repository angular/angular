import {EventEmitter} from 'angular2/src/core/facade/async';
import {BaseException} from 'angular2/src/core/facade/lang';
export {EventEmitter, Observable} from 'angular2/src/core/facade/async';

function _abstract() {
  throw new BaseException("This method is abstract");
}

/**
 * Message Bus is a low level API used to communicate between the UI and the background.
 * Communication is based on a channel abstraction. Messages published in a
 * given channel to one MessageBusSink are received on the same channel
 * by the corresponding MessageBusSource.
 */
export /* abstract (with TS 1.6) */ class MessageBus implements MessageBusSource, MessageBusSink {
  /**
   * Returns an {@link EventEmitter} that emits every time a messsage
   * is received on the given channel.
   */
  from(channel: string): EventEmitter { throw _abstract(); }


  /**
   * Returns an {@link EventEmitter} for the given channel
   * To publish methods to that channel just call next (or add in dart) on the returned emitter
   */
  to(channel: string): EventEmitter { throw _abstract(); }
}

export interface MessageBusSource {
  /**
   * Returns an {@link EventEmitter} that emits every time a messsage
   * is received on the given channel.
   */
  from(channel: string): EventEmitter;
}

export interface MessageBusSink {
  /**
   * Returns an {@link EventEmitter} for the given channel
   * To publish methods to that channel just call next (or add in dart) on the returned emitter
   */
  to(channel: string): EventEmitter;
}
