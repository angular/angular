/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TestBed} from '@angular/core/testing';
import {Navigation} from './navigation.component';
import {provideRouter} from '@angular/router';
import {By} from '@angular/platform-browser';
import {ThemeManager} from '../../services/theme-manager.service';
import {signal} from '@angular/core';
import {of} from 'rxjs';
import {VersionManager} from '../../services/version-manager.service';
import {Search, WINDOW} from '@angular/docs';
import {PAGE_PREFIX} from '../../constants/pages';
describe('Navigation', () => {
  let component;
  let fixture;
  const fakeThemeManager = {
    theme: signal('dark'),
    setTheme: (theme) => {},
    themeChanged$: of(),
  };
  const fakeVersionManager = {
    currentDocsVersion: signal('v17'),
    versions: signal([]),
  };
  const fakeWindow = {};
  const fakeSearch = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navigation],
      providers: [
        provideRouter([]),
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        {
          provide: Search,
          useValue: fakeSearch,
        },
      ],
    });
    TestBed.overrideProvider(ThemeManager, {useValue: fakeThemeManager});
    TestBed.overrideProvider(VersionManager, {useValue: fakeVersionManager});
    fixture = TestBed.createComponent(Navigation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should append active class to DOCS_ROUTE when DOCS_ROUTE is active', () => {
    component.activeRouteItem.set(PAGE_PREFIX.DOCS);
    fixture.detectChanges();
    const docsLink = fixture.debugElement.query(By.css('a[href="/docs"]')).parent?.nativeElement;
    expect(docsLink).toHaveClass('adev-nav-item--active');
  });
  it('should not have active class when activeRouteItem is null', () => {
    component.activeRouteItem.set(null);
    fixture.detectChanges();
    const docsLink = fixture.debugElement.query(By.css('a[href="/docs"]')).nativeElement;
    const referenceLink = fixture.debugElement.query(By.css('a[href="/reference"]')).nativeElement;
    expect(docsLink).not.toHaveClass('adev-nav-item--active');
    expect(referenceLink).not.toHaveClass('adev-nav-item--active');
  });
  it('should call themeManager.setTheme(dark) when user tries to set dark theme', () => {
    const openThemePickerButton = fixture.debugElement.query(
      By.css('button[aria-label^="Open theme picker"]'),
    ).nativeElement;
    const setThemeSpy = spyOn(fakeThemeManager, 'setTheme');
    openThemePickerButton.click();
    fixture.detectChanges();
    const setDarkModeButton = fixture.debugElement.query(
      By.css('button[aria-label="Set dark theme"]'),
    ).nativeElement;
    setDarkModeButton.click();
    expect(setThemeSpy).toHaveBeenCalledOnceWith('dark');
  });
});
//# sourceMappingURL=navigation.component.spec.js.map
