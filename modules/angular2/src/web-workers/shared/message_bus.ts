// TODO(jteplitz602) to be idiomatic these should be releated to Observable's or Streams
/**
 * Message Bus is a low level API used to communicate between the UI and the worker.
 * It smooths out the differences between Javascript's postMessage and Dart's Isolate
 * allowing you to work with one consistent API.
 */
export interface MessageBus {
  sink: MessageBusSink;
  source: MessageBusSource;
}

export interface SourceListener {
  (data: any): void;  // TODO: Replace this any type with the type of a real messaging protocol
}

export interface MessageBusSource { listen(fn: SourceListener): void; }

export interface MessageBusSink { send(message: Object): void; }
