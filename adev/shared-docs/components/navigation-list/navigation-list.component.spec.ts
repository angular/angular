/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {NavigationItem} from '../../interfaces';
import {NavigationState} from '../../services';
import {NavigationList} from './navigation-list.component';

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
      imports: [NavigationList],
      providers: [provideRouter([]), {provide: NavigationState, useClass: FakeNavigationListState}],
    });
    fixture = TestBed.createComponent(NavigationList);
    fixture.componentRef.setInput('navigationItems', []);
    fixture.componentRef.setInput('preserveOtherCategoryOrder', false);

    component = fixture.componentInstance;
  });

  it('should display provided navigation structure', async () => {
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
    await fixture.whenStable();

    const links = fixture.debugElement.queryAll(By.css('a'));
    const nonClickableItem = fixture.debugElement.queryAll(By.css('.docs-secondary-nav-header'));

    expect(links.length).toBe(3);
    expect(nonClickableItem.length).toBe(1);
  });

  it('should append `docs-navigation-list-dropdown` when isDropdownView is true', async () => {
    fixture.componentRef.setInput('isDropdownView', true);
    await fixture.whenStable();

    const ulElement = fixture.debugElement.query(By.css('ul.docs-navigation-list-dropdown'));

    expect(ulElement).toBeTruthy();
  });

  it('should not append `docs-navigation-list-dropdown` when isDropdownView is false', async () => {
    fixture.componentRef.setInput('isDropdownView', false);
    await fixture.whenStable();

    const ulElement = fixture.debugElement.query(By.css('ul.docs-navigation-list-dropdown'));

    expect(ulElement).toBeFalsy();
  });

  it('should emit linkClicked when user clicked on link', async () => {
    const emitClickOnLinkSpy = spyOn(component, 'emitClickOnLink');
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
    await fixture.whenStable();

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

    fixture.componentRef.setInput('expandableLevel', 1);
    component.toggle(itemToToggle);

    expect(toggleItemSpy).toHaveBeenCalledOnceWith(itemToToggle);
  });

  it(`should call navigationState.toggleItem() when item's level is collapsable`, () => {
    const navigationState = TestBed.inject(NavigationState);
    const toggleItemSpy = spyOn(navigationState, 'toggleItem');
    const itemToToggle = navigationItems[1].children![1];

    fixture.componentRef.setInput('collapsableLevel', 2);
    component.toggle(itemToToggle);

    expect(toggleItemSpy).toHaveBeenCalledOnceWith(itemToToggle);
  });

  it('should display only items to provided level (Level 1)', async () => {
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
    fixture.componentRef.setInput('displayItemsToLevel', 1);
    await fixture.whenStable();

    const items = fixture.debugElement.queryAll(By.css('li.docs-faceted-list-item'));

    expect(items.length).toBe(2);
    expect(items[0].nativeElement.innerText).toBe(navigationItems[0].label);
    expect(items[1].nativeElement.innerText).toBe(navigationItems[1].label);
  });

  it('should display all items (Level 2)', async () => {
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
    fixture.componentRef.setInput('displayItemsToLevel', 2);
    await fixture.whenStable();

    const items = fixture.debugElement.queryAll(By.css('li.docs-faceted-list-item'));

    expect(items.length).toBe(4);

    expect(items[0].nativeElement.innerText).toBe(navigationItems[0].label);
    expect(items[1].nativeElement.innerText.startsWith(navigationItems[1].label)).toBeTrue();

    const secondItemChildren = navigationItems[1].children || [];

    expect(items[2].nativeElement.innerText).toBe(secondItemChildren[0].label);
    expect(items[3].nativeElement.innerText).toBe(secondItemChildren[1].label);
  });
});

class FakeNavigationListState {
  isOpened = signal(true);
  activeNavigationItem = signal(navigationItems.at(1));
  toggleItem(item: NavigationItem) {}
}
