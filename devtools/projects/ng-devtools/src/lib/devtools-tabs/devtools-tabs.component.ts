/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
import {
  ComponentExplorerView,
  Events,
  MessageBus,
  Route,
  SerializedInjector,
  SerializedProviderRecord,
  SupportedApis,
} from '../../../../protocol';

import {ApplicationEnvironment, Frame, TOP_LEVEL_FRAME_ID} from '../application-environment/index';
import {FrameManager} from '../application-services/frame_manager';
import {ThemeService} from '../application-services/theme_service';

import {DirectiveExplorerComponent} from './directive-explorer/directive-explorer.component';
import {InjectorTreeComponent} from './injector-tree/injector-tree.component';
import {ProfilerComponent} from './profiler/profiler.component';
import {RouterTreeComponent} from './router-tree/router-tree.component';
import {TransferStateComponent} from './transfer-state/transfer-state.component';
import {TabUpdate} from './tab-update/index';
import {Settings} from '../application-services/settings';

type Tab = 'Components' | 'Profiler' | 'Router Tree' | 'Injector Tree' | 'Transfer State';

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
    TransferStateComponent,
    MatSlideToggle,
  ],
  providers: [TabUpdate],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolsTabsComponent {
  readonly applicationEnvironment = inject(ApplicationEnvironment);
  readonly frameManager = inject(FrameManager);
  readonly themeService = inject(ThemeService);
  private readonly tabUpdate = inject(TabUpdate);
  private readonly messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly settings = inject(Settings);

  readonly isHydrationEnabled = input(false);
  readonly supportedApis = input.required<SupportedApis>();
  readonly frameSelected = output<Frame>();

  readonly activeTab = signal<Tab>('Components');
  readonly inspectorRunning = signal(false);

  protected readonly showCommentNodes = this.settings.showCommentNodes;
  protected readonly routerGraphEnabled = this.settings.routerGraphEnabled;
  protected readonly timingAPIEnabled = this.settings.timingAPIEnabled;
  protected readonly signalGraphEnabled = this.settings.signalGraphEnabled;
  readonly transferStateTabEnabled = signal(false);

  readonly componentExplorerView = signal<ComponentExplorerView | null>(null);
  readonly providers = signal<SerializedProviderRecord[]>([]);
  readonly routes = signal<Route[]>([]);

  readonly snapToRoot = signal(false);

  readonly tabs = computed<Tab[]>(() => {
    const supportedApis = this.supportedApis();
    const tabs: Tab[] = ['Components'];

    if (supportedApis.profiler) {
      tabs.push('Profiler');
    }
    if (supportedApis.dependencyInjection) {
      tabs.push('Injector Tree');
    }
    if (supportedApis.routes && this.routerGraphEnabled() && this.routes().length > 0) {
      tabs.push('Router Tree');
    }
    if (supportedApis.transferState && this.transferStateTabEnabled()) {
      tabs.push('Transfer State');
    }

    return tabs;
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

  readonly extensionVersion = signal('dev-build');

  constructor() {
    this.messageBus.on('updateRouterTree', (routes: any[]) => {
      this.routes.set(routes || []);
    });

    // Change the tab to Components, if an element is selected via the inspector.
    this.messageBus.on('selectComponent', () => {
      if (this.activeTab() !== 'Components') {
        this.changeTab('Components');
      }
    });

    this.messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      this.componentExplorerView.set(view);
    });

    this.messageBus.on(
      'latestInjectorProviders',
      (_: SerializedInjector, providers: SerializedProviderRecord[]) => {
        this.providers.set(providers);
      },
    );

    if (typeof chrome !== 'undefined' && chrome.runtime !== undefined) {
      this.extensionVersion.set(chrome.runtime.getManifest().version);
    }
  }

  emitSelectedFrame(event: Event): void {
    const frameId = (event.target as HTMLInputElement).value;
    const frame = this.frameManager.frames().find((frame) => frame.id === parseInt(frameId, 10));
    this.frameSelected.emit(frame!);
  }

  changeTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.tabUpdate.notify(tab);
    if (tab === 'Router Tree') {
      this.messageBus.emit('getRoutes');
      this.snapToRoot.set(true);
    }
  }

  toggleInspector(): void {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }

  emitInspectorEvent(): void {
    if (this.inspectorRunning()) {
      this.messageBus.emit('inspectorStart');
    } else {
      this.messageBus.emit('inspectorEnd');
      this.messageBus.emit('removeHighlightOverlay');
    }
  }

  toggleInspectorState(): void {
    this.inspectorRunning.update((state) => !state);
  }

  toggleTimingAPI(): void {
    this.timingAPIEnabled.update((state) => !state);
    this.timingAPIEnabled()
      ? this.messageBus.emit('enableTimingAPI')
      : this.messageBus.emit('disableTimingAPI');
  }

  protected setRouterGraph(enabled: boolean): void {
    this.routerGraphEnabled.set(enabled);
    if (!enabled) {
      this.activeTab.set('Components');
    }
  }

  protected setSignalGraph(enabled: boolean): void {
    this.signalGraphEnabled.set(enabled);
  }

  protected setTransferStateTab(enabled: boolean): void {
    this.transferStateTabEnabled.set(enabled);
    if (!enabled && this.activeTab() === 'Transfer State') {
      this.activeTab.set('Components');
    }
  }
}
