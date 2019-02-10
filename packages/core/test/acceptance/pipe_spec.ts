/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Pipe, PipeTransform} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('pipe', () => {
  it('should support pipe in context of ternary operator', () => {
    @Pipe({name: 'pipe'})
    class MyPipe implements PipeTransform {
      transform(value: any): any { return value; }
    }

    @Component({
      selector: 'my-app',
      template: `{{ condition ? 'a' : 'b' | pipe }}`,
    })
    class MyApp {
      condition = false;
    }

    TestBed.configureTestingModule({declarations: [MyApp, MyPipe]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('b');

    fixture.componentInstance.condition = true;
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('a');
  });
});
