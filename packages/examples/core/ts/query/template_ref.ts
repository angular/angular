/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';


// #docregion TemplateRefQuery
@Component({
  selector: 'template-ref-query-example',
  template: `
    <ng-template #heroTemplate>
      <span>🦸</span>
    </ng-template>

    <button (click)="addHero()">Add hero</button>
    <button (click)="removeHero()">Remove hero</button>
    <br />
  `
})
export class TemplateRefExample {
  constructor(private viewContainerRef: ViewContainerRef) {}

  @ViewChild('heroTemplate') template !: TemplateRef<any>;

  addHero() {
    this.viewContainerRef.createEmbeddedView(this.template);
  }

  removeHero() {
    if (this.viewContainerRef.length) {
      this.viewContainerRef.remove(this.viewContainerRef.length - 1);
    }
  }
}
// #enddocregion


@Component({
  selector: 'example-app',
  template: `<template-ref-query-example></template-ref-query-example>`
})
export class AppComponent {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent, TemplateRefExample],
})
export class AppModule {
}
