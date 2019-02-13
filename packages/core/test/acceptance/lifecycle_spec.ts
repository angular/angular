/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('ngOnChanges', () => {
  it('should correctly support updating one Input among many', () => {
    let log: string[] = [];

    @Component({selector: 'child-comp', template: 'child'})
    class ChildComp implements OnChanges {
      @Input() a: number = 0;
      @Input() b: number = 0;
      @Input() c: number = 0;

      ngOnChanges(changes: SimpleChanges) {
        for (let key in changes) {
          const simpleChange = changes[key];
          log.push(key + ': ' + simpleChange.previousValue + ' -> ' + simpleChange.currentValue);
        }
      }
    }

    @Component(
        {selector: 'app-comp', template: '<child-comp [a]="a" [b]="b" [c]="c"></child-comp>'})
    class AppComp {
      a = 0;
      b = 0;
      c = 0;
    }

    TestBed.configureTestingModule({declarations: [AppComp, ChildComp]});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();
    const appComp = fixture.componentInstance;
    expect(log).toEqual(['a: undefined -> 0', 'b: undefined -> 0', 'c: undefined -> 0']);
    log.length = 0;

    appComp.a = 1;
    fixture.detectChanges();
    expect(log).toEqual(['a: 0 -> 1']);
    log.length = 0;

    appComp.b = 2;
    fixture.detectChanges();
    expect(log).toEqual(['b: 0 -> 2']);
    log.length = 0;

    appComp.c = 3;
    fixture.detectChanges();
    expect(log).toEqual(['c: 0 -> 3']);
  });
});