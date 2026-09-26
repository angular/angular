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

  describe('single-item array query params', () => {
    // `{tag: ['x']}` and `{tag: 'x'}` both serialize to `/abc?tag=x`, so both links must have the
    // same active state no matter how the router got to that URL.
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: `
        <a
          id="array-link"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{exact: true}"
          routerLink="/abc"
          [queryParams]="{tag: ['x']}"
        ></a>
        <a
          id="string-link"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{exact: true}"
          routerLink="/abc"
          [queryParams]="{tag: 'x'}"
        ></a>
      `,
    })
    class MyCmp {}

    function isLinkActive(fixture: {nativeElement: HTMLElement}, id: string): boolean {
      return fixture.nativeElement.querySelector(`#${id}`)!.classList.contains('active');
    }

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    });

    it('marks both links active after navigating by string', async () => {
      const fixture = TestBed.createComponent(MyCmp);
      fixture.autoDetectChanges();
      // Navigating by string is what happens on a page reload or a popstate navigation: the query
      // param is parsed as `'x'`.
      await TestBed.inject(Router).navigateByUrl('/abc?tag=x');
      await fixture.whenStable();
      expect(isLinkActive(fixture, 'array-link')).toBe(true);
      expect(isLinkActive(fixture, 'string-link')).toBe(true);
    });

    it('marks both links active after navigating with a single-item array', async () => {
      const fixture = TestBed.createComponent(MyCmp);
      fixture.autoDetectChanges();
      const router = TestBed.inject(Router);
      // This is what happens when clicking the array link: the resulting URL keeps `['x']`.
      await router.navigateByUrl(router.createUrlTree(['/abc'], {queryParams: {tag: ['x']}}));
      await fixture.whenStable();
      expect(isLinkActive(fixture, 'array-link')).toBe(true);
      expect(isLinkActive(fixture, 'string-link')).toBe(true);
    });
  });
});
