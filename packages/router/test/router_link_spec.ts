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
  PRIMARY_OUTLET,
  Router,
  RouterLink,
  RouterModule,
  UrlSegment,
  provideRouter,
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

  it('does not generate protocol-relative hrefs from leading empty primary segments', async () => {
    @Component({
      template: `
        <a id="commands" [routerLink]="commands" queryParamsHandling="preserve">commands</a>
        <a
          id="outlet-string"
          [routerLink]="outletString"
          [queryParams]="pageQueryParams"
          queryParamsHandling="merge"
        >
          outlet string
        </a>
        <a
          id="outlet-array"
          [routerLink]="outletArray"
          queryParamsHandling="preserve"
          preserveFragment
        >
          outlet array
        </a>
        <a id="url-tree" [routerLink]="urlTree">UrlTree</a>
      `,
      imports: [RouterLink],
    })
    class WithLink {
      readonly commands = ['/', '', 'attacker.example', 'collect'];
      readonly outletString = [{outlets: {primary: '/attacker.example/collect'}}];
      readonly outletArray = [{outlets: {primary: ['', 'attacker.example', 'collect']}}];
      readonly pageQueryParams = {page: 1};
      readonly urlTree = inject(Router).parseUrl(
        '/attacker.example/collect?token=RESET_TOKEN#OAUTH_TOKEN',
      );

      constructor() {
        // UrlTree segments are public, so this mutation exercises the serializer backstop.
        this.urlTree.root.children[PRIMARY_OUTLET].segments.unshift(new UrlSegment('', {}));
      }
    }

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '', component: WithLink}])],
    });
    const harness = await RouterTestingHarness.create('/?token=RESET_TOKEN#OAUTH_TOKEN');

    expect(harness.fixture.nativeElement.querySelector('#commands').getAttribute('href')).toBe(
      '/attacker.example/collect?token=RESET_TOKEN',
    );
    expect(harness.fixture.nativeElement.querySelector('#outlet-string').getAttribute('href')).toBe(
      '/attacker.example/collect?token=RESET_TOKEN&page=1',
    );
    expect(harness.fixture.nativeElement.querySelector('#outlet-array').getAttribute('href')).toBe(
      '/attacker.example/collect?token=RESET_TOKEN#OAUTH_TOKEN',
    );
    expect(harness.fixture.nativeElement.querySelector('#url-tree').getAttribute('href')).toBe(
      '/attacker.example/collect?token=RESET_TOKEN#OAUTH_TOKEN',
    );
  });

  it('navigates to the route represented by the href', async () => {
    const tenantAdminGuard = jasmine.createSpy().and.returnValue(true);
    const strictAdminGuard = jasmine.createSpy().and.returnValue(true);

    @Component({template: ''})
    class RoutedComponent {}

    @Component({
      template: `
        <a [routerLink]="['/', '', 'admin']" [queryParams]="{token: 'secret'}" fragment="fragment">
          admin
        </a>
      `,
      imports: [RouterLink],
    })
    class WithLink {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: ':tenant/admin',
            canActivate: [tenantAdminGuard],
            component: RoutedComponent,
          },
          {path: 'admin', canActivate: [strictAdminGuard], component: RoutedComponent},
        ]),
      ],
    });
    const fixture = TestBed.createComponent(WithLink);
    await fixture.whenStable();

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('href')).toBe('/admin?token=secret#fragment');
    anchor.click();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/admin?token=secret#fragment');
    expect(router.routerState.snapshot.root.firstChild?.routeConfig?.path).toBe('admin');
    expect(strictAdminGuard).toHaveBeenCalled();
    expect(tenantAdminGuard).not.toHaveBeenCalled();
  });
});
