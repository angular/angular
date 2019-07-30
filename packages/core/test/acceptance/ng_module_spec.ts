/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, NO_ERRORS_SCHEMA, NgModule} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('NgModule', () => {
  @Component({template: 'hello'})
  class TestCmp {
  }

  @Component({template: 'hello'})
  class TestCmp2 {
  }

  describe('entryComponents', () => {
    it('should throw when specified entry component is not added to a module', () => {
      @NgModule({entryComponents: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).toThrowError(/not part of any NgModule/);
    });

    it('should not throw when specified entry component is added to a module', () => {
      @NgModule({declarations: [TestCmp, TestCmp2], entryComponents: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).not.toThrow();
    });
  });

  describe('bootstrap', () => {
    it('should throw when specified bootstrap component is not added to a module', () => {
      @NgModule({bootstrap: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).toThrowError(/not part of any NgModule/);
    });

    it('should not throw when specified bootstrap component is added to a module', () => {
      @NgModule({declarations: [TestCmp, TestCmp2], bootstrap: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).not.toThrow();
    });
  });

  describe('schemas', () => {
    it('should throw on unknown props if NO_ERRORS_SCHEMA is absent', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <ng-container *ngIf="condition">
            <div [unknown-prop]="true"></div>
          </ng-container>
        `,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        imports: [CommonModule],
        declarations: [MyComp],
      })
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).toThrowError(/Can't bind to 'unknown-prop' since it isn't a known property of 'div'/);
    });

    it('should not throw on unknown props if NO_ERRORS_SCHEMA is present', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <ng-container *ngIf="condition">
            <div [unknown-prop]="true"></div>
          </ng-container>
        `,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        imports: [CommonModule],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [MyComp],
      })
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

});
