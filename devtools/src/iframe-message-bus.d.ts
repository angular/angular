/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Events, MessageBus, Parameters } from '../projects/protocol';
export declare class IFrameMessageBus extends MessageBus<Events> {
    private readonly source;
    private readonly destination;
    private readonly docWindow;
    private listeners;
    constructor(source: string, destination: string, docWindow: () => Window);
    on<E extends keyof Events>(topic: E, cb: Events[E]): () => void;
    once<E extends keyof Events>(topic: E, cb: Events[E]): void;
    emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean;
    destroy(): void;
}
