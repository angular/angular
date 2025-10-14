/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Provider, WritableSignal } from '@angular/core';
import { Settings } from '../settings';
import { ThemePreference } from '../theme_types';
export declare class SettingsMock extends Settings {
    routerGraphEnabled: WritableSignal<boolean>;
    showCommentNodes: WritableSignal<boolean>;
    signalGraphEnabled: WritableSignal<boolean>;
    timingAPIEnabled: WritableSignal<boolean>;
    theme: WritableSignal<ThemePreference>;
    activeTab: WritableSignal<string>;
}
export declare const SETTINGS_MOCK: Provider[];
