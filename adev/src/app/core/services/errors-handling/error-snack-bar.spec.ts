/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';

import {ErrorSnackBar, ErrorSnackBarData} from './error-snack-bar';

describe('ErrorSnackBar', () => {
  let fixture: ComponentFixture<ErrorSnackBar>;
  let data: ErrorSnackBarData;
  const snackBarRef = jasmine.createSpyObj<MatSnackBarRef<ErrorSnackBar>>('MatSnackBarRef', [
    'dismissWithAction',
  ]);

  beforeEach(() => {
    data = {message: 'Something went wrong', pose: 'error'};
    snackBarRef.dismissWithAction.calls.reset();

    TestBed.configureTestingModule({
      imports: [ErrorSnackBar],
      providers: [
        {provide: MAT_SNACK_BAR_DATA, useValue: data},
        {provide: MatSnackBarRef, useValue: snackBarRef},
      ],
    });
  });

  it('should render the message and the action button', async () => {
    data.message = 'Our docs have been updated, reload the page to see the latest.';
    data.actionText = 'Reload';
    await initComponent();

    expect(getMessage()).toContain('Our docs have been updated');
    expect(getActionButton().textContent).toContain('Reload');
  });

  it('should build the mascot image source from the pose', async () => {
    data.pose = 'error';
    await initComponent();

    expect(getAngie().getAttribute('src')).toBe('assets/images/angie/error.svg');
  });

  it('should follow the pose passed in the data', async () => {
    data.pose = 'greeting';
    await initComponent();

    expect(getAngie().getAttribute('src')).toBe('assets/images/angie/greeting.svg');
  });

  it('should dismiss with action when the button is clicked', async () => {
    data.actionText = 'Reload';
    await initComponent();

    getActionButton().click();
    await fixture.whenStable();

    expect(snackBarRef.dismissWithAction).toHaveBeenCalled();
  });

  // Helpers
  function getMessage() {
    return (fixture.nativeElement as HTMLElement).querySelector('p')?.textContent ?? '';
  }

  function getAngie() {
    return (fixture.nativeElement as HTMLElement).querySelector('img.error-snack-bar-angie')!;
  }

  function getActionButton() {
    return (fixture.nativeElement as HTMLElement).querySelector('button')!;
  }

  async function initComponent() {
    fixture = TestBed.createComponent(ErrorSnackBar);
    await fixture.whenStable();
  }
});
