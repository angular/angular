/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, signal, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Router, RouterLink, RouterModule, provideRouter} from '@angular/router';

describe('RouterLink', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideExperimentalZonelessChangeDetection()]});
  });

  it('does not modify tabindex if already set on non-anchor element', async () => {
    @Component({
      template: `<div [routerLink]="link" tabindex="1"></div>`,
      standalone: false,
    })
    class LinkComponent {
      link: string | null | undefined = '/';
    }
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [LinkComponent],
    });
    const fixture = TestBed.createComponent(LinkComponent);
    await fixture.whenStable();
    const link = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(link.tabIndex).toEqual(1);

    fixture.nativeElement.link = null;
    await fixture.whenStable();
    expect(link.tabIndex).toEqual(1);
  });

  describe('on a non-anchor', () => {
    @Component({
      template: `
        <div
          [routerLink]="link()"
          [preserveFragment]="preserveFragment()"
          [skipLocationChange]="skipLocationChange()"
          [replaceUrl]="replaceUrl()"></div>
      `,
      standalone: false,
    })
    class LinkComponent {
      link = signal<string | null | undefined>('/');
      preserveFragment = signal<unknown>(undefined);
      skipLocationChange = signal<unknown>(undefined);
      replaceUrl = signal<unknown>(undefined);
    }
    let fixture: ComponentFixture<LinkComponent>;
    let link: HTMLDivElement;
    let router: Router;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([])],
        declarations: [LinkComponent],
      });
      fixture = TestBed.createComponent(LinkComponent);
      await fixture.whenStable();
      link = fixture.debugElement.query(By.css('div')).nativeElement;
      router = TestBed.inject(Router);

      spyOn(router, 'navigateByUrl');
      link.click();
      expect(router.navigateByUrl).toHaveBeenCalled();
      (router.navigateByUrl as jasmine.Spy).calls.reset();
    });

    it('null, removes tabIndex and does not navigate', async () => {
      fixture.componentInstance.link.set(null);
      await fixture.whenStable();
      expect(link.tabIndex).toEqual(-1);

      link.click();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('undefined, removes tabIndex and does not navigate', async () => {
      fixture.componentInstance.link.set(undefined);
      await fixture.whenStable();
      expect(link.tabIndex).toEqual(-1);

      link.click();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should coerce boolean input values', async () => {
      const dir = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);

      for (const truthy of [true, '', 'true', 'anything']) {
        fixture.componentInstance.preserveFragment.set(truthy);
        fixture.componentInstance.skipLocationChange.set(truthy);
        fixture.componentInstance.replaceUrl.set(truthy);
        await fixture.whenStable();
        expect(dir.preserveFragment).toBeTrue();
        expect(dir.skipLocationChange).toBeTrue();
        expect(dir.replaceUrl).toBeTrue();
      }

      for (const falsy of [false, null, undefined, 'false']) {
        fixture.componentInstance.preserveFragment.set(falsy);
        fixture.componentInstance.skipLocationChange.set(falsy);
        fixture.componentInstance.replaceUrl.set(falsy);
        await fixture.whenStable();
        expect(dir.preserveFragment).toBeFalse();
        expect(dir.skipLocationChange).toBeFalse();
        expect(dir.replaceUrl).toBeFalse();
      }
    });
  });

  describe('on an anchor', () => {
    describe('RouterLink for elements with `href` attributes', () => {
      @Component({
        template: `
          <a
            [routerLink]="link()"
            [preserveFragment]="preserveFragment()"
            [skipLocationChange]="skipLocationChange()"
            [replaceUrl]="replaceUrl()"></a>
        `,
        standalone: false,
      })
      class LinkComponent {
        link = signal<string | null | undefined>('/');
        preserveFragment = signal<unknown>(undefined);
        skipLocationChange = signal<unknown>(undefined);
        replaceUrl = signal<unknown>(undefined);
      }
      let fixture: ComponentFixture<LinkComponent>;
      let link: HTMLAnchorElement;

      beforeEach(async () => {
        TestBed.configureTestingModule({
          imports: [RouterModule.forRoot([])],
          declarations: [LinkComponent],
        });
        fixture = TestBed.createComponent(LinkComponent);
        await fixture.whenStable();
        link = fixture.debugElement.query(By.css('a')).nativeElement;
      });

      it('null, removes href', async () => {
        expect(link.outerHTML).toContain('href');
        fixture.componentInstance.link.set(null);
        await fixture.whenStable();
        expect(link.outerHTML).not.toContain('href');
      });

      it('undefined, removes href', async () => {
        expect(link.outerHTML).toContain('href');
        fixture.componentInstance.link.set(undefined);
        await fixture.whenStable();
        expect(link.outerHTML).not.toContain('href');
      });

      it('should coerce boolean input values', async () => {
        const dir = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);

        for (const truthy of [true, '', 'true', 'anything']) {
          fixture.componentInstance.preserveFragment.set(truthy);
          fixture.componentInstance.skipLocationChange.set(truthy);
          fixture.componentInstance.replaceUrl.set(truthy);
          await fixture.whenStable();
          expect(dir.preserveFragment).toBeTrue();
          expect(dir.skipLocationChange).toBeTrue();
          expect(dir.replaceUrl).toBeTrue();
        }

        for (const falsy of [false, null, undefined, 'false']) {
          fixture.componentInstance.preserveFragment.set(falsy);
          fixture.componentInstance.skipLocationChange.set(falsy);
          fixture.componentInstance.replaceUrl.set(falsy);
          await fixture.whenStable();
          expect(dir.preserveFragment).toBeFalse();
          expect(dir.skipLocationChange).toBeFalse();
          expect(dir.replaceUrl).toBeFalse();
        }
      });
    });

    it('should handle routerLink in svg templates', async () => {
      @Component({
        template: `<svg><a routerLink="test"></a></svg>`,
        standalone: false,
      })
      class LinkComponent {}

      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([])],
        declarations: [LinkComponent],
      });
      const fixture = TestBed.createComponent(LinkComponent);
      await fixture.whenStable();
      const link = fixture.debugElement.query(By.css('a')).nativeElement;

      expect(link.outerHTML).toContain('href');
    });
  });

  it('can use a UrlTree as the input', async () => {
    @Component({
      template: '<a [routerLink]="urlTree">link</a>',
      imports: [RouterLink],
    })
    class WithUrlTree {
      urlTree = inject(Router).createUrlTree(['/a/b/c']);
    }
    TestBed.configureTestingModule({providers: [provideRouter([])]});

    const fixture = TestBed.createComponent(WithUrlTree);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('href="/a/b/c"');
  });

  it('cannnot use a UrlTree with queryParams', () => {
    @Component({
      template: '<a [routerLink]="urlTree" [queryParams]="{}">link</a>',
      imports: [RouterLink],
    })
    class WithUrlTree {
      urlTree = inject(Router).createUrlTree(['/a/b/c']);
    }
    TestBed.configureTestingModule({providers: [provideRouter([])]});

    const fixture = TestBed.createComponent(WithUrlTree);
    expect(() => fixture.changeDetectorRef.detectChanges()).toThrow();
  });
});
