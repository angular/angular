/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '../../src/core';
import {TestBed} from '../../testing';

describe('embedded views', () => {
  it('should correctly resolve the implicit receiver in expressions', () => {
    const items: string[] = [];

    @Component({
      selector: 'child-cmp',
      template: 'Child',
      standalone: false,
    })
    class ChildCmp {
      @Input() addItemFn: Function | undefined;
    }

    @Component({
      template: `<child-cmp *ngIf="true" [addItemFn]="addItem.bind(this)"></child-cmp>`,
      standalone: false,
    })
    class TestCmp {
      item: string = 'CmpItem';
      addItem() {
        items.push(this.item);
      }
    }

    TestBed.configureTestingModule({declarations: [ChildCmp, TestCmp]});
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    const childCmp: ChildCmp = fixture.debugElement.children[0].componentInstance;

    childCmp.addItemFn!();
    childCmp.addItemFn!();

    expect(items).toEqual(['CmpItem', 'CmpItem']);
  });

  it('should resolve template input variables through the implicit receiver', () => {
    @Component({
      template: `<ng-template let-a [ngIf]="true">{{a}}</ng-template>`,
      standalone: false,
    })
    class TestCmp {}

    TestBed.configureTestingModule({declarations: [TestCmp]});
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('true');
  });

  it('should component instance variables through the implicit receiver', () => {
    @Component({
      template: `
        <ng-template [ngIf]="true">
          <ng-template [ngIf]="true">{{this.myProp}}{{myProp}}</ng-template>
        </ng-template>`,
      standalone: false,
    })
    class TestCmp {
      myProp = 'Hello';
    }

    TestBed.configureTestingModule({declarations: [TestCmp]});
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('HelloHello');
  });
});
