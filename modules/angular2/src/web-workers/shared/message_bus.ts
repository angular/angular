import {EventEmitter} from 'angular2/src/facade/async';
import {BaseException} from 'angular2/src/facade/lang';
// TODO(jteplitz602): Replace both the interface and the exported class with an abstract class #3683

function _abstract() {
  throw new BaseException("This method is abstract");
}

/**
 * Message Bus is a low level API used to communicate between the UI and the background.
 * Communication is based on a channel abstraction. Messages published in a
 * given channel to one MessageBusSink are received on the same channel
 * by the corresponding MessageBusSource.
 * TODO(jteplitz602): This should just extend both the source and the sink once
 * https://github.com/angular/ts2dart/issues/263 is closed.
 */
export interface MessageBusInterface {
  /**
   * Returns an {@link EventEmitter} that emits every time a messsage
   * is received on the given channel.
   */
  from(channel: string): EventEmitter;

  /**
   * Returns an {@link EventEmitter} for the given channel
   * To publish methods to that channel just call next (or add in dart) on the returned emitter
   */
  to(channel: string): EventEmitter;
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

export class MessageBus implements MessageBusInterface {
  from(channel: string): EventEmitter { throw _abstract(); }

  to(channel: string): EventEmitter { throw _abstract(); }
}
