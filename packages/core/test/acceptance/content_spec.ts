/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('projection', () => {
  it('should handle projected containers inside other containers', () => {
    @Component({
      selector: 'child-comp',  //
      template: '<ng-content></ng-content>'
    })
    class ChildComp {
    }

    @Component({
      selector: 'root-comp',  //
      template: '<ng-content></ng-content>'
    })
    class RootComp {
    }

    @Component({
      selector: 'my-app',
      template: `
        <root-comp>
          <ng-container *ngFor="let item of items; last as last">
            <child-comp *ngIf="!last">{{ item }}|</child-comp>
          </ng-container>
        </root-comp>
      `
    })
    class MyApp {
      items: number[] = [1, 2, 3];
    }

    TestBed.configureTestingModule({declarations: [ChildComp, RootComp, MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();

    // expecting # of elements to be (items.length - 1), since last element is filtered out by
    // *ngIf, this applies to all other assertions below
    expect(fixture.nativeElement).toHaveText('1|2|');

    fixture.componentInstance.items = [4, 5];
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('4|');

    fixture.componentInstance.items = [6, 7, 8, 9];
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('6|7|8|');
  });
});