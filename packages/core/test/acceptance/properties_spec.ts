/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('elementProperty', () => {
  it('should bind to properties whose names do not correspond to their attribute names', () => {
    @Component({template: '<label [for]="forValue"></label>'})
    class MyComp {
      forValue?: string;
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    const labelNode = fixture.debugElement.query(By.css('label'));

    fixture.componentInstance.forValue = 'some-input';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-input');

    fixture.componentInstance.forValue = 'some-textarea';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-textarea');
  });

  it('should not map properties whose names do not correspond to their attribute names, ' +
         'if they correspond to inputs',
     () => {

       @Component({template: '', selector: 'my-comp'})
       class MyComp {
        @Input() for !:string;
       }

       @Component({template: '<my-comp [for]="forValue"></my-comp>'})
       class App {
         forValue?: string;
       }

       TestBed.configureTestingModule({declarations: [App, MyComp]});
       const fixture = TestBed.createComponent(App);
       const myCompNode = fixture.debugElement.query(By.directive(MyComp));
       fixture.componentInstance.forValue = 'hello';
       fixture.detectChanges();
       expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
       expect(myCompNode.componentInstance.for).toBe('hello');

       fixture.componentInstance.forValue = 'hej';
       fixture.detectChanges();
       expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
       expect(myCompNode.componentInstance.for).toBe('hej');
     });
});
