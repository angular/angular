/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
type TimeStampName = string;
type DevToolsColor = 'primary' | 'primary-light' | 'primary-dark' | 'secondary' | 'secondary-light' | 'secondary-dark' | 'tertiary' | 'tertiary-light' | 'tertiary-dark' | 'error';
declare global {
    interface Console {
        timeStamp(label: string, start: TimeStampName, end?: TimeStampName, trackName?: string, trackGroup?: string, color?: DevToolsColor): void;
    }
}
/**
 * Start listening to the Angular's internal performance-related events and route those to the Chrome DevTools performance panel.
 * This enables Angular-specific data visualization when recording a performance profile directly in the Chrome DevTools.
 *
 * Note: integration is enabled in the development mode only, this operation is noop in the production mode.
 *
 * @experimental
 *
 * @returns a function that can be invoked to stop sending profiling data.
 */
export declare function enableProfiling(): () => void;
export {};
