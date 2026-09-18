/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Navigation} from './navigation.component';
import {provideRouter} from '@angular/router';
import {By} from '@angular/platform-browser';
import {Theme, ThemeManager} from '../../services/theme-manager.service';
import {Version, signal} from '@angular/core';
import {of} from 'rxjs';
import {VersionManager} from '../../services/version-manager.service';
import {NavigationState, Search, WINDOW} from '@angular/docs';
import {BlockScrollStrategy, ScrollStrategyOptions} from '@angular/cdk/overlay';
import {PAGE_PREFIX} from '../../constants/pages';

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
    currentDocsVersionMode: signal('stable'),
    versions: signal<Version[]>([]),
  };

  const fakeWindow = {};
  const fakeSearch = {};
  let scrollStrategy: jasmine.SpyObj<BlockScrollStrategy>;

  beforeEach(async () => {
    scrollStrategy = jasmine.createSpyObj<BlockScrollStrategy>('scrollStrategy', [
      'enable',
      'disable',
      'attach',
    ]);
    TestBed.configureTestingModule({
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

    spyOn(TestBed.inject(ScrollStrategyOptions), 'block').and.returnValue(scrollStrategy);

    fixture = TestBed.createComponent(Navigation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should block scrolling while mobile navigation is open', async () => {
    const navigationState = TestBed.inject(NavigationState);
    navigationState.setMobileNavigationListVisibility(true);
    await fixture.whenStable();

    expect(scrollStrategy.enable).toHaveBeenCalledTimes(1);
    scrollStrategy.disable.calls.reset();

    navigationState.setMobileNavigationListVisibility(false);
    await fixture.whenStable();

    expect(scrollStrategy.disable).toHaveBeenCalledTimes(1);
  });

  it('should unblock scrolling when destroyed with mobile navigation open', async () => {
    TestBed.inject(NavigationState).setMobileNavigationListVisibility(true);
    await fixture.whenStable();
    scrollStrategy.disable.calls.reset();

    fixture.destroy();

    expect(scrollStrategy.disable).toHaveBeenCalledTimes(1);
  });

  it('should append active class to DOCS_ROUTE when DOCS_ROUTE is active', async () => {
    component.activeRouteItem.set(PAGE_PREFIX.DOCS);

    await fixture.whenStable();

    const docsLink = fixture.debugElement.query(By.css('a[href="/docs"]')).parent?.nativeElement;

    expect(docsLink).toHaveClass('adev-nav-item--active');
  });

  it('should not have active class when activeRouteItem is null', async () => {
    component.activeRouteItem.set(null);

    await fixture.whenStable();

    const docsLink = fixture.debugElement.query(By.css('a[href="/docs"]')).nativeElement;
    const referenceLink = fixture.debugElement.query(By.css('a[href="/reference"]')).nativeElement;

    expect(docsLink).not.toHaveClass('adev-nav-item--active');
    expect(referenceLink).not.toHaveClass('adev-nav-item--active');
  });

  it('should call themeManager.setTheme(dark) when user tries to set dark theme', async () => {
    const openThemePickerButton = fixture.debugElement.query(
      By.css('button[aria-label^="Change theme. Current theme:"]'),
    ).nativeElement;
    const setThemeSpy = spyOn(fakeThemeManager, 'setTheme');

    openThemePickerButton.click();
    await fixture.whenStable();

    const setDarkModeButton = fixture.debugElement.query(
      By.css('button[aria-label="Set dark theme"]'),
    ).nativeElement;

    setDarkModeButton.click();

    expect(setThemeSpy).toHaveBeenCalledOnceWith('dark');
  });
});
