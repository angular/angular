/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ThemeUi } from './theme_types';
export declare class ThemeService {
    private readonly win;
    private readonly doc;
    private readonly settings;
    private readonly appRef;
    private readonly rendererFactory;
    private readonly renderer;
    private readonly systemTheme;
    private matchMediaUnlisten?;
    currentTheme: import("@angular/core").Signal<ThemeUi>;
    constructor();
    private get systemPrefersDarkMode();
    toggleDarkMode(isDark: boolean): void;
    initializeThemeWatcher(): void;
    private updateThemeClass;
}
