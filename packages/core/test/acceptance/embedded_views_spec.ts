/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('embedded views', () => {
  it('should correctly resolve the implicit receiver in expressions', () => {
    const items: string[] = [];

    @Component({
      selector: 'child-cmp',
      template: 'Child',
    })
    class ChildCmp {
      @Input() addItemFn: Function|undefined;
    }

    @Component({
      template: `<child-cmp *ngIf="true" [addItemFn]="addItem.bind(this)"></child-cmp>`,
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
    @Component({template: `<ng-template let-a [ngIf]="true">{{this.a}}</ng-template>`})
    class TestCmp {
    }

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
        </ng-template>`
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
