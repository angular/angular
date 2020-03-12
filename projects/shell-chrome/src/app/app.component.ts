import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { panelDevTools } from '../panel-devtools';
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

    this.messageBus = new ZoneAwareChromeMessageBus(port, this._ngZone);

    this.messageBus.on('reload', () => window.location.reload());

    panelDevTools.injectBackend();
    this._cd.detectChanges();
  }
}
