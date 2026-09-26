/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  QueryParamsHandlingFn,
  Router,
  RouterLink,
  RouterModule,
  provideRouter,
  withRouterConfig,
} from '../index';
import {RouterTestingHarness} from '../testing';

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

  describe('with a queryParamsHandling function', () => {
    it('updates when the current query params change', async () => {
      @Component({
        template: `
          <a routerLink="/product" [queryParamsHandling]="(current) => ({q: current['q']})">
            link
          </a>
        `,
        imports: [RouterLink],
      })
      class WithLink {}
      TestBed.configureTestingModule({
        providers: [provideRouter([{path: '**', component: WithLink}])],
      });

      const harness = await RouterTestingHarness.create('/search?q=shoes&page=2');
      const anchor = harness.fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/product?q=shoes');
      await harness.navigateByUrl('/search?q=boots&page=3');
      expect(anchor.getAttribute('href')).toBe('/product?q=boots');
      await harness.navigateByUrl('/search?page=4');
      expect(anchor.getAttribute('href')).toBe('/product');
    });

    it('updates when the current query params change with a default function', async () => {
      @Component({
        template: `<a routerLink="/product">link</a>`,
        imports: [RouterLink],
      })
      class WithLink {}
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: '**', component: WithLink}],
            withRouterConfig({
              defaultQueryParamsHandling: (current) => ({lang: current['lang']}),
            }),
          ),
        ],
      });

      const harness = await RouterTestingHarness.create('/search?lang=fr&q=shoes');
      const anchor = harness.fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/product?lang=fr');
      await harness.navigateByUrl('/search?lang=de&q=shoes');
      expect(anchor.getAttribute('href')).toBe('/product?lang=de');
    });

    it('merges queryParams input on top of queryParamsHandling function result', async () => {
      @Component({
        template: `
          <a
            routerLink="/product"
            [queryParams]="{tab: 'reviews'}"
            [queryParamsHandling]="(current) => ({q: current['q']})"
          >
            link
          </a>
        `,
        imports: [RouterLink],
      })
      class WithLink {}
      TestBed.configureTestingModule({
        providers: [provideRouter([{path: '**', component: WithLink}])],
      });

      const harness = await RouterTestingHarness.create('/search?q=shoes&page=2');
      const anchor = harness.fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/product?q=shoes&tab=reviews');
    });

    it('updates when a signal read by the function changes', async () => {
      @Component({
        template: `<a routerLink="/search" [queryParamsHandling]="keepQuery">link</a>`,
        imports: [RouterLink],
      })
      class WithLink {
        page = signal(1);
        keepQuery: QueryParamsHandlingFn = (current) => ({q: current['q'], page: this.page()});
      }
      TestBed.configureTestingModule({
        providers: [provideRouter([{path: '**', component: WithLink}])],
      });

      const harness = await RouterTestingHarness.create();
      const component = await harness.navigateByUrl('/search?q=shoes', WithLink);
      const anchor = harness.fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/search?q=shoes&page=1');
      component.page.set(2);
      await harness.fixture.whenStable();
      expect(anchor.getAttribute('href')).toBe('/search?q=shoes&page=2');
    });
  });
});
