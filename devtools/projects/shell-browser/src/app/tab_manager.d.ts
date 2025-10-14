/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export interface ContentScriptConnection {
    port: chrome.runtime.Port | null;
    enabled: boolean;
    frameId: 'devtools' | number;
    backendReady?: Promise<void>;
}
export interface DevToolsConnection {
    devtools: chrome.runtime.Port | null;
    contentScripts: {
        [name: string]: ContentScriptConnection;
    };
}
export interface Tabs {
    [tabId: string]: DevToolsConnection | undefined;
}
export declare class TabManager {
    private tabs;
    private runtime;
    constructor(tabs: Tabs, runtime: typeof chrome.runtime);
    static initialize(tabs: Tabs, runtime?: typeof chrome.runtime): TabManager;
    private initialize;
    private ensureTabExists;
    private registerDevToolsForTab;
    private registerContentScriptForTab;
    private doublePipe;
}
