/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '../public_api';
import {TestBed} from '@angular/core/testing';

describe('status host binding classes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
  });

  it('work in OnPush components', async () => {
    @Component({
      selector: 'test-cmp',
      template: `<input type="text" [formControl]="control">`,
      standalone: true,
      imports: [FormsModule, ReactiveFormsModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class App {
      control = new FormControl('old value', [Validators.required]);
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-valid');
    expect(fixture.nativeElement.innerHTML).toContain('ng-untouched');
    expect(fixture.nativeElement.innerHTML).toContain('ng-pristine');

    fixture.componentInstance.control.setValue(null);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-invalid');

    fixture.debugElement.query((x) => x.name === 'input').triggerEventHandler('blur');
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-touched');

    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-untouched');
  });
});
