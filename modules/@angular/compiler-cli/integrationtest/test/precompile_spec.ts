/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DebugElement, ReflectiveInjector, getDebugNode, lockRunMode} from '@angular/core';
import {BROWSER_APP_PROVIDERS, By} from '@angular/platform-browser';
import {serverPlatform} from '@angular/platform-server';

import {SomeComp} from '../src/precompile';
import {CompWithPrecompileNgFactory} from '../src/precompile.ngfactory';

// Need to lock the mode explicitely as this test is not using Angular's testing framework.
lockRunMode();

describe('content projection', () => {
  it('should support basic content projection', () => {
    const appInjector =
        ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, serverPlatform().injector);
    var compWithPrecompile = CompWithPrecompileNgFactory.create(appInjector).instance;
    var cf = compWithPrecompile.cfr.resolveComponentFactory(SomeComp);
    expect(cf.componentType).toBe(SomeComp);
  });
});
