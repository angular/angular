/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Navigation} from './navigation.component';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';
import {PagePrefix} from '../../enums/pages';
import {Theme, ThemeManager} from '../../services/theme-manager.service';
import {Version, signal} from '@angular/core';
import {of} from 'rxjs';
import {VersionManager} from '../../services/version-manager.service';
import {Search, WINDOW} from '@angular/docs';

describe('Navigation', () => {
  let component: Navigation;
  let fixture: ComponentFixture<Navigation>;

  const fakeThemeManager = {
    theme: signal<Theme>('dark'),
    setTheme: (theme: Theme) => {},
    themeChanged$: of(),
  };

  const fakeVersionManager = {
    currentDocsVersion: signal('v17'),
    versions: signal<Version[]>([]),
  };

  const fakeWindow = {};
  const fakeSearch = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navigation, RouterTestingModule],
      providers: [
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
    component.activeRouteItem.set(PagePrefix.DOCS);

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
