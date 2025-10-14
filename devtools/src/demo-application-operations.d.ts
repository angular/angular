/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationOperations } from '../projects/ng-devtools';
import { DirectivePosition, ElementPosition, SignalNodePosition } from '../projects/protocol';
export declare class DemoApplicationOperations extends ApplicationOperations {
    private readonly localStorage;
    viewSource(position: ElementPosition): void;
    selectDomElement(position: ElementPosition): void;
    inspect(directivePosition: DirectivePosition, keyPath: string[]): void;
    inspectSignal(position: SignalNodePosition): void;
    viewSourceFromRouter(name: string, type: string): void;
    setStorageItems(items: {
        [key: string]: unknown;
    }): Promise<void>;
    getStorageItems(items: string[]): Promise<{
        [key: string]: unknown;
    }>;
    removeStorageItems(items: string[]): Promise<void>;
    private getLsItems;
    private setLsItems;
}
