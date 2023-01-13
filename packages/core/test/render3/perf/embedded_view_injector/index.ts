/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injector, ɵɵelement} from '@angular/core';

import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {createBenchmark} from '../micro_bench';
import {setupTestHarness} from '../setup';

import {createAppComponent} from './app_component';


function template(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'app');
  }
}

// App where no injector is provided when creating the embedded views.
const noInjectorApp = createAppComponent(undefined);

// App where an empty injector is provided when creating the embedded views. We provide an
// empty injector so that the entire view hierarchy has to be traversed during DI.
const withInjectorApp = createAppComponent(Injector.create({providers: []}));

const noInjectorHarness = setupTestHarness(template, 1, 0, 1, {}, null, [noInjectorApp.ɵcmp]);
const withInjectorHarness = setupTestHarness(template, 1, 0, 1, {}, null, [withInjectorApp.ɵcmp]);

const benchmark = createBenchmark('embedded_view_injector');
const noEmbeddedInjectorTime = benchmark('no injector');
const withEmbeddedInjectorTime = benchmark('with embedded view injector');

while (noEmbeddedInjectorTime()) {
  noInjectorHarness.createEmbeddedLView();
  noInjectorHarness.detectChanges();
}

while (withEmbeddedInjectorTime()) {
  withInjectorHarness.createEmbeddedLView();
  withInjectorHarness.detectChanges();
}

benchmark.report();
