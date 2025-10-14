/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';
import {MatTooltip} from '@angular/material/tooltip';
import {MessageBus} from '../../../../protocol';
import {ApplicationEnvironment, TOP_LEVEL_FRAME_ID} from '../application-environment/index';
import {FrameManager} from '../application-services/frame_manager';
import {ThemeService} from '../application-services/theme_service';
import {DirectiveExplorerComponent} from './directive-explorer/directive-explorer.component';
import {InjectorTreeComponent} from './injector-tree/injector-tree.component';
import {ProfilerComponent} from './profiler/profiler.component';
import {RouterTreeComponent} from './router-tree/router-tree.component';
import {TransferStateComponent} from './transfer-state/transfer-state.component';
import {TabUpdate} from './tab-update/index';
import {Settings} from '../application-services/settings';
import {SUPPORTED_APIS} from '../application-providers/supported_apis';
let DevToolsTabsComponent = class DevToolsTabsComponent {
  constructor() {
    this.frameManager = inject(FrameManager);
    this.themeService = inject(ThemeService);
    this.tabUpdate = inject(TabUpdate);
    this.messageBus = inject(MessageBus);
    this.settings = inject(Settings);
    this.applicationEnvironment = inject(ApplicationEnvironment);
    this.supportedApis = inject(SUPPORTED_APIS);
    this.isHydrationEnabled = input(false);
    this.frameSelected = output();
    this.inspectorRunning = signal(false);
    this.showCommentNodes = this.settings.showCommentNodes;
    this.routerGraphEnabled = this.settings.routerGraphEnabled;
    this.timingAPIEnabled = this.settings.timingAPIEnabled;
    this.signalGraphEnabled = this.settings.signalGraphEnabled;
    this.transferStateEnabled = this.settings.transferStateEnabled;
    this.activeTab = this.settings.activeTab;
    this.componentExplorerView = signal(null);
    this.providers = signal([]);
    this.routes = signal([]);
    this.tabs = computed(() => {
      const supportedApis = this.supportedApis();
      const tabs = ['Components'];
      if (supportedApis.profiler) {
        tabs.push('Profiler');
      }
      if (supportedApis.dependencyInjection) {
        tabs.push('Injector Tree');
      }
      if (this.routerGraphEnabled() && this.routes().length > 0) {
        tabs.push('Router Tree');
      }
      if (supportedApis.transferState && this.transferStateEnabled()) {
        tabs.push('Transfer State');
      }
      return tabs;
    });
    this.profilingNotificationsSupported = Boolean(
      window.chrome?.devtools?.performance?.onProfilingStarted,
    );
    this.TOP_LEVEL_FRAME_ID = TOP_LEVEL_FRAME_ID;
    this.angularVersion = input(undefined);
    this.majorAngularVersion = computed(() => {
      const version = this.angularVersion();
      if (!version) {
        return -1;
      }
      return parseInt(version.toString().split('.')[0], 10);
    });
    this.extensionVersion = signal('dev-build');
    this.messageBus.on('updateRouterTree', (routes) => {
      this.routes.set(routes || []);
    });
    // Change the tab to Components, if an element is selected via the inspector.
    this.messageBus.on('selectComponent', () => {
      if (this.activeTab() !== 'Components') {
        this.changeTab('Components');
      }
    });
    this.messageBus.on('latestComponentExplorerView', (view) => {
      this.componentExplorerView.set(view);
    });
    this.messageBus.on('latestInjectorProviders', (_, providers) => {
      this.providers.set(providers);
    });
    if (typeof chrome !== 'undefined' && chrome.runtime !== undefined) {
      this.extensionVersion.set(chrome.runtime.getManifest().version);
    }
  }
  emitSelectedFrame(event) {
    const frameId = event.target.value;
    const frame = this.frameManager.frames().find((frame) => frame.id === parseInt(frameId, 10));
    this.frameSelected.emit(frame);
  }
  changeTab(tab) {
    this.activeTab.set(tab);
    this.tabUpdate.notify(tab);
    if (tab === 'Router Tree') {
      this.messageBus.emit('getRoutes');
    }
  }
  toggleInspector() {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }
  emitInspectorEvent() {
    if (this.inspectorRunning()) {
      this.messageBus.emit('inspectorStart');
    } else {
      this.messageBus.emit('inspectorEnd');
      this.messageBus.emit('removeHighlightOverlay');
    }
  }
  toggleInspectorState() {
    this.inspectorRunning.update((state) => !state);
  }
  toggleTimingAPI() {
    this.timingAPIEnabled.update((state) => !state);
    this.timingAPIEnabled()
      ? this.messageBus.emit('enableTimingAPI')
      : this.messageBus.emit('disableTimingAPI');
  }
  setRouterGraph(enabled) {
    this.routerGraphEnabled.set(enabled);
    if (!enabled) {
      this.activeTab.set('Components');
    }
  }
  setSignalGraph(enabled) {
    this.signalGraphEnabled.set(enabled);
  }
  setTransferStateTab(enabled) {
    this.transferStateEnabled.set(enabled);
    if (!enabled && this.activeTab() === 'Transfer State') {
      this.activeTab.set('Components');
    }
  }
};
DevToolsTabsComponent = __decorate(
  [
    Component({
      selector: 'ng-devtools-tabs',
      templateUrl: './devtools-tabs.component.html',
      styleUrls: ['./devtools-tabs.component.scss'],
      imports: [
        MatTabNav,
        MatTabNavPanel,
        MatTooltip,
        MatIcon,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        MatTabLink,
        DirectiveExplorerComponent,
        ProfilerComponent,
        RouterTreeComponent,
        InjectorTreeComponent,
        TransferStateComponent,
        MatSlideToggle,
      ],
      providers: [TabUpdate],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  DevToolsTabsComponent,
);
export {DevToolsTabsComponent};
//# sourceMappingURL=devtools-tabs.component.js.map
