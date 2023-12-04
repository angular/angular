/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatTabNav} from '@angular/material/tabs';
import {Events, MessageBus, Route} from 'protocol';

import {ApplicationEnvironment} from '../application-environment/index';
import {Theme, ThemeService} from '../theme-service';

import {DirectiveExplorerComponent} from './directive-explorer/directive-explorer.component';
import {TabUpdate} from './tab-update/index';

@Component({
  selector: 'ng-devtools-tabs',
  templateUrl: './devtools-tabs.component.html',
  styleUrls: ['./devtools-tabs.component.scss'],
})
export class DevToolsTabsComponent implements OnInit, AfterViewInit {
  @Input() angularVersion: string|undefined = undefined;
  @ViewChild(DirectiveExplorerComponent) directiveExplorer!: DirectiveExplorerComponent;
  @ViewChild('navBar', {static: true}) navbar!: MatTabNav;

  activeTab: 'Components'|'Profiler'|'Router Tree'|'Injector Tree' = 'Components';

  inspectorRunning = false;
  routerTreeEnabled = false;
  showCommentNodes = false;
  timingAPIEnabled = false;

  currentTheme!: Theme;

  routes: Route[] = [];

  constructor(
      public tabUpdate: TabUpdate,
      public themeService: ThemeService,
      private _messageBus: MessageBus<Events>,
      private _applicationEnvironment: ApplicationEnvironment,
  ) {
    this.themeService.currentTheme.pipe(takeUntilDestroyed())
        .subscribe((theme) => (this.currentTheme = theme));

    this._messageBus.on('updateRouterTree', (routes) => {
      this.routes = routes || [];
    });
  }

  ngOnInit(): void {
    this.navbar.stretchTabs = false;
  }

  get tabs(): string[] {
    const alwaysShown = ['Components', 'Profiler', 'Injector Tree'];
    return this.routes.length === 0 ? alwaysShown : [...alwaysShown, 'Router Tree'];
  }

  ngAfterViewInit(): void {
    this.navbar.disablePagination = true;
  }

  get latestSHA(): string {
    return this._applicationEnvironment.environment.LATEST_SHA.slice(0, 8);
  }

  changeTab(tab: 'Profiler'|'Components'|'Router Tree'): void {
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
    this.timingAPIEnabled ? this._messageBus.emit('enableTimingAPI') :
                            this._messageBus.emit('disableTimingAPI');
  }
}
