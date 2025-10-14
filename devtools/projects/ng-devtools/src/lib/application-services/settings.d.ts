/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ThemePreference } from './theme_types';
export declare class Settings {
    private readonly settingsStore;
    readonly showCommentNodes: import("@angular/core").WritableSignal<boolean>;
    readonly routerGraphEnabled: import("@angular/core").WritableSignal<boolean>;
    readonly timingAPIEnabled: import("@angular/core").WritableSignal<boolean>;
    readonly signalGraphEnabled: import("@angular/core").WritableSignal<boolean>;
    readonly transferStateEnabled: import("@angular/core").WritableSignal<boolean>;
    readonly theme: import("@angular/core").WritableSignal<ThemePreference>;
    readonly activeTab: import("@angular/core").WritableSignal<string>;
}
