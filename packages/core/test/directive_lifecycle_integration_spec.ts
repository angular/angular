/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  Directive,
  DoCheck,
  OnChanges,
  OnInit,
  provideZoneChangeDetection,
} from '../src/core';
import {inject, TestBed} from '../testing';
import {Log} from '../testing/src/testing_internal';

describe('directive lifecycle integration spec', () => {
  let log: Log;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LifecycleCmp, LifecycleDir, MyComp5],
      providers: [provideZoneChangeDetection(), Log],
    }).overrideComponent(MyComp5, {set: {template: '<div [field]="123" lifecycle></div>'}});
  });

  beforeEach(inject([Log], (_log: any) => {
    log = _log;
  }));

  it('should invoke lifecycle methods ngOnChanges > ngOnInit > ngDoCheck > ngAfterContentChecked', () => {
    const fixture = TestBed.createComponent(MyComp5);
    fixture.detectChanges();

    expect(log.result()).toEqual(
      'ngOnChanges; ngOnInit; ngDoCheck; ngAfterContentInit; ngAfterContentChecked; child_ngDoCheck; ' +
        'ngAfterViewInit; ngAfterViewChecked',
    );

    log.clear();
    fixture.detectChanges();

    expect(log.result()).toEqual(
      'ngDoCheck; ngAfterContentChecked; child_ngDoCheck; ngAfterViewChecked',
    );
  });
});

@Directive({
  selector: '[lifecycle-dir]',
  standalone: false,
})
class LifecycleDir implements DoCheck {
  constructor(private _log: Log) {}
  ngDoCheck() {
    this._log.add('child_ngDoCheck');
  }
}

@Component({
  selector: '[lifecycle]',
  inputs: ['field'],
  template: `<div lifecycle-dir></div>`,
  standalone: false,
})
class LifecycleCmp
  implements
    OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked
{
  field: number = 0;
  constructor(private _log: Log) {}

  ngOnChanges() {
    this._log.add('ngOnChanges');
  }

  ngOnInit() {
    this._log.add('ngOnInit');
  }

  ngDoCheck() {
    this._log.add('ngDoCheck');
  }

  ngAfterContentInit() {
    this._log.add('ngAfterContentInit');
  }

  ngAfterContentChecked() {
    this._log.add('ngAfterContentChecked');
  }

  ngAfterViewInit() {
    this._log.add('ngAfterViewInit');
  }

  ngAfterViewChecked() {
    this._log.add('ngAfterViewChecked');
  }
}

@Component({
  selector: 'my-comp',
  standalone: false,
})
class MyComp5 {}
