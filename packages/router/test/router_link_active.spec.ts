/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, RouterLink, RouterLinkActive, provideRouter} from '../index';

describe('RouterLinkActive', () => {
  it('removes initial active class even if never active', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a class="active" routerLinkActive="active" routerLink="/abc123"></a>',
    })
    class MyCmp {}

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelector('a').classList)).toEqual([]);
  });

  it('should not throw when routerLinkActive is null', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a routerLink="/test" [routerLinkActive]="null"></a>',
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: 'test', component: TestCmp}])],
    });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.autoDetectChanges();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/test');
    await fixture.whenStable();

    const anchor = fixture.nativeElement.querySelector('a');
    expect(anchor.className).toEqual('');
  });

  it('should not throw when routerLinkActive is undefined', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a routerLink="/test" [routerLinkActive]="undefined"></a>',
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: 'test', component: TestCmp}])],
    });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.autoDetectChanges();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/test');
    await fixture.whenStable();

    const anchor = fixture.nativeElement.querySelector('a');
    expect(anchor.className).toEqual('');
  });

  it('should use default options when routerLinkActiveOptions is null', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template:
        '<a routerLink="/test" routerLinkActive="active" [routerLinkActiveOptions]="null"></a>',
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: 'test', component: TestCmp}])],
    });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.autoDetectChanges();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/test');
    await fixture.whenStable();

    const anchor = fixture.nativeElement.querySelector('a');
    // Should apply active class since default {exact: false} allows subset matching
    expect(anchor.className).toEqual('active');
  });

  it('should use default options when routerLinkActiveOptions is undefined', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template:
        '<a routerLink="/test" routerLinkActive="active" [routerLinkActiveOptions]="undefined"></a>',
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: 'test', component: TestCmp}])],
    });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.autoDetectChanges();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/test');
    await fixture.whenStable();

    const anchor = fixture.nativeElement.querySelector('a');
    // Should apply active class since default {exact: false} allows subset matching
    expect(anchor.className).toEqual('active');
  });
});
