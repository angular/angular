/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NavigationList} from './navigation-list.component';
import {By} from '@angular/platform-browser';
import {NavigationItem} from '../../interfaces';
import {RouterTestingModule} from '@angular/router/testing';
import {provideExperimentalZonelessChangeDetection, signal} from '@angular/core';
import {NavigationState} from '../../services';

const navigationItems: NavigationItem[] = [
  {
    label: 'Introduction',
    path: 'guide',
    level: 1,
  },
  {
    label: 'Getting Started',
    level: 1,
    children: [
      {label: 'What is Angular?', path: 'guide/what-is-angular', level: 2},
      {label: 'Setup', path: 'guide/setup', level: 2},
    ],
  },
];

describe('NavigationList', () => {
  let component: NavigationList;
  let fixture: ComponentFixture<NavigationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationList, RouterTestingModule],
      providers: [
        {provide: NavigationState, useClass: FakeNavigationListState},
        provideExperimentalZonelessChangeDetection(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NavigationList);
    component = fixture.componentInstance;
  });

  it('should display provided navigation structure', () => {
    component.navigationItems = [...navigationItems];
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a'));
    const nonClickableItem = fixture.debugElement.queryAll(By.css('.docs-secondary-nav-header'));

    expect(links.length).toBe(3);
    expect(nonClickableItem.length).toBe(1);
  });

  it('should append `docs-navigation-list-dropdown` when isDropdownView is true', () => {
    component.isDropdownView = true;
    fixture.detectChanges();

    const ulElement = fixture.debugElement.query(By.css('ul.docs-navigation-list-dropdown'));

    expect(ulElement).toBeTruthy();
  });

  it('should not append `docs-navigation-list-dropdown` when isDropdownView is false', () => {
    component.isDropdownView = false;
    fixture.detectChanges();

    const ulElement = fixture.debugElement.query(By.css('ul.docs-navigation-list-dropdown'));

    expect(ulElement).toBeFalsy();
  });

  it('should emit linkClicked when user clicked on link', () => {
    const emitClickOnLinkSpy = spyOn(component, 'emitClickOnLink');
    component.navigationItems = [...navigationItems];
    fixture.detectChanges(true);

    const guideLink = fixture.debugElement.query(By.css('a[href="/guide"]'));
    guideLink.nativeElement.click();

    expect(emitClickOnLinkSpy).toHaveBeenCalledTimes(1);
  });

  it(`should not call navigationState.toggleItem() when item's level is equal to 1 and is not neither expandable or collapsable level`, () => {
    const navigationState = TestBed.inject(NavigationState);
    const toggleItemSpy = spyOn(navigationState, 'toggleItem');
    const itemToToggle = navigationItems[1];

    component.toggle(itemToToggle);

    expect(toggleItemSpy).not.toHaveBeenCalled();
  });

  it(`should call navigationState.toggleItem() when item's level is expandable`, () => {
    const navigationState = TestBed.inject(NavigationState);
    const toggleItemSpy = spyOn(navigationState, 'toggleItem');
    const itemToToggle = navigationItems[1];

    component.expandableLevel = 1;
    component.toggle(itemToToggle);

    expect(toggleItemSpy).toHaveBeenCalledOnceWith(itemToToggle);
  });

  it(`should call navigationState.toggleItem() when item's level is collapsable`, () => {
    const navigationState = TestBed.inject(NavigationState);
    const toggleItemSpy = spyOn(navigationState, 'toggleItem');
    const itemToToggle = navigationItems[1].children![1];

    component.collapsableLevel = 2;
    component.toggle(itemToToggle);

    expect(toggleItemSpy).toHaveBeenCalledOnceWith(itemToToggle);
  });

  it('should display items to provided level', () => {
    component.navigationItems = [...navigationItems];
    component.displayItemsToLevel = 1;
    fixture.detectChanges(true);

    const visibleItems = fixture.debugElement.queryAll(
      By.css('li.docs-faceted-list-item:not(.docs-navigation-link-hidden)'),
    );
    const hiddenItems = fixture.debugElement.queryAll(
      By.css('li.docs-faceted-list-item.docs-navigation-link-hidden'),
    );

    expect(visibleItems.length).toBe(2);
    expect(visibleItems[0].nativeElement.innerText).toBe(navigationItems[0].label);
    expect(visibleItems[1].nativeElement.innerText).toBe(navigationItems[1].label);
    expect(hiddenItems.length).toBe(2);
    expect(hiddenItems[0].nativeElement.innerText).toBe(navigationItems[1].children![0].label);
    expect(hiddenItems[1].nativeElement.innerText).toBe(navigationItems[1].children![1].label);
  });
});

class FakeNavigationListState {
  isOpened = signal(true);
  activeNavigationItem = signal(navigationItems.at(1));
  toggleItem(item: NavigationItem) {}
}
