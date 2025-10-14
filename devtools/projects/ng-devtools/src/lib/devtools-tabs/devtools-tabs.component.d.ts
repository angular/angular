/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentExplorerView, Route, SerializedProviderRecord } from '../../../../protocol';
import { ApplicationEnvironment, Frame } from '../application-environment/index';
import { FrameManager } from '../application-services/frame_manager';
import { ThemeService } from '../application-services/theme_service';
type Tab = 'Components' | 'Profiler' | 'Router Tree' | 'Injector Tree' | 'Transfer State';
export declare class DevToolsTabsComponent {
    readonly frameManager: FrameManager;
    readonly themeService: ThemeService;
    private readonly tabUpdate;
    private readonly messageBus;
    private readonly settings;
    protected readonly applicationEnvironment: ApplicationEnvironment;
    protected readonly supportedApis: import("../application-providers/supported_apis").SupportedApisSignal;
    readonly isHydrationEnabled: import("@angular/core").InputSignal<boolean>;
    readonly frameSelected: import("@angular/core").OutputEmitterRef<Frame>;
    readonly inspectorRunning: import("@angular/core").WritableSignal<boolean>;
    protected readonly showCommentNodes: import("@angular/core").WritableSignal<boolean>;
    protected readonly routerGraphEnabled: import("@angular/core").WritableSignal<boolean>;
    protected readonly timingAPIEnabled: import("@angular/core").WritableSignal<boolean>;
    protected readonly signalGraphEnabled: import("@angular/core").WritableSignal<boolean>;
    protected readonly transferStateEnabled: import("@angular/core").WritableSignal<boolean>;
    protected readonly activeTab: import("@angular/core").WritableSignal<string>;
    readonly componentExplorerView: import("@angular/core").WritableSignal<ComponentExplorerView | null>;
    readonly providers: import("@angular/core").WritableSignal<SerializedProviderRecord[]>;
    readonly routes: import("@angular/core").WritableSignal<Route[]>;
    readonly tabs: import("@angular/core").Signal<Tab[]>;
    profilingNotificationsSupported: boolean;
    TOP_LEVEL_FRAME_ID: number;
    readonly angularVersion: import("@angular/core").InputSignal<string | undefined>;
    readonly majorAngularVersion: import("@angular/core").Signal<number>;
    readonly extensionVersion: import("@angular/core").WritableSignal<string>;
    constructor();
    emitSelectedFrame(event: Event): void;
    changeTab(tab: Tab): void;
    toggleInspector(): void;
    emitInspectorEvent(): void;
    toggleInspectorState(): void;
    toggleTimingAPI(): void;
    protected setRouterGraph(enabled: boolean): void;
    protected setSignalGraph(enabled: boolean): void;
    protected setTransferStateTab(enabled: boolean): void;
}
export {};
