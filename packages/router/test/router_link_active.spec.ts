/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, signal} from '@angular/core';
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

  it('accepts null for routerLinkActive and applies no classes', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a [routerLinkActive]="null" routerLink="/abc"></a>',
    })
    class MyCmp {}

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/abc');
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelector('a').classList)).toEqual([]);
  });

  it('removes the active class when routerLinkActive changes to null', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a [routerLinkActive]="activeClass()" routerLink="/abc"></a>',
    })
    class MyCmp {
      activeClass = signal<string | null>('active');
    }

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/abc');
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector('a');
    expect(Array.from(link.classList)).toEqual(['active']);

    fixture.componentInstance.activeClass.set(null);
    await fixture.whenStable();
    expect(Array.from(link.classList)).toEqual([]);
  });

  it('replaces the active classes when routerLinkActive changes', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a [routerLinkActive]="activeClass()" routerLink="/abc"></a>',
    })
    class MyCmp {
      activeClass = signal('active');
    }

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/abc');
    await fixture.whenStable();

    fixture.componentInstance.activeClass.set('selected');
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelector('a').classList)).toEqual(['selected']);
  });

  it('accepts undefined for routerLinkActive and applies no classes', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a [routerLinkActive]="undefined" routerLink="/abc"></a>',
    })
    class MyCmp {}

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/abc');
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelector('a').classList)).toEqual([]);
  });

  it('accepts null for routerLinkActiveOptions and disables active matching', async () => {
    // null is an explicit opt-out: the link should never be marked active regardless
    // of the current URL, distinguishing it from undefined which means "use the default".
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template:
        '<a routerLinkActive="active" [routerLinkActiveOptions]="null" routerLink="/abc"></a>',
    })
    class MyCmp {}

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/abc');
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelector('a').classList)).not.toContain('active');
  });

  it('accepts undefined for routerLinkActiveOptions and uses default subset match', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template:
        '<a routerLinkActive="active" [routerLinkActiveOptions]="undefined" routerLink="/abc"></a>',
    })
    class MyCmp {}

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/abc');
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelector('a').classList)).toContain('active');
  });

  it('supports partial match options', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template:
        '<a routerLinkActive="active" [routerLinkActiveOptions]="{paths: \'exact\'}" routerLink="/abc"></a>',
    })
    class MyCmp {}

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/abc?q=1');
    // paths: exact matches /abc
    // queryParams: defaulted to subset (missing in /abc) -> match
    // matrixParams: defaulted to ignored -> match
    // fragment: defaulted to ignored -> match

    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelector('a').classList)).toContain('active');
  });
});
