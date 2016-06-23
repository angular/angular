/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DebugElement, QueryList, ReflectiveInjector, getDebugNode, lockRunMode} from '@angular/core';
import {BROWSER_APP_PROVIDERS, By} from '@angular/platform-browser';
import {serverPlatform} from '@angular/platform-server';

import {CompForChildQuery, CompWithChildQuery} from '../src/queries';
import {CompWithChildQueryNgFactory} from '../src/queries.ngfactory';

describe('child queries', () => {
  it('should support compiling child queries', () => {
    const appInjector =
        ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, serverPlatform().injector);
    var childQueryComp = CompWithChildQueryNgFactory.create(appInjector);

    var debugElement = <DebugElement>getDebugNode(childQueryComp.location.nativeElement);
    var compWithChildren = debugElement.query(By.directive(CompWithChildQuery));
    expect(childQueryComp.instance.child).toBeDefined();
    expect(childQueryComp.instance.child instanceof CompForChildQuery).toBe(true);

  });

  it('should support compiling children queries', () => {
    const appInjector =
        ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, serverPlatform().injector);
    var childQueryComp = CompWithChildQueryNgFactory.create(appInjector);

    var debugElement = <DebugElement>getDebugNode(childQueryComp.location.nativeElement);
    var compWithChildren = debugElement.query(By.directive(CompWithChildQuery));

    childQueryComp.changeDetectorRef.detectChanges();

    expect(childQueryComp.instance.children).toBeDefined();
    expect(childQueryComp.instance.children instanceof QueryList).toBe(true);
  });
});
