import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { injectScripts } from '../inject';
import { MessageBus, Events } from 'protocol';
import { ZoneAwareChromeMessageBus } from './zone-aware-chrome-message-bus';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: MessageBus,
      useFactory(ngZone: NgZone): MessageBus<Events> {
        const port = chrome.runtime.connect({
          name: '' + chrome.devtools.inspectedWindow.tabId,
        });
        return new ZoneAwareChromeMessageBus(port, ngZone);
      },
      deps: [NgZone],
    },
  ],
})
export class AppComponent implements OnInit {
  constructor(private _cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('Initializing Angular DevTools');
    chrome.devtools.network.onNavigated.addListener(() => {
      window.location.reload();
    });
    injectScripts(['backend.js', 'runtime.js']);
    this._cd.detectChanges();
  }
}
