/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { WritableSignal } from '@angular/core';
export declare const SETTINGS_STORE_KEY = "ng-dt-settings";
/** Provides an API for storing and preserving settings values. */
export declare class SettingsStore {
    private data;
    private readonly appOperations;
    private readonly injector;
    private readonly signals;
    constructor(data: {
        [key: string]: unknown;
    });
    /**
     * Create a settings value a provided key, as a writable signal.
     * If the item doesn't exist, a new one will be created.
     * Updates to the signal value are automatically stored in the storage.
     */
    create<T>(config: {
        key: string;
        category: string;
        initialValue: T;
    }): WritableSignal<T>;
}
