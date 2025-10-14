/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Events, MessageBus, Parameters } from '../projects/protocol';
export declare class ZoneUnawareIFrameMessageBus extends MessageBus<Events> {
    private delegate;
    constructor(source: string, destination: string, docWindow: () => Window);
    on<E extends keyof Events>(topic: E, cb: Events[E]): any;
    once<E extends keyof Events>(topic: E, cb: Events[E]): any;
    emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean;
    destroy(): void;
}
