/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ViewportScroller} from '@angular/common';
import {Component, inject, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';
import {
  Router,
  RouterLink,
  RouterModule,
  Scroll,
  provideRouter,
  withInMemoryScrolling,
} from '../index';
import {ROUTER_SCROLLER} from '../src/router_scroller';
import {RouterTestingHarness} from '../testing';
import {useAutoTick} from '@angular/private/testing';

describe('RouterLink', () => {
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
          [replaceUrl]="replaceUrl()"
        ></div>
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
            [replaceUrl]="replaceUrl()"
          ></a>
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

  // Avoid executing in node environment because customElements is not defined.
  if (typeof customElements === 'object') {
    describe('on a custom element anchor', () => {
      /** Simple anchor element imitation. */
      class CustomAnchor extends HTMLElement {
        static get observedAttributes(): string[] {
          return ['href'];
        }

        get href(): string {
          return this.getAttribute('href') ?? '';
        }
        set href(value: string) {
          this.setAttribute('href', value);
        }

        constructor() {
          super();
          const shadow = this.attachShadow({mode: 'open'});
          shadow.innerHTML = '<a><slot></slot></a>';
        }

        attributedChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
          if (name === 'href') {
            const anchor = this.shadowRoot!.querySelector('a')!;
            if (newValue === null) {
              anchor.removeAttribute('href');
            } else {
              anchor.setAttribute('href', newValue);
            }
          }
        }
      }

      if (!customElements.get('custom-anchor')) {
        customElements.define('custom-anchor', CustomAnchor);
      }

      @Component({
        template: ` <custom-anchor [routerLink]="link()"></custom-anchor> `,
        standalone: false,
      })
      class LinkComponent {
        link = signal<string | null | undefined>('/');
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
        link = fixture.debugElement.query(By.css('custom-anchor')).nativeElement;
      });

      it('does not touch tabindex', async () => {
        expect(link.outerHTML).not.toContain('tabindex');
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
    });
  }

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

  it('cannot use a UrlTree with queryParams', () => {
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

  it('correctly updates when relativeTo segments change', async () => {
    @Component({
      template: `<a [routerLink]="['./child']" queryParamsHandling="'replace'">link</a>`,
      imports: [RouterLink],
    })
    class WithLink {}
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: WithLink}])],
    });

    const harness = await RouterTestingHarness.create('/initial');
    const anchor = harness.fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('href')).toBe('/initial/child');
    await harness.navigateByUrl('/different');
    expect(anchor.getAttribute('href')).toBe('/different/child');
  });

  describe('scroll', () => {
    useAutoTick();

    @Component({
      template: `
        <a id="manual" routerLink="/a" scroll="manual">manual</a>
        <a id="default" routerLink="/b">default</a>
      `,
      imports: [RouterLink],
    })
    class LinksWithScroll {}

    function click(fixture: ComponentFixture<unknown>, id: string) {
      fixture.nativeElement.querySelector(`#${id}`).click();
    }

    it('passes the scroll option to the navigation', async () => {
      TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
      const router = TestBed.inject(Router);
      const fixture = TestBed.createComponent(LinksWithScroll);
      await fixture.whenStable();

      click(fixture, 'manual');
      await fixture.whenStable();

      expect(router.lastSuccessfulNavigation()?.extras.scroll).toBe('manual');
    });

    it('does not add the scroll option when the input is not set', async () => {
      TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
      const router = TestBed.inject(Router);
      const navigateSpy = spyOn(router, 'navigateByUrl').and.callThrough();
      const fixture = TestBed.createComponent(LinksWithScroll);
      await fixture.whenStable();

      click(fixture, 'default');
      await fixture.whenStable();

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect('scroll' in navigateSpy.calls.mostRecent().args[1]!).toBe(false);
    });

    it('skips scroll restoration for links with scroll="manual"', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: '**', children: []}],
            withInMemoryScrolling({scrollPositionRestoration: 'top'}),
          ),
        ],
      });
      const router = TestBed.inject(Router);
      const scrollToSpy = spyOn(TestBed.inject(ViewportScroller), 'scrollToPosition');
      TestBed.inject(ROUTER_SCROLLER).init();
      const fixture = TestBed.createComponent(LinksWithScroll);
      await fixture.whenStable();
      const nextScroll = () =>
        firstValueFrom(router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)));

      let scroll = nextScroll();
      click(fixture, 'manual');
      expect((await scroll).scrollBehavior).toBe('manual');
      expect(scrollToSpy).not.toHaveBeenCalled();

      scroll = nextScroll();
      click(fixture, 'default');
      await scroll;
      expect(scrollToSpy).toHaveBeenCalledWith([0, 0]);
    });
  });
});
