/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {DevToolsComponent} from '../../../ng-devtools';
import {Events, MessageBus} from '../../../protocol';
import {DEEP_LINK_INSTANCE_ID} from '../../../ng-devtools/src/lib/application-services/deep_link_service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [DevToolsComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private _cd = inject(ChangeDetectorRef);
  private readonly _messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly _deepLinkInstanceId = inject(DEEP_LINK_INSTANCE_ID);
  private onProfilingStartedListener = () => {
    this._messageBus.emit('enableTimingAPI');
  };
  private onProfilingStoppedListener = () => {
    this._messageBus.emit('disableTimingAPI');
  };

  private readonly _deepLinkListener = (event: MessageEvent) => {
    if (
      event.data?.type === 'angular-devtools-deep-link' &&
      typeof event.data.instanceId === 'number'
    ) {
      this._deepLinkInstanceId.set(event.data.instanceId);
    }
  };

  ngOnInit(): void {
    chrome.devtools.network.onNavigated.addListener(() => {
      window.location.reload();
    });
    const chromeDevToolsPerformance = chrome.devtools.performance;
    chromeDevToolsPerformance?.onProfilingStarted?.addListener?.(this.onProfilingStartedListener);
    chromeDevToolsPerformance?.onProfilingStopped?.addListener?.(this.onProfilingStoppedListener);

    // Listen for deep link messages from the devtools page (devtools.ts)
    window.addEventListener('message', this._deepLinkListener);

    this._cd.detectChanges();
  }
  ngOnDestroy(): void {
    const chromeDevToolsPerformance = chrome.devtools.performance;
    chromeDevToolsPerformance?.onProfilingStarted?.removeListener?.(
      this.onProfilingStartedListener,
    );
    chromeDevToolsPerformance?.onProfilingStopped?.removeListener?.(
      this.onProfilingStoppedListener,
    );
    window.removeEventListener('message', this._deepLinkListener);
  }
}
