/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Events, MessageBus, Parameters } from '../../../protocol';
type AnyEventCallback<Ev> = <E extends keyof Ev>(topic: E, args: Parameters<Ev[E]>) => void;
export declare class ChromeMessageBus extends MessageBus<Events> {
    private _port;
    private _disconnected;
    private _listeners;
    constructor(_port: chrome.runtime.Port);
    onAny(cb: AnyEventCallback<Events>): () => void;
    on<E extends keyof Events>(topic: E, cb: Events[E]): () => void;
    once<E extends keyof Events>(topic: E, cb: Events[E]): void;
    emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean;
    destroy(): void;
}
export {};
