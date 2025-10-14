/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export type Browser = 'chrome' | 'firefox' | 'unknown';
export declare class BrowserStylesService {
    private readonly doc;
    private readonly rendererFactory;
    private readonly renderer;
    private readonly platform;
    private readonly browser;
    initBrowserSpecificStyles(): void;
    /** Add the browser class to the document body */
    private addBrowserUiClass;
    /** Load browser-specific styles */
    private loadBrowserStyle;
    private detectBrowser;
}
