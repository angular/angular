/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {navigateForTest} from '@angular/router/testing';

describe('navigateForTest', () => {
  it('gives null for the activatedComponent when no routes are configured', async () => {
    TestBed.configureTestingModule({providers: [provideRouter([])]});
    const {activatedComponent} = await navigateForTest('/');
    expect(activatedComponent).toBeNull();
  });
  it('navigates to routed component', async () => {
    @Component({standalone: true, template: 'hello {{name}}'})
    class TestCmp {
      name = 'world';
    }

    TestBed.configureTestingModule({providers: [provideRouter([{path: '', component: TestCmp}])]});
    const {rootFixture, activatedComponent} = await navigateForTest('/', TestCmp);
    expect(activatedComponent).toBeInstanceOf(TestCmp);
    expect(rootFixture.nativeElement.innerHTML).toContain('hello world');
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
    await navigateForTest('/');
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
    await expectAsync(navigateForTest('/')).toBeRejected();
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
    const {rootFixture, activatedComponent} = await navigateForTest('/123', TestCmp);
    expect(activatedComponent.route).toBeInstanceOf(ActivatedRoute);
    expect(rootFixture.nativeElement.innerHTML).toContain('123');
    await navigateForTest('/456');
    expect(rootFixture.nativeElement.innerHTML).toContain('456');
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
       await expectAsync(navigateForTest('/123', OtherCmp)).toBeRejected();
     });
});
