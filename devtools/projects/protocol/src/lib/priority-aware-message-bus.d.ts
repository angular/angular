/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MessageBus } from './message-bus';
import { Events, Topic } from './messages';
export declare class PriorityAwareMessageBus extends MessageBus<Events> {
    private _bus;
    private _setTimeout;
    private _throttled;
    private _inProgress;
    constructor(_bus: MessageBus<Events>, _setTimeout?: typeof setTimeout);
    on<E extends Topic>(topic: E, cb: Events[E]): () => void;
    once<E extends Topic>(topic: E, cb: Events[E]): void;
    emit<E extends Topic>(topic: E, args?: Parameters<Events[E]>): boolean;
    destroy(): void;
    private _afterMessage;
}
