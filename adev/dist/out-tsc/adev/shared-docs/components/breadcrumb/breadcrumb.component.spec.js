/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TestBed} from '@angular/core/testing';
import {Breadcrumb} from './breadcrumb.component';
import {NavigationState} from '../../services';
import {By} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideZonelessChangeDetection} from '@angular/core';
describe('Breadcrumb', () => {
  let fixture;
  let navigationStateSpy;
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
const grandparent = {
  label: 'Grandparent',
};
const parent = {
  label: 'Parent',
  parent: grandparent,
};
const item = {
  label: 'Active Item',
  parent: parent,
};
const parentWithPath = {
  label: 'Parent',
  path: '/example',
};
const exampleItemWithPath = {
  label: 'Active Item',
  parent: parentWithPath,
};
//# sourceMappingURL=breadcrumb.component.spec.js.map
