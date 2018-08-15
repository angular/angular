// #docregion
import { Component, OnInit, Self, SkipSelf } from '@angular/core';
import { BROWSER_STORAGE, BrowserStorageService } from './storage.service';

@Component({
  selector: 'app-storage',
  template: `
    Open the inspector to see the local/session storage keys:

    <h3>Session Storage</h3>
    <button (click)="setSession()">Set Session Storage</button>

    <h3>Local Storage</h3>
    <button (click)="setLocal()">Set Local Storage</button>
  `,
  providers: [
    BrowserStorageService,
    { provide: BROWSER_STORAGE, useFactory: () => sessionStorage }
  ]
})
export class StorageComponent implements OnInit {

  constructor(
    @Self() private sessionStorageService: BrowserStorageService,
    @SkipSelf() private localStorageService: BrowserStorageService,
  ) { }

  ngOnInit() {
  }

  setSession() {
    this.sessionStorageService.set('hero', 'Dr Nice - Session');
  }

  setLocal() {
    this.localStorageService.set('hero', 'Dr Nice - Local');
  }
}
