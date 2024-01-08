/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ɵinput as input} from '@angular/core';
import {TestBed} from '@angular/core/testing';

fdescribe('signal inputs', () => {
  beforeEach(() => TestBed.configureTestingModule({
    errorOnUnknownProperties: true,
  }));

  it('should be possible to bind to input', () => {
    @Component({
      standalone: true,
      template: `<input-comp [input]="value" />`,
      imports: [
        InputCompNonRequired,
      ],
    })
    class TestCmp {
      value = 1;
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('input:1');
  });
});

@Component({
  selector: 'input-comp',
  standalone: true,
  template: 'input:{{input()}}',
})
class InputCompNonRequired<T> {
  input = input<T>();
}

@Component({
  selector: 'input-comp',
  standalone: true,
  template: 'input:{{input()}}',
})
class InputCompRequired<T> {
  input = input.required<T>();
}
