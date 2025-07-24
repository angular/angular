/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Breadcrumb} from './breadcrumb.component';
import {NavigationState} from '../../services';
import {NavigationItem} from '../../interfaces';
import {By} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideZonelessChangeDetection} from '@angular/core';

describe('Breadcrumb', () => {
  let fixture: ComponentFixture<Breadcrumb>;
  let navigationStateSpy: jasmine.SpyObj<NavigationState>;

  beforeEach(() => {
    navigationStateSpy = jasmine.createSpyObj('NavigationState', ['activeNavigationItem']);

    TestBed.configureTestingModule({
      imports: [Breadcrumb],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: NavigationState,
          useValue: navigationStateSpy,
        },
      ],
    });
    fixture = TestBed.createComponent(Breadcrumb);
  });

  it('should display proper breadcrumb structure based on navigation state', () => {
    navigationStateSpy.activeNavigationItem.and.returnValue(item);

    fixture.detectChanges();
    const breadcrumbs = fixture.debugElement.queryAll(By.css('.docs-breadcrumb span'));

    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0].nativeElement.innerText).toEqual('Grandparent');
    expect(breadcrumbs[1].nativeElement.innerText).toEqual('Parent');
  });

  it('should display breadcrumb links when navigation item has got path', () => {
    navigationStateSpy.activeNavigationItem.and.returnValue(exampleItemWithPath);

    fixture.detectChanges();
    const breadcrumbs = fixture.debugElement.queryAll(By.css('.docs-breadcrumb a'));

    expect(breadcrumbs.length).toBe(1);
    expect(breadcrumbs[0].nativeElement.innerText).toEqual('Parent');
    expect(breadcrumbs[0].nativeElement.href).toEqual(`${window.origin}/example`);
  });
});

const grandparent: NavigationItem = {
  label: 'Grandparent',
};

const parent: NavigationItem = {
  label: 'Parent',
  parent: grandparent,
};

const item: NavigationItem = {
  label: 'Active Item',
  parent: parent,
};

const parentWithPath: NavigationItem = {
  label: 'Parent',
  path: '/example',
};

const exampleItemWithPath: NavigationItem = {
  label: 'Active Item',
  parent: parentWithPath,
};
