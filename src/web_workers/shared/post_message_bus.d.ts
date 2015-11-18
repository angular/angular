import { MessageBus, MessageBusSource, MessageBusSink } from "angular2/src/web_workers/shared/message_bus";
import { EventEmitter } from 'angular2/src/facade/async';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
/**
 * A TypeScript implementation of {@link MessageBus} for communicating via JavaScript's
 * postMessage API.
 */
export declare class PostMessageBus implements MessageBus {
    sink: PostMessageBusSink;
    source: PostMessageBusSource;
    constructor(sink: PostMessageBusSink, source: PostMessageBusSource);
    attachToZone(zone: NgZone): void;
    initChannel(channel: string, runInZone?: boolean): void;
    from(channel: string): EventEmitter<any>;
    to(channel: string): EventEmitter<any>;
}
export declare class PostMessageBusSink implements MessageBusSink {
    private _postMessageTarget;
    private _zone;
    private _channels;
    private _messageBuffer;
    constructor(_postMessageTarget: PostMessageTarget);
    attachToZone(zone: NgZone): void;
    initChannel(channel: string, runInZone?: boolean): void;
    to(channel: string): EventEmitter<any>;
    private _handleOnEventDone();
    private _sendMessages(messages);
}
export declare class PostMessageBusSource implements MessageBusSource {
    private _zone;
    private _channels;
    constructor(eventTarget?: EventTarget);
    attachToZone(zone: NgZone): void;
    initChannel(channel: string, runInZone?: boolean): void;
    from(channel: string): EventEmitter<any>;
    private _handleMessages(ev);
    private _handleMessage(data);
}
export interface PostMessageTarget {
    postMessage: (message: any, transfer?: [ArrayBuffer]) => void;
}
