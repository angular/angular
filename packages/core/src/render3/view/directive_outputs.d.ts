/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { EventCallback, WrappedEventCallback } from '../../event_delegation_utils';
import { DirectiveDef } from '../interfaces/definition';
import { TNode } from '../interfaces/node';
import { LView } from '../interfaces/view';
export declare function createOutputListener(tNode: TNode, lView: LView<{} | null>, listenerFn: EventCallback, targetDef: DirectiveDef<unknown>, eventName: string): void;
export declare function listenToOutput(tNode: TNode, lView: LView, directiveIndex: number, lookupName: string, eventName: string, listenerFn: WrappedEventCallback): void;
