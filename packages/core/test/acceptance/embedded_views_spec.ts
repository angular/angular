/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgIf} from '@angular/common';
import {Component, Input} from '../../src/core';
import {TestBed} from '../../testing';

describe('embedded views', () => {
  it('should correctly resolve the implicit receiver in expressions', () => {
    const items: string[] = [];

    @Component({
      selector: 'child-cmp',
      template: 'Child',
    })
    class ChildCmp {
      @Input() addItemFn: Function | undefined;
    }

    @Component({
      imports: [NgIf, ChildCmp],
      template: `<child-cmp *ngIf="true" [addItemFn]="addItem.bind(this)"></child-cmp>`,
    })
    class TestCmp {
      item: string = 'CmpItem';
      addItem() {
        items.push(this.item);
      }
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    const childCmp: ChildCmp = fixture.debugElement.children[0].componentInstance;

    childCmp.addItemFn!();
    childCmp.addItemFn!();

    expect(items).toEqual(['CmpItem', 'CmpItem']);
  });

  it('should resolve template input variables through the implicit receiver', () => {
    @Component({
      imports: [NgIf],
      template: `<ng-template let-a [ngIf]="true">{{ a }}</ng-template>`,
    })
    class TestCmp {}

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('true');
  });

  it('should component instance variables through the implicit receiver', () => {
    @Component({
      imports: [NgIf],
      template: ` <ng-template [ngIf]="true">
        <ng-template [ngIf]="true">{{ this.myProp }}{{ myProp }}</ng-template>
      </ng-template>`,
    })
    class TestCmp {
      myProp = 'Hello';
    }
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('HelloHello');
  });
});
