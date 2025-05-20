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
import {provideRouter} from '@angular/router';
import {provideZonelessChangeDetection, signal} from '@angular/core';
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
      imports: [NavigationList],
      providers: [
        provideRouter([]),
        {provide: NavigationState, useClass: FakeNavigationListState},
        provideZonelessChangeDetection(),
      ],
    });
    fixture = TestBed.createComponent(NavigationList);
    fixture.componentRef.setInput('navigationItems', []);

    component = fixture.componentInstance;
  });

  it('should display provided navigation structure', () => {
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a'));
    const nonClickableItem = fixture.debugElement.queryAll(By.css('.docs-secondary-nav-header'));

    expect(links.length).toBe(3);
    expect(nonClickableItem.length).toBe(1);
  });

  it('should append `docs-navigation-list-dropdown` when isDropdownView is true', () => {
    fixture.componentRef.setInput('isDropdownView', true);
    fixture.detectChanges();

    const ulElement = fixture.debugElement.query(By.css('ul.docs-navigation-list-dropdown'));

    expect(ulElement).toBeTruthy();
  });

  it('should not append `docs-navigation-list-dropdown` when isDropdownView is false', () => {
    fixture.componentRef.setInput('isDropdownView', false);
    fixture.detectChanges();

    const ulElement = fixture.debugElement.query(By.css('ul.docs-navigation-list-dropdown'));

    expect(ulElement).toBeFalsy();
  });

  it('should emit linkClicked when user clicked on link', () => {
    const emitClickOnLinkSpy = spyOn(component, 'emitClickOnLink');
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
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

  it('should display only items to provided level (Level 1)', () => {
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
    fixture.componentRef.setInput('displayItemsToLevel', 1);
    fixture.detectChanges(true);

    const items = fixture.debugElement.queryAll(By.css('li.docs-faceted-list-item'));

    expect(items.length).toBe(2);
    expect(items[0].nativeElement.innerText).toBe(navigationItems[0].label);
    expect(items[1].nativeElement.innerText).toBe(navigationItems[1].label);
  });

  it('should display all items (Level 2)', () => {
    fixture.componentRef.setInput('navigationItems', [...navigationItems]);
    fixture.componentRef.setInput('displayItemsToLevel', 2);
    fixture.detectChanges(true);

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
