/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

describe('navigateForTest', () => {
  it('gives null for the activatedComponent when no routes are configured', async () => {
    TestBed.configureTestingModule({providers: [provideRouter([])]});
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeDebugElement).toBeNull();
  });
  it('navigates to routed component', async () => {
    @Component({standalone: true, template: 'hello {{name}}'})
    class TestCmp {
      name = 'world';
    }

    TestBed.configureTestingModule({providers: [provideRouter([{path: '', component: TestCmp}])]});
    const harness = await RouterTestingHarness.create();
    const activatedComponent = await harness.navigateByUrl('/', TestCmp);

    expect(activatedComponent).toBeInstanceOf(TestCmp);
    expect(harness.routeNativeElement?.innerHTML).toContain('hello world');
  });

  it('executes guards on the path', async () => {
    let guardCalled = false;
    TestBed.configureTestingModule({
      providers: [provideRouter([{
        path: '',
        canActivate: [() => {
          guardCalled = true;
          return true;
        }],
        children: []
      }])]
    });
    await RouterTestingHarness.create('/');
    expect(guardCalled).toBeTrue();
  });

  it('throws error if routing throws', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{
        path: '',
        canActivate: [() => {
          throw new Error('oh no');
        }],
        children: []
      }])]
    });
    await expectAsync(RouterTestingHarness.create('/')).toBeRejected();
  });

  it('can observe param changes on routed component with second navigation', async () => {
    @Component({standalone: true, template: '{{(route.params | async)?.id}}', imports: [AsyncPipe]})
    class TestCmp {
      constructor(readonly route: ActivatedRoute) {}
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: ':id', component: TestCmp}]),
      ]
    });
    const harness = await RouterTestingHarness.create();
    const activatedComponent = await harness.navigateByUrl('/123', TestCmp);
    expect(activatedComponent.route).toBeInstanceOf(ActivatedRoute);
    expect(harness.routeNativeElement?.innerHTML).toContain('123');
    await harness.navigateByUrl('/456');
    expect(harness.routeNativeElement?.innerHTML).toContain('456');
  });

  it('throws an error if the routed component instance does not match the one required',
     async () => {
       @Component({standalone: true, template: ''})
       class TestCmp {
       }
       @Component({standalone: true, template: ''})
       class OtherCmp {
       }

       TestBed.configureTestingModule({
         providers: [
           provideRouter([{path: '**', component: TestCmp}]),
         ]
       });
       const harness = await RouterTestingHarness.create();
       await expectAsync(harness.navigateByUrl('/123', OtherCmp)).toBeRejected();
     });

  it('waits for redirects using router.navigate', async () => {
    @Component({standalone: true, template: 'test'})
    class TestCmp {
    }
    @Component({standalone: true, template: 'redirect'})
    class OtherCmp {
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'test',
            canActivate: [() => inject(Router).navigateByUrl('/redirect')],
            component: TestCmp
          },
          {path: 'redirect', canActivate: [() => of(true).pipe(delay(100))], component: OtherCmp},
        ]),
      ]
    });
    await RouterTestingHarness.create('test');
    expect(TestBed.inject(Router).url).toEqual('/redirect');
  });
});
