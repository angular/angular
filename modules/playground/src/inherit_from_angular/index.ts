/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';
import {Component, Directive, Injectable, NgModule, TemplateRef, ViewContainerRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

@Injectable()
class MyService {
}

@Directive({selector: '[ngIfService]'})
class NgIfService extends NgIf {
  constructor(
      _viewContainerRef: ViewContainerRef, _templateRef: TemplateRef<Object>,
      myService: MyService) {
    super(_viewContainerRef, _templateRef);
    console.log(myService);
    if (myService) {
      Object.getOwnPropertyDescriptor(NgIf.prototype, 'ngIf').set.apply(this, [true]);
    } else {
      Object.getOwnPropertyDescriptor(NgIf.prototype, 'ngIf').set.apply(this, [false]);
    }
  }
}

@Component({
  selector: 'my-app',
  template: `
    <div>
      <h2>Hello</h2>
      <div class="service" *ngIfService>Your service is present</div>
    </div>
  `,
})
class App {
  constructor() {}
}

@NgModule({
  declarations: [App, NgIfService],
  bootstrap: [App],
  imports: [BrowserModule],
  providers: [MyService],
})
class ExampleModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
