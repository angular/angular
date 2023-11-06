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
import {signal} from '@angular/core';
import {NavigationState} from '@angular/docs-shared';

const navigationItems: NavigationItem[] = [
  {
    label: 'Introduction',
    path: 'guide',
  },
  {
    label: 'Getting Started',
    children: [
      {label: 'What is Angular?', path: 'guide/what-is-angular'},
      {label: 'Setup', path: 'guide/setup'},
    ],
  },
];

describe('NavigationList', () => {
  let component: NavigationList;
  let fixture: ComponentFixture<NavigationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationList, RouterTestingModule],
      providers: [{provide: NavigationState, useClass: FakeNavigationListState}],
    }).compileComponents();
    fixture = TestBed.createComponent(NavigationList);
    component = fixture.componentInstance;
  });

  it('should display provided navigation structure', () => {
    component.navigationItems = [...navigationItems];
    fixture.detectChanges(true);

    const links = fixture.debugElement.queryAll(By.css('a'));

    expect(links.length).toBe(3);
  });
});

class FakeNavigationListState {
  isOpened = signal(true);
  activeNavigationItem = signal(navigationItems.at(1));
}
