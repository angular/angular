import {bootstrap} from 'angular2/bootstrap';
import {Component, View, provide} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {TimerWrapper} from 'angular2/src/facade/async';
import {HttpRequestApp} from './http_request_app';
import {
  RouterLink,
  RouteConfig,
  Route,
  RouterOutlet,
  RouteParams,
  ROUTER_PROVIDERS,
  HashLocationStrategy,
  LocationStrategy
} from 'angular2/router';

@Component({selector: 'new-router-content', templateUrl: 'slowslowslownew.html'})
class NewRouterContent {
}

@Component({selector: 'old-router-content', templateUrl: 'slowslowslowold.html'})
class OldRouterContent {
}

@Component({
  selector: 'routing-app',
  template: `
    <router-outlet></router-outlet>
    <a class='cancel' [routerLink]="['/Old']">Change to old route</a>
    <a class='action' [routerLink]="['/New']">Change to new route</a>
  `,
  directives: [RouterOutlet, RouterLink]
})
class RoutingApp {
}

@Component({selector: 'async-app'})
@View({
  template: `
    <div id='increment'>
      <span class='val'>{{val1}}</span>
      <button class='action' (click)="increment()">Increment</button>
    </div>
    <div id='delayedIncrement'>
      <span class='val'>{{val2}}</span>
      <button class='action' (click)="delayedIncrement()">Delayed Increment</button>
      <button class='cancel' *ngIf="timeoutId != null" (click)="cancelDelayedIncrement()">Cancel</button>
    </div>
    <div id='multiDelayedIncrements'>
      <span class='val'>{{val3}}</span>
      <button class='action' (click)="multiDelayedIncrements(10)">10 Delayed Increments</button>
      <button class='cancel' *ngIf="multiTimeoutId != null" (click)="cancelMultiDelayedIncrements()">Cancel</button>
    </div>
    <div id='periodicIncrement'>
      <span class='val'>{{val4}}</span>
      <button class='action' (click)="periodicIncrement()">Periodic Increment</button>
      <button class='cancel' *ngIf="intervalId != null" (click)="cancelPeriodicIncrement()">Cancel</button>
    </div>
    <div id='http'>
      <http-request-app></http-request-app>
    </div>
    <div id='routing'>
      <routing-app></routing-app>
    </div>
  `,
  directives: [NgIf, RoutingApp, HttpRequestApp]
})
@RouteConfig([
  new Route({path: '/', component: OldRouterContent, name: 'Old'}),
  new Route({path: '/new', component: NewRouterContent, name: 'New'})
])
class AsyncApplication {
  val1: number = 0;
  val2: number = 0;
  val3: number = 0;
  val4: number = 0;
  timeoutId = null;
  multiTimeoutId = null;
  intervalId = null;

  increment(): void { this.val1++; };

  delayedIncrement(): void {
    this.cancelDelayedIncrement();
    this.timeoutId = TimerWrapper.setTimeout(() => {
      this.val2++;
      this.timeoutId = null;
    }, 2000);
  };

  multiDelayedIncrements(i: number): void {
    this.cancelMultiDelayedIncrements();

    var self = this;
    function helper(_i) {
      if (_i <= 0) {
        self.multiTimeoutId = null;
        return;
      }

      self.multiTimeoutId = TimerWrapper.setTimeout(() => {
        self.val3++;
        helper(_i - 1);
      }, 500);
    }
    helper(i);
  };

  periodicIncrement(): void {
    this.cancelPeriodicIncrement();
    this.intervalId = TimerWrapper.setInterval(() => { this.val4++; }, 2000)
  };

  cancelDelayedIncrement(): void {
    if (this.timeoutId != null) {
      TimerWrapper.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };

  cancelMultiDelayedIncrements(): void {
    if (this.multiTimeoutId != null) {
      TimerWrapper.clearTimeout(this.multiTimeoutId);
      this.multiTimeoutId = null;
    }
  };

  cancelPeriodicIncrement(): void {
    if (this.intervalId != null) {
      TimerWrapper.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };
}

export function main() {
  bootstrap(AsyncApplication,
            [ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy})]);
}
