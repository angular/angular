/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DirectivePosition, ElementPosition, SignalNodePosition } from '../../../../../protocol';
import { Frame } from '../../application-environment';
import { ApplicationOperations } from '../../application-operations';
export declare class AppOperationsMock extends ApplicationOperations {
    private storage;
    /** Helper method – gives access to stored settings */
    getStoredSettings(): {
        [key: string]: unknown;
    };
    setStorageItems(items: {
        [key: string]: unknown;
    }): Promise<void>;
    getStorageItems(items: string[]): Promise<{
        [key: string]: unknown;
    }>;
    removeStorageItems(items: string[]): Promise<void>;
    viewSource(position: ElementPosition, target: Frame, directiveIndex?: number): void;
    selectDomElement(position: ElementPosition, target: Frame): void;
    inspect(directivePosition: DirectivePosition, objectPath: string[], target: Frame): void;
    inspectSignal(position: SignalNodePosition, target: Frame): void;
    viewSourceFromRouter(name: string, type: string, target: Frame): void;
}
