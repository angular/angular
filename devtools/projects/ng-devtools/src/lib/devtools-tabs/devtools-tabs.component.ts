/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';
import {MatTooltip} from '@angular/material/tooltip';
import {Events, MessageBus, Route} from 'protocol';

import {ApplicationEnvironment, Frame, TOP_LEVEL_FRAME_ID} from '../application-environment/index';
import {FrameManager} from '../frame_manager';
import {Theme, ThemeService} from '../theme-service';

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
  standalone: true,
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
export class DevToolsTabsComponent implements OnInit, AfterViewInit {
  @Input() isHydrationEnabled = false;

  @Output() frameSelected = new EventEmitter<Frame>();
  @ViewChild(DirectiveExplorerComponent) directiveExplorer!: DirectiveExplorerComponent;
  @ViewChild('navBar', {static: true}) navbar!: MatTabNav;

  applicationEnvironment = inject(ApplicationEnvironment);

  activeTab: Tabs = 'Components';
  inspectorRunning = false;
  routerTreeEnabled = false;
  showCommentNodes = false;
  timingAPIEnabled = false;
  profilingNotificationsSupported = Boolean(
    (window.chrome?.devtools as any)?.performance?.onProfilingStarted,
  );

  currentTheme!: Theme;
  routes: Route[] = [];

  frameManager = inject(FrameManager);

  TOP_LEVEL_FRAME_ID = TOP_LEVEL_FRAME_ID;

  angularVersion = input<string | undefined>(undefined);
  majorAngularVersion = computed(() => {
    const version = this.angularVersion();
    if (!version) {
      return -1;
    }
    return parseInt(version.toString().split('.')[0], 10);
  });

  extensionVersion = 'Development Build';

  constructor(
    public tabUpdate: TabUpdate,
    public themeService: ThemeService,
    private _messageBus: MessageBus<Events>,
  ) {
    this.themeService.currentTheme
      .pipe(takeUntilDestroyed())
      .subscribe((theme) => (this.currentTheme = theme));

    this._messageBus.on('updateRouterTree', (routes) => {
      this.routes = routes || [];
    });
  }

  emitSelectedFrame(frameId: string): void {
    const frame = this.frameManager.frames.find((frame) => frame.id === parseInt(frameId, 10));
    this.frameSelected.emit(frame);
  }

  ngOnInit(): void {
    this.navbar.stretchTabs = false;

    if (chrome !== undefined && chrome.runtime !== undefined) {
      this.extensionVersion = chrome.runtime.getManifest().version;
    }
  }

  get tabs(): Tabs[] {
    const alwaysShown: Tabs[] = ['Components', 'Profiler', 'Injector Tree'];
    return this.routes.length === 0 ? alwaysShown : [...alwaysShown, 'Router Tree'];
  }

  ngAfterViewInit(): void {
    this.navbar.disablePagination = true;
  }

  changeTab(tab: Tabs): void {
    this.activeTab = tab;
    this.tabUpdate.notify();
    if (tab === 'Router Tree') {
      this._messageBus.emit('getRoutes');
    }
  }

  toggleInspector(): void {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }

  emitInspectorEvent(): void {
    if (this.inspectorRunning) {
      this._messageBus.emit('inspectorStart');
    } else {
      this._messageBus.emit('inspectorEnd');
      this._messageBus.emit('removeHighlightOverlay');
    }
  }

  toggleInspectorState(): void {
    this.inspectorRunning = !this.inspectorRunning;
  }

  toggleTimingAPI(): void {
    this.timingAPIEnabled = !this.timingAPIEnabled;
    this.timingAPIEnabled
      ? this._messageBus.emit('enableTimingAPI')
      : this._messageBus.emit('disableTimingAPI');
  }
}
