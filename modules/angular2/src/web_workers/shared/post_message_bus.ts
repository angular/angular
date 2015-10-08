import {
  MessageBus,
  MessageBusSource,
  MessageBusSink
} from "angular2/src/web_workers/shared/message_bus";
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {EventEmitter} from 'angular2/src/core/facade/async';
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {Injectable} from "angular2/src/core/di";
import {NgZone} from 'angular2/src/core/zone/ng_zone';

/**
 * A TypeScript implementation of {@link MessageBus} for communicating via JavaScript's
 * postMessage API.
 */
@Injectable()
export class PostMessageBus implements MessageBus {
  constructor(public sink: PostMessageBusSink, public source: PostMessageBusSource) {}

  attachToZone(zone: NgZone): void {
    this.source.attachToZone(zone);
    this.sink.attachToZone(zone);
  }

  initChannel(channel: string, runInZone: boolean = true): void {
    this.source.initChannel(channel, runInZone);
    this.sink.initChannel(channel, runInZone);
  }

  from(channel: string): EventEmitter { return this.source.from(channel); }

  to(channel: string): EventEmitter { return this.sink.to(channel); }
}

export class PostMessageBusSink implements MessageBusSink {
  private _zone: NgZone;
  private _channels: {[key: string]: _Channel} = StringMapWrapper.create();
  private _messageBuffer: Array<Object> = [];

  constructor(private _postMessageTarget: PostMessageTarget) {}

  attachToZone(zone: NgZone): void {
    this._zone = zone;
    this._zone.overrideOnEventDone(() => this._handleOnEventDone(), false);
  }

  initChannel(channel: string, runInZone: boolean = true): void {
    if (StringMapWrapper.contains(this._channels, channel)) {
      throw new BaseException(`${channel} has already been initialized`);
    }

    var emitter = new EventEmitter();
    var channelInfo = new _Channel(emitter, runInZone);
    this._channels[channel] = channelInfo;
    emitter.observer({
      next: (data: Object) => {
        var message = {channel: channel, message: data};
        if (runInZone) {
          this._messageBuffer.push(message);
        } else {
          this._sendMessages([message]);
        }
      }
    });
  }

  to(channel: string): EventEmitter {
    if (StringMapWrapper.contains(this._channels, channel)) {
      return this._channels[channel].emitter;
    } else {
      throw new BaseException(`${channel} is not set up. Did you forget to call initChannel?`);
    }
  }

  private _handleOnEventDone() {
    // TODO: Send all buffered messages in one postMessage call
    this._sendMessages(this._messageBuffer);
    this._messageBuffer = [];
  }

  private _sendMessages(messages: Array<Object>) { this._postMessageTarget.postMessage(messages); }
}

export class PostMessageBusSource implements MessageBusSource {
  private _zone: NgZone;
  private _channels: {[key: string]: _Channel} = StringMapWrapper.create();

  constructor(eventTarget?: EventTarget) {
    if (eventTarget) {
      eventTarget.addEventListener("message", (ev: MessageEvent) => this._handleMessages(ev));
    } else {
      // if no eventTarget is given we assume we're in a WebWorker and listen on the global scope
      addEventListener("message", (ev: MessageEvent) => this._handleMessages(ev));
    }
  }

  attachToZone(zone: NgZone) { this._zone = zone; }

  initChannel(channel: string, runInZone: boolean = true) {
    if (StringMapWrapper.contains(this._channels, channel)) {
      throw new BaseException(`${channel} has already been initialized`);
    }

    var emitter = new EventEmitter();
    var channelInfo = new _Channel(emitter, runInZone);
    this._channels[channel] = channelInfo;
  }

  from(channel: string): EventEmitter {
    if (StringMapWrapper.contains(this._channels, channel)) {
      return this._channels[channel].emitter;
    } else {
      throw new BaseException(`${channel} is not set up. Did you forget to call initChannel?`);
    }
  }

  private _handleMessages(ev: MessageEvent): void {
    var messages = ev.data;
    for (var i = 0; i < messages.length; i++) {
      this._handleMessage(messages[i]);
    }
  }

  private _handleMessage(data: any): void {
    var channel = data.channel;
    if (StringMapWrapper.contains(this._channels, channel)) {
      var channelInfo = this._channels[channel];
      if (channelInfo.runInZone) {
        this._zone.run(() => { channelInfo.emitter.next(data.message); });
      } else {
        channelInfo.emitter.next(data.message);
      }
    }
  }
}

/**
 * Helper class that wraps a channel's {@link EventEmitter} and
 * keeps track of if it should run in the zone.
 */
class _Channel {
  constructor(public emitter: EventEmitter, public runInZone: boolean) {}
}

// TODO(jteplitz602) Replace this with the definition in lib.webworker.d.ts(#3492)
export interface PostMessageTarget { postMessage: (message: any, transfer?:[ArrayBuffer]) => void; }
