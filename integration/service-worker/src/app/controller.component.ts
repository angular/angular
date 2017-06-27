import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {NgswModule, NgswPush, NgswUpdate, NgswDebug, NgswAppVersion} from '@angular/service-worker';

import 'rxjs/add/observable/merge';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';

@Component({
  selector: 'controller',
  template: `
<!-- Action selection -->
<div>
  <label for="actionSelect">
    Select an action
  </label>
  <select #actionSelect id="actionSelect" (change)="actionSelected($event.target.value)">
    <option disabled selected>...</option>
    <option value="MAKE_REQUEST">Make an HTTP request</option>
    <option value="CACHE_KEYS">Get cache keys</option>
    <option value="SW_CHECK">Check service worker</option>
    <option value="SW_INSTALL">Install service worker</option>
    <option value="COMPANION_PING">Ping from the companion</option>
    <option value="COMPANION_REG_PUSH">Register for push notifications</option>
    <option value="CHECK_FOR_UPDATES">Check for updates</option>
    <option value="COMPANION_SUBSCRIBE_TO_UPDATES">Subscribe to update notifications</option>
    <option value="FORCE_UPDATE">Force install pending update</option>
    <option value="RESET">Reset</option>
  </select>
  <span *ngIf="alert" id="alert">ASYNC ALERT</span>
  <span *ngIf="updateAlert" id="updateAlert">UPDATE ALERT</span>
  <input id="actionInput" #actionInput [(ngModel)]="action">
  <button id="actionExec" (click)="refresh(actionInput.value)">Exec</button>
</div>

<!-- action configuration -->
<div [ngSwitch]="action">
  <div *ngSwitchCase="'MAKE_REQUEST'">
    <div>
      <label for="requestUrl">
        Url:
      </label>
      <input #requestUrl id="requestUrl">
    </div>
    <button id="requestAction" (click)="request(requestUrl.value)">Make request</button>
  </div>
  <div *ngSwitchCase="'SW_INSTALL'">
    <div>
      <label for="workerUrl">
        Worker:
      </label>
      <input #workerUrl id="workerUrl">
    </div>
    <button id="installAction" (click)="installWorker(workerUrl.value)">Install service worker</button>
  </div>
  <div *ngSwitchCase="'FORCE_UPDATE'">
    <div>
      <label for="updateVersion">
        Version:
      </label>
      <input #updateVersion id="updateVersion">
    </div>
    <button id="updateAction" (click)="forceUpdate(updateVersion.value)">Force update</button>
  </div>
</div>

<h5>Result</h5>
<pre id="result">{{result}}</pre>
<h5>Updates</h5>
<pre id="updates">{{updates}}</pre>
<h5>Log</h5>
<pre id="log">{{log | json}}</pre>
`
})
export class ControllerCmp {
  result: string = null;
  updates: string = null;
  action: string = '';
  alert: boolean = false;
  updateAlert: boolean = false;
  log: string[] = [];

  pushSub = null;
  updateSub = null;
  pushes = [];

  constructor(public swPush: NgswPush, public swDebug: NgswDebug, public swUpdate: NgswUpdate) {}
  
  actionSelected(action): void {
    console.log('set action', action);
    this.action = action;
  }
  
  request(url: string): void {
    fetch(url).then(resp => resp.text()).then(text => {
      this.result = text;
      this.alert = true;
    });
  }
  
  refresh(action) {
    this.result = null;
    if (this.pushSub !== null) {
      this.pushSub.unsubscribe();
      this.pushSub = null;
    }
    switch (action) {
      case 'RESET':
        this.alert = false;
        this.updateAlert = false;
        this.result = 'reset';
        break;
      case 'CHECK_FOR_UPDATES':
        this
          .swUpdate
          .available
          .take(1)
          .subscribe(res => {
            this.result = JSON.stringify(res);
            this.alert = true;
          });
        this.swUpdate.check();
        break;
      case 'CACHE_KEYS':
        this.loadCacheKeys();
        break;
      case 'SW_CHECK':
        this.checkServiceWorker();
        break;
      case 'COMPANION_PING':
        this
          .swDebug
          .ping()
          .then(() => {
            this.result = 'pong';
            this.alert = true;
          });
        break;
      case 'COMPANION_REG_PUSH':
        this
          .swPush
          .requestSubscription({serverPublicKey: 'BLRl_fG1TCTc1D2JwzOpdZjaRcJucXtG8TAd5g9vuYjl6KUUDxgoRjQPCgjZfY-_Rusd_qtjNvanHXeFvOFlxH4'})
          .then(sub => {
            this.result = JSON.stringify(sub.toJSON());
            this.alert = true;
          });
          break;
        case 'COMPANION_WAIT_FOR_PUSH':
          this.pushSub = this
            .swPush
            .messages
            .take(1)
            .map(value => JSON.stringify(value))
            .subscribe(value => {
              this.result = value;
              this.alert = true;
            });
          (this
            .swDebug as any)
            .fakePush(JSON.stringify({
              notification: {
                title: 'push notification test',
                body: 'this is a test of push notifications',
                requireInteraction: true
              },
              message: 'hello from the server',
            }));
          break;
        case 'COMPANION_SUBSCRIBE_TO_UPDATES':
          this.updateSub = Observable
            .merge(this.swUpdate.available, this.swUpdate.activated)
            .scan((acc, value) => acc.concat(value), [])
            .startWith([])
            .subscribe(value => {
              this.updates = JSON.stringify(value);
              if (value.length > 0) {
                this.updateAlert = true;          
              }
            });
          this.result = 'true';
          this.alert = true;
          break;
      default:
        this.result = null;
    }
  }
  
  loadCacheKeys(): void {
    let caches = window['caches'];
    caches.keys().then(keys => this.result = JSON.stringify(keys));
  }
  
  installWorker(url): void {
    navigator['serviceWorker'].register(url)
      .then(reg => {
        this.result = JSON.stringify({
          result: {
            scope: reg.scope
          }
        });
      })
      .catch(err => {
        this.result = JSON.stringify({
          error: `${err}`
        })
      });
  }

  forceUpdate(version: NgswAppVersion): void {
    this
      .swUpdate
      .activateUpdate(version)
      .then(() => {
        this.result = 'activated';
        this.alert = true;
      })
  }
  
  checkServiceWorker(): void {
    this.result = '';
    navigator['serviceWorker']
      .getRegistrations()
      .then(registrations => {
        return registrations
          .map(reg => {
            return {
              scope: reg.scope,
              active: !!reg.active,
              installing: !!reg.installing,
              waiting: !!reg.waiting
            };
          })
      })
      .then(value => JSON.stringify(value))
      .then(value => {
        this.result = value;
      })
  }
}
