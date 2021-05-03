/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgFor, NgIf} from '@angular/common';
import {Component, Directive, DynamicComponentLoader, ViewContainerRef} from '@angular/core';
import {ApplicationRef} from '@angular/core/src/application_ref';
import {ListWrapper} from '@angular/facade/src/lang';
import {bootstrap, BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {bindAction, getIntParameter} from '@angular/testing/src/benchmark_util';

let testList = null;

export function main() {
  const size = getIntParameter('size');
  testList = [];

  platformBrowserDynamic().bootstrapModule(AppModule).then((ref) => {
    const injector = ref.injector;
    const app: AppComponent = ref.instance;
    const appRef = injector.get(ApplicationRef);

    bindAction('#reset', function() {
      app.reset();
      appRef.tick();
    });

    // Baseline (plain components)
    bindAction('#createPlainComponents', function() {
      app.createPlainComponents();
      appRef.tick();
    });

    // Components with decorators
    bindAction('#createComponentsWithDirectives', function() {
      app.createComponentsWithDirectives();
      appRef.tick();
    });

    // Components with decorators
    bindAction('#createDynamicComponents', function() {
      app.createDynamicComponents();
      appRef.tick();
    });
  });
}


@Component({selector: 'dummy', template: `<div></div>`})
class DummyComponent {
}

@Directive({selector: '[dummy-decorator]'})
class DummyDirective {
}

@Directive({selector: 'dynamic-dummy'})
class DynamicDummy {
  constructor(loader: DynamicComponentLoader, location: ViewContainerRef) {
    loader.loadNextToLocation(DummyComponent, location);
  }
}

@Component({
  selector: 'app',
  directives: [NgIf, NgFor, DummyComponent, DummyDirective, DynamicDummy],
  template: `
    <div *ngIf="testingPlainComponents">
      <dummy *ngFor="let i of list"></dummy>
    </div>

    <div *ngIf="testingWithDirectives">
      <dummy dummy-decorator *ngFor="let i of list"></dummy>
    </div>

    <div *ngIf="testingDynamicComponents">
      <dynamic-dummy *ngFor="let i of list"></dynamic-dummy>
    </div>
  `
})
class AppComponent {
  list: any[];
  testingPlainComponents: boolean;
  testingWithDirectives: boolean;
  testingDynamicComponents: boolean;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.list = [];
    this.testingPlainComponents = false;
    this.testingWithDirectives = false;
    this.testingDynamicComponents = false;
  }

  createPlainComponents(): void {
    this.list = testList;
    this.testingPlainComponents = true;
  }

  createComponentsWithDirectives(): void {
    this.list = testList;
    this.testingWithDirectives = true;
  }

  createDynamicComponents(): void {
    this.list = testList;
    this.testingDynamicComponents = true;
  }
}



@NgModule({imports: [BrowserModule], bootstrap: [AppComponent]})
class AppModule {
}
