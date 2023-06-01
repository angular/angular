/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Router, RouterLink, RouterModule} from '@angular/router';

describe('RouterLink', () => {
  it('does not modify tabindex if already set on non-anchor element', () => {
    @Component({template: `<div [routerLink]="link" tabindex="1"></div>`})
    class LinkComponent {
      link: string|null|undefined = '/';
    }
    TestBed.configureTestingModule(
        {imports: [RouterModule.forRoot([])], declarations: [LinkComponent]});
    const fixture = TestBed.createComponent(LinkComponent);
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(link.tabIndex).toEqual(1);

    fixture.nativeElement.link = null;
    fixture.detectChanges();
    expect(link.tabIndex).toEqual(1);
  });

  describe('on a non-anchor', () => {
    @Component({template: `<div [routerLink]="link"></div>`})
    class LinkComponent {
      link: string|null|undefined = '/';
    }
    let fixture: ComponentFixture<LinkComponent>;
    let link: HTMLDivElement;
    let router: Router;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([])],
        declarations: [LinkComponent],
      });
      fixture = TestBed.createComponent(LinkComponent);
      fixture.detectChanges();
      link = fixture.debugElement.query(By.css('div')).nativeElement;
      router = TestBed.inject(Router);

      spyOn(router, 'navigateByUrl');
      link.click();
      expect(router.navigateByUrl).toHaveBeenCalled();
      (router.navigateByUrl as jasmine.Spy).calls.reset();
    });

    it('null, removes tabIndex and does not navigate', () => {
      fixture.componentInstance.link = null;
      fixture.detectChanges();
      expect(link.tabIndex).toEqual(-1);

      link.click();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('undefined, removes tabIndex and does not navigate', () => {
      fixture.componentInstance.link = undefined;
      fixture.detectChanges();
      expect(link.tabIndex).toEqual(-1);

      link.click();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should coerce boolean input values', () => {
      const dir = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);

      for (const truthy of [true, '', 'true', 'anything']) {
        dir.preserveFragment = truthy;
        dir.skipLocationChange = truthy;
        dir.replaceUrl = truthy;
        expect(dir.preserveFragment).toBeTrue();
        expect(dir.skipLocationChange).toBeTrue();
        expect(dir.replaceUrl).toBeTrue();
      }

      for (const falsy of [false, null, undefined, 'false']) {
        dir.preserveFragment = falsy;
        dir.skipLocationChange = falsy;
        dir.replaceUrl = falsy;
        expect(dir.preserveFragment).toBeFalse();
        expect(dir.skipLocationChange).toBeFalse();
        expect(dir.replaceUrl).toBeFalse();
      }
    });
  });

  describe('on an anchor', () => {
    describe('RouterLink for elements with `href` attributes', () => {
      @Component({template: `<a [routerLink]="link"></a>`})
      class LinkComponent {
        link: string|null|undefined = '/';
      }
      let fixture: ComponentFixture<LinkComponent>;
      let link: HTMLAnchorElement;

      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [RouterModule.forRoot([])],
          declarations: [LinkComponent],
        });
        fixture = TestBed.createComponent(LinkComponent);
        fixture.detectChanges();
        link = fixture.debugElement.query(By.css('a')).nativeElement;
      });

      it('null, removes href', () => {
        expect(link.outerHTML).toContain('href');
        fixture.componentInstance.link = null;
        fixture.detectChanges();
        expect(link.outerHTML).not.toContain('href');
      });

      it('undefined, removes href', () => {
        expect(link.outerHTML).toContain('href');
        fixture.componentInstance.link = undefined;
        fixture.detectChanges();
        expect(link.outerHTML).not.toContain('href');
      });

      it('should coerce boolean input values', () => {
        const dir = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);

        for (const truthy of [true, '', 'true', 'anything']) {
          dir.preserveFragment = truthy;
          dir.skipLocationChange = truthy;
          dir.replaceUrl = truthy;
          expect(dir.preserveFragment).toBeTrue();
          expect(dir.skipLocationChange).toBeTrue();
          expect(dir.replaceUrl).toBeTrue();
        }

        for (const falsy of [false, null, undefined, 'false']) {
          dir.preserveFragment = falsy;
          dir.skipLocationChange = falsy;
          dir.replaceUrl = falsy;
          expect(dir.preserveFragment).toBeFalse();
          expect(dir.skipLocationChange).toBeFalse();
          expect(dir.replaceUrl).toBeFalse();
        }
      });
    });

    it('should handle routerLink in svg templates', () => {
      @Component({template: `<svg><a routerLink="test"></a></svg>`})
      class LinkComponent {
      }

      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([])],
        declarations: [LinkComponent],
      });
      const fixture = TestBed.createComponent(LinkComponent);
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('a')).nativeElement;

      expect(link.outerHTML).toContain('href');
    });
  });
});
