/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {DevToolsComponent} from '../../../ng-devtools';
import {MessageBus} from '../../../protocol';
let AppComponent = class AppComponent {
  constructor() {
    this._cd = inject(ChangeDetectorRef);
    this._messageBus = inject(MessageBus);
    this.onProfilingStartedListener = () => {
      this._messageBus.emit('enableTimingAPI');
    };
    this.onProfilingStoppedListener = () => {
      this._messageBus.emit('disableTimingAPI');
    };
  }
  ngOnInit() {
    chrome.devtools.network.onNavigated.addListener(() => {
      window.location.reload();
    });
    const chromeDevToolsPerformance = chrome.devtools.performance;
    chromeDevToolsPerformance?.onProfilingStarted?.addListener?.(this.onProfilingStartedListener);
    chromeDevToolsPerformance?.onProfilingStopped?.addListener?.(this.onProfilingStoppedListener);
    this._cd.detectChanges();
  }
  ngOnDestroy() {
    const chromeDevToolsPerformance = chrome.devtools.performance;
    chromeDevToolsPerformance?.onProfilingStarted?.removeListener?.(
      this.onProfilingStartedListener,
    );
    chromeDevToolsPerformance?.onProfilingStopped?.removeListener?.(
      this.onProfilingStoppedListener,
    );
  }
};
AppComponent = __decorate(
  [
    Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.scss'],
      imports: [DevToolsComponent],
    }),
  ],
  AppComponent,
);
export {AppComponent};
//# sourceMappingURL=app.component.js.map
