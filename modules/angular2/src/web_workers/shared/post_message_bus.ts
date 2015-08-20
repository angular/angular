import {
  MessageBus,
  MessageBusSource,
  MessageBusSink
} from "angular2/src/web_workers/shared/message_bus";
import {EventEmitter} from 'angular2/src/core/facade/async';
import {StringMap, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {Injectable} from "angular2/di";

/**
 * A TypeScript implementation of {@link MessageBus} for communicating via JavaScript's
 * postMessage API.
 */
@Injectable()
export class PostMessageBus implements MessageBus {
  constructor(private _sink: PostMessageBusSink, private _source: PostMessageBusSource) {}

  from(channel: string): EventEmitter { return this._source.from(channel); }

  to(channel: string): EventEmitter { return this._sink.to(channel); }
}

export class PostMessageBusSink implements MessageBusSink {
  private _channels: StringMap<string, EventEmitter> = StringMapWrapper.create();

  constructor(private _postMessageTarget: PostMessageTarget) {}

  public to(channel: string): EventEmitter {
    if (StringMapWrapper.contains(this._channels, channel)) {
      return this._channels[channel];
    } else {
      var emitter = new EventEmitter();
      emitter.observer({
        next: (message: Object) => {
          this._postMessageTarget.postMessage({channel: channel, message: message});
        }
      });
      return emitter;
    }
  }
}

export class PostMessageBusSource implements MessageBusSource {
  private _channels: StringMap<string, EventEmitter> = StringMapWrapper.create();

  constructor(eventTarget?: EventTarget) {
    if (eventTarget) {
      eventTarget.addEventListener("message", (ev: MessageEvent) => this._handleMessage(ev));
    } else {
      // if no eventTarget is given we assume we're in a WebWorker and listen on the global scope
      addEventListener("message", (ev: MessageEvent) => this._handleMessage(ev));
    }
  }

  private _handleMessage(ev: MessageEvent) {
    var data = ev.data;
    var channel = data.channel;
    if (StringMapWrapper.contains(this._channels, channel)) {
      this._channels[channel].next(data.message);
    }
  }

  public from(channel: string): EventEmitter {
    if (StringMapWrapper.contains(this._channels, channel)) {
      return this._channels[channel];
    } else {
      var emitter = new EventEmitter();
      this._channels[channel] = emitter;
      return emitter;
    }
  }
}

// TODO(jteplitz602) Replace this with the definition in lib.webworker.d.ts(#3492)
export interface PostMessageTarget { postMessage: (message: any, transfer?:[ArrayBuffer]) => void; }
