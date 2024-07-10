/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, NgZone} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ApplicationEnvironment, ApplicationOperations, DevToolsComponent} from 'ng-devtools';

import {AppComponent} from './app.component';
import {ChromeApplicationEnvironment} from './chrome-application-environment';
import {ChromeApplicationOperations} from './chrome-application-operations';
import {ZoneAwareChromeMessageBus} from './zone-aware-chrome-message-bus';
import {Events, MessageBus, PriorityAwareMessageBus} from 'protocol';
import {FrameManager} from '../../../../projects/ng-devtools/src/lib/frame_manager';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserAnimationsModule, DevToolsComponent, MatSelect],
  bootstrap: [AppComponent],
  providers: [
    {provide: FrameManager, useFactory: () => FrameManager.initialize()},
    {
      provide: ApplicationOperations,
      useClass: ChromeApplicationOperations,
    },
    {
      provide: ApplicationEnvironment,
      useClass: ChromeApplicationEnvironment,
    },
    {
      provide: MessageBus,
      useFactory(ngZone: NgZone): MessageBus<Events> {
        const port = chrome.runtime.connect({
          name: '' + chrome.devtools.inspectedWindow.tabId,
        });

        return new PriorityAwareMessageBus(new ZoneAwareChromeMessageBus(port, ngZone));
      },
      deps: [NgZone],
    },
  ],
})
export class AppModule {}
