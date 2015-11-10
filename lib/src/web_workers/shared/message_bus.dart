library angular2.src.web_workers.shared.message_bus;

import "package:angular2/src/facade/async.dart" show EventEmitter;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
export "package:angular2/src/facade/async.dart" show EventEmitter, Stream;

/**
 * Message Bus is a low level API used to communicate between the UI and the background.
 * Communication is based on a channel abstraction. Messages published in a
 * given channel to one MessageBusSink are received on the same channel
 * by the corresponding MessageBusSource.
 */
abstract class MessageBus implements MessageBusSource, MessageBusSink {
  /**
   * Sets up a new channel on the MessageBus.
   * MUST be called before calling from or to on the channel.
   * If runInZone is true then the source will emit events inside the angular zone
   * and the sink will buffer messages and send only once the zone exits.
   * if runInZone is false then the source will emit events inside the global zone
   * and the sink will send messages immediately.
   */
  void initChannel(String channel, [bool runInZone]);
  /**
   * Assigns this bus to the given zone.
   * Any callbacks attached to channels where runInZone was set to true on initialization
   * will be executed in the given zone.
   */
  void attachToZone(NgZone zone);
  /**
   * Returns an [EventEmitter] that emits every time a message
   * is received on the given channel.
   */
  EventEmitter<dynamic> from(String channel);
  /**
   * Returns an [EventEmitter] for the given channel
   * To publish methods to that channel just call next (or add in dart) on the returned emitter
   */
  EventEmitter<dynamic> to(String channel);
}

abstract class MessageBusSource {
  /**
   * Sets up a new channel on the MessageBusSource.
   * MUST be called before calling from on the channel.
   * If runInZone is true then the source will emit events inside the angular zone.
   * if runInZone is false then the source will emit events inside the global zone.
   */
  void initChannel(String channel, bool runInZone);
  /**
   * Assigns this source to the given zone.
   * Any channels which are initialized with runInZone set to true will emit events that will be
   * executed within the given zone.
   */
  void attachToZone(NgZone zone);
  /**
   * Returns an [EventEmitter] that emits every time a message
   * is received on the given channel.
   */
  EventEmitter<dynamic> from(String channel);
}

abstract class MessageBusSink {
  /**
   * Sets up a new channel on the MessageBusSink.
   * MUST be called before calling to on the channel.
   * If runInZone is true the sink will buffer messages and send only once the zone exits.
   * if runInZone is false the sink will send messages immediatly.
   */
  void initChannel(String channel, bool runInZone);
  /**
   * Assigns this sink to the given zone.
   * Any channels which are initialized with runInZone set to true will wait for the given zone
   * to exit before sending messages.
   */
  void attachToZone(NgZone zone);
  /**
   * Returns an [EventEmitter] for the given channel
   * To publish methods to that channel just call next (or add in dart) on the returned emitter
   */
  EventEmitter<dynamic> to(String channel);
}
