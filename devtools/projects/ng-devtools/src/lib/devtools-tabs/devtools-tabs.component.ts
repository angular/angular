/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject, input, output, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';
import {MatTooltip} from '@angular/material/tooltip';
import {Events, MessageBus, Route} from 'protocol';

import {ApplicationEnvironment, Frame, TOP_LEVEL_FRAME_ID} from '../application-environment/index';
import {FrameManager} from '../frame_manager';
import {ThemeService} from '../theme-service';

import {DirectiveExplorerComponent} from './directive-explorer/directive-explorer.component';
import {InjectorTreeComponent} from './injector-tree/injector-tree.component';
import {ProfilerComponent} from './profiler/profiler.component';
import {RouterTreeComponent} from './router-tree/router-tree.component';
import {TabUpdate} from './tab-update/index';

type Tabs = 'Components' | 'Profiler' | 'Router Tree' | 'Injector Tree';

@Component({
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
    MatSlideToggle,
  ],
  providers: [TabUpdate],
})
export class DevToolsTabsComponent {
  readonly isHydrationEnabled = input(false);
  readonly frameSelected = output<Frame>();

  readonly applicationEnvironment = inject(ApplicationEnvironment);
  readonly activeTab = signal<Tabs>('Components');
  readonly inspectorRunning = signal(false);
  readonly showCommentNodes = signal(false);
  readonly routerGraphEnabled = signal(false);
  readonly timingAPIEnabled = signal(false);

  readonly routes = signal<Route[]>([]);
  readonly frameManager = inject(FrameManager);

  readonly snapToRoot = signal(false);

  readonly tabs = computed<Tabs[]>(() => {
    const alwaysShown: Tabs[] = ['Components', 'Profiler', 'Injector Tree'];
    return this.routerGraphEnabled() && this.routes().length > 0
      ? [...alwaysShown, 'Router Tree']
      : alwaysShown;
  });

  profilingNotificationsSupported = Boolean(
    (window.chrome?.devtools as any)?.performance?.onProfilingStarted,
  );
  TOP_LEVEL_FRAME_ID = TOP_LEVEL_FRAME_ID;

  readonly angularVersion = input<string | undefined>(undefined);
  readonly majorAngularVersion = computed(() => {
    const version = this.angularVersion();
    if (!version) {
      return -1;
    }
    return parseInt(version.toString().split('.')[0], 10);
  });

  readonly extensionVersion = signal('Development Build');

  public tabUpdate = inject(TabUpdate);
  public themeService = inject(ThemeService);
  private _messageBus = inject<MessageBus<Events>>(MessageBus);

  constructor() {
    this._messageBus.on('updateRouterTree', (routes) => {
      this.routes.set(routes || []);
    });

    if (typeof chrome !== 'undefined' && chrome.runtime !== undefined) {
      this.extensionVersion.set(chrome.runtime.getManifest().version);
    }
  }

  emitSelectedFrame(frameId: string): void {
    const frame = this.frameManager.frames().find((frame) => frame.id === parseInt(frameId, 10));
    this.frameSelected.emit(frame!);
  }

  changeTab(tab: Tabs): void {
    this.activeTab.set(tab);
    this.tabUpdate.notify(tab);
    if (tab === 'Router Tree') {
      this._messageBus.emit('getRoutes');
      this.snapToRoot.set(true);
    }
  }

  toggleInspector(): void {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }

  emitInspectorEvent(): void {
    if (this.inspectorRunning()) {
      this._messageBus.emit('inspectorStart');
    } else {
      this._messageBus.emit('inspectorEnd');
      this._messageBus.emit('removeHighlightOverlay');
    }
  }

  toggleInspectorState(): void {
    this.inspectorRunning.update((state) => !state);
  }

  toggleTimingAPI(): void {
    this.timingAPIEnabled.update((state) => !state);
    this.timingAPIEnabled()
      ? this._messageBus.emit('enableTimingAPI')
      : this._messageBus.emit('disableTimingAPI');
  }

  protected setRouterGraph(enabled: boolean): void {
    this.routerGraphEnabled.set(enabled);
    if (!enabled) {
      this.activeTab.set('Components');
    }
  }
}
