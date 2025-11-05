/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, provideVersionEmission} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('Version Emission', () => {
  it('should add ng-version attribute by default', () => {
    @Component({
      selector: 'test-cmp',
      template: '<div>Test</div>',
    })
    class TestCmp {}

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    const hostElement = fixture.nativeElement;
    expect(hostElement.hasAttribute('ng-version')).toBe(true);
    expect(hostElement.getAttribute('ng-version')).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should not add ng-version attribute when disabled', () => {
    @Component({
      selector: 'test-cmp',
      template: '<div>Test</div>',
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      providers: [provideVersionEmission(false)],
    });

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    const hostElement = fixture.nativeElement;
    expect(hostElement.hasAttribute('ng-version')).toBe(false);
  });

  it('should respect version emission flag in standalone components', () => {
    @Component({
      selector: 'test-cmp',
      template: '<div>Test</div>',
      standalone: true,
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      imports: [TestCmp],
      providers: [provideVersionEmission(false)],
    });

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.hasAttribute('ng-version')).toBe(false);
  });

  it('should allow re-enabling version emission', () => {
    @Component({
      selector: 'test-cmp',
      template: '<div>Test</div>',
    })
    class TestCmp {}

    TestBed.configureTestingModule({
      providers: [provideVersionEmission(true)],
    });

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.hasAttribute('ng-version')).toBe(true);
  });
});
