/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Input, OnChanges, SimpleChanges} from '@angular/core';
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

it('should call all hooks in correct order when several directives on same node', () => {
  let log: string[] = [];

  class AllHooks {
    id: number = -1;

    /** @internal */
    private _log(hook: string, id: number) { log.push(hook + id); }

    ngOnChanges() { this._log('onChanges', this.id); }
    ngOnInit() { this._log('onInit', this.id); }
    ngDoCheck() { this._log('doCheck', this.id); }
    ngAfterContentInit() { this._log('afterContentInit', this.id); }
    ngAfterContentChecked() { this._log('afterContentChecked', this.id); }
    ngAfterViewInit() { this._log('afterViewInit', this.id); }
    ngAfterViewChecked() { this._log('afterViewChecked', this.id); }
  }

  @Directive({selector: 'div'})
  class DirA extends AllHooks {
    @Input('a') id: number = 0;
  }

  @Directive({selector: 'div'})
  class DirB extends AllHooks {
    @Input('b') id: number = 0;
  }

  @Directive({selector: 'div'})
  class DirC extends AllHooks {
    @Input('c') id: number = 0;
  }

  @Component({selector: 'app-comp', template: '<div [a]="1" [b]="2" [c]="3"></div>'})
  class AppComp {
  }

  TestBed.configureTestingModule({declarations: [AppComp, DirA, DirB, DirC]});
  const fixture = TestBed.createComponent(AppComp);
  fixture.detectChanges();

  expect(log).toEqual([
    'onChanges1',
    'onInit1',
    'doCheck1',
    'onChanges2',
    'onInit2',
    'doCheck2',
    'onChanges3',
    'onInit3',
    'doCheck3',
    'afterContentInit1',
    'afterContentChecked1',
    'afterContentInit2',
    'afterContentChecked2',
    'afterContentInit3',
    'afterContentChecked3',
    'afterViewInit1',
    'afterViewChecked1',
    'afterViewInit2',
    'afterViewChecked2',
    'afterViewInit3',
    'afterViewChecked3'
  ]);
});

it('should call hooks after setting directives inputs', () => {
  let log: string[] = [];

  @Directive({selector: 'div'})
  class DirA {
    @Input() a: number = 0;
    ngOnInit() { log.push('onInitA' + this.a); }
  }

  @Directive({selector: 'div'})
  class DirB {
    @Input() b: number = 0;
    ngOnInit() { log.push('onInitB' + this.b); }
    ngDoCheck() { log.push('doCheckB' + this.b); }
  }

  @Directive({selector: 'div'})
  class DirC {
    @Input() c: number = 0;
    ngOnInit() { log.push('onInitC' + this.c); }
    ngDoCheck() { log.push('doCheckC' + this.c); }
  }

  @Component({
    selector: 'app-comp',
    template: '<div [a]="id" [b]="id" [c]="id"></div><div [a]="id" [b]="id" [c]="id"></div>'
  })
  class AppComp {
    id = 0;
  }

  TestBed.configureTestingModule({declarations: [AppComp, DirA, DirB, DirC]});
  const fixture = TestBed.createComponent(AppComp);
  fixture.detectChanges();

  expect(log).toEqual([
    'onInitA0', 'onInitB0', 'doCheckB0', 'onInitC0', 'doCheckC0', 'onInitA0', 'onInitB0',
    'doCheckB0', 'onInitC0', 'doCheckC0'
  ]);

  log = [];
  fixture.componentInstance.id = 1;
  fixture.detectChanges();
  expect(log).toEqual(['doCheckB1', 'doCheckC1', 'doCheckB1', 'doCheckC1']);
});
