/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, NgLet} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {Observable, of} from 'rxjs';

describe('ngLet directive', () => {
  it('should work in a template with as syntax', waitForAsync(() => {
    @Component({
      template: '<ng-container *ngLet="value as data">{{data}},{{data}}</ng-container>',
      standalone: true,
      imports: [NgLet],
    })
    class TestComponent {
      public value = 'test';
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('test,test');
  }));

  it('should work in a template with implicit syntax', waitForAsync(() => {
    @Component({
      template: '<ng-container *ngLet="value; let data">{{data}},{{data}}</ng-container>',
      standalone: true,
      imports: [NgLet],
    })
    class TestComponent {
      public value = 'test';
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('test,test');
  }));

  it('should work in a template with async pipe', waitForAsync(() => {
    @Component({
      template: '<ng-container *ngLet="value | async; let data">{{data}},{{data}}</ng-container>',
      standalone: true,
      imports: [CommonModule],
    })
    class TestComponent {
      public value: Observable<string> = of('test');
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('test,test');
  }));

  it('should work in a template with nested directive', waitForAsync(() => {
    @Component({
      template: `<ng-container *ngLet="parent; let parentData"
        >{{ parentData }},<ng-container *ngLet="child; let childData">{{
          child
        }}</ng-container></ng-container
      >`,
      standalone: true,
      imports: [NgLet],
    })
    class TestComponent {
      public parent = 'parent';
      public child = 'child';
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('parent,child');
  }));

  it('ngTemplateContextGuard should return true', () => {
    expect(NgLet.ngTemplateContextGuard(null as any, null)).toBeTrue();
  });
});
