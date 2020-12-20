/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, Directive, NgModule, TemplateRef, ViewContainerRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Directive({selector: '[viewManipulationDirective]', exportAs: 'vm'})
export class ViewManipulationDirective {
  constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<any>) {}

  create(no: number) {
    for (let i = 0; i < no; i++) {
      this._vcRef.createEmbeddedView(this._tplRef);
    }
  }

  clear() {
    this._vcRef.clear();
  }
}

@Component({
  selector: 'benchmark-root',
  template: `

  <section>
    <button (click)="create(vm)">Create</button>
    <button (click)="destroy(vm)">Destroy</button>
    <button (click)="check()">Check</button>
  </section>

  <ng-template viewManipulationDirective #vm="vm">
    <div>text</div>
  </ng-template>

  `
})
export class ViewsBenchmark {
  items: number[]|undefined = undefined;

  constructor(private _cdRef: ChangeDetectorRef) {}

  create(vm: ViewManipulationDirective) {
    vm.create(1000);
  }

  destroy(vm: ViewManipulationDirective) {
    vm.clear();
  }

  check() {
    for (let i = 0; i < 10000; i++) {
      this._cdRef.detectChanges();
    }
  }
}

@NgModule({
  declarations: [ViewsBenchmark, ViewManipulationDirective],
  imports: [
    CommonModule,
    BrowserModule,
  ],
  bootstrap: [ViewsBenchmark]
})
export class ViewsBenchmarkModule {
}
