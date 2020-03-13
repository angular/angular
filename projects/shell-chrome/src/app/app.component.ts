import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { injectScripts } from '../inject';
import { MessageBus, Events } from 'protocol';
import { ZoneAwareChromeMessageBus } from './zone-aware-chrome-message-bus';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  messageBus: MessageBus<Events> | null;

  constructor(private _cd: ChangeDetectorRef, private _ngZone: NgZone) {}

  ngOnInit(): void {
    console.log('Initializing Angular DevTools');

    const port = chrome.runtime.connect({
      name: '' + chrome.devtools.inspectedWindow.tabId,
    });

    chrome.devtools.network.onNavigated.addListener(() => {
      window.location.reload();
    });

    this.messageBus = new ZoneAwareChromeMessageBus(port, this._ngZone);

    injectScripts(['backend.js', 'runtime.js']);
    this._cd.detectChanges();
  }
}
