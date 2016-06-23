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

import {CompWithProjection} from '../src/projection';
import {MainCompNgFactory} from '../src/projection.ngfactory';

// Need to lock the mode explicitely as this test is not using Angular's testing framework.
lockRunMode();

describe('content projection', () => {
  it('should support basic content projection', () => {
    const appInjector =
        ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, serverPlatform().injector);
    var mainComp = MainCompNgFactory.create(appInjector);

    var debugElement = <DebugElement>getDebugNode(mainComp.location.nativeElement);
    var compWithProjection = debugElement.query(By.directive(CompWithProjection));
    expect(compWithProjection.children.length).toBe(1);
    expect(compWithProjection.children[0].attributes['greeting']).toEqual('Hello world!');
  });
});
